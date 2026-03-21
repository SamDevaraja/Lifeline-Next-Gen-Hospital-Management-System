from django.contrib import admin # type: ignore
from django.urls import path, include # type: ignore
from rest_framework import routers # type: ignore
from rest_framework.authtoken.views import obtain_auth_token # type: ignore
from hospital import api # type: ignore

router = routers.DefaultRouter()
router.register(r'doctors', api.DoctorViewSet)
router.register(r'patients', api.PatientViewSet)
router.register(r'appointments', api.AppointmentViewSet)

router.register(r'medical-records', api.MedicalRecordViewSet, basename='medical-records')
router.register(r'ai-diagnoses', api.AIDiagnosisViewSet, basename='ai-diagnoses')
router.register(r'bills', api.BillViewSet, basename='bills')
router.register(r'notifications', api.NotificationViewSet, basename='notifications')
router.register(r'pharmacy', api.PharmacyItemViewSet, basename='pharmacy')
router.register(r'telemed', api.TelemedSessionViewSet, basename='telemed')
router.register(r'lab-tests', api.LabTestViewSet, basename='lab-tests')
router.register(r'prescriptions', api.PrescriptionViewSet, basename='prescriptions')
router.register(r'pharmacy-orders', api.PharmacyOrderViewSet, basename='pharmacy-orders')
router.register(r'cleaning-tasks', api.CleaningTaskViewSet, basename='cleaning-tasks')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & Password Reset
    path('api/auth/direct-password-reset/', api.direct_password_reset, name='direct_password_reset'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    path('api/auth/google/', api.GoogleLogin.as_view(), name='google_login'),
    
    # Let allauth resolve the email confirm link but intercept it to redirect to the React frontend
    path('api/auth/registration/account-confirm-email/<str:key>/', api.confirm_email_redirect, name='account_confirm_email'),

    # Registration
    path('api/register/', api.register_user, name='register'),

    # Public stats
    path('api/public-stats/', api.public_stats, name='public_stats'),

    # Dashboard stats
    path('api/dashboard/stats/', api.dashboard_stats, name='dashboard_stats'),

    # Current user info
    path('api/me/', api.me, name='me'),

    # AI Agent Chat
    path('api/ai/chat/', api.ai_chat, name='ai_chat'),
    path('api/ai/gemini-proxy/', api.proxy_gemini, name='proxy_gemini'),

    # All API routes
    path('api/', include(router.urls)),
]
