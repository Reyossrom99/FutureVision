# Utiliza Ubuntu 22.04 como imagen base
FROM ubuntu:22.04

# Establece la variable de entorno para que las selecciones de zona horaria sean no interactivas
ENV DEBIAN_FRONTEND=noninteractive

# Actualiza e instala tzdata y herramientas necesarias
RUN apt-get update && apt-get install -y tzdata gnupg curl && \
    echo "Etc/UTC" > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata

# Instala software-properties-common para manejar repositorios
RUN apt-get install -y software-properties-common wget


RUN add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && apt-get install -y git

RUN apt install -y python3.8 python3.8-distutils python3.8-dev

RUN apt-get install -y python3-pip

RUN apt-get update && apt-get install -y ffmpeg libsm6 libxext6 netcat-openbsd postgresql-client  && rm -rf /var/lib/apt/lists/*


RUN python3.8 -m pip install --upgrade pip
# Establece el directorio de trabajo en el contenedor
WORKDIR /app

COPY requirements.txt .

# Instala las dependencias del projecto Django
RUN python3.8 -m pip install -r requirements.txt

COPY . . 
# Copia los scripts de entrada y hace que sean ejecutables
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh


# Copia manage.py si es necesario
COPY manage.py .

# Expone el puerto en el que se ejecutará la aplicación Django
EXPOSE 8000

