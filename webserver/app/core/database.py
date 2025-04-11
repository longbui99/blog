from tortoise import Tortoise
from app.core.config import settings

# Unified Tortoise ORM config
TORTOISE_ORM = {
    "connections": {"default": settings.DATABASE_URL},
    "apps": {
        "models": {
            "models": ['app.models.user', 'app.models.blog_menu', 'app.models.blog_content', 'app.models.attachment'],
            "default_connection": "default",
        },
    },
}

async def init_db():
    # Use the same config from TORTOISE_ORM
    await Tortoise.init(
        db_url=TORTOISE_ORM["connections"]["default"],
        modules={"models": TORTOISE_ORM["apps"]["models"]["models"]},
    )
    await Tortoise.generate_schemas()

