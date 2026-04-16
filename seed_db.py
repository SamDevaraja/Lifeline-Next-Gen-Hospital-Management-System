import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalmanagement.settings')
django.setup()

from django.contrib.auth.models import User
from hospital.models import UserProfile, Doctor, Patient
from allauth.account.models import EmailAddress

def create_user(username, password, email, first_name, last_name, role, is_staff=False, is_superuser=False):
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists. Skipping.")
        return User.objects.get(username=username)
    
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name,
        last_name=last_name,
        is_staff=is_staff,
        is_superuser=is_superuser
    )
    
    # Create UserProfile
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()
    
    # Create EmailAddress for allauth
    EmailAddress.objects.get_or_create(user=user, email=email, defaults={'primary': True, 'verified': True})
    
    print(f"Created {role}: {username}")
    return user

def seed_data():
    print("Seeding database...")
    
    # 1. Admin
    admin_user = create_user('admin', 'admin123', 'admin@lifeline.com', 'System', 'Administrator', 'admin', True, True)
    
    # 2. Doctor
    doc_user = create_user('doctor', 'doctor123', 'smith@lifeline.com', 'John', 'Smith', 'doctor', True)
    Doctor.objects.get_or_create(
        user=doc_user,
        defaults={
            'address': '123 Medical Lane',
            'mobile': '9876543210',
            'department': 'Cardiologist',
            'qualification': 'MD, Cardiology',
            'experience_years': 10,
            'status': True
        }
    )
    
    # 3. Patient
    pat_user = create_user('patient', 'patient123', 'patient@example.com', 'Jane', 'Doe', 'patient')
    Patient.objects.get_or_create(
        user=pat_user,
        defaults={
            'address': '456 Patient St',
            'mobile': '1234567890',
            'blood_group': 'O+',
            'status': True,
            'risk_level': 'low'
        }
    )
    
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_data()
