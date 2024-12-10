from tortoise import Tortoise
from app.core.config import settings

async def init_db():
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={'models': ['app.models.user', 'app.models.blog_menu', 'app.models.blog_content', 'app.models.attachment']},
    )
    await Tortoise.generate_schemas()

