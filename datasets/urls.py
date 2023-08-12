from django.urls import path
from . import views

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    path('', view=views.query_table, name='datasets'), #preforms a query into the database(datasets_datasets) to display or check whether the user has any datasets created
]