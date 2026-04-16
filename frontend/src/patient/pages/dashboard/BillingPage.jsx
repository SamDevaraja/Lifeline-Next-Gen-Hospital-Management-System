import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, Download, Eye, Receipt
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
            if (user?.role === 'patient') url += `?patient_id=${user.patient_id}`;
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
            {/* LEDGER HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-6" style={{ borderColor: 'var(--luna-border)' }}>
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        <DollarSign className="w-6 h-6 inline mr-2 text-emerald-500" /> Billing & Payments
                    </h1>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--luna-text-dim)' }}>View and manage your invoices, payments, and receipts.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 border rounded-lg p-1 shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    {['all', 'paid', 'pending'].map(f => (
                        <button key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${statusFilter === f ? 'bg-emerald-500 text-white' : 'hover:bg-white/5'}`}
                            style={{ color: statusFilter === f ? '#fff' : 'var(--luna-text-muted)' }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>


            <div className="card overflow-hidden p-0">
                <table className="table-clinical">
                    <thead><tr><th>Invoice #</th><th>Patient</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading bills...</td></tr>
                        ) : filteredBills.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-28" style={{ color: 'var(--luna-text-main)' }}>
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/5 opacity-20">
                                            <Search className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase mb-1">No Results Found</h3>
                                        <p className="text-xs font-semibold opacity-30 max-w-[320px] leading-relaxed">
                                            No matches found. Please try a different search term.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                                                ) : (
                            filteredBills.map((b, i) => (
                                <tr key={b.id || i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
                                                style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                                <Receipt className="w-4 h-4 opacity-40" />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-[14px]" style={{ color: 'var(--luna-text-main)' }}>{b.invoice_number}</p>
                                                <p className="text-[9px] font-semibold uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-muted)' }}>ID: {String(b.id).padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-medium text-[13px]" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name || 'Emergency Guest'}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[10px] font-bold opacity-30" style={{ color: 'var(--luna-text-main)' }}>₹</span>
                                            <p className="font-extrabold text-[15px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{parseFloat(b.total_amount).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest" style={{ color: 'var(--luna-text-muted)' }}>{b.bill_date}</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            b.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setDetailsModal({ open: true, item: b })}
                                                className="p-2 rounded-lg border hover:bg-white/5 transition-all opacity-40 hover:opacity-100"
                                                style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadPDF(b.id, b.invoice_number)}
                                                className="p-2 rounded-lg border hover:bg-white/5 transition-all opacity-40 hover:opacity-100"
                                                style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// ── Records Page ──

export default BillingPage;
