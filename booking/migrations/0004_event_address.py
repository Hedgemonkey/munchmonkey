# Generated by Django 5.1.3 on 2024-11-21 00:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0003_remove_availability_booked_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
