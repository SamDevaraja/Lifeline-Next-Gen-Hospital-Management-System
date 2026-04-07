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
                api.get(`/appointments/?doctor_id=${user.id}`)
            ]);
            setStats({ ...res.data, myAppointments: apps.data.slice(0, 5) });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, [user.id]);

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
                    { label: 'AI Review Ready', value: stats?.ai_diagnoses_today || 0, icon: <BrainCircuit className="w-5 h-5" />, color: '#f59e0b' },
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
                    api.get(`/appointments/?patient_id=${user.id}`),
                    api.get(`/bills/?patient_id=${user.id}`)
                ]);
                setStats({ appointments: apps.data, bills: bills.data });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user.id]);

    const unpaidBills = stats?.bills?.filter(b => b.status === 'pending') || [];
    const nextApp = stats?.appointments?.find(a => a.status === 'confirmed');


    const quickActions = [
        { label: 'Book Consult', icon: <Plus className="w-4 h-4" />, path: '/patient/dashboard/appointments', color: 'text-blue-500 bg-blue-500/10' },
        { label: 'My Records', icon: <FileText className="w-4 h-4" />, path: '/patient/dashboard/records', color: 'text-teal-500 bg-teal-500/10' },
        { label: 'Lab Diagnostics', icon: <Activity className="w-4 h-4" />, path: '/patient/dashboard/lab', color: 'text-indigo-500 bg-indigo-500/10' },
        { label: 'Pay Bills', icon: <DollarSign className="w-4 h-4" />, path: '/patient/dashboard/billing', color: 'text-emerald-500 bg-emerald-500/10' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto w-full pb-10 space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--luna-border)' }}>
                <div>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        Welcome back, {user.first_name || 'Patient'}
                    </h1>
                    <p className="font-bold text-sm mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                        Clinical Data Sync & Patient Hub
                    </p>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-teal-500 bg-teal-500/10">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>Next Appt</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black tracking-tight truncate" style={{ color: 'var(--luna-text-main)' }}>{nextApp ? nextApp.appointment_date : 'None Scheduled'}</p>
                        <p className="text-xs font-bold text-teal-500 mt-1">{nextApp ? nextApp.appointment_time : 'Clear calendar'}</p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 bg-rose-500/10">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>Due Balance</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black tracking-tight truncate" style={{ color: 'var(--luna-text-main)' }}>₹{unpaidBills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0).toLocaleString()}</p>
                        <p className="text-xs font-bold text-rose-500 mt-1">{unpaidBills.length} pending</p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-500 bg-indigo-500/10">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        {quickActions.map((action, i) => (
                            <button
                                key={i} onClick={() => navigate(action.path)}
                                className="flex items-center gap-2 justify-center py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all hover:bg-white/5"
                                style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Clinical Vitals Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'Optimal', icon: <Activity className="w-4 h-4" />, color: 'text-emerald-500' },
                    { label: 'Heart Rate', value: '72', unit: 'BPM', status: 'Resting', icon: <HeartPulse className="w-4 h-4" />, color: 'text-rose-500' },
                    { label: 'Oxygen Saturation', value: '98', unit: '%', status: 'Normal', icon: <Sparkles className="w-4 h-4" />, color: 'text-blue-500' },
                    { label: 'Body Temp', value: '98.6', unit: '°F', status: 'Stable', icon: <TrendingUp className="w-4 h-4" />, color: 'text-orange-500' },
                ].map((v, i) => (
                    <div key={i} className="p-5 rounded-2xl border shadow-sm flex flex-col gap-3" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-opacity-10 ${v.color.replace('text-', 'bg-')}`}>{v.icon}</div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{v.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black" style={{ color: 'var(--luna-text-main)' }}>{v.value}</span>
                            <span className="text-[10px] font-bold opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{v.unit}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${v.color.replace('text-', 'bg-')} animate-pulse`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${v.color}`}>{v.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Clinical Health Pulse Highlight */}
            <div className="card-clinical relative overflow-hidden group cursor-pointer" 
                 style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}
                 onClick={() => navigate('/patient/dashboard/records')}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-teal-500/10 transition-colors" />
                <div className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-teal-500/20 bg-teal-500/5 text-teal-500 shadow-lg shadow-teal-500/10 transition-transform group-hover:scale-110">
                            <FileText className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>My Clinical Vault</h2>
                            <p className="text-sm font-bold mt-1 max-w-md" style={{ color: 'var(--luna-text-muted)' }}>
                                Access your entire diagnostic history, prescriptions, and specialist consultations through our secure encryption-first ledger.
                            </p>
                        </div>
                    </div>
                    <button className="btn-teal !px-8 !py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-teal-500/20">
                        Enter Health Vault <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Live Consultation Highlight */}
            {stats?.appointments?.some(a => a.status === 'confirmed' || a.status === 'live') && (
                <div className="card-clinical bg-emerald-500/5 border-emerald-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Video className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black" style={{ color: 'var(--luna-text-main)' }}>Secure Clinical Bridge</h2>
                            <p className="text-xs font-bold opacity-70" style={{ color: 'var(--luna-text-muted)' }}>Real-time virtual examination hub is active or pending.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/patient/dashboard/telemedicine')}
                        className="btn-teal !px-8 !py-3.5 text-[10px] font-black uppercase tracking-widest shadow-emerald-500/10"
                    >
                        Launch Virtual Terminal
                    </button>
                </div>
            )}

            {/* Clinical Encounters Ledger */}
            <div className="shadow-sm rounded-2xl overflow-hidden border flex flex-col" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)' }}>
                    <h2 className="font-extrabold text-lg flex items-center gap-2" style={{ color: 'var(--luna-text-main)' }}>
                        <FileText className="w-5 h-5 text-teal-500" /> Recent Encounters
                    </h2>
                    <Link to="/patient/dashboard/records" className="text-xs font-bold transition-colors px-4 py-2 rounded-lg border hover:bg-white/5" style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>View Archive</Link>
                </div>
                
                <div className="flex-grow p-0 overflow-x-auto">
                    {loading ? <div className="p-12 text-center text-sm font-bold opacity-60">Loading data...</div> :
                        stats?.appointments?.length > 0 ? (
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--luna-text-muted)', background: 'var(--luna-navy)' }}>
                                        <th className="p-4 pl-6 border-b" style={{ borderColor: 'var(--luna-border)' }}>Date</th>
                                        <th className="p-4 border-b" style={{ borderColor: 'var(--luna-border)' }}>Physician</th>
                                        <th className="p-4 border-b" style={{ borderColor: 'var(--luna-border)' }}>Type</th>
                                        <th className="p-4 text-right pr-6 border-b" style={{ borderColor: 'var(--luna-border)' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.appointments.slice(0, 5).map((a, i) => (
                                        <tr key={i} className="transition-colors hover:bg-white/5" style={{ borderColor: 'var(--luna-border)' }}>
                                            <td className="p-4 pl-6 text-sm font-bold border-b" style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}>{a.appointment_date}</td>
                                            <td className="p-4 text-sm font-black border-b" style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}>{a.doctor_name || `Dr. ${a.doctorName || a.doctor}`}</td>
                                            <td className="p-4 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 border px-2 py-0.5 rounded text-indigo-500 bg-indigo-500/10" style={{ borderColor: 'var(--luna-border)' }}>Consultation</span>
                                            </td>
                                            <td className="p-4 pr-6 text-right border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border" style={{ color: a.status === 'confirmed' ? 'var(--luna-success-text)' : 'var(--luna-info-text)', borderColor: 'var(--luna-border)' }}>{a.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <div className="p-16 flex flex-col items-center justify-center opacity-70"><CheckCircle className="w-12 h-12 mb-3 text-emerald-500" /><div className="text-sm font-bold" style={{ color: 'var(--luna-text-muted)' }}>No medical encounters recorded.</div></div>
                    }
                </div>
            </div>
        </motion.div>
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
                    <h2 className="text-lg font-bold" style={{ color: 'var(--luna-text-main)' }}>Clinical Intelligence</h2>
                    <p className="text-sm mt-3 leading-relaxed max-w-xs uppercase tracking-wider opacity-50" style={{ color: 'var(--luna-text-muted)' }}>Real-time diagnostic synchronization active.</p>
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
