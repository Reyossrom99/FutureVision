from django.urls import path
from . import views

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    path('', view=views.datasets, name='datasets'),
]