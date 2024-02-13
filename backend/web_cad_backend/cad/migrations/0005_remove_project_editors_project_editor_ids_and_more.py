# Generated by Django 5.0.1 on 2024-02-13 09:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cad', '0004_remove_operation_operator_operation_operator_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='editors',
        ),
        migrations.AddField(
            model_name='project',
            name='editor_ids',
            field=models.JSONField(default=[]),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='project',
            name='operation_history_ids',
            field=models.JSONField(),
        ),
    ]
