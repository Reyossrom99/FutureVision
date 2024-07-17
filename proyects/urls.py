from django.urls import path
from . import views

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    #query to see the proyects that are created
    path('', view=views.proyects, name='proyects'), 
    path('<int:proyect_id>', view=views.trainings, name='training fbs'), 
    path('<int:proyect_id>/queue', view=views.proyect_queue, name='project queue')
    
]
