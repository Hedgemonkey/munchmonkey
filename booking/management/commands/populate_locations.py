# FILE: booking/management/commands/populate_locations.py

from django.core.management.base import BaseCommand
from booking.models import Event
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Populate the database with locations from Bristol, UK and surrounding areas'

    def handle(self, *args, **kwargs):
        locations = [
            'Bristol City Centre',
            'Clifton',
            'Redcliffe',
            'Stokes Croft',
            'Harbourside',
            'Temple Meads',
            'Bedminster',
            'Southville',
            'Totterdown',
            'Montpelier',
            'Cotham',
            'Redland',
            'St. Pauls',
            'Easton',
            'St. Werburghs',
            'Bishopston',
            'Horfield',
            'Filton',
            'St. George',
            'Kingswood',
            'Hanham',
            'Long Ashton',
            'Keynsham',
            'Portishead',
            'Clevedon',
            'Weston-super-Mare',
            'Yate',
            'Thornbury',
            'Bradley Stoke',
            'Patchway'
        ]

        for location in locations:
            start_time = timezone.now() + timezone.timedelta(days=random.randint(1, 30))
            stop_time = start_time + timezone.timedelta(hours=2)
            Event.objects.create(
                start=start_time,
                stop=stop_time,
                available_slots=random.randint(5, 20),
                location=location
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated the database with locations'))