from fastapi import APIRouter, HTTPException, Depends, status
from tortoise.transactions import atomic
from tortoise.expressions import F
from tortoise.functions import Max
from typing import List, Annotated
from app.schemas.blog_content import BlogContentCreate, BlogContentUpdate, BlogContent as BlogContentSchema
from app.models.blog_content import BlogContent
from app.models.blog_menu import BlogMenu
from app.crud.blog_menu import get_blog_menu_by_path
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.services.blogpost_elastic import BlogpostElasticService
from app.services.qdrant import QdrantService

router = APIRouter()
blog_elastic = BlogpostElasticService()
qdrant_service = QdrantService()

# Add constant at the top of the file
RESERVED_PATHS = {'/new-page'}  # Can be expanded for other reserved paths

@router.post("/", response_model=BlogContentSchema)
async def create_blog_content(blog_content_data: BlogContentCreate, current_user: Annotated[User, Depends(get_current_user)]):
    blog_menu = await BlogMenu.get_or_none(id=blog_content_data.blog_menu_id)
    if not blog_menu:
        raise HTTPException(status_code=404, detail="Blog menu not found")
    
    # Check if blog content already exists for this blog menu
    existing_content = await BlogContent.filter(blog_menu_id=blog_content_data.blog_menu_id).first()
    if existing_content:
        raise HTTPException(status_code=400, detail="Blog content already exists for this blog menu")
    
    content = await BlogContent.create(**blog_content_data.dict())
    
    # Sync to Elasticsearch
    await blog_elastic.publish_content(content)
    # Sync content to Qdrant
    await qdrant_service.publish_content(content)
    
    return await BlogContentSchema.from_tortoise_orm(content)

@router.get("/", response_model=List[BlogContentSchema])
async def list_blog_contents():
    # Fetch all blog contents associated with published menus
    published_menus = await BlogMenu.filter(is_published=True).values_list('id', flat=True)
    return await BlogContentSchema.from_queryset(BlogContent.filter(blog_menu_id__in=published_menus).all())

@router.post("/update_or_create", response_model=BlogContentSchema)
async def update_or_create_blog_content(blog_content_data: BlogContentUpdate, current_user: Annotated[User, Depends(get_current_user)]):
    # Add validation for reserved paths
    if blog_content_data.path in RESERVED_PATHS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Cannot use reserved path",
                "path": blog_content_data.path,
                "error": f"The path '{blog_content_data.path}' is reserved for system use. Please choose a different path."
            }
        )
    
    # Check if the blog menu exists
    blog_menu = await get_blog_menu_by_path(blog_content_data.path)
    if not blog_menu:
        # Create a new BlogMenu if it doesn't exist
        max_sequence = await BlogMenu.filter(parent=blog_content_data.parent).order_by('-sequence').first()
        new_sequence = (max_sequence.sequence if max_sequence else 0) + 1
        
        blog_menu = await BlogMenu.create(
            title=blog_content_data.title,
            path=blog_content_data.path,
            parent=blog_content_data.parent,
            sequence=new_sequence,
            component="BlogContent",  # Default component, adjust if needed
            short_name=blog_content_data.title[:50]  
        )
        # Sync menu to Elasticsearch
        await blog_elastic.publish_menu(blog_menu)
    else:
        if blog_menu.title != blog_content_data.title:
            blog_menu.title = blog_content_data.title
            await blog_menu.save()
            # Sync updated menu to Elasticsearch
            await blog_elastic.publish_menu(blog_menu)

    # Check if the content already exists for this blog menu
    existing_content = await BlogContent.get_or_none(blog_menu=blog_menu)
    
    if existing_content:
        # Update existing content
        blog_content_data.author = current_user.name
        await existing_content.update_from_dict(blog_content_data.dict(exclude={'path', 'parent', 'previous', 'next'}))
        content = existing_content
    else:
        # Create new content
        content_data = blog_content_data.dict(exclude={'path', 'parent', 'previous', 'next'})
        content_data['blog_menu'] = blog_menu
        content_data['author'] = current_user.name
        content = await BlogContent.create(**content_data)
    
    # Get the original blog_menu
    sequence_changed = False

    # Handle parent assignment
    if blog_content_data.parent:
        parent_menu = await get_blog_menu_by_path(blog_content_data.parent)
        if not parent_menu:
            raise HTTPException(status_code=404, detail="Parent menu not found")
        if blog_menu.parent != parent_menu.path:
            blog_menu.parent = parent_menu.path
            sequence_changed = True
    elif blog_menu.parent is not None:
        blog_menu.parent = None
        sequence_changed = True

    # Handle sequencing only if parent, previous, or next has changed
    if sequence_changed or blog_content_data.previous or blog_content_data.next:
        if blog_content_data.previous:
            previous_menu = await get_blog_menu_by_path(blog_content_data.previous)
            if not previous_menu:
                raise HTTPException(status_code=404, detail="Previous menu not found")
            blog_menu.sequence = previous_menu.sequence + 1
            # Resequence subsequent items
            await BlogMenu.filter(parent=blog_menu.parent, sequence__gt=blog_menu.sequence).update(sequence=F('sequence') + 1)
        elif blog_content_data.next:
            next_menu = await get_blog_menu_by_path(blog_content_data.next)
            if not next_menu:
                raise HTTPException(status_code=404, detail="Next menu not found")
            blog_menu.sequence = next_menu.sequence
            # Resequence subsequent items
            await BlogMenu.filter(parent=blog_menu.parent, sequence__gte=blog_menu.sequence).update(sequence=F('sequence') + 1)
        else:
            # If no previous or next, add to the end of the parent's children
            max_sequence = await BlogMenu.filter(parent=blog_menu.parent).order_by('-sequence').first()
            blog_menu.sequence = (max_sequence.sequence if max_sequence else 0) + 1
    
    await blog_menu.save()
    await content.save()
    
    # Sync content to Elasticsearch
    await blog_elastic.publish_content(content)
    # Sync content to Qdrant
    await qdrant_service.update_content(content)
    
    # Convert the Tortoise ORM model to a dict, then to a Pydantic model
    content_dict = await BlogContent.get(id=content.id).values()
    return BlogContentSchema(**content_dict)

@router.get("/{content_id}", response_model=BlogContentSchema)
async def read_blog_content(content_id: int):
    content = await BlogContent.get_or_none(id=content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found")
    
    # Check if the associated blog menu is published
    blog_menu = await BlogMenu.get_or_none(id=content.blog_menu_id)
    if blog_menu is None or not blog_menu.is_published:
        raise HTTPException(status_code=403, detail="This content is not associated with a published menu")
    
    await content.increment_views()
    return await BlogContentSchema.from_tortoise_orm(content)

@router.put("/{content_id}", response_model=BlogContentSchema)
async def update_blog_content(content_id: int, blog_content_data: BlogContentUpdate, current_user: Annotated[User, Depends(get_current_user)]):
    content = await BlogContent.get_or_none(id=content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found")
    
    if blog_content_data.blog_menu_id:
        blog_menu = await BlogMenu.get_or_none(id=blog_content_data.blog_menu_id)
        if not blog_menu:
            raise HTTPException(status_code=404, detail="Blog menu not found")
        
        # Check if blog content already exists for the new blog menu
        existing_content = await BlogContent.filter(blog_menu_id=blog_content_data.blog_menu_id).exclude(id=content_id).first()
        if existing_content:
            raise HTTPException(status_code=400, detail="Blog content already exists for this blog menu")
    
    await content.update_from_dict(blog_content_data.dict(exclude_unset=True))
    await content.save()
    return await BlogContentSchema.from_tortoise_orm(content)

@router.delete("/{content_id}", response_model=dict)
async def delete_blog_content(content_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    content = await BlogContent.get_or_none(id=content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found")
    
    # Delete from Elasticsearch first
    await blog_elastic.delete_content(content)
    
    await content.delete()
    return {"message": "Blog content deleted successfully"}

@router.get("/by-menu/{menu_id}", response_model=BlogContentSchema)
async def read_blog_content_by_menu(menu_id: int):
    # Check if the menu is published before fetching content
    blog_menu = await BlogMenu.get_or_none(id=menu_id)
    if not blog_menu or not blog_menu.is_published:
        raise HTTPException(status_code=403, detail="This menu is not published or does not exist")
    
    content = await BlogContent.get_or_none(blog_menu_id=menu_id)
    if not content:
        raise HTTPException(status_code=404, detail="Blog content not found for this menu")
    
    await content.increment_views()
    
    return await BlogContentSchema.from_tortoise_orm(content)

@router.delete("/delete_by_path/{path}")
@atomic()
async def delete_blog_content_by_path(path: str, current_user: Annotated[User, Depends(get_current_user)]):
    print(f"Deleting blog content by path: {path}")
    # Find blog_menu by path
    blog_menu = await get_blog_menu_by_path("/"+path)
    if not blog_menu:
        raise HTTPException(status_code=404, detail="Blog menu not found")

    # Get content before deletion for Elasticsearch cleanup
    content = await BlogContent.get_or_none(blog_menu=blog_menu)
    if content:
        await content.increment_views()

    # Get the parent of the blog_menu
    parent = await BlogMenu.get_or_none(path=blog_menu.parent)

    # Get all children of blog_menu
    children = await BlogMenu.filter(parent=blog_menu.path)

    # Update children of blog_menu to parent
    for child in children:
        child.parent = parent.path if parent else None
        await child.save()

    # Remove blog_content
    await BlogContent.filter(blog_menu=blog_menu).delete()
    
    # Delete menu from Elasticsearch
    await blog_elastic.delete_menu(blog_menu.id)
    
    await blog_menu.delete()

    return {"message": "Blog content and menu deleted successfully"}

@router.post("/reindex")
async def reindex_all_content(current_user: Annotated[User, Depends(get_current_user)]):
    # You might want to add additional admin-only checks here
    try:
        result = await blog_elastic.reindex_all()
        return {"message": "Reindexing completed successfully", "details": result}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reindex content: {str(e)}"
        )
