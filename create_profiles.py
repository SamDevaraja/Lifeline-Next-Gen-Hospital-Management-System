import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hospitalmanagement.settings")
django.setup()

from django.contrib.auth.models import User
from hospital.models import UserProfile, Doctor, Patient

users = User.objects.all()
for user in users:
    if not hasattr(user, 'profile'):
        role = 'patient'
        if user.is_superuser:
            role = 'admin'
        elif Doctor.objects.filter(user=user).exists():
            role = 'doctor'
        elif Patient.objects.filter(user=user).exists():
            role = 'patient'
        
        UserProfile.objects.create(user=user, role=role)
        print(f"Created profile for {user.username} with role {role}")

print("Done")
