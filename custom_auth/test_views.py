# FILE: custom_auth/tests/test_views.py

from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.contrib.auth.middleware import AuthenticationMiddleware
from django.contrib.sessions.middleware import SessionMiddleware
from django.middleware.csrf import CsrfViewMiddleware, get_token
from custom_auth.views import CustomLoginView
import json

User = get_user_model()

class CustomLoginViewTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(username='testuser', email='testuser@example.com', password='password')
        
        # Debugging: Print user details
        print(f"User created: {self.user.username}, {self.user.email}")
        
        # Assertions to ensure user is created correctly
        assert self.user.username == 'testuser'
        assert self.user.email == 'testuser@example.com'
        assert self.user.check_password('password')  # Check if the password is set correctly
        
        self.login_url = reverse('custom_login')  # Use the custom login URL

    def _add_middleware(self, request):
        """Add necessary middleware to the request."""
        session_middleware = SessionMiddleware(lambda req: None)
        session_middleware.process_request(request)
        request.session.save()

        auth_middleware = AuthenticationMiddleware(lambda req: None)
        auth_middleware.process_request(request)
        request.user = self.user

        csrf_middleware = CsrfViewMiddleware(lambda req: None)
        csrf_middleware.process_view(request, None, (), {})
        request.META['CSRF_COOKIE'] = get_token(request)

    def test_valid_login(self):
        request = self.factory.post(self.login_url, {
            'login': 'testuser@example.com',    
            'password': 'password',
            'csrfmiddlewaretoken': get_token(self.factory.get(self.login_url))
        }, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self._add_middleware(request)
        response = CustomLoginView.as_view()(request)
        print('Response status code:', response.status_code)  # Debugging: Print response status code
        print('Response headers:', response.headers)  # Debugging: Print response headers
        print('Response content:', response.content)  # Debugging: Print response content
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response_content, encoding='utf8'), {"success": True, "message": "Login successful"})

    def test_invalid_login(self):
        request = self.factory.post(self.login_url, {
            'login': 'testuser@example.com',
            'password': 'wrongpassword',
            'csrfmiddlewaretoken': get_token(self.factory.get(self.login_url))
        }, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self._add_middleware(request)
        response = CustomLoginView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertJSONEqual(response_data, {"success": False, "error": "Invalid credentials"})

    def test_form_invalid(self):
        request = self.factory.post(self.login_url, {
            'login': '',
            'password': '',
            'csrfmiddlewaretoken': get_token(self.factory.get(self.login_url))
        }, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self._add_middleware(request)
        response = CustomLoginView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertJSONEqual(response_data, {"success": False, "error": {"login": ["This field is required."], "password": ["This field is required."]}})