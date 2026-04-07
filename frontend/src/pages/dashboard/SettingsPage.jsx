import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save } from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage = ({ user, onUpdate }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        address: '', bio: '', symptoms: '',
    });

    const [pwdData, setPwdData] = useState({ old: '', new: '', confirm: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user?.first_name || '', last_name: user?.last_name || '',
                email: user?.email || '', phone: user?.phone || '',
                address: user?.address || '', bio: user?.bio || '', symptoms: user?.symptoms || '',
            });
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/me/', formData);
            if (onUpdate) await onUpdate();
            toast.success('Clinical parameters synchronized');
        } catch (err) {
            toast.error('Identity sync failed');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (pwdData.new !== pwdData.confirm) return toast.error('Mismatched Protocol');
        setSaving(true);
        try {
            await api.post('/auth/password/change/', {
                old_password: pwdData.old,
                new_password: pwdData.new
            });
            toast.success('Security identity updated');
            setPwdData({ old: '', new: '', confirm: '' });
        } catch (err) {
            toast.error('Identity verification failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="flex flex-col max-w-7xl mx-auto px-2 py-4">
            <Toaster position="top-right" />
            
            <div className="flex-shrink-0 mb-6 px-1">
                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Settings</h1>
                <p className="font-bold text-[10px] uppercase tracking-widest opacity-60">Clinical Configuration Gateway</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* IDENTITY HUB */}
                <div className="lg:col-span-3">
                    <div className="card-clinical p-8 border shadow-xl" 
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', borderRadius: '1.5rem' }}>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-teal-600">Identity Governance</h2>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <InputGroup label="First Name" value={formData.first_name} onChange={v => setFormData({ ...formData, first_name: v })} isDark={isDark} />
                                <InputGroup label="Last Name" value={formData.last_name} onChange={v => setFormData({ ...formData, last_name: v })} isDark={isDark} />
                                <InputGroup label="Email Identification" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} isDark={isDark} />
                                <InputGroup label="Secure Mobile" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} isDark={isDark} />
                            </div>
                            <InputGroup label="Facility Location" value={formData.address} onChange={v => setFormData({ ...formData, address: v })} isDark={isDark} />
                            
                            <div className="pt-8 border-t border-slate-200/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30 px-1">Institutional DB Link Active</span>
                                </div>
                                <button type="submit" disabled={saving} className="btn-teal px-10 py-3 text-[11px] rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-teal-500/20 active:scale-95 transition-all">
                                    {saving ? 'Syncing...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* SECURITY HUB */}
                <div className="lg:col-span-2">
                    <div className="card-clinical p-8 border shadow-xl" 
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', borderRadius: '1.5rem' }}>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-red-600 flex items-center gap-2">
                             <Shield className="w-4 h-4"/> Security Update
                        </h2>
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <InputGroup label="Current Protocol Key" type="password" value={pwdData.old} onChange={v => setPwdData({ ...pwdData, old: v })} isDark={isDark} />
                            <InputGroup label="Replacement Key" type="password" value={pwdData.new} onChange={v => setPwdData({ ...pwdData, new: v })} isDark={isDark} />
                            <InputGroup label="Verify Protocol" type="password" value={pwdData.confirm} onChange={v => setPwdData({ ...pwdData, confirm: v })} isDark={isDark} />
                            
                            <div className="pt-8 border-t border-slate-200/10 space-y-4">
                                <p className="text-[9px] text-[#1e293b] dark:text-[#94a3b8] font-bold uppercase tracking-tight">Security update will terminate active sessions.</p>
                                <button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all">
                                    {saving ? 'Forging Key...' : 'Sync Security Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const InputGroup = ({ label, value, onChange, type = 'text', placeholder = '', isDark }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.15em] block px-1" 
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
            className="w-full rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all font-bold placeholder:opacity-30 border"
            style={{ 
                background: isDark ? '#0f172a' : '#f1f5f9', 
                color: isDark ? '#f1f5f9' : '#020617',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(20,184,166,0.15)',
                boxShadow: isDark ? 'none' : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
            }} 
            placeholder={placeholder || `Enter ${label}`} />
    </div>
);

export default SettingsPage;