import json
import os
import math
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from django.http import FileResponse, JsonResponse 
from projects.models import Projects, Training
import src.types.messages as msg
from datasets.models import Datasets
from rest_framework.permissions import IsAuthenticated
from projects.serializers import ProjectsSerializer, TrainingSerializer
from django.db.models import Q
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist, ValidationError
import yaml
from datasets.utils import create_data_file, create_train_folder
#from projects.tasks import train_model, start_tensorboard
import logging
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator, EmptyPage
import requests
import shutil
import tempfile

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler("server.log"),
                        logging.StreamHandler()
                    ])
projectsPerPage = 10
trainingsPerPage = 10


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated]) 
def projects(request): 
    """
        Gets all the projects that a user can view or creates a new project 
        depeding on the type of request
        Only for authenticated users
    """
    if request.method == "GET": 
        page_number = int(request.GET.get('page', 1))

        projects = Projects.objects.filter(Q(user=request.user) | Q(is_public=True))
        serializer = ProjectsSerializer(projects, many=True)

        
        if projects.count() < projectsPerPage: 
            page_size = projects.count()
        else: 
            page_size = projectsPerPage
        
        if projects.count() == 0: 
            total_pages = 1
        else: 
            total_pages = math.ceil(projects.count() / page_size)
        
        paginator = Paginator(serializer.data, page_size)

        try: 
            projects_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({'error': 'No more pages'}, status=status.HTTP_404_NOT_FOUND)
        
        paginated_data = {
                'projects': list(projects_page),
                'total_pages': total_pages
                }
        logging.info(paginated_data)

        return JsonResponse(paginated_data, safe=False)

       
        
    if request.method == "POST":

        data = request.data

        if request.user.is_authenticated:
            
            project_instance = Projects(
                name=data.get('name'),
                description=data.get('description'),
                type="bbox",
                is_public=data.get('is_public', False),  
                dataset_id=data.get('dataset_id'),
                user=request.user  
            )
            project_instance.save()
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
            logging.info("input data: %s", input_data)
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
            is_training = False, 
            is_trained = False, 
            )
        
       
        training.full_clean()  # Validar el modelo
        training.save() 
        data_file, err = create_data_file(project.dataset.dataset_id, str(training.training_id))
        if err is not None: 
            return JsonResponse({'error': 'Error creating data file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("created data file") 
        training.data = data_file
        print("id", training.training_id)
        train_folder, err = create_train_folder(project.dataset.dataset_id, str(training.training_id))
        training.data_folder= train_folder
        if err is not None: 
            print(err)
            return JsonResponse({'error': "error creando carpeta de entrenamiento"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("created train folder") 
        training.save()
        train_data = os.path.join(train_folder, "data_train.yaml")

        with open(train_data, "w") as file: 
            file.write(training.data)
        file.close()

        engine_url = "http://engine-server:4000/engine/"
        payload = {
            'project_id': training.project_id.project_id,
            'input': input_data,
            'is_training': training.is_training,
            'is_trained': training.is_trained,
            'data': training.data,
            'data_folder': training.data_folder,
            'training_id': training.training_id
        }
        try:
            response = requests.post(engine_url, json=payload)
            logging.info(f"enviando mensaje")
            if response.status_code != 200:
                logging.info("okay")
                return JsonResponse({'error': 'Error initiating command on engine server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as e:
            logging.info("error")
            logging.error(f"Error sending request to engine server: {e}")
            return JsonResponse({'error': 'Error connecting to engine server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        training.current_status = "running"
        training.save()
        logging.info(training.current_status)
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

        if trainings.count() < trainingsPerPage:
            page_size = trainings.count()
        else: 
            page_size = trainingsPerPage
        
        if trainings.count() == 0: 
            total_pages = 1
        else: 
            total_pages = math.ceil(trainings.count() /page_size)

        serializer = TrainingSerializer(trainings, many=True)
        
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

    else : 
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
          
            return JsonResponse({'status': 'success', 'message': f'Project {training_id} status updated to {status}'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'fail', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'status': 'fail', 'message': 'Invalid request method'}, status=405)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def log(request, training_id):
    if request.method == "GET":
        training = get_object_or_404(Training, pk=training_id)
        log_file = os.path.join(training.data_folder, "data_train.log")
        
        if os.path.exists(log_file):
            # Usa FileResponse para enviar el archivo
            response = FileResponse(open(log_file, 'rb'), as_attachment=True, filename='data_train.log')
            return response
        else:
            return JsonResponse({'error': 'File not found.'}, status=404)
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)



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
            return JsonResponse({'error': 'Weights folder not found.'}, status=404)
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)

