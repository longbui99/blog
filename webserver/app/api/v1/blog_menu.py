from fastapi import APIRouter, HTTPException, Depends, status, Body, Query
from typing import List, Dict
from app.schemas.blog_menu import BlogMenuCreate, BlogMenu, BlogMenuUpdate, BlogMenuItem, PublishMenuRequest
from app.schemas.blog_content import BlogContent as BlogContentSchema
from app.models.blog_content import BlogContent as BlogContentModel
from app.models.blog_menu import BlogMenu as BlogMenuModel
from app.models.search import SearchResult
from app.crud.blog_menu import create_blog_menu, get_blog_menu, get_blog_menus, update_blog_menu, delete_blog_menu
from app.crud.blog_content import get_blog_content_by_menu_id
from app.api.v1.auth import get_current_user, check_authorized_user
from app.services.blogpost_elastic import BlogpostElasticService
from app.schemas.search import SearchQuery
import re

PREVIEW_LENGTH = 300

router = APIRouter()
blog_elastic = BlogpostElasticService()

@router.post("/", response_model=BlogMenu, status_code=status.HTTP_201_CREATED)
async def create_menu_item(menu: BlogMenuCreate, current_user: dict = Depends(get_current_user)):
    created_menu = await create_blog_menu(menu)
    # Sync to Elasticsearch
    await blog_elastic.publish_menu(created_menu)
    return created_menu

@router.get("/", response_model=List[BlogMenuItem])
async def read_menu_items(skip: int = 0, limit: int = 100, current_user: dict = Depends(check_authorized_user)):
    menus = await get_blog_menus()
    if current_user:
        return menus
    return [menu for menu in menus if menu['is_published']]

def clean_html_tags(text: str) -> str:
    """Remove HTML tags from text"""
    if not text:
        return ""
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', '', text)
    # Remove extra whitespace
    clean_text = ' '.join(clean_text.split())
    return clean_text

@router.get("/search", response_model=List[SearchResult])
async def search_content(
    q: str = Query(..., description="Search query string"),
    from_: int = Query(0, alias="from", description="Starting point for search results"),
    size: int = Query(10, description="Number of search results to return")
):
    """
    Search across blog menus and content using Elasticsearch with fuzzy matching.
    """
    try:
        query = SearchQuery(
            query={
                "query": {
                    "bool": {
                        "should": [
                            {
                                "multi_match": {
                                    "query": q,
                                    "fields": ["title^3", "content^2"],
                                    "fuzziness": "AUTO",
                                    "operator": "or",
                                    "minimum_should_match": "70%"
                                }
                            }
                        ]
                    }
                },
                "collapse": {
                    "field": "id"  # Collapse results by document ID
                },
                "highlight": {
                    "max_analyzed_offset": 1000000,
                    "fields": {
                        "content": {
                            "fragment_size": PREVIEW_LENGTH,
                            "number_of_fragments": 1,
                            "pre_tags": [""],
                            "post_tags": [""],
                            "type": "unified",
                            "boundary_scanner": "sentence",
                            "boundary_scanner_locale": "en-US"
                        }
                    }
                },
                "_source": {
                    "includes": ["title", "path", "author", "updated_at", "content"]
                }
            },
            from_=from_,
            size=size
        )

        response = await blog_elastic.search_blog(query)
        hits = response.get('hits', {}).get('hits', [])
        
        search_results = [
            SearchResult(
                title=hit['_source']['title'],
                path=hit['_source'].get('path', ''),
                author=hit['_source'].get('author'),
                updated_at=hit['_source'].get('updated_at'),
                content_preview=clean_html_tags(
                    hit.get('highlight', {}).get('content', [''])[0] 
                    if hit.get('highlight') and hit.get('highlight', {}).get('content') 
                    else (hit['_source'].get('content', '')[:PREVIEW_LENGTH] if hit.get('highlight') else hit['_source'].get('content', '')[:PREVIEW_LENGTH])
                )
            )
            for hit in hits
        ]
        
        return search_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/{menu_id}", response_model=BlogMenu)
async def read_menu_item(menu_id: int, current_user: dict = Depends(check_authorized_user)):
    menu = await get_blog_menu(menu_id)
    if menu is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    if not menu.is_published and current_user is None:
        raise HTTPException(status_code=403, detail="This menu item is not published")
    return menu

@router.put("/{menu_id}", response_model=BlogMenu)
async def update_menu_item(menu_id: int, menu: BlogMenuUpdate, current_user: dict = Depends(get_current_user)):
    db_menu = await get_blog_menu(menu_id)
    if db_menu is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    updated_menu = await update_blog_menu(menu_id, menu)
    # Sync to Elasticsearch
    await blog_elastic.publish_menu(updated_menu)
    return updated_menu

@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(menu_id: int, current_user: dict = Depends(get_current_user)):
    db_menu = await get_blog_menu(menu_id)
    if db_menu is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await delete_blog_menu(menu_id)
    # Delete from Elasticsearch
    await blog_elastic.delete_menu(menu_id)
    return {"detail": "Menu item deleted successfully"}

@router.get("/{menu_id}/content", response_model=BlogContentSchema)
async def read_blog_content_by_menu(menu_id: int, current_user: dict = Depends(check_authorized_user)):
    content = await get_blog_content_by_menu_id(menu_id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu")
    if not content.is_published and current_user is None:
        raise HTTPException(status_code=403, detail="This content is not published")
    
    return await BlogContentSchema.from_tortoise_orm(content)

@router.get("/path/content/{path}", response_model=BlogContentSchema)
async def read_blog_content_by_menu_path(path: str):
    menu_item = await BlogMenuModel.get_or_none(path="/"+path)

    if not menu_item:
        raise HTTPException(status_code=404, detail="Blog menu not found for this path")
    
    content = await get_blog_content_by_menu_id(menu_item.id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu path")
    
    await menu_item.increment_views()
    
    return content

@router.get("/path/content/")
async def add_blog_content_home_by_menu_path():
    menu_item = await BlogMenuModel.get_or_none(path="/")

    if not menu_item:
        raise HTTPException(status_code=404, detail="Blog menu not found for this path")
    
    content = await get_blog_content_by_menu_id(menu_item.id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu path")
    
    await menu_item.increment_views()

    return content

@router.post("/path/{path}/content/{title}", response_model=bool)
async def add_blog_content_by_menu_path(
    path: str,
    title: str,
    content: str = Body(..., media_type="text/plain"),
    current_user: dict = Depends(get_current_user)
) -> bool:
    menu_item = await BlogMenuModel.get_or_none(path="/"+path)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Blog menu not found for this path")
    
    content_data = {
        "title": title,
        "content": content,
        "blog_menu_id": menu_item.id,
        "author": current_user.name  # Assuming the user model has a 'name' field
    }

    new_content = await BlogContentModel.create(**content_data)
    return True

@router.post("/{menu_id}/content/{title}", response_model=bool)
async def add_blog_content_by_menu_id(
    menu_id: int,
    title: str,
    content: str = Body(..., media_type="text/plain"),
    current_user: dict = Depends(get_current_user)
) -> bool:
    menu_item = await BlogMenuModel.get_or_none(id=menu_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Blog menu not found for this id")
    
    content_data = {
        "title": title,
        "content": content,
        "blog_menu_id": menu_id,
        "author": current_user.name  # Assuming the user model has a 'name' field
    }

    new_content = await BlogContentModel.create(**content_data)
    return True

@router.post("/check-path", status_code=status.HTTP_200_OK)
async def check_path_exists(
    path: str = Body(..., embed=True),
    _: dict = Depends(get_current_user)
) -> dict:
    # Ensure path starts with /
    if not path.startswith('/'):
        path = '/' + path
        
    # Check if path exists
    existing_menu = await BlogMenuModel.get_or_none(path=path)
    
    return {
        "exists": existing_menu is not None,
        "path": path
    }


@router.post("/publish", response_model=BlogMenu)
async def publish_menu_item(request: PublishMenuRequest, current_user: dict = Depends(get_current_user)):
    db_menu = await BlogMenuModel.get_or_none(path=request.path)
    if db_menu is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db_menu.is_published = request.isPublished
    await db_menu.save()
    
    # Sync updated publish status to Elasticsearch
    await blog_elastic.publish_menu(db_menu)
    
    return db_menu

@router.post("/sync-elasticsearch", status_code=status.HTTP_200_OK)
async def sync_all_to_elasticsearch():
    """
    Sync all existing blog menus and contents to Elasticsearch.
    This is useful for initial setup or recovery.
    """
    try:
        # Get all blog menus
        menus = await BlogMenuModel.all()
        menu_count = len(menus)
        
        # Get all blog contents
        contents = await BlogContentModel.all()
        content_count = len(contents)
        
        # Reindex everything
        await blog_elastic.reindex_all()
        
        return {
            "status": "success",
            "message": "Successfully synced all data to Elasticsearch",
            "details": {
                "menus_synced": menu_count,
                "contents_synced": content_count
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync data to Elasticsearch: {str(e)}"
        )
