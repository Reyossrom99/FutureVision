import json
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

@api_view(['GET'])
def get_routes(request):
    """returns a view containing all the possible routes"""
    routes = [
        '/api/token',
        '/api/token/refresh'
    ]

    return Response(routes)

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        if not (username and password):
            return JsonResponse({'error': 'Both username and password are required.'}, status=400)
        try:
            # Check if the username is already taken
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username is already taken.'}, status=400)
            # Create the new user
            user = User.objects.create_user(username=username, password=password)
            return JsonResponse({'message': 'User created successfully.'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed.'}, status=405)
