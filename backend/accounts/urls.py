from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# URL patterns for authentication
urlpatterns = [
    # Login endpoint - returns JWT tokens + user data
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Registration endpoint - creates user and returns tokens + user data
    path('register/', views.RegisterView.as_view(), name='register'),
    # Current user endpoint - returns authenticated user's data
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    # Token refresh endpoint - returns new access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
