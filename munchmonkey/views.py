from django.shortcuts import render, redirect
from django.http import JsonResponse
from allauth.account.views import LoginView, SignupView, LogoutView
from allauth.account.forms import LoginForm, SignupForm

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

class CustomLogoutView(LogoutView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return JsonResponse({"success": True, "message": "Logout successful"})