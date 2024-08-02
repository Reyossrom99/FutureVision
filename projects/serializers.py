from rest_framework import serializers
from .models import projects, Training

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = projects
        fields = '__all__'

class TrainingSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Training
        fields = '__all__'
