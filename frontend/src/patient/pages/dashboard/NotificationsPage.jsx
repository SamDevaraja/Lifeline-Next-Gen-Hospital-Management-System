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




const NotificationsPage = () => {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api.get('notifications/')
            .then(r => setNotifs(r.data))
            .catch(() => setNotifs([]))
            .finally(() => setLoading(false));
    }, []);

    const markAllRead = async () => {
        try {
            setNotifs(p => p.map(n => ({ ...n, is_read: true })));
            window.dispatchEvent(new Event('notifications_read_all'));
            await api.post('notifications/mark_all_read/');
            toast.success('All notifications marked as read', { style: { background: LUNA.dark, color: LUNA.success_text } });
        } catch (_e) { toast.error('Failed to update notifications'); }
    };

    const markSingleRead = async (id) => {
        const target = notifs.find(n => n.id === id);
        if (!target || target.is_read) return;
        try {
            // Optimistic update flawlessly bypasses network lag
            setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
            window.dispatchEvent(new Event('notifications_read_single'));
            await api.post(`notifications/${id}/mark_read/`);
        } catch (_e) { }
    };

    const filtered = notifs.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'ai') return n.notification_type === 'ai_alert';
        if (filter === 'system') return n.notification_type === 'system';
        return true;
    });

    const unreadCount = notifs.filter(n => !n.is_read).length;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-8 rounded-[2rem] border shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                {/* Decorative Gradients */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-500 to-teal-400 opacity-[0.08] blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-[0.06] blur-[60px] rounded-full pointer-events-none" />

                <div className="z-10 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-sm border" style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)' }}>
                        <Bell className="w-7 h-7 text-blue-500" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                            System Notifications
                        </h1>
                        <p className="text-[15px] font-medium mt-1.5" style={{ color: 'var(--luna-text-dim)' }}>
                            View and manage your recent clinical alerts, messages, and situational updates.
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="z-10 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap" style={{ background: 'var(--luna-blue)' }}>
                        <CheckCircle className="w-4 h-4" /> Mark All as Read ({unreadCount})
                    </button>
                )}
            </div>

            {/* Premium Interactive Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {[
                    { id: 'all', label: 'All Notifications' },
                    { id: 'unread', label: `Unread (${unreadCount})` },
                    { id: 'ai', label: 'AI Alerts' },
                    { id: 'system', label: 'System Modules' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-6 py-3 rounded-[1rem] text-sm font-bold transition-all duration-300 ${filter === tab.id ? 'shadow-lg shadow-blue-500/15 translate-y-0 scale-105' : 'opacity-70 hover:opacity-100 hover:shadow-md hover:-translate-y-0.5'}`}
                        style={{
                            background: filter === tab.id ? 'var(--luna-blue)' : 'var(--luna-card)',
                            color: filter === tab.id ? '#ffffff' : 'var(--luna-text-muted)',
                            border: filter === tab.id ? '1px solid transparent' : '1px solid var(--luna-border)'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4 relative z-10">
                <AnimatePresence>
                    {loading ? <div className="p-20 flex flex-col items-center justify-center text-center text-sm font-bold uppercase tracking-widest text-blue-500 animate-pulse"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" /> Synchronizing...</div> :
                        filtered.length > 0 ? filtered.map((n, i) => {
                            let baseColor = { appointment: LUNA.teal, ai_alert: '#ec4899', payment: '#10b981', system: LUNA.steel, message: '#6366f1' }[n.notification_type] || LUNA.steel;
                            let customIcon = { appointment: <Calendar className="w-6 h-6" />, payment: <DollarSign className="w-6 h-6" />, ai_alert: <BrainCircuit className="w-6 h-6" />, system: <Settings className="w-6 h-6" />, message: <FileText className="w-6 h-6" /> }[n.notification_type];

                            const tLower = n.title?.toLowerCase() || '';
                            if (tLower.includes('critical') || tLower.includes('escalate') || tLower.includes('escalation')) { baseColor = '#ef4444'; customIcon = <AlertCircle className="w-6 h-6" />; }
                            else if (tLower.includes('prescription')) { baseColor = '#6366f1'; customIcon = <Pill className="w-6 h-6" />; }
                            else if (tLower.includes('telemedicine')) { baseColor = '#8b5cf6'; customIcon = <Video className="w-6 h-6" />; }
                            else if (tLower.includes('admittance') || tLower.includes('registration')) { baseColor = '#3b82f6'; customIcon = <User className="w-6 h-6" />; }
                            else if (tLower.includes('inventory')) { baseColor = '#f59e0b'; customIcon = <AlertCircle className="w-6 h-6" />; }

                            return (
                                <motion.div
                                    key={n.id || i}
                                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="relative overflow-hidden rounded-[1.5rem] border transition-all duration-300 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] cursor-pointer group hover:-translate-y-1"
                                    style={{
                                        background: !n.is_read ? 'var(--luna-bg)' : 'var(--luna-card)',
                                        borderColor: !n.is_read ? baseColor + '60' : 'var(--luna-border)',
                                        boxShadow: !n.is_read ? `0 10px 30px ${baseColor}15` : 'none'
                                    }}
                                    onClick={() => markSingleRead(n.id)}
                                >
                                    {/* Unread Accent Bar */}
                                    {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: `linear-gradient(180deg, ${baseColor}, ${baseColor}80)` }} />}

                                    <div className="p-6 sm:p-7 flex items-start gap-5 sm:gap-7 relative z-10 pl-7 sm:pl-10">
                                        {/* Neumorphic/Glassmorphic Icon Container */}
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1rem] flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-transform duration-500 group-hover:scale-110 shadow-inner border"
                                            style={{
                                                background: `linear-gradient(135deg, ${baseColor}15 0%, ${baseColor}25 100%)`,
                                                color: baseColor,
                                                borderColor: `${baseColor}40`
                                            }}>
                                            <div className="absolute inset-0 bg-white/50 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {customIcon || <Bell className="w-6 h-6" />}
                                        </div>

                                        {/* Content Block */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <h3 className={`font-extrabold text-lg sm:text-xl tracking-tight transition-colors duration-300`} style={{ color: !n.is_read ? 'var(--luna-text-main)' : 'var(--luna-text-dim)' }}>
                                                    {n.title}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    {!n.is_read && (
                                                        <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm" style={{ background: baseColor, color: '#fff' }}>New Alert</span>
                                                    )}
                                                    <p className="text-xs font-bold opacity-70 whitespace-nowrap uppercase tracking-wider" style={{ color: 'var(--luna-text-dim)' }}>
                                                        {new Date(n.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-[15px] font-medium leading-relaxed transition-colors duration-300" style={{ color: !n.is_read ? 'var(--luna-text-main)' : 'var(--luna-text-muted)', opacity: !n.is_read ? 1 : 0.85 }}>
                                                {n.message}
                                            </p>

                                            {/* Vivid Tags */}
                                            <div className="mt-5 flex flex-wrap gap-2.5">
                                                {n.notification_type === 'ai_alert' && (
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-pink-500/10 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400 border-pink-500/20">
                                                        <Sparkles className="w-3.5 h-3.5" /> AI Diagnostic
                                                    </div>
                                                )}
                                                {n.notification_type === 'appointment' && (
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border-sky-500/20">
                                                        <Calendar className="w-3.5 h-3.5" /> Appointment Event
                                                    </div>
                                                )}
                                                {n.notification_type === 'payment' && (
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                                                        <DollarSign className="w-3.5 h-3.5" /> Billing Advisory
                                                    </div>
                                                )}
                                                {tLower.includes('critical') && (
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20">
                                                        <AlertCircle className="w-3.5 h-3.5" /> CRITICAL PRIORITY
                                                    </div>
                                                )}
                                                {tLower.includes('inventory') && (
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Logistics Protocol
                                                    </div>
                                                )}
                                                {tLower.includes('prescription') && (
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/20">
                                                        <Pill className="w-3.5 h-3.5" /> Medical Vault
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-20 flex flex-col items-center justify-center rounded-[2.5rem] border shadow-[0_8px_30px_rgb(0,0,0,0.04)]" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-bg)' }}>
                                    <CheckCircle className="w-10 h-10 text-blue-500" strokeWidth={2.5} />
                                </div>

                                <p className="font-extrabold text-2xl mb-3 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>You're All Caught Up!</p>
                                <p className="text-[15px] font-medium text-center max-w-md" style={{ color: 'var(--luna-text-dim)' }}>Your notification buffer is totally clear. We'll instantly alert you if anything new requires your attention.</p>
                            </motion.div>
                        )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// ── Reports Page ──

export default NotificationsPage;
