from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SearchResult(BaseModel):
    """
    Model for search results that combines data from blog menus and content.
    """
    title: str
    path: str
    content_preview: Optional[str] = None
    author: Optional[str] = None
    updated_at: Optional[datetime] = None 