import math
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

    image_formats = (
    ".bmp", ".dib", ".jpeg", ".jpg", ".jpe", ".jp2", ".png", ".webp", 
    ".avif", ".pbm", ".pgm", ".ppm", ".pxm", ".pnm", ".pfm", ".sr", 
    ".ras", ".tiff", ".tif", ".exr", ".hdr", ".pic"
    )

    def __init__(self, name:str, type:str, zip_path:str) -> None:
        self.name = name
        self.type = type #determines if the dataset has splits
        self.zip_path = zip_path
        self.zip_name = os.path.basename(zip_path.name).split(".zip")[0]
        self.dir_root = os.path.join(settings.MEDIA_ROOT, "tmp")
        self.tmp_dir = tempfile.mkdtemp(dir = self.dir_root)
        os.chmod(self.tmp_dir, 0o755) 
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
        #modifications
        self.modify = False 
        self.modify_splits= {"train": [], "val": [], "test": []}
        self.modify_splits_labels = {"train": [], "val": [], "test": []}
        #has test labels 
        self.hasTest = True

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

        if split=="" and page_number not in self.extracted_pages:
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:

                file_list_no_splits = [file_name for file_name in self.file_list if file_name.lower().endswith(self.image_formats)]
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
               
                if self.modify == True:
                    
                    file_list_train = [file_name for file_name in self.modify_splits["train"] if file_name.lower().endswith(self.image_formats) ]
                    file_list_train_txt = [file_name for file_name in self.modify_splits_labels["train"] if file_name.lower().endswith('.txt')]
                    
                    start_index = (page_number -1)*page_size
                    end_index =min(start_index + page_size, len(self.file_list)) 

                    interchange_folder = os.path.join(settings.MEDIA_ROOT, self.tmp_dir, self.zip_name, "change")
                    if not os.path.exists(interchange_folder): 
                        os.mkdir(interchange_folder)

                    images_train = os.path.join(settings.MEDIA_ROOT, self.tmp_dir, self.zip_name, "train", "images")
                    labels_train = os.path.join(settings.MEDIA_ROOT,self.tmp_dir, self.zip_name, "train", "labels")

                    if not os.path.exists(images_train): 
                        os.makedirs(images_train)
                    
                    if not os.path.exists(labels_train): 
                        os.makedirs(labels_train)
                    
                    for file_name in file_list_train[start_index:end_index]: 
                        try: 
                            zip_ref.extract(file_name, interchange_folder)
                        
                            base_name = os.path.basename(file_name)
                       
                            shutil.move(os.path.join(interchange_folder, self.zip_name, "images", base_name), os.path.join(images_train, base_name) )
                        except Exception as e: 
                           pass

                    for file_name in file_list_train_txt[start_index:end_index]: 
                        try: 
                            zip_ref.extract(file_name, interchange_folder)
                            base_name = os.path.basename(file_name)
                            shutil.move(os.path.join(interchange_folder, self.zip_name, "labels", base_name), os.path.join(labels_train, base_name) )
                        except Exception as e: 
                            pass
                else: 
                    file_list_train = [file_name for file_name in self.file_list if 'train' in file_name and file_name.lower().endswith(self.image_formats)]
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
                if self.modify == True:
                    file_list_val = [file_name for file_name in self.modify_splits["val"] if file_name.lower().endswith(self.image_formats) ]
                    file_list_val_txt = [file_name for file_name in self.modify_splits_labels["val"] if file_name.lower().endswith('.txt')]
                    
                    interchange_folder = os.path.join(settings.MEDIA_ROOT, self.tmp_dir, self.zip_name, "change")
                    if not os.path.exists(interchange_folder): 
                        os.mkdir(interchange_folder)
                    
                    # Calcular el rango de archivos que se extraerán para la página actual
                    start_index = (page_number - 1) * page_size
                    end_index = min(start_index + page_size, len(self.file_list))

                    images_val = os.path.join(settings.MEDIA_ROOT, self.tmp_dir, self.zip_name, "val", "images")
                    labels_val = os.path.join(settings.MEDIA_ROOT,self.tmp_dir, self.zip_name, "val", "labels")

                    if not os.path.exists(images_val): 
                        os.makedirs(images_val)
                    
                    if not os.path.exists(labels_val): 
                        os.makedirs(labels_val)
                    
                    for file_name in file_list_val[start_index:end_index]: 
                        try: 
                            zip_ref.extract(file_name, interchange_folder)
                        
                            base_name = os.path.basename(file_name)
                       
                            shutil.move(os.path.join(interchange_folder, self.zip_name, "images", base_name), os.path.join(images_val, base_name) )
                        except Exception as e: 
                            pass

                    for file_name in file_list_val_txt[start_index:end_index]: 
                        try: 
                            zip_ref.extract(file_name, interchange_folder)
                            base_name = os.path.basename(file_name)
                            shutil.move(os.path.join(interchange_folder, self.zip_name, "labels", base_name), os.path.join(labels_val, base_name) )
                        except Exception as e: 
                            pass
                else: 
                    # Obtener lista de nombres de archivos en el zip
                    file_list_val= [file_name for file_name in self.file_list if 'val' in file_name and file_name.lower().endswith(self.image_formats)]
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
                if self.modify == True:
                    file_list_test = [file_name for file_name in self.modify_splits["test"] if file_name.lower().endswith(self.image_formats) ]
                    file_list_test_txt = [file_name for file_name in self.modify_splits_labels["test"] if file_name.lower().endswith('.txt')]
                    
                    # Calcular el rango de archivos que se extraerán para la página actual
                    start_index = (page_number - 1) * page_size
                    end_index = min(start_index + page_size, len(self.file_list))
    
                    interchange_folder = os.path.join(settings.MEDIA_ROOT, self.tmp_dir, self.zip_name, "change")
                    if not os.path.exists(interchange_folder): 
                        os.mkdir(interchange_folder)

                    images_test = os.path.join(settings.MEDIA_ROOT, self.tmp_dir, self.zip_name, "test", "images")
                    labels_test = os.path.join(settings.MEDIA_ROOT,self.tmp_dir, self.zip_name, "test", "labels")

                    if not os.path.exists(images_test): 
                        os.makedirs(images_test)
                    
                    if not os.path.exists(labels_test): 
                        os.makedirs(labels_test)
                    
                    for file_name in file_list_test[start_index:end_index]: 
                        try: 
                            zip_ref.extract(file_name, interchange_folder)
                        
                            base_name = os.path.basename(file_name)
                       
                            shutil.move(os.path.join(interchange_folder, self.zip_name, "images", base_name), os.path.join(images_test, base_name) )
                        except Exception as e: 
                            pass

                    for file_name in file_list_test_txt[start_index:end_index]: 
                        try: 
                            zip_ref.extract(file_name, interchange_folder)
                            base_name = os.path.basename(file_name)
                            shutil.move(os.path.join(interchange_folder, self.zip_name, "labels", base_name), os.path.join(labels_test, base_name) )
                        except Exception as e: 
                            pass
                else: 
                    file_list_test = [file_name for file_name in self.file_list if 'test' in file_name and file_name.lower().endswith(self.image_formats)]
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
        
        if self.type == "no-splits" and self.modify == False: 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "images")
        else: 
            #get the images by split 
            root_path = os.path.join(self.tmp_dir, self.zip_name, requested_split, "images")

        image_files = sorted(os.listdir(root_path))[start_index:end_index]

        
        
        for name in image_files: 
                if name.lower().endswith(self.image_formats): 
                    (self.type, self.modify)
                    if self.type == "no-splits" and self.modify ==False:
                       
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
        
        if self.type == "no-splits" and self.modify== False: 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "labels")
        else: 
            root_path = os.path.join(self.tmp_dir, self.zip_name, requested_split, "labels")
        label_files = sorted(os.listdir(root_path))[start_index:end_index]
        
        for name in label_files: 
                if name.lower().endswith('.txt'): 
                    if self.type == "no-splits" and self.modify == False:
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

        if self.type == "no-splits" and self.modify == False: 
                root_path = os.path.join(self.tmp_dir, self.zip_name, "labeled_images")
        else: 
                root_path = os.path.join(self.tmp_dir, self.zip_name, 'labeled_images', requested_split)
        
        files = os.listdir(root_path)[start_index:end_index]
        
        for name in files: 
                if name.lower().endswith(self.image_formats): 
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
 
        if self.type=='no-splits' and self.modify==False: 
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
                random.seed(42) 
                self.category_colors = {category_name: (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for category_name in self.class_names}

        for index in range(0, len(labels_files)): 

            image = cv2.imread(image_files[index], cv2.IMREAD_UNCHANGED)

            image_height, image_width, _ = image.shape
         
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
                    cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)

                    # Get class name
                    class_name = self.class_names[int(class_id)]

                    # Add class name to the image
                    cv2.putText(image, class_name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
                
                except: 
                    continue
                name = os.path.basename(image_files[index])
                cv2.imwrite(os.path.join(labeled_dir, name), image)
            # labeled_images_full.append(os.path.join(labeled_dir, name))
            # labeled_images.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labeled_images", name))
        
        
    """
        Creates temporal splits for the dataset 
    """                    
    def create_splits(self, train:int, val:int, test:int, num_images:int=0): 

        if self.modify == True: 
            return False, "The dataset has already been modified", 0, 0, 0
        
        if self.file_list is None:
            self.file_list = zipfile.ZipFile(self.zip_path, 'r').namelist()
        
        
        #seleccionamos los elementos que van a ir a cada split de manera aletoria 
        train_number = math.ceil((train/100)*num_images)
        val_number = math.ceil((val/100)*num_images)
        test_number = num_images - train_number - val_number
        
       

        if train_number + val_number + test_number != num_images: 
            return False, "The number of images in the splits is not equal to the total number of images"
        
       
        self.modify_splits["train"] = random.sample([x for x in self.file_list if x.lower().endswith(self.image_formats)], train_number)
        self.modify_splits["val"] = random.sample([x for x in self.file_list if x not in self.modify_splits["train"] and x.lower().endswith(self.image_formats)], val_number)
        self.modify_splits["test"] = [x for x in self.file_list if x not in self.modify_splits["train"] and x not in self.modify_splits["val"] and x.lower().endswith(self.image_formats)]
        
        self.modify_splits_labels["train"] = random.sample([x for x in self.file_list if x.lower().endswith(('.txt'))], train)
        self.modify_splits_labels["val"] = random.sample([x for x in self.file_list if x not in self.modify_splits["train"] and x.lower().endswith(('.txt'))], val)
        self.modify_splits_labels["test"] = [x for x in self.file_list if x not in self.modify_splits["train"] and x not in self.modify_splits["val"] and x.lower().endswith(('.txt'))]

        self.modify = True
        return self.modify, "The splits have been created", train_number, val_number, test_number
    
    def save_modifications(self): 
        
        if self.modify == False: 
            return False, "The dataset has not been modified", 0, 0, 0

        temp_zip_path = os.path.join(settings.MEDIA_ROOT, "zip_data", self.name, self.zip_name + "_temp.zip")
        
        train_imgs = len(self.modify_splits["train"])
        val_imgs = len(self.modify_splits["val"])
        test_imgs = len(self.modify_splits["test"])
    
        with zipfile.ZipFile(self.zip_path, 'r') as zip_ref: 
            with zipfile.ZipFile(temp_zip_path, 'w') as tmp_zip:
                for item in zip_ref.infolist():
                   
                    if item.filename in self.modify_splits["train"]:
                        new_path = os.path.join(self.zip_name.split(".zip")[0], "train", "images", os.path.basename(item.filename))
                    elif item.filename in self.modify_splits["val"]:
                        new_path = os.path.join(self.zip_name.split(".zip")[0], "val", "images", os.path.basename(item.filename))
                    elif item.filename in self.modify_splits["test"]:
                        new_path = os.path.join(self.zip_name.split(".zip")[0], "test", "images", os.path.basename(item.filename))
                    elif item.filename in self.modify_splits_labels["train"]:
                        new_path = os.path.join(self.zip_name.split(".zip")[0], "train", "labels", os.path.basename(item.filename))
                    elif item.filename in self.modify_splits_labels["val"]:
                        new_path = os.path.join(self.zip_name.split(".zip")[0], "val", "labels", os.path.basename(item.filename))
                    elif item.filename in self.modify_splits_labels["test"]:
                        new_path = os.path.join(self.zip_name.split(".zip")[0], "test", "labels", os.path.basename(item.filename))
                    elif item.filename.endswith("data.yaml"): 
                       
                        new_path = os.path.join(item.filename)
                    else: 
                        continue


                    tmp_zip.writestr(os.path.join(new_path), zip_ref.read(item.filename))
        
   
            os.replace(temp_zip_path, os.path.join(settings.MEDIA_ROOT, self.zip_path.name))

            self.modify = False
            self.type = "splits"
           
        return True, "The modifications have been saved", train_imgs, val_imgs, test_imgs
    
    def delete_tmp(self):
        if not os.path.exists(self.tmp_dir):
            return False, "The temporary directory does not exist"
        else : 
            shutil.rmtree(self.tmp_dir)
            return True, "The temporary directory has been deleted"
    
    def delete_splits(self): 
        if self.modify != True:
            return False, "The dataset has not been modified"
        #delete the zip folders for the splits
        with zipfile.ZipFile(self.zip_path, 'a') as zip_ref:
            for carpeta_destino in ["train", "val", "test"]:
                zip_ref.remove(os.path.join(self.zip_name, carpeta_destino, "images/"))
                zip_ref.remove(os.path.join(self.zip_name, carpeta_destino, "labels/"))
        #delete the splits 
        self.modify_splits = {"train": [], "val": [], "test": []}
        self.modify_splits_labels = {"train": [], "val": [], "test": []}
    
        #delete the folders from the temporary directory
        shutil.rmtree(os.path.join(self.tmp_dir, self.zip_name, "train"))
        shutil.rmtree(os.path.join(self.tmp_dir, self.zip_name, "val"))
        shutil.rmtree(os.path.join(self.tmp_dir, self.zip_name, "test"))


        self.modify = False
        return True, "The splits have been deleted"
    
    def delete_zip(self): 
        if os.path.exists(os.path.join(settings.MEDIA_ROOT, self.zip_path.name)):
            os.remove(os.path.join(settings.MEDIA_ROOT, self.zip_path.name))
            shutil.rmtree(os.path.join(settings.MEDIA_ROOT, "zip_data", self.name))
            return True, "The zip file has been deleted"
        else : 
            return False, "The zip file does not exist"
     

    def delete_cover(self): 
        if not os.path.exists(os.path.join(settings.MEDIA_ROOT, "covers", self.name)):
            return False, "The temporary directory does not exist"
        else : 
            shutil.rmtree(os.path.join(settings.MEDIA_ROOT, "covers", self.name))
            return True, "The temporary directory has been deleted"

                
    
    def delete_all (self): 

        check, err = self.delete_tmp()

        if check != True: 
            return False, err

        check, err = self.delete_zip()

        if check != True: 
            return False, err

        check, err =self.delete_cover()

        if check!= True: 
            return False, err


        return True, "The zip file and the temporary directory have been deleted"

    def delete_image(self, image_name): 

        if self.modify == True: 
            return False, "Save the modifications before deleting an image", ""
        
        image_label = image_name.split(".")[0] + ".txt"
        image_split= ""

        if self.type == "no-splits":
            try: 
                with zipfile.ZipFile(self.zip_path, 'a') as zip_ref:
                    zip_ref.remove(os.path.join(self.zip_name, "images", image_name))
                    zip_ref.remove(os.path.join(self.zip_name, "labels", image_label))
            except KeyError:
                return False, "The image does not exist", ""
            except Exception as e: 
                return False, str(e) 
        else: 
            try: 
                with zipfile.ZipFile(self.zip_path, 'a') as zip_ref:
                    for split in ["train", "val", "test"]:
                        image_path = os.path.join(self.zip_name, split, "images", image_name)
                        label_path = os.path.join(self.zip_name, split, "labels", image_label)
                        if image_path in self.file_list: 
                            image_split = split
                            zip_ref.remove(image_path)
                        if label_path in self.file_list:
                            image_split = split 
                            zip_ref.remove(label_path)
                            break 
            except KeyError:
                return False, "The image does not exist", ""
            except Exception as e:
                return False, str(e), ""
            
        #clean the tmp folder of the image
        check, err = self.delete_tmp()
        if check != True: 
            return False, err, ""
        
        return True, "The image has been deleted", image_split


    def add_url(self, images):
        images_url = []
        for img in images: 
            img = "http://localhost:4004" +img
            images_url.append(img)
        return images_url
