import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalmanagement.settings')
django.setup()

from django.contrib.auth.models import User
from hospital.models import UserProfile, Patient, Doctor, PharmacyItem, Appointment, Bill, LabTest, Prescription, TelemedSession, Notification

def run_tests():
    print("\n[⚡] Starting Comprehensive Signal Engine Diagnostics...")
    
    # 1. Ensure testing actors exist
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser('test_admin_alert', 'admin@alert.com', 'pass123')
    
    doc_profile = Doctor.objects.filter(user__is_active=True).first()
    if not doc_profile:
        u = User.objects.create_user('test_doc_alert', 'doc@alert.com', 'pass123')
        UserProfile.objects.create(user=u, role='doctor')
        doc_profile = Doctor.objects.create(user=u, department='Cardiology')
    
    pat_profile = Patient.objects.filter(user__is_active=True).first()
    if not pat_profile:
        u = User.objects.create_user('test_pat_alert', 'pat@alert.com', 'pass123')
        pat_profile = Patient.objects.create(user=u, blood_group='O+', assigned_doctor=doc_profile)

    doc_user = doc_profile.user if doc_profile else None
    pat_user = pat_profile.user if pat_profile else None

    # Track pre-existing counts
    prev_count = Notification.objects.count()

    def get_latest_notifs():
        return Notification.objects.order_by('-id')

    import json
    results = []
    def log(msg):
        results.append(msg)

    try:
        # TEST A: Pharmacy Stock Drop (Target: Admin)
        log("[A] Testing Pharmacy Stock Drop...")
        item = PharmacyItem.objects.create(name="Signal Test Med", category="Medicine", stock_level=50, unit_price=10)
        item.stock_level = 15 # Trigger threshold <= 20
        item.save()
        notif = get_latest_notifs().filter(user=admin_user, title__contains='Critical Inventory Alert').first()
        if notif: log(f"✅ PASS: Admin Received - {notif.title}")
        else: log(f"❌ FAIL: Pharmacy Alert not fired for Admin.")

        # TEST B: New Patient Registration (Target: Admin)
        log("[B] Testing New Patient Registration...")
        u_new = User.objects.create_user('new_pat_trigger', 'new@trig.com', 'pass')
        pat_new = Patient.objects.create(user=u_new)
        notif = get_latest_notifs().filter(user=admin_user, title__contains='New Patient Admittance').first()
        if notif: log(f"✅ PASS: Admin Received - {notif.title}")
        else: log(f"❌ FAIL: Registration Alert not fired for Admin.")
        
        # TEST C: Clinical Risk Escalation (Target: Assigned Doctor)
        log("[C] Testing Clinical Risk Escalation...")
        pat_new.assigned_doctor = doc_profile
        pat_new.risk_level = 'critical'
        pat_new.save()
        notif = get_latest_notifs().filter(user=doc_user, title__contains='Clinical Risk Escalation').first()
        if notif: log(f"✅ PASS: Doctor Received - {notif.title}")
        else: log(f"❌ FAIL: Escalation Alert not fired for Doctor.")

        # TEST D: Appointment Creation (Target: Doctor & Patient)
        log("[D] Testing Appointment Bookings...")
        appt = Appointment.objects.create(
            patient=pat_profile, doctor=doc_profile, 
            patientName=pat_user.first_name, doctorName=doc_user.first_name,
            appointment_date=timezone.now().date(), appointment_time=timezone.now().time()
        )
        notif_d = get_latest_notifs().filter(user=doc_user, title__contains='New Clinical Appointment').first()
        notif_p = get_latest_notifs().filter(user=pat_user, title__contains='Appointment Request Confirmed').first()
        if notif_d and notif_p: log("✅ PASS: Both Doctor and Patient received Appointment Notifications.")
        else: log("❌ FAIL: Appointment notifications missed.")

        # TEST E: Digital Prescription (Target: Patient)
        log("[E] Testing Digital Prescriptions...")
        meds = [{"name": "Aspirin", "dosage": "500mg"}]
        Prescription.objects.create(patient=pat_profile, doctor=doc_profile, medicines=meds)
        notif = get_latest_notifs().filter(user=pat_user, title__contains='New Clinical Prescription').first()
        if notif: log(f"✅ PASS: Patient Received - {notif.title}")
        else: log(f"❌ FAIL: Prescription alert missed.")

        # TEST F: Telemedicine Broadcast (Target: Doctor & Patient)
        log("[F] Testing Telemedicine Connectivity...")
        TelemedSession.objects.create(
            patient=pat_profile, doctor=doc_profile, 
            scheduled_at=timezone.now() + timedelta(days=1),
            meeting_link="https://meet.dummy"
        )
        notif_d = get_latest_notifs().filter(user=doc_user, title__contains='Telemedicine').first()
        notif_p = get_latest_notifs().filter(user=pat_user, title__contains='Telemedicine').first()
        if notif_d and notif_p: log("✅ PASS: Both targets received Telemedicine Broadcast Alerts.")
        else: log("❌ FAIL: Telemedicine alerts missed.")

        # TEST G: Critical Lab Test AI (Target: Doctor & Patient)
        log("[G] Testing Abnormal Lab Uploads (AI Alert)...")
        LabTest.objects.create(
            patient=pat_profile, test_name="CBC Test",
            is_abnormal=True, ai_flag_reason="Spiked Platelets"
        )
        notif_d = get_latest_notifs().filter(user=doc_user, notification_type='ai_alert').first()
        notif_p = get_latest_notifs().filter(user=pat_user, title__contains='Diagnostic Results Ready').first()
        if notif_d and notif_p: log("✅ PASS: Doctor received AI Alert and Patient received Follow-up Advisory.")
        else: log("❌ FAIL: Lab telemetry missed targets.")

        # TEST H: Billing Core (Target: Patient)
        log("[H] Testing Billing Invoices...")
        bill = Bill.objects.create(
            patient=pat_profile, invoice_number="TEST-BILL-999",
            status='pending', consultation_fee=100
        )
        notif = get_latest_notifs().filter(user=pat_user, notification_type='payment', title__contains='Invoice Generated').first()
        if notif: log("✅ PASS: Patient received Invoice Advisory.")
        else: log("❌ FAIL: Invoice omitted.")

        log("[I] Testing Billing Settlements...")
        bill.status = 'paid'
        bill.save()
        notif2 = get_latest_notifs().filter(user=pat_user, notification_type='payment', title__contains='Payment Received').first()
        if notif2: log(f"✅ PASS: Patient received Settlement receipt.")
        else: log("❌ FAIL: Settlement advisory omitted.")

        log(f"SUCCESS! Built {Notification.objects.count() - prev_count} total dynamic alerts during cascade flow.")
        
        with open('test_report.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=4)

    finally:
        print("\n[🧹] Cleaning up telemetry data to prevent database pollution...")
        item.delete()
        if u_new.username == 'new_pat_trigger': u_new.delete()
        appt.delete()
        # Telemed, Prescriptions, LabTests cascade or can be deleted
        LabTest.objects.filter(test_name="CBC Test").delete()
        Prescription.objects.filter(medicines__contains=[{'name': 'Aspirin', 'dosage': '500mg'}]).delete()
        TelemedSession.objects.filter(meeting_link="https://meet.dummy").delete()
        bill.delete()
        
        # Optionally, delete notifications generated in the last N seconds
        Notification.objects.filter(id__gt=prev_count).delete()

if __name__ == '__main__':
    run_tests()
