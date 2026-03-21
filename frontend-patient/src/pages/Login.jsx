import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, HeartPulse, Eye, EyeOff, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';


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

            if (userRes.data.role !== 'patient') {
                localStorage.clear();
                toast.error('Access Denied. Internal staff must use the secure Clinical portal.');
                setLoading(false);
                return;
            }
            
            localStorage.setItem('lifeline-user', JSON.stringify(userRes.data));

            // Queue a welcome toast to show on the dashboard (avoids waiting here)
            sessionStorage.setItem('login-toast', `Secure patient session established for ${userRes.data.first_name || userRes.data.username}.`);

            // Check if Google Translate is active (non-English language selected)
            // If so, use full page navigation so Google Translate can properly rehydrate.
            const isTranslated = document.cookie.includes('googtrans=/en/') &&
                !document.cookie.includes('googtrans=/en/en');

            if (isTranslated) {
                window.location.href = '/dashboard';
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            let msg = 'Invalid credentials. Please check your Medical ID and password.';
            if (err.response?.data?.non_field_errors) {
                msg = err.response.data.non_field_errors[0];
            }
            toast.error(msg);
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const res = await api.post('auth/google/', {
                    access_token: tokenResponse.access_token,
                });
                
                const authToken = res.data.key;
                localStorage.setItem('token', authToken);
                
                const userRes = await api.get('me/', { headers: { Authorization: `Token ${authToken}` } });
                localStorage.setItem('lifeline-user', JSON.stringify(userRes.data));
                
                sessionStorage.setItem('login-toast', `Google sign in successful for ${userRes.data.first_name || userRes.data.username}.`);
                
                const isTranslated = document.cookie.includes('googtrans=/en/') &&
                    !document.cookie.includes('googtrans=/en/en');

                if (isTranslated) {
                    window.location.href = '/dashboard';
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                toast.error('Google Sign-In failed or linked email missing.');
                setLoading(false);
            }
        },
        onError: () => toast.error('Google Authentication Failed'),
    });

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
                        <HeartPulse className="w-6 h-6" style={{ color: LUNA.teal }} />
                        <span className="font-extrabold text-lg" style={{ color: LUNA.dark }}>Lifeline</span>
                    </div>

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Sign In</h1>
                        <p className="font-bold text-[15px]" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Enter your clinical account credentials to continue</p>
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

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: 'var(--luna-border)' }}></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 font-bold" style={{ background: 'var(--luna-card)', color: LUNA.steel }}>Or continue with</span>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button type="button" onClick={() => handleGoogleLogin()} className="w-full py-2.5 border rounded-xl font-black text-sm flex justify-center items-center gap-2 hover:bg-gray-50/5 transition-all">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center space-y-4">
                        <p className="font-medium text-sm" style={{ color: LUNA.steel }}>
                            Need access?{' '}
                            <Link to="/signup" className="font-extrabold hover:underline" style={{ color: LUNA.teal }}>
                                Request Registration
                            </Link>
                        </p>
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
