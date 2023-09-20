from django.db import IntegrityError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datasets.models import Datasets
from django.http import JsonResponse 
from django.conf import settings
import os

from . import utils 

"""
    se me va a guardar una archivo temporal de la imagen o me lo tendria que crear yo
"""
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
                #select the fisrt image of the dataset file folder so it can be view in the frontend
                
               #Solo necesito extraer los datos en el caso de que no haya alguna cover ya guardada de la imagen 
                if os.path.exists(os.path.join(settings.MEDIA_ROOT, "covers", dataset.name)) == True: 
                    for filename in os.listdir(os.path.join(settings.MEDIA_ROOT, "covers", dataset.name)): 
                        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')): 
                            #rerturn this file name
                            dataset_info["cover_url"] = os.path.join("/media", "covers", dataset.name, filename)
                        else: 
                            print("NO AÑADO NADA")
                            #return error no image found in folder media/covers for dataset
                            pass
                #no tenemos creada la carpeta del dataset
                else : 
                   
                    zip_path = os.path.join(settings.MEDIA_ROOT, str(dataset.url))

                    image_path = utils.extract_cover_from_zip(zip_path, dataset.name)
                    if image_path:
                        # Construct the image URL from the extracted path
                        image_url = os.path.join(settings.MEDIA_URL, str(dataset.url), os.path.basename(image_path))
                        dataset_info["cover_url"] = image_url

                data.append(dataset_info)

            return JsonResponse(data, safe=False)

        else:
            return JsonResponse({"message": "No datasets found"})
    
    elif request.method == "POST": 
        #data is in json format
        recived_data = request.data
        #adding data to the model 
        name = recived_data.get('name')
        description = recived_data.get('description')
        url = recived_data.get('url')
        type = recived_data.get('type')
        format = recived_data.get('format')
        
        print(f"Recived type for dataset: {type}")
        print(f"Recived dataset format {format}")

        print(f"Checking if type is correct")
        check = utils.check_correct_form(url, type)
        print(f"FORMAT CHECK: {check}")
        try:

            dataset = Datasets(
                name=name, 
                description=description,
                url = url, 
                type = type, 
                format = format
            )
            dataset.save()
            return Response({"message": "Dataset created successfully"})
        except IntegrityError as e:
            return Response({"message" : "Error ocurred when saving dataset"})
    
@api_view(["GET"])
def get_dataset_info_by_id(request, dataset_id): 
  
    if request.method == "GET": 
        
        dataset = Datasets.objects.get(dataset_id=dataset_id)
       
        dataset_data = {
                'dataset_id': dataset.dataset_id,
                'name': dataset.name,
                'description': dataset.description,
              
            }
        return JsonResponse(data=dataset_data, safe=False)
        