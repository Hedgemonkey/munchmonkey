# Generated by Django 5.1.3 on 2024-11-22 22:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0008_remove_booking_guests'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='canceled',
            field=models.BooleanField(default=False),
        ),
    ]
