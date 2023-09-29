import os 
import zipfile
from django.conf import settings
import tempfile
import shutil
import json 
import time


"""
    format -> indica si es YOLO o Coco
    type -> indica si tiene splits o no
"""

def extract_and_verify_zip(zip_path, format, type): 
    #leemos del archivo json que nos interesa la estructura
    structured_file = "datasets/fileStructure" + "/" + format + "_" + type + ".json"
    print(f"Fichero de estructura leido: {structured_file}")

    with open(structured_file, 'r') as file: 
        expected_structure = json.load(file)
    file.close()

    #before obtaining the zip we need to get the name 
    
    zip_name = zip_path.name.split(".zip")[0]
    temp_dir = tempfile.mkdtemp()
    try: 
        t1 = int(time.time() * 1000)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        zip_ref.close()

        #miramos recursivamente sobre el directorio para comprobar si son correctos los valores
        def check_directory_structure(root, structure): 
            for item, value in structure.items(): 
                #tenemos que eliminar la primera parte del item, que es el root
                
                item_path = os.path.join(root, item)
                print(f"Ruta donde estoy buscando: {item_path}")
                
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
        
        temp_dir_path = os.path.join(temp_dir, zip_name)
        print(f"Ruta temporal: {temp_dir_path}")
        if not check_directory_structure(temp_dir_path, expected_structure['project_root']): 
            return False
        return True 
    
    finally:
        t2 = int(time.time() * 1000)
        print(f"Tiempo total en comprobar la estructura: {str(t2 - t1)}")
        shutil.rmtree(temp_dir)     

def extract_cover(zip_path, dataset_name, format, type) : 
    temp_dir = tempfile.mkdtemp()
    zip_name = zip_path.name.split(".zip")[0]
    try: 
        t1 = int(time.time() * 1000)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        zip_ref.close()
 
        if type == "no-splits": 
            root_path = os.path.join(temp_dir, zip_name, "images")
        else: 
            root_path = os.path.join(temp_dir, zip_name, "train", "images")

        for root, directories, files in os.walk(root_path): 
                for name in files: 
                    print(f"Nombres de archivo: {name}")
                    if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                        image_path = os.path.join(root, name)
                        image_path_striped = image_path.split("/")
                        image_name = image_path_striped[len(image_path_striped) - 1]
                        if os.path.exists(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name))) == False: 
                            os.mkdir(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))
                            shutil.copy(image_path, os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))
                            return True
                    
        return False           

            
    finally: 
        t2 = int(time.time() * 1000)
        print(f"Tiempo total en extraer la cover: {str(t2 - t1)}")
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
                    image_media_path = os.path.join("/media", "covers",str(dataset_name), str(image_name))
                    print(f"Image final path: {image_media_path}" )

                    return image_media_path # Return the path to the first image found

        return None  # No image files found
    finally:
        # Clean up the temporary directory
       
        shutil.rmtree(temp_dir)

def read_images_from_tmp_folder(zip_path, type): 
    
    #necesito crear el temp dir en la carpeta especifica que la web publica 
    
   
    zip_name = os.path.basename(zip_path.name).split(".zip")[0]
    dir_root = os.path.join(settings.MEDIA_ROOT, "tmp")
    temp_dir = tempfile.mkdtemp(dir = dir_root)
    temp_name = os.path.basename(temp_dir)
    print(temp_name)
    print(f"Ruta del destino temporal: {temp_dir}")
    images = []
    with zipfile.ZipFile(zip_path, 'r') as zip_ref: 
        zip_ref.extractall(temp_dir)
    zip_ref.close()

    if type == "no-splits": 
        root_path = os.path.join(temp_dir, zip_name, "images")
    else: 
        return images
    
    print(f"Directorio de lectura temporal: {root_path}")
    for root, directories, files in os.walk(root_path): 
        print("Obteniendo las imagenes de la carpeta......")
        for name in files: 
            if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                images.append(os.path.join("/media", "tmp", temp_name, zip_name,'images',name))
                
    return images