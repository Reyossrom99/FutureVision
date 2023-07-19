from rest_framework.views import APIView
from rest_framework.response import Response

class DatasetsPrueba(APIView):
    def get(self, request):
        # Implement your logic to handle GET requests
        data = {'message': 'Hello, API!'}
        return Response(data)