from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


    # def get(self, request):
    #     # Implement your logic to handle GET requests
    #     data = {'message': 'Hello, API!'}
    #     return Response(data)
@require_http_methods(["GET"])
def datasets(request):
    
    data = {"id": 0, "name": "hola mundo"} 
    return JsonResponse(data, safe=False)
        