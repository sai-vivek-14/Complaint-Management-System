# warden/urls.py
from django.urls import path
from .views import WardenComplaintList, ApproveComplaint

urlpatterns = [
    path('complaints/', WardenComplaintList.as_view(), name='warden-complaints'),
    path('complaints/<int:pk>/approve/', ApproveComplaint.as_view(), name='approve-complaint'),
]
