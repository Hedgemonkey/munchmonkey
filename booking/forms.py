# FILE: booking/forms.py

from django import forms
from .models import Event

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
        fields = ['location', 'address', 'start', 'stop', 'info']
        widgets = {
            'location': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'start': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'stop': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'info': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }