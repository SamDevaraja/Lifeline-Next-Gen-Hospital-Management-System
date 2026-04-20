import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, ShieldCheck, RefreshCw
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
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Doctor's Dashboard</h1>
                    <p className="font-bold text-sm mt-1" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Welcome back, Dr. {user.last_name}</p>
                </div>
                <div className="badge-live scale-90">Dept: {user.department}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                    { label: 'My Patients', value: stats?.total_patients || 0, icon: <Users className="w-5 h-5" />, color: LUNA.blue },
                    { label: 'Today Sched', value: stats?.today_appointments || 0, icon: <Calendar className="w-5 h-5" />, color: LUNA.blue },
                    { label: 'Ward Occupancy', value: stats?.ward_occupancy || 'Optimal', icon: <Stethoscope className="w-5 h-5" />, color: LUNA.blue },
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
                    <h2 className="text-lg font-black" style={{ color: 'var(--luna-text-main)' }}>System Status</h2>
                    <p className="text-[13px] font-bold mt-3 uppercase tracking-tighter max-w-[200px]" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>Manual physician-led clinical review system is locked and synchronized.</p>
                </div>
            </div>
        </motion.div>
    );
};
// ── Patient Overview ──
const PatientOverview = ({ user }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [apps, bills, records] = await Promise.all([
                api.get(`/appointments/?patient_id=${user.patient_id}`),
                api.get(`/bills/?patient_id=${user.patient_id}`),
                api.get(`/medical-records/?patient_id=${user.patient_id}`)
            ]);
            setStats({ 
                appointments: Array.isArray(apps.data) ? apps.data : [],
                bills: Array.isArray(bills.data) ? bills.data : [],
                records: Array.isArray(records.data) ? records.data : []
            });
        } catch (err) { 
            console.error(err); 
            toast.error("Failed to sync your dashboard.");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.patient_id]);

    const unpaidBills = stats?.bills?.filter(b => b.status === 'pending') || [];
    const nextApp = stats?.appointments?.find(a => a.status === 'confirmed');

    const metrics = [
        { label: 'Health Status', value: 'Active', color: 'var(--luna-teal)' },
        { label: 'Next Visit', value: nextApp ? nextApp.appointment_date : 'N/A', color: 'var(--luna-blue)' },
        { label: 'Due Balance', value: `₹${unpaidBills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0).toLocaleString()}`, color: '#ef4444' },
        { label: 'Medical Records', value: stats?.records?.length || 0, color: '#6366f1' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            
            {/* Institutional Header */}
            <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Dashboard Overview</h1>
                    <button onClick={fetchData} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                        Patient ID: <span style={{ color: 'var(--luna-teal)' }}>LFLN-{user.patient_id?.toString().padStart(5, '0')}</span>
                    </p>
                </div>
            </header>

            {/* Minimal Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {metrics.map((s, i) => (
                    <div key={i} className="p-3 sm:p-4 border rounded-xl overflow-hidden" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-lg sm:text-2xl font-extrabold whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>
                            {loading ? '...' : s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Medical History Section */}
            <div className="border rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.01)' : '#fcfcfc' }}>
                    <h3 className="text-[11px] font-black uppercase tracking-widest opacity-60">Medical History</h3>
                    <button onClick={() => navigate('/patient/dashboard/records')} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border hover:bg-white/5 transition-all" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-dim)' }}>
                        View Records
                    </button>
                </div>
                <div className="overflow-hidden min-h-[300px]">
                    <table className="w-full text-left border-collapse table-auto sm:table-fixed">
                        <thead style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                <th className="pl-4 pr-2 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest opacity-40">Visit Date</th>
                                <th className="px-2 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest opacity-40">Doctor</th>
                                <th className="pl-2 pr-4 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="3" className="px-6 py-4 animate-pulse opacity-20 text-[9px] font-bold uppercase text-center tracking-widest">Loading records...</td>
                                    </tr>
                                ))
                            ) : (stats?.appointments || []).length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center opacity-30 text-xs font-bold uppercase tracking-widest">No recent encounters found.</td>
                                </tr>
                            ) : (stats?.appointments || []).slice(0, 4).map((a, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-[var(--luna-navy)] transition-colors" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="pl-4 pr-2 sm:px-6 py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-[var(--luna-navy)] border border-[var(--luna-border)] shrink-0">
                                                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-40" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-bold leading-none truncate">{a.appointment_date}</p>
                                                <p className="text-[8px] sm:text-[9px] font-bold opacity-30 uppercase mt-1 truncate">Consultation</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-6 py-4">
                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-tight truncate">Dr. {a.doctor_name || a.doctorName}</p>
                                        <p className="hidden sm:block text-[9px] font-bold opacity-30 uppercase truncate">Specialist</p>
                                    </td>
                                    <td className="pl-2 pr-4 sm:px-6 py-4 text-right">
                                        <span className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[7px] sm:text-[8px] font-black uppercase tracking-widest border ${a.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="text-center pt-10 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Lifeline Management System</p>
            </footer>
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
        { label: 'Total Doctors', value: stats.total_doctors, icon: <Stethoscope className="w-6 h-6" />, color: LUNA.blue, bg: LUNA.info_bg },
        { label: 'Active Patients', value: stats.total_patients, icon: <HeartPulse className="w-6 h-6" />, color: LUNA.blue, bg: LUNA.info_bg },
        { label: 'Today Sched', value: stats.today_appointments, icon: <Calendar className="w-6 h-6" />, color: LUNA.blue, bg: LUNA.info_bg },
        { label: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: LUNA.blue, bg: LUNA.info_bg },
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
        receptionist: { title: 'Reception Desk', sub: 'Patient registration & scheduling operations', icon: <Users className="w-16 h-16 text-blue-500 opacity-20" /> },

        nurse: { title: 'Nurse Station', sub: 'Vitals logging & clinical record tracking', icon: <HeartPulse className="w-16 h-16 text-blue-500 opacity-20" /> },
        lab_technician: { title: 'Lab Terminal', sub: 'Diagnostic testing & reporting operations', icon: <FlaskConical className="w-16 h-16 text-blue-500 opacity-20" /> },
        billing_staff: { title: 'Billing Desk', sub: 'Financial operations & invoice management', icon: <DollarSign className="w-16 h-16 text-blue-500 opacity-20" /> },
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
