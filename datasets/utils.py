import os 
import zipfile
from django.conf import settings
import tempfile
import shutil
import json 



"""
    Format -> indica si es YOLO o Coco
    type -> indica si tiene splits o no
"""

def extract_and_verify_zip(zip_path, format, type): 
    #leemos del archivo json que nos interesa la estructura
    structured_file = "datasets/fileStructure" + "/" + type + "_" + format + ".json"
    print(f"Fichero de estructura leido: {structured_file}")

    with open(structured_file, 'r') as file: 
        expected_structure = json.load(file)
    file.close()

    temp_dir = tempfile.mkdtemp()
    try: 
        with zipfile.ZipFile(zip_path, 'r') as zip_ref: 
            zip_ref.extractall(temp_dir)

        #miramos recursivamente sobre el directorio para comprobar si son correctos los valores
        def check_directory_structure(root, structure): 
            for item, value in structure.items(): 
                item_path = os.path.join(root, item)
                
                if isinstance(value, dict): 
                    #si hay un diccionario entonces miramos de forma recursiva dentro de este 
                    if not check_directory_structure(item_path,  value): 
                        return False
                elif isinstance(value, bool): 
                    #estamos en el final del directorio y tnemos que mirar si concuerda
                    if value and not os.path.exists(item_path): 
                        return False
                else: #no sabemos cual es la estructura 
                    return False 
            return True 
        
        if not check_directory_structure(temp_dir, expected_structure['project_root']): 
            return False
        return True 
    
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir)     
      

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