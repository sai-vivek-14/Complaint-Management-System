# warden/urls.py
from django.urls import path
from .views import WardenComplaintList, ApproveComplaint, RejectComplaint

urlpatterns = [
    path('complaints/', WardenComplaintList.as_view(), name='warden-complaints'),
    path('complaints/<int:pk>/approve/', ApproveComplaint.as_view(), name='approve-complaint'),
    path('complaints/<int:pk>/reject/', RejectComplaint.as_view(), name='reject-complaint'),
]
