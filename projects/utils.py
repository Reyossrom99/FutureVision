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


def delete_training_folder(folder): 
    if os.path.exits(os.path.join(folder, "train")):
        shutil.rmtree(os.path.join(folder, "train"))
    if os.path.exits(os.path.join(folder, "val")):
        shutil.rmtree(os.path.join(folder, "val"))
    if os.path.exits(os.path.join(folder, "test")):
        shutil.rmtree(os.path.join(folder, "test"))


"""
    Creates a data.yaml file with the dataset information necesary for training 
"""


def create_data_file(datasetId, id):
    try:
        dataset = Datasets.objects.get(dataset_id=datasetId)
    except KeyError as e:
        return None, e
   
    # check the format of the dataset is correct for training
    if dataset.format != "yolo" or dataset.type != "splits":
        return None, log.INCORRECT_FORMAT
   
    nc, names, err = extract_data_values(dataset.url, dataset.name)
   
    if err != None:
        return None, err
    
    names_order = []
    for name in names:
        names_order.append(name)

    zip_name = os.path.basename(dataset.url.name).split(".zip")[0]
    
    data = {
        "train": settings.TRAIN_ROOT
        + "/"
        + dataset.name
        + "/"
        + id 
        + "/"
        + zip_name
        + "/train/images",
        "val": settings.TRAIN_ROOT
        + "/"
        + dataset.name
        + "/"
        + id 
        + "/"
        + zip_name
        + "/val/images",
        "test": settings.TRAIN_ROOT
        + "/"
        + dataset.name
        + "/"
        + id 
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


def create_train_folder(datasetId, id):
    try:
        dataset = Datasets.objects.get(dataset_id=datasetId)
    except KeyError as e:
        return None, e.__str__

    # check the format of the dataset is correct for training
    if dataset.format != "yolo" or dataset.type != "splits":
        return None, log.INCORRECT_FORMAT
    root_path = os.path.join(settings.TRAIN_ROOT, dataset.name, id)

    # if not created path create an extract
    if not os.path.exists(root_path):
        os.makedirs(root_path)
        with zipfile.ZipFile(dataset.url, "r") as zip_ref:
            zip_ref.extractall(root_path)

    zip_name = os.path.basename(dataset.url.name).split(".zip")[0]
    train_path = os.path.join(root_path, zip_name)

    return train_path, None

def extract_data_values(zip_path, dataset_name):
    temp_dir = tempfile.mkdtemp(dir=os.path.join(settings.MEDIA_ROOT, "tmp"))
    zip_name = zip_path.name.split("/")[-1].split(".zip")[0]
    try:
        t1 = int(time.time() * 1000)
        with zipfile.ZipFile(os.path.join(settings.MEDIA_ROOT, str(zip_path)), "r") as zip_ref:
            zip_ref.extractall(temp_dir)
        zip_ref.close()

        root_path = temp_dir + "/" + zip_name + "/" + "data.yaml"
        root_path= os.path.join(settings.MEDIA_ROOT, temp_dir, zip_name, "data.yaml")

        with open(root_path, "r") as dataFile:
            datos = yaml.safe_load(dataFile)
        try:
            return datos["nc"], datos["names"], None
        except KeyError as e:
            return None, None, e.__str__

    finally:
        t2 = int(time.time() * 1000)
        shutil.rmtree(temp_dir)