from typing import List
from app.models.blog_content import BlogContent
from app.schemas.blog_content import BlogContentCreate, BlogContentUpdate
from tortoise.expressions import F


async def create_blog_content(content: BlogContentCreate):
    return await BlogContent.create(**content.dict())


async def get_blog_content(content_id: int):
    return await BlogContent.get(id=content_id)


async def get_blog_contents(skip: int = 0, limit: int = 100):
    return await BlogContent.all().offset(skip).limit(limit)


async def get_blog_contents_by_ids(content_ids: List[int]):
    return await BlogContent.filter(id__in=content_ids).prefetch_related("blog_menu")


async def update_blog_content(content_id: int, content_data: BlogContentUpdate):
    content = await BlogContent.get(id=content_id)
    update_data = content_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(content, key, value)
    await content.save()
    return content


async def delete_blog_content(content_id: int):
    content = await BlogContent.get(id=content_id)
    await content.delete()
    return content


async def get_blog_content_by_menu_id(menu_id: int):
    content = await BlogContent.filter(blog_menu_id=menu_id).first().annotate(
        total_views=F('blog_menu__total_views')
    ).values(
        "id",
        "title",
        "content",
        "author",
        "created_at",
        "updated_at",
        "blog_menu_id",
        "total_views"
    )
    return content
