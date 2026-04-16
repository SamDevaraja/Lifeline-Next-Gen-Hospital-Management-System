import random
from django.contrib.auth.models import User
from hospital.models import Doctor, Patient, Appointment
from django.utils import timezone
from datetime import timedelta

from hospital.models import Doctor, Patient, Appointment, MedicalRecord, Prescription

def create_sample_data():
    doctors = Doctor.objects.all()
    if not doctors.exists():
        user = User.objects.create_user(username='dr_sample', password='password123', first_name='Sample', last_name='Doctor', email='sample@hospital.com')
        dr = Doctor.objects.create(user=user, mobile='1234567890', department='General Medicine', status=True)
        doctors = [dr]
    
    patient_names = [
        ('Aarav', 'Sharma'), ('Ananya', 'Iyer'), ('Vihaan', 'Gupta'),
        ('Zoya', 'Khan'), ('Arjun', 'Verma'), ('Diya', 'Reddy'),
        ('Aditya', 'Patel'), ('Ishani', 'Bose'), ('Siddharth', 'Malhotra'),
        ('Meera', 'Kulkarni')
    ]
    
    risk_levels = ['low', 'moderate', 'high', 'critical']
    symptoms_list = [
        'Persistent cough and mild fever', 'Acute abdominal pain',
        'Severe migraine and nausea', 'Chest congestion and shortness of breath',
        'Lower back pain and stiffness', 'Joint pain and inflammation',
        'High blood pressure and fatigue', 'Skin rash and itching',
        'Indigestion and acid reflux', 'Seasonal allergies'
    ]

    diagnoses = [
        'Acute Respiratory Infection', 'Non-specific Abdominal Pain',
        'Classic Migraine', 'Mild Bronchitis', 'Lumbar Strain',
        'Early Osteoarthritis', 'Hypertension Stage 1', 'Allergic Dermatitis',
        'Gastroesophageal Reflux', 'Seasonal Rhinoconjunctivitis'
    ]

    medications = [
        [{"name": "Paracetamol", "dosage": "500mg", "frequency": "TID"}, {"name": "Amoxicillin", "dosage": "250mg", "frequency": "BID"}],
        [{"name": "Omeprazole", "dosage": "20mg", "frequency": "OD"}, {"name": "Dicyclomine", "dosage": "10mg", "frequency": "PRN"}],
        [{"name": "Sumatriptan", "dosage": "50mg", "frequency": "SOS"}, {"name": "Naproxen", "dosage": "250mg", "frequency": "BID"}],
    ]
    
    for i, (fname, lname) in enumerate(patient_names):
        username = f"patient_{fname.lower()}_{i}"
        user_exists = User.objects.filter(username=username).first()
        if not user_exists:
            user = User.objects.create_user(username=username, password='password123', first_name=fname, last_name=lname, email=f"{fname.lower()}.{lname.lower()}@example.com")
            patient = Patient.objects.create(user=user, mobile=f"98765{i}0432", address=f"Street {i}, Block {random.randint(1,10)}", risk_level=random.choice(risk_levels), symptoms=random.choice(symptoms_list), status=True)
        else:
            user = user_exists
            patient = getattr(user, 'patient', None)
            if not patient:
                patient = Patient.objects.create(user=user, mobile=f"98765{i}0444", address="Recovered Institutional Address", risk_level='low', status=True)

        # Clinical Context
        assigned_dr = random.choice(doctors)
        
        # Create Appointment
        appt_date = timezone.now().date() + timedelta(days=random.randint(0, 5))
        appt_time = f"{random.randint(9, 17)}:00"
        Appointment.objects.create(patient=patient, doctor=assigned_dr, patientName=patient.get_name, doctorName=assigned_dr.get_name, appointment_date=appt_date, appointment_time=appt_time, description=patient.symptoms, status=random.choice(['pending', 'confirmed', 'arrived']), priority=patient.risk_level)

        # Create Medical Record
        MedicalRecord.objects.create(
            patient=patient,
            doctor=assigned_dr,
            chief_complaint=patient.symptoms,
            diagnosis=random.choice(diagnoses),
            prescription="Standard care protocol followed.",
            vitals={"bp": "120/80", "pulse": 72, "temp": "98.6"}
        )

        # Create Prescription
        Prescription.objects.create(
            patient=patient,
            doctor=assigned_dr,
            medicines=random.choice(medications),
            notes="Follow instruction precisely."
        )

def cross_assign():
    doctors = list(Doctor.objects.all())
    patients = Patient.objects.all()
    if not doctors: return
    for patient in patients:
        patient.assigned_doctor = random.choice(doctors)
        patient.save()
    print(f"Successfully cross-assigned {patients.count()} patients across {len(doctors)} doctors.")

create_sample_data()
cross_assign()
