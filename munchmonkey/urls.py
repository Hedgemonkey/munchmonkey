from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from .views import CustomLoginView, CustomSignupView, CustomLogoutView, AccountDetailView, AccountEditView, AccountDeleteView, CustomPasswordChangeView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('custom-login/', CustomLoginView.as_view(), name='custom_login'),
    path('custom-signup/', CustomSignupView.as_view(), name='custom_signup'),
    path('custom-logout/', CustomLogoutView.as_view(), name='custom_logout'),
    path('account/', AccountDetailView.as_view(), name='account_detail'),
    path('account/edit/', AccountEditView.as_view(), name='account_edit'),
    path('account/delete/', AccountDeleteView.as_view(), name='account_delete'),
    path('account/password/change/', CustomPasswordChangeView.as_view(), name='account_change_password'),
    path("accounts/profile/", TemplateView.as_view(template_name="profile.html")),
    path('', include('welcome.urls'), name='home'),
]