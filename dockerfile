FROM nvidia/cuda:12.3.2-devel-ubuntu22.04

# Establece la variable de entorno para que las selecciones de zona horaria sean no interactivas
ENV DEBIAN_FRONTEND=noninteractive

# Actualiza e instala tzdata y herramientas necesarias
RUN apt-get update && apt-get install -y tzdata gnupg curl && \
    echo "Etc/UTC" > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata


RUN apt install -y  software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update


# Install Python 3.7 and necessary development tools
RUN apt install -y python3.7 python3.7-distutils python3.7-dev

# Install pip for Python 3.7
RUN apt-get install -y python3-pip

# Install additional dependencies required for OpenCV
RUN apt-get update && apt-get install -y ffmpeg libsm6 libxext6 netcat-openbsd postgresql-client  && rm -rf /var/lib/apt/lists/*

# Upgrade pip and set the working directory in the container
RUN python3.7 -m pip install --upgrade pip
# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo de requerimientos y el proyecto Django
COPY requirements.txt .

# Instala las dependencias del proyecto Django
RUN python3.7 -m pip install -r requirements.txt

# Copia el código de la aplicación al contenedor
COPY . .

# Hace el script de entrada ejecutable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Puerto en el que se ejecutará la aplicación Django
EXPOSE 8000

# Comando para ejecutar la aplicación Django usando el script de entrada
ENTRYPOINT ["./entrypoint.sh"]
CMD ["python3.8", "manage.py", "runserver", "0.0.0.0:8000"]


