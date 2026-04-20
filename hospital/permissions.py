from rest_framework import permissions

class RBACPermission(permissions.BasePermission):
    """
    Universal Role-Based Access Control logic for the application.
    """
    
    def get_user_role(self, user):
        if user.is_superuser:
            return 'admin'
        if hasattr(user, 'profile'):
            return user.profile.role
        return 'patient' # Fallback

    def has_permission(self, request, view):
        # Must be authenticated first
        if not (request.user and request.user.is_authenticated):
            return False

        role = self.get_user_role(request.user)
        
        # Admin has full access
        if role == 'admin':
            return True

        # Fast-track route checking using URL name for function-based views
        url_name = getattr(request.resolver_match, 'url_name', '')
        if url_name in ['me', 'dashboard_stats', 'public_stats']:
            return True

        view_name = view.__class__.__name__

        # Let notifications through always for authenticated
        if view_name in ['NotificationViewSet']:
            return True

        if role == 'doctor':
            allowed_views = ['PatientViewSet', 'PrescriptionViewSet', 'AppointmentViewSet', 'MedicalRecordViewSet', 'TeleConsultationViewSet', 'LabTestViewSet', 'DoctorViewSet']
            return view_name in allowed_views

        if role == 'patient':
            allowed_views = ['AppointmentViewSet', 'PrescriptionViewSet', 'MedicalRecordViewSet', 'BillViewSet', 'NotificationViewSet', 'PatientViewSet', 'DoctorViewSet', 'TeleConsultationViewSet', 'LabTestViewSet']
            return view_name in allowed_views
            
        if role == 'receptionist':
            allowed_views = ['PatientViewSet', 'AppointmentViewSet', 'BillViewSet', 'DoctorViewSet']
            return view_name in allowed_views
            

            
        # Default block if not mapped
        return False

    def has_object_permission(self, request, view, obj):
        role = self.get_user_role(request.user)
        
        if role == 'admin':
            return True
            
        if role == 'patient':
            # Strict boundary: Patients can ONLY access their own records
            if hasattr(obj, 'user'):
                return obj.user == request.user
            if hasattr(obj, 'patient'):
                # Handle relations pointing to Patient model
                return getattr(obj.patient, 'user', None) == request.user
            if hasattr(obj, 'patientId') and hasattr(request.user, 'patient'):
                return obj.patientId == request.user.patient.id
            return False
            
        view_name = view.__class__.__name__

        if role == 'doctor':
            # Doctors can only access patients assigned to them or clinical records they created
            doctor_profile = getattr(request.user, 'doctor', None)
            if not doctor_profile:
                return False
                
            if view_name == 'PatientViewSet':
                return obj.assigned_doctor == doctor_profile
                
            if hasattr(obj, 'doctor'):
                return obj.doctor == doctor_profile
                
            if hasattr(obj, 'patient'):
                # Allow access if the patient in the record is assigned to this doctor
                return obj.patient.assigned_doctor == doctor_profile
                
            return True

        return True
