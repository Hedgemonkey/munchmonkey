# FILE: booking/views.py

from django.shortcuts import render

def munch(request):
    return render(request, 'menu/menu.html')