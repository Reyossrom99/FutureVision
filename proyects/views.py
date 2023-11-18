from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse 
from proyects.models import Proyects
import src.types.messages as msg
from datasets.models import Datasets

@api_view(["GET"])
def query_table(request): 
    if request.method == "GET": 
        print("Getting proyect info")
        proyects = Proyects.objects.all() #query all elements in the datasets database 
    
        if proyects.exists(): 
            data = []
            #extract a cover from a random image of the dataset so it can be view in the frontend
            for dataset in proyects: 
                proyect_info = {
                    "id": dataset.proyect_id, 
                    "name": dataset.name, 
                    "description": dataset.description,
                    "uploaded_date": dataset.start_date
                }

                data.append(proyect_info)
            
            return JsonResponse(data, safe=False)

        else:
            key = "sucess" #no hay datasets en la base de datos, pero no ha habido ningun fallo
            response_data = msg.get_predefined_message(key)
            return JsonResponse(response_data)
@api_view(["POST"])
def create_proyect(request): 
    if request.method == "POST": 
         # Extract data from the POST request
        name = request.POST.get('name')
        description = request.POST.get('description')
        type = request.POST.get('type')
        dataset_id = request.POST.get('dataset_id')  # Assuming 'dataset' is the key for the dataset_id

        # Retrieve the Dataset object
        print(f"type", type)
        print(f"dataset_id", dataset_id)
        try:
            dataset = Datasets.objects.get(dataset_id=dataset_id)
        except Datasets.DoesNotExist: 
            key = "error"
            reponse_data = msg.get_predefined_message(key)
            return JsonResponse(reponse_data)

        # Create a new Proyects instance
        project = Proyects.objects.create(
            name=name,
            description=description,
            type=type,
            dataset=dataset
        )
    project.save()
    return JsonResponse({'project_id': project.proyect_id})