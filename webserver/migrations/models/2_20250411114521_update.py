from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "blog_menus" ADD "total_views" INT NOT NULL DEFAULT 1;
        ALTER TABLE "blog_contents" DROP COLUMN "total_views";
        """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "blog_menus" DROP COLUMN "total_views";"""
