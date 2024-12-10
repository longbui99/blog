from app.models.attachment import Attachment
from app.models.blog_menu import BlogMenu
from app.schemas.attachment import AttachmentCreate, AttachmentUpdate
from app.core.config import settings
from fastapi import HTTPException
import base64
import os
import uuid
import logging
from typing import Optional

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1] if '.' in filename else ''

def clean_base64_data(base64_data: str) -> str:
    """Clean base64 data by removing data URL prefix and handling padding"""
    if ',' in base64_data:
        base64_data = base64_data.split(',', 1)[1]
    
    padding = len(base64_data) % 4
    if padding:
        base64_data += '=' * (4 - padding)
    
    return base64_data

async def create_attachment(data: AttachmentCreate) -> Attachment:
    # Ensure path starts with /
    path = data.path if data.path.startswith('/') else f'/{data.path}'
    
    # Find the menu by path
    menu = await BlogMenu.get_or_none(path=path)
    if not menu:
        raise HTTPException(status_code=404, detail=f"Blog menu not found for path: {path}")

    # Generate UUID filename with original extension
    extension = get_file_extension(data.original_filename)
    new_filename = f"{uuid.uuid4()}{extension}"
    
    # Create directory if it doesn't exist
    os.makedirs(settings.ATTACHMENT_PATH, exist_ok=True)
    
    # Save the file
    file_path = os.path.join(settings.ATTACHMENT_PATH, new_filename)
    try:
        # Clean and decode base64 data
        cleaned_data = clean_base64_data(data.file_data)
        with open(file_path, "wb") as file:
            file.write(base64.b64decode(cleaned_data))
    except Exception as e:
        logging.error(f"Failed to save file: {str(e)}")
        raise

    # Create database record
    return await Attachment.create(
        filename=new_filename,
        original_filename=data.original_filename,
        menu=menu  # Link to the found menu
    )

async def get_attachment(filename: str) -> Optional[Attachment]:
    """
    Retrieve attachment by filename
    """
    return await Attachment.get_or_none(filename=filename)

async def update_attachment(attachment_id: int, data: AttachmentUpdate) -> Attachment:
    attachment = await Attachment.get(id=attachment_id)
    
    if data.file_data:
        # Remove old file
        old_file_path = os.path.join(settings.ATTACHMENT_PATH, attachment.filename)
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
        
        # Generate new filename if original_filename is provided
        if data.original_filename:
            extension = get_file_extension(data.original_filename)
            new_filename = f"{uuid.uuid4()}{extension}"
            attachment.filename = new_filename
            attachment.original_filename = data.original_filename
        
        # Save new file
        file_path = os.path.join(settings.ATTACHMENT_PATH, attachment.filename)
        try:
            # Clean and decode base64 data
            cleaned_data = clean_base64_data(data.file_data)
            with open(file_path, "wb") as file:
                file.write(base64.b64decode(cleaned_data))
        except Exception as e:
            logging.error(f"Failed to save file: {str(e)}")
            raise
    
    await attachment.save()
    return attachment

async def delete_attachment(attachment_id: int):
    attachment = await Attachment.get(id=attachment_id)
    file_path = os.path.join(settings.ATTACHMENT_PATH, attachment.filename)
    
    # Remove file if it exists
    if os.path.exists(file_path):
        os.remove(file_path)
    
    await attachment.delete() 