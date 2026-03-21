import requests

url = "http://127.0.0.1:8000/api/pharmacy/"
items = requests.get(url).json()

item = next((i for i in items if i["name"].startswith("Atorvastatin")), None)
if item:
    print("Found:", item["name"], item["category"])
    payload = {
        "name": item["name"],
        "category": "STATIN", # Mimic front-end sending raw category or whatever
        "stock_level": item["stock_level"] + 1,
        "unit_price": float(item["unit_price"]),
        "supplier": item["supplier"] or "",
        "description": item["description"] or "",
        "expiry_date": item["expiry_date"] or None
    }
    patch_res = requests.patch(f"{url}{item['id']}/", json=payload)
    print("PATCH HTTP STATUS:", patch_res.status_code)
    print("PATCH RESPONSE:", patch_res.text)
else:
    print("Not found.")
