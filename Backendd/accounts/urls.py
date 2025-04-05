from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet,
    HostelViewSet,
    RoomViewSet,
    CustomTokenObtainPairView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ComplaintViewSet,
    CurrentUserView,
    
)
from .views import LoginAPI

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'hostels', HostelViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'complaints', ComplaintViewSet)

urlpatterns = [
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
     path('api/login/', LoginAPI.as_view(), name='login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/password_reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/auth/password_reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/', include(router.urls)),
    path('api/current_user/', CurrentUserView.as_view(), name='current_user'),
]