import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, Download, Eye, Receipt, RefreshCw
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

const BillingPage = ({ user }) => {
    const { theme } = useTheme();
    const [allBills, setAllBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    const fetchBills = async () => {
        setLoading(true);
        try {
            let url = 'bills/';
            if (user?.role === 'patient') url += `?patient_id=${user.patient_id}`;
            const res = await api.get(url);
            setAllBills(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Billing sync failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, [user]);

    const filteredBills = React.useMemo(() => {
        if (statusFilter === 'all') return allBills;
        return allBills.filter(b => b.status === statusFilter);
    }, [allBills, statusFilter]);

    const handleDownloadPDF = async (id, invoiceNum) => {
        try {
            toast.loading('Generating PDF...', { id: 'pdf' });
            const res = await api.get(`bills/${id}/generate_pdf/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Lifeline_Invoice_${invoiceNum}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success('Invoice ready.', { id: 'pdf' });
        } catch (err) {
            toast.error('PDF Engine error.', { id: 'pdf' });
        }
    };

    const stats = {
        total: allBills.reduce((acc, b) => acc + parseFloat(b.total_amount), 0),
        pending: allBills.filter(b => b.status === 'pending').reduce((acc, b) => acc + parseFloat(b.total_amount), 0),
        paidToday: allBills.filter(b => b.status === 'paid' && b.bill_date === new Date().toISOString().split('T')[0]).reduce((acc, b) => acc + parseFloat(b.total_amount), 0),
        count: allBills.length
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            <DetailsModal
                isOpen={detailsModal.open}
                title={`Invoice: ${detailsModal.item?.invoice_number}`}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />

            {/* Institutional Header */}
            <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Billing & Invoices</h1>
                    <button onClick={fetchBills} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Account Status</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-3 px-4 py-2 text-xs border rounded-xl bg-[var(--luna-card)] transition-all hover:bg-white/5"
                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        >
                            <Filter className="w-3 h-3 opacity-40" />
                            <span className="font-bold uppercase tracking-widest text-[9px]">{statusFilter === 'all' ? 'Filtering' : statusFilter}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 5 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-48 rounded-xl border z-50 overflow-hidden shadow-2xl"
                                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', backdropFilter: 'blur(20px)' }}
                                >
                                    <div className="p-1 space-y-1">
                                        {['all', 'paid', 'pending'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => { setStatusFilter(f); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === f ? 'bg-white/10 text-white' : 'hover:bg-white/5 opacity-50'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Institutional Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Pending Payment', value: '₹' + stats.pending.toLocaleString(), color: '#ef4444' },
                    { label: 'Paid Today', value: '₹' + stats.paidToday.toLocaleString(), color: '#10b981' },
                    { label: 'Total Billed', value: '₹' + stats.total.toLocaleString(), color: 'var(--luna-teal)' },
                    { label: 'Total Invoices', value: stats.count, color: '#6366f1' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Invoices List */}
            <div className="border rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] w-[45%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Document ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell text-center w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell text-center w-[10%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="5" className="px-6 py-8 animate-pulse text-center opacity-40 text-xs font-bold uppercase tracking-widest">
                                            Reconciling Institutional Ledgers...
                                        </td>
                                    </tr>
                                ))
                            ) : filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-28 text-center" style={{ color: 'var(--luna-text-main)' }}>
                                        <div className="flex flex-col items-center">
                                            <Receipt className="w-12 h-12 opacity-10 mb-4" />
                                            <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase">No Transactions</h3>
                                            <p className="text-xs font-semibold opacity-30 mt-1">No billing history found in this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBills.map((b, i) => (
                                <tr key={b.id || i} className="border-b hover:bg-[var(--luna-navy)] transition-colors" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-6 py-4 w-[45%]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 bg-[var(--luna-navy)] border-[var(--luna-border)]">
                                                <Receipt className="w-4 h-4 opacity-40" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm tracking-tight">{b.invoice_number}</p>
                                                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">{b.service_type || 'Digital Invoice'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell text-center w-[15%]">
                                        <p className="text-[12px] font-bold tracking-tight opacity-70" style={{ color: 'var(--luna-text-main)' }}>{b.bill_date}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center w-[15%]">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-[11px] font-bold opacity-30">₹</span>
                                            <p className="font-bold text-sm tracking-tight">{parseFloat(b.total_amount).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell text-center w-[10%]">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                b.status === 'paid' ? 'badge-success' : 'badge-warn'
                                            }`} style={{ border: 'none' }}>
                                                {b.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right w-[15%]">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setDetailsModal({ open: true, item: b })}
                                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadPDF(b.id, b.invoice_number)}
                                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="text-center pb-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Secure Institutional Financial Exchange Protocol</p>
            </footer>
        </motion.div>
    );
};

export default BillingPage;
