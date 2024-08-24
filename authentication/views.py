import json
from django.http import JsonResponse
from django.contrib.auth.models import User, Group, Permission
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from .serializers import user_serializer
from django.views.decorators.csrf import csrf_exempt
from django.contrib.contenttypes.models import ContentType

"""
    singup 
    Is a function that allow a POST operation to create and open the database for new users
"""
@csrf_exempt
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        role = data.get('role')
        user = request.user  # Get the authenticated user
        
        if not (username and password and email and role):
            return JsonResponse({'error': 'username, password, email, and role are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if any users exist in the database
        if User.objects.exists():
            return JsonResponse({'error': 'sign up is not allowed. There are existing users in the database.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if role != 'admin': 
                return JsonResponse({'error': 'the first user needs to be admin'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Create the new user
            user = User.objects.create_user(username=username, email=email, password=password)

            # Check if the group exists, and create it if it doesn't
            group, created = Group.objects.get_or_create(name=role)

            # Now add the user to the group
            user.groups.add(group)

            #also create other groups
            groupUser, created = Group.objects.get_or_create(name="user")

            #add permisions to group
            user_content_type = ContentType.objects.get_for_model(User)
            
            can_change_user = Permission.objects.get(
                codename='change_user',
                content_type=user_content_type,
            )
            can_delete_user = Permission.objects.get(
                codename='delete_user',
                content_type=user_content_type,
            )
            can_add_user = Permission.objects.get(
            codename='add_user',
            content_type=user_content_type,
            )
            
            group.permissions.add(can_change_user, can_delete_user, can_add_user)
            groupUser.permissions.add(can_change_user)
            
            return JsonResponse({'message': 'user created successfully.'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    else:
        return JsonResponse({'error': 'method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_users(request):

    # get all users execpt the current one
    usuarios = User.objects.exclude(id=request.user.id)  
    
    # serialize users
    serializer = user_serializer(usuarios, many=True)
    
    return JsonResponse({'users': serializer.data})

'''
    user
    Allows to manage the petitions with the current user
    * Get -> gets the current user info
    * Post -> creates a new user, if the current user has admin benefits
'''
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) 
def user(request): 
    #creates a new user
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        role = data.get('role')
        user = request.user  # Get the authenticated user
        
        # Check if the authenticated user is an admin
        if not user.groups.filter(name='admin').exists() or not user.has_perm('auth.add_user') :
            return JsonResponse({'error': 'you do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the required data is provided
        if not (username and password and email and role):
            return JsonResponse({'error': 'username, password, email, and role are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Check if a user with the provided username or email already exists
            if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'username or email is already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the new user
            new_user = User.objects.create_user(username=username, email=email, password=password)
            new_user.groups.add(Group.objects.get(name=role))
            
            return JsonResponse({'message': 'user created successfully.'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
    #gets info for the current user
    elif request.method == 'GET': 
        user = request.user
        serializer = user_serializer(user)
        return JsonResponse(serializer.data, status=200)

    else:
        return JsonResponse({'error': 'method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
'''
    user_modifications
    Is a method to modify or delete the current user
'''
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated]) 
def user_modifications(request, usuario_id): 

    user_to_modify = get_object_or_404(User, pk=usuario_id)
    if request.user != user_to_modify and not request.user.has_perm('auth.change_user'):
        return JsonResponse({'error': 'You do not have permission to modify this user.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        try:
            value = request.data.get('value')
            field = request.query_params.get('field', '')
            
            if not value or usuario_id == None:
                return JsonResponse({'error': 'value is required.'}, status=status.HTTP_400_BAD_REQUEST)

            # get the user with the ID
            user = User.objects.get(id=usuario_id)

            if field == 'username':
                # Verify if the username exits in the database
                if User.objects.filter(username=value).exclude(id=user.id).exists():
                    return JsonResponse({'error': 'username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
                
                user.username = value
            elif field == 'email':
                user.email = value
            elif field == 'password':
                user.set_password(value)
            elif field == 'group': 
                group = Group.objects.get(name=value)

                # asing the user to the group
                user.groups.clear()  
                user.groups.add(group)
            else:
                return JsonResponse({'error': 'invalid field.'}, status=status.HTTP_404_NOT_FOUND)
            
            user.save()
            serializer = user_serializer(user)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return JsonResponse({'error': 'user not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    elif request.method == 'DELETE': 
        try:
            usuario = User.objects.get(pk=usuario_id)
            usuario.delete()
            return JsonResponse({'mensage': 'user deleted from the database'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return JsonResponse({'error': 'the user does not exit in the database'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'error': 'method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
