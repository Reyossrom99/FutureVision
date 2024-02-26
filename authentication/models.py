from django.db import models
from django.contrib.auth.models import User
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes


class Keys(models.Model):
   id = models.AutoField(primary_key=True)
   clave = models.CharField(max_length=100) 
 

def guardar_clave(clave):
    # Crear una instancia del modelo Keys con la clave proporcionada y guardarla en la base de datos
    key_instance = Keys(clave=clave)
    key_instance.save()

def obtener_clave():
    # Obtener la clave almacenada en la base de datos (si existe)
    try:
        key_instance = Keys.objects.get()
        return key_instance.clave
    except Keys.DoesNotExist:
        return None
    
def obtener_clave_por_id(usuario_id):
    try:
        # Buscar en el modelo Keys si existe una clave asociada al usuario
        clave_instance = Keys.objects.get(usuario_id=usuario_id)
        return clave_instance.clave
    except Keys.DoesNotExist:
        # Si no existe una clave asociada al usuario, generar una nueva clave y guardarla
        nueva_clave = generate_key_from_user_password(usuario_id)  # Generar la clave usando la función anterior
        if nueva_clave == None:
            return None
        
        keys_instance = Keys(clave=nueva_clave, usuario_id=usuario_id)
        keys_instance.save()
        return nueva_clave

def generate_key_from_user_password(user_id):
    try:
        # Obtener el usuario de Django por su ID
        user = User.objects.get(id=user_id)
        # Obtener la contraseña almacenada del usuario
        password = user.password
        # Generar la clave utilizando la contraseña del usuario
        salt = get_random_bytes(16)
        key = PBKDF2(password, salt, dkLen=32)
        return key
    except User.DoesNotExist:
        # Manejar el caso en el que no se encuentra ningún usuario con el ID proporcionado
        return None