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
            {/* LEDGER HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-6" style={{ borderColor: 'var(--luna-border)' }}>
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        <DollarSign className="w-6 h-6 inline mr-2 text-emerald-500" /> Financial Ledger
                    </h1>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--luna-text-dim)' }}>Track your invoices, payments, and receipts.</p>
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
