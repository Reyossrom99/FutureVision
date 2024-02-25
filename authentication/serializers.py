from rest_framework import serializers
from django.contrib.auth.models import User, Group

class UsuarioSerializer(serializers.ModelSerializer):
    grupo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'grupo']

    def get_grupo(self, obj):
        grupo_usuario = obj.groups.first()
        return grupo_usuario.name if grupo_usuario else None
