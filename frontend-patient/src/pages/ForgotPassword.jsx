import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Eye, EyeOff, ArrowLeft, CheckCircle, Smartphone, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = () => {
    const [form, setForm] = useState({ email: '', mobile: '', password: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const update = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (!form.email || !form.mobile) return toast.error('Both Email and Mobile Number are required for verification.');
        if (form.password !== form.confirm) return toast.error('Passwords do not match.');
        if (form.password.length < 8) return toast.error('Password must be at least 8 characters.');
        
        setLoading(true);
        try {
            await api.post('auth/direct-password-reset/', {
                email: form.email,
                mobile: form.mobile,
                new_password: form.password
            });
            setSuccess(true);
            toast.success('Password updated successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Identity Verification Failed. Cross-reference did not match.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl border rounded-[2rem] shadow-2xl relative overflow-hidden"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'var(--luna-teal)' }}></div>

                <div className="p-8 sm:p-12">
                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                
                                <div className="flex items-start sm:items-center justify-between mb-10 flex-col sm:flex-row gap-4">
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-black mb-1.5 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Recover Vault</h1>
                                        <p className="font-bold text-[14px]" style={{ color: 'var(--luna-text-muted)' }}>
                                            Dual-Factor Identity Verification Required.
                                        </p>
                                    </div>
                                    <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-[13px] uppercase tracking-widest font-black px-5 py-2.5 rounded-xl transition-all hover:bg-black/5" style={{ color: 'var(--luna-text-main)', background: 'var(--luna-border)' }}>
                                        <ArrowLeft className="w-4 h-4" /> Cancel
                                    </button>
                                </div>

                                <form onSubmit={handleReset} className="space-y-8" autoComplete="off">
                                    {/* 2-Column Grid to eliminate vertical scrolling */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
                                        
                                        {/* Identify Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--luna-teal)' }} />
                                                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--luna-text-main)'}}>Verify Identity</h2>
                                            </div>

                                            <div>
                                                <label className="block text-[12px] font-black mb-2 opacity-75 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>Registered Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none opacity-50" style={{ color: 'var(--luna-text-main)' }} />
                                                    <input type="email" value={form.email} onChange={update('email')}
                                                        className="input !pl-11 text-sm font-bold w-full !bg-button border-none" placeholder="Secure email address" required autoComplete="off" />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[12px] font-black mb-2 opacity-75 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>Mobile Number</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none opacity-50" style={{ color: 'var(--luna-text-main)' }} />
                                                    <input type="text" value={form.mobile} onChange={update('mobile')}
                                                        className="input !pl-11 text-sm font-bold w-full !bg-button border-none" placeholder="+91 98765 43210" required autoComplete="off" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                                <Lock className="w-4 h-4" style={{ color: 'var(--luna-teal)' }} />
                                                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--luna-text-main)'}}>Create Password</h2>
                                            </div>

                                            <div>
                                                <label className="block text-[12px] font-black mb-2 opacity-75 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>New Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none opacity-50" style={{ color: 'var(--luna-text-main)' }} />
                                                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
                                                        className="input !pl-11 pr-11 text-sm font-bold w-full !bg-button border-none" placeholder="Min 8 characters" required autoComplete="new-password" />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[12px] font-black mb-2 opacity-75 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>Verify Password</label>
                                                <div className="relative flex">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none opacity-50" style={{ color: 'var(--luna-text-main)' }} />
                                                    <input type={showPw ? 'text' : 'password'} value={form.confirm} onChange={update('confirm')}
                                                        className="input !pl-11 pr-11 text-sm font-bold w-full !bg-button border-none" placeholder="Re-enter password" required autoComplete="new-password" />
                                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                                        className="absolute right-0 top-0 h-full px-4 opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--luna-text-main)' }}>
                                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <button type="submit" disabled={loading} className="w-full btn-teal py-4 mt-4 text-sm uppercase tracking-widest font-black transition-all hover:scale-[1.01] shadow-xl">
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500/10 border-4 border-green-500/20">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Protocol Authorized</h2>
                                <p className="font-bold opacity-70 mb-10 text-[15px]" style={{ color: 'var(--luna-text-main)' }}>Your new credentials have been explicitly written to the registry.</p>
                                
                                <button onClick={() => navigate('/login')} className="btn-teal px-10 py-3.5 text-sm uppercase tracking-widest font-black rounded-xl">
                                    Return to Authentication
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
