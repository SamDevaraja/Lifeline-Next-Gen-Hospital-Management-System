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




const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-indigo-950/20 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border relative z-10"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="p-8">
                    <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner`} style={{ background: type === 'danger' ? LUNA.danger_bg : LUNA.info_bg, color: type === 'danger' ? LUNA.danger_text : LUNA.info_text, borderColor: type === 'danger' ? LUNA.danger_bg : LUNA.info_bg }}>
                            {type === 'danger' ? <AlertCircle className="w-7 h-7" /> : <CheckCircle className="w-7 h-7" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black tracking-tight mb-2" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                            <p className="text-[15px] font-bold leading-relaxed" style={{ color: 'var(--luna-text-main)', opacity: 0.85 }}>{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-8 pt-0">
                    <button onClick={onCancel} className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black/5" style={{ color: 'var(--luna-text-muted)' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-xl active:scale-95`}
                        style={{ background: type === 'danger' ? LUNA.danger_text : LUNA.info_text }}>
                        {type === 'danger' ? 'Archive Record' : 'Confirm'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ── Input Modal ──
const InputModal = ({ isOpen, title, fields, onConfirm, onCancel }) => {
    const [values, setValues] = useState({});

    useEffect(() => {
        if (isOpen) {
            const initial = {};
            fields.forEach(f => initial[f.key] = f.initialValue || '');
            // eslint-disable-next-line
            setValues(initial);
        }
    }, [isOpen, fields]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-indigo-950/20 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border relative z-10 flex flex-col"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="px-8 py-6 border-b flex items-center justify-between shadow-sm relative z-20" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] to-transparent pointer-events-none" />
                    <div>
                        <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: LUNA.teal }} />
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50" style={{ color: 'var(--luna-text-main)' }}>Clinical Parameter Adjustment Protocol</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2.5 hover:bg-black/5 rounded-xl transition-all border border-transparent hover:border-indigo-500/10 shadow-sm relative z-10">
                        <X className="w-5 h-5 opacity-50" />
                    </button>
                </div>
                <div className="p-8 relative z-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                        {fields.map(f => (
                            <div key={f.key} className={`space-y-1 group ${f.fullWidth ? 'md:col-span-2' : ''}`}>
                                <label className="block text-[12px] font-black mb-2 opacity-75 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>{f.label}</label>
                                <div className="relative">
                                    {f.type === 'select' ? (
                                        <select
                                            value={values[f.key] || ''}
                                            onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            disabled={f.disabled}
                                            className={`input !text-sm !font-bold w-full !bg-button border-none appearance-none ${f.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="" disabled>Select {f.label}</option>
                                            {f.options?.map(opt => (
                                                <option key={opt.value} value={opt.value} className="font-bold">{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={f.type || 'text'}
                                            value={values[f.key] || ''}
                                            onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder}
                                            autoFocus={f.autoFocus}
                                            disabled={f.disabled}
                                            className={`input !text-sm !font-bold w-full !bg-button border-none ${f.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-end gap-4 p-8 pt-2 relative z-20">
                    <button onClick={onCancel} className="px-6 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all hover:bg-black/5" style={{ color: 'var(--luna-text-main)' }}>
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(values)} className="px-8 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest text-white transition-all bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 active:scale-95">
                        Commit Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


const DetailsModal = ({ isOpen, title, data, onCancel }) => {
    if (!isOpen || !data) return null;

    const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const formatValue = (key, val) => {
        if (val === null || val === undefined || val === '') return <span className="text-slate-400 italic font-medium">Not available</span>;
        if (key === 'created_at' || key === 'updated_at') return new Date(val).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        if (key === 'consultation_fee' || key.includes('amount')) return `INR ${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        if (key === 'experience_years') return `${val} years of practice`;
        return String(val);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-indigo-950/20 backdrop-blur-xl" />
                <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                    className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border relative z-10 flex flex-col"
                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>

                    <div className="px-8 py-6 border-b flex items-center justify-between shadow-sm relative z-20" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/[0.03] to-transparent pointer-events-none" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border transition-transform hover:scale-105 duration-500" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-teal)' }}>
                                <FileText className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                    <p className="text-[10px] uppercase font-black tracking-[0.25em] opacity-50" style={{ color: 'var(--luna-text-main)' }}>Institutional Health Record 00-41X</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onCancel} className="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95" style={{ background: 'var(--luna-navy)', border: '1px solid var(--luna-border)', color: 'var(--luna-text-muted)' }}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-0 overflow-y-auto custom-scrollbar relative z-10" style={{ maxHeight: '65vh' }}>
                        <div className="grid grid-cols-1">
                            {Object.entries(data).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) return null;
                                if (['id', 'user', 'profile_pic', 'status', 'is_deleted'].includes(key)) return null;

                                return (
                                    <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 px-8 py-5 hover:bg-slate-500/5 transition-all duration-300" style={{ borderBottom: '1px solid var(--luna-border)' }}>
                                        <div className="sm:w-1/3 flex-shrink-0">
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50" style={{ color: 'var(--luna-text-muted)' }}>{formatLabel(key)}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold leading-relaxed tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                                {formatValue(key, value)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};



export { ConfirmModal, InputModal, DetailsModal };
