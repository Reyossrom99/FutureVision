from django.db import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from datasets.models import Datasets
from django.http import JsonResponse 
from django.conf import settings
from rest_framework import status
import os
from django.db.models import Q
import src.types.messages as msg
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator, EmptyPage
from .serializers.yoloData import YoloData
from .serializers.serializers import DatasetsSerializers
from rest_framework.pagination import PageNumberPagination
import logging

from . import utils 

#gobal dictioary for YoloData objects
yolo_data_objects = {}

log = logging.getLogger("docker")

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def datasets(request):
    if request.method == "GET":
        print("GETTING COVER")
        datasets = Datasets.objects.filter(Q(user=request.user) | Q(is_public=True))
        serializer = DatasetsSerializers(datasets, many=True)
        return JsonResponse(serializer.data , safe=False)
    
    elif request.method == "POST": 
        #data is in json format
        recived_data = request.data
        #adding data to the model 
        name = recived_data.get('name')
        description = recived_data.get('description')
        url = recived_data.get('url') #directorio donde esta el zip
        type = recived_data.get('type')
        format = recived_data.get('format')
        privacy = recived_data.get('privacy') == 'true'
        
        # check = utils.check_correct_form(url, type, format)
        control_structure = utils.extract_and_verify_zip(url, format, type)
        if control_structure: 
            try:
                dataset = Datasets(
                    name=name, 
                    description=description,
                    url = url, 
                    type = type, 
                    format = format,
                    is_public = privacy,
                    user = request.user
                )
               
                dataset.save()
                #obtebemos la cover del dataset, solo cuando la estructura de control es correcta 
                if (utils.extract_cover(url, name, format, type)):
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

    if request.method == "GET":
        show_labels = request.GET.get('showLabels', False)
        requested_split = request.GET.get('request-split', 'none')
        page_number = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 100))

        dataset = Datasets.objects.get(dataset_id=dataset_id)
        
        # Comprueba si el objeto YoloData ya existe para este dataset
        if dataset.dataset_id not in yolo_data_objects:
            yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)

        yolo_data = yolo_data_objects[dataset.dataset_id]
        
        # Extrae y procesa los datos
        if not yolo_data.is_tmp:
            yolo_data.extract_data_in_tmp()

        image_files, _ = yolo_data.get_images(requested_split)
        if show_labels == 'true':
            _, labels_files_full = yolo_data.get_labels(requested_split)
            yolo_data.save_labels_in_image(_, labels_files_full, requested_split)
            images, _ = yolo_data.get_labeled_images(requested_split)
        else:
            images = image_files

        # Aplicar la paginación
        paginator = Paginator(images, page_size)
        try:
            images_page = paginator.page(page_number)
        except EmptyPage:
            return Response({'error': 'No hay más páginas'}, status=404)

        # Crear respuesta paginada
        paginated_data = {
            'dataset_id': dataset.dataset_id,
            'name': dataset.name,
            'description': dataset.description,
            'images': list(images_page),
            'total_pages': paginator.num_pages
        }

        return JsonResponse(paginated_data, safe=False)

