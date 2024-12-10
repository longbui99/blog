from fastapi import APIRouter, HTTPException, Depends, status, Body, Query
from typing import List
from app.schemas.blog_menu import BlogMenuCreate, BlogMenu, BlogMenuUpdate, BlogMenuItem, PublishMenuRequest
from app.schemas.blog_content import BlogContent as BlogContentSchema
from app.models.blog_content import BlogContent as BlogContentModel
from app.models.blog_menu import BlogMenu as BlogMenuModel
from app.models.search import SearchResult
from app.crud.blog_menu import create_blog_menu, get_blog_menu, get_blog_menus, update_blog_menu, delete_blog_menu
from app.api.v1.auth import get_current_user, check_authorized_user
from tortoise.expressions import Q
from tortoise import connections
import logging
import re
from bs4 import BeautifulSoup

router = APIRouter()

@router.post("/", response_model=BlogMenu, status_code=status.HTTP_201_CREATED)
async def create_menu_item(menu: BlogMenuCreate, current_user: dict = Depends(get_current_user)):
    return await create_blog_menu(menu)

@router.get("/", response_model=List[BlogMenuItem])
async def read_menu_items(skip: int = 0, limit: int = 100, current_user: dict = Depends(check_authorized_user)):
    menus = await get_blog_menus()
    if current_user:
        return menus
    return [menu for menu in menus if menu['is_published']]

@router.get("/search", response_model=List[SearchResult])
async def search_content(
    q: str = Query(..., description="Search query string")
):
    """
    Search across blog menus and content using GIN index.
    Does not require authentication.
    Uses full-text search capabilities.
    """
    def clean_content(content: str) -> str:
        soup = BeautifulSoup(content, 'html.parser')
        text = soup.get_text(separator=' ', strip=True)
        text = re.sub(r'\s+', ' ', text)
        return text[:200] + "..." if len(text) > 200 else text

    # Raw SQL query using GIN index
    search_query = """
    WITH combined_results AS (
        -- Search in blog_menu
        SELECT 
            title,
            path,
            updated_at,
            NULL as content,
            NULL as author,
            NULL as blog_menu_id,
            ts_rank(to_tsvector('english', title || ' ' || path), plainto_tsquery('english', $1)) as rank
        FROM blog_menus
        WHERE 
            is_published = TRUE 
            AND to_tsvector('english', title || ' ' || path) @@ plainto_tsquery('english', $1)
        
        UNION ALL
        
        -- Search in blog_content
        SELECT 
            bc.title,
            bm.path,
            bc.updated_at,
            bc.content,
            bc.author,
            bc.blog_menu_id,
            ts_rank(to_tsvector('english', bc.title || ' ' || bc.content), plainto_tsquery('english', $2)) as rank
        FROM blog_contents bc
        JOIN blog_menus bm ON bc.blog_menu_id = bm.id
        WHERE 
            bm.is_published = TRUE
            AND to_tsvector('english', bc.title || ' ' || bc.content) @@ plainto_tsquery('english', $2)
    )
    SELECT * FROM combined_results
    ORDER BY rank DESC
    LIMIT 40;
    """
    
    # Execute raw query using Tortoise connection
    conn = connections.get("default")
    results = await conn.execute_query_dict(search_query, [q, q])
    
    # Process results
    search_results = []
    existing_paths = set()
    
    for result in results:
        if result['path'] not in existing_paths:
            search_result = SearchResult(
                title=result['title'],
                path=result['path'],
                updated_at=result['updated_at'],
                author=result['author']
            )
            
            if result['content']:
                search_result.content_preview = clean_content(result['content'])
            
            search_results.append(search_result)
            existing_paths.add(result['path'])

    return search_results

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
    return await update_blog_menu(menu_id, menu)

@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(menu_id: int, current_user: dict = Depends(get_current_user)):
    db_menu = await get_blog_menu(menu_id)
    if db_menu is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await delete_blog_menu(menu_id)
    return {"detail": "Menu item deleted successfully"}

@router.get("/{menu_id}/content", response_model=BlogContentSchema)
async def read_blog_content_by_menu(menu_id: int, current_user: dict = Depends(check_authorized_user)):
    content = await BlogContentModel.get(blog_menu_id=menu_id)
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
    
    content = await BlogContentModel.get_or_none(blog_menu_id=menu_item.id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu path")

    return content

@router.get("/path/content/")
async def add_blog_content_home_by_menu_path():
    menu_item = await BlogMenuModel.get_or_none(path="/")

    if not menu_item:
        raise HTTPException(status_code=404, detail="Blog menu not found for this path")
    
    content = await BlogContentModel.get_or_none(blog_menu_id=menu_item.id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu path")

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
    # Find the menu item by path
    db_menu = await BlogMenuModel.get_or_none(path=request.path)
    if db_menu is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    # Update the is_published field based on the request
    db_menu.is_published = request.isPublished
    await db_menu.save()  # Save the updated menu item
    return db_menu
