# FILE: booking/test_models.py

from django.test import TestCase
from booking.models import Event, Availability, Booking
from custom_auth.models import CustomUser
from django.utils import timezone

class EventModelTests(TestCase):

    def setUp(self):
        print("\nSetting up EventModelTests...")

    def test_create_event(self):
        print("Running test_create_event...")
        event = Event.objects.create(
            start=timezone.now(),
            stop=timezone.now() + timezone.timedelta(hours=2),
            available_slots=10,
            location='Test Location'
        )
        self.assertEqual(event.available_slots, 10, "\033[91mAssertion Failed: Available slots should be 10\033[0m")
        print("\033[92mPass: Available slots are correctly set to 10\033[0m")
        self.assertEqual(event.location, 'Test Location', "\033[91mAssertion Failed: Location should be 'Test Location'\033[0m")
        print("\033[92mPass: Location is correctly set to 'Test Location'\033[0m")
        self.assertTrue(event.start < event.stop, "\033[91mAssertion Failed: Event start time should be before stop time\033[0m")
        print("\033[92mPass: Event start time is correctly before stop time\033[0m")

class AvailabilityModelTests(TestCase):

    def setUp(self):
        print("\nSetting up AvailabilityModelTests...")

    def test_create_availability(self):
        print("Running test_create_availability...")
        event = Event.objects.create(
            start=timezone.now(),
            stop=timezone.now() + timezone.timedelta(hours=2),
            available_slots=10,
            location='Test Location'
        )
        availability = Availability.objects.create(
            event=event,
            booked=False,
            start=timezone.now(),
            stop=timezone.now() + timezone.timedelta(hours=1)
        )
        self.assertEqual(availability.event, event, "\033[91mAssertion Failed: Availability event should match the created event\033[0m")
        print("\033[92mPass: Availability event correctly matches the created event\033[0m")
        self.assertFalse(availability.booked, "\033[91mAssertion Failed: Availability should not be booked\033[0m")
        print("\033[92mPass: Availability is correctly not booked\033[0m")
        self.assertTrue(availability.start < availability.stop, "\033[91mAssertion Failed: Availability start time should be before stop time\033[0m")
        print("\033[92mPass: Availability start time is correctly before stop time\033[0m")

class BookingModelTests(TestCase):

    def setUp(self):
        print("\nSetting up BookingModelTests...")

    def test_create_booking(self):
        print("Running test_create_booking...")
        user = CustomUser.objects.create_user(
            username='testuser',
            first_name='Test',
            last_name='User',
            email='testuser@example.com',
            phone_number='1234567890',
            password='password123'
        )
        event = Event.objects.create(
            start=timezone.now(),
            stop=timezone.now() + timezone.timedelta(hours=2),
            available_slots=10,
            location='Test Location'
        )
        availability = Availability.objects.create(
            event=event,
            booked=False,
            start=timezone.now(),
            stop=timezone.now() + timezone.timedelta(hours=1)
        )
        booking = Booking.objects.create(
            user=user,
            booked_slot=availability,
            guests=2,
            confirmed=True,
            comments_user='Looking forward to it!',
            comments_staff='Confirmed by staff.'
        )
        self.assertEqual(booking.user, user, "\033[91mAssertion Failed: Booking user should match the created user\033[0m")
        print("\033[92mPass: Booking user correctly matches the created user\033[0m")
        self.assertEqual(booking.booked_slot, availability, "\033[91mAssertion Failed: Booking slot should match the created availability\033[0m")
        print("\033[92mPass: Booking slot correctly matches the created availability\033[0m")
        self.assertEqual(booking.guests, 2, "\033[91mAssertion Failed: Number of guests should be 2\033[0m")
        print("\033[92mPass: Number of guests is correctly set to 2\033[0m")
        self.assertTrue(booking.confirmed, "\033[91mAssertion Failed: Booking should be confirmed\033[0m")
        print("\033[92mPass: Booking is correctly confirmed\033[0m")
        self.assertEqual(booking.comments_user, 'Looking forward to it!', "\033[91mAssertion Failed: User comments should match\033[0m")
        print("\033[92mPass: User comments correctly match\033[0m")
        self.assertEqual(booking.comments_staff, 'Confirmed by staff.', "\033[91mAssertion Failed: Staff comments should match\033[0m")
        print("\033[92mPass: Staff comments correctly match\033[0m")