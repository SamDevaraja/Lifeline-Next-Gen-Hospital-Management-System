import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalmanagement.settings')
django.setup()

from hospital.models import PharmacyItem, Prescription, Doctor, Patient, User

def seed_pharmacy():
    print("Seeding Pharmacy inventory...")
    
    items = [
        ('Paracetamol', 'Analgesic', 250, 15.00),
        ('Amoxicillin', 'Antibiotic', 120, 45.50),
        ('Ibuprofen', 'Anti-inflammatory', 80, 22.00),
        ('Metformin', 'Antidiabetic', 200, 12.00),
        ('Amlodipine', 'Antihypertensive', 150, 8.50),
        ('Atorvastatin', 'Statin', 90, 35.00),
        ('Omeprazole', 'Gastrointestinal', 110, 28.00),
        ('Azithromycin', 'Antibiotic', 15, 120.00),
        ('Vitamin C', 'Vitamin/Supplement', 400, 5.00),
        ('Surgical Gloves', 'Surgical Supply', 1000, 25.00),
        ('Saline IV 500ml', 'IV Fluid', 60, 150.00),
        ('Dolo 650', 'Analgesic', 5, 20.00),
        ('Insulin Glargine', 'Antidiabetic', 12, 1200.00),
    ]
    
    for name, cat, stock, price in items:
        item, created = PharmacyItem.objects.get_or_create(
            name=name,
            defaults={
                'category': cat,
                'stock_level': stock,
                'unit_price': price,
                'supplier': 'Global Med Supply',
                'description': f'Standard pharmaceutical grade {name}.',
                'expiry_date': datetime.now().date() + timedelta(days=random.randint(200, 700))
            }
        )
        if not created:
            item.stock_level = stock
            item.unit_price = price
            item.save()
            print(f"Updated {name}")
        else:
            print(f"Created {name}")

    # Create some "Today" prescriptions if possible
    doctors = Doctor.objects.all()
    patients = Patient.objects.all()
    
    if doctors.exists() and patients.exists():
        print("Creating mock prescriptions for today...")
        for i in range(5):
            Prescription.objects.create(
                doctor=doctors[0],
                patient=random.choice(patients),
                medicines=[
                    {'name': 'Paracetamol', 'dosage': '1-0-1', 'duration': '3 days', 'quantity': 6},
                    {'name': 'Amoxicillin', 'dosage': '1-1-1', 'duration': '5 days', 'quantity': 15}
                ],
                notes="Standard symptomatic treatment."
            )
        print("Created 5 prescriptions.")

if __name__ == "__main__":
    seed_pharmacy()
