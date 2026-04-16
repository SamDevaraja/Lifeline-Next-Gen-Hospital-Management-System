from hospital.models import Doctor, Patient, Appointment
from django.utils import timezone
import datetime

def seed():
    dr = Doctor.objects.first()
    pt = Patient.objects.first()
    
    if not dr or not pt:
        print("Missing Dr or Patient")
        return

    # Create a few appointments
    dates = [
        datetime.date.today(),
        datetime.date.today() + datetime.timedelta(days=1),
        datetime.date.today() + datetime.timedelta(days=2)
    ]
    
    times = ["09:00:00", "11:30:00", "14:15:00"]
    statuses = ['confirmed', 'pending', 'pending']
    
    for i in range(3):
        Appointment.objects.create(
            doctor=dr,
            patient=pt,
            appointment_date=dates[i],
            appointment_time=times[i],
            status=statuses[i],
            meeting_link="https://meet.google.com/abc-defg-hij" if statuses[i] == 'confirmed' else ""
        )
    print("Seeded 3 appointments")

if __name__ == "__main__":
    seed()
