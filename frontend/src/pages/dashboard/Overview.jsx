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




const Overview = ({ user }) => {
    if (user?.role === 'patient') return <PatientOverview user={user} />;
    if (user?.role === 'doctor') return <DoctorOverview user={user} />;
    if (user?.role === 'admin') return <AdminOverview />;
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
                    <Sparkles className="w-12 h-12 text-indigo-400 mb-4 animate-pulse" />
                    <h2 className="text-lg font-black" style={{ color: 'var(--luna-text-main)' }}>Clinical Intelligence</h2>
                    <p className="text-[13px] font-bold mt-3 uppercase tracking-tighter max-w-[200px]" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>AI Core is analyzing patient vitals to flag potential risks in real-time.</p>
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

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>My Health Hub</h1>
                    <p className="font-bold text-sm mt-1" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Hello, {user.first_name} {user.last_name} • Member Since {new Date().getFullYear()}</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border"
                    style={{
                        background: user.risk_level === 'high' ? LUNA.danger_bg : LUNA.success_bg,
                        color: user.risk_level === 'high' ? LUNA.danger_text : LUNA.success_text,
                        borderColor: 'transparent'
                    }}>
                    Risk Status: {user.risk_level || 'Low'}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                    { label: 'Next Visit', value: nextApp ? nextApp.appointment_date : 'None', sub: nextApp ? nextApp.appointment_time : 'No pending calls', icon: <Calendar className="w-5 h-5" />, color: LUNA.success_text, bg: LUNA.success_bg },
                    { label: 'Pending Bills', value: `₹${unpaidBills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0).toLocaleString()}`, sub: `${unpaidBills.length} unpaid invoice`, icon: <DollarSign className="w-5 h-5" />, color: LUNA.warn_text, bg: LUNA.warn_bg },
                    { label: 'Health Score', value: 'Optimal', sub: 'Based on AI vitals', icon: <Activity className="w-5 h-5" />, color: LUNA.info_text, bg: LUNA.info_bg },
                ].map((s, i) => (
                    <div key={i} className="card-clinical p-6 flex flex-col justify-between group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                            <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{s.value}</p>
                            <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--luna-text-muted)' }}>{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card shadow-2xl" style={{ border: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                    <h2 className="font-extrabold text-lg mb-6" style={{ color: 'var(--luna-text-main)' }}>Recent Health Updates</h2>
                    <div className="space-y-3">
                        {loading ? <div className="animate-shimmer h-20 rounded-xl" /> :
                            stats?.appointments?.slice(0, 3).map((a, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg" style={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)' }}><Stethoscope className="w-4 h-4" style={{ color: LUNA.teal }} /></div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--luna-text-main)' }}>Consultation with {a.doctorName}</p>
                                            <p className="text-[10px] font-bold" style={{ color: 'var(--luna-text-muted)' }}>{a.status.toUpperCase()} • {a.appointment_date}</p>
                                        </div>
                                    </div>
                                    <Link to="/dashboard/records" className="text-[10px] font-black uppercase tracking-widest" style={{ color: LUNA.success_text }}>Report</Link>
                                </div>
                            ))}
                        <button className="w-full mt-4 btn-outline text-xs py-3" onClick={() => navigate('/dashboard/ai')}>Consult Clinical Intelligence for health insights</button>
                    </div>
                </div>
                <div className="card shadow-sm border overflow-hidden p-0" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="p-6">
                        <h2 className="text-lg font-bold" style={{ color: 'var(--luna-text-main)' }}>Wellness Intelligence</h2>
                        <p className="text-xs mt-1 font-bold" style={{ color: 'var(--luna-text-muted)' }}>Powered by Clinical Intelligence Systems</p>
                    </div>
                    <div className="px-6 pb-6 space-y-4">
                        <div className="p-4 rounded-2xl border flex gap-3"
                            style={{
                                background: LUNA.success_bg,
                                borderColor: 'rgba(16, 185, 129, 0.05)'
                            }}>
                            <BrainCircuit className="w-5 h-5 flex-shrink-0" style={{ color: LUNA.success_text }} />
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--luna-text-main)' }}>
                                Your vitals show stable patterns. Maintaining current hydration and rest cycles is recommended for optimal recovery.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: LUNA.success_text }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--luna-text-muted)' }}>Clinical Data Synchronized</span>
                        </div>
                    </div>
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


// ── Staff Overview (Nurse, Receptionist, Pharmacist, Supervisor) ──
const StaffOverview = ({ user }) => {
    const roleMap = {
        receptionist: { title: 'Reception Desk', sub: 'Patient registration & scheduling operations', icon: <Users className="w-16 h-16 text-teal-500 opacity-20" /> },
        pharmacist: { title: 'Pharmacy Terminal', sub: 'Inventory management & prescription dispensing', icon: <Pill className="w-16 h-16 text-blue-500 opacity-20" /> },
        nurse: { title: 'Nurse Station', sub: 'Vitals logging & clinical record tracking', icon: <HeartPulse className="w-16 h-16 text-rose-500 opacity-20" /> },
        supervisor: { title: 'Facility Commands', sub: 'Maintenance deployment & operational status', icon: <CheckCircle className="w-16 h-16 text-emerald-500 opacity-20" /> },
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