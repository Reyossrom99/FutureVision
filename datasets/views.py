from django.db import IntegrityError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datasets.models import Datasets
from django.http import JsonResponse 
from django.conf import settings
import os
import src.types.messages as msg


from . import utils 


@api_view(["GET", "POST"])
def query_table(request):
    if request.method == "GET":
        datasets = Datasets.objects.all() #query all elements in the datasets database 
    
        if datasets.exists(): 
            data = []
            #extract a cover from a random image of the dataset so it can be view in the frontend
            for dataset in datasets: 
                dataset_info = {
                    "id": dataset.dataset_id, 
                    "name": dataset.name, 
                    "description": dataset.description,
                    "uploaded_date": dataset.uploaded_date
                }
                if os.path.exists(os.path.join(settings.MEDIA_ROOT, "covers", dataset.name)) == True: 
                    for file in os.listdir(os.path.join(settings.MEDIA_ROOT, "covers", dataset.name)): 
                       
                        if file.lower().endswith(('.jpg', '.png', '.jpeg')): 
                            dataset_info["cover_url"] = os.path.join("/media", "covers", dataset.name, file)
                            break

                data.append(dataset_info)
            
            return JsonResponse(data, safe=False)

        else:
            key = "sucess" #no hay datasets en la base de datos, pero no ha habido ningun fallo
            response_data = msg.get_predefined_message(key)
            return JsonResponse(response_data)
    
    elif request.method == "POST": 
        #data is in json format
        recived_data = request.data
        #adding data to the model 
        name = recived_data.get('name')
        description = recived_data.get('description')
        url = recived_data.get('url')
        type = recived_data.get('type')
        format = recived_data.get('format')
        
    
        # check = utils.check_correct_form(url, type, format)
        control_structure = utils.extract_and_verify_zip(url, format, type)
        if control_structure: 
            try:
                dataset = Datasets(
                    name=name, 
                    description=description,
                    url = url, 
                    type = type, 
                    format = format
                )
                dataset.save()
                #obtebemos la cover del dataset, solo cuando la estructura de control es correcta 
                if (utils.extract_cover(url, name, format, type)):
                    key = "sucess" #no hay datasets en la base de datos, pero no ha habido ningun fallo
                    print("Sucess")
                    response_data = msg.get_predefined_message(key)
                    return JsonResponse(response_data)
                else: 
                    key = "invalid" #no hay datasets en la base de datos, pero no ha habido ningun fallo
                    print("Invalid error")
                    response_data = msg.get_predefined_message(key)
                    return JsonResponse(response_data)
                
            except IntegrityError as e:
                key = "error" #no hay datasets en la base de datos, pero no ha habido ningun fallo
                print("Integrity error")
                response_data = msg.get_predefined_message(key)
                return JsonResponse(response_data)
        else: 
                key = "invalid" #no hay datasets en la base de datos, pero no ha habido ningun fallo
                print("Invalid dataset format")
                response_data = msg.get_predefined_message(key)
                return JsonResponse(response_data)
        
@api_view(["GET"])
def get_dataset_info_by_id(request, dataset_id): 
  
    if request.method == "GET": 
        
        dataset = Datasets.objects.get(dataset_id=dataset_id)
        image_files = utils.read_images_from_tmp_folder(dataset.url, dataset.type)
        print(len(image_files))
        
        dataset_data = {
                'dataset_id': dataset.dataset_id,
                'name': dataset.name,
                'description': dataset.description,
                'images': image_files,
            }
        
        return JsonResponse(data=dataset_data, safe=False)
        