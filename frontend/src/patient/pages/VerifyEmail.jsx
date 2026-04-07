import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const LUNA = {
    teal: 'var(--luna-blue)',
    bg: 'var(--luna-bg)',
    card: 'var(--luna-card)',
    text: 'var(--luna-text-main)',
    muted: 'var(--luna-text-muted)'
};

const VerifyEmail = () => {
    const { key } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        const verify = async () => {
            try {
                await api.post('auth/registration/verify-email/', { key });
                setStatus('success');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                setStatus('error');
            }
        };
        verify();
    }, [key, navigate]);

    return (
        <div className="min-h-screen pt-28 pb-20 flex items-start justify-center px-6" style={{ background: LUNA.bg }}>
            <Toaster position="top-right" />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md border rounded-[2.5rem] p-10 shadow-2xl text-center"
                style={{ background: LUNA.card, borderColor: 'var(--luna-border)' }}>
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 animate-spin mb-6" style={{ color: LUNA.teal }} />
                        <h2 className="text-2xl font-black mb-2" style={{ color: LUNA.text }}>Verifying Identity</h2>
                        <p className="font-bold opacity-80" style={{ color: LUNA.text }}>Please wait while we secure your account...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 mb-6 text-green-500" />
                        <h2 className="text-2xl font-black mb-2" style={{ color: LUNA.text }}>Verification Complete</h2>
                        <p className="font-bold opacity-80 mb-6" style={{ color: LUNA.text }}>Cryptographic verification successful. Establishing routing sequence...</p>
                        <button onClick={() => navigate('/login')} className="btn-teal w-full py-3">Proceed to Authentication</button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 mb-6 text-red-500" />
                        <h2 className="text-2xl font-black mb-2" style={{ color: LUNA.text }}>Verification Failed</h2>
                        <p className="font-bold opacity-80 mb-6" style={{ color: LUNA.text }}>The cryptographic token provided is invalid or has expired.</p>
                        <button onClick={() => navigate('/login')} className="btn-secondary w-full py-3">Return to Authentication Portal</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;

