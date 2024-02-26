import json
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from authentication.models import obtener_clave_por_id
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_user(request): 
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
    
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    
    if user.is_authenticated:
        serializer = UsuarioSerializer(user)
        return JsonResponse(serializer.data, status=200)
    else:
        return JsonResponse({'error': 'User is not authenticated.'}, status=401)
    
@api_view(['PUT'])   
@permission_classes([IsAuthenticated])
def update_user(request):
    if request.method == 'PUT':
        try:
            value = request.data.get('value')
            field = request.query_params.get('field', '')
            id = request.query_params.get('id', None)
            if not value or id == None:
                return JsonResponse({'error': 'Value is required.'}, status=400)

            # Obtener el usuario con el ID proporcionado
            user = User.objects.get(id=id)

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
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)
    


@api_view(['DELETE'])
@permission_classes([IsAuthenticated]) 
def eliminar_usuario(request, usuario_id):
    try:
        usuario = User.objects.get(pk=usuario_id)
        usuario.delete()
        return Response({'mensaje': 'Usuario eliminado correctamente'})
    except User.DoesNotExist:
        return Response({'error': 'El usuario especificado no existe'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def obtener_usuarios(request):
    # Obtener todos los usuarios
    usuarios = User.objects.exclude(id=request.user.id)  # Excluir al usuario actual
    
    # Serializar los usuarios
    serializer = UsuarioSerializer(usuarios, many=True)
    
    # Devolver la lista de usuarios serializados
    return Response({'usuarios': serializer.data})


@api_view(['GET'])
def obtener_clave(request, usuario_id):
    # Intentar obtener la clave del usuario por su ID
    clave_usuario = obtener_clave_por_id(usuario_id)

    if clave_usuario is not None:
        # Si se encuentra la clave, devolverla en la respuesta
        return JsonResponse({'clave': clave_usuario})
    else:
        # Si la clave no existe, devolver un mensaje de error
        return JsonResponse({'error': 'No se encontró ninguna clave para el usuario con el ID proporcionado.'}, status=404)
