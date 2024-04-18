from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView
    
)
urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('sign-up', views.sign_up, name='sign_up'), 
    path('user', views.user),
    path('user/<int:usuario_id>', views.user_modifications),
    path('users', views.obtener_usuarios),
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
]