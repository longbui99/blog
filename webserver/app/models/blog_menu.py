from tortoise import fields, models

class BlogMenu(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=100)
    path = fields.CharField(max_length=100)
    parent = fields.CharField(max_length=100, null=True)
    sequence = fields.IntField()
    component = fields.CharField(max_length=100)
    short_name = fields.CharField(max_length=50)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "blog_menus"

    def __str__(self):
        return self.title
