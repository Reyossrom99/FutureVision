from django.urls import path
from . import views

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    path('', view=views.datasets, name='datasets'), #preforms a query into the database(datasets_datasets) to display or check whether the user has any datasets created
    path('<int:dataset_id>', view=views.get_dataset_info_by_id, name='dataset_info'),#gets the dataset id
    path('split/<int:dataset_id>', view=views.split_dataset, name='split_dataset'),
]