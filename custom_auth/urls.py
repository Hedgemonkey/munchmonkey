# FILE: custom_auth/urls.py

from django.urls import path
from .views import CustomLoginView, CustomSignupView, CustomLogoutView, AccountDetailView, AccountEditView, AccountDeleteView, CustomPasswordChangeView

urlpatterns = [
    path('custom-login/', CustomLoginView.as_view(), name='custom_login'),
    path('custom-signup/', CustomSignupView.as_view(), name='custom_signup'),
    path('custom-logout/', CustomLogoutView.as_view(), name='custom_logout'),
    path('account/', AccountDetailView.as_view(), name='account_detail'),
    path('account/edit/', AccountEditView.as_view(), name='account_edit'),
    path('account/delete/', AccountDeleteView.as_view(), name='account_delete'),
    path('account/password/change/', CustomPasswordChangeView.as_view(), name='account_change_password'),
]