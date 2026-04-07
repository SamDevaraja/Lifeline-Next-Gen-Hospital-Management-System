import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/index.js';
import { LUNA } from "./Constants";




const SettingsPage = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        symptoms: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || '',
                bio: user?.bio || '',
                symptoms: user?.symptoms || '',
            });
        }
    }, [user]);

    const [saving, setSaving] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/me/', formData);
            if (onUpdate) await onUpdate();
            toast.success('Clinical parameters synchronized');
        } catch (err) {
            toast.error('Sync failed: Interrupted connection');
        } finally {
            setSaving(false);
        }
    };

    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'patient';

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>System Settings</h1>
                    <p className="font-semibold text-[10px] mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Security & Identity Protocol</p>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <div className="space-y-5">
                    <div className="card-clinical p-5">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-teal-400">Core Identity</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">First Name</label>
                                    <input value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="input !py-2.5 !px-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Last Name</label>
                                    <input value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="input !py-2.5 !px-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Email Identifier</label>
                                    <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input !py-2.5 !px-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Secure Phone</label>
                                    <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input !py-2.5 !px-4" placeholder="+91 XXXX XXX XXX" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Physical Address</label>
                                <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input !py-2.5 !px-4" placeholder="Enter full residence/facility address" />
                            </div>

                            {(isDoctor || isPatient) && (
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                        {isDoctor ? 'Professional Bio' : 'Current Symptoms'}
                                    </label>
                                    <textarea
                                        value={isDoctor ? formData.bio : formData.symptoms}
                                        onChange={e => setFormData({ ...formData, [isDoctor ? 'bio' : 'symptoms']: e.target.value })}
                                        className="input !py-2.5 !px-4 min-h-[80px]"
                                        placeholder={isDoctor ? 'Describe your clinical expertise...' : 'Describe your current health conditions...'}
                                    />
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Database Sync Ready</span>
                                </div>
                                <button type="submit" disabled={saving} className="btn-teal px-6 py-2.5 text-xs">
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
