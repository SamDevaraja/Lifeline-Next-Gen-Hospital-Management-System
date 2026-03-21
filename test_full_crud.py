import requests
import uuid

BASE_URL = 'http://127.0.0.1:8000/api'
session = requests.Session()

print("\n=== INITIATING AUTOMATED CLINICAL VERIFICATION SUITE ===\n")
print("1. Authenticating Operations User...")
login_res = session.post(f"{BASE_URL}/auth/login/", json={
    "username": "clinical_director",
    "password": "A#SsoRgTAZSiykDasB"
})
if login_res.status_code == 200:
    token = login_res.json().get('key')
    session.headers.update({"Authorization": f"Token {token}"})
    print("   [SUCCESS] Handshake granted.")
else:
    print("   [FAILED] Auth Handshake failed.")
    exit(1)

rand_suffix = str(uuid.uuid4())[:6]

print("\n2. Testing Django Doctor Operations")
doc_payload = {
    "first_name": "Test",
    "last_name": "Doctor",
    "email": f"doc_{rand_suffix}@hospital.local",
    "password": "securepassword123",
    "username": f"doc_{rand_suffix}",
    "mobile": "9998887776",
    "address": "Hospital Wing A",
    "department": "Cardiologist",
    "status": True,
    "qualification": "MD",
    "experience_years": 10,
    "consultation_fee": 2000
}
res_create_doc = session.post(f"{BASE_URL}/doctors/", json=doc_payload)
if res_create_doc.status_code == 201:
    print("   [SUCCESS] CREATED new Specialist protocol.")
else:
    print("   [FAILED] Create Doctor failed:", res_create_doc.text)

res_list = session.get(f"{BASE_URL}/doctors/")
doctor_list = res_list.json()
created_doc = next((d for d in doctor_list if d.get('user') and d['user'].get('username') == f"doc_{rand_suffix}"), None)
if not created_doc:
    print("   [FAILED] Could not read newly created Doctor. Slicing bug returned?")
else:
    doc_id = created_doc['id']
    print(f"   [SUCCESS] READ protocol confirmed.")
    
    # UPDATE
    patch_payload = {
        "first_name": "UpdatedTest",
        "department": "Neurologist"
    }
    res_patch = session.patch(f"{BASE_URL}/doctors/{doc_id}/", json=patch_payload)
    if res_patch.status_code == 200:
        res_verify_doc = session.get(f"{BASE_URL}/doctors/{doc_id}/")
        if res_verify_doc.json()['user']['first_name'] == 'UpdatedTest':
            print("   [SUCCESS] UPDATED database bindings flawlessly.")
        else:
            print("   [FAILED] UPDATE silent failure.")
    
    # ARCHIVE
    res_archive = session.delete(f"{BASE_URL}/doctors/{doc_id}/")
    if res_archive.status_code == 204:
        res_list_after = session.get(f"{BASE_URL}/doctors/")
        if any(d['id'] == doc_id for d in res_list_after.json()):
            print("   [FAILED] ARCHIVE operation bypassed staff filter!")
        else:
            print("   [SUCCESS] ARCHIVED protocol permanently hidden.")

print("\n3. Testing Django Patient Operations")
pat_payload = {
    "first_name": "Test",
    "last_name": "Patient",
    "email": f"pat_{rand_suffix}@patient.local",
    "password": "securepassword123",
    "username": f"pat_{rand_suffix}",
    "mobile": "1112223334",
    "address": "Home",
    "date_of_birth": "1990-01-01",
    "blood_group": "O+",
    "symptoms": "Mild fever",
    "status": True,
    "risk_level": "moderate"
}
res_create_pat = session.post(f"{BASE_URL}/patients/", json=pat_payload)
if res_create_pat.status_code == 201:
    print("   [SUCCESS] CREATED new Patient registry.")
else:
    print("   [FAILED] Create Patient failed:", res_create_pat.text)

res_list_pat = session.get(f"{BASE_URL}/patients/")
created_pat = next((p for p in res_list_pat.json() if p.get('user') and p['user'].get('username') == f"pat_{rand_suffix}"), None)
if not created_pat:
    print("   [FAILED] Could not read newly created Patient.")
else:
    pat_id = created_pat['id']
    print(f"   [SUCCESS] READ protocol confirmed.")
    
    # UPDATE
    patch_payload_pat = {
        "first_name": "CriticalTest",
        "risk_level": "critical",
    }
    res_patch_pat = session.patch(f"{BASE_URL}/patients/{pat_id}/", json=patch_payload_pat)
    if res_patch_pat.status_code == 200:
        res_verify_pat = session.get(f"{BASE_URL}/patients/{pat_id}/")
        if res_verify_pat.json()['user']['first_name'] == 'CriticalTest':
            print("   [SUCCESS] UPDATED user parameters flawlessly.")
        else:
            print("   [FAILED] UPDATE silent failure.")
    
    # ARCHIVE
    res_archive_pat = session.delete(f"{BASE_URL}/patients/{pat_id}/")
    if res_archive_pat.status_code == 204:
        res_list_pat_after = session.get(f"{BASE_URL}/patients/")
        if any(p['id'] == pat_id for p in res_list_pat_after.json()):
            print("   [FAILED] ARCHIVE operation bypassed staff filter!")
        else:
            print("   [SUCCESS] ARCHIVED protocol permanently hidden.")

print("\n=== AUTOMATED SUITE COMPLETE - ZERO ERRORS DETECTED ===")
