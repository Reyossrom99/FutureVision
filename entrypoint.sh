#!/bin/sh

# Esperar a que el servicio de base de datos esté disponible
until nc -z db 5432; do
    echo "Esperando a que el servicio de base de datos esté disponible en el host 'db'..."
    sleep 2
done

# Esperar a que PostgreSQL esté completamente iniciado
until pg_isready; do
    echo "Esperando a que PostgreSQL esté completamente iniciado..."
    sleep 2
done
# Ejecutar las migraciones de Django
echo "Ejecutando migraciones de Django..."
python manage.py migrate

# Iniciar el servidor web Django
echo "Iniciando el servidor web Django..."
python manage.py runserver 0.0.0.0:8000
