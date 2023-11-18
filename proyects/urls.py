from django.urls import path
from . import views

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    #query to see the proyects that are created
    path('', view=views.query_table, name='proyects'), 
    path('create/', view=views.create_proyect)
    
]