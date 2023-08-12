#!/bin/bash

docker run -d \
	--name postgres-container \
	-e POSTGRES_DB=yoloVision \
	-e POSTGRES_USER=root \
	-e POSTGRES_PASSWORD=root \
	-p 5432:5432 \
	postgres