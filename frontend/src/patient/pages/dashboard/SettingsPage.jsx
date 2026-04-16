import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, ShieldCheck, CheckCircle, User, Lock, Mail, Smartphone, MapPin, ChevronDown, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        symptoms: '',
        new_password: '',
        confirm_password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                username: user?.username || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || '',
                bio: user?.bio || '',
                symptoms: user?.symptoms || '',
                new_password: '',
                confirm_password: '',
            });
        }
    }, [user]);

    const [saving, setSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        const passwordChanged = !!formData.new_password;

        if (passwordChanged && formData.new_password !== formData.confirm_password) {
            toast.error('Passwords do not match. Please verify and try again.');
            return;
        }

        setSaving(true);
        try {
            await api.patch('/me/', formData);
            if (onUpdate) await onUpdate();
            
            if (passwordChanged) {
                setShowSuccessModal(true);
            } else {
                toast.success('Profile updated successfully');
            }
            
            // Clear passwords after successful update
            setFormData(prev => ({ ...prev, new_password: '', confirm_password: '' }));
        } catch (err) {
            const msg = err.response?.data?.error || 'Error saving changes. Please check your network.';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const isDoctor = user?.role === 'doctor' || user?.is_staff;
    const isPatient = user?.role === 'patient';

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-7xl mx-auto px-4 pt-2 pb-6">
            <Toaster position="top-right" />
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccessModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[var(--luna-card)] rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-[var(--luna-border)] text-center">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--luna-text-main)' }}>Security Updated</h2>
                            <p className="text-xs font-bold leading-relaxed opacity-60 mb-8" style={{ color: 'var(--luna-text-main)' }}>
                                Your access credentials have been successfully updated across all Lifeline systems. Use your new password for your next session.
                            </p>
                            <button onClick={() => setShowSuccessModal(false)} className="w-full btn-teal py-3 font-black uppercase tracking-widest text-[10px]">
                                Continue to Dashboard
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Account Settings</h1>
                <p className="font-bold text-[9px] uppercase tracking-[0.15em] opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Profile & Security Management</p>
            </div>

            <div className="w-full max-w-4xl mx-auto">
                <div className="space-y-4">
                    <div className="card-clinical p-6 md:p-7 border shadow-xl relative overflow-hidden" 
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', borderRadius: '2rem' }}>
                        
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                            <Activity className="w-32 h-32" />
                        </div>

                        <h2 className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-teal-400">Personal Information</h2>
                        <form onSubmit={handleUpdate} className="space-y-3.5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">First Name</label>
                                    <div className="relative">
                                        <input value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="input !py-3 !pl-10 !px-4 w-full" />
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Last Name</label>
                                    <div className="relative">
                                        <input value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="input !py-3 !pl-10 !px-4 w-full" />
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Email Address</label>
                                    <div className="relative">
                                        <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input !py-3 !pl-10 !px-4 w-full" />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Phone Number</label>
                                    <div className="relative">
                                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input !py-3 !pl-10 !px-4 w-full" placeholder="+91 XXXX XXX XXX" />
                                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Physical Address</label>
                                <div className="relative">
                                    <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input !py-3 !pl-10 !px-4 w-full" placeholder="Enter full residence/facility address" />
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                </div>
                            </div>

                            {(isDoctor || isPatient) && (
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                        {isDoctor ? 'Professional Bio' : 'Current Symptoms'}
                                    </label>
                                    <textarea
                                        value={isDoctor ? formData.bio : formData.symptoms}
                                        onChange={e => setFormData({ ...formData, [isDoctor ? 'bio' : 'symptoms']: e.target.value })}
                                        className="input !py-3 !px-4 min-h-[100px]"
                                        placeholder={isDoctor ? 'Describe your clinical expertise...' : 'Describe your current health conditions...'}
                                    />
                                </div>
                            )}

                            {/* Account Security Section */}
                            <div className="pt-5 border-t border-white/5 space-y-4">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Account Security</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Username</label>
                                        <div className="relative">
                                            <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="input !py-3 !pl-10 !px-4 w-full" placeholder="Enter your username" />
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">New Password</label>
                                        <div className="relative">
                                            <input 
                                                type="password"
                                                value={formData.new_password} 
                                                onChange={e => setFormData({ ...formData, new_password: e.target.value })} 
                                                className="input !py-3 !pl-10 !px-4 w-full"
                                                placeholder="••••••••" 
                                            />
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Confirm Password</label>
                                        <div className="relative">
                                            <input 
                                                type="password"
                                                value={formData.confirm_password} 
                                                onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} 
                                                className="input !py-3 !pl-10 !px-4 w-full"
                                                placeholder="••••••••" 
                                            />
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed opacity-50">
                                    Security Note: Passwords must be at least 8 characters long for your protection.
                                </p>
                            </div>

                            <div className="pt-6 flex justify-end border-t border-white/5">
                                <button type="submit" disabled={saving} className="btn-teal w-full sm:w-auto px-12 py-4 text-[10px] rounded-2xl font-black uppercase tracking-[0.15em] active:scale-95 transition-all shadow-2xl">
                                    {saving ? 'Synchronizing...' : 'Save All Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SettingsPage;
