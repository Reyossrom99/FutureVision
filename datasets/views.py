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
    global yolo_data_objects
    global coco_data_objects
    if request.method == "GET":
        page_number = int(request.GET.get('page', 1))
        
        # Obtener los datasets
        datasets = Datasets.objects.filter(Q(user=request.user) | Q(is_public=True))
       
        if datasets.count() < datasetsPerPage:
            page_size = datasets.count()
        else:
            page_size = datasetsPerPage
        #todo division de 0 control 
        
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
            num_images_train, num_images_val, num_images_test = utils.count_files_in_zip(uploaded_file, type)
            
            try:
                dataset = Datasets(
                    name=name, 
                    description=description,
                    url = uploaded_file, 
                    type = type, 
                    format = format,
                    is_public = privacy,
                    user = request.user, 
                    num_images_train = num_images_train, 
                    num_images_val = num_images_val,
                    num_images_test = num_images_test
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
      
@api_view(["GET", "DELETE", "PATCH"])
@permission_classes([IsAuthenticated])
def dataset(request, dataset_id):
    print("dataset")
    global yolo_data_objects
    global coco_data_objects

    if request.method == "GET":
        show_labels = request.GET.get('showLabels', False)
        requested_split = request.GET.get('request-split', "")
        page_number = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 100))
        print(show_labels, requested_split, page_number, page_size)

        

        dataset = Datasets.objects.get(dataset_id=dataset_id)
        #custom paginator 
        if requested_split == "train" or  requested_split == "":
            num_pages = math.ceil(dataset.num_images_train/ page_size)
        elif requested_split == "val":
            num_pages = math.ceil(dataset.num_images_val/ page_size)
        elif requested_split == "test":
            num_pages = math.ceil(dataset.num_images_test/ page_size)    

        #para no permitir que se pase de paginas cuando cambiamos de splits 
        # if page_number > num_pages:
        #     page_number = num_pages
        
        if dataset.format == 'yolo' :
            print("yolo")
            # Comprueba si el objeto YoloData ya existe para este dataset
            if dataset.dataset_id not in yolo_data_objects: 
                yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
               
            #extrae el objecto de la lista     
            yolo_data = yolo_data_objects[dataset.dataset_id]

            #comprobar el split solicitado
            if dataset.type == 'no-splits' and requested_split != "" and yolo_data.modify == False:
                requested_split = ""
            elif dataset.type == 'splits' and requested_split == "" and yolo_data.modify == False:
                requested_split = "train"

            print("requested split", requested_split)    
            #Extraer los datos pedidos en la carpeta temporal    
            yolo_data.extract_data_in_tmp(page_number, page_size, requested_split)

            image_files, image_files_full = yolo_data.get_images(requested_split, page_number, page_size)

            if show_labels == 'true':
                print("show labels")
                _, labels_files_full = yolo_data.get_labels(requested_split, page_number, page_size)
                yolo_data.save_labels_in_image(image_files_full, labels_files_full, requested_split, page_number)
                images, _ = yolo_data.get_labeled_images(requested_split, page_number, page_size)
            else:
                images = image_files

            type = utils.oposite_value(yolo_data)

            images = yolo_data.add_url(images)

        elif dataset.format == 'coco':
            
            #comprobar si el dataset ya ha sido abierto
            if dataset.dataset_id not in coco_data_objects:
                coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
            
            #Extraer el objeto de la lista de objetos
            coco_data = coco_data_objects[dataset.dataset_id]
            
            #comprobar el split solicitado
            if dataset.type == 'no-splits' and requested_split != "" and coco_data.modify == False:
                requested_split = ""
            elif dataset.type == 'splits' and requested_split == "" and coco_data.modify == False:
                requested_split = "train"   

            #Extraer los datos pedidos en la carpeta temporal     
            coco_data.extract_data_in_tmp(page_number, page_size, requested_split)

            image_files, _ = coco_data.get_images(requested_split,page_number, page_size)
            print("numero de imagenes extraidas", len(image_files))
            
            if show_labels == 'true':
                
                coco_data.save_labels_in_image(requested_split, page_number, page_size)
                images, _ = coco_data.get_labeled_images(requested_split, page_number, page_size)
            else: 
                images = image_files
            type = utils.oposite_value(coco_data)

            images = coco_data.add_url(images)
        else:
            return JsonResponse({'error': 'Incorret dataset format'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear respuesta paginada

        paginated_data = {
            'dataset_id': dataset.dataset_id,
            'name': dataset.name,
            'description': dataset.description,
            'images': images,
            'total_pages': num_pages, 
            'type': type,
        }
        
        return JsonResponse(paginated_data, safe=False)

    elif request.method == "DELETE":
    
        #borrar el dataset de la base de datos 
        dataset = Datasets.objects.get(dataset_id=dataset_id)
        if dataset.user != request.user and dataset.is_public: 
            return JsonResponse({'error': 'Cannot delete a public dataset if does not belong to you'}, status=status.HTTP_401_UNAUTHORIZED)

        if dataset.format == "yolo": 

            if dataset.dataset_id in yolo_data_objects: 
                yolo_data = yolo_data_objects[dataset.dataset_id]

            yolo_data = yolo_data_objects[dataset.dataset_id]
     
            check, err = yolo_data.delete_all()

            if not check :
                    return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #borrar el dataset de la base de datos
           
            del yolo_data_objects[dataset.dataset_id]

            try: 
                dataset.delete()
            except Exception as e:
                print(e)
                return JsonResponse({'error': 'Cannot delete dataset'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return JsonResponse({'message': 'Dataset deleted'}, status=status.HTTP_200_OK)

        elif dataset.format == "coco":

            if dataset.dataset_id in coco_data_objects: 
                coco_data = coco_data_objects[dataset.dataset_id]

            coco_data = coco_data_objects[dataset.dataset_id]
          
            check, err = coco_data.delete_all()

            if not check :
                    return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #borrar el dataset de la base de datos
            del coco_data_objects[dataset.dataset_id]
            try: 
                dataset.delete()
            except:
                return JsonResponse({'error': 'Cannot delete dataset'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return JsonResponse({'message': 'Dataset deleted'}, status=status.HTTP_200_OK)
        else: 
            return JsonResponse({'error': 'Invalid dataset format'}, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == "PATCH":
     
        try:

            dataset = Datasets.objects.get(dataset_id=dataset_id)
            fields = request.data.get('fields')
            values = request.data.get('values')
           
            for i in range(len(fields)): 
              
                if fields[i] == 'description':
                    dataset.description = values[i]
                    dataset.save()
                   
                elif fields[i] == 'privacy':
                    dataset.is_public = values[i]
                    dataset.save()
                   
                elif fields[i] == 'splits': 
                    print("Modifying splits")
                    #check if changes have been made 
                    if dataset.format == "coco": 
                        if dataset.dataset_id not in coco_data_objects:
                            coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
                        coco_data = coco_data_objects[dataset.dataset_id]
                        check, err, train_imgs, val_imgs, test_imgs= coco_data.save_modifications()
                        if not check: 
                            return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        else: 
                            check, err = coco_data.delete_tmp()
                            if not check :
                                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                            #delete from the dictionary
                            del coco_data_objects[dataset.dataset_id]
                            #change status in database 
                            dataset.type = "splits"
                            dataset.num_images_train = train_imgs
                            dataset.num_images_val = val_imgs
                            dataset.num_images_test = test_imgs
                            dataset.save()
                            return JsonResponse({'message': 'Dataset updated'}, status=status.HTTP_200_OK)
                        
                    elif dataset.format == "yolo":
                        print("modifying splits yolo")
                        if dataset.dataset_id not in yolo_data_objects: 
                            yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
                        yolo_data = yolo_data_objects[dataset.dataset_id]

                        check, err, train_imgs, val_imgs, test_imgs= yolo_data.save_modifications()
                        
                        if not check: 
                            return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
                        else: 
                            check, err = yolo_data.delete_tmp()
                            if not check :
                                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                            #delete from the dictionary
                            del yolo_data_objects[dataset.dataset_id]
                            #change status in database 
                            dataset.type = "splits"
                            dataset.num_images_train = train_imgs
                            dataset.num_images_val = val_imgs
                            dataset.num_images_test = test_imgs
                            dataset.save()
                            return JsonResponse({'message': 'Dataset updated'}, status=status.HTTP_200_OK)
                    else: 
                        return JsonResponse({'error': 'Invalid dataset format'}, status=status.HTTP_400_BAD_REQUEST)
                #convert form coco to yolo
                elif fields[i]== "format": 
                    if dataset.format == "yolo": 
                        if dataset.dataset_id not in yolo_data_objects: 
                            yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
                        yolo_data = yolo_data_objects[dataset.dataset_id]
                        yolo_data.convert_to_coco()
                        #delete data
                        yolo_data.delete_tmp()
                        #delete from the dictionary
                        del yolo_data_objects[dataset.dataset_id]
                        dataset.format = "coco"
                        dataset.save()

                else:
                    return JsonResponse({'error': 'Invalid field'}, status=status.HTTP_404_NOT_FOUND)
            
            return JsonResponse({'message': 'Dataset updated'}, status=status.HTTP_200_OK)
        except Exception as e:
            print("error", e)
            return JsonResponse({'error': 'Cannot update dataset'}, status=status.HTTP_404_NOT_FOUND)    
    else: 
        return JsonResponse({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def split_dataset(request, dataset_id): 
    global yolo_data_objects
    global coco_data_objects
    if request.method == "PATCH":
        print("method patch")
        try:
            dataset = Datasets.objects.get(dataset_id=dataset_id)
            if dataset.type == 'splits':
                return JsonResponse({'error': 'Dataset is not splittable'}, status=status.HTTP_400_BAD_REQUEST)
            elif dataset.type == 'no-splits':
                print("no splits")
                #get the values form the post request 
                train = request.data.get('trainNumber', 70)
                val = request.data.get('valNumber', 20)
                test = request.data.get('testNumber', 30)
                print("train", train, "val", val, "test", test)
                #test that the values are correct 
                if train + val + test != 100:
                    return JsonResponse({'error': 'Invalid split values'}, status=status.HTTP_400_BAD_REQUEST)
                #get the dataset format
                if dataset.format == "yolo": 
                    print("yolo")
                    if dataset.dataset_id not in yolo_data_objects: 
                        yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
                    yolo_data = yolo_data_objects[dataset.dataset_id]
                    #split the dataset
                    print("splitting")
                    check, err, train_num, val_num, test_num = yolo_data.create_splits(train, val, test, dataset.num_images_train)
                    if not check: 
                        return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    dataset.num_images_train = train_num
                    dataset.num_images_val = val_num
                    dataset.num_images_test = test_num
                    dataset.save()
                    return JsonResponse({'message': 'Dataset splitted'}, status=status.HTTP_200_OK)

                elif dataset.format == "coco":
                    if dataset.dataset_id not in coco_data_objects:
                        coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
                    coco_data = coco_data_objects[dataset.dataset_id]
                    #split the dataset
                    check, err, train_num, val_num, test_num = coco_data.create_splits(train, val, test)
                    if not check: 
                        return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    dataset.num_images_train = train
                    dataset.num_images_val = val
                    dataset.num_images_test = test
                    dataset.save()
                    return JsonResponse({'message': 'Dataset splitted'}, status=status.HTTP_200_OK)
                else: 
                    return JsonResponse({'error': 'Invalid dataset format'}, status=status.HTTP_400_BAD_REQUEST)

                return JsonResponse({'message': 'Dataset splitted'}, status=status.HTTP_200_OK)
        except Exception as e:
            print("error", e)
            return JsonResponse({'error': 'Cannot split dataset'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == "DELETE": 
        dataset = Datasets.objects.get(dataset_id=dataset_id)
        if dataset.format == "yolo": 
            if dataset.dataset_id not in yolo_data_objects: 
                yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
            yolo_data = yolo_data_objects[dataset.dataset_id]
            check, err = yolo_data.delete_splits()
            if not check: 
                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else: 
                dataset.type = "no-splits"
                dataset.num_images_train = yolo_data.num_images_train + yolo_data.num_images_val + yolo_data.num_images_test
                dataset.num_images_val = 0
                dataset.num_images_test = 0
                dataset.save()
                #eliminar el dataset de la lista de objetos -> cuando vuelva a entrar se me vuelve a cargar 
                del yolo_data_objects[dataset.dataset_id]
                return JsonResponse({'message': 'Dataset unsplit'}, status=status.HTTP_200_OK)
        elif dataset.format == "coco":
            if dataset.dataset_id not in coco_data_objects:
                coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
            coco_data = coco_data_objects[dataset.dataset_id]
            check, err = coco_data.delete_splits()
            if not check: 
                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else: 
                dataset.type = "no-splits"
                dataset.num_images_train = coco_data.num_images_train + coco_data.num_images_val + coco_data.num_images_test
                dataset.num_images_val = 0
                dataset.num_images_test = 0
                dataset.save()
                #eliminar el dataset de la lista de objetos -> cuando vuelva a entrar se me vuelve a cargar 
                del coco_data_objects[dataset.dataset_id]
                return JsonResponse({'message': 'Dataset unsplit'}, status=status.HTTP_200_OK)
        else: 
            return JsonResponse({'error': 'Invalid dataset format'}, status=status.HTTP_400_BAD_REQUEST)
    else: 
        return JsonResponse({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def modify_image(request, dataset_id, image_id): 
    global yolo_data_objects
    global coco_data_objects
    if request.method == "DELETE": 
        dataset = Datasets.objects.get(dataset_id=dataset_id)
        if dataset.format == "yolo": 
            if dataset.dataset_id not in yolo_data_objects: 
                yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
            yolo_data = yolo_data_objects[dataset.dataset_id]
            
            #delete the image and rest the temprary files
            check, err, split = yolo_data.delete_image(image_id)
            if not check: 
                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else: 
                #borrar una imagen del split donde se haya guardado
                if split == "train" or dataset.type == "no-splits" :
                    dataset.num_images_train -= 1
                elif split == "val":
                    dataset.num_images_val -= 1
                elif split == "test":
                    dataset.num_images_test -= 1

                try: 
                    dataset.save()
                except:
                    return JsonResponse({'error': 'Cannot update dataset'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return JsonResponse({'message': 'Image deleted'}, status=status.HTTP_200_OK)

        elif dataset.format == "coco":

            if dataset.dataset_id not in coco_data_objects:
                coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
            
            coco_data = coco_data_objects[dataset.dataset_id]

            #delete the image and rest the temprary files
            check, err, split = coco_data.delete_image(image_id)
            if not check: 
                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else: 
                #borrar una imagen del split donde se haya guardado
                if split == "train" or dataset.type == "no-splits" :
                    dataset.num_images_train -= 1
                elif split == "val":
                    dataset.num_images_val -= 1
                elif split == "test":
                    dataset.num_images_test -= 1

                try: 
                    dataset.save()
                except:
                    return JsonResponse({'error': 'Cannot update dataset'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return JsonResponse({'message': 'Image deleted'}, status=status.HTTP_200_OK)

        else: 
            return JsonResponse({'error': 'Invalid dataset format'}, status=status.HTTP_400_BAD_REQUEST)
    else: 
        return JsonResponse({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def modify_temporal_folder(request, dataset_id): 
    global yolo_data_objects
    global coco_data_objects
    if request.method == "DELETE": 
        dataset = Datasets.objects.get(dataset_id=dataset_id)
        if dataset.format == "yolo": 
            if dataset.dataset_id not in yolo_data_objects: 
                yolo_data_objects[dataset.dataset_id] = YoloData(dataset.name, dataset.type, dataset.url)
            yolo_data = yolo_data_objects[dataset.dataset_id]
            check, err = yolo_data.delete_tmp()
            if not check: 
                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else: 
                return JsonResponse({'message': 'Temporal folder deleted'}, status=status.HTTP_200_OK)
        elif dataset.format == "coco":
            if dataset.dataset_id not in coco_data_objects:
                coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
            coco_data = coco_data_objects[dataset.dataset_id]
            check, err = coco_data.delete_tmp()
            if not check: 
                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else: 
                return JsonResponse({'message': 'Temporal folder deleted'}, status=status.HTTP_200_OK)
        else: 
            return JsonResponse({'error': 'Invalid dataset format'}, status=status.HTTP_400_BAD_REQUEST)
    else: 
        return JsonResponse({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_summary(request, dataset_id): 
    global yolo_data_objects
    global coco_data_objects
    if request.method == "GET": 
        dataset = Datasets.objects.get(dataset_id=dataset_id)
        if dataset.format == "coco":
            if dataset.dataset_id not in coco_data_objects:
                coco_data_objects[dataset.dataset_id] = CocoData(dataset.name, dataset.type, dataset.url)
            coco_data = coco_data_objects[dataset.dataset_id]
            err, summary, msgErr = coco_data.get_summary()
            if err is not None:
                return JsonResponse({'error': msgErr}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return JsonResponse(summary, safe=False)
        else: 
            return JsonResponse({'error': 'Invalid dataset format'}, status=status.HTTP_400_BAD_REQUEST)
    else: 
        return JsonResponse({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
