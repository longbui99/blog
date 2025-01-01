from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from app.models.blog_content import BlogContent
from app.models.blog_menu import BlogMenu
from app.services.qdrant import QdrantService
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.services.gemini import GeminiService
from app.crud.blog_content import get_blog_contents_by_ids
from pydantic import BaseModel
import logging

router = APIRouter()
qdrant_service = QdrantService()
gemini_service = GeminiService()

class InquiryRequest(BaseModel):
    query: str
    top_k: Optional[int]

@router.post("/load-data-to-qdrant")
async def load_data_to_qdrant(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Load all published blog contents from database to Qdrant
    """
    try:
        await qdrant_service.clear_collection()
        logging.info("Cleared Qdrant collection")
        published_menus = await BlogMenu.filter(is_published=True).values_list('id', flat=True)
        logging.info(f"Found {len(published_menus)} published menus")
        blog_contents = await BlogContent.filter(blog_menu_id__in=published_menus).all()
        logging.info(f"Found {len(blog_contents)} blog contents")
        
        result = await qdrant_service.process_html_contents(
            blog_contents=blog_contents
        )
        
        return {
            "message": "Data successfully loaded to Qdrant",
            **result
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load data to Qdrant: {str(e)}"
        )

@router.get("/search-similar", response_model=List[Dict[str, Any]])
async def search_similar(
    query: str,
    top_k: Optional[int] = Query(default=5, gt=0, le=100)
):
    """
    Search for similar blog contents and return merged results by content_id
    """
    try:
        results = await qdrant_service.search_similar(
            query=query,
            collection_name="blog_contents",
            limit=top_k
        )
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search similar contents: {str(e)}"
        )

@router.post("/inquiry")
async def inquiry(    
    request: InquiryRequest
):
    """
    Search for similar blog contents and return merged results by content_id
    """
    try:
        query, top_k = request.query, request.top_k
        results = await qdrant_service.search_similar(
            query=query,
            collection_name="blog_contents",
            limit=top_k
        )
        try:
        # Get all contents and process with Gemini
            content_ids = [result['content_id'] for result in results]

            contents = await get_blog_contents_by_ids(content_ids)
            
            if None in contents:
                raise HTTPException(
                    status_code=404,
                    detail="One or more contents not found"
                )
                
            response_text = await gemini_service.process_contents(
                contents=contents,
                command=query,
                temperature=0.7
            )

            result = {
                "status": "success",
                "answer": response_text,
                "reference_contents": [
                    {
                        "title": content.title,
                        "path": content.blog_menu.path if hasattr(content, 'blog_menu') and content.blog_menu else None
                    }
                    for content in contents
                ]
            }

            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process contents with Gemini: {str(e)}"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search similar contents: {str(e)}"
        )
    