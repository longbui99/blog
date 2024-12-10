from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from app.schemas.attachment import AttachmentCreate, AttachmentUpdate
from app.crud.attachment import create_attachment, update_attachment, delete_attachment, get_attachment
from app.api.v1.auth import get_current_user
import os
import logging
from app.core.config import settings
from app.models.attachment import Attachment

router = APIRouter()

@router.get("/{filename}")
async def get_attachment_endpoint(filename: str):
    """
    Get attachment by filename. Returns the file for download.
    """
    try:
        attachment = await get_attachment(filename)
        if not attachment:
            raise HTTPException(status_code=404, detail="Attachment not found")

        file_path = os.path.join(settings.ATTACHMENT_PATH, attachment.filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(
            path=file_path,
            filename=attachment.original_filename,
            media_type="application/octet-stream"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/filestore", status_code=201)
async def create_attachment_endpoint(data: AttachmentCreate):
    try:
        attachment = await create_attachment(data)
        return attachment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{attachment_id}", status_code=200)
async def update_attachment_endpoint(attachment_id: int, data: AttachmentUpdate):
    try:
        attachment = await update_attachment(attachment_id, data)
        return attachment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{attachment_id}", status_code=204)
async def delete_attachment_endpoint(attachment_id: int):
    try:
        await delete_attachment(attachment_id)
        return {"detail": "Attachment deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cleanup", status_code=200)
async def cleanup_attachments(current_user: dict = Depends(get_current_user)):
    """
    Cleanup orphaned attachment files that are no longer referenced in the database.
    Returns the number of files cleaned up.
    """
    try:
        # Get all files in the attachment directory
        files_in_directory = []
        for root, _, files in os.walk(settings.ATTACHMENT_PATH):
            for file in files:
                files_in_directory.append(file)

        # Get all valid filenames from database
        db_attachments = await Attachment.all().values_list('filename', flat=True)
        db_filenames = set(db_attachments)

        # Find orphaned files (files that exist on disk but not in DB)
        orphaned_files = set(files_in_directory) - db_filenames
        
        # Delete orphaned files
        deleted_count = 0
        for orphaned_file in orphaned_files:
            file_path = os.path.join(settings.ATTACHMENT_PATH, orphaned_file)
            try:
                os.remove(file_path)
                deleted_count += 1
            except OSError as e:
                logging.error(f"Error deleting file {orphaned_file}: {str(e)}")

        return {
            "status": "success",
            "files_checked": len(files_in_directory),
            "files_deleted": deleted_count,
            "orphaned_files": list(orphaned_files)
        }

    except Exception as e:
        logging.error(f"Cleanup operation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cleanup attachments: {str(e)}"
        )
