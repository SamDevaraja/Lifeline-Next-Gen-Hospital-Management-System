import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Users, Calendar, Settings, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, BarChart as BarIcon, Target, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, AreaChart, Area, LineChart } from 'recharts';
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

            // Revenue progression by day
            const revByDay = bills.data.reduce((acc, b) => {
                const day = b.bill_date ? b.bill_date.split('-').slice(1).join('/') : 'N/A';
                acc[day] = (acc[day] || 0) + parseFloat(b.total_amount || 0);
                return acc;
            }, {});
            const revChartData = Object.entries(revByDay)
                .map(([day, revenue]) => ({ day, revenue }))
                .sort((a, b) => a.day.localeCompare(b.day))
                .slice(-15); // Show last 15 active days

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
            toast.error("Analytics synchronization failed.");
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
            
            {/* Institutional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm bg-[var(--luna-card)]"
                        style={{ borderColor: 'var(--luna-border)' }}>
                        <BarIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Clinical Analytics</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>
                            Institutional Performance Hub • Audit Ready
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <div className="px-4 py-2 rounded-xl border bg-[var(--luna-card)] shadow-sm text-[10px] font-black uppercase tracking-widest" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' }}>
                            Live Sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                    <button onClick={fetchReports} 
                        className="px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:bg-blue-700 transition-all bg-blue-600 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Refresh Hub
                    </button>
                </div>
            </div>

            {/* Pulse Grid KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {loading ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse h-20 rounded-xl" style={{ background: 'var(--luna-card)' }} />
                )) : kpiCards.map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Global Operational Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Revenue Momentum Chart */}
                <div className="p-6 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Revenue Momentum</h2>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-0.5">Financial Progression Analysis</p>
                        </div>
                    </div>
                    {!loading && data && (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.revChartData} margin={{ left: -20, right: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--luna-border)" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--luna-text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--luna-text-muted)' }} tickFormatter={v => `₹${(v/1000)}k`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--luna-border)', background: 'var(--luna-card)', fontWeight: 900, fontSize: '10px' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="var(--luna-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--luna-blue)', strokeWidth: 2, stroke: 'var(--luna-card)' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>


                {/* Appointment Load Analysis */}
                <div className="p-6 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Patient Flow</h2>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-0.5">Daily Appointment Distribution</p>
                        </div>
                    </div>
                    {!loading && data && (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.appChartData} margin={{ left: -20, right: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--luna-border)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--luna-text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--luna-text-muted)' }} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--luna-border)', background: 'var(--luna-card)', fontWeight: 900, fontSize: '10px' }} />
                                    <Bar dataKey="count" fill="var(--luna-teal)" radius={[3, 3, 0, 0]} barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Triage Status Map */}
                <div className="p-6 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                    <div className="mb-8">
                        <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Triage Outcomes</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-0.5">Clinical Success vs Delay Rates</p>
                    </div>
                    {!loading && data && (
                        <div className="space-y-5">
                            {data.statusData.map((s, idx) => {
                                const total = data.statusData.reduce((a, b) => a + b.value, 0);
                                const pct = Math.round((s.value / total) * 100);
                                const color = PIE_COLORS[idx % PIE_COLORS.length];
                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>{s.name}</span>
                                            </div>
                                            <span className="text-[12px] font-black" style={{ color }}>{pct}%</span>
                                        </div>
                                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--luna-navy)' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Resource Allocation Map */}
                <div className="p-6 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                    <div className="mb-8">
                        <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Staff Specialization</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-0.5">Medical Resource Density</p>
                    </div>
                    {!loading && data && (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-40 h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.deptData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="transparent">
                                            {data.deptData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black" style={{ color: 'var(--luna-text-main)' }}>{data.kpis.totalDoctors}</span>
                                    <span className="text-[7px] font-black uppercase opacity-40">Specialists</span>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {data.deptData.map((d, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-wider opacity-60" style={{ color: 'var(--luna-text-main)' }}>{d.name}</span>
                                            <span className="text-xs font-bold" style={{ color: 'var(--luna-text-main)' }}>{d.value}</span>
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