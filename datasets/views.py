from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datasets.models import Datasets


@require_http_methods(["GET"])
def query_table(request):
    
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

    return JsonResponse(data, safe=False)
        