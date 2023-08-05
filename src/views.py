from django.shortcuts import render

def basic_web_page(request):
    return render(request, 'index.html')