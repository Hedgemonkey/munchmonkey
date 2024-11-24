# FILE: booking/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('munch/', views.munch, name='munch'),
    # Add other URL patterns here
]