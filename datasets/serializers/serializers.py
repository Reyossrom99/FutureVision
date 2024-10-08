import os
from rest_framework import serializers
from datasets.models import Datasets
from src import settings

class DatasetsSerializers(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    image_formats = (
    ".bmp", ".dib", ".jpeg", ".jpg", ".jpe", ".jp2", ".png", ".webp", 
    ".avif", ".pbm", ".pgm", ".ppm", ".pxm", ".pnm", ".pfm", ".sr", 
    ".ras", ".tiff", ".tif", ".exr", ".hdr", ".pic"
    )
    class Meta:
        model = Datasets
        fields = '__all__'

    def get_cover_url(self, obj):
        cover_path = os.path.join(settings.MEDIA_ROOT,  "covers", str(obj.name))
        cover_files = [file for file in os.listdir(cover_path) if file.lower().endswith(self.image_formats)]
        if cover_files:
            system_path =  os.path.join("/media", "covers", str(obj.name), cover_files[0])
            return "http://localhost:4004" +  system_path
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['cover_url'] = self.get_cover_url(instance)
        return representation
