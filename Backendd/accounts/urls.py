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
    ComplaintViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'hostels', HostelViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'complaints', ComplaintViewSet)

urlpatterns = [
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     path('api/auth/password_reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path(
        'api/auth/password_reset/confirm/<uidb64>/<token>/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),
    path('api/', include(router.urls)),
]