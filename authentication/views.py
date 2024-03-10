import json
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


from .serializers import UsuarioSerializer
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def sign_up(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        role = data.get('role')
        user = request.user  # Get the authenticated user
        
        if not (username and password and email and role):
            return JsonResponse({'error': 'Username, password, email, and role are required.'}, status=400)
        
        # Check if any users exist in the database
        if User.objects.exists():
            return JsonResponse({'error': 'Sign up is not allowed. There are existing users in the database.'}, status=400)
        
        try:
            if role != 'admin': 
                return JsonResponse({'error': 'The first user needs to be admin'}, status=400)
                
            # Create the new user
            user = User.objects.create_user(username=username, email=email, password=password)
            user.groups.add(Group.objects.get(name=role))
            return JsonResponse({'message': 'User created successfully.'}, status=200)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def register_user(request): 
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         username = data.get('username')
#         password = data.get('password')
#         email = data.get('email')
#         role = data.get('role')
#         user = request.user  # Get the authenticated user
        
#         # Check if the authenticated user is an admin
#         if not user.groups.filter(name='admin').exists():
#             return JsonResponse({'error': 'You do not have permission to perform this action.'}, status=403)
        
#         # Check if the required data is provided
#         if not (username and password and email and role):
#             return JsonResponse({'error': 'Username, password, email, and role are required.'}, status=400)
        
#         try:
#             # Check if a user with the provided username or email already exists
#             if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
#                 return JsonResponse({'error': 'Username or email is already taken.'}, status=400)
            
#             # Create the new user
#             new_user = User.objects.create_user(username=username, email=email, password=password)
#             new_user.groups.add(Group.objects.get(name=role))
            
#             return JsonResponse({'message': 'User created successfully.'}, status=200)
        
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=500)
    
#     else:
#         return JsonResponse({'error': 'Method not allowed.'}, status=405)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_info(request):
#     user = request.user
    
#     if user.is_authenticated:
#         serializer = UsuarioSerializer(user)
#         return JsonResponse(serializer.data, status=200)
#     else:
#         return JsonResponse({'error': 'User is not authenticated.'}, status=401)
    
# @api_view(['PUT'])   
# @permission_classes([IsAuthenticated])
# def update_user(request):
#     if request.method == 'PUT':
#         try:
#             value = request.data.get('value')
#             field = request.query_params.get('field', '')
#             id = request.query_params.get('id', None)
#             if not value or id == None:
#                 return JsonResponse({'error': 'Value is required.'}, status=400)

#             # Obtener el usuario con el ID proporcionado
#             user = User.objects.get(id=id)

#             if field == 'username':
#                 # Verificar si ya existe un usuario con el nuevo nombre
#                 if User.objects.filter(username=value).exclude(id=user.id).exists():
#                     return JsonResponse({'error': 'Username already exists.'}, status=400)
                
#                 user.username = value
#             elif field == 'email':
#                 user.email = value
#             elif field == 'password':
#                 user.set_password(value)
#             elif field == 'group': 
#                 print(value)
#                  # Obtener el grupo con el nombre proporcionado
#                 group = Group.objects.get(name=value)

#                 # Asignar el nuevo grupo al usuario
#                 user.groups.clear()  # Limpiar los grupos actuales del usuario
#                 user.groups.add(group)  # Agregar el nuevo grupo al usuario
#             else:
#                 return JsonResponse({'error': 'Invalid field.'}, status=400)
            
#             user.save()
#             serializer = UsuarioSerializer(user)
#             return JsonResponse(serializer.data, status=200)
#         except User.DoesNotExist:
#             return JsonResponse({'error': 'User not found.'}, status=404)
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=500)
#     else:
#         return JsonResponse({'error': 'Method not allowed.'}, status=405)
    


# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated]) 
# def eliminar_usuario(request, usuario_id):
#     try:
#         usuario = User.objects.get(pk=usuario_id)
#         usuario.delete()
#         return Response({'mensaje': 'Usuario eliminado correctamente'})
#     except User.DoesNotExist:
#         return Response({'error': 'El usuario especificado no existe'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def obtener_usuarios(request):
    # Obtener todos los usuarios
    usuarios = User.objects.exclude(id=request.user.id)  # Excluir al usuario actual
    
    # Serializar los usuarios
    serializer = UsuarioSerializer(usuarios, many=True)
    
    # Devolver la lista de usuarios serializados
    return Response({'usuarios': serializer.data})

'''
    user es un metodo creado para manejar las peticiones sobre el objecto usuario actual
    * Get -> obtener los datos de un usuario
    * Post -> crear un nuevo usuario
'''
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) 
def user(request): 
    #crear un nuevo usuario
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        role = data.get('role')
        user = request.user  # Get the authenticated user
        
        # Check if the authenticated user is an admin
        if not user.groups.filter(name='admin').exists():
            return JsonResponse({'error': 'You do not have permission to perform this action.'}, status=403)
        
        # Check if the required data is provided
        if not (username and password and email and role):
            return JsonResponse({'error': 'Username, password, email, and role are required.'}, status=400)
        
        try:
            # Check if a user with the provided username or email already exists
            if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Username or email is already taken.'}, status=400)
            
            # Create the new user
            new_user = User.objects.create_user(username=username, email=email, password=password)
            new_user.groups.add(Group.objects.get(name=role))
            
            return JsonResponse({'message': 'User created successfully.'}, status=200)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    #Listar al usuario actual 
    elif request.method == 'GET': 
        user = request.user
        serializer = UsuarioSerializer(user)
        return JsonResponse(serializer.data, status=200)

    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)
    
'''
    user_modifications es un metodo usuario para modificar a un usuario especificado en la peticion
    * PUT -> modifica los parametros pasados en la peticion 
    * DETELE -> borra a el usuario de la base de datos
'''
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated]) 
def user_modifications(request, usuario_id): 
    if request.method == 'PUT':
        try:
            value = request.data.get('value')
            field = request.query_params.get('field', '')
            
            if not value or usuario_id == None:
                return JsonResponse({'error': 'Value is required.'}, status=400)

            # Obtener el usuario con el ID proporcionado
            user = User.objects.get(id=usuario_id)

            if field == 'username':
                # Verificar si ya existe un usuario con el nuevo nombre
                if User.objects.filter(username=value).exclude(id=user.id).exists():
                    return JsonResponse({'error': 'Username already exists.'}, status=400)
                
                user.username = value
            elif field == 'email':
                user.email = value
            elif field == 'password':
                user.set_password(value)
            elif field == 'group': 
                print(value)
                 # Obtener el grupo con el nombre proporcionado
                group = Group.objects.get(name=value)

                # Asignar el nuevo grupo al usuario
                user.groups.clear()  # Limpiar los grupos actuales del usuario
                user.groups.add(group)  # Agregar el nuevo grupo al usuario
            else:
                return JsonResponse({'error': 'Invalid field.'}, status=400)
            
            user.save()
            serializer = UsuarioSerializer(user)
            return JsonResponse(serializer.data, status=200)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    elif request.method == 'DELETE': 
        try:
            usuario = User.objects.get(pk=usuario_id)
            usuario.delete()
            return Response({'mensaje': 'Usuario eliminado correctamente'})
        except User.DoesNotExist:
            return Response({'error': 'El usuario especificado no existe'}, status=404)
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)