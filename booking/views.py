# FILE: booking/views.py

from django.shortcuts import render
from .models import Event
from .forms import LocationFilterForm

def locations(request):
    form = LocationFilterForm(request.GET or None)
    events = Event.objects.all()

    if form.is_valid():
        if form.cleaned_data['location']:
            events = events.filter(location=form.cleaned_data['location'])
        if form.cleaned_data['date']:
            events = events.filter(start__date=form.cleaned_data['date'])

    events = events.order_by('start')

    return render(request, 'booking/locations.html', {'form': form, 'events': events})