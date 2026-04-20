import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, HeartPulse, Eye, EyeOff, ShieldCheck, Activity, Sun, Moon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import logo from '/lifeline_themed_v1.svg?v=cachebust123';
import { useGoogleLogin } from '@react-oauth/google';
import { useTheme } from '../context/ThemeContext';


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
    const { theme, toggleTheme } = useTheme();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(localStorage.getItem('lifeline-user') || '{}');
            const role = (user.role || '').toLowerCase();
            navigate(role === 'patient' ? '/patient/dashboard' : '/dashboard');
        }
    }, [navigate]);

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

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const res = await api.post('auth/google/', { access_token: tokenResponse.access_token });
                const authToken = res.data.key;
                localStorage.setItem('token', authToken);
                const userRes = await api.get('me/', { headers: { Authorization: `Token ${authToken}` } });
                localStorage.setItem('lifeline-user', JSON.stringify(userRes.data));
                sessionStorage.setItem('login-toast', `Welcome, ${userRes.data.first_name || userRes.data.username}. Google Identity Verified.`);
                const role = (userRes.data.role || '').toLowerCase();
                navigate(role === 'patient' ? '/patient/dashboard' : '/dashboard');
            } catch (err) {
                toast.error('Google authentication failed. Please try traditional login.');
                setLoading(false);
            }
        },
        onError: () => toast.error('Google Login Failed'),
    });


    const features = ['Role-based secure authentication', 'HIPAA-compliant data layers', 'Institutional terminal access', 'End-to-end encryption'];

    return (
        <div className="h-screen flex overflow-hidden pt-20" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontWeight: 600 } }} />

            {/* Left Panel - Symmetry Optimized */}
            <div className="hidden lg:flex flex-col justify-center flex-1 px-20 relative overflow-hidden"
                style={{ borderRight: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--luna-blue) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                
                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center gap-3 mb-10">
                        <img src={logo} alt="Lifeline" className="w-9 h-9 object-contain" />
                        <span className="text-2xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>LIFELINE<span className="opacity-40 font-bold ml-2">TERMINAL</span></span>
                    </div>

                    <h2 className="text-5xl font-black mb-6 leading-[1.1] tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>
                        Clinical <br />
                        <span className="text-gradient">Workstation.</span>
                    </h2>
                    <p className="text-lg font-bold leading-relaxed opacity-80 mb-10" style={{ color: 'var(--luna-text-main)' }}>
                        Secure gateway for healthcare specialists to manage clinical operations, patient registries, and real-time medical data.
                    </p>

                    <div className="space-y-4 mb-12">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--luna-navy)' }}>
                                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--luna-teal)' }} />
                                </div>
                                <p className="text-[16.5px] font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{f}</p>
                            </div>
                        ))}
                    </div>

                    {/* Grouped Stats for Visual Rhythm */}
                    <div className="grid grid-cols-3 gap-10 pt-10 border-t" style={{ borderColor: 'var(--luna-border)' }}>
                        {[{ val: '500+', label: 'Hospitals' }, { val: '2M+', label: 'Patients' }, { val: '99.9%', label: 'Uptime' }].map((s, i) => (
                            <div key={i}>
                                <p className="text-2xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{s.val}</p>
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] mt-1" style={{ color: LUNA.sky }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Perfect Centering */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                    style={{ backgroundImage: 'linear-gradient(var(--luna-border) 1px, transparent 1px), linear-gradient(90deg, var(--luna-border) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="w-full max-w-md rounded-[1.75rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border relative"
                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>

                    {/* Quick Theme Switcher */}
                    <button onClick={toggleTheme} className="absolute top-6 right-6 p-2.5 rounded-xl transition-all hover:bg-white/10" style={{ color: 'var(--luna-teal)' }}>
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Mobile logo */}
                    <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
                        <img src={logo} alt="Lifeline" className="w-8 h-8 object-contain" />
                        <span className="font-extrabold text-lg text-gradient">Lifeline</span>
                    </div>

                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'var(--luna-navy)', border: '1px solid var(--luna-border)' }}>
                            <ShieldCheck className="w-3 h-3" style={{ color: 'var(--luna-teal)' }} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--luna-teal)' }}>SECURE LOGIN</span>
                        </div>
                        <h1 className="text-3xl font-black mb-1.5 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Lifeline Portal</h1>
                        <p className="font-bold text-[14px] opacity-70" style={{ color: 'var(--luna-text-main)' }}>Sign in to access the Lifeline clinical network</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Field label="Username" icon={<User className="w-5 h-5" />}>
                            <input id="login-username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                                className="input !pl-14 !bg-transparent border-slate-200/50" placeholder="Enter your username" required autoComplete="username" />
                        </Field>

                        <Field label="Password" icon={<Lock className="w-5 h-5" />}>
                            <input id="login-password" type={showPw ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)} className="input !pl-14 pr-12 !bg-transparent border-slate-200/50"
                                placeholder="Enter your password" required autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 transition-all hover:scale-110 active:scale-95"
                                style={{ color: LUNA.teal }}>
                                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </Field>

                        <div className="flex items-center justify-between text-base">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-4 h-4 rounded border flex items-center justify-center transition-all group-hover:border-[var(--luna-blue)]" style={{ borderColor: 'var(--luna-border)' }}>
                                    <input type="checkbox" className="hidden" />
                                    <div className="w-2 h-2 rounded-sm bg-blue-500 scale-0 transition-transform peer-checked:scale-100" />
                                </div>
                                <span className="font-black text-xs" style={{ color: LUNA.teal }}>Remember me</span>
                            </label>
                            <Link to="/reset-password" name="forgotpassword" className="font-black text-xs transition-all underline opacity-70 hover:opacity-100" style={{ color: LUNA.teal }}>Forgot Password?</Link>
                        </div>

                        <button id="login-submit-btn" type="submit" disabled={loading}
                            className="w-full btn-primary py-4 text-base mt-2 shadow-[0_8px_30px_rgb(37,99,235,0.2)]">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--luna-border)]"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[var(--luna-card)] px-4 font-black opacity-30">Or sign in with</span></div>
                        </div>

                        <button type="button" onClick={() => loginWithGoogle()}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border transition-all hover:shadow-lg active:scale-[0.98]" 
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="Google" />
                            <span className="font-black text-sm">Sign in with Google</span>
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-xs font-black transition-all hover:scale-105 active:scale-95" style={{ color: 'var(--luna-text-main)', opacity: 0.6 }}>
                            <span>←</span> Back to Homepage
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const Field = ({ label, icon, children }) => (
    <div>
        <label className="block text-[11px] font-black mb-2 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)', opacity: 0.6 }}>{label}</label>
        <div className="relative group/field">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 transition-colors group-focus-within/field:text-[var(--luna-blue)]" style={{ color: LUNA.teal }}>
                {icon}
            </div>
            {children}
        </div>
    </div>
);

export default Login;
