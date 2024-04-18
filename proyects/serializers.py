from rest_framework import serializers
from .models import Proyects

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyects
        fields = '__all__'
