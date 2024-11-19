from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic import DetailView, UpdateView, DeleteView, View
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from allauth.account.views import LoginView, SignupView
from allauth.account.forms import LoginForm, SignupForm, ChangePasswordForm
from django.contrib.auth import logout, authenticate
from .forms import CustomUserChangeForm
from .models import CustomUser

CustomUser = get_user_model()

class CustomLoginView(LoginView):
    form_class = LoginForm

    def form_valid(self, form):
        response = form.login(self.request, redirect_url=self.get_success_url())
        if isinstance(response, JsonResponse):
            return response
        elif hasattr(response, 'url'):
            return JsonResponse({"success": True, "message": "Login successful"})
        else:
            return JsonResponse({"success": False, "error": "Invalid credentials"})

    def form_invalid(self, form):
        return JsonResponse({"success": False, "error": form.errors})

class CustomSignupView(SignupView):
    form_class = SignupForm

    def form_valid(self, form):
        user = form.save(self.request)
        return JsonResponse({"success": True, "message": "Signup successful"})

    def form_invalid(self, form):
        return JsonResponse({"success": False, "error": form.errors})

class CustomLogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({"success": True, "message": "Logout successful"})

class AccountDetailView(DetailView):
    model = User
    template_name = 'account/account_detail.html'

    def get_object(self):
        return self.request.user

class AccountEditView(UpdateView):
    model = CustomUser
    form_class = CustomUserChangeForm
    template_name = 'account/account_edit.html'
    success_url = reverse_lazy('account_detail')

    def get_object(self):
        return self.request.user

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['password_form'] = ChangePasswordForm(user=self.request.user)
        return context

    def form_valid(self, form):
        form.save()
        return JsonResponse({"success": True, "message": "Account updated successfully", "redirect_url": str(self.success_url)})

    def form_invalid(self, form):
        return JsonResponse({"success": False, "error": form.errors})
    
class AccountDeleteView(DeleteView):
    model = User
    template_name = 'account/account_delete.html'
    success_url = reverse_lazy('home')

    def get_object(self):
        return self.request.user

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        # Add logic to delete user content if needed
        response = super().delete(request, *args, **kwargs)
        return response

class CustomPasswordChangeView(View):
    form_class = ChangePasswordForm
    success_url = reverse_lazy('account_detail')

    def post(self, request, *args, **kwargs):
        form = self.form_class(data=request.POST, user=request.user)
        if form.is_valid():
            form.save()
            # Ensure the user object is saved after changing the password
            request.user.save()
            # Re-authenticate the user
            new_password = form.cleaned_data.get('new_password1')
            user = authenticate(username=request.user.username, password=new_password)
            if user is not None:
                user.login(request, user)
                return JsonResponse({"success": True, "message": "Password changed successfully", "redirect_url": str(self.success_url)})
            else:
                # Render the login form as HTML
                login_form_html = render(request, 'account/login_form.html', {'form': LoginForm()}).content.decode('utf-8')
                return JsonResponse({"success": False, "error": "Password changed, but failed to log in. Please log in manually.", "login_form": login_form_html})
        else:
            return JsonResponse({"success": False, "error": form.errors})