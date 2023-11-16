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
        
        
    """
        Funcion que sirve para convertir un dataset en formato no-splits a un dataset en formato splits
    """

    def convert_to_splits(self, porcentajes:list): 

        #si ha tiene los splits hechos
        if self.type == 'splits' or len(porcentajes)!=3: 
            return 
        
        #dentro de la carpeta tmp que tiene el siguiente formato: 
        # root
            #images
            #labels
        #creo una nueva carpeta que se llame splits 

        if not os.path.exists(os.path.join(self.tmp_dir, self.tmp_name, 'splitted')): 
            os.makedirs(os.path.join(self.tmp_dir, self.tmp_name, 'splitted', 'train', 'labels'), exist_ok=True)
            os.makedirs(os.path.join(self.tmp_dir, self.tmp_name, 'splitted', 'train', 'images'), exist_ok=True)
            os.makedirs(os.path.join(self.tmp_dir, self.tmp_name, 'splitted', 'val', 'images'), exist_ok=True)
            os.makedirs(os.path.join(self.tmp_dir, self.tmp_name, 'splitted', 'val', 'labels'), exist_ok=True)
            os.makedirs(os.path.join(self.tmp_dir, self.tmp_name, 'splitted', 'test', 'images'), exist_ok=True)
            os.makedirs(os.path.join(self.tmp_dir, self.tmp_name, 'splitted', 'test', 'labels'), exist_ok=True)

        splitted_root = os.path.join(self.tmp_dir, self.tmp_name, 'splitted')
        base_root = os.path.join(self.tmp_dir, self.tmp_name)
        
        #de momento los porcentajes van a ser 70->test, 20->val 10->test
        #cuento los labels que hay
        labels = os.listdir(os.path.join(base_root, 'labels'))
        cnt_labels = len(labels)

        #train split
        cnt_train = cnt_labels * porcentajes[0]
        for i in range(0, cnt_train): 
            name_label = labels.pop()
            name_img = name_label.split(".")[0] + ".jpg"
            shutil.copy(os.path.join(base_root, 'images', name_img), os.path.join(splitted_root, 'train', 'images', name_img))
            shutil.copy(os.path.join(base_root, 'labels', name_label), os.path.join(splitted_root, 'train', 'labels', name_label))

        #val split
        cnt_val= cnt_labels * porcentajes[1]
        for i in range(0, cnt_val): 
            name_label = labels.pop()
            name_img = name_label.split(".")[0] + ".jpg"
            shutil.copy(os.path.join(base_root, 'images', name_img), os.path.join(splitted_root, 'val', 'images', name_img))
            shutil.copy(os.path.join(base_root, 'labels', name_label), os.path.join(splitted_root, 'val', 'labels', name_label))

        #test split
        cnt_test = cnt_labels * porcentajes[2]
        for i in range(0, cnt_test): 
            name_label = labels.pop()
            name_img = name_label.split(".")[0] + ".jpg"
            shutil.copy(os.path.join(base_root, 'images', name_img), os.path.join(splitted_root, 'test', 'images', name_img))
            shutil.copy(os.path.join(base_root, 'labels', name_label), os.path.join(splitted_root, 'test', 'labels', name_label))
    
    def save_splits_created(self): 
         
        if not os.path.exists(os.path.join(self.tmp_dir, self.tmp_name, 'splitted')): 
            return 
        os.makedirs(os.path.join(self.tmp_dir,self.name, 'zip'))
        #en el argumento cambiar a la carpeta donde se va a guardar en zip
        with zipfile.ZipFile(os.path.join(self.tmp_dir, self.name, 'zip'), 'w', zipfile.ZIP_DEFLATED) as zipf:
            for folder, _, files in os.walk(os.path.join(self.tmp_dir, self.name, 'splitted')):
                for file in files:
                    file_path = os.path.join(folder, file)
                    arcname = os.path.relpath(file_path, os.path.join(self.tmp_dir, self.name, 'splitted'))  # Maintain directory structure
                    zipf.write(file_path, arcname=arcname)
                        
        
