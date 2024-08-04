from rest_framework import serializers
from .models import Projects, Training

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = '__all__'

class TrainingSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Training
        fields = '__all__'
