# FILE: booking/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Event, Booking, CustomUser
from .forms import LocationFilterForm, EventForm, BookingForm, ConfirmBookingForm
from datetime import timedelta, datetime
from django.utils import timezone
from django.http import JsonResponse
import logging
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from .models import Event
import random
import string
import json

logger = logging.getLogger(__name__)

def staff_or_superuser_required(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)

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
@user_passes_test(staff_or_superuser_required)
def staff_dashboard(request):
    return render(request, 'booking/staff_dashboard.html')

# EVENTS
@login_required
@user_passes_test(staff_or_superuser_required)
def events_overview(request):
    events = Event.objects.all().order_by('start')
    events_with_slots = [(event, event.calculate_available_slots()) for event in events]
    form = EventForm()
    return render(request, 'booking/events_overview.html', {'events_with_slots': events_with_slots, 'form': form})

@login_required
@user_passes_test(staff_or_superuser_required)
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
@user_passes_test(staff_or_superuser_required)
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
@user_passes_test(staff_or_superuser_required)
def remove_event(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    event.delete()
    return redirect('events_overview')

@login_required
@user_passes_test(staff_or_superuser_required)
def remove_selected_events(request):
    if request.method == 'POST':
        event_ids = request.POST.getlist('selected_events')
        for event_id in event_ids:
            event = get_object_or_404(Event, id=event_id)
            event.delete()
    return redirect('events_overview')

# BOOKINGS
@login_required
@user_passes_test(staff_or_superuser_required)
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
@user_passes_test(staff_or_superuser_required)
def staff_bookings(request):
    bookings = Booking.objects.all().order_by('start_time')
    return render(request, 'booking/staff_bookings.html', {'bookings': bookings})

@login_required
@user_passes_test(staff_or_superuser_required)
def add_booking(request):
    events = Event.objects.all()
    users = CustomUser.objects.all()
    if request.method == 'POST':
        print("Received POST request")
        form = BookingForm(request.POST)
        if form.is_valid():
            print("Form is valid")
            booking = form.save(commit=False)
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
    return render(request, 'booking/add_booking.html', {'form': form, 'events': events, 'users': users})

@login_required
@user_passes_test(staff_or_superuser_required)
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
@user_passes_test(staff_or_superuser_required)
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

@require_GET
@user_passes_test(staff_or_superuser_required)
def available_slots(request):
    event_id = request.GET.get('event_id')
    event = get_object_or_404(Event, id=event_id)
    slots = event.calculate_available_slots()
    available_slots = []

    for slot in slots:
        available_tables = event.get_available_tables(slot)
        available_slots.append({
            'time': slot.strftime('%Y-%m-%d %H:%M'),
            'available_tables': available_tables,
            'available': available_tables > 0
        })

    return JsonResponse({'available_slots': available_slots})

@login_required
@user_passes_test(staff_or_superuser_required)
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
        'user_phone': booking.user.phone_number,  # Assuming phone_number is a field in CustomUser model
        'user_email': booking.user.email,  # Assuming email is a field in CustomUser model
    }
    return JsonResponse(booking_details)

# USERS
@login_required
@user_passes_test(staff_or_superuser_required)
def create_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        phone = data.get('phone')
        email = data.get('email')

        if not first_name or not last_name or not phone:
            return JsonResponse({'success': False, 'error': 'First name, last name, and phone number are required.'})

        username = f"{first_name}{last_name}".lower()
        while CustomUser.objects.filter(username=username).exists():
            username = f"{first_name}{last_name}{''.join(random.choices(string.digits, k=4))}".lower()

        user = CustomUser.objects.create(
            username=username,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            email=email
        )

        return JsonResponse({'success': True, 'user_id': user.id, 'username': user.username})

    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

@login_required
@user_passes_test(staff_or_superuser_required)
def user_management(request):
    return render(request, 'booking/user_management.html')

@login_required
@user_passes_test(staff_or_superuser_required)
def list_users(request):
    users = CustomUser.objects.all()
    user_list = [{
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'username': user.username,
        'email': user.email,
        'phone': user.phone_number,
        'role': 'Manager' if user.is_superuser else 'Staff' if user.is_staff else 'Customer',
        'is_manager': request.user.is_superuser,
        'bookings': [{
            'id': booking.id,
            'event_location': booking.event.location,  # Access the location field from the linked Event table
            'start_time': booking.start_time,
            'guests': booking.number_of_people,  # Use 'number_of_people' for guests
            'tables': (booking.number_of_people + 3) // 4,  # Calculate the number of tables needed
            'status': 'Confirmed' if booking.confirmed else 'Requested'  # Determine the status
        } for booking in Booking.objects.filter(user=user)]
    } for user in users]
    return JsonResponse({'users': user_list})

@login_required
@user_passes_test(staff_or_superuser_required)
def user_details(request, user_id):
    user = CustomUser.objects.get(id=user_id)
    user_data = {
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'username': user.username,
        'email': user.email,
        'phone': user.phone_number,
        'role': 'Manager' if user.is_superuser else 'Staff' if user.is_staff else 'Customer',
        'bookings': [{
            'id': booking.id,
            'event_location': booking.event.location,  # Access the location field from the linked Event table
            'start_time': booking.start_time,
            'guests': booking.number_of_people,  # Use 'number_of_people' for guests
            'tables': (booking.number_of_people + 3) // 4,  # Calculate the number of tables needed
            'status': 'Confirmed' if booking.confirmed else 'Requested'  # Determine the status
        } for booking in Booking.objects.filter(user=user)]
    }
    return JsonResponse(user_data)

@login_required
@user_passes_test(staff_or_superuser_required)
def change_user_role(request, user_id):
    if request.method == 'POST' and request.user.is_superuser:
        user = CustomUser.objects.get(id=user_id)
        new_role = request.POST.get('role')
        print(f"Received POST data: {request.POST}")
        print(f"Changing role for user {user_id} to {new_role}")
        if new_role == 'Manager':
            user.is_superuser = True
            user.is_staff = True
        elif new_role == 'Staff':
            user.is_superuser = False
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = False
        user.save()
        print(f"Role changed successfully for user {user_id}")
        return JsonResponse({'status': 'success'})
    print(f"Failed to change role for user {user_id}")
    return JsonResponse({'status': 'error'}, status=400)

@login_required
@user_passes_test(staff_or_superuser_required)
def edit_user_details(request, user_id):
    if request.method == 'POST' and request.user.is_superuser:
        user = CustomUser.objects.get(id=user_id)
        user.first_name = request.POST.get('first_name')
        user.last_name = request.POST.get('last_name')
        user.username = request.POST.get('username')
        user.email = request.POST.get('email')
        user.phone_number = request.POST.get('phone')
        user.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)

@login_required
@user_passes_test(staff_or_superuser_required)
def booking_detail(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    user = booking.user

    # Calculate booking statistics
    current_time = timezone.now()
    upcoming_bookings = Booking.objects.filter(user=user, start_time__gt=current_time)
    confirmed_upcoming_bookings = upcoming_bookings.filter(confirmed=True)
    unconfirmed_upcoming_bookings = upcoming_bookings.filter(confirmed=False)
    total_bookings = Booking.objects.filter(user=user)
    total_confirmed_bookings = total_bookings.filter(confirmed=True)
    total_unconfirmed_bookings = total_bookings.filter(confirmed=False)

    context = {
        'booking': {
            'event_location': booking.event.location,
            'start_time': booking.start_time,
            'guests': booking.number_of_people,
            'tables': (booking.number_of_people + 3) // 4,
            'status': 'Confirmed' if booking.confirmed else 'Unconfirmed',
            'user': {
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'phone': user.phone_number,
                'upcoming_bookings_count': upcoming_bookings.count(),
                'confirmed_upcoming_bookings_count': confirmed_upcoming_bookings.count(),
                'unconfirmed_upcoming_bookings_count': unconfirmed_upcoming_bookings.count(),
                'total_bookings_count': total_bookings.count(),
                'total_confirmed_bookings_count': total_confirmed_bookings.count(),
                'total_unconfirmed_bookings_count': total_unconfirmed_bookings.count(),
            },
            'comments_user': booking.comments_user,
            'comments_staff': booking.comments_staff,
            'id': booking.id,
        }
    }
    return render(request, 'booking/booking_detail.html', context)