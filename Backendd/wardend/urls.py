# urls.py

from django.urls import path
from . import views, api_views

# These URLs should be included in your main urls.py with a prefix like 'warden/'
urlpatterns = [
    # Dashboard views
    path('dashboard/', views.warden_dashboard, name='warden_dashboard'),
    path('complaints/', views.complaint_list, name='warden_complaint_list'),
    path('complaints/<int:complaint_id>/', views.complaint_detail, name='warden_complaint_detail'),
    path('export-complaints/', views.export_complaints_csv, name='export_complaints_csv'),
    
    # API endpoints for dashboard
    path('api/complaint-statistics/', api_views.complaint_statistics_api, name='complaint_statistics_api'),
    path('api/hostel-statistics/', api_views.hostel_statistics_api, name='hostel_statistics_api'),
]