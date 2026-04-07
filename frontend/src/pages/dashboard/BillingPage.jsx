import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DollarSign, Search, Plus, Filter, FileText, Download, Eye, 
    TrendingUp, CreditCard, Receipt, Clock, CheckCircle2, ChevronRight,
    ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from './Constants';
import { ConfirmModal, InputModal, DetailsModal } from './Modals';

const BillingPage = ({ user }) => {
    const { theme } = useTheme();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // UI Modal State
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const [invoiceModal, setInvoiceModal] = useState({ open: false });

    const fetchBills = async () => {
        setLoading(true);
        try {
            let url = 'bills/';
            if (user?.role === 'patient') url += `?patient_id=${user.id}`;
            const res = await api.get(url);
            setBills(res.data);
        } catch (err) {
            console.error("Billing sync failed:", err);
            toast.error("Financial records sync failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, [user]);

    const filtered = useMemo(() => {
        return (bills || []).filter(b => {
            const matchesSearch = (b.invoice_number || '').toLowerCase().includes(search.toLowerCase()) || 
                                 (b.patient_name || '').toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bills, search, statusFilter]);

    const stats = useMemo(() => {
        const sb = bills || [];
        return {
            revenue: sb.reduce((a, b) => a + parseFloat(b.total_amount || 0), 0),
            pending: sb.filter(b => b.status === 'pending').reduce((a, b) => a + parseFloat(b.total_amount || 0), 0),
            paidToday: sb.filter(b => b.status === 'paid' && b.bill_date === new Date().toISOString().split('T')[0]).reduce((a, b) => a + parseFloat(b.total_amount || 0), 0),
            count: sb.length
        };
    }, [bills]);

    const handleDownloadPDF = async (id, invoiceNum) => {
        try {
            toast.loading(`Synchronizing PDF: ${invoiceNum}...`, { id: 'pdf' });
            const res = await api.get(`bills/${id}/generate_pdf/`, { responseType: 'blob' });
            
            // Validate response is indeed a PDF to prevent saving error pages as PDFs
            if (res.data.type !== 'application/pdf') {
                const text = await res.data.text();
                throw new Error(`Data Typology Error: Expected Binary/PDF, Received ${res.data.type}. Payload: ${text.substring(0, 100)}`);
            }

            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Lifeline_Invoice_${invoiceNum}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Invoice Synchronized.', { id: 'pdf' });
        } catch (err) {
             console.error('Neural Core PDF Link Failure:', err);
             const errMsg = err.response?.data?.message || err.message || 'Identity Bridge Interruption';
             toast.error(`Protocol Failure: ${errMsg.substring(0, 50)}`, { id: 'pdf' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            
            {/* Modal Layer */}
            <DetailsModal 
                isOpen={detailsModal.open}
                title={`Clinical Invoice Registry: ${detailsModal.item?.invoice_number}`}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />

            <InputModal 
                isOpen={invoiceModal.open}
                title="Generate New Clinical Invoice"
                fields={[
                    { key: 'patient_id', label: 'Patient MRN/ID', type: 'text', fullWidth: true },
                    { key: 'total_amount', label: 'Grand Total (₹)', type: 'number' },
                    { key: 'bill_date', label: 'Billing Date', type: 'date', initialValue: new Date().toISOString().split('T')[0] },
                ]}
                onConfirm={async (vals) => {
                    try {
                        await api.post('bills/', vals);
                        toast.success("Invoice generated.");
                        setInvoiceModal({ open: false });
                        fetchBills();
                    } catch (e) { toast.error("Billing failure."); }
                }}
                onCancel={() => setInvoiceModal({ open: false })}
            />

            {/* Standard Project Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Billing Engine</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                        Institutional Payments • Insurance & Revenue Ledger
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 opacity-30" style={{ color: LUNA.teal }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Scoping invoices..."
                            className="w-48 md:w-64 pl-12 py-3 text-sm rounded-xl outline-none border transition-all font-bold tracking-tight focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20"
                            style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }} />
                    </div>
                    {user?.role === 'admin' && (
                        <button onClick={() => setInvoiceModal({ open: true })} 
                            className="btn-primary text-[10px] font-black uppercase tracking-widest px-6 h-[46px] flex items-center gap-2 shadow-xl">
                            <Plus className="w-4 h-4" /> New Invoice
                        </button>
                    )}
                </div>
            </div>

            {/* Financial Stat Matrix - Museum Clean Edition */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1">
                {[
                    { label: 'Total Revenue', prefix: '₹', value: (stats.revenue / 1000).toFixed(1) + 'k', color: '#10b981', icon: <TrendingUp className="w-5 h-5"/>, bg: 'rgba(16, 185, 129, 0.08)' },
                    { label: 'Pending Collection', prefix: '₹', value: (stats.pending / 1000).toFixed(1) + 'k', color: '#f59e0b', icon: <Clock className="w-5 h-5"/>, bg: 'rgba(245, 158, 11, 0.08)' },
                    { label: 'Today Invoiced', prefix: '₹', value: (stats.paidToday / 1000).toFixed(1) + 'k', color: 'var(--luna-blue)', icon: <Receipt className="w-5 h-5"/>, bg: 'rgba(30, 58, 138, 0.08)' },
                    { label: 'Active Ledger', prefix: '', value: stats.count, color: 'var(--luna-steel)', icon: <CreditCard className="w-5 h-5"/>, bg: 'rgba(148, 163, 184, 0.08)' },
                ].map((s, i) => (
                    <div key={i} className="card p-4 flex items-center gap-3 border transition-all hover:-translate-y-1"
                        style={{ 
                            background: 'var(--luna-card)', 
                            borderColor: 'var(--luna-border)', 
                            borderRadius: '1.5rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.03)' 
                        }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black border shrink-0 backdrop-blur-md"
                            style={{ background: s.bg, color: s.color, borderColor: 'rgba(255,255,255,0.05)' }}>
                            {s.icon}
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase opacity-40 mb-0.5 tracking-[0.2em]" style={{ color: 'var(--luna-text-main)' }}>{s.label}</p>
                            <h3 className="text-[20px] font-black tracking-tighter leading-none flex items-baseline gap-0.5" style={{ color: 'var(--luna-text-main)' }}>
                                {s.prefix && <span className="text-[14px] font-extrabold opacity-60">{s.prefix}</span>}
                                {s.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Master Billing Ledger - Institutional Table Format */}
            <div className="card overflow-hidden p-0 shadow-2xl rounded-2xl border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'var(--luna-navy)', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="pl-10 pr-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Invoice Details</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Patient MRN</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60 text-center" style={{ color: 'var(--luna-text-main)' }}>Billed Amount</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Service Date</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60 text-center" style={{ color: 'var(--luna-text-main)' }}>Fulfillment</th>
                                <th className="pr-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Action Hub</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan="6" className="px-10 py-8"><div className="animate-pulse h-12 rounded-2xl w-full" style={{ background: 'var(--luna-navy)' }} /></td></tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-32 text-[var(--luna-text-muted)] italic font-bold">No financial interactions identified.</td></tr>
                            ) : filtered.map((b, i) => (
                                <tr key={b.id || i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="pl-10 pr-4 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--luna-border)' }}>
                                                <Receipt className="w-4 h-4 opacity-40" />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-[14px]" style={{ color: 'var(--luna-text-main)' }}>{b.invoice_number}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">TXID: {String(b.id).padStart(6, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-extrabold text-[14px]" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name || 'Emergency Guest'}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">Clinical MRN Identification</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <p className="font-black text-[16px] tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>₹{parseFloat(b.total_amount).toLocaleString()}</p>
                                        <p className="text-[8px] font-black uppercase opacity-30 mt-0.5">Gross Billing</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <p className="font-extrabold text-[13px]" style={{ color: 'var(--luna-text-muted)' }}>{b.bill_date}</p>
                                        <p className="text-[8px] font-black uppercase opacity-30 mt-0.5">Timestamped</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
                                            b.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {b.status === 'paid' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Clock className="w-3 h-3 inline mr-1" />}
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="pr-10 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setDetailsModal({ open: true, item: b })} 
                                                className="p-2.5 rounded-xl border transition-all hover:bg-blue-600 hover:text-white"
                                                style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDownloadPDF(b.id, b.invoice_number)} 
                                                className="p-2.5 rounded-xl border transition-all hover:bg-emerald-600 hover:text-white"
                                                style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: '#10b981' }}>
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default BillingPage;