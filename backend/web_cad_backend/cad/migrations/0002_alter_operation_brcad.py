# Generated by Django 5.0.1 on 2024-03-08 06:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cad', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='operation',
            name='brcad',
            field=models.BinaryField(),
        ),
    ]
