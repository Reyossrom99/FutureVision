import json
import os
import math
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse 
from proyects.models import Proyects, Training
import src.types.messages as msg
from datasets.models import Datasets
from rest_framework.permissions import IsAuthenticated
from proyects.serializers import ProjectsSerializer, TrainingSerializer
from django.db.models import Q
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist, ValidationError
import yaml
from datasets.utils import create_data_file, create_train_folder
#from proyects.tasks import train_model, start_tensorboard
import logging
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator, EmptyPage
import requests

log = logging.getLogger("docker")
proyectsPerPage = 10
trainingsPerPage = 10

@permission_classes([IsAuthenticated]) 
@api_view(["GET", "POST"])
def proyects(request): 
    """
        Gets all the proyects that a user can view or creates a new proyect 
        depeding on the type of request
        Only for authenticated users
    """
    if request.method == "GET": 
        page_number = int(request.GET.get('page', 1))

        proyects = Proyects.objects.filter(Q(user=request.user) | Q(is_public=True))
        serializer = ProjectsSerializer(proyects, many=True)

        
        if proyects.count() < proyectsPerPage: 
            page_size = proyects.count()
        else: 
            page_size = proyectsPerPage
        
        if proyects.count() == 0: 
            total_pages = 1
        else: 
            total_pages = math.ceil(proyects.count() / page_size)
        
        paginator = Paginator(serializer.data, page_size)

        try: 
            proyects_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({'error': 'No more pages'}, status=status.HTTP_404_NOT_FOUND)
        
        paginated_data = {
                'proyects': list(proyects_page),
                'total_pages': total_pages
                }
        log.info(paginated_data)

        return JsonResponse(paginated_data, safe=False)

       
        
    if request.method == "POST":

        data = request.data

        if request.user.is_authenticated:
            
            project = Proyects(
                name=data.get('name'),
                description=data.get('description'),
                type="bbox",
                is_public=data.get('is_public', False),  
                dataset_id=data.get('dataset_id'),
                user=request.user  
            )
            project.save()
            serializer = ProjectsSerializer(project)

            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse({'error': 'User is not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)



@permission_classes([IsAuthenticated]) 
@api_view(["GET", "DELETE"])
def proyect(request, proyect_id): 
    """
        Manages operations with a single proyect [GET, DELETE]

    """
    if request.method == "GET": 

        proyect = Proyects.objects.get(proyect_id=proyect_id)
        serializer = ProjectsSerializer(proyect, many=False) 
        return JsonResponse(serializer.data, safe=False)
    
    elif request.method == "DELETE": 

        try:
            project = Proyects.objects.get(proyect_id=proyect_id)
            project.delete()
            return JsonResponse({"message": "Project deleted successfully."}, status=status.HTTP_200_OK)
        
        except Proyects.DoesNotExist:
            return JsonResponse({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        
    else: 
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@permission_classes([IsAuthenticated]) 
@api_view(["POST"])
def proyect_queue(request, proyect_id): 
    """
        Add a proyect to the training queue
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
            "weights": bool(data.get("weights"))
            
            }
            log.info("input data: %s", input_data)
        except json.JSONDecodeError as e:
            JsonResponse({'error': 'Missing request parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try: 
            #get related proyect 
            proyect = Proyects.objects.get(proyect_id=proyect_id)
        except ObjectDoesNotExist: 
            return JsonResponse({'error': 'Proyect does not exits in database'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


        #get data path 
             
        training = Training(
            proyect_id = proyect, 
            input = input_data, 
            is_training = False, 
            is_trained = False, 
            )
        
       
        training.full_clean()  # Validar el modelo
        training.save() 
        data_file, err = create_data_file(proyect.dataset.dataset_id, str(training.training_id))
        if err is not None: 
            return JsonResponse({'error': 'Error creating data file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("created data file") 
        training.data = data_file
        print("id", training.training_id)
        train_folder, err = create_train_folder(proyect.dataset.dataset_id, str(training.training_id))
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
            'proyect_id': training.proyect_id.proyect_id,
            'input': input_data,
            'is_training': training.is_training,
            'is_trained': training.is_trained,
            'data': training.data,
            'data_folder': training.data_folder
        }
        try:
            response = requests.post(engine_url, json=payload)
            if response.status_code != 200:
                print("okay")
                return JsonResponse({'error': 'Error initiating command on engine server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as e:
            print("error")
            log.error(f"Error sending request to engine server: {e}")
            return JsonResponse({'error': 'Error connecting to engine server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        training.current_satus = "running"
        training.save()
        return JsonResponse({"error": False, "message": "Added proyect to training queue"}, status=status.HTTP_200_OK)

    else : 
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@permission_classes([IsAuthenticated]) 
@api_view(["GET"])
def trainings(request, proyect_id): 
    """
        Add a proyect to the training queue
    """
    if request.method == "GET": 
        page_number = int(request.Get.get('page', 1))

        project = get_object_or_404(Proyects, pk=proyect_id)

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


