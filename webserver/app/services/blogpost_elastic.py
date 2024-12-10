from typing import Union, Dict, Any
from datetime import datetime
from app.models.blog_menu import BlogMenu
from app.models.blog_content import BlogContent
from app.services.elasticsearch import ElasticsearchService, Document, IndexSettings
from app.schemas.search import SearchQuery
from app.core.config import settings
from tortoise.expressions import Q  # Import Q for query expressions
import logging

logger = logging.getLogger(__name__)

class BlogpostElasticService:
    def __init__(self):
        self.es_service = ElasticsearchService()
        self.blog_index = "blog_posts"
        logger.info("BlogpostElasticService initialized")

    async def _convert_menu_to_doc(self, menu: BlogMenu) -> Dict[str, Any]:
        """Convert BlogMenu to Elasticsearch document"""
        return {
            "id": str(menu.id),
            "type": "menu",
            "title": menu.title,
            "path": menu.path,
            "parent": menu.parent,
            "sequence": menu.sequence,
            "component": menu.component,
            "short_name": menu.short_name,
            "is_published": menu.is_published,
            "created_at": menu.created_at.isoformat() if menu.created_at else None,
            "updated_at": menu.updated_at.isoformat() if menu.updated_at else None
        }

    async def _convert_content_to_doc(self, content: BlogContent, menu: BlogMenu = None) -> Dict[str, Any]:
        """Convert BlogContent to Elasticsearch document"""
        return {
            "id": str(content.id),
            "type": "content",
            "menu_id": str(content.blog_menu_id),
            "title": menu.title if menu else content.title,
            "path": menu.path if menu else "",
            "content": content.content,
            "author": content.author,
            "created_at": content.created_at.isoformat() if content.created_at else None,
            "updated_at": content.updated_at.isoformat() if content.updated_at else None
        }

    async def publish_menu(self, menu: BlogMenu) -> Dict[str, Any]:
        """Publish or update menu in Elasticsearch"""
        try:
            # Check if menu already exists
            existing_doc = await self.es_service.get_document(
                doc_id=str(menu.id),
                index_name=self.blog_index
            )

            doc_content = await self._convert_menu_to_doc(menu)
            doc = Document(
                id=str(menu.id),
                content=doc_content
            )

            if existing_doc:
                # Update existing document
                response = await self.es_service.update_document(
                    doc_id=str(menu.id),
                    document=doc,
                    index_name=self.blog_index
                )
            else:
                # Index new document
                response = await self.es_service.index_document(
                    id=str(menu.id),
                    document=doc,
                    index_name=self.blog_index
                )

            logger.info(f"Successfully published menu {menu.id} to Elasticsearch")
            return response
        except Exception as e:
            logger.error(f"Error publishing menu {menu.id} to Elasticsearch: {str(e)}", exc_info=True)
            raise

    async def publish_content(self, content: BlogContent) -> Dict[str, Any]:
        """Publish or update content in Elasticsearch"""
        try:
            # Get associated menu using Q object for query
            menu = await BlogMenu.get(Q(id=content.blog_menu_id))
            if not menu:
                logger.warning(f"Menu not found for content {content.id}")
                return {"status": "error", "message": "Menu not found"}

            doc_content = await self._convert_content_to_doc(content, menu)
            doc = Document(
                id=str(menu.id),
                content=doc_content
            )

            # Check if content already exists
            existing_doc = await self.es_service.get_document(
                doc_id=str(menu.id),
                index_name=self.blog_index
            )
            if existing_doc:
                # Update existing document
                response = await self.es_service.update_document(
                    doc_id=str(menu.id),
                    document=doc,
                    index_name=self.blog_index
                )
            else:
                # Index new document
                response = await self.es_service.index_document(
                    id=str(menu.id),
                    document=doc,
                    index_name=self.blog_index
                )

            logger.info(f"Successfully published content {content.id} to Elasticsearch")
            return response
        except Exception as e:
            logger.error(f"Error publishing content to Elasticsearch: {str(e)}", exc_info=True)
            raise

    async def delete_menu(self, menu_id: int) -> Dict[str, Any]:
        """Delete menu from Elasticsearch"""
        try:
            doc_id = f"{menu_id}"
            response = await self.es_service.delete_document(
                doc_id=doc_id,
                index_name=self.blog_index
            )
            return response
        except Exception as e:
            print(f"Error deleting menu from Elasticsearch: {str(e)}")
            raise

    async def delete_content(self, content: BlogContent) -> Dict[str, Any]:
        """Delete content from Elasticsearch"""
        try:
            menu = await BlogMenu.get(Q(id=content.blog_menu_id))
            if not menu:
                logger.warning(f"Menu not found for content {content.id}")
                return {"status": "error", "message": "Menu not found"}
            doc_id = str(menu.id)
            response = await self.es_service.delete_document(
                doc_id=doc_id,
                index_name=self.blog_index
            )
            return response
        except Exception as e:
            print(f"Error deleting content from Elasticsearch: {str(e)}")
            raise

    async def search_blog(self, search_query: SearchQuery) -> Dict[str, Any]:
        """Search blog posts"""
        try:
            # Create the search body directly without nesting SearchQuery
            search_body = SearchQuery(
                query=search_query.query,
                from_=search_query.from_,
                size=search_query.size
            )

            response = await self.es_service.search(
                query=search_body,
                index_name=self.blog_index
            )
            return response
        except Exception as e:
            logger.error(f"Error searching blog posts: {str(e)}")
            raise

    async def reindex_all(self):
        """Reindex all blog menus and contents"""
        try:
            logger.info("Starting full reindex of blog posts")
            # Delete and recreate index
            try:
                await self.es_service.delete_index(self.blog_index)
            except:
                pass

            # Create index with mapping using IndexSettings model
            index_settings = IndexSettings(
                name=self.blog_index,
                mappings={
                    "properties": {
                        "id": {"type": "keyword"},
                        "type": {"type": "keyword"},
                        "title": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "content": {"type": "text"},
                        "path": {"type": "keyword"},
                        "updated_at": {"type": "date"}
                    }
                },
                settings={
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                }
            )

            await self.es_service.create_index(index_settings)

            # Reindex all menus
            # menus = await BlogMenu.all()
            # for menu in menus:
            #     await self.publish_menu(menu)

            # Reindex all contents
            contents = await BlogContent.all()
            for content in contents:
                await self.publish_content(content)

            logger.info("Successfully completed full reindex")
            return {"status": "success", "message": "Reindexing completed"}
        except Exception as e:
            logger.error(f"Error during full reindex: {str(e)}", exc_info=True)
            raise
