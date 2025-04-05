from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Complaint
from .serializers import ComplaintSerializer
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.exceptions import NotAuthenticated
import json
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from rest_framework_simplejwt.authentication import JWTAuthentication

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]  # ← Validates JWT
    
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'complaint_category', 'room_number', 'place']
    search_fields = ['complaint_name', 'description', 'room_number', 'place']
    ordering_fields = ['created_at', 'updated_at', 'status']
    
    def perform_create(self, serializer):
        user = self.request.user  # Get the logged-in user
        complaint = serializer.save(user=self.request.user)
        roll_number = getattr(user, "roll_number", None)  # Fetch roll_number from CustomUser
        if not self.request.user.is_authenticated:
            raise NotAuthenticated("You must be logged in to create a complaint")
        

        serializer.save(user=self.request.user, roll_number=self.request.user.roll_number)
        self._send_confirmation_email(complaint)
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated:
            return Complaint.objects.none()
            
        if self.request.user.user_type == 'student':
            return queryset.filter(user=self.request.user)
        return queryset
    def _send_confirmation_email(self, complaint):
        subject = f"Complaint Registered: {complaint.complaint_name}"
        message = render_to_string('complaint_confirmation_email.html', {
            'user': self.request.user,
            'complaint': complaint,
            'support_email': settings.DEFAULT_FROM_EMAIL
        })
        send_mail(
            subject,
            strip_tags(message),  # Plain text version
            settings.DEFAULT_FROM_EMAIL,
            [self.request.user.email],
            html_message=message,  # HTML version
            fail_silently=False,
        )

         # Save the complaint with roll number

 # Wardens/staff see all
# API view for getting complaint categories
@csrf_exempt
def get_complaint_categories(request):
    if request.method == 'GET':
        categories = [category[0] for category in Complaint.CATEGORY_CHOICES]
        return JsonResponse({'categories': categories})
    return JsonResponse({'error': 'Invalid request method'}, status=400)
