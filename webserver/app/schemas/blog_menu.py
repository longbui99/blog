from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BlogMenuBase(BaseModel):
    title: str
    parent: Optional[str] = None
    sequence: int
    component: str
    short_name: str
    is_published: bool

class BlogMenuCreate(BlogMenuBase):
    pass

class BlogMenuUpdate(BaseModel):
    title: Optional[str] = None
    parent: Optional[str] = None
    sequence: Optional[int] = None
    component: Optional[str] = None
    short_name: Optional[str] = None

class BlogMenuInDB(BlogMenuBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BlogMenu(BlogMenuInDB):
    pass

class BlogMenuItem(BaseModel):
    path: str
    title: str
    parent: Optional[str]
    sequence: int
    component: str
    is_published: bool

class PublishMenuRequest(BaseModel):
    path: str  # Ensure this is a string
    isPublished: bool  # Ensure this is a boolean