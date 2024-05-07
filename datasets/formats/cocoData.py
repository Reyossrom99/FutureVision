
import os
import random
import tempfile
import zipfile
from django.conf import settings
import cv2 as cv 
import pycocotools.coco as coco

class CocoData:
    #type: splits, no splits
    def __init__(self, name:str, type:str, zip_path:str):
        self.name = name
        self.type = type
        self.zip_path = zip_path
        self.dir_root = os.path.join(settings.MEDIA_ROOT, "tmp")
        self.zip_name = os.path.basename(zip_path.name).split(".zip")[0]
        self.tmp_dir = tempfile.mkdtemp(dir = self.dir_root)
        self.tmp_name = os.path.basename(self.tmp_dir)
        #list of extracted pages
        self.extracted_pages = []
        self.extracted_train = []
        self.extracted_val = []
        self.extracted_test = []
        self.labeled_images = []
        self.labeled_images_train = []
        self.labeled_images_val = []
        self.labeled_images_test = []
        #coco data
        self.coco_data = None
        self.image_name_to_id = None
        self.categories = None
        self.category_colors = None

    """
    Extracts the data from the zip file in the tmp directory
    """
    def extract_data_in_tmp(self, page_number:int, page_size:int, split:str="")  :
        if self.type == "no-splits" and page_number not in self.extracted_pages:
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                # Obtener lista de nombres de archivos en el zip
                file_list = zip_ref.namelist()

                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(file_list))

                # Extraer solo los archivos necesarios para la página actual
                extracted_files = []
                for file_name in file_list[start_index:end_index]:
                    zip_ref.extract(file_name, self.tmp_dir)
            self.extracted_pages.append(page_number)
        elif split == "train" and page_number not in self.extracted_train: 
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                # Obtener lista de nombres de archivos en el zip
                file_list = zip_ref.namelist()

                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(file_list))

                # Extraer solo los archivos necesarios para la página actual
                extracted_files = []
                for file_name in file_list[start_index:end_index]:
                    zip_ref.extract(file_name, os.path.join(self.tmp_dir, split))
            self.extracted_train.append(page_number)
        elif split == "val" and page_number not in self.extracted_val: 
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                # Obtener lista de nombres de archivos en el zip
                file_list = zip_ref.namelist()

                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(file_list))

                # Extraer solo los archivos necesarios para la página actual
                extracted_files = []
                for file_name in file_list[start_index:end_index]:
                    zip_ref.extract(file_name, os.path.join(self.tmp_dir, split))
            self.extracted_val.append(page_number)
        elif split == "test" and page_number not in self.extracted_test: 
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                # Obtener lista de nombres de archivos en el zip
                file_list = zip_ref.namelist()

                # Calcular el rango de archivos que se extraerán para la página actual
                start_index = (page_number - 1) * page_size
                end_index = min(start_index + page_size, len(file_list))

                # Extraer solo los archivos necesarios para la página actual
                extracted_files = []
                for file_name in file_list[start_index:end_index]:
                    zip_ref.extract(file_name, os.path.join(self.tmp_dir, split))
            self.extracted_test.append(page_number)

    """
     Gets the images from the tmp directory
    """
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
    
    """
        returns labeled images once the images have been saved in the labels directory 
    """
    def get_labeled_images(self, requested_split:str, page_number:int, page_size:int) -> list: 
        labeled = [] #ruta relatiava de las imagenes con label para mandarlas al front
        labeled_full = [] #ruta completa de las imagenes con label que necesita el back
        
        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size

        if self.type == "no-splits":
            root_path = os.path.join(self.tmp_dir, self.zip_name, "labeld_images")
        else: 
            root_path = os.path.join(self.tmp_dir, self.zip_name, "labeld_images", requested_split)
        
        labeled_files = sorted(os.listdir(root_path))[start_index:end_index] 
     
        for name in labeled_files: 
                if name.lower().endswith(('.png', '.jpg','.jpeg')): 
                    if self.type == "no-splits":
                        labeled_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labeld_images', name))
                        labeled.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, 'labeld_images', name))
                    else: 
                        labeled.append(os.path.join("/media", "tmp", self.tmp_name, self.zip_name, 'labeld_images', requested_split, name))
                        labeled_full.append(os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, 'labeld_images', requested_split, name))
        return labeled, labeled_full
    
    """
        saves the requested image with the annotations in the labels directory
        TODO-> VER QUE VOY A HACER CUANDO NO HAY ETIQUETAS DE ENTRENAMIENTO
    """
    def save_labels_in_image(self,requested_split:str, page_number:int, page_size:int)-> bool: 
        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size

        ##check if we have already saved the images with the labels
        if (self.type == "no-splits" and page_number in self.labeled_images) or (requested_split=="train" and page_number in self.labeled_images_train) or (requested_split=="val" and page_number in self.labeled_images_val) or (requested_split=="test" and page_number in self.labeled_images_test):
            return True
        #find the annotations folder 
        if self.type == "no-splits" or requested_split == "": 
            print("no splits")
            image_dir = os.path.join(settings.TMP_ROOT, self.tmp_dir, self.zip_name, "images")
            annotation_file = os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, "annotations.json")
            if not os.path.exists(os.path.join(self.tmp_dir, self.zip_name, "labeld_images")): 
                os.makedirs(os.path.join(self.tmp_dir, self.zip_name, "labeld_images"), exist_ok=False)
            images_label_dir = os.path.join(self.tmp_dir, self.zip_name, "labeld_images")
            #verificar que la imagen original ya ha sido extraida
            self.extract_data_in_tmp(page_number, page_size)
            self.labeled_images_train.append(page_number)    
        else: 
            print("splits")
            image_dir = os.path.join(settings.TMP_ROOT, self.tmp_dir, self.zip_name, requested_split)
            annotation_file = os.path.join(settings.TMP_ROOT, self.tmp_name, self.zip_name, "annotations", requested_split + ".json")
            if not os.path.exists(os.path.join(self.tmp_dir, self.zip_name, "labeld_images", requested_split)):
                os.makedirs(os.path.join(self.tmp_dir, self.zip_name, "labeld_images", requested_split), exist_ok=False)
            images_label_dir = os.path.join(self.tmp_dir, self.zip_name, "labeld_images", requested_split)
            #verificar que la imagen original ya ha sido extraida
            self.extract_data_in_tmp(page_number, page_size, requested_split)

            if requested_split == "train": 
                self.labeled_images_train.append(page_number)
            elif requested_split == "val": 
                self.labeled_images_val.append(page_number)
            elif requested_split == "test": 
                self.labeled_images_test.append(page_number)
            else: 
                return False

        if not os.path.exists(image_dir) or not os.path.exists(annotation_file): 
            return False
        
        
        # Obtener la lista de nombres de archivo de imágenes en image_dir
        image_files = os.listdir(image_dir)

        # Obtener la lista de nombres de archivo de imágenes en images_label_dir
        label_files = os.listdir(images_label_dir)

        # Filtrar las imágenes que están en image_dir pero no en images_label_dir
        images_to_process = [file for file in image_files if file not in label_files]

        # cargar anotaciones por primera vez 
        if self.coco_data is None or self.categories is None or self.image_name_to_id is None or self.category_colors is None:
            self.extract_annotations(annotation_file)
        
        # Procesar cada imagen
        for image_file in images_to_process:
            print("image file: ", image_file)
            img_path = os.path.join(image_dir, image_file)

            if not image_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue

            img = cv.imread(img_path)
            if img is None:
                print("image not found", img_path)
                continue

            # Obtener el ID de imagen para el archivo de imagen actual
            img_id = self.image_name_to_id.get(image_file)
            if img_id is None:
                print("Image ID not found for:", image_file)
                continue

            # Obtener las anotaciones de la imagen actual
            img_annotations_ids = self.coco_data.getAnnIds(imgIds=img_id)
            img_annotations = self.coco_data.loadAnns(img_annotations_ids)

            # Dibujar las bbox en la imagen
            for ann in img_annotations:
                bbox = ann['bbox']
                bbox = [int(x) for x in bbox]  # convertir a entero
                category_id = ann['category_id']
                category_name = next(cat['name'] for cat in self.categories if cat['id'] == category_id)
                color = self.category_colors.get(category_name, (0, 255, 0)) 
                # Todo: Cambiar a color aleatorio
                cv.rectangle(img, (bbox[0], bbox[1]), (bbox[0] + bbox[2], bbox[1] + bbox[3]), color, 2)
                cv.putText(img, category_name, (bbox[0], bbox[1] - 10), cv.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

            # Guardar la imagen con las anotaciones en el directorio de labeld_images
            cv.imwrite(os.path.join(images_label_dir, image_file), img)
            print("saved path: ", os.path.join(images_label_dir, image_file))
        
            
        return True
    
    """
    Extracts the annotations from the annotation file and saves them in the object
    """
    def extract_annotations(self, annotation_file:str): 
        #cargar las anotaciones
        self.coco_data = coco.COCO(annotation_file)
        # Crear un diccionario para mapear nombres de archivos de imagen a IDs de imagen
        self.image_name_to_id = {img['file_name']: img['id'] for img in self.coco_data.dataset['images']}
        # Obtener categorías
        self.categories = self.coco_data.loadCats(self.coco_data.getCatIds())
        category_names = [category['name'] for category in self.categories]
        # Definir una lista de colores aleatorios
        random.seed(42)  # Semilla para reproducibilidad
        self.category_colors = {category_name: (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for category_name in category_names}
        