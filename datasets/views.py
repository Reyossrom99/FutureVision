from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render

class DatasetsPrueba(APIView):
    # def get(self, request):
    #     # Implement your logic to handle GET requests
    #     data = {'message': 'Hello, API!'}
    #     return Response(data)
    def get(self, request): 
        context = {}
        return render(request, 'index.html')