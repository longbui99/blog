from pydantic import BaseModel
from typing import Optional

class AttachmentCreate(BaseModel):
    path: str
    file_data: str  # Base64 encoded file data
    original_filename: str  # To get the file extension

class AttachmentUpdate(BaseModel):
    file_data: Optional[str] = None  # Base64 encoded file data
    original_filename: Optional[str] = None

class AttachmentResponse(BaseModel):
    id: int
    filename: str
    menu_id: int
    original_filename: str