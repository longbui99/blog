import logging
from fastapi import FastAPI
from app.api.v1 import auth, blog_menu, blog_content, chatgpt, attachment, admin, ai
from app.core.database import init_db
from app.core.cors import setup_cors
from app.api.v1 import sitemap
from app.core.config import settings
from app.services.elasticsearch import ElasticsearchService
from app.core.logging import setup_logging
from app.core.middleware import LoggingMiddleware
from app.services.qdrant import QdrantService
from app.services.gemini import GeminiService
from app.services.embedding import EmbeddingService
# Create FastAPI app
app = FastAPI()

# Setup logging
setup_logging()

# Add the logging middleware
app.add_middleware(LoggingMiddleware)

# Setup CORS
setup_cors(app)

# Include routers
app.include_router(sitemap.router, tags=["sitemap"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(attachment.router, prefix="/api/v1/attachments", tags=["attachments"])
app.include_router(blog_menu.router, prefix="/api/v1/blog-menu", tags=["blog menu"])
app.include_router(blog_content.router, prefix="/api/v1/blog-content", tags=["blog content"])
app.include_router(chatgpt.router, prefix="/api/v1/chatgpt", tags=["Chat GPT"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])


@app.on_event("startup")
async def startup_event():
    logging.info("DONE: ============ Application is starting up")
    await init_db()
    logging.info("DONE: ============ Database initialized")
    es_service = ElasticsearchService()
    await es_service.initialize()
    logging.info("DONE: ============ Elasticsearch service initialized")
    EmbeddingService()
    logging.info("DONE: ============ Embedding service initialized")
    qdrant_service = QdrantService()
    await qdrant_service.initialize()
    logging.info("DONE: ============ Qdrant service initialized")
    GeminiService()
    logging.info("DONE: ============ Gemini service initialized")

    logging.info("DONE: ============ Application is ready")

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Application is shutting down")
    from tortoise import Tortoise
    await Tortoise.close_connections()

if __name__ == "__main__":
    import uvicorn
    logging.info("Starting the application")
    uvicorn.run(app, host="0.0.0.0", port=8888)
