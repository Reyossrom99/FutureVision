from django.urls import path
from . import views

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    #query to see the projects that are created
    path('', view=views.projects, name='projects'), 
    path('<int:project_id>', view=views.trainings, name='training fbs'), 
    path('<int:project_id>/queue', view=views.project_queue, name='project queue'),
    path('notify', view=views.notify),
    path('log/<int:training_id>', view=views.log),
    path('weights/<int:training_id>', view=views.weights)
]
