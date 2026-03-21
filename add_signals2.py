import os

file_path = r'c:\Users\Sam Devaraja\Desktop\hospitalmanagement\hospital\models.py'

new_signals = """
@receiver(post_save, sender=Prescription)
def notify_prescription(sender, instance, created, **kwargs):
    if created:
        if instance.patient and getattr(instance.patient, 'user', None):
            Notification.objects.create(
                user=instance.patient.user,
                title="New Clinical Prescription",
                message=f"Dr. {instance.doctor.get_name} has authorized a new medicinal prescription to your digital vault.",
                notification_type="system"
            )

@receiver(post_save, sender=TelemedSession)
def notify_telemed(sender, instance, created, **kwargs):
    if created:
        if instance.patient and getattr(instance.patient, 'user', None):
            Notification.objects.create(
                user=instance.patient.user,
                title="Telemedicine Broadcast Scheduled",
                message=f"Virtual session with Dr. {instance.doctor.get_name} is locked for {instance.scheduled_at.strftime('%Y-%m-%d %H:%M')}.",
                notification_type="appointment"
            )
        if instance.doctor and getattr(instance.doctor, 'user', None):
            Notification.objects.create(
                user=instance.doctor.user,
                title="Telemedicine Access Requested",
                message=f"Virtual broadcast with {instance.patient.get_name} is pending for {instance.scheduled_at.strftime('%Y-%m-%d %H:%M')}.",
                notification_type="appointment"
            )
"""

with open(file_path, 'a', encoding='utf-8') as f:
    f.write(new_signals)

print("More signals appended.")
