import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, HeartPulse, Search, FileText, AlertCircle, CheckCircle, Clock,
    FlaskConical, User, ArrowRight, ChevronDown, RefreshCw, Database,
    Activity, Filter, BrainCircuit, TrendingUp, Sparkles, X, UserCheck, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[calc(100vh-140px)] gap-6 antialiased">
            
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

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                


                {/* --- MAIN FEED: DIAGNOSTIC STATION --- */}
                <div className="flex-1 flex flex-col rounded-2xl border shadow-sm overflow-hidden" style={cardStyle}>
                    
                    <header className="px-8 flex items-center justify-between py-5 border-b shrink-0 gap-6" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                        <div className="flex flex-col flex-shrink-0">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                    <FlaskConical className="w-6 h-6 inline mr-2 text-rose-500" /> Medical Lab Tests
                                </h1>
                                <p className="text-xs font-bold mt-1" style={{ color: 'var(--luna-text-dim)' }}>Track and manage all diagnostic lab reports.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 justify-end">
                            <div className="flex bg-slate-500/5 p-1 rounded-xl border border-white/5 h-11 shrink-0">
                                {[
                                    { id: 'all', label: 'Global Feed', icon: <Activity className="w-4 h-4" /> },
                                    { id: 'abnormal', label: 'Abnormalities', icon: <FlaskConical className="w-4 h-4" /> }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center justify-center gap-2 px-5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all h-full ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'opacity-50 hover:opacity-100'}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group w-64 shrink-0">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                <input 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Filter condition..."
                                    className="w-full bg-slate-50/5 pl-11 pr-4 h-11 rounded-xl text-xs font-black uppercase border outline-none focus:border-primary/50 transition-all tracking-widest placeholder:opacity-50"
                                    style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                                />
                            </div>

                            <button 
                                onClick={() => setShowNewTestModal(true)}
                                className="px-5 h-11 bg-primary shrink-0 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-4 h-4" /> New Entry
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        {refreshing && <div className="absolute top-40 right-12 z-[100]"><RefreshCw className="w-5 h-5 animate-spin text-[#7c3aed]" /></div>}
                        
                        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: 'var(--luna-border)', backgroundColor: 'var(--luna-background-secondary)' }}>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap" style={{ color: 'var(--luna-text-main)' }}>Date</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-50" style={{ color: 'var(--luna-text-main)' }}>Investigation</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-50" style={{ color: 'var(--luna-text-main)' }}>Patient Record</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-50 text-left" style={{ color: 'var(--luna-text-main)' }}>Result</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-50 text-center" style={{ color: 'var(--luna-text-main)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTests.length > 0 ? filteredTests.map((t, idx) => (
                                            <motion.tr 
                                                key={t?.id || idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                onClick={() => setDetailsModal({ open: true, item: t, title: 'Laboratory Investigation Report' })}
                                                className="border-b transition-all hover:bg-black/5 cursor-pointer group"
                                                style={{ borderColor: 'var(--luna-border)' }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={textMain}>{t?.test_date ? new Date(t.test_date).toLocaleDateString() : 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: t?.is_abnormal ? 'rgba(239, 68, 68, 0.05)' : 'var(--luna-background-secondary)', borderColor: t?.is_abnormal ? 'rgba(239, 68, 68, 0.2)' : 'var(--luna-border)', color: t?.is_abnormal ? '#ef4444' : '#7c3aed' }}>
                                                            {t?.image_data ? <img src={t.image_data} alt="scan" className="w-10 h-10 rounded-xl object-cover opacity-90" /> : <FlaskConical className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black uppercase tracking-tight leading-none" style={textMain}>{t?.test_name || 'Unknown'}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1.5" style={textMain}>{t?.category || 'Unknown'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold truncate max-w-[150px]" style={textMain}>{t?.patient_name || 'Unknown'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start justify-center">
                                                        <span 
                                                            title={t?.result_value}
                                                            className="text-lg font-black tracking-tight leading-tight truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px]" 
                                                            style={{ color: t?.is_abnormal ? '#ef4444' : 'var(--luna-text-main)' }}
                                                        >
                                                            {t?.result_value || 'N/A'}
                                                        </span>
                                                        {t?.unit && t.unit.toLowerCase() !== 'n/a' && !t.result_value?.includes(t.unit) && (
                                                            <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-black tracking-widest opacity-60 border border-slate-500/20" style={{ color: 'var(--luna-text-main)', backgroundColor: 'var(--luna-background-secondary)' }}>
                                                                {t.unit}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    {t?.is_abnormal ? (
                                                        <span className="inline-block px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 shadow-sm">Critical</span>
                                                    ) : (
                                                        <span className="inline-block px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-500/20 shadow-sm">Nominal</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="py-28 text-center" style={{ color: 'var(--luna-text-main)' }}>
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
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <footer className="px-8 py-5 border-t flex items-center justify-between shrink-0" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Abnormal: {abnormalCount}</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Lifeline Laboratory Information Management System • v2.0.4</p>
                    </footer>
                </div>
            </div>
        </motion.div>
    );
};

export default LabPage;