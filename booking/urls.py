# FILE: booking/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('locations/', views.locations, name='locations'),
    path('staff/dashboard/', views.staff_dashboard, name='staff_dashboard'),
    path('staff/events/', views.events_overview, name='events_overview'),
    path('staff/events/add/', views.add_event, name='add_event'),
    path('staff/events/<int:event_id>/edit/', views.edit_event, name='edit_event'),
    path('staff/events/<int:event_id>/remove/', views.remove_event, name='remove_event'),
    path('staff/events/remove_selected/', views.remove_selected_events, name='remove_selected_events'),
    path('staff/bookings/', views.staff_bookings, name='staff_bookings'),
    path('staff/bookings/add/', views.add_booking, name='add_booking'),
    path('staff/bookings/confirm/<int:booking_id>/', views.confirm_booking, name='confirm_booking'),
    path('staff/bookings/event/<int:event_id>/', views.event_bookings, name='event_bookings'),
    path('staff/view_booking/<int:booking_id>/', views.view_booking, name='view_booking'),
    path('staff/create_user/', views.create_user, name='create_user'),
    # API endpoint for available slots
    path('api/available_slots/', views.available_slots, name='available_slots'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)