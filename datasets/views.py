import math
import time
from django.db import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .formats.cocoData import CocoData
from datasets.models import Datasets
from django.http import JsonResponse 
from django.conf import settings
from rest_framework import status
import os
from django.db.models import Q
import src.types.messages as msg
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator, EmptyPage
from .formats.yoloData import YoloData
from .serializers.serializers import DatasetsSerializers
import logging

from . import utils 




yolo_data_objects = {}
coco_data_objects = {}

#gobal dictioary for YoloData objects
datasetsPerPage = 10

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def datasets(request):
    if request.method == "GET":
        page_number = int(request.GET.get('page', 1))
        
        # Obtener los datasets
        datasets = Datasets.objects.filter(Q(user=request.user) | Q(is_public=True))
       
        if datasets.count() < datasetsPerPage:
            page_size = datasets.count()
        else:
            page_size = datasetsPerPage
        #division by zero control
        
            # Calcular el número total de páginas
        total_pages = math.ceil(datasets.count() / page_size)
        # puedo tener 10 datasets por pagina 
        
        # Verificar si hay datasets
        if not datasets: 
            return JsonResponse({"mensaje": "No datasets"}, status=status.HTTP_200_OK)
        
        # Serializar los datasets
        serializer = DatasetsSerializers(datasets, many=True)
        
        # Paginar los datasets
        paginator = Paginator(serializer.data, page_size)
        try:
            datasets_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({'error': 'No more pages'}, status=status.HTTP_404_NOT_FOUND)
        
        # Preparar los datos paginados
        paginated_data = {
            'datasets': list(datasets_page),
            'total_pages': total_pages
        }
        print(paginated_data)
        return JsonResponse(paginated_data, safe=False)
    
    elif request.method == "POST": 
    
        #adding data to the model 
        name = request.POST.get('name')
        description = request.POST.get('description')
        uploaded_file = request.FILES['url'] #directorio donde esta el zip
        type = request.POST.get('type')
        format = request.POST.get('format')
        privacy = request.POST.get('privacy') == 'true'
        
        print(name, description, uploaded_file, type, format, privacy)
        #todo esta funcion tarda horrores en ejecutarse
        control_structure = utils.extract_and_verify_zip(uploaded_file, format, type)
        print("verficacion de estructura", control_structure)
        if control_structure: 
           #contamos el numero de imagenes que hay en el dataset 
            num_images = utils.count_files_in_zip(uploaded_file)
            try:
                dataset = Datasets(
                    name=name, 
                    description=description,
                    url = uploaded_file, 
                    type = type, 
                    format = format,
                    is_public = privacy,
                    user = request.user, 
                    num_images = num_images
                )
                dataset.save()
                print("dataset guardado")
                #obtebemos la cover del dataset, solo cuando la estructura de control es correcta 
                #todo esta funcion tarda mucho
                if (utils.extract_cover(uploaded_file, name, format, type)):
                    print("cover extraida")
                    return JsonResponse({"id": dataset.dataset_id}
                                        , status= status.HTTP_201_CREATED)
                else: 
                   return JsonResponse({"error" : "no cover extrated for dataset"}
                                       , status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                
            except IntegrityError as e:
               return JsonResponse("error", e.__str__, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else: 
               return JsonResponse({"error": "format of dataset is not valid"}
                                   , status=status.HTTP_400_BAD_REQUEST)
        
        
      
        
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_dataset_info_by_id(request, dataset_id):
    global yolo_data_objects
    global coco_data_objects

    if request.method == "GET":
        show_labels = request.GET.get('showLabels', False)
        requested_split = request.GET.get('request-split', "")
        page_number = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 100))
        print(show_labels, requested_split, page_number, page_size)

        dataset = Datasets.objects.get(dataset_id=dataset_id)
        if dataset.format == 'yolo':
            # Comprueba si el objeto YoloData ya existe para este dataset
            if dataset.dataset_id not in yolo_data_objects: 
                yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
            yolo_data = yolo_data_objects[dataset.dataset_id]
            
            yolo_data.extract_data_in_tmp(page_number, page_size, requested_split)

            image_files, image_files_full = yolo_data.get_images(requested_split, page_number, page_size)
            if show_labels == 'true':
                _, labels_files_full = yolo_data.get_labels(requested_split, page_number, page_size)
                yolo_data.save_labels_in_image(image_files_full, labels_files_full, requested_split, page_number)
                images, _ = yolo_data.get_labeled_images(requested_split, page_number, page_size)
            else:
                images = image_files
        elif dataset.format == 'coco':
            #a testear 
            if dataset.dataset_id not in coco_data_objects:
                coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
            
            coco_data = coco_data_objects[dataset.dataset_id]

            
            coco_data.extract_data_in_tmp(page_number, page_size, requested_split)

            image_files, _ = coco_data.get_images(requested_split,page_number, page_size)
            print("numero de imagenes extraidas", len(image_files))
            
            if show_labels == 'true':
                
                coco_data.save_labels_in_image(requested_split, page_number, page_size)
                images, _ = coco_data.get_labeled_images(requested_split, page_number, page_size)
            else: 
                images = image_files
        else:
            return JsonResponse({'error': 'Incorret dataset format'}, status=status.HTTP_400_BAD_REQUEST)
        
        #personal paginator 
        num_pages = math.ceil(dataset.num_images/ page_size)
        
        # # Aplicar la paginación
        # paginator = Paginator(images, page_size)
        # try:
        #     images_page = paginator.page(page_number)
        # except EmptyPage:
        #     return Response({'error': 'No more pages'}, status=status.HTTP_404_NOT_FOUND)

        # Crear respuesta paginada
        paginated_data = {
            'dataset_id': dataset.dataset_id,
            'name': dataset.name,
            'description': dataset.description,
            'images': images,
            'total_pages': num_pages
        }

        return JsonResponse(paginated_data, safe=False)

