# Generated by Django 5.2 on 2025-04-13 00:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_remove_customuser_firebase_uid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(choices=[('citizen', 'Citizen'), ('law_enforcement', 'Law Enforcement'), ('admin', 'Admin')], max_length=20),
        ),
    ]
