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
    const [typeFilter, setTypeFilter] = useState('all');
    
    // UI State
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null, title: 'Clinical Record' });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const patId = user.patient_id || user.id;
            const [r, p] = await Promise.all([
                api.get(`medical-records/?patient_id=${patId}`),
                api.get(`prescriptions/?patient_id=${patId}`)
            ]);
            setRecords(r.data);
            setPrescriptions(p.data);
        } catch (err) {
            console.error("Medical Vault Sync Failed:", err);
            toast.error("Failed to sync personal medical vault.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [user]);

    const unifiedData = useMemo(() => {
        const combined = [
            ...records.map(r => ({ ...r, __type: 'RECORD', __icon: <FileText className="w-4 h-4" /> })),
            ...prescriptions.map(p => ({ ...p, __type: 'PRESCRIPTION', __icon: <QrCode className="w-4 h-4" /> }))
        ];

        return combined.filter(item => {
            const matchesSearch = 
                (item.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.qr_code_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.doctor_name || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesType = typeFilter === 'all' || item.__type === typeFilter;
            return matchesSearch && matchesType;
        }).sort((a, b) => new Date(b.visit_date || b.created_at) - new Date(a.visit_date || a.created_at));
    }, [records, prescriptions, searchQuery, typeFilter]);

    const stats = useMemo(() => ({
        total: records.length + prescriptions.length,
        records: records.length,
        prescriptions: prescriptions.length,
        recent: [...records, ...prescriptions].filter(i => (i.visit_date || i.created_at)?.includes(new Date().toISOString().split('T')[0])).length
    }), [records, prescriptions]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12 max-w-7xl mx-auto">
            <Toaster position="top-right" />
            
            <DetailsModal
                isOpen={detailsModal.open}
                title={detailsModal.title}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />

            {/* Institutional Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Medical History</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--luna-text-muted)' }}>
                            View your medical records and prescriptions
                        </p>
                        <div className="w-1 h-1 rounded-full opacity-20" style={{ background: 'var(--luna-text-main)' }} />
                        <button onClick={fetchAll} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                             <RefreshCw className="w-3 h-3" />
                         </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search vault..."
                            className="pl-9 pr-3 py-2 text-xs border rounded-lg outline-none transition-all w-full md:w-56 font-bold bg-[var(--luna-card)]"
                            style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 text-xs border rounded-lg appearance-none cursor-pointer focus:outline-none font-bold bg-[var(--luna-card)]"
                            style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                        >
                            <option value="all">All Items</option>
                            <option value="RECORD">Medical Records</option>
                            <option value="PRESCRIPTION">Prescriptions</option>
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Patient Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Vault Items', value: stats.total, color: 'var(--luna-teal)', icon: ShieldCheck },
                    { label: 'Diagnoses', value: stats.records, color: '#10b981', icon: FileText },
                    { label: 'Prescriptions', value: stats.prescriptions, color: '#6366f1', icon: Pill },
                    { label: 'Recent Events', value: stats.recent, color: '#f59e0b', icon: Activity },
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-xl border shadow-sm transition-all hover:translate-y-[-2px]" 
                         style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30" style={{ color: 'var(--luna-text-main)' }}>{s.label}</p>
                            <s.icon className="w-3.5 h-3.5 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{loading ? '...' : s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Registry Table */}
            <div className="rounded-xl border overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>Clinical Event</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>Modality</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>Issuing Practitioner</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>Timestamp</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>Access</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="5" className="px-6 py-6 animate-pulse opacity-40 text-center text-[10px] font-black uppercase tracking-widest">Decrypting Personal Records...</td>
                                    </tr>
                                ))
                            ) : unifiedData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-28" style={{ color: 'var(--luna-text-main)' }}>
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
                            ) : unifiedData.map((item, i) => (
                                <tr key={i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border font-black text-xs shadow-inner"
                                                style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                                                {item.__type === 'RECORD' ? <FileText className="w-4 h-4 opacity-40"/> : <QrCode className="w-4 h-4 opacity-40"/>}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-extrabold text-[14px] leading-tight" style={{ color: 'var(--luna-text-main)' }}>
                                                    {item.__type === 'RECORD' ? (item.diagnosis || 'Clinical Assessment') : 'Digital Prescription'}
                                                </p>
                                                {item.__type === 'PRESCRIPTION' && (
                                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-1">HASH: {item.qr_code_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${item.__type === 'RECORD' ? 'bg-teal-500/10 border-teal-500/20 text-teal-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}`}>
                                            {item.__type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center border bg-[var(--luna-navy)] border-[var(--luna-border)]">
                                                <Stethoscope className="w-3 h-3 opacity-40" />
                                            </div>
                                            <span className="text-[12px] font-bold" style={{ color: 'var(--luna-text-main)' }}>Dr. {item.doctor_name || 'Specialist'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black" style={{ color: 'var(--luna-text-main)' }}>{item.visit_date || item.created_at?.split('T')[0]}</span>
                                            <div className="flex items-center gap-1 mt-0.5 opacity-40">
                                                <Clock className="w-2.5 h-2.5" />
                                                <span className="text-[9px] font-bold uppercase">Official Sync</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 pr-6">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button 
                                                onClick={() => setDetailsModal({ open: true, item, title: item.__type === 'RECORD' ? 'Clinical Assessment Details' : 'Prescription Metadata' })}
                                                title="View Detailed Logs"
                                                className="p-2 rounded-lg border bg-[var(--luna-card)] border-teal-500/30 text-teal-500 hover:bg-teal-500/10 transition-all hover:-translate-y-0.5 shadow-sm">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-2 rounded-lg border bg-[var(--luna-card)] border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-all hover:-translate-y-0.5 shadow-sm opacity-40 hover:opacity-100">
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
            <div className="text-center opacity-30 mt-8">
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">End-to-End Encrypted Clinical Vault • Lifeline HMS</p>
            </div>
        </motion.div>
    );
};

export default RecordsPage;

