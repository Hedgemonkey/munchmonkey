# FILE: booking/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Event
from .forms import LocationFilterForm, EventForm

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

@login_required
def staff_dashboard(request):
    return render(request, 'booking/staff_dashboard.html')

@login_required
def events_overview(request):
    events = Event.objects.all().order_by('start')
    form = EventForm()
    return render(request, 'booking/events_overview.html', {'events': events, 'form': form})

@login_required
def add_event(request):
    if request.method == 'POST':
        form = EventForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('events_overview')
    else:
        form = EventForm()
    return render(request, 'booking/add_event.html', {'form': form})

@login_required
def edit_event(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    available_slots = event.available_slots()
    return render(request, 'booking/edit_event.html', {'event': event, 'available_slots': available_slots})

@login_required
def save_event(request, event_id):
    if request.method == 'POST':
        event = get_object_or_404(Event, id=event_id)
        event.location = request.POST.get('location')
        event.start = request.POST.get('start')
        event.stop = request.POST.get('stop')
        event.save()
        return redirect('events_overview')

@login_required
def remove_event(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    event.delete()
    return redirect('events_overview')

@login_required
def remove_selected_events(request):
    if request.method == 'POST':
        print(f"POST data: {request.POST}")  # Debugging statement to print all POST data
        event_ids = request.POST.getlist('selected_events[]')
        print(f"Removing events with IDs: {event_ids}")  # Debugging statement
        if event_ids:
            Event.objects.filter(id__in=event_ids).delete()
            print(f"Successfully removed events with IDs: {event_ids}")  # Debugging statement
        else:
            print("No event IDs received.")  # Debugging statement
    return redirect('events_overview')