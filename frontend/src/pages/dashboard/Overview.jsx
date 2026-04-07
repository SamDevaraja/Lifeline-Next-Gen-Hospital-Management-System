import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit, CreditCard,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, ShieldCheck, RefreshCw, PackagePlus
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/index.js';
import { LUNA } from "./Constants";
import logo from '/lifeline_themed_v1.svg?v=cachebust123';

const Overview = ({ user }) => {
    const role = user?.role?.toLowerCase();
    if (role === 'patient') return <PatientOverview user={user} />;
    if (role === 'doctor') return <DoctorOverview user={user} />;
    if (role === 'admin') return <AdminOverview />;
    if (role === 'pharmacist') return <PharmacistOverview user={user} />;
    return <StaffOverview user={user} />;
};

// ── Doctor Dashboard (Simple & Institutional Edition) ──
const DoctorOverview = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permanentBridge, setPermanentBridge] = useState(user.permanent_meet_link || '');
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res, apps] = await Promise.all([
                api.get(`/dashboard/stats/`),
                api.get(`/appointments/?doctor_id=${user.id}`)
            ]);
            setStats({ ...res.data, myAppointments: apps.data.slice(0, 20) });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [user.id]);

    const handleStartCall = async (apptId, currentLink) => {
        let finalLink = currentLink;
        if (!finalLink) {
            if (permanentBridge) {
                finalLink = permanentBridge;
                await api.patch(`/appointments/${apptId}/`, { meeting_link: finalLink });
                fetchData();
            } else {
                const newLink = window.prompt("Enter Meeting Link:");
                if (!newLink) return;
                finalLink = newLink;
                await api.patch(`/appointments/${apptId}/`, { meeting_link: finalLink });
                fetchData();
            }
        }
        window.open(finalLink, '_blank');
    };

    const chartData = [
        { name: '08', val: 4 }, { name: '10', val: 12 }, { name: '12', val: 18 },
        { name: '14', val: 15 }, { name: '16', val: 22 }, { name: '18', val: 9 }, { name: '20', val: 3 },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="flex flex-col h-full space-y-4 max-w-[1500px] mx-auto w-full overflow-hidden p-0.5">
            <Toaster position="top-right" />

            {/* Clean Header */}
            <div className="p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 shadow-sm"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center p-0.5 border"
                        style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)' }}>
                        <img src={logo} alt="Lifeline" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                            Doctor Dashboard
                        </h1>
                        <div className="flex items-center gap-3 mt-1 font-bold text-sm">
                            <span style={{ color: 'var(--luna-teal)' }}>Active: Dr. {user.last_name}</span>
                            <div className="w-1 h-1 rounded-full opacity-30 shrink-0" style={{ background: 'var(--luna-text-main)' }} />
                            <span style={{ color: 'var(--luna-text-dim)' }}>Office ID: {user.doctor_id || 102}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6 pr-2">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-main)' }}>Current Time</span>
                        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{time.toLocaleTimeString([], { hour12: true })}</span>
                    </div>
                    <div className="h-10 w-[1px] opacity-10" style={{ background: 'var(--luna-text-main)' }} />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--luna-teal)' }}>Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--luna-teal)', boxShadow: '0 0 12px var(--luna-teal)' }} />
                            <span className="text-xs font-bold" style={{ color: 'var(--luna-text-main)' }}>Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                {[
                    { label: 'Total Patients', value: stats?.total_patients || 0, trend: '+4', icon: Users, color: 'var(--luna-blue)' },
                    { label: 'Today\'s Visits', value: stats?.today_appointments || 0, trend: '94%', icon: Clock, color: 'var(--luna-teal)' },
                    { label: 'Health Alerts', value: stats?.ai_diagnoses_today || 0, trend: stats?.ai_diagnoses_today > 0 ? 'Urgent' : 'Low', icon: AlertCircle, color: stats?.ai_diagnoses_today > 0 ? 'var(--luna-danger-text)' : 'var(--luna-warn-text)' },
                    { label: 'Clinic Accuracy', value: '98.8%', trend: 'Good', icon: CheckCircle, color: 'var(--luna-success-text)' },
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-xl border transition-all duration-300 shadow-sm flex items-center justify-between"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] opacity-40 mb-1 block" style={{ color: 'var(--luna-text-main)' }}>{s.label}</span>
                            <h3 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{s.value}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="p-2 rounded-lg border" style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)', color: s.color }}>
                                <s.icon className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest" 
                                style={{ color: s.color, borderColor: s.color, background: `${s.color}10` }}>{s.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task List and Charts - 5:7 Split */}
            <div className="grid grid-cols-12 gap-3 flex-grow overflow-hidden min-h-0">
                {/* Clinic Report - Now Primary Left */}
                <div className="col-span-12 lg:col-span-5 flex flex-col overflow-hidden">
                    <div className="p-3 rounded-xl border flex flex-col flex-grow transition-all duration-300 shadow-sm h-full"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center justify-between mb-2 shrink-0">
                            <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Clinic Report</h2>
                            <div className="p-1 px-2 rounded-md border opacity-20" style={{ borderColor: 'var(--luna-text-main)' }}>
                                <Activity className="w-3 h-3" style={{ color: 'var(--luna-text-main)' }} />
                            </div>
                        </div>
                        <div className="flex-grow w-full h-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: 'var(--luna-text-dim)', fontWeight: 900}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: 'var(--luna-text-dim)', fontWeight: 900}} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(56, 189, 248, 0.05)'}}
                                        contentStyle={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)', borderRadius: '8px', fontSize: '11px', fontWeight: '900' }}
                                    />
                                    <Bar dataKey="val" radius={[3, 3, 0, 0]} barSize={42}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--luna-teal)' : 'var(--luna-blue)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Appointments List - Right Pillar */}
                <div className="col-span-12 lg:col-span-7 flex flex-col overflow-hidden">
                    <div className="flex flex-col h-full rounded-xl border overflow-hidden transition-all duration-300 shadow-sm"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="p-4 border-b flex items-center justify-between shrink-0" 
                            style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5" style={{ color: 'var(--luna-teal)' }} />
                                <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Appointments List</h2>
                            </div>
                            <div className="text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest" 
                                style={{ background: 'linear-gradient(135deg, var(--luna-teal), var(--luna-blue))' }}>Live: {stats?.myAppointments?.length || 0}</div>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar" style={{ background: 'rgba(0,0,0,0.01)' }}>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => <div key={i} className="h-20 w-full animate-pulse border-b" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }} />)
                            ) : stats?.myAppointments?.length > 0 ? (
                                stats.myAppointments.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 px-6 group transition-colors border-b last:border-b-0"
                                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                        <div className="flex items-center gap-5">
                                            <div className="w-11 h-11 rounded-lg flex items-center justify-center font-black text-sm border transition-all"
                                                style={{ background: 'var(--luna-bg)', color: i % 2 === 0 ? 'var(--luna-teal)' : 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>
                                                {a.patientName[0]}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{a.patientName}</p>
                                                <div className="flex items-center gap-3 mt-0.5 font-bold text-[10px] opacity-60 uppercase tracking-widest">
                                                    <span style={{ color: 'var(--luna-text-dim)' }}>{a.appointment_time?.slice(0,5)}</span>
                                                    <div className="w-1 h-1 rounded-full opacity-40 shrink-0" style={{ background: 'var(--luna-steel)' }} />
                                                    <span style={{ color: a.status === 'confirmed' ? 'var(--luna-success-text)' : 'var(--luna-warn-text)' }}>{a.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => handleStartCall(a.id, a.meeting_link)}
                                                className="px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all text-white border border-white/10"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, var(--luna-teal), var(--luna-blue))', 
                                                }}
                                            >
                                                {a.meeting_link ? 'Start' : 'Link'}
                                            </button>
                                            <button className="p-2.5 rounded-lg border transition-all flex items-center justify-center"
                                                style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-dim)' }}>
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                                    <Activity className="w-16 h-16 mb-4" style={{ color: 'var(--luna-teal)' }} />
                                    <p className="font-black uppercase tracking-[0.4em]" style={{ color: 'var(--luna-text-main)' }}>Queue Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
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
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [res, bills] = await Promise.all([
                    api.get('/dashboard/stats/'),
                    api.get('/bills/')
                ]);
                setStats({ ...res.data, recentBills: bills.data.slice(0, 10) });
            } catch (err) {
                console.error("Failed to fetch dash stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = stats ? [
        { label: 'Active Doctors', value: stats.total_doctors, trend: '94% Online', icon: Stethoscope, color: LUNA.info_text, bg: LUNA.info_bg },
        { label: 'Total Patients', value: stats.total_patients, trend: '+12 Today', icon: Users, color: LUNA.blue, bg: 'rgba(37,99,235,0.05)' },
        { label: 'Daily Load', value: stats.today_appointments, trend: 'Optimal', icon: Calendar, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.05)' },
        { label: 'Gross Revenue', value: stats.total_revenue, trend: '+4.2% Audit', icon: DollarSign, color: '#312e81', bg: 'rgba(49, 46, 129, 0.05)' },
    ] : [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="grid grid-rows-[auto_auto_1fr] h-[calc(100vh-110px)] gap-3 w-full px-8 pt-1 pb-4 overflow-hidden relative">
            <Toaster position="top-right" />

            {/* Flush Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm shrink-0"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center p-0.5 border shadow-inner shrink-0"
                        style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)' }}>
                        <img src={logo} alt="Lifeline" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black uppercase tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>Lifeline HMS</h1>
                            <div className="text-[8px] font-black uppercase tracking-widest px-3 py-0.5 rounded-lg border border-blue-500/20 text-blue-500 bg-blue-500/10">Admin Node Alpha</div>
                        </div>
                        <h2 className="text-[11px] font-bold opacity-60 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>
                            System Operational Authority <span className="opacity-40 font-black ml-2 text-[8px] uppercase tracking-widest">• Authority: Absolute</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-6 pr-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 px-2" style={{ color: 'var(--luna-text-main)' }}>Global Terminal Time</span>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 opacity-20" />
                            <span className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compressed Header Stats - Tier 2 */}
            <div className="grid grid-cols-4 gap-3 shrink-0">
                {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: 'var(--luna-card)' }} />) :
                    statCards.map((s, i) => (
                        <div key={i} className="p-4 rounded-xl border transition-all duration-300 shadow-sm flex items-center justify-between"
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                            <div className="flex flex-col justify-center">
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-30 mb-0.5" style={{ color: 'var(--luna-text-main)' }}>{s.label}</span>
                                <div className="flex items-baseline gap-1">
                                    {s.label === 'Gross Revenue' && <span className="text-[10px] font-black opacity-30">₹</span>}
                                    <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                        {s.label === 'Gross Revenue' ? (s.value / 1000).toFixed(1) + 'k' : s.value}
                                    </h3>
                                </div>
                                <span className="text-[7px] font-black uppercase opacity-60" style={{ color: s.color }}>{s.trend}</span>
                            </div>
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg border shadow-inner"
                                style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)', color: s.color }}>
                                <s.icon className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Synchronized Infrastructure Grid - Tier 3 (3:9 Split) */}
            <div className="grid grid-cols-12 gap-4 min-h-0 h-full overflow-hidden">
                {/* Hospital Pulse - Pivot Pillar (3) */}
                <div className="col-span-3 h-full flex flex-col min-h-0">
                    <div className="p-5 rounded-xl border flex flex-col h-full shadow-sm overflow-hidden"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <div>
                                <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Hospital Pulse</h2>
                                <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Revenue Matrix</p>
                            </div>
                        </div>
                        <div className="flex-grow w-full min-h-0 relative mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Mon', revenue: 2400 }, { name: 'Tue', revenue: 3200 }, 
                                    { name: 'Wed', revenue: 5800 }, { name: 'Thu', revenue: 3900 }, 
                                    { name: 'Fri', revenue: 6600 }, { name: 'Sat', revenue: 3100 }, 
                                    { name: 'Sun', revenue: 2800 }
                                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--luna-text-dim)', fontWeight: 900}} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)', borderRadius: '12px', fontSize: '10px' }} 
                                    />
                                    <Bar dataKey="revenue" fill="#312e81" radius={[4, 4, 0, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between opacity-60 shrink-0" style={{ borderColor: 'var(--luna-border)' }}>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase">Growth</span>
                                <span className="text-lg font-black text-emerald-500">+12%</span>
                            </div>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-500">OPERATIONAL</span>
                        </div>
                    </div>
                </div>

                {/* Transaction Intelligence - Major Pillar (9) */}
                <div className="col-span-9 h-full flex flex-col min-h-0">
                    <div className="flex flex-col h-full rounded-xl border shadow-sm overflow-hidden"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="p-4 border-b flex items-center justify-between shrink-0" 
                            style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Transaction Ledger</h2>
                            </div>
                            <div className="text-[7px] font-black opacity-40 uppercase">Terminal: SYNC_OK</div>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar min-h-0 h-0">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => <div key={i} className="h-12 w-full animate-pulse border-b" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }} />)
                            ) : stats?.recentBills?.length > 0 ? (
                                stats.recentBills.map((b, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 px-8 group transition-all border-b last:border-b-0 hover:bg-white/5"
                                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[9px] border shadow-inner"
                                                style={{ background: 'var(--luna-bg)', color: i % 2 === 0 ? 'var(--luna-teal)' : 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>
                                                {b.invoice_number?.slice(-3) || 'SYS'}
                                            </div>
                                            <div>
                                                <p className="text-base font-black tracking-tight leading-none" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name || 'System User'}</p>
                                                <div className="flex items-center gap-3 mt-1.5 font-bold text-[8px] opacity-40 uppercase tracking-widest">
                                                    <span>{b.bill_date}</span>
                                                    <span style={{ color: b.status === 'paid' ? LUNA.success_text : LUNA.warn_text }}>{b.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <div className="flex items-baseline justify-end gap-1 leading-none">
                                                    <span className="text-[10px] font-black opacity-30">₹</span>
                                                    <p className="text-xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>
                                                        {(parseFloat(b.total_amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded-lg border border-emerald-500/10 text-emerald-500 bg-emerald-500/5">
                                                    <span className="text-[8px] font-black uppercase tracking-widest">SECURE_AUDIT</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <DollarSign className="w-10 h-10 mb-2" />
                                    <p className="text-[9px] font-black uppercase">No Data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Pharmacist Overview ──
const PharmacistOverview = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPharmacistData = async () => {
            try {
                const [invRes, prescRes, summaryRes] = await Promise.all([
                    api.get('pharmacy/'),
                    api.get('prescriptions/'),
                    api.get('pharmacy/summary/')
                ]);
                
                const items = invRes.data || [];
                const queue = prescRes.data.filter(p => !p.dispensed).length;
                const revenue = summaryRes.data.reduce((acc, cur) => acc + (cur.total_units * cur.avg_price || 0), 0);

                setStats({
                    inventory: items.length,
                    queue,
                    revenue,
                    critical: items.filter(i => i.status === 'Critical').length,
                    summary: summaryRes.data.slice(0, 5)
                });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchPharmacistData();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl border shadow-sm" 
                 style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                        <Pill className="w-7 h-7" style={{ color: 'var(--luna-blue)' }} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Pharmacy Command</h1>
                        <p className="text-sm font-bold opacity-60 mt-1" style={{ color: 'var(--luna-text-muted)' }}>Unified Dispensary & Inventory Intel</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/dashboard/dispensary" className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl hover:-translate-y-0.5 transition-all" style={{ background: 'var(--luna-blue)' }}>Open Terminal</Link>
                    <button onClick={() => window.location.reload()} className="p-3 rounded-2xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                        <RefreshCw className="w-5 h-5 opacity-40" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Queue', value: stats?.queue || 0, sub: 'Fulfillment Pending', icon: <Clock className="w-5 h-5"/>, color: 'var(--luna-teal)', bg: 'var(--luna-info-bg)' },
                    { label: 'Critical Stock', value: stats?.critical || 0, sub: 'Requires Action', icon: <AlertCircle className="w-5 h-5"/>, color: 'var(--luna-danger-text)', bg: 'var(--luna-danger-bg)' },
                    { label: 'Itemized Units', value: stats?.inventory || 0, sub: 'Distinct Formulas', icon: <PackagePlus className="w-5 h-5"/>, color: 'var(--luna-blue)', bg: 'rgba(37,99,235,0.05)' },
                    { label: 'Daily Est.', value: `₹${(stats?.revenue || 0).toLocaleString()}`, sub: 'Market Valuation', icon: <DollarSign className="w-5 h-5"/>, color: 'var(--luna-success-text)', bg: 'var(--luna-success-bg)' },
                ].map((s, i) => (
                    <div key={i} className="p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-40" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 rounded-xl border" style={{ background: s.bg, color: s.color, borderColor: 'rgba(0,0,0,0.05)' }}>{s.icon}</div>
                            <div className="badge-live">Real-time</div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                            <h3 className="text-3xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{loading ? '...' : s.value}</h3>
                            <p className="text-[10px] font-bold opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2.5rem] border shadow-sm flex flex-col" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Inbound Traffic</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-muted)' }}>Hourly Distribution Map</p>
                        </div>
                        <Activity className="w-5 h-5 opacity-20" />
                    </div>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 30, 85, 45, 90, 60].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group translate-y-2">
                                <div className="w-full rounded-t-lg transition-all group-hover:scale-x-110" style={{ height: `${h}%`, background: i % 2 === 0 ? 'var(--luna-blue)' : 'var(--luna-teal)', opacity: 0.6 }} />
                                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">H-0{i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="w-5 h-5" style={{ color: 'var(--luna-teal)' }} />
                            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Audit Engine</h2>
                        </div>
                        <p className="text-sm font-bold opacity-80 leading-relaxed mb-8" style={{ color: 'var(--luna-text-main)' }}>
                            No discrepancies localized in the last 24 hours. Inventory turnover is currently optimal (94.2%).
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--luna-text-main)' }}>Regulatory Clear</span>
                                </div>
                                <ArrowRight className="w-4 h-4 opacity-20" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                <div className="flex items-center gap-3">
                                    <BrainCircuit className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--luna-text-main)' }}>Smart Procurement</span>
                                </div>
                                <ArrowRight className="w-4 h-4 opacity-20" />
                            </div>
                        </div>
                    </div>
                    <Pill className="absolute -right-10 -bottom-10 w-40 h-40 opacity-5 rotate-12" />
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
        nurse: { title: 'Nurse Station', sub: 'Vitals logging & clinical record tracking', icon: <img src={logo} className="w-16 h-16 opacity-[0.08]" /> },
        lab_technician: { title: 'Lab Terminal', sub: 'Diagnostic testing & reporting operations', icon: <FlaskConical className="w-16 h-16 text-purple-500 opacity-20" /> },
        billing_staff: { title: 'Billing Desk', sub: 'Financial operations & invoice management', icon: <DollarSign className="w-16 h-16 text-emerald-500 opacity-20" /> },
    };
    
    const roleProps = roleMap[user?.role?.toLowerCase()] || { title: 'Staff Portal', sub: 'Hospital workspace interface' };

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