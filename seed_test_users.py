import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalmanagement.settings')
django.setup()

from django.contrib.auth.models import User
from hospital.models import UserProfile, Doctor, Patient
from allauth.account.models import EmailAddress

def create_test_user(username, password, email, first_name, last_name, role, is_staff=False, is_superuser=False):
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists. Resetting password.")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.save()
    else:
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=is_staff,
            is_superuser=is_superuser
        )
        print(f"Created user: {username}")
    
    # Create/Update UserProfile
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()
    
    # Create EmailAddress for allauth
    EmailAddress.objects.get_or_create(user=user, email=email, defaults={'primary': True, 'verified': True})
    
    # If role is doctor, create Doctor profile
    if role == 'doctor':
        Doctor.objects.get_or_create(
            user=user,
            defaults={
                'address': 'Institutional Registry',
                'mobile': '0000000000',
                'department': 'Internal Medicine',
                'status': True
            }
        )
    
    # If role is patient, create Patient profile
    if role == 'patient':
        Patient.objects.get_or_create(
            user=user,
            defaults={
                'address': 'Institutional Registry',
                'mobile': '0000000000',
                'status': True,
                'risk_level': 'low'
            }
        )
    
    return user

def seed_test_users():
    print("Provisioning testing personas as per README.md documentation...")
    
    # 1. Admin
    create_test_user('test_admin', 'admin123', 'admin@test.com', 'Test', 'Admin', 'admin', True, True)
    
    # 2. Doctor
    create_test_user('test_doctor', 'doctor123', 'doctor@test.com', 'Test', 'Doctor', 'doctor', True)
    
    # 3. Pharmacist
    create_test_user('test_pharmacist', 'pharmacist123', 'pharmacist@test.com', 'Test', 'Pharmacist', 'pharmacist', True)
    
    # 4. Receptionist
    create_test_user('test_receptionist', 'receptionist123', 'receptionist@test.com', 'Test', 'Receptionist', 'receptionist', True)
    
    # 5. Patient
    create_test_user('test_patient', 'patient123', 'patient@test.com', 'Test', 'Patient', 'patient')
    
    print("Institutional persona synchronization complete.")

if __name__ == "__main__":
    seed_test_users()
