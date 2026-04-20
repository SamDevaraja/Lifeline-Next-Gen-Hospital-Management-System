import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, RefreshCw
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/index.js';




import { ConfirmModal, InputModal, DetailsModal } from './Modals';
import { LUNA } from "./Constants";

const LabPage = ({ user }) => {
    const { theme } = useTheme();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const navigate = useNavigate();

    const fetchTests = async () => {
        setLoading(true);
        try {
            let url = 'lab-tests/';
            if (user?.role === 'patient') url += `?patient_id=${user.patient_id}`;
            const res = await api.get(url);
            setTests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [user]);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filtered = React.useMemo(() => {
        return tests.filter(t => {
            const matchesSearch = t.test_name.toLowerCase().includes(search.toLowerCase()) || 
                                 t.category.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [tests, search, categoryFilter]);

    const CATEGORIES = [...new Set(tests.map(t => t.category))];
    const abnormal = tests.filter(t => t.is_abnormal);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            <DetailsModal
                isOpen={detailsModal.open}
                title="Lab Test Details"
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />

            {/* Institutional Header */}
            <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Laboratory Results</h1>
                    <button onClick={fetchTests} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Live Sync</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                        <input 
                            type="text"
                            placeholder="Search tests..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none transition-all shadow-sm bg-[var(--luna-card)]"
                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        />
                    </div>
                    <div className="relative">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest border rounded-xl appearance-none cursor-pointer focus:outline-none transition-all shadow-sm bg-[var(--luna-card)]"
                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        >
                            <option value="all">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30 rotate-90 pointer-events-none" />
                    </div>
                </div>
            </header>

            {/* Minimal Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Procedures', value: tests.length, color: 'var(--luna-teal)' },
                    { label: 'Abnormalities', value: abnormal.length, color: '#ef4444' },
                    { label: 'Verified Results', value: tests.filter(t => !t.is_abnormal).length, color: '#10b981' },
                    { label: 'Institutional Sync', value: 'LIVE', color: '#6366f1' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Combined Registry Table - Zero-Overflow Protocol */}
            <div className="border rounded-xl shadow-sm bg-[var(--luna-card)] border-[var(--luna-border)] overflow-hidden">
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] w-[40%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Investigation Name</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Category</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center w-[20%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Diagnostic Result</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center hidden sm:table-cell w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status Layer</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right w-[10%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="5" className="px-4 py-8 animate-pulse text-center opacity-40 text-[10px] font-black uppercase tracking-widest">
                                            Synchronizing Pathology Registry...
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-28 text-center" style={{ color: 'var(--luna-text-main)' }}>
                                        <div className="flex flex-col items-center">
                                            <Search className="w-12 h-12 opacity-10 mb-4" />
                                            <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase">Clean Registry</h3>
                                            <p className="text-[10px] font-semibold opacity-30 mt-1 uppercase tracking-tighter">No diagnostics found matching this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((t, i) => (
                                <tr key={i} className="border-b hover:bg-[var(--luna-navy)] transition-colors group" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-4 py-4 w-[40%]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 bg-[var(--luna-navy)] border-[var(--luna-border)]">
                                                {t.image_data ? <img src={t.image_data} alt="scan" className="w-full h-full rounded-lg object-cover" /> : <FlaskConical className="w-4 h-4 opacity-40" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[13px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{t.test_name}</p>
                                                <p className="text-[9px] font-bold opacity-30 mt-0.5 uppercase tracking-wider">{new Date(t.test_date).toLocaleDateString()} • Synced</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden sm:table-cell w-[15%]">
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-lg border bg-[var(--luna-navy)] transition-all" style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center w-[20%]">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-extrabold" style={{ color: t.is_abnormal ? '#ef4444' : 'var(--luna-text-main)' }}>{t.result_value} {t.unit}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">Ref: {t.reference_range}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center hidden sm:table-cell w-[15%]">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.05em] border transition-all ${
                                            t.is_abnormal ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${t.is_abnormal ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                            {t.is_abnormal ? 'Critical' : 'Nominal'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right w-[10%]">
                                        <button 
                                            onClick={() => setDetailsModal({ open: true, item: t })}
                                            className="p-2.5 rounded-lg border bg-[var(--luna-card)] border-[var(--luna-border)] text-[var(--luna-text-dim)] hover:bg-[var(--luna-primary)]/5 transition-all shadow-sm"
                                        >
                                            <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="text-center pb-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Lifeline Laboratory Information Management System</p>
            </footer>
        </motion.div>
    );
};

export default LabPage;
