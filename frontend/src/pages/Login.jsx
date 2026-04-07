import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, HeartPulse, Eye, EyeOff, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import logo from '/lifeline_themed_v1.svg?v=cachebust123';


const LUNA = {
    sky: 'var(--luna-teal)',
    teal: 'var(--luna-blue)',
    steel: 'var(--luna-steel)',
    navy: 'var(--luna-navy)',
    dark: 'var(--luna-bg)',
    text: 'var(--luna-text-main)',
    muted: 'var(--luna-text-muted)'
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) { toast.error('Please fill all fields'); return; }
        setLoading(true);
        try {
            const res = await api.post('auth/login/', { username, password });
            const authToken = res.data.key;
            localStorage.setItem('token', authToken);
            const userRes = await api.get('me/', { headers: { Authorization: `Token ${authToken}` } });
            localStorage.setItem('lifeline-user', JSON.stringify(userRes.data));

            // Queue a welcome toast to show on the dashboard
            sessionStorage.setItem('login-toast', `Secure session established for ${userRes.data.first_name || userRes.data.username}.`);

            // Redirect based on role
            const role = (userRes.data.role || '').toLowerCase();
            const targetPath = (role === 'patient') ? '/patient/dashboard' : '/dashboard';

            // Check if Google Translate is active
            const isTranslated = document.cookie.includes('googtrans=/en/') &&
                !document.cookie.includes('googtrans=/en/en');

            if (isTranslated) {
                window.location.href = targetPath;
            } else {
                navigate(targetPath);
            }
        } catch (err) {
            let msg = 'Invalid credentials. Please check your credentials and try again.';
            if (err.response?.data?.non_field_errors) {
                msg = err.response.data.non_field_errors[0];
            }
            toast.error(msg);
            setLoading(false);
        }
    };


    const features = ['Role-based secure authentication', 'HIPAA-compliant data layers', 'AI Neural Core access', 'End-to-end encryption'];

    return (
        <div className="min-h-screen flex pt-20" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600 } }} />

            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(var(--luna-border) 1px, transparent 1px), linear-gradient(90deg, var(--luna-border) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

            {/* Left Panel */}
            <div className="hidden lg:flex flex-col justify-center flex-1 px-16 relative z-10"
                style={{ borderRight: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>

                {/* Redundant Logo Removed to avoid conflict with Navbar */}

                <div className="section-tag mb-5" style={{ background: 'rgba(167,235,242,0.06)', color: LUNA.sky, borderColor: 'rgba(167,235,242,0.15)' }}>
                    <ShieldCheck className="w-4 h-4" /> Secure Clinical Portal
                </div>
                <h2 className="text-4xl font-extrabold mb-4 leading-tight" style={{ color: 'var(--luna-text-main)' }}>
                    Your medical workspace<br />awaits
                </h2>
                <p className="text-lg font-bold leading-relaxed mb-10 max-w-sm" style={{ color: 'var(--luna-text-main)', opacity: 0.85 }}>
                    Access your clinical dashboard, patient registry, AI diagnostic tools, and hospital operations in one secure place.
                </p>

                <div className="space-y-3">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: 'var(--luna-navy)' }}>
                                <Activity className="w-3 h-3" style={{ color: 'var(--luna-teal)' }} />
                            </div>
                            <p className="text-sm font-bold" style={{ color: 'var(--luna-text-main)', opacity: 0.85 }}>{f}</p>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-5 mt-14">
                    {[{ val: '500+', label: 'Hospitals' }, { val: '2M+', label: 'Patients' }, { val: '99.9%', label: 'Uptime' }].map((s, i) => (
                        <div key={i} className="card-glass text-center py-5" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                            <p className="text-xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>{s.val}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest mt-1" style={{ color: 'var(--luna-teal)' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border"
                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <img src={logo} alt="Lifeline" className="w-8 h-8 object-contain" />
                        <span className="font-extrabold text-lg text-gradient">Lifeline</span>
                    </div>

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Hospital Portal</h1>
                        <p className="font-bold text-[15px]" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Welcome to Lifeline. Please identify yourself.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <Field label="Medical ID / Username" icon={<User className="w-5 h-5" />}>
                            <input id="login-username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                                className="input !pl-14" placeholder="Enter Medical ID or username" required autoComplete="username" />
                        </Field>

                        <Field label="Password" icon={<Lock className="w-5 h-5" />}>
                            <input id="login-password" type={showPw ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)} className="input !pl-14 pr-12"
                                placeholder="Enter secure password" required autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 transition-all hover:scale-110 active:scale-95"
                                style={{ color: LUNA.teal }}>
                                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </Field>

                        <div className="flex items-center justify-between text-base">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded" />
                                <span className="font-black text-sm" style={{ color: LUNA.teal }}>Remember me</span>
                            </label>
                            <Link to="/reset-password" className="font-black text-sm transition-all underline" style={{ color: LUNA.teal }}>Forgot password?</Link>
                        </div>

                        <button id="login-submit-btn" type="submit" disabled={loading}
                            className="w-full btn-primary py-4 text-base mt-2">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Access Portal <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </button>
                    </form>


                    <div className="mt-6 text-center space-y-4">
                        <Link to="/" className="block text-sm font-black transition-all" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            ← Back to Homepage
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const Field = ({ label, icon, children }) => (
    <div>
        <label className="block text-[15px] font-black mb-2.5" style={{ color: 'var(--luna-text-main)', opacity: 0.85 }}>{label}</label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10" style={{ color: LUNA.teal }}>
                {icon}
            </div>
            {children}
        </div>
    </div>
);

export default Login;
