import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DollarSign, Search, Plus, Filter, FileText, Download, Eye, 
    TrendingUp, CreditCard, Receipt, Clock, CheckCircle2, ChevronRight,
    ArrowUpRight, ArrowDownRight, Activity, RefreshCw
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
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const fetchRegistryData = async () => {
        try {
            const [pRes, dRes, aRes] = await Promise.all([
                api.get('patients/'),
                api.get('doctors/'),
                api.get('appointments/')
            ]);
            setPatients(pRes.data?.results || pRes.data || []);
            setDoctors(dRes.data?.results || dRes.data || []);
            setAppointments(aRes.data?.results || aRes.data || []);
        } catch (e) {
            console.error("Institutional registry sync failed:", e);
        }
    };

    const fetchBills = async () => {
        setLoading(true);
        try {
            let url = 'bills/';
            if (user?.role === 'patient') url += `?patient_id=${user.patient_id || user.id}`;
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
        if (user?.role === 'admin' || user?.role === 'receptionist') {
            fetchRegistryData();
        }
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
            revenue: sb.reduce((a, b) => a + (parseFloat(b?.total_amount) || 0), 0),
            pending: sb.filter(b => b?.status === 'pending').reduce((a, b) => a + (parseFloat(b?.total_amount) || 0), 0),
            paidToday: sb.filter(b => b?.status === 'paid' && b?.bill_date === new Date().toISOString().split('T')[0]).reduce((a, b) => a + (parseFloat(b?.total_amount) || 0), 0),
            count: sb.length
        };
    }, [bills]);

    const handleMarkPaid = async (id, invoiceNum) => {
        try {
            toast.loading(`Finalizing Invoice: ${invoiceNum}...`, { id: 'pay' });
            await api.post(`bills/${id}/mark_paid/`, { payment_method: 'Digital Transfer' });
            toast.success('Invoice settled.', { id: 'pay' });
            fetchBills();
        } catch (err) {
            toast.error('Payment reconciliation failed.', { id: 'pay' });
        }
    };

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
                title="Institutional Billing Provisioning"
                fields={[
                    { 
                        key: 'patient', 
                        label: 'Patient Registry', 
                        type: 'select', 
                        fullWidth: true,
                        options: patients.map(p => ({ label: `${p.get_name} (PID-${p.id})`, value: p.id }))
                    },
                    { 
                        key: 'doctor', 
                        label: 'Attending Physician', 
                        type: 'select', 
                        options: doctors.map(d => ({ label: `Dr. ${d.get_name}`, value: d.id }))
                    },
                    { 
                        key: 'appointment', 
                        label: 'Clinical Appointment', 
                        type: 'select',
                        options: appointments.map(a => ({ label: `${a.appointment_date} - ${a.description.substring(0, 20)}...`, value: a.id }))
                    },
                    { key: 'consultation_fee', label: 'Consultation Fee (₹)', type: 'number', initialValue: 500 },
                    { key: 'medicine_cost', label: 'Medicinal Subtotal (₹)', type: 'number', initialValue: 0 },
                    { key: 'test_cost', label: 'Diagnostic/Lab Cost (₹)', type: 'number', initialValue: 0 },
                    { key: 'room_charge', label: 'Facility/Room Charge (₹)', type: 'number', initialValue: 0 },
                    { key: 'other_charges', label: 'Administrative Fees (₹)', type: 'number', initialValue: 0 },
                    { key: 'discount', label: 'Institutional Discount (%)', type: 'number', initialValue: 0 },
                    { key: 'notes', label: 'Clinical Billing Notes', type: 'text', fullWidth: true, placeholder: 'Specify institutional adjustments or insurance details...' },
                ]}
                onFieldChange={(key, val, currentValues) => {
                    if (key === 'patient') {
                        const patId = Number(val);
                        // Institutional Chronos-Sort: Identification of the most recent clinical session
                        const recent = [...appointments]
                            .filter(a => Number(a.patient) === patId)
                            .sort((a, b) => {
                                const dT_A = new Date(`${a.appointment_date}T${a.appointment_time || '00:00'}`);
                                const dT_B = new Date(`${b.appointment_date}T${b.appointment_time || '00:00'}`);
                                return dT_B - dT_A; // Precise descending chronological order
                            })[0];
                        
                        if (recent) {
                            currentValues.appointment = recent.id;
                            currentValues.doctor = recent.doctor;
                            // Pre-fill notes with appointment telemetry for realism
                            currentValues.notes = `Invoice for clinical session on ${recent.appointment_date} at ${recent.appointment_time || 'N/A'}.`;
                            // Synchronize physician's specific consultation fee
                            const doc = doctors.find(d => Number(d.id) === Number(recent.doctor));
                            if (doc) {
                                currentValues.consultation_fee = doc.consultation_fee || 500;
                            }
                        }
                    }
                    if (key === 'doctor') {
                        const doc = doctors.find(d => Number(d.id) === Number(val));
                        if (doc) {
                            currentValues.consultation_fee = doc.consultation_fee || 500;
                        }
                    }
                }}
                onConfirm={async (vals) => {
                    try {
                        toast.loading('Committing invoice to ledger...', { id: 'bill-post' });
                        await api.post('bills/', vals);
                        toast.success("Clinical invoice finalized and dispatched.", { id: 'bill-post' });
                        setInvoiceModal({ open: false });
                        fetchBills();
                    } catch (e) { 
                        toast.error("Institutional billing failure. Verify registry links.", { id: 'bill-post' }); 
                    }
                }}
                onCancel={() => setInvoiceModal({ open: false })}
            />

            {/* Header Row - 1:1 Parity with Records */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Patient Billing</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--luna-text-muted)' }}>
                            Manage patient invoices and payments
                        </p>
                        <div className="w-1 h-1 rounded-full opacity-20" style={{ background: 'var(--luna-text-main)' }} />
                        <button onClick={fetchBills} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                             <RefreshCw className="w-3 h-3" />
                         </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search ledger..."
                            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg outline-none transition-all font-bold tracking-tight bg-[var(--luna-card)]"
                            style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-xs border rounded-lg appearance-none cursor-pointer focus:outline-none bg-[var(--luna-card)]"
                            style={{ color: theme === 'dark' ? 'white' : 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}
                        >
                            <option value="all">All Status</option>
                            <option value="paid">PAID</option>
                            <option value="pending">PENDING</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30 pointer-events-none" />
                    </div>

                    {(user?.role === 'admin' || user?.role === 'receptionist') && (
                        <button
                            onClick={() => setInvoiceModal({ open: true })}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm">
                            <Plus className="w-3.5 h-3.5" /> Generate Bill
                        </button>
                    )}
                </div>
            </div>

            {/* Mini Stats Row - Pulse Grid Pattern (Records 1:1) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Revenue', value: '₹' + (stats.revenue / 1000).toFixed(1) + 'k', color: '#1e3a8a' },
                    { label: 'Pending Collection', value: '₹' + (stats.pending / 1000).toFixed(1) + 'k', color: '#f59e0b' },
                    { label: 'Today Invoiced', value: '₹' + (stats.paidToday / 1000).toFixed(1) + 'k', color: '#ef4444' },
                    { label: 'Active Ledger', value: stats.count, color: '#4338ca' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Master Ledger - Institutional Table Format */}
            <div className="card overflow-hidden !p-0 shadow-sm rounded-xl border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] opacity-60" style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Invoice</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hidden sm:table-cell" style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Patient</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] opacity-60" style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Amount</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hidden sm:table-cell" style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Date</th>
                                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hidden sm:table-cell" style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em] opacity-60" style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan="6" className="px-6 py-8"><div className="animate-pulse h-12 rounded-xl w-full" style={{ background: 'var(--luna-navy)' }} /></td></tr>
                                ))
                            ) : filtered.length === 0 ? (
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
                            ) : filtered.map((b, i) => (
                                <tr key={b.id || i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-6 py-3 md:py-4">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border shadow-inner shrink-0"
                                                style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                                <Receipt className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-40" />
                                            </div>
                                            <div className="whitespace-nowrap">
                                                <p className="font-extrabold text-[12px] md:text-[14px]" style={{ color: 'var(--luna-text-main)' }}>{b.invoice_number}</p>
                                                <p className="text-[8px] md:text-[9px] font-semibold uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-muted)' }}>ID: {String(b.id).padStart(4, '0')} • SYNCED</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 hidden sm:table-cell">
                                        <p className="font-medium text-[13px]" style={{ color: 'var(--luna-text-main)' }}>{b.patient_name || 'Emergency Guest'}</p>
                                    </td>
                                    <td className="px-4 py-3 md:py-4">
                                        <p className="font-semibold text-[14px] tracking-tight whitespace-nowrap" style={{ color: 'var(--luna-text-main)' }}>₹{(parseFloat(b?.total_amount) || 0).toLocaleString()}</p>
                                    </td>

                                    <td className="px-4 py-4 hidden sm:table-cell">
                                        <p className="font-medium text-[12px]" style={{ color: 'var(--luna-text-muted)' }}>{b.bill_date}</p>
                                    </td>
                                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                                        <span className={`px-3 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest ${
                                            b.status === 'paid' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                            'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                            {b.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {b.status === 'pending' && (user?.role === 'admin' || user?.role === 'receptionist') && (
                                                <button onClick={() => handleMarkPaid(b.id, b.invoice_number)} 
                                                    title="Mark as Paid"
                                                    className="p-1.5 rounded-lg border bg-[var(--luna-card)] border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-all hover:-translate-y-0.5 shadow-sm">
                                                    <CreditCard className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => setDetailsModal({ open: true, item: b })} 
                                                title="View Registry"
                                                className="p-1.5 rounded-lg border bg-[var(--luna-card)] border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-all hover:-translate-y-0.5 shadow-sm">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDownloadPDF(b.id, b.invoice_number)} 
                                                title="Download PDF"
                                                className="p-1.5 rounded-lg border bg-[var(--luna-card)] border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-all hover:-translate-y-0.5 shadow-sm">
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