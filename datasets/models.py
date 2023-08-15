from django.db import models

def upload_cover_path(instance, filename): 
    return "/".join(['covers', str(instance.name), filename])
""" 
    Nota: 
        Esta operacion crea o migra una tabla del tipo que se esta modelando a la base de datos de sql
        Como estoy dentro de la aplicacion datasets se migra con el nombre datasets_nombre de la clase 
        de esta forma no hace falta crear las tablas con sql asi ya basta
"""
class Datasets(models.Model):
    dataset_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    uploaded_date = models.DateTimeField(auto_now_add=True)
    url = models.URLField(blank=True, null=True)
    cover = models.ImageField(blank=True, null=True, upload_to=upload_cover_path)

    def __str__(self):
        return self.name


