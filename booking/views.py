# FILE: booking/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Event, Booking
from .forms import LocationFilterForm, EventForm, BookingForm, ConfirmBookingForm
from datetime import timedelta, datetime
from django.utils import timezone
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

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
    events_with_slots = [(event, event.calculate_available_slots()) for event in events]
    form = EventForm()
    return render(request, 'booking/events_overview.html', {'events_with_slots': events_with_slots, 'form': form})

@login_required
def add_event(request):
    if request.method == 'POST':
        form = EventForm(request.POST)
        if form.is_valid():
            event = form.save(commit=False)
            if event.start < timezone.now():
                form.add_error('start', 'Start time cannot be before the current time.')
            elif event.stop < event.start:
                form.add_error('stop', 'Stop time cannot be before the start time.')
            else:
                event.save()
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
            event = form.save(commit=False)
            if event.start < timezone.now():
                form.add_error('start', 'Start time cannot be before the current time.')
            elif event.stop < event.start:
                form.add_error('stop', 'Stop time cannot be before the start time.')
            else:
                event.save()
                return redirect('events_overview')
    else:
        form = EventForm(instance=event)
    available_slots = event.calculate_available_slots()
    return render(request, 'booking/edit_event.html', {'form': form, 'event': event, 'available_slots': available_slots})

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

@login_required
def staff_bookings(request):
    bookings = Booking.objects.all().order_by('start_time')
    return render(request, 'booking/staff_bookings.html', {'bookings': bookings})

@login_required
def add_booking(request):
    events = Event.objects.all()
    if request.method == 'POST':
        print("Received POST request")
        form = BookingForm(request.POST)
        if form.is_valid():
            print("Form is valid")
            booking = form.save(commit=False)
            booking.user = request.user  # Set the user field
            event = booking.event
            tables_needed = (booking.number_of_people + 3) // 4
            print(f"Tables needed: {tables_needed}")
            if event.get_available_tables(booking.start_time) >= tables_needed:
                booking.end_time = booking.start_time + timedelta(minutes=44)
                booking.save()
                print(f"Booking added: {booking}")
                return redirect('staff_bookings')
            else:
                print("Not enough available tables for this booking")
                form.add_error(None, 'Not enough available tables for this booking.')
        else:
            print("Form is not valid")
            print(form.errors)
    else:
        print("Received GET request")
        form = BookingForm()
    return render(request, 'booking/add_booking.html', {'form': form, 'events': events})
@login_required
def confirm_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    if request.method == 'POST':
        print("Received POST request with data:", request.POST)
        form = ConfirmBookingForm(request.POST, instance=booking)
        if form.is_valid():
            booking.confirmed = form.cleaned_data['confirmed']
            booking.comments_staff = form.cleaned_data.get('comments_staff', '')
            print(f"Updating booking {booking_id} with comments_staff: {booking.comments_staff}")
            booking.save()
            return redirect('staff_bookings')
        else:
            print("Form is not valid")
            print(form.errors)
    else:
        form = ConfirmBookingForm(instance=booking)
    return render(request, 'booking/confirm_booking.html', {'form': form, 'booking': booking})
@login_required
def event_bookings(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    bookings = Booking.objects.filter(event=event).order_by('start_time')
    confirmed_bookings = bookings.filter(confirmed=True).count()
    booking_requests = bookings.filter(confirmed=False).count()
    available_slots = len(event.calculate_available_slots())
    return render(request, 'booking/event_bookings.html', {
        'event': event,
        'bookings': bookings,
        'confirmed_bookings': confirmed_bookings,
        'booking_requests': booking_requests,
        'available_slots': available_slots
    })

@login_required
def available_slots(request):
    event_id = request.GET.get('event_id')
    event = get_object_or_404(Event, id=event_id)
    available_slots = event.calculate_available_slots()
    slots = []
    for slot in available_slots:
        slots.append({
            'time': slot.strftime('%Y-%m-%d %H:%M'),
            'available': event.get_available_tables(slot) > 0
        })
    return JsonResponse({'available_slots': slots})

@login_required
def view_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    booking_details = {
        'event': booking.event.location,
        'user': booking.user.username,
        'start_time': booking.start_time.strftime('%Y-%m-%d %H:%M'),
        'end_time': booking.end_time.strftime('%Y-%m-%d %H:%M'),
        'number_of_people': booking.number_of_people,
        'confirmed': booking.confirmed,
        'comments_user': booking.comments_user,
        'comments_staff': booking.comments_staff,
    }
    print(f"Fetching booking {booking_id} with comments_staff: {booking.comments_staff}")
    return JsonResponse(booking_details)