import os
import django
import sys
import random
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalmanagement.settings')
django.setup()

from django.contrib.auth.models import User
from hospital.models import UserProfile, Doctor, Patient, PharmacyItem, MedicalRecord, Bill, LabTest, Prescription, Appointment
from allauth.account.models import EmailAddress

def create_user(username, password, email, first_name, last_name, role, is_staff=False, is_superuser=False):
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        # Update details if needed
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        return user
    
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name,
        last_name=last_name,
        is_staff=is_staff,
        is_superuser=is_superuser
    )
    
    # Create/Update UserProfile
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()
    
    # Create EmailAddress for allauth
    EmailAddress.objects.get_or_create(user=user, email=email, defaults={'primary': True, 'verified': True})
    
    print(f"Created {role}: {username}")
    return user

def seed_data():
    print("Provisioning high-fidelity institutional environment...")
    
    # 1. Core Personas
    admin_user = create_user('admin', 'admin123', 'admin@lifeline.com', 'System', 'Administrator', 'admin', True, True)
    doc_user = create_user('doctor', 'doctor123', 'smith@lifeline.com', 'John', 'Smith', 'doctor', True)
    doctor, _ = Doctor.objects.get_or_create(
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
    
    pat_user = create_user('patient', 'patient123', 'patient@example.com', 'Jane', 'Doe', 'patient')
    patient, _ = Patient.objects.get_or_create(
        user=pat_user,
        defaults={
            'address': '456 Patient St',
            'mobile': '1234567890',
            'blood_group': 'O+',
            'status': True,
            'risk_level': 'low'
        }
    )
    patient.assigned_doctor = doctor
    patient.save()

    # 1.5. Clean Slate for Clinical Records
    print("Surgically cleaning existing clinical dossiers...")
    MedicalRecord.objects.filter(patient=patient).delete()
    Prescription.objects.filter(patient=patient).delete()
    LabTest.objects.filter(patient=patient).delete()
    Bill.objects.filter(patient=patient).delete()
    Appointment.objects.filter(patient=patient).delete()

    # 2. Institutional Linkage (Appointments)
    print("Locking in clinical linkage (Appointments)...")
    Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        appointment_date=datetime.now().date(),
        patientId=patient.id,
        doctorId=doctor.id,
        patientName=patient.get_name,
        doctorName=doctor.get_name,
        appointment_time='10:00:00',
        status='confirmed',
        priority='high',
        description='Standard Institutional Cardiac Review'
    )

    # 3. Pharmacy Inventory (Synchronized)
    medicines = [
        ('Paracetamol 500mg', 'Analgesic', 50, 5.50),
        ('Amoxicillin 250mg', 'Antibiotic', 15, 12.00),
        ('Ibuprofen 400mg', 'Anti-inflammatory', 5, 8.25),
        ('Metformin 500mg', 'Antidiabetic', 100, 15.00),
        ('Amlodipine 5mg', 'Antihypertensive', 40, 9.50),
        ('Omeprazole 20mg', 'Gastrointestinal', 60, 11.00),
        ('Atorvastatin 10mg', 'Statin', 12, 18.50),
        ('Azithromycin 500mg', 'Antibiotic', 0, 45.00),
        ('Vitamin C 1000mg', 'Vitamin/Supplement', 150, 7.50),
    ]

    for name, cat, stock, price in medicines:
        PharmacyItem.objects.update_or_create(
            name=name,
            defaults={'category': cat, 'stock_level': stock, 'unit_price': price, 'supplier': 'Global Pharma Corp'}
        )

    # 4. Clinical History
    records_data = [
        ('Chest Pain', 'Angina Pectoris', 'Adhere to low-sodium diet'),
        ('High Fever', 'Viral Infection', 'Oral rehydration therapy'),
    ]

    for complaint, diagnosis, advice in records_data:
        MedicalRecord.objects.create(
            patient=patient,
            doctor=doctor,
            chief_complaint=complaint,
            diagnosis=diagnosis,
            investigations=advice,
            vitals={'bp': '120/80', 'temp': '98.6f'}
        )
        
        Prescription.objects.create(
            patient=patient,
            doctor=doctor,
            medicines=[{'name': 'Institutional Med', 'dosage': '1-0-1', 'duration': '7 days'}],
            notes=f"Clinical Directive: {advice}"
        )

    # 5. Diagnostic Resultset
    tests = [
        ('CBC (Blood Work)', 'Hematology', '14.5', 'g/dL', '13.5-17.5', False),
        ('Lipid Profile', 'Biochemistry', '210', 'mg/dL', '<200', True),
    ]

    for name, cat, val, unit, ref, abnormal in tests:
        LabTest.objects.create(
            patient=patient,
            test_name=name,
            category=cat,
            result_value=val,
            unit=unit,
            reference_range=ref,
            is_abnormal=abnormal
        )

    # 6. Financial Ledgers
    invoice_nums = ['INV-8821', 'INV-9932']
    for inv in invoice_nums:
        Bill.objects.create(
            invoice_number=inv,
            patient=patient,
            consultation_fee=500.00,
            medicine_cost=250.00,
            status='paid' if inv == 'INV-8821' else 'pending',
            payment_method='UPI'
        )

    print("Institutional data environment perfectly operational.")

if __name__ == "__main__":
    seed_data()
