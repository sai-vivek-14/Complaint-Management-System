from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Complaint
from .serializers import ComplaintSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'complaint_category', 'room_number', 'place']
    search_fields = ['complaint_name', 'description', 'room_number', 'place']
    ordering_fields = ['created_at', 'updated_at', 'status']

# API view for getting complaint categories
@csrf_exempt
def get_complaint_categories(request):
    if request.method == 'GET':
        categories = [category[0] for category in Complaint.CATEGORY_CHOICES]
        return JsonResponse({'categories': categories})
    return JsonResponse({'error': 'Invalid request method'}, status=400)