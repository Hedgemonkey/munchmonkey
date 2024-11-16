"""
URL configuration for munchmonkey project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from .views import CustomLoginView, CustomSignupView, CustomLogoutView

from allauth.account.decorators import secure_admin_login

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('custom-login/', CustomLoginView.as_view(), name='custom_login'),
    path('custom-signup/', CustomSignupView.as_view(), name='custom_signup'),
    path('custom-logout/', CustomLogoutView.as_view(), name='custom_logout'),
    path("accounts/profile/", TemplateView.as_view(template_name="profile.html")),
    path('', include('welcome.urls'), name='home'),
]
