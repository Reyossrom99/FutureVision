from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
#allow django to server files from media folder
from django.conf.urls.static import static

urlpatterns = [
     path('datasets/', include('datasets.urls')),
]
