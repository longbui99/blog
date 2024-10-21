from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.v1 import auth, blog_menu, blog_content, chatgpt
from app.core.database import init_db
from app.core.cors import setup_cors
import traceback
import logging
import sys
import json
from typing import Union

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Use the middleware
app = FastAPI()

# Setup CORS
setup_cors(app)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(blog_menu.router, prefix="/api/v1/blog-menu", tags=["blog-menu"])
app.include_router(blog_content.router, prefix="/api/v1/blog-content", tags=["blog content"])
app.include_router(chatgpt.router, prefix="/api/v1/chatgpt", tags=["Chat GPT"])

@app.on_event("startup")
async def startup_event():
    logger.info("Application is starting up")
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application is shutting down")
    from tortoise import Tortoise
    await Tortoise.close_connections()

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting the application")
    uvicorn.run(app, host="0.0.0.0", port=8888)
