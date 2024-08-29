import os 
import shutil 

def delete_training_folder(folder): 
    if os.path.exits(os.path.join(folder, "train"))
        shutil.rmtree(os.path.join(folder, "train"))
    if os.path.exits(os.path.join(folder, "val"))
        shutil.rmtree(os.path.join(folder, "val"))
    if os.path.exits(os.path.join(folder, "test"))
        shutil.rmtree(os.path.join(folder, "test"))