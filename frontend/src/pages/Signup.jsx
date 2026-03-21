import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Mail, Lock, Phone, MapPin, Eye, EyeOff, Stethoscope, HeartPulse, ShieldCheck } from 'lucide-react';
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

const DEPARTMENTS = [
    'Cardiologist', 'Dermatologist', 'Emergency Medicine', 'Allergist / Immunologist',
    'Anesthesiologist', 'Neurologist', 'Pediatrician', 'Orthopedic Surgeon',
    'Pulmonologist', 'Endocrinologist', 'Gastroenterologist', 'Oncologist',
];

const Signup = () => {
    const [role, setRole] = useState('doctor');
    const [showPw, setShowPw] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', mobile: '', address: '', password: '', confirm: '', department: DEPARTMENTS[0] });
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

    const update = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
        if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        if (!agreed) { toast.error('You must agree to the clinical Terms of Service and Privacy Policy to proceed.'); return; }

        try {
            toast.loading('Registering account...', { id: 'reg' });
            await api.post('register/', {
                username: form.username,
                password: form.password,
                email: form.email,
                first_name: form.firstName,
                last_name: form.lastName,
                role: role,
                address: form.address,
                phone: form.mobile,
                department: form.department
            });
            toast.success('Registration successful. Please log in.', { id: 'reg' });
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            let errorMsg = 'Registration failed. Check your inputs.';
            if (err.response?.data) {
                // If it returns an object of errors (e.g. { username: ["Already exists"] })
                if (typeof err.response.data === 'object' && !err.response.data.message) {
                    const firstError = Object.values(err.response.data)[0];
                    if (Array.isArray(firstError)) errorMsg = firstError[0];
                    else if (typeof firstError === 'string') errorMsg = firstError;
                } else if (err.response.data.message) {
                    errorMsg = err.response.data.message;
                }
            }
            toast.error(errorMsg, { id: 'reg' });
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const loadingId = toast.loading('Authenticating with Google...');
            try {
                const res = await api.post('auth/google/', {
                    access_token: tokenResponse.access_token,
                });
                
                const authToken = res.data.key;
                localStorage.setItem('token', authToken);
                
                const userRes = await api.get('me/', { headers: { Authorization: `Token ${authToken}` } });
                localStorage.setItem('lifeline-user', JSON.stringify(userRes.data));
                
                toast.success('Sign up completed via Google!', { id: loadingId });
                
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } catch (err) {
                toast.error('Google Sign-In failed or email already registered natively.', { id: loadingId });
            }
        },
        onError: () => toast.error('Google Authentication Canceled'),
    });

    // Doctors must be created by Admin now
    const roles = [];

    return (
        <div className="min-h-screen pt-28 pb-20 flex items-start justify-center px-6" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600 } }} />

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl border rounded-[2.5rem] p-10 shadow-2xl"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Staff Onboarding</h1>
                    <p className="font-bold text-[15px]" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Join the Lifeline clinical network</p>
                </div>

                <p className="text-sm text-center mb-8 px-4 py-3 rounded-xl font-bold" style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', opacity: 0.8 }}>
                    Register your clinical access identity. All credentials will be permanently audited and monitored.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <SignupField label="First Name" icon={<User className="w-4 h-4" />} value={form.firstName} onChange={update('firstName')} placeholder="Enter legal first name" id="signup-firstname" />
                        <SignupField label="Last Name" icon={<User className="w-4 h-4" />} value={form.lastName} onChange={update('lastName')} placeholder="Enter legal last name" id="signup-lastname" />
                    </div>
                    <SignupField label="Email Address" icon={<Mail className="w-4 h-4" />} value={form.email} onChange={update('email')} placeholder="official@hospital.com" type="email" id="signup-email" />
                    <SignupField label="Username" icon={<User className="w-4 h-4" />} value={form.username} onChange={update('username')} placeholder="Create a unique username" id="signup-username" />

                    <div className="grid grid-cols-2 gap-5">
                        <SignupField label="Mobile" icon={<Phone className="w-4 h-4" />} value={form.mobile} onChange={update('mobile')} placeholder="+91-00000-00000" id="signup-mobile" />
                        <SignupField label="City/Address" icon={<MapPin className="w-4 h-4" />} value={form.address} onChange={update('address')} placeholder="City, State, Zip Code" id="signup-address" />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Registration Role</label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: LUNA.teal }}>
                                    <Stethoscope className="w-4 h-4" />
                                </div>
                                <select id="signup-role" value={role} onChange={(e) => setRole(e.target.value)}
                                    className="input !pl-14 appearance-none cursor-pointer">
                                    <option value="doctor">Doctor / Specialist</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="receptionist">Receptionist</option>
                                    <option value="pharmacist">Pharmacist</option>
                                </select>
                            </div>
                        </div>

                        {role === 'doctor' && (
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Medical Department</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: LUNA.teal }}>
                                        <HeartPulse className="w-4 h-4" />
                                    </div>
                                    <select id="signup-dept" value={form.department} onChange={update('department')}
                                        className="input !pl-14 appearance-none cursor-pointer">
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none" style={{ color: LUNA.teal }} />
                                <input id="signup-password" type={showPw ? 'text' : 'password'} value={form.password}
                                    onChange={update('password')} className="input !pl-14 pr-12" placeholder="Min 8 characters" />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: LUNA.teal }}>
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none" style={{ color: LUNA.teal }} />
                                <input id="signup-confirm" type={showPw ? 'text' : 'password'} value={form.confirm}
                                    onChange={update('confirm')} className="input !pl-14" placeholder="Confirm secure password" />
                            </div>
                        </div>
                    </div>

                    {/* Password strength */}
                    {form.password && (
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                {[8, 12, 16].map((min, i) => (
                                    <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                                        style={{ background: form.password.length >= min ? ['#ef4444', '#f59e0b', '#10b981'][i] : 'var(--luna-navy)' }} />
                                ))}
                            </div>
                            <p className="text-xs font-bold" style={{ color: 'var(--luna-text-muted)' }}>
                                {form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Fair' : form.password.length < 16 ? 'Good' : 'Exceptional'}
                            </p>
                        </div>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded cursor-pointer" />
                        <span className="text-sm font-bold" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            I agree to the <Link to="/terms-of-service" onClick={e => e.stopPropagation()} className="font-black hover:underline" style={{ color: LUNA.teal }}>Terms of Service</Link> and{' '}
                            <Link to="/privacy-policy" onClick={e => e.stopPropagation()} className="font-black hover:underline" style={{ color: LUNA.teal }}>Privacy Policy</Link>
                        </span>
                    </label>

                    <button id="signup-submit-btn" type="submit" className="w-full btn-teal py-4 text-base mt-2">
                        Request Access <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" style={{ borderColor: 'var(--luna-border)' }}></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 font-bold" style={{ background: 'var(--luna-card)', color: LUNA.steel }}>Or sign up with</span>
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

                <p className="mt-8 text-center text-sm font-bold" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                    Already registered?{' '}
                    <Link to="/login" className="font-black hover:underline" style={{ color: LUNA.teal }}>Sign In here</Link>
                </p>
            </motion.div>
        </div>
    );
};

const SignupField = ({ label, icon, value, onChange, placeholder, type = 'text', id }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-black uppercase tracking-[0.15em] mb-2.5 opacity-85" style={{ color: 'var(--luna-text-main)' }}>{label}</label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: LUNA.teal }}>{icon}</div>
            <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} className="input !pl-14" required />
        </div>
    </div>
);

export default Signup;
