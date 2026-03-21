import os

file_path = r'c:\Users\Sam Devaraja\Desktop\hospitalmanagement\hospital\api.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("return qs[:100]  # Cap at 100 records", "return qs")
content = content.replace("return qs.order_by('-appointment_date')[:100]  # Most recent 100", "return qs.order_by('-appointment_date')")
content = content.replace("return qs.order_by('-created_at')[:100]", "return qs.order_by('-created_at')")
content = content.replace("return qs[:100]", "return qs")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed API slicing!")
