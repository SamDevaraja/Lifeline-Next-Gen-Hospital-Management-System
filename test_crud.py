import requests

BASE_URL = 'http://127.0.0.1:8000/api'
session = requests.Session()

print("Logging in...")
login_res = session.post(f"{BASE_URL}/auth/login/", json={
    "username": "clinical_director",
    "password": "A#SsoRgTAZSiykDasB"
})
print("Login Status:", login_res.status_code)
if login_res.status_code == 200:
    token = login_res.json().get('key')
    session.headers.update({"Authorization": f"Token {token}"})

# Test Patient Create
pat_data = {
    "first_name": "TestPat",
    "last_name": "Jones",
    "email": "testpat@example.com",
    "password": "password123",
    "username": "testpat_jones",
    "mobile": "0987654321",
    "address": "Home",
    "date_of_birth": None,
    "blood_group": "A+",
    "symptoms": "Headache",
    "allergies": "None",
    "medical_history": "None",
    "emergency_contact": "Mom",
    "status": True,
    "risk_level": "moderate"
}
print("\n--- Creating Patient ---")
res = session.post(f"{BASE_URL}/patients/", json=pat_data)
print("Status:", res.status_code)
print("Response:", res.text)
if res.status_code == 201:
    pat_id = res.json().get("id")
    print("\n--- Editing Patient ---")
    patch_data = {"symptoms": "Severe Headache", "risk_level": "high"}
    res = session.patch(f"{BASE_URL}/patients/{pat_id}/", json=patch_data)
    print("Status:", res.status_code)
    print("Response:", res.text)
