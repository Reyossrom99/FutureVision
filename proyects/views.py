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
                type=data.get('type'),
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
        serializer = ProjectsSerializer(proyect, many=True) 
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
        data = json.loads(request.body)

        try: 
            input_data = data.get('input')  # Este debería ser un JSON
        except KeyError as e: 
            JsonResponse({'error': 'Missing request parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try: 
            #get related proyect 
            proyect = Proyects.objects.get(id=proyect_id)
        except ObjectDoesNotExist: 
            return JsonResponse({'error': 'Proyect does not exits in database'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        #crear el archivo data.yaml para el entrenamiento 
        
        data = {
            'train': 
            'val': 
            'test': 
            'nc': 
            'names': 
        }
        training = Training(
            proyect_id = proyect, 
            input = input_data, 
            is_training = False, 
            is_trained = False
        )
        training.full_clean()  # Validar el modelo
        training.save()

        JsonResponse({"error": False, "message": "Added proyect to training queue"})

    else : 
        return JsonResponse({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)