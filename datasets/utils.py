import os 
import zipfile
from django.conf import settings
import tempfile
import shutil
ERROR_CODE = 400
OK_CODE = 200

"""
    Checks whether the dataset is structure in yolo format corretly
"""
def check_yolo_format(temp_dir,type): 
    subdirectories = []
    for root, dirs, files in os.walk(temp_dir): 
        #get to the second labels of subdirectories
        if root.counts(os.path.sep) - temp_dir.count(os.path.sep) == 2: 
            subdirectories.extend(dirs)

    for subdirectory in subdirectories: 
        print(subdirectory)


"""
    Check whether the dataset is saved in the type that is indicated in the type file of it
"""
def check_correct_form(zip_path, type, format): 
    temp_dir = tempfile.mkdtemp()
    try: 
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        if format == "yolo": 
            check_yolo_format(temp_dir, type)
        return OK_CODE
                
    finally: 
        shutil.rmtree(temp_dir)


def extract_cover_from_zip(zip_path, dataset_name): 
     # Create a temporary directory to extract the zip file
    temp_dir = tempfile.mkdtemp()

    try:
        # Extract the zip file to the temporary directory
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        # Search for image files in the temporary directory and select the first one
        for root, _, files in os.walk(temp_dir):
            for filename in files:
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                    image_path = os.path.join(root, filename)
                
                   
                    image_path_striped = image_path.split("/")
                    image_name = image_path_striped[len(image_path_striped) - 1]
                 
                   
                    if os.path.exists(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name))) == False: 
                        os.mkdir(os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))
                        shutil.copy(image_path, os.path.join(settings.MEDIA_ROOT, "covers", str(dataset_name)))

                    print(settings.MEDIA_ROOT)
                    print(str(dataset_name))
                    print(str(image_name))

                    image_media_path = os.path.join("/media", "covers",str(dataset_name), str(image_name))
                    print(f"Image final path: {image_media_path}" )

                    return image_media_path # Return the path to the first image found

        return None  # No image files found
    finally:
        # Clean up the temporary directory
       
        shutil.rmtree(temp_dir)