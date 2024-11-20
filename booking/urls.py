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
    path('staff/events/<int:event_id>/save/', views.save_event, name='save_event'),
    # other URL patterns
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)