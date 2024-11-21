# FILE: booking/forms.py

from django import forms
from .models import Event, Booking

class LocationFilterForm(forms.Form):
    ALL_LOCATIONS = [('', 'All Locations')]
    ALL_DATES = [('', 'All Dates')]

    location = forms.ChoiceField(
        choices=[],
        required=False,
        label='Select by Location'
    )
    date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'id': 'id_date'}),
        label='Select by Date'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        location_choices = self.ALL_LOCATIONS + [
            (loc, loc) for loc in Event.objects.values_list('location', flat=True).distinct()
        ]
        self.fields['location'].choices = location_choices

class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = ['location', 'address', 'start', 'stop', 'info', 'event_tables']
        widgets = {
            'location': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'start': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'stop': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'info': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'event_tables': forms.NumberInput(attrs={'class': 'form-control'}),
        }

class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['event', 'start_time', 'number_of_people']
        widgets = {
            'event': forms.Select(attrs={'class': 'form-control'}),
            'start_time': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'number_of_people': forms.NumberInput(attrs={'class': 'form-control'}),
        }

class ConfirmBookingForm(forms.ModelForm):
    confirmed = forms.BooleanField(required=False)

    class Meta:
        model = Booking
        fields = ['confirmed']
        widgets = {
            'confirmed': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }