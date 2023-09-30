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

    def extract_data_in_tmp(self) -> bool :
        with zipfile.ZipFile(self.zip_path, 'r') as zip_ref: 
            zip_ref.extractall(self.tmp_dir)
        zip_ref.close()
        return True
    
    """
        falta por implemenenta el metodo de splits creados en todos los metodos
    """
    #obtiene una list que contiene las rutas de todas las imagenes de la carpeta
    def get_images(self) -> list: 
        images = []
        if not os.path.exists(self.tmp_dir): 
            return images 
        
        if self.type == "no-splits": 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "images")
        else: 
            return images
        
        print(f"Directorio de lectura temporal: {root_path}")

        for root, directories, files in os.walk(root_path): 
            for name in files: 
                if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                    images.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name,'images',name))
        return images
    
    def get_labels(self) -> list: 
        labels = []
        if not os.path.exists(self.tmp_dir): 
            return labels
        
        if self.type == "no-splits": 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "labels")
        else: 
            return labels
        
        for root, directories, files in os.walk(root_path): 
            for name in files: 
                if name.lower().endswith('.txt'): 
                    labels.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, "labels", name))
        return labels
    
    """
        CORREGUIR LOS PATH PORQUE TIENE QUE HABER OTRA FORMA MAS OPTIMA DE HACERLO
    """
    def show_labels_in_image(self, image_files:list, labels_files:list) -> list: 
        labeled_images = []
        if not image_files or not labels_files: 
           return  labeled_images
      

        #hay que añadirle el root directory para que lea la imagen bien
        for image_file in image_files: 
            # Split the path
            path_components = image_file.split(os.path.sep)

            # Find the index of '/tmp'
            tmp_index = path_components.index('tmp')

            # Extract the path from '/tmp' onwards
            extracted_path = os.path.sep.join(path_components[tmp_index:])

            
            root_image = os.path.join(settings.MEDIA_ROOT, extracted_path)
            image = cv2.imread(root_image)

            ##########################################################
            modified_path = extracted_path.replace('images', 'labels')
            label_file = os.path.splitext(image_file)[0] + ".txt"
         
            label_path = os.path.join(settings.MEDIA_ROOT, modified_path)
            root_label = os.path.splitext(label_path)[0] + ".txt"
            ########################################################
          # Open and read the labels file
            with open(root_label, 'r') as file:
                lines = file.readlines()

            # Process each line in the labels file
            for line in lines:
                # Split the line into individual values (class, x_center, y_center, width, height)
                class_id, x_center, y_center, width, height = map(float, line.strip().split())

                # Assuming class_id is 0-based (0, 1, 2, ...) for indexing purposes

                # Convert YOLO format to OpenCV format (x, y, width, height)
                image_height, image_width, _ = image.shape
                x = int((x_center - width / 2) * image_width)
                y = int((y_center - height / 2) * image_height)
                w = int(width * image_width)
                h = int(height * image_height)

                # Draw bounding box on the image
                cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Green color, thickness=2

            # Display the image with bounding boxes
            # cv2.imshow("Image with Bounding Box", image)
            # cv2.waitKey(0)
            # cv2.destroyAllWindows()

            
            #crear el directorio y guardar las imagenes 
