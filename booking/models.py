# FILE: booking/models.py
from django.db import models
from django.utils import timezone
from custom_auth.models import CustomUser  # Import CustomUser model
from datetime import timedelta, datetime

class Event(models.Model):
    location = models.CharField(max_length=255)
    address = models.CharField(max_length=255, blank=True, null=True)
    start = models.DateTimeField()
    stop = models.DateTimeField()
    info = models.TextField(blank=True, null=True)
    event_tables = models.IntegerField(default=0)  # Updated field

    def __str__(self):
        return f"{self.location} ({self.start} - {self.stop})"

    def calculate_available_slots(self):
        slots = []
        current_time = self.start
        while current_time <= self.stop:
            slots.append(current_time)
            current_time += timedelta(minutes=15)
        return slots

    def get_available_tables(self, slot):
        # Check for confirmed bookings that start 30 minutes before to 30 minutes after the slot
        overlapping_bookings = Booking.objects.filter(
            event=self,
            start_time__gte=slot - timedelta(minutes=30),
            start_time__lt=slot + timedelta(minutes=45),
            confirmed=True  # Only count confirmed bookings
        )
        tables_occupied = sum((booking.number_of_people + 3) // 4 for booking in overlapping_bookings)
        available_tables = self.event_tables - tables_occupied
        return available_tables


class Booking(models.Model):
    id = models.AutoField(primary_key=True)  # Primary ID Unique field
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Link to CustomUser model
    confirmed = models.BooleanField(default=False)  # Confirmed field of type Boolean
    canceled = models.BooleanField(default=False) # Canceled field of type Boolean
    comments_user = models.CharField(max_length=1024, blank=True, null=True)  # Comments from user
    comments_staff = models.CharField(max_length=1024, blank=True, null=True)  # Comments from staff
    event = models.ForeignKey(Event, on_delete=models.CASCADE)  # Link to Event model
    start_time = models.DateTimeField()  # Start time of the booking
    end_time = models.DateTimeField()  # End time of the booking
    number_of_people = models.IntegerField()  # Number of people for the booking

    @property
    def tables(self):
        return (self.number_of_people + 3) // 4

    def save(self, *args, **kwargs):
        # Ensure the start_time and end_time are naive
        if self.start_time.tzinfo is not None:
            self.start_time = self.start_time.replace(tzinfo=None)
        if self.end_time.tzinfo is not None:
            self.end_time = self.end_time.replace(tzinfo=None)

        # If the booking is being canceled, skip the slot availability check
        if self.canceled:
            super().save(*args, **kwargs)
            return {'status': 'success'}

        # Set the end time to 44 minutes after the start time
        self.end_time = self.start_time + timedelta(minutes=44)
        
        # Calculate the number of tables needed
        tables_needed = self.tables
        
        # Check if there are enough available tables
        available_slots = self.event.calculate_available_slots()
        for slot in available_slots:
            # Convert slot to naive datetime
            slot_naive = slot.replace(tzinfo=None)
            if slot_naive <= self.start_time < slot_naive + timedelta(minutes=45):
                # Check if the slot is available
                if self.event.get_available_tables(slot) < tables_needed:
                    return {'status': 'error', 'message': 'Not enough available tables for this booking.'}
        super().save(*args, **kwargs)
        return {'status': 'success'}

    def __str__(self):
        return f"Booking {self.id} for {self.event.location} by {self.user.username}"