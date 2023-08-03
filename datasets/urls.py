from django.urls import path
from .views import DatasetsPrueba

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    path('', DatasetsPrueba.as_view()),
]