import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, QrCode, Plus, Search, Filter, RefreshCw, Activity, 
    ArrowRight, Clock, User, CheckCircle, MoreHorizontal, ShieldCheck,
    Eye, Trash2, Printer, Download, Pill, Stethoscope, ChevronDown, PenTool
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal, InputModal, DetailsModal } from './Modals';
import { LUNA } from "./Constants";
import PrescriptionEditor from './PrescriptionEditor';

const RecordsPage = ({ user }) => {
    const { theme } = useTheme();
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    
    // UI State
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null, title: 'Clinical Record' });
    const [prescriptionEditor, setPrescriptionEditor] = useState({ open: false, selectedPatient: null });
    const [patients, setPatients] = useState([]);

    const isAdminOrClinical = user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse';

    const fetchAll = async () => {
        setLoading(true);
        try {
            let recUrl = 'medical-records/';
            let presUrl = 'prescriptions/';

            if (user?.role === 'doctor') {
                const docId = user.doctor_id || user.id;
                recUrl += `?doctor_id=${docId}`;
                presUrl += `?doctor_id=${docId}`;
            } else if (user?.role === 'patient') {
                const patId = user.patient_id || user.id;
                recUrl += `?patient_id=${patId}`;
                presUrl += `?patient_id=${patId}`;
            }

            const [r, p, pts] = await Promise.all([
                api.get(recUrl), 
                api.get(presUrl),
                api.get('patients/')
            ]);
            setRecords(r.data);
            setPrescriptions(p.data);
            setPatients(pts.data);

            if (isAdminOrClinical) {
                const patRes = await api.get('patients/');
                setPatients(patRes.data);
                
                const params = new URLSearchParams(window.location.search);
                const pid = params.get('patient_id');
                if (pid) {
                    const p = patRes.data.find(p => p.id === parseInt(pid));
                    if (p) setPrescriptionEditor({ open: true, selectedPatient: p });
                }
            }
        } catch (err) {
            console.error("Clinical Dossier Sync Failed:", err);
            toast.error("Failed to sync clinical archives.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [user]);

    // Combined Data for Unified Registry
    const unifiedData = useMemo(() => {
        const combined = [
            ...records.map(r => ({ ...r, __type: 'RECORD', __icon: <FileText className="w-4 h-4" /> })),
            ...prescriptions.map(p => ({ ...p, __type: 'PRESCRIPTION', __icon: <QrCode className="w-4 h-4" /> }))
        ];

        return combined.filter(item => {
            const matchesSearch = 
                (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.treatment_plan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.qr_code_id || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesType = typeFilter === 'all' || item.__type === typeFilter;
            return matchesSearch && matchesType;
        }).sort((a, b) => new Date(b.visit_date || b.created_at) - new Date(a.visit_date || a.created_at));
    }, [records, prescriptions, searchQuery, typeFilter]);

    const stats = useMemo(() => ({
        total: records.length + prescriptions.length,
        records: records.length,
        prescriptions: prescriptions.length,
        today: [...records, ...prescriptions].filter(i => (i.visit_date || i.created_at)?.includes(new Date().toISOString().split('T')[0])).length
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            <Toaster position="top-right" />
            
            <DetailsModal
                isOpen={detailsModal.open}
                title={detailsModal.title}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />

            <PrescriptionEditor
                isOpen={prescriptionEditor.open}
                onClose={() => setPrescriptionEditor({ open: false, selectedPatient: null })}
                patient={prescriptionEditor.selectedPatient}
                doctor={user}
                onSaveSuccess={fetchAll}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Medical Records</h1>
                    <button onClick={fetchAll} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                             <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>


                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Scan archives..."
                            className="pl-9 pr-3 py-2 text-xs border rounded-lg outline-none transition-all w-full md:w-56 font-bold bg-[var(--luna-card)]"
                            style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                        />
                    </div>



                    {isAdminOrClinical && (
                        <div className="flex gap-2">
                            <button onClick={() => {
                                if (patients.length > 0) {
                                    setPrescriptionEditor({ open: true, selectedPatient: patients[0] });
                                } else {
                                    toast.error("No patients found in registry.");
                                }
                            }} 
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-all shadow-sm active:scale-95">
                                <PenTool className="w-3.5 h-3.5" /> Digital Prescription
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Institutional Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Records', value: stats.total, color: '#1e3a8a' },
                    { label: 'Diagnoses', value: stats.records, color: '#f59e0b' },
                    { label: 'Prescriptions', value: stats.prescriptions, color: '#ef4444' },
                    { label: 'Recent Updates', value: stats.today, color: '#4338ca' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Registry Table */}
            <div className="rounded-xl border overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--luna-text-dim)' }}>Patient</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden md:table-cell" style={{ color: 'var(--luna-text-dim)' }}>Clinical Insight</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden md:table-cell" style={{ color: 'var(--luna-text-dim)' }}>Date</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--luna-text-dim)' }}>Actions</th>
                            </tr>


                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="5" className="px-6 py-6 animate-pulse opacity-40 text-center text-[10px] font-black uppercase tracking-widest">Synchronizing Encrypted Archives...</td>
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
                                                {item.patient_name?.[0] || 'P'}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-extrabold text-[14px] leading-tight" style={{ color: 'var(--luna-text-main)' }}>{item.patient_name || 'Anonymous Patient'}</p>
                                                <p className="text-[9px] font-black opacity-40 uppercase tracking-widest mt-1">ID: ARCH-{String(item.id).padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </td>


                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <p className="font-bold text-[13px]" style={{ color: 'var(--luna-text-main)' }}>
                                            {item.__type === 'RECORD' ? (item.diagnosis || 'Clinical Assessment') : 'Digital Prescription'}
                                        </p>
                                    </td>


                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className="text-[12px] font-black" style={{ color: 'var(--luna-text-main)' }}>{item.visit_date || item.created_at?.split('T')[0]}</span>
                                    </td>


                                    <td className="px-6 py-4 pr-6">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button 
                                                onClick={() => setDetailsModal({ open: true, item, title: item.__type === 'RECORD' ? 'Clinical Dossier' : 'Prescription Metadata' })}
                                                title="View Detailed Logs"
                                                className="p-2 rounded-lg border bg-[var(--luna-card)] border-teal-500/30 text-teal-500 hover:bg-teal-500/10 transition-all hover:-translate-y-0.5 shadow-sm">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {(item.patient || item.id) && (
                                                <button 
                                                    onClick={() => setPrescriptionEditor({ open: true, selectedPatient: { id: item.patient || item.id, get_name: item.patient_name } })}
                                                    title="Draft Digital Prescription"
                                                    className="p-2 rounded-lg border bg-[var(--luna-card)] border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-all hover:-translate-y-0.5 shadow-sm">
                                                    <PenTool className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDownload(item)}
                                                title="Print Clinical Record"
                                                className="p-2 rounded-lg border bg-[var(--luna-card)] border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-all hover:-translate-y-0.5 shadow-sm">
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            <button 
                                                title="Archive Record"
                                                className="p-2 rounded-lg border bg-[var(--luna-card)] border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all hover:-translate-y-0.5 shadow-sm opacity-40 hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
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

export default RecordsPage;