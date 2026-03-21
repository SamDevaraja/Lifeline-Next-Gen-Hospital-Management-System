import os

file_path = r'c:\Users\Sam Devaraja\Desktop\hospitalmanagement\hospital\models.py'

new_signals = """
@receiver(post_save, sender=PharmacyItem)
def notify_pharmacy_stock(sender, instance, created, **kwargs):
    from django.contrib.auth.models import User
    # Only notify on severe shortages to prevent spam
    if instance.stock_level <= 20:
        admins = User.objects.filter(is_superuser=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title=f"Critical Inventory Alert: {instance.name}",
                message=f"Pharmacy asset '{instance.name}' has dropped to {instance.stock_level} units. Immediate restock required.",
                notification_type="system"
            )

@receiver(post_save, sender=Patient)
def notify_patient_updates(sender, instance, created, **kwargs):
    from django.contrib.auth.models import User
    if created:
        # Notify Admins of new system admittance
        admins = User.objects.filter(is_superuser=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="New Patient Admittance",
                message=f"Patient {instance.user.first_name} {instance.user.last_name} ({instance.user.username}) has been registered into the institutional database.",
                notification_type="system"
            )
    else:
        # Notify Doctor of Risk Escalation
        if instance.risk_level in ['high', 'critical'] and not instance.is_deleted:
            if instance.assigned_doctor and getattr(instance.assigned_doctor, 'user', None):
                Notification.objects.create(
                    user=instance.assigned_doctor.user,
                    title="Clinical Risk Escalation",
                    message=f"CRITICAL: Patient {instance.user.first_name} {instance.user.last_name} has escalated to {instance.risk_level.upper()} triage risk category and requires immediate oversight.",
                    notification_type="ai_alert"
                )
"""

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "notify_pharmacy_stock" not in content:
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write(new_signals)
        print("Signals appended.")
else:
    print("Signals already exist.")
