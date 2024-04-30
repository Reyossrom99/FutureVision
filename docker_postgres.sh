#!/bin/bash

#crear el contenedor de postgres
docker run -d \
	--name postgresLocal \
	-e POSTGRES_DB=visionDocker \
	-e POSTGRES_USER=admin \
	-e POSTGRES_PASSWORD=admin \
	-p 5432:5432 \
	postgres

#inicia el contenedor de postgres
docker run yoloVisionContainer

#para el contenedor de postgres
docker stop yoloVisionContainer 

#borra el contendor de postgres
docker rm yoloVisionContainer

#obten el status de docker
sudo docker ps


sudo docker run --gpus all -it --name yolo_training_test -v /home/reyes/Code:/workspace/Code nvidia/cuda:12.3.2-devel-ubuntu22.04 /bin/bash
