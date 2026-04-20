# 🏥 Lifeline • Clinical Command Dashboard

**Lifeline** is an elite, high-fidelity Hospital Management System (HMS) designed for modern clinical operations. Built on a decoupled full-stack architecture, Lifeline operates as a stable, zero-noise, physician-led clinical workstation. It provides a premium, data-driven ecosystem featuring unified patient-doctor connectivity and 16 high-fidelity clinical modules.

---

## 🏛️ System Architecture

Lifeline is engineered for performance, security, and scalability:

*   **Frontend**: React 18+ (Vite) / Tailwind CSS / Framer Motion
*   **Backend**: Django 5.2 / Django REST Framework (DRF)
*   **Telemedicine**: Standardized Google Meet (GMeet) protocol for secure patient-doctor connectivity
*   **Database**: PostgreSQL (Neon DB) / SQLite (Fallback)
*   **Security**: Token-based Authentication via `dj-rest-auth` & `allauth`
*   **Reporting**: ReportLab PDF Engine

---

## 🚀 Key Modules & Clinical Workflows

### 🏥 16 High-Fidelity Clinical Modules
Comprehensive management across all hospital departments with zero-noise data flow:
- **High-Fidelity Records**: Non-placeholder clinical records spanning extensive clinical workflows.
- **Unified Navigation**: Optimized UI for a manual, professional, physician-led environment.

### 🩺 Telemedicine & Patient Connectivity
Secure, real-time live consultations:
- **GMeet Integration**: Secure virtual consultation session initiation seamlessly integrated into the Telemedicine Terminal.
- **Patient Portal Synchronization**: Direct connectivity between the patient's portal and the doctor's workstation.
- **Workflow Finalization**: Seamless transition from live consultation directly to clinical record finalization.

### 📊 Clinical Command Dashboard
Real-time operational visibility for Administrators and Doctors:
- **Revenue Analytics**: Track total revenue, pending bills, and payment trends.
- **Patient Monitoring**: Critical risk-level filters and high-priority patient tracking.
- **Resource Management**: Manage doctors, appointment schedules, and hospital capacity.

### 💊 Pharmacy & Laboratory
Integrated management for the entire clinical lifecycle:
- **Pharmacy Records**: inventory tracking for medical supplies and pharmacy items.
- **Lab Diagnostics**: Track lab tests, identify abnormal results, and archive medical history.

### 🧾 Automated Billing & Invoicing
- **One-Click PDF Invoices**: Professional, branded PDF generation for patient discharges and medications.
- **Payment Lifecycle**: Track bills from pending status to full payment with multiple method support.

---

## 🌍 Developer Setup

### 1. Backend API (Django)
The backend requires Python 3.10+ and a virtual environment.

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install core dependencies
pip install -r requirements.txt

# Database initialization
python manage.py migrate

# Launch the Backend API
python manage.py runserver
```

### 🔐 Permanent Login Credentials (Testing Environment)

These default accounts are hardcoded for consistent dev testing and will remain permanently active in the system:

| Role | Username | Password | Targeted Portal Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `test_admin` | `admin123` | [Clinical Portal](http://localhost:5173/login) |
| **Physician** | `test_doctor` | `doctor123` | [Clinical Portal](http://localhost:5173/login) |
| **Receptionist** | `test_receptionist` | `receptionist123`| [Clinical Portal](http://localhost:5173/login) |
| **Patient** | `test_patient` | `patient123` | [Patient Terminal](http://localhost:5173/patient/login) |

> [!IMPORTANT]
> **HIPAA Role Separation:** Internal staff (Admins, Doctors, etc.) MUST use the main `/login` URL. Patients must use the `/patient/login` terminal. Cross-role authentication will trigger a "Secure Access Violation" alert.


### 2. Frontend Application (React)
Ensure you have Node.js 18+ installed.

```bash
cd frontend

# Install Node modules
npm install

# Start the development dashboard
npm run dev
```

---

## 🛠️ Performance & Scalability
- **WhiteNoise Integration**: Optimized static file serving for production environments.
- **Database Pooling**: Configured for Neon PostgreSQL with long-running connection support.
- **CORS Configured**: Seamless communication between cross-origin React and Django environments.

---

### 📬 Contact & Support
Developed for high-stakes medical environments. For technical inquiries or deployment support, please contact the development team.
