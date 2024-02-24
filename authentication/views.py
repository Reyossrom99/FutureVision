import json
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
'''
    sign_up es un endpoint para crear una nueva cuenta de administrador cuando la base de datos esta vacia
    solo te permite crear esta cuenta cuando no hay ningun usuario registrado, 
    en caso contrario, necesitas acceder al perfil de administrador y crear las cuentas desde ahi, o borrar la base de datos
'''

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



@login_required
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



@login_required
def user_info(request):
    user = request.user
    
    if user.is_authenticated:
        if user.groups.filter(name='admin').exists():
            user_data = {
                'username': user.username,
                'email': user.email,
                'group': 'admin',
            }
        else:
            user_data = {
                'username': user.username,
                'email': user.email,
                'group': 'user',
            }
        return JsonResponse(user_data, status=200)
    else:
        return JsonResponse({'error': 'User is not authenticated.'}, status=401)
