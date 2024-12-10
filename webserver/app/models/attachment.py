from tortoise import fields, models

class Attachment(models.Model):
    id = fields.IntField(pk=True)
    filename = fields.CharField(max_length=255)
    original_filename = fields.CharField(max_length=255)
    menu = fields.ForeignKeyField('models.BlogMenu', related_name='attachments')
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "attachments"

    def __str__(self):
        return self.filename 