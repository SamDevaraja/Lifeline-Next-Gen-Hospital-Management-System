# 🏥 Lifeline • Clinical Command Dashboard

**Lifeline** is an elite, high-fidelity Hospital Management System (HMS) designed for modern clinical operations. Powered by a neural AI core and built on a decoupled full-stack architecture, Lifeline provides a premium, data-driven ecosystem for medical professionals and patients alike.

---

## 🏛️ System Architecture

Lifeline is engineered for performance, security, and scalability:

*   **Frontend**: React 18+ (Vite) / Tailwind CSS / Framer Motion
*   **Backend**: Django 5.2 / Django REST Framework (DRF)
*   **Intelligence**: Google Gemini AI Integration (via Secure Proxy)
*   **Database**: PostgreSQL (Neon DB) / SQLite (Fallback)
*   **Security**: Token-based Authentication via `dj-rest-auth` & `allauth`
*   **Reporting**: ReportLab PDF Engine

---

## 🚀 Key Modules & Intelligence

### 🧠 Lifeline Neural Core (AI Agent)
The built-in AI assistant processes natural language commands to streamline clinical workflows:
- **Smart Rescheduling**: Move appointments via simple chat commands.
- **Risk Assessment**: Analyze patient data to identify high-risk clinical profiles.
- **Diagnostic Assistant**: symptom-based differential diagnosis suggestions.
- **Resource Queries**: Instant check for doctor availability and department status.

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

# Launch the Neural API
python manage.py runserver
```

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
