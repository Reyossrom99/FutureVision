from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datasets.models import Datasets
from datetime import datetime


@api_view(["GET", "POST"])
def query_table(request):
    if request.method == "GET":
        datasets = Datasets.objects.all() #query all elements in the datasets database 
        #return said elements in a json response
        #returns the data if it is there
        if datasets.exists(): 
            # Convert the queryset to a list of dictionaries
            data = [{"id": dataset.dataset_id, "name": dataset.name, "description": dataset.description,
                    "uploaded_date": dataset.uploaded_date, "url": dataset.url}
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
        id = recived_data.get('id')
        description = recived_data.get('description')
    
        dataset = Datasets(
            name=name, 
            description=description
        )
        dataset.save()
        return Response({"message": "Dataset created successfully"})

