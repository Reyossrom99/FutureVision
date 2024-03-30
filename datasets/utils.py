import os 
import zipfile
from django.conf import settings
import tempfile
import shutil
import json 
import time
import datasets.logMessages.errors as log
import yaml
from datasets.models import Datasets


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
                    if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                        image_path = os.path.join(root, name)
                        image_path_striped = image_path.split("/")
                        image_name = image_path_striped[len(image_path_striped) - 1]
                        if not os.path.exists(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name))): 
                            os.mkdir(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))
                            shutil.copy(image_path, os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))
                        return True

            
    finally: 
        t2 = int(time.time() * 1000)
        print(f"Tiempo total en extraer la cover: {str(t2 - t1)}")
        shutil.rmtree(temp_dir)
    return False

def extract_data_values(zip_path, dataset_name): 
    temp_dir = tempfile.mkdtemp()
    print(temp_dir)
    print(zip_path)
    zip_name = zip_path.name.split("/")[-1].split(".zip")[0]
    print(zip_name)
    try: 
        t1 = int(time.time() * 1000)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        zip_ref.close()
 
        root_path = temp_dir + "/" + zip_name + "/" + 'data.yaml'
        print(settings.MEDIA_ROOT)
        print("root path: ", root_path)
        with open(root_path, 'r') as dataFile: 
            datos = yaml.safe_load(dataFile)
        try: 
            return datos['nc'], datos['names'], None 
        except KeyError as e: 
            return None, None, e.__str__

    finally: 
        t2 = int(time.time() * 1000)
        print(f"Tiempo total en obtener los valores del archivo data: {str(t2 - t1)}")
        shutil.rmtree(temp_dir)
   


def read_images_from_tmp_folder(zip_path, type): 
    
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

"""
    Adds the label to the image for visualization
"""
def add_label_to_image(tmp_path, type): 
    pass

"""
    Creates a data.yaml file with the dataset information necesary for training 
"""
def create_data_file(datasetId): 
    try: 
        dataset = Datasets.objects.get(dataset_id=datasetId)
    except KeyError as e: 
        return None, e
    
    #check the format of the dataset is correct for training
    if dataset.format != 'yolo' or dataset.type !='splits': 
        return None, log.INCORRECT_FORMAT
    
    nc, names, err = extract_data_values(dataset.url, dataset.name)


    if err != None:
        return None, err
    
    
    data = {
        'train': settings.TRAIN_ROOT + dataset.name + "/train/images",
        'val'  : settings.TRAIN_ROOT + dataset.name + "/val/images", 
        'test': settings.TRAIN_ROOT + dataset.name + "/test/images", 
        'nc' : nc, 
        'names': names
    }
    return yaml.dump(data), None

""" 
    Create training folder to run the model on 
    return: 
        * path to unloaded dataset to train model 
        * error in the process
"""
def create_train_folder(datasetId): 
    try : 
        dataset = Datasets.objects.get(dataset_id=datasetId)
    except KeyError as e: 
        return None, e.__str__
    
    #check the format of the dataset is correct for training
    if dataset.format != 'yolo' or dataset.type != 'splits': 
        return None, log.INCORRECT_FORMAT
    root_path = os.path.join(settings.TRAIN_ROOT, dataset.name)

    if os.path.exists(root_path): 
        return root_path, None
    
    else: 
        os.makedirs(root_path) #create path folder
        
        #extract zip file in folder
        with zipfile.ZipFile(dataset.url, 'r') as zip_ref: 
            zip_ref.extractall(root_path)

        return root_path, None
