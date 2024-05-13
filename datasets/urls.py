from django.urls import path
from . import views

#/datasets/...lo que se escriba en esta pagina
urlpatterns = [
    path('', view=views.datasets, name='datasets'), #preforms a query into the database(datasets_datasets) to display or check whether the user has any datasets created
    path('<int:dataset_id>', view=views.get_dataset_info_by_id, name='dataset_info'),#gets the dataset id
    path('<int:dataset_id>/splits', view=views.split_dataset, name='split_dataset'),
    path('<int:dataset_id>/media/<img_id>', view=views.modify_image, name='modify_image'),
    path('<int:dataset_id>/media/tmp', views.modify_temporal_folder, name='modify_temporal_folder'),
    path('<int:dataset_id>/media', views.get_summary, name='get_summary'),
]