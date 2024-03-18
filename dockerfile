FROM python:3.8.18

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el archivo de requerimientos y el proyecto Django
COPY requirements.txt .

# Instalar las dependencias del proyecto Django
RUN pip install -r requirements.txt

# Copiar el código de la aplicación al contenedor
COPY . .

# Puerto en el que se ejecutará la aplicación Django
EXPOSE 8000

# Comando para ejecutar la aplicación Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

