from asyncio import sleep
import os
import zipfile
from django.conf import settings
import tempfile
import shutil
import json
import time
import yaml
from datasets.models import Datasets
import logging

log = logging.getLogger("docker")

"""
    format -> indica si es YOLO o Coco
    type -> indica si tiene splits o no
"""


def extract_and_verify_zip(zip_path, format, type):
    structured_file = "datasets/fileStructure" + "/" + format + "_" + type + ".json"

    with open(structured_file, "r") as file:
        expected_structure = json.load(file)

    zip_name = zip_path.name.split(".zip")[0]
    temp_dir = tempfile.mkdtemp()

    try:
        t1 = int(time.time() * 1000)

        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            for file_info in zip_ref.infolist():
                # Extraer el archivo individual en lugar de todo el ZIP
                zip_ref.extract(file_info, temp_dir)
        # Verificar la estructura después de extraer cada archivo
        temp_dir_path = os.path.join(temp_dir, zip_name)
        if not check_directory_structure(
            temp_dir_path, expected_structure["project_root"]
        ):
            return False

        return True
    finally:
        # Limpieza del directorio temporal
        t2 = int(time.time() * 1000)
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


def check_directory_structure(root, structure):
    # Función de verificación de estructura recursiva
    for item, value in structure.items():
        item_path = os.path.join(root, item)

        if isinstance(value, dict):

            if not check_directory_structure(item_path, value):
                print(f"La estructura del directorio {item} no es correcta")
                return False
        elif isinstance(value, bool):
            if value and not os.path.exists(item_path):
                print(f"El archivo {item} no existe en el directorio {root}")
                return False
        else:
            return False

    return True


def extract_cover(zip_path, dataset_name, format, type):
    temp_dir = tempfile.mkdtemp()
    zip_name = zip_path.name.split(".zip")[0]
    try:
        t1 = int(time.time() * 1000)
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)
        zip_ref.close()

        if type == "no-splits":
            root_path = os.path.join(temp_dir, zip_name, "images")
        else:
            root_path = os.path.join(temp_dir, zip_name, "train", "images")

        for root, directories, files in os.walk(root_path):
            for name in files:
                if name.lower().endswith((".png", ".jpg", ".jpeg")):
                    image_path = os.path.join(root, name)
                    image_path_striped = image_path.split("/")
                    image_name = image_path_striped[len(image_path_striped) - 1]
                    if not os.path.exists(
                        os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name))
                    ):
                        os.mkdir(
                            os.path.join(
                                settings.MEDIA_ROOT, "covers", str(dataset_name)
                            )
                        )
                        shutil.copy(
                            image_path,
                            os.path.join(
                                settings.MEDIA_ROOT, "covers", str(dataset_name)
                            ),
                        )
                    return True

    finally:
        t2 = int(time.time() * 1000)
        print(f"Tiempo total en extraer la cover: {str(t2 - t1)}")
        shutil.rmtree(temp_dir)
    return False


"""
    Count the number of files in the zip file
"""


def count_files_in_zip(zip_path, type):
    temp_dir = tempfile.mkdtemp()
    total_image_files = 0
    total_image_files_train = 0
    total_image_files_val = 0
    total_image_files_test = 0

    try:
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        if type == "no-splits":
            image_extensions = (".png", ".jpg", ".jpeg")
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    if file.lower().endswith(image_extensions):
                        total_image_files += 1

            return total_image_files, 0, 0

        else:
            image_extensions = (".png", ".jpg", ".jpeg")
            for root, dirs, files in os.walk(temp_dir):
                if "train" in root:
                    for file in files:
                        if file.lower().endswith(image_extensions):
                            total_image_files_train += 1
                elif "val" in root:
                    for file in files:
                        if file.lower().endswith(image_extensions):
                            total_image_files_val += 1
                elif "test" in root:
                    for file in files:
                        if file.lower().endswith(image_extensions):
                            total_image_files_test += 1

            return (
                total_image_files_train,
                total_image_files_val,
                total_image_files_test,
            )

    finally:
        shutil.rmtree(temp_dir)


def extract_data_values(zip_path, dataset_name):
    temp_dir = tempfile.mkdtemp()
    print(temp_dir)
    print(zip_path)
    zip_name = zip_path.name.split("/")[-1].split(".zip")[0]
    print(zip_name)
    try:
        t1 = int(time.time() * 1000)
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)
        zip_ref.close()

        root_path = temp_dir + "/" + zip_name + "/" + "data.yaml"
        print(settings.MEDIA_ROOT)
        print("root path: ", root_path)
        with open(root_path, "r") as dataFile:
            datos = yaml.safe_load(dataFile)
        try:
            return datos["nc"], datos["names"], None
        except KeyError as e:
            return None, None, e.__str__

    finally:
        t2 = int(time.time() * 1000)
        print(f"Tiempo total en obtener los valores del archivo data: {str(t2 - t1)}")
        shutil.rmtree(temp_dir)


def read_images_from_tmp_folder(zip_path, type):

    zip_name = os.path.basename(zip_path.name).split(".zip")[0]
    dir_root = os.path.join(settings.MEDIA_ROOT, "tmp")
    temp_dir = tempfile.mkdtemp(dir=dir_root)
    temp_name = os.path.basename(temp_dir)
    print(temp_name)
    print(f"Ruta del destino temporal: {temp_dir}")
    images = []
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
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
            if name.lower().endswith((".png", ".jpg", ".jpeg")):
                images.append(
                    os.path.join("/media", "tmp", temp_name, zip_name, "images", name)
                )

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
    print("getting objects") 
    # check the format of the dataset is correct for training
    if dataset.format != "yolo" or dataset.type != "splits":
        return None, log.INCORRECT_FORMAT
    
    nc, names, err = extract_data_values(dataset.url, dataset.name)
    print("extraing values") 
    if err != None:
        return None, err

    names_order = []
    for name in names:
        names_order.append(name)

    zip_name = os.path.basename(dataset.url.name).split(".zip")[0]
    print("zip name: ", zip_name)
    data = {
        "train": settings.TRAIN_ROOT
        + "/"
        + dataset.name
        + "/"
        + zip_name
        + "/train/images",
        "val": settings.TRAIN_ROOT
        + "/"
        + dataset.name
        + "/"
        + zip_name
        + "/val/images",
        "test": settings.TRAIN_ROOT
        + "/"
        + dataset.name
        + "/"
        + zip_name
        + "/test/images",
        "nc": len(names_order),
    }

    # serializar el diccionario expecto la lista de names
    yaml_str = yaml.dump(data)
    names_str = "names: " + str(names_order)
    yaml_str = yaml_str + names_str

    return yaml_str, None


""" 
    Create training folder to run the model on 
    return: 
        * path to unloaded dataset to train model 
        * error in the process
"""


def create_train_folder(datasetId):
    try:
        dataset = Datasets.objects.get(dataset_id=datasetId)
    except KeyError as e:
        return None, e.__str__

    # check the format of the dataset is correct for training
    if dataset.format != "yolo" or dataset.type != "splits":
        return None, log.INCORRECT_FORMAT
    root_path = os.path.join(settings.TRAIN_ROOT, dataset.name)

    # if not created path create an extract
    if not os.path.exists(root_path):
        os.makedirs(root_path)
        with zipfile.ZipFile(dataset.url, "r") as zip_ref:
            zip_ref.extractall(root_path)

    zip_name = os.path.basename(dataset.url.name).split(".zip")[0]
    train_path = os.path.join(root_path, zip_name)

    return train_path, None


def delete_dataset_files(datasetUrl) -> str:
    try:
        datasetName = os.path.basename(datasetUrl.name).split(".zip")[0]
        if os.path.exists(settings.MEDIA_ROOT + "/tmp/" + datasetName):
            shutil.rmtree(settings.MEDIA_ROOT + "/tmp/" + datasetName)
            return None
        else:
            return "Dataset files not found in the server"
    except Exception as e:
        return e.__str__

def oposite_value(dataset): 
    print("oposite value")
    if dataset.modify:
            print("modify")
            if dataset.type == "splits":
                return "no-splits"
            else:
                return "splits"
    else: 
       return dataset.type
