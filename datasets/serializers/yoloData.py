import os 
import zipfile
from django.conf import settings
import tempfile
import shutil
import json 
import time
import cv2 
import numpy as np

class YoloData(): 

    def __init__(self, name:str, type:str, zip_path:str) -> None:
        self.name = name
        self.type = type #determines if the dataset has splits
        self.zip_path = zip_path
        self.zip_name = os.path.basename(zip_path.name).split(".zip")[0]
        self.dir_root = os.path.join(settings.MEDIA_ROOT, "tmp")
        self.tmp_dir = tempfile.mkdtemp(dir = self.dir_root)
        self.tmp_name = os.path.basename(self.tmp_dir)
        self.labeled_images = False #indica si se ha creado un directorio para imagenes con label

    def extract_data_in_tmp(self) -> bool :
        with zipfile.ZipFile(self.zip_path, 'r') as zip_ref: 
            zip_ref.extractall(self.tmp_dir)
        zip_ref.close()
        return True
    
    """
        falta por implemenenta el metodo de splits creados en todos los metodos
    """
    #obtiene una list que contiene las rutas de todas las imagenes de la carpeta
    def get_images(self, requested_split:str) -> list: 
        print(self.type)
        images = []  #ruta relativa de las imagenes para mandarlas al front
        images_full = [] #ruta completa de las imagenes que necesita el back
        if not os.path.exists(self.tmp_dir): 
            return images, images_full
        
        if self.type == "no-splits": 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "images")
        else: 
            #get the images by split 

            root_path = os.path.join(self.tmp_dir, self.zip_name, requested_split, "images")
        
        

        for root, directories, files in os.walk(root_path): 
            for name in files: 
                if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                  
                    if self.type == "no-splits":
                        images_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'images', name))
                        images.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name,'images',name))
                    else: 
                        images.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, requested_split,'images',name))
                        images_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, requested_split ,'images', name))
        return images, images_full
    
    def get_labels(self, requested_split:str) -> list: 
        labels = [] #ruta relativa
        labels_full = [] #ruta completa
        if not os.path.exists(self.tmp_dir): 
            return labels, labels_full
        
        if self.type == "no-splits": 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "labels")
        else: 
            root_path = os.path.join(self.tmp_dir, self.zip_name, requested_split, "labels")
        
        for root, directories, files in os.walk(root_path): 
            for name in files: 
                if name.lower().endswith('.txt'): 
                    if self.type == "no-splits":
                        labels.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labels", name))
                        labels_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labels', name))
                    else: 
                        labels.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name,requested_split, "labels", name))
                        labels_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, requested_split,'labels', name))
        return labels, labels_full
    
    def get_labeled_images(self, requested_split:str) -> list: 
        labeled = []
        labeled_full = []
        if not os.path.exists(self.tmp_dir): 
            return labeled, labeled_full

        if self.type == "no-splits": 
                root_path = os.path.join(self.tmp_dir, self.zip_name, "labeled_images")
        else: 
                root_path = os.path.join(self.tmp_dir, self.zip_name, 'labeled_images', requested_split)
        for root, directories, files in os.walk(root_path):
            for name in files: 
                if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                    if self.type == "no-splits": 
                        labeled.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labeled_images", name))
                        labeled_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labeled_images', name))
                    else: 
                        labeled.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labeled_images", requested_split,name))
                        labeled_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labeled_images', requested_split, name))
        return labeled, labeled_full
    
    """
        REPASAR ESTA FUNCION PORQUE TARDA MUCHO TIEMPO
        TENER EN CUENTA QUE ESTA HECHO PARA NO-SPLITS
    """
    def save_labels_in_image(self, image_files:list, labels_files:list, requested_split:str) : 
        # labeled_images = []
        # labeled_images_full =[]
     
        if not image_files or not labels_files: 
           return 

        if len(image_files) != len(labels_files): 
            return 

        if self.type=='no-splits' and  not os.path.exists(os.path.join(self.tmp_dir, self.zip_name, 'labeled_images')):
            labeled_dir = os.path.join(self.tmp_dir, self.zip_name, 'labeled_images')
            os.makedirs(labeled_dir, exist_ok=False) #raises an error if the directory already exists
        elif not os.path.exists(os.path.join(self.tmp_dir, self.zip_name, 'labeled_images', requested_split)):
            labeled_dir = os.path.join(self.tmp_dir, self.zip_name, 'labeled_images', requested_split)
            os.makedirs(labeled_dir, exist_ok=False)
        else: 
            
            return 
        
        for index in range(0, len(image_files)): 
            image = cv2.imread(image_files[index], cv2.IMREAD_UNCHANGED)

            image_height, image_width, _ = image.shape
          
            #comprobar que efectivamente se leen en el mismo orden porque tienen el mismo nombre

            with open(labels_files[index], 'r') as file: 
                lines = file.readlines()
            file.close()

            for line in lines: 
                class_id, x_center, y_center, width, height = map(float, line.strip().split())

                # Convert YOLO format to OpenCV format (x, y, width, height)
               
                x = int((x_center - width / 2) * image_width)
                y = int((y_center - height / 2) * image_height)
                w = int(width * image_width)
                h = int(height * image_height)
            
                 # Draw bounding box on the image
                cv2.rectangle(image, (x, y), (x + w, y + h), (255, 0, 0), 2)  # Green color, thickness=2
            
            name = os.path.basename(image_files[index])
            cv2.imwrite(os.path.join(labeled_dir, name), image)
            # labeled_images_full.append(os.path.join(labeled_dir, name))
            # labeled_images.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labeled_images", name))
        
        
            

            