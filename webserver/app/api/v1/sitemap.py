from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import PlainTextResponse
from app.core.responses import XMLResponse  # Use our custom XMLResponse
from datetime import datetime
from typing import List, Dict
from app.core.config import settings
from app.utils.sitemap import SitemapGenerator
from app.models.blog_menu import BlogMenu
from tortoise.transactions import atomic
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Cache the generated sitemap content instead of the coroutine
class SitemapCache:
    def __init__(self):
        self.content: str = ""
        self.timestamp: str = ""

# Create a single cache instance
sitemap_cache = SitemapCache()

async def generate_sitemap() -> str:
    """Generate the sitemap content."""
    try:
        generator = SitemapGenerator(base_url="https://blog.longbui.net")
        
        # Get all blog posts using Tortoise ORM
        blog_posts = await BlogMenu.all().order_by('created_at')
        
        urls = [
            {
                "path": "",
                "lastmod": datetime.now(),
                "changefreq": "daily",
                "priority": 1.0
            }
        ]
        
        # Add blog posts to sitemap
        for post in blog_posts:
            urls.append({
                "path": post.path,
                "lastmod": post.updated_at or post.created_at,
                "changefreq": "weekly",
                "priority": 0.8
            })
        
        return generator.generate_sitemap(urls)
    except Exception as e:
        logger.error(f"Error generating sitemap content: {str(e)}")
        raise

@router.get("/sitemap.xml", response_class=XMLResponse)
@atomic()  # Use transaction if needed
async def get_sitemap(response: Response):
    try:
        current_timestamp = datetime.now().strftime("%Y-%m-%d-%H")
        logger.info(f"Generating sitemap for timestamp: {current_timestamp}")
        
        response.headers["Cache-Control"] = "public, max-age=3600"
        sitemap_content = await generate_sitemap()
        
        logger.info("Sitemap generated successfully")
        return XMLResponse(content=sitemap_content)
    except Exception as e:
        logger.error(f"Error generating sitemap: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating sitemap: {str(e)}"
        )

@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots():
    robots_content = f"""User-agent: *
Allow: /
Sitemap: https://blog.longbui.net/sitemap.xml
"""
    return PlainTextResponse(content=robots_content)
