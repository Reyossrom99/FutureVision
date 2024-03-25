from django.db import models
from datasets.models import Datasets
from django.contrib.auth.models import User

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
    type = models.CharField(max_length=10, choices=PROYECT_TYPE_CHOICES, default='bbox')
    is_public = models.BooleanField(default=False) 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Datasets, on_delete=models.CASCADE)
    #Si borramos un dataset tambien se borra el modelo asociado a el