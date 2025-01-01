from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from elasticsearch import AsyncElasticsearch
from elasticsearch.exceptions import NotFoundError
from typing import Dict, Any, List, Optional
from app.core.config import settings

class IndexSettings(BaseModel):
    name: str
    mappings: Dict[str, Any]
    settings: Optional[Dict[str, Any]] = None

class Document(BaseModel):
    id: Optional[str] = None
    content: Dict[str, Any]
    
class SearchQuery(BaseModel):
    query: Dict[str, Any]
    from_: Optional[int] = 0
    size: Optional[int] = 10

async def init_indices(client: AsyncElasticsearch) -> None:
    """Initialize Elasticsearch indices when system starts"""
    
    # Define your indices here
    indices = {
        "blog_posts": {
            "mappings": {
                "properties": {
                    "title": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword"
                            }
                        }
                    },
                    "content": {
                        "type": "text"
                    },
                    "tags": {
                        "type": "keyword"
                    },
                    "author": {
                        "properties": {
                            "name": {"type": "text"},
                            "email": {"type": "keyword"}
                        }
                    },
                    "created_at": {
                        "type": "date"
                    },
                    "updated_at": {
                        "type": "date"
                    }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            }
        },
    }
    
    for index_name, index_config in indices.items():
        try:
            # Check if index exists
            if not await client.indices.exists(index=index_name):
                # Create index if it doesn't exist
                await client.indices.create(
                    index=index_name,
                    mappings=index_config["mappings"],
                    settings=index_config.get("settings", {})
                )
                print(f"Created index: {index_name}")
            else:
                print(f"Index already exists: {index_name}")
                
        except Exception as e:
            print(f"Error creating index {index_name}: {str(e)}")

class ElasticsearchService:
    instance = None
    
    def __new__(cls):
        if not cls.instance:
            cls.instance = super(ElasticsearchService, cls).__new__(cls)
            # Move initialization here
            cls.instance.client = AsyncElasticsearch(settings.ELASTICSEARCH_HOST)
        return cls.instance

    def __init__(self):
        # Remove initialization from here
        pass
        
    async def initialize(self):
        """Initialize service and create indices"""
        await init_indices(self.client)
    
    async def create_index(self, index_settings: IndexSettings) -> Dict[str, Any]:
        try:
            exists = await self.client.indices.exists(index=index_settings.name)
            if exists:
                return {"acknowledged": True, "message": "Index already exists"}
            
            # Create the body dictionary with mappings and settings
            body = {
                "mappings": index_settings.mappings
            }
            if index_settings.settings:
                body["settings"] = index_settings.settings
                
            response = await self.client.indices.create(
                index=index_settings.name,
                body=body,
                ignore=[400, 404]
            )
            return dict(response)
        except Exception as e:
            raise ValueError(f"Error creating index: {str(e)}")
    
    async def delete_index(self, index_name: str) -> Dict[str, Any]:
        try:
            exists = await self.client.indices.exists(index=index_name)
            if not exists:
                return {"acknowledged": True, "message": "Index does not exist"}
                
            response = await self.client.indices.delete(
                index=index_name,
                ignore=[400, 404]
            )
            return dict(response)
        except NotFoundError:
            raise ValueError(f"Index {index_name} not found")
    
    async def index_document(self, id: Optional[str], document: Document, index_name: str) -> Dict[str, Any]:
        response = await self.client.index(
            index=index_name,
            id=id or document.id,
            document=document.content,
            refresh=True
        )
        return dict(response)
    
    async def bulk_index_documents(
        self, 
        documents: List[Document], 
        index_name: str
    ) -> Dict[str, Any]:
        actions = []
        for doc in documents:
            action = {
                "_index": index_name,
                "_source": doc.content
            }
            if doc.id:
                action["_id"] = doc.id
            actions.append(action)
            
        response = await self.client.bulk(operations=actions)
        return response
    
    async def search(
        self, 
        query: SearchQuery, 
        index_name: str
    ) -> Dict[str, Any]:
        """Execute search query"""
        try:
            response = await self.client.search(
                index=index_name,
                body=query.query,
                from_=query.from_,
                size=query.size
            )
            return dict(response)
        except Exception as e:
            print(f"Search error: {str(e)}")
            raise
    
    async def get_document(
        self, 
        doc_id: str, 
        index_name: str
    ) -> Optional[Dict[str, Any]]:
        try:
            response = await self.client.get(
                index=index_name,
                id=doc_id
            )
            return dict(response)
        except NotFoundError:
            return None
    
    async def delete_document(
        self, 
        doc_id: str, 
        index_name: str
    ) -> Dict[str, Any]:
        try:
            response = await self.client.delete(
                index=index_name,
                id=doc_id,
                refresh=True
            )
            return dict(response)
        except NotFoundError:
            raise ValueError(f"Document {doc_id} not found")
    
    async def update_document(
        self, 
        doc_id: str, 
        document: Document, 
        index_name: str
    ) -> Dict[str, Any]:
        try:
            response = await self.client.update(
                index=index_name,
                id=doc_id,
                doc=document.content,
                refresh=True
            )
            return dict(response)
        except NotFoundError:
            raise ValueError(f"Document {doc_id} not found")
            
    async def close(self):
        await self.client.close()