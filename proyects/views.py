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
            for proyect in proyects: 
                proyect_info = {
                    "id": proyect.proyect_id, 
                    "name": proyect.name, 
                    "description": proyect.description,
                    "start_date": proyect.start_date, 
                    "dataset_id" : proyect.dataset.dataset_id
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


@api_view(["GET"])
def get_proyect_info_by_id(request, proyect_id): 
    print("Get proyect")
    if request.method == "GET": 
        proyect = Proyects.objects.get(proyect_id=proyect_id)
        proyect_data = {
            'proyect_id': proyect.proyect_id, 
            'name': proyect.name, 
            'description': proyect.description, 
            'start_date': proyect.start_date, 
            'dataset_name': proyect.dataset.name
        }
        return JsonResponse(data=proyect_data, safe=False)