# FILE: booking/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from .views import locations

urlpatterns = [
    path('locations/', locations, name='locations'),
    # other URL patterns
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)