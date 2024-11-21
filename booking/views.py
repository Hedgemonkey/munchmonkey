# FILE: booking/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Event, Booking
from .forms import LocationFilterForm, EventForm
from datetime import timedelta, datetime

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
    if request.method == 'POST':
        form = EventForm(request.POST, instance=event)
        if form.is_valid():
            form.save()
            return redirect('events_overview')
    else:
        form = EventForm(instance=event)
    available_slots = event.calculate_available_slots()
    return render(request, 'booking/edit_event.html', {'form': form, 'event': event, 'available_slots': available_slots})

@login_required
def save_event(request, event_id):
    if request.method == 'POST':
        event = get_object_or_404(Event, id=event_id)
        form = EventForm(request.POST, instance=event)
        if form.is_valid():
            form.save()
            return redirect('events_overview')
    return redirect('edit_event', event_id=event_id)

@login_required
def remove_event(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    event.delete()
    return redirect('events_overview')

@login_required
def remove_selected_events(request):
    if request.method == 'POST':
        event_ids = request.POST.getlist('selected_events')
        for event_id in event_ids:
            event = get_object_or_404(Event, id=event_id)
            event.delete()
    return redirect('events_overview')

@login_required
def book_slot(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    if request.method == 'POST':
        start_time = request.POST.get('start_time')
        number_of_people = int(request.POST.get('number_of_people'))
        start_time = datetime.strptime(start_time, '%Y-%m-%dT%H:%M')
        end_time = start_time + timedelta(minutes=44)
        tables_needed = (number_of_people + 3) // 4

        # Check if the slot is available
        if event.get_available_tables(start_time) >= tables_needed:
            Booking.objects.create(
                user=request.user,
                event=event,
                start_time=start_time,
                end_time=end_time,
                number_of_people=number_of_people
            )
            return redirect('events_overview')
        else:
            return render(request, 'booking/book_slot.html', {'event': event, 'error': 'Not enough available tables for this booking.'})
    available_slots = event.calculate_available_slots()
    return render(request, 'booking/book_slot.html', {'event': event, 'available_slots': available_slots})