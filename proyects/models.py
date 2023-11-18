from django.db import models
from datasets.models import Datasets
PROYECT_TYPE_CHOICES = (
    ('bbox', 'BBOX'), 
    ('mask', 'MASK'), 
    ('bbox+mask', 'BBOX+MASK')
)

class Proyects(models.Model): 
    proyect_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(auto_now_add=True)
    type = models.CharField(choices=PROYECT_TYPE_CHOICES, default='bbox')
    dataset = models.ForeignKey(Datasets, on_delete=models.CASCADE)
    #Si borramos un dataset tambien se borra el modelo asociado a el