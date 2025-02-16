from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BlogContentBase(BaseModel):
    title: str
    content: str
    author: str
    blog_menu_id: int
    total_views: int

class BlogContentCreate(BlogContentBase):
    pass

class BlogContentUpdate(BaseModel):
    path: str
    title: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    parent: Optional[str] = None
    previous: Optional[str] = None
    next: Optional[str] = None

class BlogContentInDB(BlogContentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BlogContent(BlogContentInDB):
    pass
