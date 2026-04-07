import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Users, Calendar, Settings, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, BarChart as BarIcon, Target, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, AreaChart, Area } from 'recharts';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from './Constants';

const ReportsPage = () => {
    const { theme } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [appts, bills, doctors, patients, tests] = await Promise.all([
                api.get('appointments/'),
                api.get('bills/'),
                api.get('doctors/'),
                api.get('patients/'),
                api.get('lab-tests/').catch(() => ({ data: [] })),
            ]);

            // Appointments by day
            const appByDay = appts.data.reduce((acc, curr) => {
                const day = curr.appointment_date?.split('-')[2] || '?';
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            }, {});
            const appChartData = Object.entries(appByDay)
                .map(([day, count]) => ({ name: `Day ${day}`, count }))
                .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]))
                .slice(-12);

            // Revenue progression
            const revByMonth = bills.data.reduce((acc, b) => {
                const month = b.bill_date ? new Date(b.bill_date).toLocaleString('default', { month: 'short' }) : 'N/A';
                acc[month] = (acc[month] || 0) + parseFloat(b.total_amount || 0);
                return acc;
            }, {});
            const revChartData = Object.entries(revByMonth).map(([month, revenue]) => ({ month, revenue }));

            // Dept distribution
            const deptMap = doctors.data.reduce((acc, d) => {
                if (d.department) acc[d.department] = (acc[d.department] || 0) + 1;
                return acc;
            }, {});
            const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

            // Status distribution
            const statusMap = appts.data.reduce((acc, a) => {
                acc[a.status] = (acc[a.status] || 0) + 1;
                return acc;
            }, {});
            const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

            setData({
                appChartData, revChartData, deptData, statusData,
                kpis: {
                    totalRevenue: bills.data.reduce((a, b) => a + parseFloat(b.total_amount || 0), 0),
                    pendingRevenue: bills.data.filter(b => b.status === 'pending').reduce((a, b) => a + parseFloat(b.total_amount || 0), 0),
                    totalAppts: appts.data.length,
                    todayAppts: appts.data.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length,
                    totalDoctors: doctors.data.length,
                    totalPatients: patients.data.length
                }
            });
            setLastUpdated(new Date());
        } catch (e) {
            console.error("Analytics failure", e);
            toast.error("Intelligence synchronization failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 60000);
        return () => clearInterval(interval);
    }, []);

    const kpiCards = useMemo(() => {
        if (!data) return [];
        return [
            { label: 'Total Revenue', value: `₹${(data.kpis.totalRevenue / 1000).toFixed(1)}k`, color: '#10b981', icon: <DollarSign className="w-6 h-6"/> },
            { label: 'Pending Bills', value: `₹${(data.kpis.pendingRevenue / 1000).toFixed(1)}k`, color: '#f59e0b', icon: <Activity className="w-6 h-6"/> },
            { label: 'Active Schedule', value: data.kpis.totalAppts, color: 'var(--luna-blue)', icon: <Calendar className="w-6 h-6"/> },
            { label: 'Patient Registry', value: data.kpis.totalPatients, color: 'var(--luna-steel)', icon: <Users className="w-6 h-6"/> },
        ];
    }, [data]);

    const PIE_COLORS = ['var(--luna-blue)', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            
            {/* Museum Clean Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Clinical Analytics</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                        Institutional Intelligence Hub • Operational Performance 
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                    <button onClick={fetchReports} 
                        className="btn-primary text-[10px] font-black uppercase tracking-widest px-6 h-[46px] shadow-xl flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Refresh Hub
                    </button>
                </div>
            </div>

            {/* KPI Matrix - Museum Clean Edition */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {loading ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse h-28 rounded-2xl" style={{ background: 'var(--luna-navy)' }} />
                )) : kpiCards.map((s, i) => (
                    <div key={i} className="card p-6 flex items-center gap-5 border shadow-sm"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black border shadow-inner shrink-0"
                            style={{ background: 'var(--luna-navy)', color: s.color, borderColor: 'var(--luna-border)' }}>
                            {s.icon}
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-[12px] font-extrabold uppercase opacity-40 mb-1" style={{ color: 'var(--luna-text-main)' }}>{s.label}</p>
                            <h3 className="text-3xl font-black tracking-tighter leading-none" style={{ color: 'var(--luna-text-main)' }}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Global Intelligence Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Revenue Momentum Chart */}
                <div className="card p-10 border rounded-[2.5rem] shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Revenue Momentum</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Financial Progression Analysis</p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                            <BarIcon className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    {!loading && data && (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.revChartData} margin={{ left: -20, right: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--luna-blue)" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="var(--luna-blue)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--luna-border)" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--luna-text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--luna-text-muted)' }} tickFormatter={v => `₹${(v/1000)}k`} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid var(--luna-border)', background: 'var(--luna-card)', fontWeight: 800, fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--luna-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Appointment Load Analysis */}
                <div className="card p-10 border rounded-[2.5rem] shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Patient Flow</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Daily Appointment Distribution</p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                            <Zap className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    {!loading && data && (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.appChartData} margin={{ left: -20, right: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--luna-border)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--luna-text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--luna-text-muted)' }} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: '16px', border: '1px solid var(--luna-border)', background: 'var(--luna-card)', fontWeight: 800, fontSize: '11px' }} />
                                    <Bar dataKey="count" fill="var(--luna-teal)" radius={[4, 4, 0, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Triage Status Map */}
                <div className="card p-10 border rounded-[2.5rem] shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Triage Outcomes</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Clinical Success vs Delay Rates</p>
                        </div>
                    </div>
                    {!loading && data && (
                        <div className="space-y-6">
                            {data.statusData.map((s, idx) => {
                                const total = data.statusData.reduce((a, b) => a + b.value, 0);
                                const pct = Math.round((s.value / total) * 100);
                                const color = PIE_COLORS[idx % PIE_COLORS.length];
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>{s.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[14px] font-black" style={{ color }}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--luna-navy)' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Resource Allocation Map */}
                <div className="card p-10 border rounded-[2.5rem] shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Medical Resources</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Staff Specialization Density</p>
                        </div>
                    </div>
                    {!loading && data && (
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="relative w-48 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.deptData} innerRadius={60} outerRadius={84} paddingAngle={4} dataKey="value" stroke="transparent">
                                            {data.deptData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black" style={{ color: 'var(--luna-text-main)' }}>{data.kpis.totalDoctors}</span>
                                    <span className="text-[8px] font-black uppercase opacity-40">Staff Units</span>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.deptData.map((d, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: 'var(--luna-text-main)' }}>{d.name}</span>
                                            <span className="text-xs font-black" style={{ color: 'var(--luna-text-main)' }}>{d.value} Specialists</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
            </div>
        </motion.div>
    );
};

export default ReportsPage;