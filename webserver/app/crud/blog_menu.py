from app.models.blog_menu import BlogMenu
from app.schemas.blog_menu import BlogMenuCreate, BlogMenuUpdate

async def create_blog_menu(menu: BlogMenuCreate):
    return await BlogMenu.create(**menu.dict())

async def get_blog_menu(menu_id: int):
    return await BlogMenu.get(id=menu_id)

async def get_blog_menu_by_path(path: str):
    return await BlogMenu.get_or_none(path=path)

async def get_blog_menus():
    menus = await BlogMenu.all()
    return [
        {
            "path": menu.path,
            "title": menu.title,
            "parent": menu.parent,
            "sequence": menu.sequence,
            "component": menu.component,
            "is_published": bool(menu.is_published)
        }
        for menu in menus
    ]

async def update_blog_menu(menu_id: int, menu_data: BlogMenuUpdate):
    menu = await BlogMenu.get(id=menu_id)
    update_data = menu_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(menu, key, value)
    await menu.save()
    return menu

async def delete_blog_menu(menu_id: int):
    menu = await BlogMenu.get(id=menu_id)
    await menu.delete()
    return menu
