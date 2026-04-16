import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import { PrivacyPolicy, TermsOfService, CookiePolicy, HIPAANotice } from './pages/LegalPolicies';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CheckEmail from './pages/CheckEmail';

const AppContent = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <div className="min-h-screen">
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<Navigate to="/about" replace />} />
        <Route path="/contact" element={<Navigate to="/contact" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-email/:key" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/hipaa-notice" element={<HIPAANotice />} />
      </Routes>
    </div>
  );
};

const PatientApp = () => {
  return (
    <AppContent />
  );
};

export default PatientApp;

