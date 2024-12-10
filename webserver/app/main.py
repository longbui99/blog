from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI
from app.api.v1 import auth, blog_menu, blog_content, chatgpt
from app.core.database import init_db
from app.core.cors import setup_cors
from app.api.v1 import sitemap
from app.core.config import settings
from app.services.elasticsearch import ElasticsearchService
import logging
import sys

class LogColors:
    INFO = "\033[94m"  # Blue
    WARNING = "\033[93m"  # Yellow
    ERROR = "\033[91m"  # Red
    RESET = "\033[0m"  # Reset to default

# Custom logging formatter
class ColoredFormatter(logging.Formatter):
    def format(self, record):
        level_name = logging.getLevelName(record.levelno)  # Get the log level name
        if record.levelno == logging.INFO:
            record.msg = f"{LogColors.INFO}{level_name}: {record.msg}{LogColors.RESET}"
        elif record.levelno == logging.WARNING:
            record.msg = f"{LogColors.WARNING}{level_name}: {record.msg}{LogColors.RESET}"
        elif record.levelno == logging.ERROR:
            record.msg = f"{LogColors.ERROR}{level_name}: {record.msg}{LogColors.RESET}"
        return super().format(record)
# Set up logging
log_file_path = settings.LOG_FILE
logging.basicConfig(
    format='%(levelname)s: %(asctime)s - %(name)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path),
        logging.StreamHandler(sys.stdout)
    ],
    level=logging.INFO  # Ensure the logging level is set to INFO
)
for handler in logging.getLogger().handlers:
    handler.setFormatter(ColoredFormatter())

# Custom middleware to log requests
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Log the request details
        response = await call_next(request)
        log_function = logging.error if response.status_code >= 400 else logging.info
        log_function(f"{request.client.host} : {response.status_code} {request.method} {request.url}")
        return response

# Create FastAPI app
app = FastAPI()

# Add the logging middleware
app.add_middleware(LoggingMiddleware)

# Setup CORS
setup_cors(app)

# Include routers
app.include_router(sitemap.router, tags=["sitemap"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(blog_menu.router, prefix="/api/v1/blog-menu", tags=["blog menu"])
app.include_router(blog_content.router, prefix="/api/v1/blog-content", tags=["blog content"])
app.include_router(chatgpt.router, prefix="/api/v1/chatgpt", tags=["Chat GPT"])

es_service = ElasticsearchService()

@app.on_event("startup")
async def startup_event():
    logging.info("Application is starting up")
    await init_db()
    await es_service.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Application is shutting down")
    from tortoise import Tortoise
    await Tortoise.close_connections()

# Example endpoint
@app.get("/test")
async def test_endpoint():
    return {"message": "This is a test"}

if __name__ == "__main__":
    import uvicorn
    logging.info("Starting the application")
    uvicorn.run(app, host="0.0.0.0", port=8888)
