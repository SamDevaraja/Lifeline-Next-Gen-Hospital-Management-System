from rest_framework import serializers  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from hospital.models import (  # type: ignore
    Doctor, Patient, Appointment,
    MedicalRecord, AIDiagnosis, Bill, Notification, PharmacyItem,
    TelemedSession, LabTest, Prescription, PharmacyOrder, CleaningTask
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']



class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # type: ignore
    get_name = serializers.ReadOnlyField()

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'profile_pic', 'address', 'mobile', 'department',
            'qualification', 'experience_years', 'consultation_fee', 'status',
            'available_days', 'bio', 'get_name', 'created_at'
        ]


class DoctorCreateSerializer(serializers.ModelSerializer):
    """For creating doctors with user data."""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = Doctor
        fields = [
            'username', 'password', 'first_name', 'last_name', 'email',
            'address', 'mobile', 'department', 'qualification', 'experience_years', 'consultation_fee', 'status'
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This System Alias (Login ID) is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This Email is already associated with an account.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            password=validated_data.pop('password'),
            first_name=validated_data.pop('first_name'),
            last_name=validated_data.pop('last_name'),
            email=validated_data.pop('email'),
        )
        return Doctor.objects.create(user=user, **validated_data)


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # type: ignore
    get_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    assigned_doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'profile_pic', 'address', 'mobile', 'date_of_birth',
            'blood_group', 'symptoms', 'allergies', 'medical_history', 'emergency_contact',
            'assigned_doctor', 'assigned_doctor_name', 'admit_date', 'status', 'risk_level',
            'get_name', 'age', 'created_at',
        ]

    def get_assigned_doctor_name(self, obj):
        if obj.assigned_doctor:
            return obj.assigned_doctor.get_name
        return None


class PatientCreateSerializer(serializers.ModelSerializer):
    """For admitting new patients with a dedicated local user account."""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = Patient
        fields = [
            'username', 'password', 'first_name', 'last_name', 'email',
            'address', 'mobile', 'date_of_birth', 'blood_group', 
            'symptoms', 'allergies', 'medical_history', 'emergency_contact',
            'status', 'risk_level', 'assigned_doctor'
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This Login ID is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already linked to another patient.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            password=validated_data.pop('password'),
            first_name=validated_data.pop('first_name'),
            last_name=validated_data.pop('last_name', ''),
            email=validated_data.pop('email'),
        )
        return Patient.objects.create(user=user, **validated_data)


class AppointmentSerializer(serializers.ModelSerializer):
    patientName = serializers.ReadOnlyField(source='patient.get_name')
    doctorName = serializers.ReadOnlyField(source='doctor.get_name')

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'patientName', 'doctorName',
            'appointment_date', 'appointment_time', 'description', 'status', 'priority', 'notes',
            'meeting_link', 'created_at', 'updated_at'
        ]


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = '__all__'

    def get_patient_name(self, obj):
        return obj.patient.get_name if obj.patient else None

    def get_doctor_name(self, obj):
        return obj.doctor.get_name if obj.doctor else None


class AIDiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIDiagnosis
        fields = '__all__'


class BillSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = '__all__'

    def get_patient_name(self, obj):
        return obj.patient.get_name if obj.patient else None


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class PharmacyOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyOrder
        fields = '__all__'

class CleaningTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = CleaningTask
        fields = '__all__'



class TelemedSessionSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.get_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.get_name')

    class Meta:
        model = TelemedSession
        fields = '__all__'


class LabTestSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.get_name')

    class Meta:
        model = LabTest
        fields = '__all__'


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.get_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.get_name')

    class Meta:
        model = Prescription
        fields = '__all__'


class PharmacyItemSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()

    class Meta:
        model = PharmacyItem
        fields = ['id', 'name', 'category', 'stock_level', 'unit_price',
                  'supplier', 'description', 'expiry_date', 'last_restocked',
                  'created_at', 'status']


class RegisterSerializer(serializers.Serializer):
    """User registration serializer."""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    role = serializers.ChoiceField(choices=['patient', 'doctor', 'admin'])
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(max_length=200, required=False, allow_blank=True)
    department = serializers.CharField(max_length=60, required=False, allow_blank=True)
    symptoms = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def validate_phone(self, value):
        if not value:
            return value
            
        if Patient.objects.filter(mobile=value).exists() or \
           Doctor.objects.filter(mobile=value).exists():
            raise serializers.ValidationError('This mobile number is already registered to another account.')
        return value


class DashboardStatsSerializer(serializers.Serializer):
    """Aggregated stats for dashboard."""
    total_doctors = serializers.IntegerField()
    total_patients = serializers.IntegerField()
    total_appointments = serializers.IntegerField()
    pending_appointments = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    ai_diagnoses_today = serializers.IntegerField()

from dj_rest_auth.serializers import PasswordResetSerializer  # type: ignore
from django.conf import settings  # type: ignore

class CustomPasswordResetSerializer(PasswordResetSerializer):
    def get_email_options(self):
        return {
            'email_template_name': 'account/email/password_reset_key_message.txt',
            'html_email_template_name': 'account/email/password_reset_key_message.html',
            # This is where your FRONTEND reset password page lives
            'extra_email_context': {
                'password_reset_url': f"{settings.FRONTEND_URL}/reset-password"
            }
        }
