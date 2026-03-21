import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [pwd, setPwd] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pwd !== confirm) {
            toast.error('Cryptographic mismatch: Passwords do not align.');
            return;
        }
        if (pwd.length < 8) {
            toast.error('Security policy requires a minimum of 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await api.post('auth/password/reset/confirm/', { 
                uid, 
                token, 
                new_password: pwd, 
                new_password1: pwd,
                new_password_confirm: confirm // Different serializers use different fields, dj_rest_auth uses new_password1/2 or new_password depending on version
            });
            setSuccess(true);
            toast.success('Authentication credentials securely updated.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid or expired token.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-28 pb-20 flex items-start justify-center px-6" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md border rounded-[2.5rem] p-10 shadow-2xl"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                
                {success ? (
                    <div className="text-center py-6">
                        <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
                        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--luna-text-main)' }}>Credential Secured</h2>
                        <p className="font-bold opacity-80" style={{ color: 'var(--luna-text-main)' }}>You can now sign in with your new password.</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Reset Password</h1>
                        <p className="font-bold text-[15px] mb-8" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            Please enter a secure new password for your clinical account.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[15px] font-black mb-2.5 opacity-85" style={{ color: 'var(--luna-text-main)' }}>New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none" style={{ color: 'var(--luna-teal)' }} />
                                    <input type={showPw ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)}
                                        className="input !pl-14 pr-12" placeholder="Min 8 characters" required />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--luna-teal)' }}>
                                        {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[15px] font-black mb-2.5 opacity-85" style={{ color: 'var(--luna-text-main)' }}>Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none" style={{ color: 'var(--luna-teal)' }} />
                                    <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                                        className="input !pl-14 pr-12" placeholder="Confirm secure password" required />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full btn-teal py-4 text-base mt-4">
                                {loading ? 'Securing...' : 'Save Password'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
