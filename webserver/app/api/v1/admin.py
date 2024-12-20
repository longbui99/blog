import os
import subprocess
import shutil
import tempfile
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from typing import Annotated
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.core.config import settings
import logging
import zipfile
import io

router = APIRouter()

@router.get("/database/download")
async def download_database_backup(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Create a temporary directory for our backup files
        with tempfile.TemporaryDirectory() as temp_dir:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"backup_{timestamp}"
            
            # Extract database connection details from DATABASE_URL
            db_url = settings.DATABASE_URL
            db_parts = db_url.replace("postgresql://", "").replace("postgres://", "").split("@")
            user_pass = db_parts[0].split(":")
            host_db = db_parts[1].split("/")
            
            db_user = user_pass[0]
            db_pass = user_pass[1]
            db_host = host_db[0].split(":")[0]
            db_name = host_db[1]

            # Set PGPASSWORD environment variable for passwordless backup
            os.environ['PGPASSWORD'] = db_pass

            # Create SQL backup
            sql_file_path = os.path.join(temp_dir, f"{backup_filename}.sql")
            pg_dump_cmd = [
                'pg_dump',
                '-h', db_host,
                '-U', db_user,
                '-d', db_name,
                '-f', sql_file_path
            ]
            logging.info(db_url.split("//"))
            logging.info(db_url)
            logging.info(user_pass)
            logging.info(host_db)
            logging.info(pg_dump_cmd)
            
            subprocess.run(pg_dump_cmd, check=True)

            # Copy filestore if it exists
            filestore_path = settings.ATTACHMENT_PATH
            if os.path.exists(filestore_path):
                filestore_backup_path = os.path.join(temp_dir, 'filestore')
                shutil.copytree(filestore_path, filestore_backup_path)

            # Create zip file
            zip_path = os.path.join(temp_dir, f"{backup_filename}.zip")
            shutil.make_archive(os.path.join(temp_dir, backup_filename), 'zip', temp_dir)

            # Read the zip file
            with open(zip_path, 'rb') as zip_file:
                zip_contents = zip_file.read()

            # Clean up environment variable
            os.environ.pop('PGPASSWORD', None)

            return Response(
                content=zip_contents,
                media_type='application/zip',
                headers={
                    'Content-Disposition': f'attachment; filename="{backup_filename}.zip"'
                }
            )

    except subprocess.CalledProcessError as e:
        logging.error(f"Database backup failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create database backup"
        )
    except Exception as e:
        logging.error(f"Backup process failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create backup"
        ) 

@router.post("/database/restore")
async def restore_database_backup(
    current_user: Annotated[User, Depends(get_current_user)], backup_file: UploadFile = File(...), 
):
    try:
        # Create a temporary directory for restoration
        with tempfile.TemporaryDirectory() as temp_dir:
            # Read and extract zip file
            zip_content = await backup_file.read()
            zip_buffer = io.BytesIO(zip_content)
            
            with zipfile.ZipFile(zip_buffer, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)

            # Find the SQL file
            sql_file = None
            for file in os.listdir(temp_dir):
                if file.endswith('.sql'):
                    sql_file = os.path.join(temp_dir, file)
                    break

            if not sql_file:
                raise HTTPException(
                    status_code=400,
                    detail="No SQL backup file found in the zip archive"
                )

            # Extract database connection details
            db_url = settings.DATABASE_URL
            db_parts = db_url.replace("postgresql://", "").replace("postgres://", "").split("@")
            user_pass = db_parts[0].split(":")
            host_db = db_parts[1].split("/")
            
            db_user = user_pass[0]
            db_pass = user_pass[1]
            db_host = host_db[0].split(":")[0]
            db_name = host_db[1]

            # Set PGPASSWORD environment variable
            os.environ['PGPASSWORD'] = db_pass

            # Drop all connections to the database
            drop_connections_cmd = [
                'psql',
                '-h', db_host,
                '-U', db_user,
                '-d', 'postgres',
                '-c', f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{db_name}' AND pid <> pg_backend_pid();"
            ]
            subprocess.run(drop_connections_cmd, check=True)

            # Drop and recreate the database
            drop_db_cmd = [
                'dropdb',
                '-h', db_host,
                '-U', db_user,
                '--if-exists',
                db_name
            ]
            create_db_cmd = [
                'createdb',
                '-h', db_host,
                '-U', db_user,
                db_name
            ]
            
            subprocess.run(drop_db_cmd, check=True)
            subprocess.run(create_db_cmd, check=True)

            # Restore the database
            restore_cmd = [
                'psql',
                '-h', db_host,
                '-U', db_user,
                '-d', db_name,
                '-f', sql_file
            ]
            subprocess.run(restore_cmd, check=True)

            # Restore filestore if it exists in the backup
            filestore_backup_path = os.path.join(temp_dir, 'filestore')
            if os.path.exists(filestore_backup_path):
                filestore_path = settings.ATTACHMENT_PATH
                # Copy contents from backup to destination, overwriting existing files
                for item in os.listdir(filestore_backup_path):
                    src = os.path.join(filestore_backup_path, item)
                    dst = os.path.join(filestore_path, item)
                    if os.path.isfile(src):
                        shutil.copy2(src, dst)
                    else:
                        if os.path.exists(dst):
                            shutil.rmtree(dst)
                        shutil.copytree(src, dst)

            # Clean up environment variable
            os.environ.pop('PGPASSWORD', None)
            

            return {"message": "Database and filestore restored successfully"}

    except subprocess.CalledProcessError as e:
        logging.error(f"Database restoration failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restore database: {str(e)}"
        )
    except zipfile.BadZipFile:
        logging.error("Invalid zip file provided")
        raise HTTPException(
            status_code=400,
            detail="Invalid backup file format"
        )
    except Exception as e:
        logging.error(f"Restoration process failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restore backup: {str(e)}"
        )