import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Activity, Bed, Clock, AlertCircle, Plus, Search, Map, Filter, UserPlus, ChevronRight
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from './Constants';
import { InputModal, DetailsModal } from './Modals';

const MOCK_WARDS = [
    { id: 'W1', name: 'General Ward Alpha', beds: 12, occupied: 8, color: '#3b82f6' },
    { id: 'W2', name: 'Cardiology ICU', beds: 6, occupied: 5, color: '#ef4444' },
    { id: 'W3', name: 'Maternity Wing', beds: 10, occupied: 4, color: '#10b981' },
    { id: 'W4', name: 'Emergency Triage', beds: 8, occupied: 7, color: '#f59e0b' },
];

const AdmissionsPage = ({ user }) => {
    const { theme } = useTheme();
    const [patients, setPatients] = useState([]);
    const [allRegistrations, setAllRegistrations] = useState([]); // All patients for new admission select
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // UI State for Modals
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const [admissionModal, setAdmissionModal] = useState({ open: false });

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const [resPatients, resAll] = await Promise.all([
                api.get('patients/'),
                api.get('patients/') // In real scenario, this might be a different endpoint for registered vs admitted
            ]);
            
            const data = Array.isArray(resPatients.data) ? resPatients.data : [];
            setPatients(data.filter(p => p.status === true));
            setAllRegistrations(data);
        } catch (err) {
            console.error("Admissions fetch error", err);
            toast.error("Clinical sync failure.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const admittedPatients = patients.filter(p => 
        (p.get_name || '').toLowerCase().includes(search.toLowerCase()) || 
        String(p.id).includes(search)
    );

    const handleNewAdmission = async (vals) => {
        if (!vals.patientId || !vals.ward) {
            toast.error("Required clinical parameters missing.");
            return;
        }
        
        try {
            toast.loading("Logging admission stay...", { id: 'admit' });
            // Simulate admission logic (Updating status to true/admitted)
            await api.patch(`patients/${vals.patientId}/`, { 
                status: true,
                risk_level: vals.risk || 'stable'
            });
            toast.success("Admission successful.", { id: 'admit' });
            setAdmissionModal({ open: false });
            fetchAdmissions();
        } catch (err) {
            toast.error("Admission protocol rejected.", { id: 'admit' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            <Toaster position="top-right" />
            
            {/* Functional Modals Integration */}
            <DetailsModal 
                isOpen={detailsModal.open}
                title="Clinical Admission Record"
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />
            
            <InputModal 
                isOpen={admissionModal.open}
                title="New Inpatient Admission Protocol"
                fields={[
                    { key: 'patientId', label: 'Select Patient', type: 'select', options: allRegistrations.map(p => ({ value: p.id, label: `${p.get_name} (ID: ${p.id})` })), fullWidth: true },
                    { key: 'ward', label: 'Ward Assignment', type: 'select', options: MOCK_WARDS.map(w => ({ value: w.id, label: w.name })), fullWidth: false },
                    { key: 'risk', label: 'Initial Risk Level', type: 'select', options: [{value: 'stable', label: 'Stable'}, {value: 'high', label: 'High Risk'}, {value: 'critical', label: 'Critical ICU'}], fullWidth: false },
                    { key: 'notes', label: 'Admitting Notes / Diagnosis', type: 'text', placeholder: 'Enter initial clinical assessment...', fullWidth: true },
                ]}
                onConfirm={handleNewAdmission}
                onCancel={() => setAdmissionModal({ open: false })}
            />

            {/* Project Standard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Ward & Admissions Hub</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                        Institutional Stay Registry • {admittedPatients.length} Active Inpatients
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 opacity-30" style={{ color: LUNA.teal }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search MRN / Patient..."
                            className="w-48 md:w-80 pl-12 py-3 text-sm rounded-xl outline-none border transition-all font-bold tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20"
                            style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }} />
                    </div>
                    <button onClick={() => setAdmissionModal({ open: true })} className="btn-primary text-[10px] font-black uppercase tracking-widest px-6 h-[50px] flex items-center gap-2 shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all">
                        <UserPlus className="w-4 h-4" /> New Admission
                    </button>
                </div>
            </div>

            {/* Ward Availability Tier */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {MOCK_WARDS.map(w => {
                    const capacityPct = (w.occupied / w.beds) * 100;
                    const isHighLoad = capacityPct > 80;
                    return (
                        <div key={w.id} className="card p-4 flex items-center justify-between border shadow-sm transition-all hover:border-blue-500/20"
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-blue-500/5 flex items-center justify-center font-black text-blue-500 border border-blue-500/10 shadow-inner">
                                    {w.id}
                                </div>
                                <div>
                                    <p className="font-extrabold text-[13px]" style={{ color: 'var(--luna-text-main)' }}>{w.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                                            <div className="h-full" style={{ width: `${capacityPct}%`, background: isHighLoad ? '#ef4444' : '#14b8a6' }} />
                                        </div>
                                        <span className="text-[10px] font-black opacity-60 tracking-tighter" style={{ color: isHighLoad ? '#ef4444' : 'var(--luna-text-muted)' }}>{w.occupied}/{w.beds}</span>
                                    </div>
                                </div>
                            </div>
                            <Activity className={`w-4 h-4 ${isHighLoad ? 'text-red-500 animate-pulse' : 'text-emerald-500 opacity-40'}`} />
                        </div>
                    );
                })}
            </div>

            {/* Admissions Ledger - Unified Clinical Table */}
            <div className="card overflow-hidden p-0 shadow-2xl rounded-2xl border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'var(--luna-navy)', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="pl-8 pr-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Inpatient Profiling</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Specialist</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-center" style={{ color: 'var(--luna-text-main)' }}>Allocation</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Stability Marker</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-center" style={{ color: 'var(--luna-text-main)' }}>Admit Registry</th>
                                <th className="pr-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan="6" className="px-8 py-8"><div className="animate-pulse h-10 rounded-2xl w-full" style={{ background: 'var(--luna-navy)' }} /></td></tr>
                                ))
                            ) : admittedPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-28 font-medium italic" style={{ color: LUNA.steel }}>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-500/5 flex items-center justify-center border border-dashed border-blue-500/20">
                                                <Search className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40">Zero Inpatient manifest records</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : admittedPatients.map((p, i) => (
                                <tr key={p.id || i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-all border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="pl-8 pr-4 py-5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner shrink-0 uppercase border transition-transform group-hover:scale-105"
                                                style={{ background: 'var(--luna-navy)', color: i % 2 === 0 ? '#14b8a6' : '#2563eb', borderColor: 'var(--luna-border)' }}>
                                                {p.get_name?.[0] || 'P'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-extrabold text-[15px] tracking-tight group-hover:text-blue-500 transition-colors" style={{ color: 'var(--luna-text-main)' }}>{p.get_name}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>
                                                    REF-00{8000+p.id} • SYNCED
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-40" />
                                            <p className="font-extrabold text-[12px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Dr. {p.assigned_doctor_name || 'Unassigned'}</p>
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Resident Lead</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <div className="inline-flex flex-col items-center px-4 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
                                            <p className="font-black text-[12px] tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>W-{i+1}01-A</p>
                                            <p className="text-[7px] font-black uppercase opacity-30 mt-0.5">Physical Block</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <span className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
                                            p.risk_level === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
                                            p.risk_level === 'high' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                            {p.risk_level || 'Hemodynamic-Stable'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="font-extrabold text-[13px] tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{p.admit_date || '2024-04-06'}</p>
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-0.5">Manifest Registered</p>
                                    </td>
                                    <td className="pr-8 py-5 text-right">
                                        <button onClick={() => setDetailsModal({ open: true, item: p })} className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all hover:bg-blue-600 hover:text-white group-hover:shadow-lg active:scale-95"
                                            style={{ color: 'var(--luna-text-main)', background: 'var(--luna-navy)', border: '1px solid var(--luna-border)' }}>
                                            Manage Stay
                                        </button>
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

export default AdmissionsPage;
