import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit, CreditCard,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/index.js';
import { LUNA } from "./Constants";
import { ConfirmModal, InputModal, DetailsModal } from './Modals';
import logo from '/lifeline_themed_v1.svg?v=cachebust123';

const Overview = ({ user }) => {
    const role = user?.role?.toLowerCase();
    if (role === 'patient') return <PatientOverview user={user} />;
    if (role === 'doctor') return <DoctorOverview user={user} />;
    if (role === 'admin') return <AdminOverview user={user} />;
    return <StaffOverview user={user} />;
};

// ── Doctor Dashboard (Simple & Institutional Edition) ──
const DoctorOverview = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permanentBridge, setPermanentBridge] = useState(user.permanent_meet_link || '');
    const { theme } = useTheme();
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res, apps] = await Promise.all([
                api.get(`/dashboard/stats/`),
                api.get(`/appointments/?doctor_id=${user.doctor_id || user.id}`)
            ]);
            setStats({ ...res.data, myAppointments: apps.data.slice(0, 20) });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [user.doctor_id || user.id]);

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

    const consultData = useMemo(() => {
        const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        const dist = {}; HOURS.forEach(h => dist[h] = 0);
        if (stats?.myAppointments) {
            stats.myAppointments.forEach(a => {
                const hour = a.appointment_time?.split(':')[0];
                if (hour && dist[hour] !== undefined) dist[hour]++;
            });
        }
        return HOURS.map(h => ({ name: h, val: dist[h] }));
    }, [stats]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col space-y-6">
            <Toaster position="top-right" />

            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-transform hover:scale-105" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <Stethoscope className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Physician Terminal</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Lead Specialist • Dr. {user.last_name}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <button 
                        onClick={async () => {
                            const newLink = window.prompt("Institutional Permanent Bridge - Enter Authority URL:", permanentBridge);
                            if (newLink === null) return;
                            try {
                                toast.loading("Synchronizing Bridge...", { id: 'bridge' });
                                await api.patch(`/doctors/${user.doctor_id || user.id}/`, { permanent_meet_link: newLink });
                                setPermanentBridge(newLink);
                                toast.success("Permanent bridge updated.", { id: 'bridge' });
                            } catch (e) { toast.error("Synchronization failed.", { id: 'bridge' }); }
                        }}
                        className="px-6 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-500 border-blue-500/10 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Video className="w-3.5 h-3.5" />
                        Meeting Bridge
                    </button>
                    <div className="px-6 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/10 flex items-center justify-center shadow-sm">
                        Registry: Synced
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Patient Registry', value: stats?.total_patients || 0, color: 'var(--luna-blue)' },
                    { label: 'Daily Consults', value: stats?.today_appointments || 0, color: 'var(--luna-primary)' },
                    { label: 'Pending Auth', value: stats?.pending_appointments || 0, color: 'var(--luna-primary)' },
                    { label: 'Clinical Records', value: stats?.total_records || 0, color: 'var(--luna-primary)' },
                ].map((s, i) => (
                    <div key={i} className="p-5 border rounded-2xl shadow-sm bg-[var(--luna-card)] hover:scale-[1.02] transition-transform" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                        <p className="text-2xl font-black" style={{ color: s.color }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Workspace Grid (3:9) */}
            <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
                <div className="hidden lg:block lg:col-span-3 h-full">
                    <div className="p-8 rounded-2xl border flex flex-col h-full shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="mb-8">
                            <h2 className="text-sm font-black tracking-[0.1em] uppercase opacity-60" style={{ color: 'var(--luna-text-main)' }}>Encounter Load</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Institutional Demand Map</p>
                        </div>
                        <div className="flex-grow min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <BarChart data={consultData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--luna-border)" opacity={0.3} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 9, fontWeight: 800, fill: 'var(--luna-text-muted)' }} 
                                        tickFormatter={(val) => {
                                            const h = parseInt(val);
                                            if (h % 2 !== 0) return ''; // Only show even hours
                                            if (h === 8) return '8A';
                                            if (h === 10) return '10A';
                                            if (h === 12) return '12P';
                                            if (h === 14) return '2P';
                                            if (h === 16) return '4P';
                                            if (h === 18) return '6P';
                                            if (h === 20) return '8P';
                                            return val;
                                        }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} width={25} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--luna-text-muted)' }} />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)', borderRadius: '12px', fontSize: '10px', fontWeight: '900' }}
                                    />
                                    <Bar dataKey="val" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={34} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-9 h-full">
                    <div className="rounded-2xl border flex flex-col h-full shadow-sm overflow-hidden bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                            <div className="flex items-center gap-4">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <h1 className="text-[11px] font-black tracking-widest uppercase" style={{ color: 'var(--luna-text-main)' }}>Encounter Queue</h1>
                            </div>
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Registry Feed • Operational</span>
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => <div key={i} className="h-20 w-full animate-pulse border-b" style={{ borderColor: 'var(--luna-border)' }} />)
                            ) : stats?.myAppointments?.map((a, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-center justify-between py-5 px-8 border-b last:border-b-0 hover:bg-[rgba(30,58,138,0.03)] transition-all group" style={{ borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[11px] border shadow-sm bg-[var(--luna-navy)] transition-transform group-hover:scale-110" style={{ borderColor: 'var(--luna-border)', color: i % 2 === 0 ? 'var(--luna-teal)' : 'var(--luna-blue)' }}>
                                            {a.patientName?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black uppercase tracking-tight leading-none" style={{ color: 'var(--luna-text-main)' }}>{a.patientName || 'Anonymous Case'}</p>
                                            <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black uppercase tracking-widest opacity-30">
                                                <span>{a.appointment_time?.slice(0,5)}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-400 opacity-30" />
                                                <span className={a.status === 'confirmed' ? 'text-emerald-500' : 'text-slate-500'}>{a.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                        <button 
                                            onClick={() => handleStartCall(a.id, a.meeting_link)}
                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--luna-blue)] to-[#1e4ed8] text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
                                        >
                                            {a.meeting_link ? 'RESUME SESSION' : 'INITIATE CALL'}
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/dashboard/records?patient_id=${a.patientId || a.patient}`)}
                                            className="p-2 rounded-lg border border-[var(--luna-border)] text-[var(--luna-text-dim)] hover:bg-white/5 transition-all"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                    api.get(`/appointments/?patient_id=${user.patient_id || user.id}`),
                    api.get(`/bills/?patient_id=${user.patient_id || user.id}`)
                ]);
                setStats({ appointments: apps.data, bills: bills.data });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user.patient_id || user.id]);

    const unpaidBills = stats?.bills?.filter(b => b.status === 'pending') || [];
    const nextApp = stats?.appointments?.find(a => a.status === 'confirmed');

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>My Health Hub</h1>
                    <p className="font-bold text-sm mt-1" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>Hello, {user.first_name} {user.last_name} • Member Since {new Date().getFullYear()}</p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border"
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
                    { label: 'Health Status', value: 'Stable', sub: 'Last checkup: Today', icon: <Activity className="w-5 h-5" />, color: LUNA.info_text, bg: LUNA.info_bg },
                ].map((s, i) => (
                    <div key={i} className="card-clinical p-6 flex flex-col justify-between group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                            <p className="text-2xl font-bold tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{s.value}</p>
                            <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--luna-text-muted)' }}>{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card shadow-2xl" style={{ border: '1px solid var(--luna-border)', background: 'var(--luna-card)' }}>
                    <h2 className="font-bold text-lg mb-6" style={{ color: 'var(--luna-text-main)' }}>Recent Health Updates</h2>
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
                                    <Link to="/dashboard/records" className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LUNA.success_text }}>Report</Link>
                                </div>
                            ))}
                        <button className="w-full mt-4 btn-outline text-xs py-3" onClick={() => navigate('/dashboard/records')}>View all clinical history and logs</button>
                    </div>
                </div>
                <div className="card shadow-sm border overflow-hidden p-0" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="p-6">
                        <h2 className="text-lg font-bold" style={{ color: 'var(--luna-text-main)' }}>Hospital Announcements</h2>
                        <p className="text-xs mt-1 font-bold" style={{ color: 'var(--luna-text-muted)' }}>Important updates from Lifeline Management</p>
                    </div>
                    <div className="px-6 pb-6 space-y-4">
                        <div className="p-4 rounded-2xl border flex gap-3"
                            style={{
                                background: 'var(--luna-navy)',
                                borderColor: 'var(--luna-border)'
                            }}>
                            <Bell className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--luna-text-main)' }}>
                                Lifeline HMS has been updated to the latest stable version. All clinical records are now fully synchronized with the central institution index.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--luna-teal)' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--luna-text-muted)' }}>System Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


// ── Admin Overview (Master Governance Terminal) ──
const AdminOverview = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [bills, patients, doctors, appointments] = await Promise.all([
                    api.get('bills/'),
                    api.get('patients/'),
                    api.get('doctors/'),
                    api.get('appointments/')
                ]);
                setStats({
                    totalRevenue: bills.data.reduce((a, b) => a + parseFloat(b.total_amount || 0), 0),
                    totalPatients: patients.data.length,
                    totalDoctors: doctors.data.length,
                    activeConsults: appointments.data.filter(a => a.status === 'scheduled').length,
                    recentBills: bills.data.slice(0, 10)
                });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAdminData();
    }, []);

    const revenueCycleData = useMemo(() => {
        if (!stats?.recentBills) return [
            { day: 'Mon', val: 0 }, { day: 'Tue', val: 0 }, { day: 'Wed', val: 0 },
            { day: 'Thu', val: 0 }, { day: 'Fri', val: 0 }, { day: 'Sat', val: 0 }, { day: 'Sun', val: 0 }
        ];

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const cycle = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        
        stats.recentBills.forEach(b => {
            const date = new Date(b.bill_date);
            const dayName = days[date.getDay()];
            if (dayName && cycle[dayName] !== undefined) cycle[dayName] += parseFloat(b.total_amount || 0);
        });

        return Object.entries(cycle).map(([day, val]) => ({ day, val }));
    }, [stats]);

    return (
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col space-y-5">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <LayoutDashboard className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Governance Overview</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Institutional Authority • Live Feed</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/10 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Registry: Synced
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Specialist Registry', value: stats?.totalDoctors || 0, color: 'var(--luna-teal)' },
                    { label: 'Patient Database', value: stats?.totalPatients || 0, color: 'var(--luna-teal)' },
                    { label: 'Active Sessions', value: stats?.activeConsults || 0, color: 'var(--luna-teal)' },
                    { label: 'Gross Subtotal', value: `₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`, color: 'var(--luna-teal)' },
                ].map((s, i) => (
                    <div key={i} className="p-5 border rounded-2xl bg-[var(--luna-card)] group transition-all hover:border-[var(--luna-teal)]/30 shadow-sm" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                        <p className="text-2xl font-black" style={{ color: s.color }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>            {/* Core Analytics Layer - Institutional Fixed Viewport (Pharmacy-Grade UI) */}
            <div className="grid grid-cols-12 gap-6 flex-grow min-h-0">
                {/* Left Side: Revenue Matrix (Institutional Analytics Box) */}
                <div className="hidden lg:block lg:col-span-4 h-[440px]">
                    <div className="p-8 rounded-2xl border flex flex-col h-full bg-[var(--luna-card)] shadow-sm transition-all hover:bg-white/[0.01]" 
                         style={{ borderColor: 'var(--luna-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-1">
                                <BarChart3 className="w-4 h-4 text-blue-500" />
                                <h2 className="text-[11px] font-black tracking-[0.2em] uppercase" style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Revenue Matrix</h2>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-30">Weekly Cycle Analysis • Real-time</p>
                        </div>
                        <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueCycleData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--luna-teal)" opacity={0.15} />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--luna-text-main)', opacity: 0.7 }} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--luna-text-main)', opacity: 0.5 }}
                                        tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'var(--luna-teal)', fillOpacity: 0.05, radius: 4 }}
                                        contentStyle={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)', borderRadius: '12px', fontSize: '10px', fontWeight: '800', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                                    />
                                    <Bar dataKey="val" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={34} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 pt-6 border-t flex items-center justify-between" style={{ borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-2 transition-transform hover:translate-x-1">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">+12.5% VS LAST CYCLE</span>
                            </div>
                            <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em]">MASTER AUDIT LEVEL</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Transaction Ledger (Stabilized 4-Item Viewport) */}
                <div className="col-span-12 lg:col-span-8 h-[440px]">
                    <div className="rounded-2xl border flex flex-col h-full bg-[var(--luna-card)] shadow-sm overflow-hidden" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="px-8 py-5 border-b flex items-center justify-between bg-white/[0.02]" style={{ borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-4">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                <h1 className="text-[11px] font-black tracking-[0.15em] uppercase" style={{ color: 'var(--luna-text-main)' }}>Transaction Ledger</h1>
                            </div>
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Institutional Sync • Real-time</span>
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => <div key={i} className="h-[80px] w-full animate-pulse border-b" style={{ borderColor: 'var(--luna-border)' }} />)
                            ) : stats?.recentBills?.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                    <Search className="w-8 h-8 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No transactional data identified</p>
                                </div>
                            ) : stats?.recentBills?.map((b, i) => (
                                <div key={i} className="flex items-center justify-between min-h-[85px] py-5 px-8 border-b last:border-b-0 hover:bg-white/[0.02] transition-all group" style={{ borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center gap-5">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-[10px] border shadow-sm bg-[var(--luna-navy)] transition-all group-hover:border-[var(--luna-blue)]/50 group-hover:scale-110" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-blue)' }}>
                                            {b.invoice_number?.split('-').pop()}
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-black uppercase tracking-tight group-hover:text-[var(--luna-teal)] transition-colors" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name}</p>
                                            <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black uppercase tracking-[0.15em] opacity-30">
                                                <span>{b.bill_date}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-500" />
                                                <span className={b.status === 'paid' ? 'text-blue-500' : 'text-amber-500/80'}>{b.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-baseline justify-end gap-1.5">
                                            <span className="text-[10px] font-bold opacity-30">₹</span>
                                            <p className="text-xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{(parseFloat(b.total_amount) || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};



// ── Receptionist Dashboard ──
const ReceptionistOverview = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apptModal, setApptModal] = useState({ open: false });
    const [availableSlots, setAvailableSlots] = useState({});
    
    const { theme } = useTheme();
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [statRes, apptRes, patientRes, doctorRes] = await Promise.all([
                api.get('/dashboard/stats/'),
                api.get('/appointments/'),
                api.get('/patients/'),
                api.get('/doctors/')
            ]);
            setStats(statRes.data);
            setAppointments(apptRes.data.slice(0, 15));
            setPatients(patientRes.data);
            setDoctors(doctorRes.data.filter(d => Boolean(d.status)));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModalFieldChange = async (key, val, allValues) => {
        const date = allValues.date;
        const doctorId = allValues.doctor;
        if (date && doctorId) {
            try {
                const res = await api.get(`appointments/check_availability/?doctor=${doctorId}&date=${date}`);
                setAvailableSlots(res.data.slots || {});
            } catch (e) { console.error("Slot check failure:", e); }
        }
    };

    const apptTimelineData = useMemo(() => {
        const hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        const map = {}; hours.forEach(h => map[h] = 0);
        appointments.forEach(a => {
            const h = a.appointment_time?.split(':')[0];
            if (h && map[h] !== undefined) map[h]++;
        });
        return hours.map(h => ({ name: h, val: map[h] }));
    }, [appointments]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col space-y-6">
            <InputModal
                isOpen={apptModal.open}
                title="Schedule New Clinical Encounter"
                onFieldChange={handleModalFieldChange}
                fields={[
                    { 
                        key: 'patient', 
                        label: 'Authorized Patient', 
                        type: 'select', 
                        options: patients.map(p => ({ label: p.get_name || `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim() || 'Anonymous Record', value: p.id })),
                        initialValue: ''
                    },
                    { 
                        key: 'doctor', 
                        label: 'Assign Specialist', 
                        type: 'select', 
                        options: doctors.map(d => ({ label: `Dr. ${d.get_name || d.user.first_name}`, value: d.id })),
                        initialValue: ''
                    },
                    { key: 'date', label: 'Date of Encounter', type: 'date', initialValue: new Date().toISOString().split('T')[0] },
                    { 
                        key: 'time', 
                        label: 'Time Slot (30m Interval)', 
                        type: 'radio-grid',
                        options: (() => {
                            const TIMES = [];
                            for (let h = 8; h <= 20; h++) {
                                for (let m of ['00', '30']) {
                                    const t = `${h.toString().padStart(2, '0')}:${m}:00`;
                                    TIMES.push({ 
                                        label: `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`, 
                                        value: t,
                                        disabled: availableSlots[t] === false
                                    });
                                }
                            }
                            return TIMES;
                        })(),
                        fullWidth: true
                    },
                    { key: 'description', label: 'Clinical Indication / Symptoms', placeholder: 'Brief description of chief complaint...', fullWidth: true }
                ]}
                onConfirm={(vals) => {
                    const { date, time, description, doctor, patient } = vals;
                    if (!date || !time || !patient || !doctor) {
                        toast.error("Missing critical scheduling parameters.");
                        return;
                    }

                    api.post('appointments/', { appointment_date: date, appointment_time: time, description: description || '', status: 'pending', patient, doctor })
                        .then(() => {
                            toast.success("Encounter definitively scheduled.");
                            setApptModal({ open: false });
                            setAvailableSlots({});
                            fetchData();
                        })
                        .catch((err) => {
                            toast.error(err.response?.data?.error || "Scheduling conflict detected.");
                        });
                }}
                onCancel={() => { setApptModal({ open: false }); setAvailableSlots({}); }}
            />

            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-transform hover:scale-105" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Reception Terminal</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Registry Operations • Clinical Front-Office</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <button 
                        onClick={() => setApptModal({ open: true })}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--luna-blue)] to-[#1e4ed8] text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Consult
                    </button>
                    <Link to="/dashboard/patients" className="px-6 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500/10 transition-all shadow-sm whitespace-nowrap flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> Register Patient
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Registry', value: stats?.total_patients || 0, color: 'var(--luna-blue)' },
                    { label: 'Today Appointments', value: stats?.today_appointments || 0, color: 'var(--luna-primary)' },
                    { label: 'Pending Auth', value: stats?.pending_appointments || 0, color: '#f59e0b' },
                    { label: 'Pending Invoices', value: stats?.pending_bills || 0, color: '#ef4444' },
                ].map((s, i) => (
                    <div key={i} className="p-5 border rounded-2xl shadow-sm bg-[var(--luna-card)] hover:scale-[1.02] transition-transform" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                        <p className="text-2xl font-black" style={{ color: s.color }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Workspace Grid (Full Width) */}
            <div className="flex-grow min-h-0">
                    <div className="rounded-2xl border flex flex-col h-full shadow-sm overflow-hidden bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="px-8 py-5 border-b flex items-center justify-between shadow-sm" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                            <div className="flex items-center gap-4">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <h1 className="text-[11px] font-black tracking-widest uppercase" style={{ color: 'var(--luna-text-main)' }}>Appointment Queue</h1>
                            </div>
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Institutional Registry • Live</span>
                        </div>
                        <div className="px-8 py-4 border-b flex items-center text-[9px] font-black uppercase tracking-[0.2em] opacity-40 bg-[rgba(30,58,138,0.02)]" style={{ borderColor: 'var(--luna-border)' }}>
                            <span className="w-[25%]">Patient Identity</span>
                            <span className="w-[20%]">Specialist</span>
                            <span className="w-[15%]">Specialty</span>
                            <span className="w-[20%]">Contact Registry</span>
                            <span className="w-[20%] text-right">Operational Status</span>
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => <div key={i} className="h-20 w-full animate-pulse border-b" style={{ borderColor: 'var(--luna-border)' }} />)
                            ) : appointments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 opacity-40">
                                    <Search className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No clinical encounters scheduled</p>
                                </div>
                            ) : (
                                appointments.map((a, i) => (
                                    <div key={i} className="flex items-center py-5 px-8 border-b last:border-b-0 hover:bg-[rgba(30,58,138,0.03)] transition-all group cursor-pointer" 
                                         onClick={() => navigate('/dashboard/appointments')}
                                         style={{ borderColor: 'var(--luna-border)' }}>
                                        
                                        <div className="w-[25%] flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[11px] border shadow-sm bg-[var(--luna-navy)] transition-transform group-hover:scale-110" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-primary)' }}>
                                                {a.patientName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black uppercase tracking-tight leading-none" style={{ color: 'var(--luna-text-main)' }}>{a.patientName || 'Anonymous Case'}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1.5">Idx-{String(a.patientId || i).padStart(4, '0')}</p>
                                            </div>
                                        </div>

                                        <div className="w-[20%]">
                                            <p className="text-[11px] font-black uppercase tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Dr. {a.doctorName || 'Unassigned'}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">{a.appointment_time?.slice(0,5)} • Schedule</p>
                                        </div>

                                        <div className="w-[15%]">
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>
                                                {a.doctorDepartment || 'General'}
                                            </span>
                                        </div>

                                        <div className="w-[20%]">
                                            <p className="text-[11px] font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{a.patientMobile || 'No Dial Registry'}</p>
                                            <p className="text-[8px] font-black uppercase tracking-[0.1em] opacity-20 mt-0.5">Primary Contact</p>
                                        </div>

                                        <div className="w-[20%] text-right">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border ${a.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                                {a.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
            </div>
        </motion.div>
    );
};

// ── Staff Overview (Unified Transition Layer) ──
const StaffOverview = ({ user }) => {
    const role = user?.role?.toLowerCase();
    if (role === 'receptionist') return <ReceptionistOverview user={user} />;

    const roleMap = {

        nurse: { title: 'Nurse Station', sub: 'Vitals logging & clinical record tracking', icon: <img src={logo} className="w-16 h-16 opacity-[0.08]" /> },
        lab_technician: { title: 'Lab Terminal', sub: 'Diagnostic testing & reporting operations', icon: <FlaskConical className="w-16 h-16 text-blue-500 opacity-20" /> },
        billing_staff: { title: 'Billing Desk', sub: 'Financial operations & invoice management', icon: <DollarSign className="w-16 h-16 text-blue-500 opacity-20" /> },
    };
    
    const roleProps = roleMap[role] || { title: 'Staff Portal', sub: 'Hospital workspace interface' };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl">
            <div className="p-6 rounded-xl border bg-[var(--luna-card)] shadow-sm" style={{ borderColor: 'var(--luna-border)' }}>
                <h1 className="text-xl font-bold tracking-tight capitalize" style={{ color: 'var(--luna-text-main)' }}>{roleProps.title}</h1>
                <p className="font-bold text-[10px] uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>{roleProps.sub}</p>
            </div>

            <div className="p-8 rounded-xl border bg-[var(--luna-card)] shadow-sm relative overflow-hidden" style={{ borderColor: 'var(--luna-border)' }}>
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--luna-text-main)' }}>Welcome, {user?.username}</h2>
                    <p className="text-sm font-semibold opacity-60 leading-relaxed" style={{ color: 'var(--luna-text-muted)' }}>
                        Welcome to your dashboard. Use the sidebar to navigate your modules and manage your daily tasks.
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20">
                            Session Active
                        </span>
                        <span className="px-4 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20">
                           Role: {user?.role}
                        </span>
                    </div>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.05]">
                    {roleProps.icon}
                </div>
            </div>
        </motion.div>
    );
};

export default Overview;