import json
import os
import math
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from django.http import FileResponse, JsonResponse 
from projects.models import Projects, Training
from datasets.models import Datasets
from rest_framework.permissions import IsAuthenticated
from projects.serializers import ProjectsSerializer, TrainingSerializer
from django.db.models import Q
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist, ValidationError
import yaml
import logging
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator, EmptyPage
import requests
import shutil
import tempfile
from projects.utils import delete_training_folder, create_data_file, create_train_folder


projectsPerPage = 10
trainingsPerPage = 10


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated]) 
def projects(request): 
    if request.method == "GET":
        page_number = int(request.GET.get('page', 1))

        # Filtrar proyectos que sean públicos o pertenecientes al usuario
        projects = Projects.objects.filter(Q(user=request.user) | Q(is_public=True))
        projects_count = projects.count()

        # Si no hay proyectos, devuelve un array vacío y total_pages = 1
        if projects_count == 0:
            return JsonResponse({
                'projects': [],
                'total_pages': 1
            }, status=status.HTTP_200_OK)

        try:
            # Asegurar que page_size sea mayor que 0
            if projects_count < projectsPerPage:
                page_size = projects_count
            else:
                page_size = projectsPerPage

            # Calcular el número de páginas
            total_pages = math.ceil(projects_count / page_size)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serializar los datos
        serializer = ProjectsSerializer(projects, many=True)

        # Paginar los datos
        paginator = Paginator(serializer.data, page_size)
        try:
            projects_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({'error': 'No more pages'}, status=status.HTTP_404_NOT_FOUND)

        paginated_data = {
            'projects': list(projects_page),
            'total_pages': total_pages
        }
        
        return JsonResponse(paginated_data, safe=False)
            
    elif request.method == "POST":

        data = request.data
        if request.user.is_authenticated:
            dataset_id = data.get('dataset_id')

            # Obtener la instancia del dataset
            try:
                dataset_instance = Datasets.objects.get(dataset_id=dataset_id)
            except Datasets.DoesNotExist:
                return JsonResponse({"error": "No dataset found in the system"}, status=status.HTTP_404_NOT_FOUND)

            # Verificar si el dataset es privado
            if not dataset_instance.is_public and data.get('is_public', False):
                return JsonResponse({"error": "Cannot create a public proyect with a private dataset"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Crear la instancia del proyecto
            project_instance = Projects(
                name=data.get('name'),
                description=data.get('description'),
                type="bbox",
                is_public=data.get('is_public', False),
                dataset_id=dataset_id,  # Asignar la instancia del dataset, no el ID
                user=request.user
            )

            # Guardar el proyecto
            project_instance.save()

            # Serializar y devolver la respuesta
            serializer = ProjectsSerializer(project_instance)
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)

        else:
            return JsonResponse({'error': 'User is not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)




@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated]) 
def project(request, project_id): 
    """
        Manages operations with a single project [GET, DELETE]

    """
    if request.method == "GET": 

        project = Projects.objects.get(project_id=project_id)
        serializer = ProjectsSerializer(project, many=False) 
        return JsonResponse(serializer.data, safe=False)
    
    elif request.method == "DELETE": 

        try:
            project = Projects.objects.get(project_id=project_id)
            project.delete()
            return JsonResponse({"message": "Project deleted successfully."}, status=status.HTTP_200_OK)
        
        except projects.DoesNotExist:
            return JsonResponse({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        
    else: 
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def project_queue(request, project_id): 
    """
        Add a project to the training queue
    """
    if request.method == "POST": 
        
        try:
            data = json.loads(request.body)
            input_data = {
            "batchSize": int(data.get("batch")),
            "imgSizeTrain": int(data.get("imgSizeTrain")),
            "imgSizeTest": int(data.get("imgSizeTest")),
            "epochs": int(data.get("epochs")),
            "noTest": int(data.get("noTest")), 
            "workers": int(data.get("workers")), 
            "cfg": data.get("cfg"), 
            }
           
        except json.JSONDecodeError as e:
            JsonResponse({'error': 'Missing request parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try: 
            #get related project 
            project = Projects.objects.get(project_id=project_id)
        except ObjectDoesNotExist: 
            return JsonResponse({'error': 'project does not exits in database'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


        #get data path 
             
        training = Training(
            project_id = project, 
            input = input_data, 
            )
        
       
        training.full_clean()  # Validar el modelo
        
        data_file, err = create_data_file(project.dataset.dataset_id, str(training.training_id))
        if err is not None: 
            return JsonResponse({'error': 'Error creating data file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        
        training.data = data_file
        
        train_folder, err = create_train_folder(project.dataset.dataset_id, str(training.training_id))
        training.data_folder= train_folder
        if err is not None: 
           
            return JsonResponse({'error': "error creando carpeta de entrenamiento"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
         
        training.save()
        train_data = os.path.join(train_folder, "data_train.yaml")

        with open(train_data, "w") as file: 
            file.write(training.data)
        file.close()

        engine_url = "http://engine-server:4000/engine/"
        payload = {
            'project_id': training.project_id.project_id,
            'input': input_data,
            'data': training.data,
            'data_folder': training.data_folder,
            'training_id': training.training_id
        }
        try:
            response = requests.post(engine_url, json=payload)
            
            if response.status_code != 200:
              
                training.current_status = "stopped"
                training.save()
                return JsonResponse({'error': 'Error initiating command on engine server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as e:
            
            training.current_status = "stopped"
            training.save()
            logging.error(f"Error sending request to engine server: {e}")
            return JsonResponse({'error': 'Error connecting to engine server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        training.current_status = "running"
        training.save()
        
        return JsonResponse({"error": False, "message": "Added project to training queue"}, status=status.HTTP_200_OK)

    else : 
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(["GET"])
@permission_classes([IsAuthenticated]) 
def trainings(request, project_id): 
    """
        Add a project to the training queue
    """
    if request.method == "GET":
        page_number = int(request.GET.get('page', 1))

        project = get_object_or_404(Projects, pk=project_id)

        trainings = Training.objects.filter(project_id=project)
        trainings_count = trainings.count()

        # Si no hay trainings, devuelve un array vacío y total_pages = 1
        if trainings_count == 0:
            return JsonResponse({
                'trainings': [],
                'total_pages': 1
            }, status=status.HTTP_200_OK)

        try:
            # Asegurar que page_size sea siempre mayor que 0
            if trainings_count < trainingsPerPage:
                page_size = trainings_count
            else:
                page_size = trainingsPerPage

            # Calcular el número de páginas
            total_pages = math.ceil(trainings_count / page_size)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serializar los datos
        serializer = TrainingSerializer(trainings, many=True)
        
        # Paginar los datos
        paginator = Paginator(serializer.data, page_size)
        try:
            trainings_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({'error': 'No more pages'}, status=status.HTTP_404_NOT_FOUND)

        paginated_data = {
            'trainings': list(trainings_page),
            'total_pages': total_pages
        }
        
        return JsonResponse(paginated_data, safe=False)

    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(["POST"])
def notify(request): 
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            training_id = data.get('training_id')
          
            training = Training.objects.get(training_id=training_id)
            training.current_status = data.get('status')

            training.save()

            #delete images from train folder
            delete_training_folder(training.data_folder)
          
            return JsonResponse({ 'message': f'Project {training_id} status updated to {status}'}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'error reciving training status update '}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def log(request, training_id):
    if request.method == "GET":
        training = get_object_or_404(Training, pk=training_id)
        log_file = os.path.join(training.data_folder, "data_train.log")
        
        if os.path.exists(log_file):
            response = FileResponse(open(log_file, 'rb'), as_attachment=True, filename='data_train.log')
            return response
        else:
            return JsonResponse({'error': 'File not found.'},status=status.HTTP_404_NOT_FOUND )
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def weights(request, training_id):
    if request.method == "GET":
        training = get_object_or_404(Training, pk=training_id)
        weights_folder = os.path.join(training.data_folder, "exp", "weights")

        if os.path.exists(weights_folder):
            archived = shutil.make_archive('weights', 'zip', weights_folder)
            response = FileResponse(open(archived, 'rb'), as_attachment=True, filename='weights.zip')
            return response
        else:
            return JsonResponse({'error': 'Weights folder not found.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'error': 'Method not allowed.'},status=status.HTTP_405_METHOD_NOT_ALLOWED )

