#!/bin/sh

# Esperar a que el servicio de base de datos esté disponible
until nc -z db 5432; do
    echo "Esperando a que el servicio de base de datos esté disponible en el host 'db'..."
    sleep 2
done
export PGPASSWORD='admin' #enviroment variable password
# Wait for PostgreSQL to start accepting connections
until psql -h "db" -U "admin" -d "visionDocker" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "PostgreSQL is up - executing command"

# Ejecutar las migraciones de Django
echo "Ejecutando migraciones de Django..."
python3.8 manage.py makemigrations authentication datasets proyects
python3.8 manage.py migrate

mkdir -p /app/media/covers /app/media/tmp /app/media/zip_data

# Iniciar el servidor web Django
echo "Iniciando el servidor web Django..."
python3.8 manage.py runserver 0.0.0.0:8000
