# FILE: booking/models.py
from django.db import models
from django.utils import timezone
from custom_auth.models import CustomUser  # Import CustomUser model

class Event(models.Model):
    id = models.AutoField(primary_key=True)  # Primary ID Unique field
    start = models.DateTimeField()  # Start field of type DateTime
    stop = models.DateTimeField()  # Stop field of type DateTime
    available_slots = models.IntegerField()  # Available slots field of type Integer
    location = models.CharField(max_length=255)  # Location field of type CharField

    def __str__(self):
        return f"Event {self.id} at {self.location} from {self.start} to {self.stop}"

class Availability(models.Model):
    id = models.AutoField(primary_key=True)  # Primary ID Unique field
    event = models.ForeignKey(Event, on_delete=models.CASCADE)  # Link to Event model
    booked = models.BooleanField(default=False)  # Booked field of type Boolean
    start = models.DateTimeField()  # Start field of type DateTime
    stop = models.DateTimeField()  # Stop field of type DateTime

    def __str__(self):
        return f"Availability for Event {self.event.id} from {self.start} to {self.stop}, Booked: {self.booked}"

class Booking(models.Model):
    id = models.AutoField(primary_key=True)  # Primary ID Unique field
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Link to CustomUser model
    booked_slot = models.ForeignKey(Availability, on_delete=models.CASCADE)  # Link to Availability model
    guests = models.IntegerField()  # Guests field of type Integer
    confirmed = models.BooleanField(default=False)  # Confirmed field of type Boolean
    comments_user = models.CharField(max_length=1024, blank=True, null=True)  # Comments from user
    comments_staff = models.CharField(max_length=1024, blank=True, null=True)  # Comments from staff

    def __str__(self):
        return f"Booking by {self.user.username} for Availability {self.booked_slot.id}, Confirmed: {self.confirmed}"