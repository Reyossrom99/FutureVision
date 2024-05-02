
import os
import tempfile
import zipfile
from django.conf import settings


class CocoData () :
    #type: splits, no splits
    def __init__(self, name:str, type:str, zip_path:str) -> None:
        self.name = name
        self.type = type
        self.zip_path = zip_path
        self.dir_root = os.path.join(settings.MEDIA_ROOT, "tmp")
        self.tmp_dir = tempfile.mkdtemp(dir = self.dir_root)
        self.tmp_name = os.path.basename(self.tmp_dir)
        self.labeled_images = False #indica si se ha creado un directorio para imagenes con label
        self.is_tmp = False #variable to check if tmp dir is created

    """
    Extracts the data from the zip file in the tmp directory
    """
    def extract_data_in_tmp(self)  :
        with zipfile.ZipFile(self.zip_path, 'r') as zip_ref: 
            zip_ref.extractall(self.tmp_dir)
        zip_ref.close()
        self.is_tmp = True
    """
     Gets the images from the tmp directory
    """
    def get_images(self, requested_split:str) -> list: 
        
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
    
    def get_labeled_images(self, requested_split:str) -> list: 
        pass 