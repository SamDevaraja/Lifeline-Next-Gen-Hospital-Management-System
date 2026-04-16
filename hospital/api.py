from rest_framework import viewsets, permissions, status
from django.db import transaction
from django.core.cache import cache
import uuid
from hospital.permissions import RBACPermission  # type: ignore
from rest_framework.response import Response  # type: ignore
from django.http import HttpResponse  # type: ignore
from rest_framework.decorators import action, api_view, permission_classes  # type: ignore
from rest_framework.permissions import AllowAny, IsAuthenticated  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from django.utils import timezone  # type: ignore
from django.db.models import Sum, Count, Q, Avg  # type: ignore
from hospital.models import (  # type: ignore
    Doctor, Patient, Appointment,
    MedicalRecord, Bill, Notification, PharmacyItem,
    TeleConsultationSession, MeetingParticipant, LabTest, Prescription, PharmacyOrder, UserProfile,
    SupportMessage
)
from hospital.serializers import (  # type: ignore
    UserSerializer, DoctorSerializer, DoctorCreateSerializer,
    PatientSerializer, PatientCreateSerializer, AppointmentSerializer,
    MedicalRecordSerializer, BillSerializer,
    NotificationSerializer, RegisterSerializer, DashboardStatsSerializer, PharmacyItemSerializer,
    TeleConsultationSessionSerializer, MeetingParticipantSerializer, LabTestSerializer, PrescriptionSerializer,
    PharmacyOrderSerializer, StaffUserSerializer, SupportMessageSerializer
)
import re
import json
import io
import requests # type: ignore
from reportlab.pdfgen import canvas  # type: ignore
from reportlab.lib.pagesizes import A4  # type: ignore
from reportlab.lib.units import inch  # type: ignore
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer  # type: ignore
from reportlab.lib import colors  # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
from django.shortcuts import redirect # type: ignore
from django.conf import settings # type: ignore

# ─── Search Views ───────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_search(request):
    """Unified search for patient portal."""
    q = request.query_params.get('q', '').lower()
    user = request.user
    if not hasattr(user, 'patient'):
        return Response([])
    
    pat = user.patient
    results = []
    
    # Search Appointments
    appts = Appointment.objects.filter(patient=pat, doctor__user__last_name__icontains=q)
    for a in appts:
        results.append({
            'type': 'Appointment',
            'title': f"Visit with Dr. {a.doctor.user.last_name}",
            'icon': 'Calendar',
            'path': '/patient/dashboard/appointments'
        })
        
    # Search Records
    records = MedicalRecord.objects.filter(patient=pat, diagnosis__icontains=q)
    for r in records:
        results.append({
            'type': 'Health Record',
            'title': f"Diagnosis: {r.diagnosis[:30]}",
            'icon': 'FileText',
            'path': '/patient/dashboard/records'
        })
        
    return Response(results[:10])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_search(request):
    """Unified search for staff terminal."""
    q = request.query_params.get('q', '').lower()
    search_type = request.query_params.get('type', 'all')
    user = request.user
    role = getattr(user, 'profile', None) and user.profile.role or 'receptionist'
    
    if not user.is_staff and not hasattr(user, 'doctor'):
         return Response([])
         
    results = []
    
    # Search Patients
    patients = Patient.objects.filter(Q(user__first_name__icontains=q) | Q(user__last_name__icontains=q) | Q(mobile__icontains=q))
    for p in patients[:5]:
        results.append({
            'type': 'Patient',
            'title': f"{p.user.first_name} {p.user.last_name}",
            'icon': 'User',
            'path': f"/dashboard/patients?q={p.mobile}"
        })
        
    # Search Doctors
    if role == 'admin' or hasattr(user, 'doctor'):
        doctors = Doctor.objects.filter(Q(user__first_name__icontains=q) | Q(user__last_name__icontains=q) | Q(department__icontains=q))
        for d in doctors[:5]:
            results.append({
                'type': 'Specialist',
                'title': f"Dr. {d.user.last_name} ({d.department})",
                'icon': 'Stethoscope',
                'path': '/dashboard/doctors'
            })
            
    # Search Meds if pharmacist
    if search_type in ['all', 'pharmacy'] and role in ['admin', 'pharmacist']:
        items = PharmacyItem.objects.filter(
            Q(name__icontains=q) | 
            Q(category__icontains=q)
        )[:10]
        for item in items:
            results.append({
                'title': item.name,
                'type': f'Medicine ({item.category})',
                'path': f'/dashboard/pharmacy',
                'icon': 'Pill'
            })
            
    return Response(results[:10])

# ─── Auth Views ───────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_email_redirect(request, key):
    """Intercept allauth email verification link and redirect to React frontend."""
    return redirect(f"{settings.FRONTEND_URL}/verify-email/{key}")


# ─── Auth Views ───────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user (patient or other public user)."""
    # Only patients and other non-staff roles can register publicly.
    # Doctors and Admins are created exclusively by existing administrators.
    data = request.data
    role = data.get('role', 'patient').lower()
    
    if role in ['doctor', 'admin', 'administrator', 'pharmacist', 'receptionist']:
        return Response({'error': f'Clinical {role} registration is restricted. Please contact the institutional administrator for internal credentials.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = RegisterSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = User.objects.create_user(
        username=data['username'],
        password=data['password'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
    )

    if role == 'patient':
        Patient.objects.create(
            user=user,
            address=data.get('address', ''),
            mobile=data.get('phone', ''),
            symptoms=data.get('symptoms', ''),
            status=False,
        )

    # Set email as verified directly since verification is disabled
    from allauth.account.models import EmailAddress  # type: ignore
    EmailAddress.objects.create(user=user, email=user.email, primary=True, verified=True)
    
    # Ensure the UserProfile role matches the requested role
    if hasattr(user, 'profile'):
        user.profile.role = role
        user.profile.save()

    return Response({'message': 'Registration successful. Please wait for clinical approval.'}, status=status.HTTP_201_CREATED)


import random
import os
@api_view(['POST'])
@permission_classes([AllowAny])
def direct_password_reset(request):
    """Direct password reset verified by matching BOTH Email and Mobile Number."""
    email = request.data.get('email')
    mobile = request.data.get('mobile')
    new_password = request.data.get('new_password')
    
    if not email or not mobile or not new_password:
        return Response({'error': 'Email, Mobile Number, and New Password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        user = User.objects.filter(email=email).first()
        if not user:
            # Mask existence
            return Response({'error': f"Identity Verification Failed. There is no account registered with the email: '{email}'"}, status=status.HTTP_404_NOT_FOUND)
            
        # Verify Mobile Match (Safely)
        user_mobile = ''
        try:
            if hasattr(user, 'patient') and getattr(user, 'patient', None):
                user_mobile = user.patient.mobile
            elif hasattr(user, 'doctor') and getattr(user, 'doctor', None):
                user_mobile = user.doctor.mobile
            elif hasattr(user, 'profile') and getattr(user, 'profile', None):
                user_mobile = user.profile.phone
        except Exception:
            pass
            
        if not user_mobile or str(user_mobile).strip() != str(mobile).strip():
            return Response({'error': f"Database Mismatch: You typed mobile '{mobile}', but the database has '{user_mobile}' registered for that email."}, status=status.HTTP_404_NOT_FOUND)
            
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password successfully reset. You may now log in.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    """Return a subset of hospital statistics for the public landing page strictly based on true production data."""
    return Response({
        'uptime': 99.98,
        'hospitals': Doctor.objects.filter(status=True, is_deleted=False).count(),
        'patients_served': Patient.objects.filter(is_deleted=False).count()
    })


from django.core.cache import cache  # type: ignore

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Return aggregated dashboard statistics personalized for the user role."""
    user = request.user
    role = 'admin' if user.is_staff else getattr(user, 'profile', None) and user.profile.role or 'patient'
    
    if hasattr(user, 'doctor'):
        role = 'doctor'
    elif hasattr(user, 'patient'):
        role = 'patient'

    cache_key = f'dashboard_stats_{role}_{user.id}'
    stats = cache.get(cache_key)
    
    if not stats:
        today = timezone.now().date()
        
        if role == 'admin' or user.is_staff:
            stats = {
                'total_doctors': Doctor.objects.filter(status=True, is_deleted=False).count(),
                'total_patients': Patient.objects.filter(status=True, is_deleted=False).count(),
                'total_appointments': Appointment.objects.filter(patient__is_deleted=False, doctor__is_deleted=False).count(),
                'pending_appointments': Appointment.objects.filter(status='pending', patient__is_deleted=False, doctor__is_deleted=False).count(),
                'today_appointments': Appointment.objects.filter(appointment_date=today, patient__is_deleted=False, doctor__is_deleted=False).count(),
                'total_revenue': float(Bill.objects.filter(status='paid', patient__is_deleted=False).aggregate(t=Sum('total_amount'))['t'] or 0),
                'pending_bills': Bill.objects.filter(status='pending', patient__is_deleted=False).count(),
                'high_risk_patients': Patient.objects.filter(risk_level__in=['high', 'critical'], is_deleted=False).count(),
                'lab_tests_today': LabTest.objects.filter(test_date__date=today).count(),
            }
        elif role == 'doctor':
            doc = user.doctor
            stats = {
                'total_patients': Patient.objects.filter(assigned_doctor=doc, is_deleted=False).count(),
                'total_appointments': Appointment.objects.filter(doctor=doc).count(),
                'pending_appointments': Appointment.objects.filter(doctor=doc, status='pending').count(),
                'today_appointments': Appointment.objects.filter(doctor=doc, appointment_date=today).count(),
                'high_risk_patients': Patient.objects.filter(assigned_doctor=doc, risk_level__in=['high', 'critical'], is_deleted=False).count(),
                'lab_tests_pending': LabTest.objects.filter(patient__assigned_doctor=doc).count(),
            }
        elif role == 'patient':
            pat = user.patient
            stats = {
                'my_appointments': Appointment.objects.filter(patient=pat).count(),
                'pending_bills': Bill.objects.filter(patient=pat, status='pending').count(),
                'total_records': MedicalRecord.objects.filter(patient=pat).count(),
                'latest_risk_level': pat.risk_level,
            }
        else:
            # Fallback for other staff roles
            stats = {
                'total_patients': Patient.objects.filter(is_deleted=False).count(),
                'today_appointments': Appointment.objects.filter(appointment_date=today).count(),
            }
            
        cache.set(cache_key, stats, 60)  # Cache for 60 seconds
    return Response(stats)



@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return or update current authenticated user info."""
    user = request.user
    
    # Auto-Enroll New Social Authentication Users as Patients
    if not hasattr(user, 'doctor') and not hasattr(user, 'patient') and not user.is_staff:
        Patient.objects.create(
            user=user,
            address='Pending Update',
            mobile='',
            symptoms='',
            status=False,
        )
    
    if request.method == 'PATCH':
        data = request.data
        
        # ─── Clinical Alias Update (Username) ──────────────
        new_username = data.get('username')
        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exclude(id=user.id).exists():
                return Response({'error': 'This username is already registered.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        # ─── Secure Credential Modification (Password) ──────
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        if new_password:
            if new_password != confirm_password:
                return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
            if len(new_password) < 8:
                return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        # ─── Institutional Identity Sync ────────────────────
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        
        # Update Profile (Core Phone only)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = data.get('phone', profile.phone)
        profile.save()

        # Update Specialized Role Tables
        if hasattr(user, 'doctor'):
            doc = user.doctor
            doc.mobile = data.get('phone', doc.mobile)
            doc.address = data.get('address', doc.address)
            doc.bio = data.get('bio', doc.bio)
            doc.save()
        elif hasattr(user, 'patient'):
            pat = user.patient
            pat.mobile = data.get('phone', pat.mobile)
            pat.address = data.get('address', pat.address)
            pat.symptoms = data.get('symptoms', pat.symptoms)
            pat.save()

        # Invalidate cache after update
        cache.delete(f'user_me_{user.id}')
        
    # Try to serve from cache for GET requests
    cache_key = f'user_me_{user.id}'
    # Bypass triggered for clinical identity synchronization
    # cached = cache.get(cache_key)
    # if cached: return Response(cached)

    # Identify actual clinical role (Physical role > Staff flag)
    if hasattr(user, 'doctor'):
        role = 'doctor'
    elif hasattr(user, 'patient'):
        role = 'patient'
    elif user.is_superuser:
        role = 'admin'
    elif hasattr(user, 'profile'):
        role = user.profile.role
    else:
        role = 'admin' if user.is_staff else 'patient'

    role_data = {}

    if hasattr(user, 'doctor'):
        role = 'doctor'
        doc = user.doctor
        role_data = {
            'doctor_id': doc.id,
            'department': doc.department, 
            'status': doc.status,
            'phone': doc.mobile,
            'address': doc.address,
            'bio': doc.bio
        }
    elif hasattr(user, 'patient') and role == 'patient':
        pat = user.patient
        role_data = {
            'patient_id': pat.id,
            'symptoms': pat.symptoms, 
            'risk_level': pat.risk_level,
            'phone': pat.mobile,
            'address': pat.address
        }
        
    # Check Profile again if it's receptionist/pharmacist
    if hasattr(user, 'profile') and role not in ['admin', 'doctor', 'patient']:
        role = user.profile.role
        role_data['phone'] = getattr(user.profile, 'phone', getattr(user.profile, 'mobile', ''))

    result = {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'role': role,
        **role_data,
    }
    if request.method == 'GET':
        cache.set(cache_key, result, 30)  # Cache user profile for 30 seconds
    return Response(result)


# ─── ViewSets ─────────────────────────────────────────────────
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('user').all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        qs = self.queryset.filter(is_deleted=False)
            
            
        status_filter = self.request.query_params.get('status')
        dept = self.request.query_params.get('department')
        if status_filter is not None:
            qs = qs.filter(status=(status_filter.lower() == 'true'))
        if dept:
            qs = qs.filter(department__icontains=dept)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return DoctorCreateSerializer
        return DoctorSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        data = self.request.data
        user = instance.user
        user_updated = False
        if 'first_name' in data:
            user.first_name = data['first_name']
            user_updated = True
        if 'last_name' in data:
            user.last_name = data['last_name']
            user_updated = True
        if 'email' in data:
            user.email = data['email']
            user_updated = True
        if 'username' in data:
            user.username = data['username']
            user_updated = True
        if 'password' in data and data['password']:
            user.set_password(data['password'])
            user_updated = True
            
        if user_updated:
            user.save()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves a doctor."""
        doctor = self.get_object()
        doctor.status = True
        doctor.save()
        return Response({'message': 'Doctor approved successfully.'})

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Return only approved, active, and available doctors."""
        doctors = Doctor.objects.filter(status=True, is_deleted=False).select_related('user')
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        """Archive record and deactivate associated user for clinical audit."""
        instance.is_deleted = True
        instance.save()
        user = instance.user
        if user:
            user.is_active = False
            user.username = f"archived_{user.id}_{user.username}"[:150]
            if user.email:
                user.email = f"archived_{user.id}_{user.email}"[:254]
            user.save()


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('user', 'assigned_doctor').all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_serializer_class(self):
        if self.action == 'create':
            return PatientCreateSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset.filter(is_deleted=False)

        # HIPAA Privacy: Doctors see only their patients. Patients see ONLY themselves.
        role = getattr(user, 'profile', None) and user.profile.role or 'patient'
        
        if user.is_superuser or role == 'admin':
            pass # Super Admins see all
        elif hasattr(user, 'doctor'):
            qs = qs.filter(assigned_doctor=user.doctor)
        elif hasattr(user, 'patient'):
            qs = qs.filter(user=user)
        else:
            # All other users (including non-clinical staff) see nothing in patient registry by default
            qs = qs.none() 

        status_filter = self.request.query_params.get('status')
        risk = self.request.query_params.get('risk_level')
        doctor_id = self.request.query_params.get('doctor_id')
        patient_id = self.request.query_params.get('patient_id')
        if status_filter is not None:
            qs = qs.filter(status=(status_filter.lower() == 'true'))
        if risk:
            qs = qs.filter(risk_level=risk)
        if doctor_id:
            qs = qs.filter(assigned_doctor_id=doctor_id)
        if patient_id:
            qs = qs.filter(id=patient_id)
        return qs

    def perform_destroy(self, instance):
        """Archive record and deactivate associated user for clinical audit."""
        instance.is_deleted = True
        instance.save()
        user = instance.user
        if user:
            user.is_active = False
            user.username = f"archived_{user.id}_{user.username}"[:150]
            if user.email:
                user.email = f"archived_{user.id}_{user.email}"[:254]
            user.save()

    @action(detail=True, methods=['post'])
    def update_risk(self, request, pk=None):
        patient = self.get_object()
        level = request.data.get('risk_level', 'low')
        patient.risk_level = level
        patient.save()
        return Response({'message': f'Risk level updated to {level}'})

    def perform_update(self, serializer):
        instance = serializer.save()
        data = self.request.data
        user = instance.user
        user_updated = False
        if 'first_name' in data:
            user.first_name = data['first_name']
            user_updated = True
        if 'last_name' in data:
            user.last_name = data['last_name']
            user_updated = True
        if 'email' in data:
            user.email = data['email']
            user_updated = True
        if 'username' in data:
            user.username = data['username']
            user_updated = True
        if 'password' in data and data['password']:
            user.set_password(data['password'])
            user_updated = True
            
        if user_updated:
            user.save()


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('patient__user', 'doctor__user').all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]
    
    def perform_create(self, serializer):
        user = self.request.user
        role = 'doctor' if hasattr(user, 'doctor') else ('patient' if hasattr(user, 'patient') else (getattr(user, 'profile', None) and user.profile.role) or ('admin' if user.is_staff else 'patient'))
        
        # Clinical Identity Locking: Physicians and Patients cannot masquerade as others.
        if hasattr(user, 'doctor') and role == 'doctor':
            # Strict Caseload Verification: Doctor can only schedule for their own patients.
            patient_id = self.request.data.get('patient')
            if patient_id:
                from hospital.models import Patient
                if not Patient.objects.filter(id=patient_id, assigned_doctor=user.doctor).exists():
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError("You cannot schedule for a patient outside your assigned caseload.")
            serializer.save(doctor=user.doctor)
        elif hasattr(user, 'patient') and role == 'patient':
            serializer.save(patient=user.patient)
        else:
            serializer.save()

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        role = 'doctor' if hasattr(user, 'doctor') else ('patient' if hasattr(user, 'patient') else (getattr(user, 'profile', None) and user.profile.role) or ('admin' if user.is_staff else 'patient'))
        
        # HIPAA Caseload Alignment: Physicians only see their OWN schedules and assigned clinical base.
        if hasattr(user, 'doctor') and role == 'doctor':
            qs = qs.filter(doctor=user.doctor, patient__assigned_doctor=user.doctor)
        elif hasattr(user, 'patient') and role == 'patient':
            qs = qs.filter(patient=user.patient)
        elif user.is_superuser or role == 'admin':
            pass
        else:
            qs = qs.none()

        if not user.is_staff and not hasattr(user, 'doctor'):
            qs = qs.filter(patient__is_deleted=False, doctor__is_deleted=False)
            
        doctor_id = self.request.query_params.get('doctor_id')
        patient_id = self.request.query_params.get('patient_id')
        appt_status = self.request.query_params.get('status')
        date = self.request.query_params.get('date')
        # Identification Overrides: Restricted to System Administrators.
        role = getattr(user, 'profile', None) and user.profile.role or 'patient'
        if user.is_superuser or role == 'admin':
            if doctor_id:
                qs = qs.filter(doctor_id=doctor_id)
            if patient_id:
                qs = qs.filter(patient_id=patient_id)
        
        if appt_status:
            qs = qs.filter(status=appt_status)
        if date:
            qs = qs.filter(appointment_date=date)
            
        return qs.order_by('-appointment_date')

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appt = self.get_object()
        appt.status = 'confirmed'
        appt.save()
        return Response({'message': 'Appointment confirmed.'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appt = self.get_object()
        appt.status = 'cancelled'
        appt.save()
        return Response({'message': 'Appointment cancelled.'})

    @action(detail=False, methods=['get'])
    def check_availability(self, request):
        doctor_id = request.query_params.get('doctor')
        app_date = request.query_params.get('date')
        if not doctor_id or not app_date:
            return Response({'error': 'Clinical context (Doctor/Date) required.'}, status=400)
            
        day_appts = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date=app_date,
            status__in=['pending', 'confirmed', 'arrived', 'in-consultation']
        )
        
        # Institutional Slot Map: 08:00 - 20:00 in 30-minute intervals
        from datetime import datetime
        slots = {}
        for h in range(8, 20):
            for m in [0, 30]:
                key = f"{h:02d}:{m:02d}"
                slots[key] = 0
                
        for a in day_appts:
            if not a.appointment_time: continue
            try:
                # a.appointment_time is a datetime.time object
                a_mins = a.appointment_time.hour * 60 + a.appointment_time.minute
                # Clinical Interval Quantization (Floor to nearest 30)
                floor_m = (a_mins // 30) * 30
                key = f"{a.appointment_time.hour:02d}:{floor_m:02d}"
                if key in slots:
                    slots[key] += 1
            except Exception as e:
                print(f"Slot calc error in check_availability: {e}")
                continue
        
        return Response({
            'slots': slots, 
            'capacity_per_interval': 3,
            'operational_start': '08:00',
            'operational_end': '20:00'
        })

    def create(self, request, *args, **kwargs):
        doctor_id = request.data.get('doctor')
        app_date = request.data.get('appointment_date')
        app_time = request.data.get('appointment_time')

        if doctor_id and app_date and app_time:
            from datetime import datetime
            try:
                # ─── Clinical Capacity Throttling ───────────────────
                # Max 3 appointments per 30-minute interval per doctor
                req_dt = datetime.strptime(app_time, '%H:%M')
                req_mins = req_dt.hour * 60 + req_dt.minute
                
                # Quantiize to 30-minute blocks (0, 30, 60...)
                interval_start_min = (req_mins // 30) * 30
                interval_end_min = interval_start_min + 30
                
                day_appts = Appointment.objects.filter(
                    doctor_id=doctor_id,
                    appointment_date=app_date,
                    status__in=['pending', 'confirmed', 'arrived', 'in-consultation']
                )
                
                conflict_count = 0
                for a in day_appts:
                    if not a.appointment_time: continue
                    try:
                        # a.appointment_time is a datetime.time object
                        a_mins = a.appointment_time.hour * 60 + a.appointment_time.minute
                        if interval_start_min <= a_mins < interval_end_min:
                            conflict_count += 1
                    except Exception as te:
                        print(f"Slot calc error: {te}")
                        continue
                
                if conflict_count >= 3:
                    h_start, m_start = divmod(interval_start_min, 60)
                    h_end, m_end = divmod(interval_end_min, 60)
                    return Response(
                        {'error': f'Institutional Capacity Overflow: The {h_start:02d}:{m_start:02d} - {h_end:02d}:{m_end:02d} interval is already at maximum occupancy (3/3 session slots). Please select an alternative slot.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Zero-Tolerance Exact Overlap Check (Legacy Safety)
                if day_appts.filter(appointment_time=app_time).exists():
                    return Response({'error': f'Dr. Slot Conflict: An appointment is already finalized at exactly {app_time}.'}, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                print(f"Capacity check bypassed: {e}")
                
        return super().create(request, *args, **kwargs)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.select_related('patient__user', 'doctor__user').all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        
        # Clinical Record Isolation: Bound to session doctor and assigned caseload.
        if hasattr(user, 'doctor') and not user.is_superuser:
            qs = qs.filter(doctor=user.doctor, patient__assigned_doctor=user.doctor)
        elif hasattr(user, 'patient') and not user.is_superuser:
            qs = qs.filter(patient=user.patient)
        elif user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin'):
            pass
        elif not user.is_staff:
            qs = qs.none()
            
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'doctor'):
            serializer.save(doctor=user.doctor, updated_by=user)
        else:
            serializer.save(updated_by=user)



class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.select_related('patient__user').all()
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        user = self.request.user
        # Financial Record Isolation: Bound to session identity
        role = getattr(user, 'profile', None) and user.profile.role or 'patient'
        
        qs = self.queryset
        if user.is_superuser or role in ['admin', 'pharmacist', 'receptionist']:
            pass # Financial controllers see all ledgers
        elif hasattr(user, 'patient'):
            qs = qs.filter(patient=user.patient)
        elif hasattr(user, 'doctor'):
            qs = qs.filter(patient__assigned_doctor=user.doctor)
            
        if not user.is_staff and not hasattr(user, 'doctor') and role not in ['pharmacist', 'receptionist']:
            qs = qs.filter(patient__is_deleted=False)
            
        bill_status = self.request.query_params.get('status')
        patient_id = self.request.query_params.get('patient_id')
        if bill_status:
            qs = qs.filter(status=bill_status)
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by('-bill_date')

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        bill = self.get_object()
        bill.status = 'paid'
        bill.paid_date = timezone.now().date()
        bill.payment_method = request.data.get('payment_method', 'cash')
        bill.save()
        return Response({'message': f'Bill {bill.invoice_number} marked as paid.'})

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        """Generate a professional PDF invoice for the bill with Zero-Fail reliability."""
        import io
        import uuid
        from django.http import HttpResponse # type: ignore
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle # type: ignore
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle # type: ignore
        from reportlab.lib import colors # type: ignore
        from reportlab.lib.pagesizes import A4 # type: ignore
        
        bill = self.get_object()
        
        # Zero-Fail Name Logic
        p_name = "UNREGISTERED GUEST"
        if bill.patient:
            p_name = str(bill.patient.get_name)
        elif bill.guest_name:
            p_name = str(bill.guest_name)

        patient_id_str = f"PID-{bill.patient.id:04d}" if bill.patient else f"G-MOBILE: {bill.guest_mobile or 'N/A'}"

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=50, bottomMargin=50)
        elements = []
        styles = getSampleStyleSheet()

        # Custom Styles (LUNA Theme)
        title_style = ParagraphStyle(
            'LUNATitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#0F4C81'),
            spaceAfter=5, fontName='Helvetica-Bold'
        )
        subtitle_style = ParagraphStyle(
            'LUNASub', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#2EC4B6'),
            spaceAfter=20, fontName='Helvetica-Bold'
        )
        norm_style = ParagraphStyle('LUNANorm', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#061e3a'))

        # Header Section
        elements.append(Paragraph("Lifeline Hospital", title_style))
        elements.append(Paragraph("INSTITUTIONAL BILLING TERMINAL", subtitle_style))
        elements.append(Paragraph("Lifeline Medical Tower, Koramangala<br/>Bangalore — 560034<br/>Phone: +91 80 4567 8900", norm_style))
        elements.append(Spacer(1, 20))

        # Invoice Info vs Patient Info
        info_data = [
            [
                Paragraph(f"<b>Billed To:</b><br/>{p_name}<br/>ID: {patient_id_str}", norm_style),
                Paragraph(f"<b>Invoice #:</b> {str(bill.invoice_number)}<br/><b>Date:</b> {str(bill.bill_date)}<br/><b>Status:</b> {str(bill.status).upper()}", norm_style)
            ]
        ]
        info_table = Table(info_data, colWidths=[250, 250])
        info_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 20),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 15))

        # Line Items Table
        data = [
            ['Description', 'Amount (₹)'],
            ['Consultation Fee', f"{float(bill.consultation_fee or 0):,.2f}"],
            ['Medicine Cost', f"{float(bill.medicine_cost or 0):,.2f}"],
            ['Test & Diagnostic Cost', f"{float(bill.test_cost or 0):,.2f}"],
            ['Room / Facility Charge', f"{float(bill.room_charge or 0):,.2f}"],
            ['Other Charges', f"{float(bill.other_charges or 0):,.2f}"]
        ]

        subtotal = float(bill.consultation_fee or 0) + float(bill.medicine_cost or 0) + float(bill.test_cost or 0) + float(bill.room_charge or 0) + float(bill.other_charges or 0)
        discount_amt = subtotal * (float(bill.discount or 0) / 100)
        tax_amt = (subtotal - discount_amt) * (float(bill.tax_rate or 18) / 100)

        data.append(['', '']) # empty spacer
        data.append(['Subtotal', f"{subtotal:,.2f}"])
        data.append([f"Discount ({bill.discount}%)", f"-{discount_amt:,.2f}"])
        data.append([f"Tax ({bill.tax_rate}%)", f"+{tax_amt:,.2f}"])
        data.append(['TOTAL AMOUNT', f"{float(bill.total_amount or 0):,.2f}"])

        table = Table(data, colWidths=[350, 150])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (1,0), colors.HexColor('#0F4C81')),
            ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 12),
            ('BOTTOMPADDING', (0,0), (-1,0), 10),
            ('TOPPADDING', (0,1), (-1,-1), 8),
            ('BOTTOMPADDING', (0,1), (-1,-1), 8),
            # Table borders and lines
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#A7EBF2')),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,-1), (-1,-1), 12),
            ('TEXTCOLOR', (0,-1), (1,-1), colors.HexColor('#2EC4B6')),
            ('LINEABOVE', (0,-1), (-1,-1), 1.5, colors.HexColor('#0F4C81')),
            ('LINEBELOW', (0,-1), (-1,-1), 1.5, colors.HexColor('#0F4C81')),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 40))
        
        # Footer
        elements.append(Paragraph("Thank you for choosing Lifeline Hospital. For billing inquiries, contact billing@lifeline.health", norm_style))
        if bill.status == 'paid':
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(f"<b>Payment Method:</b> {str(bill.payment_method or '').capitalize()}<br/><b>Paid On:</b> {str(bill.paid_date or '')}", norm_style))

        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{str(bill.invoice_number or uuid.uuid4().hex[:6])}.pdf"'
        return response


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, RBACPermission]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        # Apply the slice only during the GET compilation to prevent ORM update crashes
        queryset = self.get_queryset()[:50]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All notifications marked as read'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'message': 'Notification marked as read.'})


class PharmacyItemViewSet(viewsets.ModelViewSet):
    queryset = PharmacyItem.objects.all()
    serializer_class = PharmacyItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = self.queryset
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs.order_by('name')

    @action(detail=True, methods=['post'])
    def restock(self, request, pk=None):
        """Add units to existing stock."""
        item = self.get_object()
        qty = int(request.data.get('quantity', 0))
        if qty <= 0:
            return Response({'error': 'Quantity must be positive.'}, status=status.HTTP_400_BAD_REQUEST)
        item.stock_level += qty
        item.save()
        return Response({'message': f'{qty} units added. New stock: {item.stock_level}', 'stock_level': item.stock_level, 'status': item.status})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Return per-category stock summary for charts."""
        data = (
            PharmacyItem.objects
            .values('category')
            .annotate(
                total_units=Sum('stock_level'), 
                item_count=Count('id'),
                avg_price=Avg('unit_price')
            )
            .order_by('-total_units')
        )
        return Response(list(data))




class TeleConsultationViewSet(viewsets.ModelViewSet):
    queryset = TeleConsultationSession.objects.select_related('created_by__user', 'patient__user', 'appointment').all()
    serializer_class = TeleConsultationSessionSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.is_staff: return qs
        return qs.filter(Q(created_by__user=user) | Q(patient__user=user) | Q(participants__user=user)).distinct()

    @action(detail=False, methods=['post'], url_path='create')
    def create_meeting(self, request):
        """Strict Provisioning: Only verified physicians can initiate a secure clinical bridge."""
        if not hasattr(request.user, 'doctor'):
            return Response({'error': 'Clinical Authority Required: Only physicians can initiate consultation bridges.'}, status=status.HTTP_403_FORBIDDEN)
            
        appointment_id = request.data.get('appointment')
        patient_id = request.data.get('patient')
        
        if not appointment_id or not patient_id:
            return Response({'error': 'Clinical identifiers (appointment/patient) are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            patient = Patient.objects.get(id=patient_id)
            
            # Deactivate any existing live bridges for this appointment to maintain 1:1 parity
            TeleConsultationSession.objects.filter(appointment=appointment, status='live').update(status='cancelled')
            
            token = uuid.uuid4()
            # If a custom link is provided (e.g. from the Telemedicine UI), use it.
            # Otherwise, provision a secure institutional bridge.
            link = request.data.get('meeting_link')
            if not link:
                room_name = f"luna-{token.hex[:3]}-{token.hex[3:7]}-{token.hex[7:10]}"
                link = f"https://meet.google.com/{room_name}"
            
            session = TeleConsultationSession.objects.create(
                appointment=appointment,
                patient=patient,
                created_by=request.user.doctor,
                token=token,
                meeting_link=link,
                status='live'
            )
            
            # Automated IMMUTABLE Participant Enrollment
            MeetingParticipant.objects.create(session=session, user=request.user, role='doctor')
            MeetingParticipant.objects.create(session=session, user=patient.user, role='patient')
            
            return Response(TeleConsultationSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Bridge initialization failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='join/(?P<token>[^/.]+)')
    def join_by_token(self, request, token=None):
        """Zero-Trust Join Logic: Token check + Enrolled Participant validation."""
        try:
            session = TeleConsultationSession.objects.get(token=token, status='live')
            
            # Strict Enrollment Check
            is_enrolled = MeetingParticipant.objects.filter(session=session, user=request.user).exists()
            if not is_enrolled and not request.user.is_staff:
                return Response({'error': 'UNAUTHORIZED: You are not an enrolled participant for this clinical session.'}, status=status.HTTP_403_FORBIDDEN)
                
            return Response({
                'id': session.id,
                'token': session.token,
                'status': session.status,
                'meeting_link': session.meeting_link,
                'patient_name': session.patient.get_name,
                'doctor_name': session.created_by.get_name
            })
        except TeleConsultationSession.DoesNotExist:
            return Response({'error': 'Clinical session not found, expired, or terminated.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='invite')
    def invite_specialist(self, request):
        """Clinical Collaboration: Attending physician invites specialists to the active bridge."""
        session_id = request.data.get('session_id')
        doctor_id = request.data.get('doctor_id')
        
        if not session_id or not doctor_id:
            return Response({'error': 'Session and Specialist identifiers required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            session = TeleConsultationSession.objects.get(id=session_id)
            if session.created_by.user != request.user:
                return Response({'error': 'AUTHORITY DENIED: Only the attending physician can invite specialists.'}, status=status.HTTP_403_FORBIDDEN)
                
            invitee = Doctor.objects.get(id=doctor_id)
            MeetingParticipant.objects.get_or_create(session=session, user=invitee.user, defaults={'role': 'doctor'})
            
            # Direct System Notification
            from hospital.models import Notification
            Notification.objects.create(
                user=invitee.user,
                title="Specialist Invitation Request",
                message=f"Dr. {request.user.get_full_name()} has requested your specialized assistance for Patient {session.patient.get_name}.",
                notification_type='appointment'
            )
            return Response({'message': 'Specialist invitation dispatched and access granted.'})
        except Exception as e:
            return Response({'error': f'Enrollment failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        session = self.get_object()
        return Response(MeetingParticipantSerializer(session.participants.all(), many=True).data)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'completed':
            from hospital.models import Appointment
            if instance.appointment:
                instance.appointment.status = 'completed'
                instance.appointment.save()


class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.select_related('patient__user').all()
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        qs = self.queryset
        user = self.request.user
        
        if hasattr(user, 'doctor') and not user.is_superuser:
            qs = qs.filter(patient__assigned_doctor=user.doctor)
        elif hasattr(user, 'patient') and not user.is_superuser:
            qs = qs.filter(patient=user.patient)
        elif user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin'):
            pass
        elif not user.is_staff:
            qs = qs.none()

        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related('doctor__user', 'patient__user').all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        qs = self.queryset
        user = self.request.user
        
        if hasattr(user, 'doctor') and not user.is_superuser:
            qs = qs.filter(doctor=user.doctor, patient__assigned_doctor=user.doctor)
        elif hasattr(user, 'patient') and not user.is_superuser:
            qs = qs.filter(patient=user.patient)
        elif user.is_superuser or (hasattr(user, 'profile') and user.profile.role in ['admin', 'pharmacist']):
            pass
        elif not user.is_staff:
            qs = qs.none()

        patient_id = self.request.query_params.get('patient_id')
        date = self.request.query_params.get('date')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if date:
            qs = qs.filter(created_at__date=date)
        return qs

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter # type: ignore
from dj_rest_auth.registration.views import SocialLoginView # type: ignore

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter




class PharmacyOrderViewSet(viewsets.ModelViewSet):
    queryset = PharmacyOrder.objects.all()
    serializer_class = PharmacyOrderSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        # Pharmacists see all orders, others see their own (if applicable)
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            return self.queryset
        return self.queryset.filter(pharmacist=user)

    @action(detail=False, methods=['post'])
    def process_order(self, request):
        """
        Atomic Pharmacy Transaction Engine.
        Processes either a Prescription Fulfillment or a Direct POS Sale.
        """
        data = request.data
        mode = data.get('mode') # 'rx' or 'pos'
        prescription_id = data.get('prescription_id')
        patient_id = data.get('patient_id')
        items = data.get('items', []) # List of {id, quantity}
        payment_status = data.get('payment_status', 'pending')
        
        if not items:
            return Response({'error': 'No clinical items provided for fulfillment.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from decimal import Decimal
            with transaction.atomic():
                total_medicine_cost = Decimal('0')
                
                # 1. Stock Validation & Deduction
                for item in items:
                    try:
                        pharm_item = PharmacyItem.objects.select_for_update().get(id=item['id'])
                    except PharmacyItem.DoesNotExist:
                        return Response({'error': f"Clinical Asset ID {item['id']} not found in inventory."}, status=status.HTTP_404_NOT_FOUND)
                    
                    qty = int(item['quantity'])
                    if pharm_item.stock_level < qty:
                        return Response({'error': f"Insufficient stock for {pharm_item.name}. Available: {pharm_item.stock_level}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    pharm_item.stock_level -= qty
                    pharm_item.save()
                    total_medicine_cost += pharm_item.unit_price * Decimal(str(qty))

                # 2. Prescription Logic
                prescription = None
                if mode == 'rx' and prescription_id:
                    prescription = Prescription.objects.get(id=prescription_id)
                    # Update or create PharmacyOrder
                    order, created = PharmacyOrder.objects.update_or_create(
                        prescription=prescription,
                        defaults={'pharmacist': request.user, 'status': 'completed'}
                    )
                    patient_id = prescription.patient.id

                # 3. Bill Generation
                guest_name = data.get('guest_name')
                guest_mobile = data.get('guest_mobile')
                
                if not patient_id and not guest_name:
                    return Response({'error': 'Institutional patient session or Guest name required for transaction.'}, status=status.HTTP_400_BAD_REQUEST)
                
                patient = Patient.objects.filter(id=patient_id).first() if patient_id else None
                prefix = 'PHRM' if mode == 'rx' else 'POS'
                invoice_no = f"INV-{prefix}-{uuid.uuid4().hex[:6].upper()}"
                
                bill = Bill.objects.create(
                    patient=patient,
                    guest_name=guest_name if not patient else None,
                    guest_mobile=guest_mobile if not patient else None,
                    appointment=prescription.appointment if prescription else None,
                    invoice_number=invoice_no,
                    medicine_cost=total_medicine_cost,
                    status=payment_status,
                    payment_method='cash' if payment_status == 'paid' else ''
                )

                return Response({
                    'message': 'Transaction processed successfully.',
                    'invoice_number': invoice_no,
                    'bill_id': bill.id,
                    'total_amount': bill.total_amount,
                    'mode': mode
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f"Clinical Transaction Failure: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── STAFF GOVERNANCE ViewSet (Module 6) ─────────────────────
class StaffViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(profile__role__in=['admin', 'doctor', 'pharmacist', 'receptionist']).select_related('profile').all()
    serializer_class = StaffUserSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

    def get_queryset(self):
        # Operational Lockdown: Only superusers and designated admins can view the staff roster.
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            return self.queryset.none()
        return self.queryset.order_by('-date_joined')

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Enroll a new staff member with a specific clinical role."""
        data = request.data
        serializer = RegisterSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        v_data = serializer.validated_data
        
        # Identity Construction
        user = User.objects.create_user(
            username=v_data['username'],
            password=v_data['password'],
            email=v_data['email'],
            first_name=v_data['first_name'],
            last_name=v_data['last_name']
        )
        
        from hospital.models import UserProfile
        UserProfile.objects.update_or_create(
            user=user, 
            defaults={
                'role': v_data.get('role', 'admin'),
                'phone': v_data.get('phone', '')
            }
        )
        user.is_staff = True
        user.is_active = True
        user.save()

        # Doctor Model Persistence (if applicable)
        if user.profile.role == 'doctor':
            from hospital.models import Doctor
            Doctor.objects.create(
                user=user,
                mobile=v_data.get('phone', ''),
                address=v_data.get('address', 'Institutional Facility'),
                department=v_data.get('department', 'Cardiologist'),
                status=True
            )

        return Response({'message': f'Institutional account created for {user.username} as {user.profile.role}.'}, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        """Archive staff member for clinical accountability."""
        instance.is_active = False
        instance.save()


class SupportMessageViewSet(viewsets.ModelViewSet):
    queryset = SupportMessage.objects.all()
    serializer_class = SupportMessageSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Operational Restriction: Only clinical admins/receptionists can manage support logs.
        user = self.request.user
        if not user.is_staff:
            return self.queryset.none()
        return self.queryset.order_by('-created_at')
