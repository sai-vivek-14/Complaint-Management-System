from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.forms import RollNumberPasswordResetForm

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ssdash.urls')),  # Include the URLs from the ssdash app
    path('api/auth/', include([
        path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),
    path('password_reset/', auth_views.PasswordResetView.as_view(
        form_class=RollNumberPasswordResetForm,
        template_name='accounts/password_reset.html',
    ), name='password_reset'),
]

# Add static URL mapping for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
