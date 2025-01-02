from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from app.services.embedding import get_embedding
from app.core.config import settings
from bs4 import BeautifulSoup
import re
import logging
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

class QdrantDocument(BaseModel):
    id: str
    payload: Dict[str, Any]
    vector: List[float]

class QdrantService:
    instance = None
    def initialization(self):
        self.client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT
        )
        self.COLLECTION_NAME = "blog_contents"
        
    def __new__(cls):
        if not cls.instance:
            cls.instance = super(QdrantService, cls).__new__(cls)
            cls.instance.initialization()
        return cls.instance

    async def initialize(self):
        """Initialize service and create collections if they don't exist"""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            exists = any(col.name == "blog_contents" for col in collections.collections)
            
            if not exists:
                self.client.create_collection(
                    collection_name="blog_contents",
                    vectors_config=VectorParams(
                        size=384,  # for all-MiniLM-L6-v2
                        distance=Distance.COSINE
                    )
                )
                
                # Create payload indexes for faster filtering
                self.client.create_payload_index(
                    collection_name="blog_contents",
                    field_name="content_id",
                    field_schema="keyword"
                )
                self.client.create_payload_index(
                    collection_name="blog_contents",
                    field_name="menu_id",
                    field_schema="keyword"
                )
                self.client.create_payload_index(
                    collection_name="blog_contents",
                    field_name="title",
                    field_schema="text"
                )
                
                print("Created new Qdrant collection and indexes: blog_contents")
            else:
                print("Qdrant collection 'blog_contents' already exists")
                
        except Exception as e:
            print(f"Error initializing Qdrant collection: {str(e)}")

    async def process_html_contents(
        self,
        blog_contents: List[Any],
    ) -> Dict[str, Any]:
        """Process blog contents, chunk them, and upsert to Qdrant"""
        try:
            documents = []
            batch_size = 100
            current_batch = []
            point_id_counter = 0

            for content in blog_contents:
                clean_text = self._clean_html_content(content.content)
                chunks = self._chunk_text(clean_text)
                
                for i, chunk in enumerate(chunks):
                    if len(chunk.split()) < 3:
                        continue
                        
                    vector = await get_embedding(chunk)
                    doc = QdrantDocument(
                        id=str(point_id_counter),
                        payload={
                            "content_id": content.id,
                            "menu_id": content.blog_menu_id,
                            "chunk_text": chunk,
                            "title": content.title,
                            "author": content.author,
                            "original_chunk_id": f"{content.id}_{i}"
                        },
                        vector=vector
                    )
                    current_batch.append(doc)
                    point_id_counter += 1
                    
                    if len(current_batch) >= batch_size:
                        points = [
                            {
                                "id": int(doc.id),
                                "payload": doc.payload,
                                "vector": doc.vector
                            }
                            for doc in current_batch
                        ]
                        
                        self.client.upsert(
                            collection_name="blog_contents",
                            points=points
                        )
                        documents.extend(current_batch)
                        current_batch = []

            # Upload any remaining documents
            if current_batch:
                points = [
                    {
                        "id": int(doc.id),
                        "payload": doc.payload,
                        "vector": doc.vector
                    }
                    for doc in current_batch
                ]
                
                self.client.upsert(
                    collection_name="blog_contents",
                    points=points
                )
                documents.extend(current_batch)

            return {
                "status": "success",
                "processed_documents": len(blog_contents),
                "total_chunks": len(documents)
            }

        except Exception as e:
            raise ValueError(f"Error processing HTML documents: {str(e)}")

    def _clean_html_content(self, html_content: str) -> str:
        """Remove HTML tags and clean the content"""
        try:
            # Parse HTML using BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text content
            text = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text
        except Exception as e:
            print(f"Error cleaning HTML content: {str(e)}")
            return html_content

    def _chunk_text(self, text: str) -> List[str]:
        """Split text into chunks using multiple delimiters"""
        # Define delimiters for splitting
        delimiters = [
            r'(?<=[.!?])\s+',  # End of sentences
            r'(?<=;)\s*',      # Semicolons
            r'(?<=:)\s*',      # Colons
            r'(?<=\n)\s*',     # New lines
            r'(?<=\t)\s*',     # Tabs
            r'(?<=,)\s*'       # Commas (last priority)
        ]
        
        # Combine all delimiters into one regex pattern
        pattern = '|'.join(delimiters)
        
        # Split the text
        chunks = re.split(pattern, text)
        
        # Clean and filter chunks
        cleaned_chunks = []
        for chunk in chunks:
            chunk = chunk.strip()
            # Only keep chunks that are meaningful (not too short)
            if chunk and len(chunk) > 10:  # Minimum 10 characters
                cleaned_chunks.append(chunk)
        
        return cleaned_chunks

    async def process_and_upsert_blog_contents(
        self,
        blog_contents: List[Any]
    ) -> Dict[str, Any]:
        """Process blog contents, chunk them, and upsert to Qdrant"""
        try:
            documents = []
            for content in blog_contents:
                # Split content into chunks
                chunks = content.content.split('.')
                chunks = [chunk.strip() for chunk in chunks if chunk.strip()]
                
                # Create QdrantDocument for each chunk
                for i, chunk in enumerate(chunks):
                    vector = await get_embedding(chunk)
                    doc = QdrantDocument(
                        id=f"{content.id}_{i}",
                        payload={
                            "content_id": content.id,
                            "menu_id": content.blog_menu_id,
                            "chunk_text": chunk,
                            "title": content.title,
                            "author": content.author
                        },
                        vector=vector
                    )
                    documents.append(doc)

            # Upload to Qdrant
            if documents:
                points = [
                    {
                        "id": doc.id,
                        "payload": doc.payload,
                        "vector": doc.vector
                    }
                    for doc in documents
                ]
                
                operation_info = self.client.upsert(
                    collection_name="blog_contents",
                    points=points
                )
                
                return {
                    "status": "success",
                    "processed_documents": len(blog_contents),
                    "total_chunks": len(documents),
                    "operation_info": operation_info
                }
            
            return {
                "status": "success",
                "processed_documents": 0,
                "total_chunks": 0
            }

        except Exception as e:
            raise ValueError(f"Error processing and upserting documents: {str(e)}")

    async def search_similar(
        self,
        query: str,
        collection_name: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search for similar documents and merge by content_id"""
        try:
            # Split query into chunks
            query_chunks = self._chunk_text(query)
            
            # Get embeddings for all chunks
            query_vectors = [await get_embedding(chunk) for chunk in query_chunks]
            
            # Create batch search requests
            search_requests = [
                {
                    "vector": vector,
                    "limit": limit * 2,
                    "score_threshold": settings.VECTOR_MIN_MATCH_THRESHOLD,
                    "with_payload": True
                } for vector in query_vectors
            ]
            
            # Execute batch search in one API call
            batch_results = self.client.search_batch(
                collection_name=collection_name,
                requests=search_requests
            )
            
            # Flatten batch results
            all_raw_results = []
            for chunk_results in batch_results:
                all_raw_results.extend(chunk_results)

            # Group results by content_id, keeping highest score
            content_groups = {}
            for result in all_raw_results:
                content_id = result.payload.get('content_id')
                if content_id not in content_groups or result.score > content_groups[content_id]['score']:
                    content_groups[content_id] = {
                        'content_id': content_id,
                        'title': result.payload.get('title'),
                        'author': result.payload.get('author'),
                        'score': result.score,
                        'chunks': [result.payload.get('chunk_text')],
                        'menu_id': result.payload.get('menu_id')
                    }
                else:
                    content_groups[content_id]['chunks'].append(result.payload.get('chunk_text'))

            # Sort by score and take top k results
            merged_results = sorted(
                content_groups.values(),
                key=lambda x: x['score'],
                reverse=True
            )[:limit]

            return merged_results

        except Exception as e:
            raise ValueError(f"Error searching documents: {str(e)}")

    async def delete_collection(self, collection_name: str) -> Dict[str, Any]:
        """Delete a collection"""
        try:
            self.client.delete_collection(collection_name=collection_name)
            return {"status": "success", "message": f"Collection {collection_name} deleted"}
        except Exception as e:
            raise ValueError(f"Error deleting collection: {str(e)}")

    async def publish_content(self, content: Any) -> Dict[str, Any]:
        try:
            # Delete existing point by ID
            self.client.delete(
                collection_name=self.COLLECTION_NAME,
                points_selector=[int(content.id)]  # Simply pass the ID as a list
            )

            # Get embedding for the content
            embedding = await get_embedding(content.content)
            
            # Create point for Qdrant with integer ID
            point = {
                'id': int(content.id),  # Changed to integer
                'vector': embedding,
                'payload': {
                    'content_id': content.id,
                    'menu_id': content.blog_menu_id,
                    'title': content.title,
                    'content': content.content,
                    'author': content.author,
                    'chunk_text': content.content
                }
            }
            
            # Upsert the new point
            operation_result = self.client.upsert(
                collection_name=self.COLLECTION_NAME,
                points=[point]
            )
            
            return operation_result

        except Exception as e:
            logging.error(f"Error publishing content to Qdrant: {str(e)}")
            raise Exception(f"Error publishing content to Qdrant: {str(e)}")

    async def clear_collection(self) -> Dict[str, Any]:
        """
        Clear all points from the collection
        """
        try:
            # Delete all points from the collection using an empty filter
            operation_result = self.client.delete(
                collection_name="blog_contents",
                points_selector=Filter()  # Empty filter matches all points
            )
            
            return operation_result

        except Exception as e:
            logging.error(f"Error clearing Qdrant collection: {str(e)}")
            raise Exception(f"Error clearing Qdrant collection: {str(e)}")

    async def update_content(self, content: Any) -> Dict[str, Any]:
        """
        Update content in Qdrant by first deleting existing content with matching content_id
        and then inserting the new vector
        """
        try:
            # Delete existing content with matching content_id
            self.client.delete(
                collection_name=self.COLLECTION_NAME,
                points_selector=[int(content.id)]  # Simply pass the ID as a list
            )

            # Generate new embedding for the updated content
            vector = await get_embedding(content.content)
            
            # Create new point with updated content
            point = {
                "id": int(content.id),
                "vector": vector,
                "payload": {
                    "content_id": content.id,
                    "menu_id": content.blog_menu_id,
                    "title": content.title,
                }
            }
            
            # Upsert the new point
            result = self.client.upsert(
                collection_name=self.COLLECTION_NAME,
                points=[point]
            )
            
            return {
                "status": "success",
                "message": "Content updated successfully",
                "operation_result": result
            }

        except Exception as e:
            logging.error(f"Error updating content in Qdrant: {str(e)}")
            raise Exception(f"Error updating content in Qdrant: {str(e)}") 