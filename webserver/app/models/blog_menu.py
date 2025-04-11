from tortoise import fields, models
from tortoise.expressions import RawSQL
from tortoise.transactions import in_transaction

class BlogMenu(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=100)
    path = fields.CharField(max_length=100)
    parent = fields.CharField(max_length=100, null=True)
    sequence = fields.IntField()
    component = fields.CharField(max_length=100)
    description = fields.CharField(max_length=255, null=True)
    short_name = fields.CharField(max_length=50)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    is_published = fields.BooleanField(default=False)
    total_views = fields.IntField(default=1)

    class Meta:
        table = "blog_menus"

    def __str__(self):
        return self.title

    async def increment_views(self):
        """Increment total_views using raw SQL query"""
        async with in_transaction():
            conn = self._meta.db
            await conn.execute_query(
                "UPDATE blog_menus SET total_views = total_views + 1 WHERE id = $1",
                [self.id]
            )