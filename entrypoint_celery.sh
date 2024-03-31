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
echo "Running celery component" 
celery -A src worker --loglevel=debug -c 1
