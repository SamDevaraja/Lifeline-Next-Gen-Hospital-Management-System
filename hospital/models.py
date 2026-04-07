from django.db import models  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from django.utils import timezone  # type: ignore
import uuid

# --- CORE SYSTEM PROVISIONING ---

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'), ('doctor', 'Doctor'), ('patient', 'Patient'),
        ('receptionist', 'Receptionist'), ('pharmacist', 'Pharmacist'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=20, blank=True, null=True)
    provider = models.CharField(max_length=50, default='local')
    provider_id = models.CharField(max_length=255, null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self): return f"{self.user.username} ({self.role})"

class Doctor(models.Model):
    DEPARTMENT_CHOICES = [
        ('Cardiologist', 'Cardiologist'), ('Dermatologist', 'Dermatologist'),
        ('Emergency Medicine', 'Emergency Medicine'), ('Allergist/Immunologist', 'Allergist/Immunologist'),
        ('Anesthesiologist', 'Anesthesiologist'), ('Neurologist', 'Neurologist'),
        ('Pediatrician', 'Pediatrician'), ('Orthopedic Surgeon', 'Orthopedic Surgeon'),
        ('Pulmonologist', 'Pulmonologist'), ('Endocrinologist', 'Endocrinologist'),
        ('Gastroenterologist', 'Gastroenterologist'), ('Oncologist', 'Oncologist'),
        ('General Surgery', 'General Surgery'), ('Internal Medicine', 'Internal Medicine'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor')
    profile_pic = models.ImageField(upload_to='profile_pic/DoctorProfilePic/', null=True, blank=True)
    address = models.CharField(max_length=200)
    mobile = models.CharField(max_length=20)
    department = models.CharField(max_length=60, choices=DEPARTMENT_CHOICES, default='Cardiologist')
    qualification = models.CharField(max_length=100, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=500)
    status = models.BooleanField(default=False)
    available_days = models.JSONField(default=list, blank=True)
    bio = models.TextField(blank=True)
    permanent_meet_link = models.URLField(max_length=500, blank=True, null=True, help_text="Institutional permanent consultation bridge (e.g. Google Meet)")
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=['department']), models.Index(fields=['status'])]

    def __str__(self): return self.user.first_name if self.user.first_name else self.user.username
    @property
    def get_name(self): return f"{self.user.first_name or ''} {self.user.last_name or ''}".strip() or self.user.username
    @property
    def get_id(self): return self.user.id

class Patient(models.Model):
    RISK_CHOICES = [('low', 'Low'), ('moderate', 'Moderate'), ('high', 'High'), ('critical', 'Critical')]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient')
    profile_pic = models.ImageField(upload_to='profile_pic/PatientProfilePic/', null=True, blank=True)
    address = models.CharField(max_length=200)
    mobile = models.CharField(max_length=20)
    date_of_birth = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    symptoms = models.CharField(max_length=500, blank=True)
    allergies = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    admit_date = models.DateField(auto_now_add=True)
    status = models.BooleanField(default=False)
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, default='low')
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients')
    is_deleted = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=['status']), models.Index(fields=['risk_level'])]

    def __str__(self): return self.user.first_name if self.user.first_name else self.user.username
    @property
    def get_name(self): return f"{self.user.first_name or ''} {self.user.last_name or ''}".strip() or self.user.username
    @property
    def age(self):
        if not self.date_of_birth: return 0
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
    @property
    def get_id(self): return self.user.id

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('confirmed', 'Confirmed'), ('completed', 'Completed'),
        ('cancelled', 'Cancelled'), ('rescheduled', 'Rescheduled'),
        ('arrived', 'Arrived'), ('in-consultation', 'In-Consultation')
    ]
    PRIORITY_CHOICES = [('low', 'Low'), ('moderate', 'Moderate'), ('high', 'High'), ('critical', 'Critical')]

    patientId = models.PositiveIntegerField(null=True, blank=True)
    doctorId = models.PositiveIntegerField(null=True, blank=True)
    patientName = models.CharField(max_length=100, blank=True)
    doctorName = models.CharField(max_length=100, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, null=True, related_name='appointments')
    appointment_date = models.DateField(null=True, blank=True)
    appointment_time = models.TimeField(null=True, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    notes = models.TextField(blank=True)
    meeting_link = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['appointment_date', 'appointment_time']
        indexes = [models.Index(fields=['appointment_date']), models.Index(fields=['status']), models.Index(fields=['priority'])]

    def __str__(self): return f"{self.patientName} with {self.doctorName} on {self.appointment_date}"

# --- SECURE TELE-CONSULTATION FRAMEWORK ---

# --- SECURE TELE-CONSULTATION FRAMEWORK ---

class TeleConsultationSession(models.Model):
    STATUS_CHOICES = [('live', 'Live'), ('completed', 'Completed'), ('cancelled', 'Cancelled')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='tele_session')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='tele_sessions')
    created_by = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='created_sessions')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    meeting_link = models.URLField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='live')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tele_consultation_sessions'
        ordering = ['-created_at']

    def __str__(self): return f"Consult {self.token.hex[:8]} — {self.created_by} + {self.patient}"

class MeetingParticipant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ROLE_CHOICES = [('doctor', 'Doctor'), ('patient', 'Patient')]
    
    session = models.ForeignKey(TeleConsultationSession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meeting_participations')
    role = models.CharField(max_length=15, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tele_meeting_participants'
        unique_together = ('session', 'user')

    def __str__(self): return f"{self.user.username} ({self.role}) in {self.session.id}"

# --- CLINICAL RECORD MANAGEMENT ---

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='medical_records')
    visit_date = models.DateField(auto_now_add=True)
    chief_complaint = models.TextField()
    diagnosis = models.TextField()
    prescription = models.TextField(blank=True)
    investigations = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    is_confidential = models.BooleanField(default=False)
    vitals = models.JSONField(default=dict, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_records')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'medical_records'
        ordering = ['-visit_date']
        indexes = [models.Index(fields=['visit_date'])]

    def __str__(self): return f"Record for {self.patient} on {self.visit_date}"

class Bill(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('paid', 'Paid'), ('overdue', 'Overdue'), ('cancelled', 'Cancelled')]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills', null=True, blank=True)
    guest_name = models.CharField(max_length=150, blank=True, null=True)
    guest_mobile = models.CharField(max_length=20, blank=True, null=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    invoice_number = models.CharField(max_length=30, unique=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    medicine_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    test_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    room_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=4, decimal_places=2, default=18)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=30, blank=True)
    bill_date = models.DateField(auto_now_add=True)
    paid_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'bills'
        indexes = [models.Index(fields=['status']), models.Index(fields=['bill_date'])]

    def save(self, *args, **kwargs):
        from decimal import Decimal
        f = lambda v: Decimal(str(v or 0))
        subtotal = (f(self.consultation_fee) + f(self.medicine_cost) + f(self.test_cost) + f(self.room_charge) + f(self.other_charges))
        discount_val, tax_val = f(self.discount), f(self.tax_rate)
        discounted = subtotal * (Decimal('1') - discount_val / Decimal('100'))
        self.total_amount = discounted * (Decimal('1') + tax_val / Decimal('100'))
        super().save(*args, **kwargs)

    def __str__(self): return f"{self.invoice_number} — {self.patient}"

class Notification(models.Model):
    TYPE_CHOICES = [('appointment', 'Appointment'), ('payment', 'Payment'), ('system', 'System'), ('message', 'Message')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self): return f"{self.title} → {self.user.username}"

# --- PHARMACY & LABORATORY ---

class PharmacyItem(models.Model):
    CATEGORY_CHOICES = [
        ('Analgesic', 'Analgesic'), ('Antibiotic', 'Antibiotic'), ('Anti-inflammatory', 'Anti-inflammatory'),
        ('Antiviral', 'Antiviral'), ('Antifungal', 'Antifungal'), ('Antidiabetic', 'Antidiabetic'),
        ('Antihypertensive', 'Antihypertensive'), ('Cardiovascular', 'Cardiovascular'),
        ('Gastrointestinal', 'Gastrointestinal'), ('Neurological', 'Neurological'),
        ('Antiseptic', 'Antiseptic'), ('Statin', 'Statin'), ('Vitamin/Supplement', 'Vitamin/Supplement'),
        ('Vaccine', 'Vaccine'), ('IV Fluid', 'IV Fluid'), ('Surgical Supply', 'Surgical Supply'), ('Other', 'Other'),
    ]
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Other')
    stock_level = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    supplier = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField(blank=True, default='')
    expiry_date = models.DateField(null=True, blank=True)
    last_restocked = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pharmacy_items'
        ordering = ['name']
        indexes = [models.Index(fields=['category']), models.Index(fields=['stock_level'])]

    def __str__(self): return f"{self.name} ({self.stock_level})"

    @property
    def status(self):
        if self.stock_level == 0: return 'Critical'
        if self.stock_level <= 20: return 'Low Stock'
        return 'Optimal'

class LabTest(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_tests')
    test_name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    result_value = models.CharField(max_length=100)
    unit = models.CharField(max_length=20)
    reference_range = models.CharField(max_length=100)
    test_date = models.DateTimeField(auto_now_add=True)
    report_file = models.FileField(upload_to='lab_reports/', null=True, blank=True)
    image_data = models.TextField(blank=True, null=True, help_text="Base64 encoded image data stored directly in DB")
    is_abnormal = models.BooleanField(default=False)

    class Meta:
        db_table = 'lab_tests'
        ordering = ['-test_date']

    def __str__(self): return f"{self.test_name} for {self.patient}"

class Prescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    appointment = models.OneToOneField(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    medicines = models.JSONField(default=list)
    qr_code_id = models.CharField(max_length=100, unique=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prescriptions'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.qr_code_id: self.qr_code_id = uuid.uuid4().hex[:12].upper()
        super().save(*args, **kwargs)

    def __str__(self): return f"Prescription for {self.patient} by {self.doctor}"

class PharmacyOrder(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='pharmacy_orders')
    pharmacist = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='dispensed_orders')
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pharmacy_orders'

    def __str__(self): return f"Order {self.id} for Prescription {self.prescription.id}"


# --- SYSTEM SIGNALS (NOTIFICATIONS) ---

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Appointment)
def notify_appointment(sender, instance, created, **kwargs):
    if created:
        if instance.doctor and getattr(instance.doctor, 'user', None):
            Notification.objects.create(user=instance.doctor.user, title="New Clinical Appointment", message=f"Patient {instance.patientName} scheduled a consultation on {instance.appointment_date}.", notification_type="appointment")
        if instance.patient and getattr(instance.patient, 'user', None):
            Notification.objects.create(user=instance.patient.user, title="Appointment Request Confirmed", message=f"Your appointment with Dr. {instance.doctor.get_name} is locked in for {instance.appointment_date}.", notification_type="appointment")

@receiver(post_save, sender=TeleConsultationSession)
def notify_tele_session(sender, instance, created, **kwargs):
    if created:
        MeetingParticipant.objects.get_or_create(session=instance, user=instance.created_by.user, defaults={'role': 'doctor'})
        MeetingParticipant.objects.get_or_create(session=instance, user=instance.patient.user, defaults={'role': 'patient'})
        Notification.objects.create(user=instance.patient.user, title="Secure Tele-Consultation Live", message=f"Physician has initiated the secure bridge. You can now join the virtual terminal.", notification_type="appointment")

@receiver(post_save, sender=Bill)
def notify_billing(sender, instance, created, **kwargs):
    if instance.patient and getattr(instance.patient, 'user', None):
        if created and instance.status == 'pending':
            Notification.objects.create(user=instance.patient.user, title="Invoice Generated", message=f"A new invoice ({instance.invoice_number}) for ₹{instance.total_amount} is pending payment.", notification_type="payment")
        elif instance.status == 'paid':
            Notification.objects.create(user=instance.patient.user, title="Payment Received", message=f"Thank you. Invoice {instance.invoice_number} has been settled.", notification_type="payment")

@receiver(post_save, sender=LabTest)
def notify_lab_ready(sender, instance, created, **kwargs):
    if created:
        if instance.patient and getattr(instance.patient, 'user', None):
            Notification.objects.create(
                user=instance.patient.user, 
                title="Diagnostic Results Ready", 
                message=f"Your {instance.test_name} results are indexed and require physician review.", 
                notification_type="system"
            )

@receiver(post_save, sender=PharmacyItem)
def notify_pharmacy_stock(sender, instance, created, **kwargs):
    if instance.stock_level <= 20:
        for admin in User.objects.filter(is_superuser=True):
            Notification.objects.create(user=admin, title="Critical Pharmacy Asset Shortage", message=f"Inventory '{instance.name}' has dropped below critical levels.", notification_type="system")

@receiver(post_save, sender=Prescription)
def notify_prescription(sender, instance, created, **kwargs):
    if created and instance.patient and getattr(instance.patient, 'user', None):
        Notification.objects.create(user=instance.patient.user, title="New Clinical Prescription", message=f"Dr. {instance.doctor.get_name} has authorized a new medicinal prescription.", notification_type="system")

@receiver(post_save, sender=User)
def initialize_user_profile(sender, instance, created, **kwargs):
    if created:
        role = 'admin' if instance.is_superuser else 'patient'
        UserProfile.objects.get_or_create(user=instance, defaults={'role': role})
