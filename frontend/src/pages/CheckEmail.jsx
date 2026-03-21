import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LUNA = {
    teal: 'var(--luna-blue)',
    bg: 'var(--luna-bg)',
    card: 'var(--luna-card)',
    text: 'var(--luna-text-main)',
    muted: 'var(--luna-text-muted)'
};

const CheckEmail = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen pt-28 pb-20 flex items-start justify-center px-6" style={{ background: LUNA.bg }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="w-full max-w-lg border rounded-[2.5rem] p-12 text-center shadow-2xl"
                style={{ background: LUNA.card, borderColor: 'var(--luna-border)' }}>
                
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-8"
                     style={{ background: 'var(--luna-navy)' }}>
                    <Mail className="w-10 h-10" style={{ color: LUNA.teal }} />
                </div>

                <h1 className="text-3xl font-black mb-4 tracking-tight" style={{ color: LUNA.text }}>Identity Verification Required</h1>
                <p className="font-bold text-[16px] leading-relaxed mb-10" style={{ color: LUNA.muted }}>
                    A secure cryptographic link has been dispatched to your primary email address. 
                    Please authenticate the link to finalize your integration into the clinical network.
                </p>

                <div className="space-y-4">
                    <button onClick={() => navigate('/login')} className="w-full btn-teal py-4 text-base font-bold flex items-center justify-center gap-2">
                        Verification Confirmed: Proceed to Access <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <button onClick={() => window.open('https://mail.google.com/', '_blank')} 
                            className="w-full btn-secondary py-4 text-base font-bold">
                        Access Official Webmail
                    </button>
                    
                    <p className="pt-4 text-sm font-bold" style={{ color: LUNA.muted }}>
                        If delivery fails, consult your spam/firewall filters or initiate a new request.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckEmail;
