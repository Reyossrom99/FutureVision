from django.urls import path
from .views import DatasetsPrueba

urlpatterns = [
    path('', DatasetsPrueba.as_view()),
]