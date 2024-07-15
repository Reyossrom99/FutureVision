import json
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse 
from proyects.models import Proyects, Training
import src.types.messages as msg
from datasets.models import Datasets
from rest_framework.permissions import IsAuthenticated
from proyects.serializers import ProjectsSerializer
from django.db.models import Q
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist, ValidationError
import yaml
from datasets.utils import create_data_file, create_train_folder
from proyects.tasks import train_model
import logging

log = logging.getLogger("docker")


@permission_classes([IsAuthenticated]) 
@api_view(["GET", "POST"])
def proyects(request): 
    """
        Gets all the proyects that a user can view or creates a new proyect 
        depeding on the type of request
        Only for authenticated users
    """
    if request.method == "GET": 
        
        proyects = Proyects.objects.filter(Q(user=request.user) | Q(is_public=True))
        serializer = ProjectsSerializer(proyects, many=True)
            
        return JsonResponse(serializer.data , safe=False)

       
        
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
        

        #get yaml data for training 
        data_file, err = create_data_file(proyect.dataset.dataset_id)
        if err is not None: 
            return JsonResponse({'error': 'Error creating data file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("created data file") 
        #get data path 
        train_folder, err = create_train_folder(proyect.dataset.dataset_id)
        if err is not None: 
            print(err)
            return JsonResponse({'error': 'Error creating creating train folder'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("created train folder") 
        #add train folder to input data 
        
        training = Training(
            proyect_id = proyect, 
            input = input_data, 
            is_training = False, 
            is_trained = False, 
            data = data_file, 
            data_folder = train_folder
        )

       
        training.full_clean()  # Validar el modelo
        training.save() 
      

        log.debug("send training model")

        #send request to queue
        train_model.delay(training.training_id)

        JsonResponse({"error": False, "message": "Added proyect to training queue"})

    else : 
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
