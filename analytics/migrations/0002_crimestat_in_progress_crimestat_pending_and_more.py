# Generated by Django 5.1.8 on 2025-04-19 09:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='crimestat',
            name='in_progress',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='crimestat',
            name='pending',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='crimestat',
            name='rejected',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='crimestat',
            name='resolved',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
