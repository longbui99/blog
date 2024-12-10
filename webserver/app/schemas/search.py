from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class SearchQuery(BaseModel):
    query: Dict[str, Any]
    from_: Optional[int] = 0
    size: Optional[int] = 10

class SearchResult(BaseModel):
    id: str
    score: float
    title: str
    content: Optional[str] = None
    path: str = ""
    type: str  # 'menu' or 'content'
    updated_at: Optional[datetime] = None
    author: Optional[str] = None
    highlight: Optional[Dict[str, List[str]]] = None 