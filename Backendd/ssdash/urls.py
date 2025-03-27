from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.conf import settings
from django.conf.urls.static import static

# Initialize the DefaultRouter
router = DefaultRouter()
router.register(r'complaints', views.ComplaintViewSet)  # Register the ComplaintViewSet with the router

# Define the URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Include the router's URLs
    path('categories/', views.get_complaint_categories, name='complaint-categories'),  # Custom endpoint for categories
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)