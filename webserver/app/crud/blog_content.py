from app.models.blog_content import BlogContent
from app.schemas.blog_content import BlogContentCreate, BlogContentUpdate

async def create_blog_content(content: BlogContentCreate):
    return await BlogContent.create(**content.dict())

async def get_blog_content(content_id: int):
    return await BlogContent.get(id=content_id)

async def get_blog_contents(skip: int = 0, limit: int = 100):
    return await BlogContent.all().offset(skip).limit(limit)

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
