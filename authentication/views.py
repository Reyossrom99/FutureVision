from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


# class LogoutView(APIView):     
#     permission_classes = (IsAuthenticated,)     
#     def post(self, request):
          
#           try:               
#             refresh_token = request.data["refresh_token"]               
#             token = RefreshToken(refresh_token)               
#             token.blacklist()               
#             return Response(status=status.HTTP_205_RESET_CONTENT)          
#           except Exception as e:               
#               return Response(status=status.HTTP_400_BAD_REQUEST)

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Authentication successful
            print("okay login")
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            # Authentication failed
            return JsonResponse({'error': 'Invalid credentials'}, status=400)