# FILE: booking/forms.py

from django import forms
from .models import Event

class LocationFilterForm(forms.Form):
    ALL_LOCATIONS = [('', 'All Locations')]
    ALL_DATES = [('', 'All Dates')]

    location_choices = ALL_LOCATIONS + [
        (loc, loc) for loc in Event.objects.values_list('location', flat=True).distinct()
    ]

    location = forms.ChoiceField(
        choices=location_choices,
        required=False,
        label='Select by Location'
    )
    date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'id': 'id_date'}),
        label='Select by Date'
    )