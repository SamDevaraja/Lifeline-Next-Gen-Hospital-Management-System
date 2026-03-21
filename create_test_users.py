import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalmanagement.settings')
django.setup()

from django.contrib.auth.models import User
from hospital.models import UserProfile, Doctor, Patient

roles = ['admin', 'doctor', 'patient', 'receptionist', 'pharmacist', 'nurse', 'supervisor']
password = 'TestHospital123!'

print("--- TEST CREDENTIALS ---")

for role in roles:
    username = f'test_{role}'
    email = f'{role}@hospital.local'
    
    # Create or update user
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    user.set_password(password)
    
    if role == 'admin':
        user.is_superuser = True
        user.is_staff = True
    else:
        user.is_superuser = False
        user.is_staff = False
        
    user.save()
    
    # Create or update profile
    # The post_save signal might have created the profile automatically
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()
    
    # For doctor and patient, we should also ensure their specific tables have an entry
    if role == 'doctor':
        Doctor.objects.get_or_create(user=user, defaults={'department': 'General Medicine', 'status': True})
    elif role == 'patient':
        Patient.objects.get_or_create(user=user, defaults={'status': True, 'risk_level': 'low'})

    print(f"Role: {role.capitalize().ljust(15)} | Username: {username.ljust(15)} | Password: {password}")

print("------------------------")
print("All users updated successfully!")
