# MunchMonkey Pop-Up Restaurant

The MunchMonkey Pop-Up Restaurant site is intended to be used for marketing and promotional purposes for the pop-up restaurant **MunchMonkey**, providing users with an easy way to view the locations and times that the restaurant will be available, as well as the menu items that will be available. They will also be able to register an account in order to make reservations and provide reviews and feedback!

## Contents

<details>
<summary>Click here for Table of Contents</summary>

- [Project Goals](#project-goals)

- [User Experience](#user-experience)<details><summary>Click to expand User Experience</summary>

  - [Epics](#epics)
  - [User Stories](#user-stories)
  - [Site Structure](#site-structure)<details><summary>Click to expand Site Structure</summary>

    - [Database Schema](#database-schema)
    - [Wireframes](#wireframes)
    </details>
  - [Design Choices](#design-choices)<details><summary>Click to expand Design Choices</summary>

    - [Typography](#typography)
    - [Colours](#colours)
    </details>  
  </details>

- [Agile Project Management](#agile-project-management)

- [Features](#features)

- [Testing](#testing)

- [Deployment](#deployment)

- [Credits](#credits)

</details>

## Project Goals

This site is designed for a fictional Pop-Up Restraunt company called **MunchMonkey** to provide it with a way to take online reservations and allow potential patrons to view the times and locations that the restaurant will be availiable. There is also functionaity for the management to view reservation requests and confirm that the reservation has been made. The management will also be able to add/remove additional dates and locations that they may be available.

The customers will also be able to see the Menus that will be availiable at any given date. Upon requesting a reservation the contact details of the customer will be viewable by the management in case there is a need to contact them. Customrs will be able to cancel the reservation given enough notice and this change will be updated accordingly.

[Back to top](#contents)

## User Experience

### Epics

The epics of this project are listed below

- Initial Django Setup
- User Access
- Templates, Navigation and Styles
- Implementing Tests
- Booking Management

[Back to top](#contents)

## Site Structure

### Overview

Below is an overview of the site structure for the MunchMonkey project. The site is designed to allow users to view event locations and times, and to make reservations. The site also includes functionality for management to view and confirm reservations, manage the users, and manage event dates and locations.

### Home

The home page provides an introduction to MunchMonkey and highlights upcoming events.

### About

The about page provides information about MunchMonkey.

### Munch

The munch page provides information about the menu items available at upcoming events.

### Events

The events page allows users to view event locations and times, and filter events by location and date.

### Reservations

The reservations page allows users to make reservations for upcoming events.

### Account

The account page allows users to view and manage their account details, including their reservations.

### Admin

The admin pages allow management to view and confirm reservations, manage the users, and manage event dates and locations.

### Additional Information

- **Home**: The landing page of the site, providing an introduction and highlighting upcoming events.
- **About**: Information about MunchMonkey.
- **Munch**: Details about the menu items available at upcoming events.
- **Events**: A list of upcoming events with filtering options.
- **Reservations**: A form for users to make reservations for events.
- **Account**: User account management, including viewing and managing reservations and reviews.
- **Admin**: Management menu for viewing and confirming reservations, managing users, and managing event dates and locations.

[Back to top](#contents)

## Database Schema

### Overview

This document provides an overview of the database models used in the project. The models are defined in the `custom_auth` and `booking` apps. The `custom_auth` app contains a custom user model, while the `booking` app contains models for events and bookings.

### CustomUser Model

The `CustomUser` model extends Django's `AbstractUser` to include additional fields and relationships.

```python
# FILE: custom_auth/models.py
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set',  # Add related_name to avoid conflict
        blank=True,
        help_text='The groups this user belongs to.',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',  # Add related_name to avoid conflict
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='customuser',
    )

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
```

[Back to top](#contents)

#### Fields

- **phone_number**: A `CharField` to store the user's phone number. It is optional.
- **groups**: A many-to-many relationship with the `Group` model, with a custom `related_name` to avoid conflicts.
- **user_permissions**: A many-to-many relationship with the `Permission` model, with a custom `related_name` to avoid conflicts.

[Back to top](#contents)

### Event Model

The `Event` model represents an event at a specific location and time, with a certain number of tables available for booking.

```python
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
```

#### Fields

- **location**: A `CharField` to store the event location.
- **address**: A `CharField` to store the event address. It is optional.
- **start**: A `DateTimeField` to store the start time of the event.
- **stop**: A `DateTimeField` to store the end time of the event.
- **info**: A `TextField` to store additional information about the event. It is optional.
- **event_tables**: An `IntegerField` to store the number of tables available for the event.

#### Methods

- **__str__**: Returns a string representation of the event.
- **calculate_available_slots**: Calculates and returns a list of available time slots for the event.
- **get_available_tables**: Returns the number of available tables for a given time slot.

[Back to top](#contents)

### Booking Model

The `Booking` model represents a booking made by a user for a specific event.

```python
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
```

[Back to top](#contents)

#### Fields

- **id**: An `AutoField` that serves as the primary key.
- **user**: A foreign key linking to the `CustomUser` model.
- **confirmed**: A `BooleanField` indicating whether the booking is confirmed.
- **canceled**: A `BooleanField` indicating whether the booking is canceled.
- **comments_user**: A `CharField` for user comments. It is optional.
- **comments_staff**: A `CharField` for staff comments. It is optional.
- **event**: A foreign key linking to the `Event` model.
- **start_time**: A `DateTimeField` for the start time of the booking.
- **end_time**: A `DateTimeField` for the end time of the booking.
- **number_of_people**: An `IntegerField` for the number of people in the booking.

#### Methods

- **tables**: A property that calculates the number of tables needed based on the number of people.
- **save**: Overrides the default save method to ensure the start and end times are naive and to check table availability.
- **__str__**: Returns a string representation of the booking.

[Back to top](#contents)

### Database Schema

```plaintext
+------------------+       +------------------+       +------------------+
| CustomUser       |       | Event            |       | Booking          |
+------------------+       +------------------+       +------------------+
| id (PK)          |<----->| id (PK)          |<----->| id (PK)          |
| username         |       | location         |       | user_id (FK)     |
| email            |       | address          |       | event_id (FK)    |
| phone_number     |       | start            |       | confirmed        |
| password         |       | stop             |       | canceled         |
| groups (M2M)     |       | info             |       | comments_user    |
| user_permissions |       | event_tables     |       | comments_staff   |
+------------------+       +------------------+       | start_time       |
                                                      | end_time         |
                                                      | number_of_people |
                                                      +------------------+
```

[Back to top](#contents)

## Testing

### Overview

The testing suite for this project includes unit tests for the `Event` and `Booking` models. These tests ensure that the models behave as expected and that their methods return the correct results. The tests are written using Django's built-in testing framework.

### EventModelTests

The `EventModelTests` class contains tests for the `Event` model. This model represents an event at a specific location and time, with a certain number of tables available for booking.

1. **test_event_creation**: 
   - **Purpose**: Verifies that an `Event` instance is created with the correct attributes.
   - **Details**: This test checks that the `location`, `address`, `info`, and `event_tables` fields are correctly set when an `Event` instance is created.

2. **test_event_str**: 
   - **Purpose**: Checks the string representation of the `Event` instance.
   - **Details**: This test ensures that the `__str__` method of the `Event` model returns a string in the format "Location (start - stop)".

3. **test_event_calculate_available_slots**: 
   - **Purpose**: Ensures that the `calculate_available_slots` method returns a non-empty list of slots.
   - **Details**: This test verifies that the method correctly calculates and returns a list of available time slots for the event.

4. **test_event_get_available_tables**: 
   - **Purpose**: Verifies that the `get_available_tables` method returns the correct number of available tables.
   - **Details**: This test checks that the method correctly calculates the number of available tables for a given time slot, taking into account any overlapping bookings.

[Back to top](#contents)

### BookingModelTests

The `BookingModelTests` class contains tests for the `Booking` model. This model represents a booking made by a user for a specific event.

1. **test_booking_creation**: 
   - **Purpose**: Verifies that a `Booking` instance is created with the correct attributes.
   - **Details**: This test checks that the `user`, `event`, `number_of_people`, and `confirmed` fields are correctly set when a `Booking` instance is created.

2. **test_booking_str**: 
   - **Purpose**: Checks the string representation of the `Booking` instance.
   - **Details**: This test ensures that the `__str__` method of the `Booking` model returns a string in the format "Booking {id} for {event.location} by {user.username}".

3. **test_booking_tables**: 
   - **Purpose**: Ensures that the `tables` property returns the correct number of tables needed for the booking.
   - **Details**: This test verifies that the `tables` property correctly calculates the number of tables needed based on the number of people in the booking.

4. **test_booking_save**: 
   - **Purpose**: Verifies that the `save` method correctly sets the `end_time` attribute.
   - **Details**: This test checks that the `save` method sets the `end_time` to 44 minutes after the `start_time` and correctly handles the availability of tables.

[Back to top](#contents)

## Credits

- Startbootstrap Business Casual Theme - [https://startbootstrap.com/theme/business-casual](https://startbootstrap.com/theme/business-casual)
- GitHub Copilot AI - [https://github.com/github/copilot-ai](https://github.com/github/copilot-ai) - Assisted me throught the project answering any questions I have had
- Gemini AI - [https://gemini.google.com/app](https://gemini.google.com/app) - for some Immage Generation
- Midjourney AI - [https://www.midjourney.com/home](https://www.midjourney.com/home) - For other image generation
- favicon.io - [https://favicon.io/](https://favicon.io/) - Free generation of FavIcon
- The Code Institute community, including fellow students and staff.
- My family, friends, and peers who have helped and supported me with suggestions and feedback during development.
[Back to top](#contents)