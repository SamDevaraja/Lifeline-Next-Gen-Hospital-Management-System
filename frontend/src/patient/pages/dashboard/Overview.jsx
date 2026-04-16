import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, ShieldCheck
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../../i18n/index.js';
import { LUNA } from "./Constants";




const Overview = ({ user }) => {
    const role = (user?.role || '').toLowerCase();
    if (role === 'patient') return <PatientOverview user={user} />;
    if (role === 'doctor') return <DoctorOverview user={user} />;
    if (role === 'admin' || role === 'administrator') return <AdminOverview />;
    return <StaffOverview user={user} />;
};


// ── Doctor Overview ──
const DoctorOverview = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res, apps] = await Promise.all([
                api.get(`/dashboard/stats/`),
                api.get(`/appointments/?doctor_id=${user.doctor_id}`)
            ]);
            setStats({ ...res.data, myAppointments: apps.data.slice(0, 5) });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, [user.doctor_id]);

    const handleStartCall = async (apptId, currentLink) => {
        if (!currentLink) {
            const newLink = window.prompt("Enter Google Meet Link (e.g., https://meet.google.com/abc-xyz):");
            if (!newLink) return;

            try {
                toast.loading("Attaching secure Meet link...", { id: 'meet' });
                await api.patch(`/appointments/${apptId}/`, { meeting_link: newLink });
                toast.success("Google Meet Link Attached!", { id: 'meet' });
                fetchData();
                window.open(newLink, '_blank');
            } catch (err) {
                toast.error("Failed to attach link.", { id: 'meet' });
            }
        } else {
            window.open(currentLink, '_blank');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Clinical Workspace</h1>
                    <p className="font-bold text-sm mt-1" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Welcome back, Dr. {user.last_name}</p>
                </div>
                <div className="badge-live scale-90">Dept: {user.department}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                    { label: 'My Patients', value: stats?.total_patients || 0, icon: <Users className="w-5 h-5" />, color: LUNA.teal },
                    { label: 'Today Sched', value: stats?.today_appointments || 0, icon: <Calendar className="w-5 h-5" />, color: '#6366f1' },
                    { label: 'Ward Occupancy', value: stats?.ward_occupancy || 'Optimal', icon: <Stethoscope className="w-5 h-5" />, color: '#f59e0b' },
                ].map((s, i) => (
                    <div key={i} className="card-clinical p-6 flex flex-col justify-between group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl" style={{ background: s.color + '15', color: s.color }}>{s.icon}</div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                            <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card shadow-2xl" style={{ border: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                    <h2 className="font-extrabold text-lg mb-6" style={{ color: 'var(--luna-text-main)' }}>Upcoming Consultations</h2>
                    <div className="space-y-3">
                        {loading ? <div className="animate-shimmer h-20 rounded-xl" /> :
                            stats?.myAppointments?.length > 0 ? stats.myAppointments.map((a, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-8 h-8">{a.patientName[0]}</div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--luna-text-main)' }}>{a.patientName}</p>
                                            <p className="text-[10px] font-bold" style={{ color: 'var(--luna-text-muted)' }}>{a.appointment_time}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStartCall(a.id, a.meeting_link)}
                                        className="btn-teal text-[10px] px-3 py-1.5"
                                    >
                                        {a.meeting_link ? 'Join Meet' : 'Add Meet'}
                                    </button>
                                </div>
                            )) : <p className="text-sm italic" style={{ color: 'var(--luna-text-muted)' }}>No appointments scheduled for today.</p>}
                    </div>
                </div>
                <div className="card shadow-sm flex flex-col items-center justify-center text-center p-10" style={{ border: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                    <ShieldCheck className="w-12 h-12 text-teal-400 mb-4 animate-pulse" />
                    <h2 className="text-lg font-black" style={{ color: 'var(--luna-text-main)' }}>Secured Institutional Protocol</h2>
                    <p className="text-[13px] font-bold mt-3 uppercase tracking-tighter max-w-[200px]" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>Manual physician-led clinical review system is locked and synchronized.</p>
                </div>
            </div>
        </motion.div>
    );
};

// ── Patient Overview ──
const PatientOverview = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apps, bills] = await Promise.all([
                    api.get(`/appointments/?patient_id=${user.patient_id}`),
                    api.get(`/bills/?patient_id=${user.patient_id}`)
                ]);
                setStats({ appointments: apps.data, bills: bills.data });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user.patient_id]);

    const unpaidBills = stats?.bills?.filter(b => b.status === 'pending') || [];
    const nextApp = stats?.appointments?.find(a => a.status === 'confirmed');

    const statusBadges = [
        { label: 'Health Status', value: 'Active', color: 'var(--luna-teal)' },
        { label: 'Next Appointment', value: nextApp ? nextApp.appointment_date : 'None', color: 'var(--luna-blue)' },
        { label: 'Due Amount', value: `₹${unpaidBills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0).toLocaleString()}`, color: 'var(--luna-danger-text)' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-10 pb-20 px-4">
            {/* Header: CLEAN & MINIMAL (NOTIFICATION STYLE) */}
            <header className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        My Health Dashboard
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                            Patient ID: <span style={{ color: 'var(--luna-teal)' }}>LFLN-{user.patient_id?.toString().padStart(5, '0')}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Live Connection Stable</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {statusBadges.map((s, i) => (
                        <div key={i} className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">{s.label}</span>
                            <span className="text-[11px] font-black uppercase tracking-wider font-mono" style={{ color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Content Feed */}
            <main className="space-y-10">
                {/* 1. Important Updates & Actions */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-6 flex items-center gap-2">
                        <Bell className="w-3 h-3" /> Recent Updates & Actions
                    </h2>
                    
                    <div className="space-y-px border rounded-2xl overflow-hidden shadow-2xl" 
                         style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        
                        {/* Appointment Item */}
                        <div onClick={() => navigate('/patient/dashboard/appointments')}
                             className="group p-5 flex items-center justify-between border-b cursor-pointer transition-all hover:bg-white/[0.02]"
                             style={{ borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-5">
                                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 shadow-inner group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-teal-500/30 text-teal-500 bg-teal-500/5">Appointment</span>
                                        <h3 className="text-sm font-bold" style={{ color: 'var(--luna-text-main)' }}>Upcoming Doctor Visit</h3>
                                    </div>
                                    <p className="text-xs font-bold opacity-60 max-w-md" style={{ color: 'var(--luna-text-muted)' }}>
                                        {nextApp ? `Your visit with Dr. ${nextApp.doctor_name || nextApp.doctorName} is confirmed.` : 'No upcoming doctor visits scheduled.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                                <span className="text-[10px] font-black font-mono opacity-40">{nextApp?.appointment_date || 'N/A'}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-muted)' }}>View Details</span>
                            </div>
                        </div>

                        {/* Financial Item */}
                        <div onClick={() => navigate('/patient/dashboard/billing')}
                             className="group p-5 flex items-center justify-between border-b cursor-pointer transition-all hover:bg-white/[0.02]"
                             style={{ borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-5">
                                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shadow-inner group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-rose-500/30 text-rose-500 bg-rose-500/5">Billing</span>
                                        <h3 className="text-sm font-bold" style={{ color: 'var(--luna-text-main)' }}>Outstanding Bills</h3>
                                    </div>
                                    <p className="text-xs font-bold opacity-60 max-w-md" style={{ color: 'var(--luna-text-muted)' }}>
                                        {unpaidBills.length > 0 ? `You have ${unpaidBills.length} unpaid medical bills.` : 'All your medical bills have been cleared.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                                <span className="text-[10px] font-black font-mono text-rose-500">₹{unpaidBills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0).toLocaleString()}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-muted)' }}>Pay Now</span>
                            </div>
                        </div>

                        {/* Telemedicine Item */}
                        <div onClick={() => navigate('/patient/dashboard/telemedicine')}
                             className="group p-5 flex items-center justify-between cursor-pointer transition-all hover:bg-white/[0.02]">
                            <div className="flex items-center gap-5">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner group-hover:scale-110 transition-transform">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-indigo-500/30 text-indigo-500 bg-indigo-500/5">Virtual Visit</span>
                                        <h3 className="text-sm font-bold" style={{ color: 'var(--luna-text-main)' }}>Video Consultation</h3>
                                    </div>
                                    <p className="text-xs font-bold opacity-60 max-w-md" style={{ color: 'var(--luna-text-muted)' }}>
                                        Connect with your doctor via secure video call.
                                    </p>
                                </div>
                            </div>
                            <button className="text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all hover:bg-[var(--luna-blue)] hover:text-white" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-muted)' }}>Launch Call</button>
                        </div>
                    </div>
                </section>

                {/* 2. Medical Visit History (ENHANCED UI) */}
                <section className="space-y-6 pt-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] opacity-50">
                                Recent Medical History
                            </h2>
                        </div>
                        <Link to="/patient/dashboard/records" 
                              className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all hover:bg-white/[0.05]"
                              style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-dim)' }}>
                            View Full Archive
                        </Link>
                    </div>
                    
                    <div className="shadow-2xl rounded-[2rem] overflow-hidden border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] uppercase font-black tracking-[0.25em]" 
                                        style={{ color: 'var(--luna-text-muted)', background: 'var(--luna-navy)' }}>
                                        <th className="p-6 pl-10 border-b" style={{ borderColor: 'var(--luna-border)' }}>Date & Time</th>
                                        <th className="p-6 border-b" style={{ borderColor: 'var(--luna-border)' }}>Attending Doctor</th>
                                        <th className="p-6 border-b" style={{ borderColor: 'var(--luna-border)' }}>Service Type</th>
                                        <th className="p-6 text-right pr-10 border-b" style={{ borderColor: 'var(--luna-border)' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats?.appointments || []).slice(0, 4).map((a, i) => (
                                        <tr key={i} className="group transition-all hover:bg-white/[0.01]" style={{ borderColor: 'var(--luna-border)' }}>
                                            <td className="p-6 pl-10 border-b group-last:border-none" style={{ borderColor: 'var(--luna-border)' }}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg border flex items-center justify-center bg-white/[0.02] opacity-40 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--luna-border)' }}>
                                                        <Activity className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black font-mono leading-none" style={{ color: 'var(--luna-text-main)' }}>{a.appointment_date}</p>
                                                        <p className="text-[9px] font-bold opacity-30 uppercase mt-1 tracking-wider">{a.appointment_time || 'General Session'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 border-b group-last:border-none" style={{ borderColor: 'var(--luna-border)' }}>
                                                <p className="text-xs font-black uppercase tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                                    {a.doctor_name || `DR. ${a.doctorName || 'UNASSIGNED'}`}
                                                </p>
                                                <p className="text-[9px] font-bold opacity-30 uppercase mt-1 tracking-wider">Medical Consultant</p>
                                            </td>
                                            <td className="p-6 border-b group-last:border-none" style={{ borderColor: 'var(--luna-border)' }}>
                                                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border bg-indigo-500/5 text-indigo-400" style={{ borderColor: 'var(--luna-border)' }}>
                                                    Examination
                                                </span>
                                            </td>
                                            <td className="p-6 pr-10 text-right border-b group-last:border-none" style={{ borderColor: 'var(--luna-border)' }}>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${a.status === 'confirmed' ? 'text-teal-500 bg-teal-500/5 border-teal-500/30' : 'text-amber-500 bg-amber-500/5 border-amber-500/30'}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

// ── Admin Overview Component ──
const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [res, bills] = await Promise.all([
                    api.get('/dashboard/stats/'),
                    api.get('/bills/')
                ]);
                setStats({ ...res.data, recentBills: bills.data.slice(0, 5) });
            } catch (err) {
                console.error("Failed to fetch dash stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = stats ? [
        { label: 'Total Doctors', value: stats.total_doctors, icon: <Stethoscope className="w-6 h-6" />, color: LUNA.info_text, bg: LUNA.info_bg },
        { label: 'Active Patients', value: stats.total_patients, icon: <HeartPulse className="w-6 h-6" />, color: LUNA.blue, bg: LUNA.info_bg },
        { label: 'Today Sched', value: stats.today_appointments, icon: <Calendar className="w-6 h-6" />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
        { label: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: LUNA.success_text, bg: LUNA.success_bg },
    ] : [];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Hospital Pulse</h1>
                <p className="font-semibold text-xs mt-1" style={{ color: 'var(--luna-text-muted)' }}>Real-time clinical operations database</p>
            </div>

            {loading ? <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="animate-shimmer h-32 rounded-2xl" />)}</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {statCards.map((s, i) => (
                        <div key={i} className="card-clinical p-6 flex flex-col justify-between group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 rounded-xl shadow-sm transition-transform group-hover:scale-110" style={{ background: s.bg, color: s.color }}>
                                    {React.cloneElement(s.icon, { className: 'w-5 h-5' })}
                                </div>
                                <div className="badge-live scale-90">Live</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                                <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card shadow-2xl" style={{ border: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                    <h2 className="font-extrabold text-lg mb-6" style={{ color: 'var(--luna-text-main)' }}>Recent Billing Activity</h2>
                    {loading ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="animate-shimmer h-16 rounded-xl" />)}</div> :
                        stats?.recentBills?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentBills.map((b, i) => (
                                    <div key={i} className="flex items-start justify-between p-3 rounded-xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}><Activity className="w-4 h-4 text-teal-600" /></div>
                                            <div>
                                                <p className="font-bold text-sm" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name} - Inv {b.invoice_number}</p>
                                                <p className="text-[10px] font-bold uppercase" style={{ color: b.status === 'paid' ? LUNA.success_text : LUNA.warn_text }}>{b.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-extrabold" style={{ color: 'var(--luna-text-main)' }}>₹{parseFloat(b.total_amount).toLocaleString()}</p>
                                            <span className="text-[10px] font-bold" style={{ color: 'var(--luna-text-muted)' }}>{b.bill_date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm italic" style={{ color: 'var(--luna-text-muted)' }}>No recent activity.</p>}
                </div>

                <div className="card shadow-sm" style={{ border: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                    <Activity className="w-16 h-16 text-blue-400 opacity-20 mb-4" />
                    <h2 className="text-lg font-bold" style={{ color: 'var(--luna-text-main)' }}>Clinical Operations</h2>
                    <p className="text-sm mt-3 leading-relaxed max-w-xs uppercase tracking-wider opacity-50" style={{ color: 'var(--luna-text-muted)' }}>Real-time institutional resource monitoring active.</p>
                </div>
            </div>
        </motion.div>
    );
};


// ── Staff Overview (Nurse, Receptionist, Pharmacist) ──
const StaffOverview = ({ user }) => {
    const roleMap = {
        receptionist: { title: 'Reception Desk', sub: 'Patient registration & scheduling operations', icon: <Users className="w-16 h-16 text-teal-500 opacity-20" /> },
        pharmacist: { title: 'Pharmacy Terminal', sub: 'Inventory management & prescription dispensing', icon: <Pill className="w-16 h-16 text-blue-500 opacity-20" /> },
        nurse: { title: 'Nurse Station', sub: 'Vitals logging & clinical record tracking', icon: <HeartPulse className="w-16 h-16 text-rose-500 opacity-20" /> },
        lab_technician: { title: 'Lab Terminal', sub: 'Diagnostic testing & reporting operations', icon: <FlaskConical className="w-16 h-16 text-purple-500 opacity-20" /> },
        billing_staff: { title: 'Billing Desk', sub: 'Financial operations & invoice management', icon: <DollarSign className="w-16 h-16 text-emerald-500 opacity-20" /> },
    };
    
    const roleProps = roleMap[user?.role] || { title: 'Staff Portal', sub: 'Hospital workspace interface' };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-black tracking-tight capitalize" style={{ color: 'var(--luna-text-main)' }}>{roleProps.title}</h1>
                <p className="font-semibold text-xs mt-1" style={{ color: 'var(--luna-text-muted)' }}>{roleProps.sub}</p>
            </div>

            <div className="card shadow-sm relative overflow-hidden" style={{ border: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="relative z-10 py-16 px-10">
                    <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--luna-text-main)' }}>Welcome, {user?.username}</h2>
                    <p className="text-[15px] font-bold opacity-80 max-w-lg leading-relaxed" style={{ color: 'var(--luna-text-muted)' }}>
                        Your role determines your access envelope via our strict zero-trust architecture. Use the sidebar navigation to access your designated modules.
                    </p>
                    <div className="mt-8">
                        <span className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg bg-indigo-500">
                            Session Active • Role: {user?.role}
                        </span>
                    </div>
                </div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                    {roleProps.icon}
                </div>
            </div>
        </motion.div>
    );
};




export default Overview;
