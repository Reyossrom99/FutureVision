from rest_framework import serializers
from .models import Proyects, Training

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyects
        fields = '__all__'

class TrainingSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Training
        fields = '__all__'
