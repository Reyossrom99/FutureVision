import os 
import random
import zipfile
from django.conf import settings
import tempfile
import shutil
import json 
import time
import cv2 
import numpy as np
import yaml

class YoloData: 

    def __init__(self, name:str, type:str, zip_path:str) -> None:
        self.name = name
        self.type = type #determines if the dataset has splits
        self.zip_path = zip_path
        self.zip_name = os.path.basename(zip_path.name).split(".zip")[0]
        self.dir_root = os.path.join(settings.MEDIA_ROOT, "tmp")
        self.tmp_dir = tempfile.mkdtemp(dir = self.dir_root)
        self.tmp_name = os.path.basename(self.tmp_dir)
        self.extracted_pages = []
        self.extracted_train = []
        self.extracted_val = []
        self.extracted_test = []
        self.labeled_images = []
        self.labeled_images_train = []
        self.labeled_images_val = []
        self.labeled_images_test = []
        self.file_list = None
        self.class_names = None

    """
        Extracts the data from the zip file into a temporary directory
    """
    def extract_data_in_tmp(self, page_number:int, page_size:int, split:str=""):
        if self.file_list is None:
            self.file_list = zipfile.ZipFile(self.zip_path, 'r').namelist()
            data_yaml_file = [file_name for file_name in self.file_list if file_name.endswith('data.yaml')]
            #extracts data yaml file 
            if data_yaml_file:
                data_yaml_file = data_yaml_file[0]  
                with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                    zip_ref.extract(data_yaml_file, self.tmp_dir)

        if self.type == "no-splits" and page_number not in self.extracted_pages:
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:

                file_list_no_splits = [file_name for file_name in self.file_list if file_name.lower().endswith(('.jpg', '.jpeg', '.png'))]
                file_list_no_splits_txt = [file_name for file_name in self.file_list if file_name.lower().endswith('.txt')]
                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(self.file_list))
                
               
                for file_name in file_list_no_splits[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)
                for file_name in file_list_no_splits_txt[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)   
            self.extracted_pages.append(page_number)

        elif split == "train" and page_number not in self.extracted_train: 
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                # Obtener lista de nombres de archivos en el zip
                file_list_train = [file_name for file_name in self.file_list if 'train' in file_name and file_name.lower().endswith(('.jpg', '.jpeg', '.png'))]
                file_list_train_txt = [file_name for file_name in self.file_list if 'train' in file_name and file_name.lower().endswith('.txt')]

                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(self.file_list))
                
                for file_name in file_list_train[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)
                for file_name in file_list_train_txt[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)    
            self.extracted_train.append(page_number)

        elif split == "val" and page_number not in self.extracted_val: 
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                # Obtener lista de nombres de archivos en el zip
                file_list_val= [file_name for file_name in self.file_list if 'val' in file_name and file_name.lower().endswith(('.jpg', '.jpeg', '.png'))]
                file_list_val_txt = [file_name for file_name in self.file_list if 'val' in file_name and file_name.lower().endswith('.txt')]
                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(self.file_list))

                for file_name in file_list_val[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)
                for file_name in file_list_val_txt[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)    
            self.extracted_val.append(page_number)

        elif split == "test" and page_number not in self.extracted_test: 
        
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                # Obtener lista de nombres de archivos en el zip
                file_list_test = [file_name for file_name in self.file_list if 'test' in file_name and file_name.lower().endswith(('.jpg', '.jpeg', '.png'))]
                file_list_test_txt = [file_name for file_name in self.file_list if 'test' in file_name and file_name.lower().endswith('.txt')]
                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(self.file_list))

               
                for file_name in file_list_test[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)
                for file_name in file_list_test_txt[start_index:end_index]: 
                    zip_ref.extract(file_name, self.tmp_dir)

            self.extracted_test.append(page_number)

    #obtiene una list que contiene las rutas de todas las imagenes de la carpeta
    def get_images(self, requested_split:str, page_number:int, page_size:int) -> list: 
        
        images = []  #ruta relativa de las imagenes para mandarlas al front
        images_full = [] #ruta completa de las imagenes que necesita el back

        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size
        
        if not os.path.exists(self.tmp_dir): 
            return images, images_full
        
        if self.type == "no-splits": 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "images")
        else: 
            #get the images by split 
            root_path = os.path.join(self.tmp_dir, self.zip_name, requested_split, "images")

        image_files = sorted(os.listdir(root_path))[start_index:end_index]
        
        for name in image_files: 
                if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                    if self.type == "no-splits":
                        images_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'images', name))
                        images.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name,'images',name))
                    else: 
                        images.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, requested_split,'images',name))
                        images_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, requested_split ,'images', name))
        return images, images_full
    
    
    def get_labels(self, requested_split:str, page_number:int, page_size: int) -> list: 
        labels = [] #ruta relativa
        labels_full = [] #ruta completa

        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size

        if not os.path.exists(self.tmp_dir): 
            return labels, labels_full
        
        if self.type == "no-splits": 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "labels")
        else: 
            root_path = os.path.join(self.tmp_dir, self.zip_name, requested_split, "labels")
        label_files = sorted(os.listdir(root_path))[start_index:end_index]
        
        for name in label_files: 
                if name.lower().endswith('.txt'): 
                    if self.type == "no-splits":
                        labels.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labels", name))
                        labels_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labels', name))
                    else: 
                        labels.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name,requested_split, "labels", name))
                        labels_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, requested_split,'labels', name))
        return labels, labels_full
    
    def get_labeled_images(self, requested_split:str, page_number:int, page_size:int) -> list: 
        labeled = []
        labeled_full = []

        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size

        if not os.path.exists(self.tmp_dir): 
            return labeled, labeled_full

        if self.type == "no-splits": 
                root_path = os.path.join(self.tmp_dir, self.zip_name, "labeled_images")
        else: 
                root_path = os.path.join(self.tmp_dir, self.zip_name, 'labeled_images', requested_split)
        
        files = os.listdir(root_path)[start_index:end_index]
        
        for name in files: 
                if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                    if self.type == "no-splits": 
                        labeled.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labeled_images", name))
                        labeled_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labeled_images', name))
                    else: 
                        labeled.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labeled_images", requested_split,name))
                        labeled_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labeled_images', requested_split, name))
        return labeled, labeled_full
  
    def save_labels_in_image(self, image_files:list, labels_files:list, requested_split:str, page_number:int) : 
        #no nececesito calcular el tamaño del paginador porque ya le estoy pasando las imagenes que quiero, pero si 
        # necesito el page_number para saber si ya he guardado o no las imagenes
        if not image_files or not labels_files: 
           return 

        if len(image_files) != len(labels_files): 
            return 

        if self.type=='no-splits': 
            ##already saved images
            if page_number in self.labeled_images: 
                return 
            labeled_dir = os.path.join(self.tmp_dir, self.zip_name, 'labeled_images')
            if not os.path.exists(labeled_dir):
                os.makedirs(labeled_dir, exist_ok=False) #raises an error if the directory already exists
            self.labeled_images.append(page_number)
        else:
                #already saved images
                if (page_number in self.labeled_images_train and requested_split=="train")or (page_number in self.labeled_images_val and requested_split=="val") or (page_number in self.labeled_images_test and requested_split=="test"): 
                    return
                labeled_dir = os.path.join(self.tmp_dir, self.zip_name, 'labeled_images', requested_split)
                #solo creamos el archivo la primera vez
                if not os.path.exists(labeled_dir):
                    os.makedirs(labeled_dir, exist_ok=False)
                if requested_split == "train": 
                    self.labeled_images_train.append(page_number)
                elif requested_split == "val": 
                    self.labeled_images_val.append(page_number)
                elif requested_split == "test": 
                    self.labeled_images_test.append(page_number)
                else: 
                    return False

        #get class names 
        if self.class_names is None:
            with open(os.path.join(self.tmp_dir, self.zip_name, "data.yaml"), 'r') as yaml_file:
                data = yaml.safe_load(yaml_file)
                self.class_names = data['names']
                random.seed(42)  # Semilla para reproducibilidad
                self.category_colors = {category_name: (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for category_name in self.class_names}

        for index in range(0, len(image_files)): 
            image = cv2.imread(image_files[index], cv2.IMREAD_UNCHANGED)

            image_height, image_width, _ = image.shape
          
            #comprobar que efectivamente se leen en el mismo orden porque tienen el mismo nombre

            with open(labels_files[index], 'r') as file: 
                lines = file.readlines()
            file.close()

            for line in lines: 
                try: 
                    class_id, x_center, y_center, width, height = map(float, line.strip().split())

                    # Convert YOLO format to OpenCV format (x, y, width, height)
                
                    x = int((x_center - width / 2) * image_width)
                    y = int((y_center - height / 2) * image_height)
                    w = int(width * image_width)
                    h = int(height * image_height)
                
                    color = self.category_colors[self.class_names[int(class_id)]]
                    # Draw bounding box on the image
                    cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)  # Green color, thickness=2

                     # Obtener el nombre de la clase correspondiente
                    class_name = self.class_names[int(class_id)]

                    # Agregar el nombre de la clase a la imagen
                    cv2.putText(image, class_name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
                
                except: 
                    print("Error en la linea", line)
                    continue
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
                        
        
