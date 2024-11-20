from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('custom_auth.urls')),  # Include custom_auth URLs
    path('accounts/', include('allauth.urls')),
    path("accounts/profile/", TemplateView.as_view(template_name="profile.html")),
    path('', include('welcome.urls'), name='home'),
    path('', include('booking.urls')),
]