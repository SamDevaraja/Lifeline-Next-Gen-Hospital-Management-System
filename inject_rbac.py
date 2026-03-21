import re

api_file = 'hospital/api.py'
with open(api_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure imports are present
if 'PharmacyOrder, CleaningTask' not in content:
    content = content.replace(
        'TelemedSession, LabTest, Prescription',
        'TelemedSession, LabTest, Prescription, PharmacyOrder, CleaningTask'
    )
if 'PharmacyOrderSerializer' not in content:
    content = content.replace(
        'TelemedSessionSerializer, LabTestSerializer, PrescriptionSerializer',
        'TelemedSessionSerializer, LabTestSerializer, PrescriptionSerializer,\n    PharmacyOrderSerializer, CleaningTaskSerializer'
    )
if 'RBACPermission' not in content:
    content = content.replace(
        'from rest_framework import viewsets, permissions, status',
        'from rest_framework import viewsets, permissions, status\nfrom hospital.permissions import RBACPermission'
    )

# Safely replace only viewset permissions
content = re.sub(
    r'permission_classes = \[permissions\.IsAuthenticated\]',
    r'permission_classes = [permissions.IsAuthenticated, RBACPermission]',
    content
)
content = re.sub(
    r'permission_classes = \[IsAuthenticated\]',
    r'permission_classes = [IsAuthenticated, RBACPermission]',
    content
)

# Append new ViewSets
if 'class PharmacyOrderViewSet' not in content:
    content += """

class PharmacyOrderViewSet(viewsets.ModelViewSet):
    queryset = PharmacyOrder.objects.all()
    serializer_class = PharmacyOrderSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]

class CleaningTaskViewSet(viewsets.ModelViewSet):
    queryset = CleaningTask.objects.all()
    serializer_class = CleaningTaskSerializer
    permission_classes = [permissions.IsAuthenticated, RBACPermission]
"""

with open(api_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("api.py successfully updated to include RBAC checks.")
