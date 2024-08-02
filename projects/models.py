from django.db import models
from datasets.models import Datasets
from django.contrib.auth.models import User
from django.db.models import JSONField
from django.utils import timezone

project_TYPE_CHOICES = (
    ('bbox', 'BBOX'), 
    ('mask', 'MASK'), 
    ('bbox+mask', 'BBOX+MASK')
)

STATUS_CHOICES = (
    ( 'pending', 'PENDING'), 
    ( 'running', 'RUNNING'), 
    ( 'stopped', 'STOPPED'), 
    ( 'completed', 'COMPLETED')
)


class projects(models.Model): 
    project_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(auto_now_add=True)
    type = models.CharField(max_length=10, choices=project_TYPE_CHOICES, default='bbox')
    is_public = models.BooleanField(default=False) 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Datasets, on_delete=models.CASCADE)
 
class Training(models.Model): 
    training_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(projects, on_delete=models.CASCADE)
    input = JSONField(help_text="Save training input in json format")
    data = models.TextField(help_text="Save data.yaml for training purporses", blank=True)
    is_training = models.BooleanField(default=False)
    is_trained = models.BooleanField(default=False)
    data_folder = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    current_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
   
  
