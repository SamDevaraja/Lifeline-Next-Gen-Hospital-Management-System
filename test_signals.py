import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hospitalmanagement.settings")
django.setup()

from hospital.models import Appointment, Patient, Doctor, Notification, Bill, LabTest

print("1. Counting Notifications Before:", Notification.objects.count())

pat = Patient.objects.last()
doc = Doctor.objects.last()
if not pat or not doc:
    print("Cannot test, no patients/doctors.")
    exit()

print("Testing Appointment Signal...")
appt = Appointment.objects.create(patient=pat, doctor=doc, patientName=pat.user.first_name, doctorName=doc.user.first_name, appointment_date='2024-01-01', status='pending')
print("Count after appointment:", Notification.objects.count())

print("Testing Bill Signal...")
bill = Bill.objects.create(patient=pat, appointment=appt, invoice_number="TEST1234", consultation_fee=500, status='pending')
print("Count after bill:", Notification.objects.count())

print("Testing LabTest Signal...")
lab = LabTest.objects.create(patient=pat, test_name="CBC", category="Blood", result_value="WBC 20,000", unit="cells/mcL", reference_range="4,500-11,000", is_abnormal=True, ai_flag_reason="High WBC")
print("Count after lab test:", Notification.objects.count())

print("2. Deleting test records...")
appt.delete()
bill.delete()
lab.delete()
