from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from src.views import basic_web_page

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView
    
)



urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('signup', views.signup, name='signup'), 
    path('user', views.user, name="user"),
    path('user/<int:usuario_id>', views.user_modifications, name="user_modifications"),
    path('users', views.get_users, name="get_users"),
]