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




import { ConfirmModal, InputModal, DetailsModal } from './Modals';
import { LUNA } from "./Constants";

const BillingPage = ({ user }) => {
    const { theme } = useTheme();
    const [allBills, setAllBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });

    const fetchBills = async () => {
        setLoading(true);
        try {
            let url = 'bills/';
            if (user?.role === 'patient') url += `?patient_id=${user.id}`;
            const res = await api.get(url);
            setAllBills(res.data);
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
            <DetailsModal
                isOpen={detailsModal.open}
                title={`Clinical Invoice: ${detailsModal.item?.invoice_number}`}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Billing & Payments</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>Generate and manage invoices, receipts, and payments</p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role === 'admin' && (
                        <button className="btn-primary text-sm px-5 py-2.5 h-[42px]">
                            <Plus className="w-4 h-4" /> New Invoice
                        </button>
                    )}
                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer transition-all appearance-none pr-10 shadow-lg h-[46px]"
                            style={{ background: 'var(--luna-navy)', color: theme === 'dark' ? 'white' : 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}
                        >
                            {['all', 'paid', 'pending'].map(f => (
                                <option key={f} value={f} className="font-black" style={{ background: 'var(--luna-card)', color: theme === 'dark' ? 'white' : 'var(--luna-blue)', fontWeight: '900' }}>{f} status</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:scale-110" style={{ color: theme === 'dark' ? 'white' : 'var(--luna-blue)' }}>
                            <Filter className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${(stats.total / 1000).toFixed(1)}k`, color: LUNA.success_text, bg: LUNA.success_bg },
                    { label: 'Pending Bills', value: `₹${(stats.pending / 1000).toFixed(1)}k`, color: LUNA.warn_text, bg: LUNA.warn_bg },
                    { label: 'Paid Today', value: `₹${(stats.paidToday / 1000).toFixed(1)}k`, color: LUNA.info_text, bg: LUNA.info_bg },
                    { label: 'Active Invoices', value: stats.count, color: LUNA.steel, bg: 'var(--luna-navy)' }
                ].map((s, i) => (
                    <div key={i} className="card text-center py-6 shadow-sm border" style={{ borderColor: 'var(--luna-border)', background: s.bg }}>
                        <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>
            <div className="card overflow-hidden p-0">
                <table className="table-clinical">
                    <thead><tr><th>Invoice #</th><th>Patient</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading bills...</td></tr>
                        ) : filteredBills.length > 0 ? filteredBills.map((b, i) => (
                            <tr key={b.id || i}>
                                <td className="font-bold text-sm" style={{ color: 'var(--luna-text-dim)' }}>{b.invoice_number}</td>
                                <td className="font-semibold text-sm" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name || 'Unknown Patient'}</td>
                                <td className="font-extrabold text-sm" style={{ color: 'var(--luna-text-main)' }}>₹{parseFloat(b.total_amount).toLocaleString()}</td>
                                <td className="text-sm" style={{ color: 'var(--luna-text-muted)' }}>{b.bill_date}</td>
                                <td><span className={b.status === 'paid' ? 'badge-success' : 'badge-warn'}>{b.status.toUpperCase()}</span></td>
                                <td><div className="flex gap-2">
                                    <button onClick={() => setDetailsModal({ open: true, item: b })} className="text-xs font-bold px-3 py-1.5 rounded-lg border hover:-translate-y-0.5 transition-all" style={{ color: 'var(--luna-teal)', borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                                        Details
                                    </button>
                                    <button onClick={() => handleDownloadPDF(b.id, b.invoice_number)} className="text-xs font-bold px-3 py-1.5 rounded-lg hover:-translate-y-0.5 transition-all" style={{ color: 'var(--luna-teal)', background: 'var(--luna-navy)' }}>
                                        <FileText className="w-3 h-3 inline mr-1" />PDF
                                    </button>
                                </div></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center py-16 text-gray-400 italic">No bills found in registry.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// ── Records Page ──

export default BillingPage;