from fastapi import APIRouter, HTTPException, Depends, status, Body
from typing import List
from app.schemas.blog_menu import BlogMenuCreate, BlogMenu, BlogMenuUpdate, BlogMenuItem
from app.schemas.blog_content import BlogContent as BlogContentSchema, BlogContentCreate
from app.models.blog_content import BlogContent as BlogContentModel
from app.models.blog_menu import BlogMenu as BlogMenuModel
from app.crud.blog_menu import create_blog_menu, get_blog_menu, get_blog_menus, update_blog_menu, delete_blog_menu
from app.crud.blog_content import create_blog_content
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=BlogMenu, status_code=status.HTTP_201_CREATED)
async def create_menu_item(menu: BlogMenuCreate, current_user: dict = Depends(get_current_user)):
    return await create_blog_menu(menu)

@router.get("/{menu_id}", response_model=BlogMenu)
async def read_menu_item(menu_id: int):
    menu = await get_blog_menu(menu_id)
    if menu is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return menu

@router.get("/", response_model=List[BlogMenuItem])
async def read_menu_items(skip: int = 0, limit: int = 100):
    return await get_blog_menus()

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
async def read_blog_content_by_menu(menu_id: int):
    content = await BlogContentModel.get(blog_menu_id=menu_id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu")
    return await BlogContentSchema.from_tortoise_orm(content)


@router.get("/path/{path}/content", response_model=BlogContentSchema)
async def read_blog_content_by_menu_path(path: str):
    menu_item = await BlogMenuModel.get_or_none(path="/"+path)

    if not menu_item:
        raise HTTPException(status_code=404, detail="Blog menu not found for this path")
    
    content = await BlogContentModel.get_or_none(blog_menu_id=menu_item.id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu path")

    return content


@router.get("/path//content")
async def add_blog_content_home_by_menu_path():
    menu_item = await BlogMenuModel.get_or_none(path="/")

    if not menu_item:
        raise HTTPException(status_code=404, detail="Blog menu not found for this path")
    
    content = await BlogContentModel.get_or_none(blog_menu_id=menu_item.id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu path")

    return content

@router.post("/path/{path}/content/{title}")
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

@router.post("/{menu_id}/content/{title}")
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
