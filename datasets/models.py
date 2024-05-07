from django.db import models
from django.contrib.auth.models import User

DATASET_TYPE_CHOICES = (
    ('splits', 'Splits'),
    ('no-splits', 'No-Splits'),
) 
DATASET_FORMAT_CHOICES = (
    ('Yolo', 'yolo'), 
    ('Coco', 'coco'),
)


#Saves the saved file to /media/zip_data/name_dataset/name_zipFile
def upload_zip_file(instance,filename):
    print("upload") 
    print(instance)
    print(filename)
    return "/".join(['zip_data', str(instance.name), filename])


class Datasets(models.Model):
    dataset_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    uploaded_date = models.DateTimeField(auto_now_add=True)
    url = models.FileField(blank= True, null=True, upload_to=upload_zip_file)
    type = models.CharField(max_length=10, choices=DATASET_TYPE_CHOICES, default='splits')
    format = models.CharField(max_length=10, choices=DATASET_FORMAT_CHOICES, default='coco')
    is_public = models.BooleanField(default=False) 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    num_images = models.IntegerField(default=0)
    
    
 

    def __str__(self):
        return self.name


