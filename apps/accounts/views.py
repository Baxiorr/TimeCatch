from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import (
    CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin
)
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .models import UserAccount
from .serializers import UserSerializer
# Create your views here.


class UserViewSet(ViewSet):

    serializer_class = UserSerializer

    @staticmethod
    def list(request, *args, **kwargs):
        queryset = UserAccount.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)

    @staticmethod
    def retrieve(request, pk=None):
        queryset = UserAccount.objects.get(id=pk, is_active=True)
        serializer = UserSerializer(queryset)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def info(self, request):
        queryset = UserAccount.objects.all()
        account = queryset.get(id=request.data.get("requested_by"))
        serializer = UserSerializer(account)
        return Response(serializer.data)




