from tortoise import fields, models

class BlogContent(models.Model):
    id = fields.IntField(pk=True)
    blog_menu = fields.ForeignKeyField('models.BlogMenu', related_name='blog_contents')
    title = fields.CharField(max_length=200)
    content = fields.TextField()
    author = fields.CharField(max_length=100)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "blog_contents"
