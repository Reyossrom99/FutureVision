from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('sign-up', views.sign_up, name='sign_up'), 
    path('user/new', views.register_user, name='register_user'),
    path('user', views.user_info), 
    path('user/modify', views.update_user), 
    path('user/<int:usuario_id>', views.eliminar_usuario), 
    path('users', views.obtener_usuarios)
]