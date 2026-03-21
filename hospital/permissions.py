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
        if url_name in ['me', 'dashboard_stats', 'ai_chat', 'public_stats']:
            return True

        view_name = view.__class__.__name__

        # Let notifications through always for authenticated
        if view_name in ['NotificationViewSet']:
            return True

        if role == 'doctor':
            allowed_views = ['PatientViewSet', 'PrescriptionViewSet', 'AppointmentViewSet', 'MedicalRecordViewSet', 'TelemedSessionViewSet', 'LabTestViewSet', 'DoctorViewSet']
            return view_name in allowed_views

        if role == 'patient':
            allowed_views = ['AppointmentViewSet', 'PrescriptionViewSet', 'MedicalRecordViewSet', 'BillViewSet', 'NotificationViewSet', 'PatientViewSet', 'DoctorViewSet']
            return view_name in allowed_views
            
        if role == 'receptionist':
            allowed_views = ['PatientViewSet', 'AppointmentViewSet', 'BillViewSet', 'DoctorViewSet']
            return view_name in allowed_views
            
        if role == 'pharmacist':
            allowed_views = ['PrescriptionViewSet', 'PharmacyItemViewSet', 'PharmacyOrderViewSet']
            return view_name in allowed_views
            
        if role == 'nurse':
            allowed_views = ['PatientViewSet', 'MedicalRecordViewSet', 'LabTestViewSet', 'DoctorViewSet']
            return view_name in allowed_views
            
        if role == 'supervisor':
            allowed_views = ['CleaningTaskViewSet']
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
            
        if role == 'doctor':
             # Optionally strict boundary for Doctors accessing only their assigned patients?
             # For now, let doctors see patients globally, but they might only edit their own.
             pass

        return True
