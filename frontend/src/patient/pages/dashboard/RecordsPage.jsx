import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, QrCode, Search, Filter, RefreshCw, Activity,
    ShieldCheck, Eye, Pill, Stethoscope, Clock, Download
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { DetailsModal } from './Modals';
import { LUNA } from "./Constants";

const RecordsPage = ({ user }) => {
    const { theme } = useTheme();
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null, title: 'Medical Record' });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const patId = user.patient_id;
            const [r, p] = await Promise.all([
                api.get(`medical-records/?patient_id=${patId}`),
                api.get(`prescriptions/?patient_id=${patId}`)
            ]);
            setRecords(r.data);
            setPrescriptions(p.data);
        } catch (err) {
            console.error("Medical Records Sync Failed:", err);
            toast.error("Failed to sync medical records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [user]);

    const unifiedData = useMemo(() => {
        const combined = [
            ...records.map(r => ({ ...r, __type: 'RECORD' })),
            ...prescriptions.map(p => ({ ...p, __type: 'PRESCRIPTION' }))
        ];

        return combined.filter(item => {
            const matchesSearch =
                (item.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.qr_code_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.doctor_name || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        }).sort((a, b) => new Date(b.visit_date || b.created_at) - new Date(a.visit_date || a.created_at));
    }, [records, prescriptions, searchQuery]);

    const stats = useMemo(() => ({
        total: records.length + prescriptions.length,
        records: records.length,
        prescriptions: prescriptions.length,
        recent: [...records, ...prescriptions].filter(i => (i.visit_date || i.created_at)?.includes(new Date().toISOString().split('T')[0])).length
    }), [records, prescriptions]);

    const handleDownload = async (item) => {
        const endpoint = item.__type === 'RECORD' ? 'medical-records' : 'prescriptions';
        try {
            toast.loading("Generating institutional transcript...", { id: 'pdf-gen' });
            const response = await api.get(`${endpoint}/${item.id}/generate_pdf/`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = item.__type === 'RECORD' ? `Clinical_Record_${item.id}.pdf` : `Prescription_${item.qr_code_id || item.id}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Transcript downloaded successfully.", { id: 'pdf-gen' });
        } catch (err) {
            console.error("PDF Generation Failed:", err);
            toast.error("Failed to generate clinical transcript.", { id: 'pdf-gen' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />

            <DetailsModal
                isOpen={detailsModal.open}
                title={detailsModal.title}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />

            {/* Institutional Header */}
            <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Medical Records</h1>
                    <button onClick={fetchAll} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                        <input 
                            type="text"
                            placeholder="Search clinical records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs border rounded-xl focus:outline-none transition-all shadow-sm bg-[var(--luna-card)]"
                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        />
                    </div>
                </div>
            </header>

            {/* Minimal Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Files', value: stats.total, color: 'var(--luna-teal)' },
                    { label: 'Assessments', value: stats.records, color: '#f59e0b' },
                    { label: 'Prescriptions', value: stats.prescriptions, color: '#ef4444' },
                    { label: 'Recent', value: stats.recent, color: '#6366f1' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Medical Records List */}
            <div className="border rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Record Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Doctor</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="4" className="px-6 py-8 animate-pulse text-center opacity-40 text-xs font-bold uppercase tracking-widest">
                                            Loading medical records...
                                        </td>
                                    </tr>
                                ))
                            ) : unifiedData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-28 text-center" style={{ color: 'var(--luna-text-main)' }}>
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-12 h-12 opacity-10 mb-4" />
                                            <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase">Vault Empty</h3>
                                            <p className="text-xs font-semibold opacity-30 mt-1">No clinical records found in your profile.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : unifiedData.map((item, i) => (
                                <tr key={i} className="border-b hover:bg-[var(--luna-navy)] transition-colors" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 bg-[var(--luna-navy)] border-[var(--luna-border)]">
                                                {item.__type === 'RECORD' ? <FileText className="w-4 h-4 opacity-40" /> : <QrCode className="w-4 h-4 opacity-40" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {item.__type === 'RECORD' ? (item.diagnosis || 'Assessment') : 'Prescription'}
                                                </p>
                                                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">
                                                    {item.__type === 'RECORD' ? 'Doctor Report' : `HASH: ${item.qr_code_id}`}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center border bg-[var(--luna-navy)] border-[var(--luna-border)]">
                                                <Stethoscope className="w-3 h-3 opacity-40" />
                                            </div>
                                            <span className="text-[12px] font-bold">Dr. {item.doctor_name || 'Staff'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">{item.visit_date || item.created_at?.split('T')[0]}</span>
                                            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-0.5">Secure Sync</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setDetailsModal({ open: true, item, title: item.__type === 'RECORD' ? 'Assessment Details' : 'Prescription Details' })}
                                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDownload(item)}
                                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100">
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

            <footer className="text-center pb-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Secured Medical Records Vault</p>
            </footer>
        </motion.div>
    );
};

export default RecordsPage;
