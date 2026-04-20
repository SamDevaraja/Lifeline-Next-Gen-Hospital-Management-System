import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, HeartPulse, Search, FileText, AlertCircle, CheckCircle, Clock,
    FlaskConical, User, ArrowRight, ChevronDown, RefreshCw, Database,
    Activity, Filter, BrainCircuit, TrendingUp, Sparkles, X, UserCheck, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from "./Constants";
import { InputModal, DetailsModal } from './Modals';

const LabPage = ({ user }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    // --- Core Data State ---
    const [tests, setTests] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- UI Local State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTermPatient, setSearchTermPatient] = useState('');
    const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'abnormal' | 'ai'
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null, title: '' });
    const [showNewTestModal, setShowNewTestModal] = useState(false);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        try {
            const testsUrl = 'lab-tests/';
            const [testsRes, patRes] = await Promise.all([
                api.get(testsUrl),
                api.get('patients/').catch(() => ({ data: [] }))
            ]);
            setTests(testsRes.data);
            setPatients(patRes.data);
        } catch (err) {
            console.error('Data sync failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // --- Derived Data ---
    const secureTests = useMemo(() => Array.isArray(tests) ? tests : (tests?.results || []), [tests]);
    const securePatients = useMemo(() => Array.isArray(patients) ? patients : (patients?.results || []), [patients]);

    const abnormalCount = useMemo(() => secureTests.filter(t => t.is_abnormal).length, [secureTests]);
    
    const filteredTests = useMemo(() => {
        let list = [...secureTests];
        if (selectedPatientId) {
            list = list.filter(t => t.patient === selectedPatientId);
        }
        if (activeTab === 'abnormal') {
            list = list.filter(t => t.is_abnormal);
        }
        
        const search = searchTerm.toLowerCase();
        if (search) {
            list = list.filter(t => 
                (t.test_name && t.test_name.toLowerCase().includes(search)) || 
                (t.patient_name && t.patient_name.toLowerCase().includes(search)) ||
                (t.category && t.category.toLowerCase().includes(search))
            );
        }
        return list;
    }, [secureTests, selectedPatientId, activeTab, searchTerm]);


    // --- Handlers ---
    const handleNewTest = async (values) => {
        try {
            toast.loading('Synchronizing laboratory database...', { id: 'lab-post' });
            
            // Convert strings from modal to appropriate types
            const payload = {
                ...values,
                is_abnormal: values.is_abnormal === 'true' || values.is_abnormal === true
            };

            await api.post('lab-tests/', payload);
            toast.success('Clinical diagnostic record committed successfully.', { id: 'lab-post' });
            setShowNewTestModal(false);
            fetchData(true);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Database write failure.', { id: 'lab-post' });
        }
    };

    // --- Styles ---
    const cardStyle = { background: 'var(--luna-card)', border: '1px solid var(--luna-border)' };
    const textMain = { color: 'var(--luna-text-main)' };
    const textMuted = { color: 'var(--luna-text-muted)' };

    if (loading && tests.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-20 space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-[#7c3aed] opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Synchronizing Diagnostics Hub...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1700px] mx-auto w-full space-y-6 antialiased">
            <Toaster position="top-right" />
            
            <DetailsModal
                isOpen={detailsModal.open}
                title={detailsModal.title}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null, title: '' })}
            />

            <InputModal
                isOpen={showNewTestModal}
                title="New Diagnostic Entry"
                onCancel={() => setShowNewTestModal(false)}
                onConfirm={handleNewTest}
                fields={[
                    {key: 'patient', label: 'Patient Record', type: 'select', options: securePatients.map(p => ({ label: `${p?.get_name || 'Patient'} (PID-${p?.id || 'Unknown'})`, value: p?.id || '' })), fullWidth: true },
                    { key: 'test_name', label: 'Investigation Name', type: 'text', placeholder: 'e.g. Complete Blood Count' },
                    { key: 'category', label: 'Medical Category', type: 'select', options: [
                        { label: 'Hematology', value: 'Hematology' },
                        { label: 'Biochemistry', value: 'Biochemistry' },
                        { label: 'Immunology', value: 'Immunology' },
                        { label: 'Microbiology', value: 'Microbiology' },
                        { label: 'Radiology', value: 'Radiology' },
                        { label: 'Other', value: 'Other' }
                    ]},
                    { key: 'result_value', label: 'Clinical Result', type: 'text', placeholder: 'e.g. 14.5' },
                    { key: 'unit', label: 'Unit of Measure', type: 'text', placeholder: 'e.g. g/dL' },
                    { key: 'reference_range', label: 'Biological Reference Range', type: 'text', placeholder: 'e.g. 13.5 - 17.5' },
                    { key: 'is_abnormal', label: 'Abnormal Flag', type: 'select', options: [{ label: 'Normal Result', value: 'false' }, { label: 'Abnormal / High Priority', value: 'true' }] },
                    { key: 'image_data', label: 'Diagnostic Scan / Image (Optional)', type: 'file', fullWidth: true },
                    { key: 'notes', label: 'Clinical Commentary', type: 'text', placeholder: 'Institutional notes or doctor commentary...', fullWidth: true },
                ]}
            />

            {/* Header: Unified Institutional Standard */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-transform hover:scale-105" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <FlaskConical className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Medical Diagnostics Hub</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>
                            Departmental Feed • {refreshing ? 'Synchronizing Archive...' : `Total Records: ${filteredTests.length}`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    {/* Institutional Filter Layer */}
                    <div className="relative w-full sm:min-w-[140px] sm:w-auto">
                        <select 
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 text-[10px] border rounded-xl appearance-none cursor-pointer focus:outline-none bg-[var(--luna-card)] font-black uppercase tracking-widest shadow-sm hover:border-blue-500/30"
                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        >
                            <option value="all">Global Feed</option>
                            <option value="abnormal">Critical Flags</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30 pointer-events-none" />
                    </div>

                    <div className="relative group w-full lg:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-all text-blue-500" />
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Scan diagnostics..."
                            className="w-full pl-11 pr-4 py-2.5 text-[10px] border rounded-xl outline-none transition-all font-bold tracking-tight bg-[var(--luna-card)] hover:border-blue-500/30 focus:border-blue-500/50 shadow-sm"
                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        />
                    </div>

                    <button 
                        onClick={() => setShowNewTestModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--luna-blue)] to-[#1e4ed8] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[3px]" /> New Diagnostic Entry
                    </button>
                </div>
            </header>

            {/* Institutional Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Analytics', value: secureTests.length, color: 'var(--luna-blue)' },
                    { label: 'Nominal Results', value: secureTests.filter(t => !t.is_abnormal).length, color: 'var(--luna-teal)' },
                    { label: 'Critical Flags', value: abnormalCount, color: '#ef4444' },
                    { label: 'Operational Sync', value: 'LIVE', color: '#4338ca' },
                ].map((s, i) => (
                    <div key={i} className="p-5 border rounded-2xl shadow-sm hover:scale-[1.02] transition-transform" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-black" style={{ color: s.color }}>{loading ? '...' : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Diagnostic Data Grid */}
            <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-50" style={{ color: 'var(--luna-text-main)' }}>Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-50 w-[30%]" style={{ color: 'var(--luna-text-main)' }}>Investigation</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-50 w-[20%]" style={{ color: 'var(--luna-text-main)' }}>Patient Record</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-50 w-[25%]" style={{ color: 'var(--luna-text-main)' }}>Diagnostic Findings</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-50 text-center" style={{ color: 'var(--luna-text-main)' }}>Risk Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.length > 0 ? filteredTests.map((t, idx) => (
                                <motion.tr 
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    onClick={() => setDetailsModal({ open: true, item: t, title: 'Laboratory Investigation Report' })}
                                    className="border-b transition-all hover:bg-[rgba(30,58,138,0.03)] cursor-pointer group"
                                    style={{ borderColor: 'var(--luna-border)' }}
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <p className="text-[11px] font-bold tracking-tight opacity-40 uppercase" style={{ color: 'var(--luna-text-main)' }}>{t?.test_date ? new Date(t.test_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110" 
                                                 style={{ 
                                                     background: 'var(--luna-navy)', 
                                                     borderColor: 'var(--luna-border)', 
                                                     color: t?.is_abnormal ? '#ef4444' : 'var(--luna-teal)' 
                                                 }}>

                                                {t?.image_data ? <img src={t.image_data} alt="scan" className="w-10 h-10 rounded-xl object-cover" /> : <FlaskConical className="w-4 h-4 opacity-50" />}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black uppercase tracking-tight leading-none" style={{ color: 'var(--luna-text-main)' }}>{t?.test_name || 'Unknown'}</p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1.5">{t?.category || 'Clinical Diagnostic'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[13px] font-bold truncate max-w-[150px]" style={{ color: 'var(--luna-text-main)' }}>{t?.patient_name || 'N/A'}</p>
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">Institutional Profile</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-lg font-black tracking-tighter" style={{ color: t?.is_abnormal ? '#ef4444' : 'var(--luna-text-main)' }}>
                                                {t?.result_value || 'N/A'}
                                            </span>
                                            {t?.unit && <span className="text-[10px] font-black uppercase opacity-30">{t.unit}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`${t?.is_abnormal ? 'badge-danger' : 'badge-success'} flex items-center gap-1.5`}
                                                  style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.1em' }}>

                                                {t?.is_abnormal ? 'CRITICAL' : 'NOMINAL'}
                                            </span>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Search className="w-12 h-12 mb-4" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">No diagnostic data mapped.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <footer className="px-8 py-4 border-t flex items-center justify-between opacity-30" style={{ borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${abnormalCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <p className="text-[9px] font-black uppercase tracking-widest">
                            {abnormalCount} Critical Path Findings detected in current feed
                        </p>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none">Diagnostic Information Management System V2.1</p>
                </footer>
            </div>
        </motion.div>
    );
};

export default LabPage;