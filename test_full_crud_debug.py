import requests

BASE_URL = 'http://127.0.0.1:8000/api'
session = requests.Session()

print("1. Authenticating as clinical_director...")
login_res = session.post(f"{BASE_URL}/auth/login/", json={
    "username": "clinical_director",
    "password": "A#SsoRgTAZSiykDasB"
})
if login_res.status_code == 200:
    token = login_res.json().get('key')
    session.headers.update({"Authorization": f"Token {token}"})
    print("   [SUCCESS] Logged in.")
else:
    exit(1)

print("\n2. Verifying Doctor Features (Create, Read, Update, Archive)")
res_list = session.get(f"{BASE_URL}/doctors/")
doctor_list = res_list.json()
created_doc = next((d for d in doctor_list if d.get('user') and d['user'].get('username') == 'testdoc_demo'), None)

if created_doc:
    doc_id = created_doc['id']
    patch_payload = {
        "first_name": "UpdatedTest",
        "department": "Neurologist",
        "consultation_fee": 3000
    }
    res_patch = session.patch(f"{BASE_URL}/doctors/{doc_id}/", json=patch_payload)
    print("PATCH RESPONSE:", res_patch.text)
    
    res_verify_doc = session.get(f"{BASE_URL}/doctors/{doc_id}/")
    print("GET AFTER PATCH RESPONSE:", res_verify_doc.text)
else:
    print("Doctor not found in list.")
