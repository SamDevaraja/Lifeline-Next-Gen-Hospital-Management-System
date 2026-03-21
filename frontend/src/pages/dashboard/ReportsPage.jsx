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




const ReportsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchReports = async () => {
        try {
            const [appts, bills, doctors, patients, tests] = await Promise.all([
                api.get('appointments/'),
                api.get('bills/'),
                api.get('doctors/'),
                api.get('patients/'),
                api.get('lab-tests/').catch(() => ({ data: [] })),
            ]);

            // Appointments by day of month
            const appByDay = appts.data.reduce((acc, curr) => {
                const day = curr.appointment_date?.split('-')[2] || '?';
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            }, {});
            const appChartData = Object.entries(appByDay)
                .map(([day, count]) => ({ day: `Day ${day}`, count }))
                .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]))
                .slice(-14);

            // Revenue by month
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

            // Appointment status breakdown
            const statusMap = appts.data.reduce((acc, a) => {
                acc[a.status] = (acc[a.status] || 0) + 1;
                return acc;
            }, {});
            const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

            // KPIs
            const totalRevenue = bills.data.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0);
            const pendingRevenue = bills.data.filter(b => b.status === 'pending').reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0);
            const todayAppts = appts.data.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length;
            const abnormalTests = tests.data.filter(t => t.is_abnormal).length;

            setData({
                appChartData,
                revChartData,
                deptData,
                statusData,
                kpis: {
                    totalRevenue,
                    pendingRevenue,
                    totalAppts: appts.data.length,
                    todayAppts,
                    totalDoctors: doctors.data.length,
                    totalPatients: patients.data.length,
                    abnormalTests,
                    paidBills: bills.data.filter(b => b.status === 'paid').length,
                },
                statusBreakdown: appts.data.reduce((acc, a) => {
                    acc[a.status] = (acc[a.status] || 0) + 1;
                    return acc;
                }, {}),
            });
            setLastUpdated(new Date());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 30000);
        return () => clearInterval(interval);
    }, []);

    const PIE_COLORS = [
        'var(--luna-teal)',
        '#6366f1',
        'var(--luna-success-text)',
        'var(--luna-warn-text)',
        'var(--luna-info-text)',
        'var(--luna-danger-text)'
    ];

    const kpiCards = data ? [
        { label: 'Revenue', value: `₹${(data.kpis.totalRevenue / 1000).toFixed(1)}k`, sub: `₹${(data.kpis.pendingRevenue / 1000).toFixed(1)}k pending`, color: 'var(--luna-success-text)', bg: 'var(--luna-success-bg)', icon: <DollarSign className="w-6 h-6" /> },
        { label: 'Appointments', value: data.kpis.totalAppts, sub: `${data.kpis.todayAppts} scheduled today`, color: 'var(--luna-teal)', bg: 'var(--luna-info-bg)', icon: <Calendar className="w-6 h-6" /> },
        { label: 'Active Doctors', value: data.kpis.totalDoctors, sub: `${data.deptData.length} specializations`, color: 'var(--luna-info-text)', bg: 'var(--luna-info-bg)', icon: <Stethoscope className="w-6 h-6" /> },
        { label: 'Patients', value: data.kpis.totalPatients, sub: 'Total registered', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', icon: <HeartPulse className="w-6 h-6" /> },
    ] : [];

    const shimmer = <div className="animate-shimmer rounded-3xl w-full" style={{ height: '300px' }} />;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto pb-10">

            {/* Header Section */}
            <div className="flex items-end justify-between border-b border-black/[0.03] pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Reports & Analytics</h1>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 block" style={{ color: 'var(--luna-text-muted)' }}>Hospital Intelligence Command</p>
                </div>
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)', background: 'var(--luna-card)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Synchronized: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                    <button onClick={fetchReports} className="p-2.5 rounded-xl border transition-all hover:bg-black/5 active:scale-95" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                        <TrendingUp className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Top KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="animate-shimmer h-32 rounded-[2rem]" />
                )) : kpiCards.map((k, i) => (
                    <div key={i} className="rounded-[2rem] p-6 border flex items-center gap-5 transition-all hover:shadow-xl hover:-translate-y-1 shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: k.bg, color: k.color }}>
                            {k.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 opacity-50" style={{ color: 'var(--luna-text-main)' }}>{k.label}</p>
                            <h3 className="text-2xl font-black tracking-tight leading-none" style={{ color: 'var(--luna-text-main)' }}>{k.value}</h3>
                            <p className="text-[10px] font-bold mt-2 truncate" style={{ color: 'var(--luna-text-dim)' }}>{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bookings Analysis */}
                <div className="rounded-[2.5rem] p-10 border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Appointment Volume</h2>
                            <p className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: 'var(--luna-text-dim)' }}>Global scheduling trends (30 days)</p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                            <Calendar className="w-5 h-5" style={{ color: 'var(--luna-text-dim)' }} />
                        </div>
                    </div>
                    {loading ? shimmer : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.appChartData} barSize={8} margin={{ left: -25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--luna-border)" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--luna-text-dim)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--luna-text-dim)' }} />
                                <Tooltip cursor={{ fill: 'var(--luna-navy)', opacity: 0.4 }} contentStyle={{ borderRadius: '16px', border: '1px solid var(--luna-border)', background: 'var(--luna-card)', color: 'var(--luna-text-main)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '11px' }} />
                                <Bar dataKey="count" fill="var(--luna-teal)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Revenue Intelligence */}
                <div className="rounded-[2.5rem] p-10 border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Revenue Progression</h2>
                            <p className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: 'var(--luna-text-dim)' }}>Monthly financial velocity</p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ background: 'var(--luna-success-bg)', borderColor: 'var(--luna-success-text)', opacity: 0.8 }}>
                            <TrendingUp className="w-5 h-5" style={{ color: 'var(--luna-success-text)' }} />
                        </div>
                    </div>
                    {loading ? shimmer : (
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={data.revChartData} margin={{ left: -10 }}>
                                <defs>
                                    <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--luna-success-text)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--luna-success-text)" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--luna-border)" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--luna-text-dim)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--luna-text-dim)' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid var(--luna-border)', background: 'var(--luna-card)', color: 'var(--luna-text-main)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '11px' }} />
                                <Bar dataKey="revenue" fill="url(#revBarGrad)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line type="monotone" dataKey="revenue" stroke="var(--luna-success-text)" strokeWidth={3} dot={{ r: 4, fill: 'var(--luna-success-text)', strokeWidth: 2, stroke: 'var(--luna-card)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Secondary Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Specializations Distribution */}
                <div className="rounded-[2.5rem] p-10 border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="mb-10">
                        <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Clinical Specialization</h2>
                        <p className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: 'var(--luna-text-dim)' }}>Medical resource allocation map</p>
                    </div>
                    {loading ? shimmer : data.deptData.length > 0 ? (
                        <div className="flex flex-col xl:flex-row items-center justify-center gap-10">
                            <div className="relative w-[240px] h-[240px] flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.deptData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={78}
                                            outerRadius={102}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="transparent"
                                            cornerRadius={4}
                                        >
                                            {data.deptData.map((_, idx) => (
                                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid var(--luna-border)', background: 'var(--luna-card)', color: 'var(--luna-text-main)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black mb-0.5" style={{ color: 'var(--luna-text-main)' }}>{data.deptData.reduce((a, b) => a + b.value, 0)}</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--luna-text-main)' }}>Units</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full max-w-[320px] flex flex-col gap-3">
                                {data.deptData.map((d, idx) => {
                                    const total = data.deptData.reduce((a, b) => a + b.value, 0);
                                    const pct = Math.round((d.value / total) * 100);
                                    return (
                                        <div key={idx} className="flex items-center justify-between py-1 px-2 group transition-all rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                            <div className="flex items-center gap-4 min-w-0 pr-4">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] transition-colors truncate" style={{ color: 'var(--luna-text-dim)' }}>{d.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="h-1 w-10 rounded-full overflow-hidden" style={{ background: 'rgba(71, 85, 105, 0.25)' }}>
                                                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                                </div>
                                                <span className="text-[11px] font-black w-4 text-right" style={{ color: 'var(--luna-text-main)' }}>{d.value}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : <p className="text-center py-20 italic text-sm" style={{ color: 'var(--luna-text-dim)' }}>Inventory scan complete: No data available.</p>}
                </div>

                {/* Outcome Analysis */}
                <div className="rounded-[2.5rem] p-10 border shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="mb-10">
                        <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Appointment Triage</h2>
                        <p className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: 'var(--luna-text-dim)' }}>Global success vs cancel rates</p>
                    </div>
                    {loading ? shimmer : data.statusData.length > 0 ? (
                        <div className="space-y-7">
                            {data.statusData.map((s, idx) => {
                                const total = data.statusData.reduce((a, b) => a + b.value, 0);
                                const pct = Math.round((s.value / total) * 100);
                                const statusColors = {
                                    confirmed: 'var(--luna-success-text)',
                                    pending: 'var(--luna-warn-text)',
                                    cancelled: 'var(--luna-danger-text)',
                                    completed: 'var(--luna-teal)'
                                };
                                const color = statusColors[s.name] || 'var(--luna-text-dim)';
                                return (
                                    <div key={idx} className="space-y-2.5">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>{s.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black" style={{ color }}>{pct}%</span>
                                                <span className="text-[10px] font-bold border-l pl-2" style={{ color: 'var(--luna-text-dim)', borderColor: 'var(--luna-border)' }}>{s.value} units</span>
                                            </div>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden shadow-inner" style={{ background: 'rgba(71, 85, 105, 0.3)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 1.2, ease: "circOut", delay: idx * 0.1 }}
                                                className="h-full rounded-full"
                                                style={{ background: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-center py-20 italic text-sm" style={{ color: 'var(--luna-text-dim)' }}>Stream static: Waiting for event data.</p>}
                </div>
            </div>


        </motion.div>
    );
};

// ── Settings Page ──

export default ReportsPage;