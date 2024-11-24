from django.test import TestCase
from custom_auth.models import CustomUser  # Import the custom user model
from booking.models import Event, Booking  # Import the Event and Booking models
from datetime import datetime, timedelta

class EventModelTests(TestCase):

    def setUp(self):
        self.event = Event.objects.create(
            location='Test Location',
            address='123 Test St',
            start=datetime.now() + timedelta(days=1),
            stop=datetime.now() + timedelta(days=1, hours=2),
            info='Test Event Info',
            event_tables=10
        )

    def test_event_creation(self):
        self.assertEqual(self.event.location, 'Test Location')
        self.assertEqual(self.event.address, '123 Test St')
        self.assertEqual(self.event.info, 'Test Event Info')
        self.assertEqual(self.event.event_tables, 10)

    def test_event_str(self):
        self.assertEqual(str(self.event), f"{self.event.location} ({self.event.start} - {self.event.stop})")

    def test_event_calculate_available_slots(self):
        slots = self.event.calculate_available_slots()
        self.assertTrue(len(slots) > 0)

    def test_event_get_available_tables(self):
        slot = self.event.start + timedelta(minutes=15)
        available_tables = self.event.get_available_tables(slot)
        self.assertEqual(available_tables, 10)


class BookingModelTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpassword')
        self.event = Event.objects.create(
            location='Test Location',
            address='123 Test St',
            start=datetime.now() + timedelta(days=1),
            stop=datetime.now() + timedelta(days=1, hours=2),
            info='Test Event Info',
            event_tables=10
        )
        self.booking = Booking.objects.create(
            user=self.user,
            event=self.event,
            start_time=self.event.start,
            end_time=self.event.start + timedelta(minutes=44),
            number_of_people=4,
            confirmed=True
        )

    def test_booking_creation(self):
        self.assertEqual(self.booking.user, self.user)
        self.assertEqual(self.booking.event, self.event)
        self.assertEqual(self.booking.number_of_people, 4)
        self.assertTrue(self.booking.confirmed)

    def test_booking_str(self):
        self.assertEqual(str(self.booking), f"Booking {self.booking.id} for {self.event.location} by {self.user.username}")

    def test_booking_tables(self):
        self.assertEqual(self.booking.tables, 1)

    def test_booking_save(self):
        self.booking.save()
        self.assertEqual(self.booking.end_time, self.booking.start_time + timedelta(minutes=44))