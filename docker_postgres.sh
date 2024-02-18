#!/bin/bash

#crear el contenedor de postgres
docker run -d \
	--name yoloVisionContainer \
	-e POSTGRES_DB=yoloVisionDB \
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

sudo docker run -p 5050:80 --name pgadmin4 -e 'PGADMIN_DEFAULT_EMAIL=reyesossorio@gmail.com' -e 'PGADMIN_DEFAULT_PASSWORD=root' -d dpage/pgadmin4
