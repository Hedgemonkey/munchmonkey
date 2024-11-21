# FILE: booking/models.py
from django.db import models
from django.utils import timezone
from custom_auth.models import CustomUser  # Import CustomUser model

class Event(models.Model):
    id = models.AutoField(primary_key=True)  # Primary ID Unique field
    start = models.DateTimeField()  # Start field of type DateTime
    stop = models.DateTimeField()  # Stop field of type DateTime
    location = models.CharField(max_length=255)  # Location field of type CharField
    address = models.CharField(max_length=255, blank=True, null=True)  # Address field of type CharField
    info = models.TextField(blank=True, null=True)  # Information field of type TextField

    def __str__(self):
        return f"Event {self.id} at {self.location} from {self.start} to {self.stop}"

    def available_slots(self):
        return self.availability_set.filter(booking__isnull=True).count()

class Availability(models.Model):
    id = models.AutoField(primary_key=True)  # Primary ID Unique field
    event = models.ForeignKey(Event, on_delete=models.CASCADE)  # Link to Event model
    start = models.DateTimeField()  # Start field of type DateTime
    stop = models.DateTimeField()  # Stop field of type DateTime

    def __str__(self):
        return f"Availability for Event {self.event.id} from {self.start} to {self.stop}"

    def is_booked(self):
        return hasattr(self, 'booking')

class Booking(models.Model):
    id = models.AutoField(primary_key=True)  # Primary ID Unique field
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Link to CustomUser model
    booked_slot = models.OneToOneField(Availability, on_delete=models.CASCADE)  # Link to Availability model
    guests = models.IntegerField()  # Guests field of type Integer
    confirmed = models.BooleanField(default=False)  # Confirmed field of type Boolean
    comments_user = models.CharField(max_length=1024, blank=True, null=True)  # Comments from user
    comments_staff = models.CharField(max_length=1024, blank=True, null=True)  # Comments from staff

    def __str__(self):
        return f"Booking {self.id} for Availability {self.booked_slot.id}"

    def save(self, *args, **kwargs):
        if self.confirmed:
            self.booked_slot.booked = True
            self.booked_slot.save()
        super().save(*args, **kwargs)