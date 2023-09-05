from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datasets.models import Datasets
from datetime import datetime
from django.shortcuts import get_object_or_404



@api_view(["GET", "POST"])
def query_table(request):
    if request.method == "GET":
        datasets = Datasets.objects.all() #query all elements in the datasets database 
        #return said elements in a json response
        #returns the data if it is there
        if datasets.exists(): 
            # Convert the queryset to a list of dictionaries
            data = [{"id": dataset.dataset_id, 
                     "name": dataset.name, 
                     "description": dataset.description,
                    "uploaded_date": dataset.uploaded_date, 
                    "url": dataset.url, 
                    'cover': dataset.cover.url if dataset.cover else None}
                    for dataset in datasets]
        else: 
            # Return a custom response when no datasets are found
            data = {"message": "No datasets found"}

        return Response(data)
    elif request.method == "POST": 
        #data is in json format
        recived_data = request.data
        #adding data to the model 
        name = recived_data.get('name')
        description = recived_data.get('description')
        cover = recived_data.get('cover')
        print(cover)
        dataset = Datasets(
            name=name, 
            description=description,
            cover=cover
        )
        dataset.save()
        return Response({"message": "Dataset created successfully"})
@api_view(["GET"])
def get_dataset_info_by_id(request, dataset_id): 
  
    if request.method == "GET": 
        # dataset = get_object_or_404(Datasets, id=dataset_id) #obtiene el dataset por id o manda error 404
        dataset = Datasets.objects.get(dataset_id=dataset_id)
        #añadir metodo que compruebe si el dataset que estoy obteniendo es correcto
        dataset_data = {
                'dataset_id': dataset.dataset_id,
                'name': dataset.name,
                'description': dataset.description,
                # Add more fields as needed
            }
        return Response(dataset_data)