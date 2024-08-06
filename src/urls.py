from django.contrib import admin
from django.urls import path, include, re_path
from . import views
from django.conf import settings
#allow django to server files from media folder
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    path('datasets/', include('datasets.urls')),
    path('projects/', include('projects.urls')),
    path('auth/', include('authentication.urls'))

  
]

#urlpatterns += static(settings.STATIC_URL,
 #                         document_root=settings.STATIC_ROOT)
#urlpatterns += static(settings.MEDIA_URL,
 #                         document_root=settings.MEDIA_ROOT)
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
