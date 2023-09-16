from rest_framework.decorators import api_view
from rest_framework.response import Response
from datasets.models import Datasets
from django.http import JsonResponse 

import zipfile
import os 
from django.conf import settings
import tempfile
import shutil

"""
    Hay que modificarlo para que se busque correctamente dependiendo del tipo 
    de dataset que estamos exportando
"""
def extract_cover_from_zip(zip_path, dataset_name): 
     # Create a temporary directory to extract the zip file
    temp_dir = tempfile.mkdtemp()

    try:
        # Extract the zip file to the temporary directory
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        # Search for image files in the temporary directory and select the first one
        for root, _, files in os.walk(temp_dir):
            for filename in files:
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                    image_path = os.path.join(root, filename)
                
                   
                    image_path_striped = image_path.split("/")
                    image_name = image_path_striped[len(image_path_striped) - 1]
                 
                   
                    if os.path.exists(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name))) == False: 
                        os.mkdir(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))
                        shutil.copy(image_path, os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))

                    print(settings.MEDIA_ROOT)
                    print(str(dataset_name))
                    print(str(image_name))

                    image_media_path = os.path.join("/media", "covers",str(dataset_name), str(image_name))
                    print(f"Image final path: {image_media_path}" )

                    return image_media_path # Return the path to the first image found

        return None  # No image files found
    finally:
        # Clean up the temporary directory
       
        shutil.rmtree(temp_dir)

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

                    image_path = extract_cover_from_zip(zip_path, dataset.name)
                    if image_path:
                        # Construct the image URL from the extracted path
                        image_url = os.path.join(settings.MEDIA_URL, str(dataset.url), os.path.basename(image_path))
                        dataset_info["cover_url"] = image_url

                data.append(dataset_info)

            return JsonResponse(data, safe=False)

        else:
            return JsonResponse({"message": "No datasets found"})
    else:
        return JsonResponse({"message": "Method Not Allowed"}, status=405)
   
    
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
        