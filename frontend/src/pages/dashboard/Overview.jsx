import React, { useEffect, useState, useRef, useMemo } from 'react';
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
    if (role === 'admin') return <AdminOverview user={user} />;
    if (role === 'pharmacist') return <PharmacistOverview user={user} />;
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

            {/* Synchronized Institutional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border shadow-sm bg-[var(--luna-card)]" 
                 style={{ borderColor: 'var(--luna-border)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <Stethoscope className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Physician Terminal</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Lead Specialist • Dr. {user.last_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
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
                        className="px-4 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest bg-blue-500/5 text-blue-500 border-blue-500/10 hover:bg-blue-500/10 transition-all flex items-center gap-2"
                    >
                        <Video className="w-3.5 h-3.5" />
                        Meeting Bridge
                    </button>
                    <div className="px-4 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/10">
                        Registry: Synced
                    </div>
                </div>
            </div>

            {/* Pulse Grid Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Patient Registry', value: stats?.total_patients || 0, color: 'var(--luna-blue)' },
                    { label: 'Daily Consults', value: stats?.today_appointments || 0, color: 'var(--luna-primary)' },
                    { label: 'Pending Auth', value: stats?.pending_appointments || 0, color: 'var(--luna-primary)' },
                    { label: 'Clinical Records', value: stats?.total_records || 0, color: 'var(--luna-primary)' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-xl font-bold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Workspace Grid (3:9) */}
            <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
                <div className="hidden lg:block lg:col-span-3 h-full">
                    <div className="p-6 rounded-xl border flex flex-col h-full shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="mb-6">
                            <h2 className="text-sm font-bold tracking-tight uppercase opacity-60" style={{ color: 'var(--luna-text-main)' }}>Encounter Load</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-20 mt-0.5">Real-time Demand Map</p>
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
                                    <Bar dataKey="val" fill="var(--luna-primary)" radius={[2, 2, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-9 h-full">
                    <div className="rounded-xl border flex flex-col h-full shadow-sm overflow-hidden bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="p-4 border-b flex items-center justify-between shadow-sm" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <h2 className="text-sm font-bold tracking-tight uppercase" style={{ color: 'var(--luna-text-main)' }}>Consultation Queue</h2>
                            </div>
                            <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Live Registry Sync</span>
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => <div key={i} className="h-20 w-full animate-pulse border-b" style={{ borderColor: 'var(--luna-border)' }} />)
                            ) : stats?.myAppointments?.map((a, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-b last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-all group" style={{ borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] border shadow-sm" style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)', color: i % 2 === 0 ? 'var(--luna-teal)' : 'var(--luna-blue)' }}>
                                            {a.patientName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{a.patientName}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[9px] font-bold uppercase tracking-widest opacity-40">
                                                <span>{a.appointment_time?.slice(0,5)}</span>
                                                <span className={a.status === 'confirmed' ? 'text-emerald-500' : 'text-slate-500'}>{a.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleStartCall(a.id, a.meeting_link)}
                                            className="px-4 py-2 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary-hover shadow-sm active:scale-95"
                                        >
                                            {a.meeting_link ? 'Resume' : 'Initiate'}
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col space-y-6">
            {/* Standard Institutional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border shadow-sm bg-[var(--luna-card)]" 
                 style={{ borderColor: 'var(--luna-border)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <LayoutDashboard className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>System Governance</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Institutional Terminal • Administrative Authority</p>
                    </div>
                </div>
                <div className="px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest bg-blue-500/5 text-blue-500 border-blue-500/10">
                    System Status: Operational
                </div>
            </div>

            {/* Pulse Grid Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Medical Staff', value: stats?.totalDoctors || 0, color: 'var(--luna-blue)' },
                    { label: 'Patient Registry', value: stats?.totalPatients || 0, color: 'var(--luna-primary)' },
                    { label: 'Daily Consults', value: stats?.activeConsults || 0, color: 'var(--luna-primary)' },
                    { label: 'Gross Revenue', value: `₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`, color: 'var(--luna-primary)' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-xl font-bold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Workspace Grid (3:9) */}
            <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
                <div className="hidden lg:block lg:col-span-3 h-full">
                    <div className="p-6 rounded-xl border flex flex-col h-full shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="mb-6">
                            <h2 className="text-sm font-bold tracking-tight uppercase opacity-60" style={{ color: 'var(--luna-text-main)' }}>Revenue Matrix</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-20 mt-0.5">Weekly Cycle Analysis</p>
                        </div>
                        <div className="flex-grow min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <BarChart data={revenueCycleData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--luna-border)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--luna-text-muted)' }} />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        width={35} 
                                        tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--luna-text-muted)' }}
                                        tickFormatter={(val) => val > 0 ? `${(val/1000).toFixed(0)}k` : val}
                                    />
                                    <Bar dataKey="val" fill="var(--luna-primary)" radius={[0, 0, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-9 h-full">
                    <div className="rounded-xl border flex flex-col h-full shadow-sm overflow-hidden bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="p-4 border-b flex items-center justify-between shadow-sm" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                <h2 className="text-sm font-bold tracking-tight uppercase" style={{ color: 'var(--luna-text-main)' }}>Transaction Ledger</h2>
                            </div>
                            <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Live Sync Status</span>
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => <div key={i} className="h-14 w-full animate-pulse border-b" style={{ borderColor: 'var(--luna-border)' }} />)
                            ) : stats?.recentBills?.map((b, i) => (
                                <div key={i} className="flex items-center justify-between p-4 px-6 border-b last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-all" style={{ borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] border shadow-sm" style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)', color: i % 2 === 0 ? 'var(--luna-teal)' : 'var(--luna-blue)' }}>
                                            {b.invoice_number?.split('-').pop()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[9px] font-bold uppercase tracking-widest opacity-40">
                                                <span>{b.bill_date}</span>
                                                <span className={b.status === 'paid' ? 'text-blue-500' : 'text-slate-500'}>{b.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-baseline justify-end gap-1">
                                            <span className="text-[10px] font-bold opacity-30">₹</span>
                                            <p className="text-lg font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{(parseFloat(b.total_amount) || 0).toLocaleString()}</p>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border shadow-sm" 
                 style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <Pill className="w-6 h-6" style={{ color: 'var(--luna-blue)' }} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Dispensary Hub</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Institutional Inventory Intel</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/dashboard/dispensary" className="px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-sm hover:bg-primary-hover transition-all bg-primary">Open Dispensary</Link>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Active Queue', value: stats?.queue || 0, color: 'var(--luna-primary)' },
                    { label: 'Critical Assets', value: stats?.critical || 0, color: 'var(--luna-danger-text)' },
                    { label: 'Total Units', value: stats?.inventory || 0, color: 'var(--luna-teal)' },
                    { label: 'Revenue Est.', value: `₹${(stats?.revenue || 0).toLocaleString()}`, color: 'var(--luna-success-text)' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-xl font-bold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                    </div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border shadow-sm flex flex-col" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Inbound Traffic</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-muted)' }}>Hourly Distribution Map</p>
                        </div>
                        <Activity className="w-4 h-4 opacity-20" />
                    </div>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 30, 85, 45, 90, 60].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div className="w-full rounded-none opacity-60" style={{ height: `${h}%`, background: 'var(--luna-primary)' }} />
                                <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">H-0{i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-xl border shadow-sm relative overflow-hidden flex flex-col justify-center" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-[var(--luna-bg)]" style={{ borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80" style={{ color: 'var(--luna-text-main)' }}>Regulatory Clinical Status</span>
                            </div>
                            <ArrowRight className="w-3 h-3 opacity-20" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-[var(--luna-bg)]" style={{ borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80" style={{ color: 'var(--luna-text-main)' }}>Archival Data Encryption</span>
                            </div>
                            <ArrowRight className="w-3 h-3 opacity-20" />
                        </div>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

// ── Staff Overview (Nurse, Receptionist, Pharmacist) ──
const StaffOverview = ({ user }) => {
    const roleMap = {
        receptionist: { title: 'Reception Desk', sub: 'Patient registration & scheduling operations', icon: <Users className="w-16 h-16 text-blue-500 opacity-20" /> },
        pharmacist: { title: 'Pharmacy Terminal', sub: 'Inventory management & prescription dispensing', icon: <Pill className="w-16 h-16 text-blue-500 opacity-20" /> },
        nurse: { title: 'Nurse Station', sub: 'Vitals logging & clinical record tracking', icon: <img src={logo} className="w-16 h-16 opacity-[0.08]" /> },
        lab_technician: { title: 'Lab Terminal', sub: 'Diagnostic testing & reporting operations', icon: <FlaskConical className="w-16 h-16 text-blue-500 opacity-20" /> },
        billing_staff: { title: 'Billing Desk', sub: 'Financial operations & invoice management', icon: <DollarSign className="w-16 h-16 text-blue-500 opacity-20" /> },
    };
    
    const roleProps = roleMap[user?.role?.toLowerCase()] || { title: 'Staff Portal', sub: 'Hospital workspace interface' };

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