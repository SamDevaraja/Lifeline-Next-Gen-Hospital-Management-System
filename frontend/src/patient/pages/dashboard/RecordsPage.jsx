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

const RecordsPage = ({ user }) => {
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const [recordModal, setRecordModal] = useState({ open: false });
    const [patients, setPatients] = useState([]);

    const isAdminOrClinical = user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse';

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                let recUrl = 'medical-records/';
                let presUrl = 'prescriptions/';

                if (user?.role === 'doctor') {
                    recUrl += `?doctor_id=${user.id}`;
                    presUrl += `?doctor_id=${user.id}`;
                } else if (user?.role === 'patient') {
                    recUrl += `?patient_id=${user.id}`;
                    presUrl += `?patient_id=${user.id}`;
                }

                const [r, p] = await Promise.all([api.get(recUrl), api.get(presUrl)]);
                setRecords(r.data);
                setPrescriptions(p.data);

                if (isAdminOrClinical) {
                    const patRes = await api.get('patients/');
                    setPatients(patRes.data);
                }
            } catch (err) {
                console.error("Records fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [user]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 max-w-7xl mx-auto">
            <DetailsModal
                isOpen={detailsModal.open}
                title="Clinical Health Record"
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />
            <InputModal
                isOpen={recordModal.open}
                title="Log New Medical Record & Vitals"
                fields={[
                    { key: 'patient', label: 'Patient', type: 'select', options: patients.map(p => ({ value: p.id, label: p.get_name })) },
                    { key: 'diagnosis', label: 'Primary Diagnosis / Notes', placeholder: 'Enter clinical observations...' },
                    { key: 'vitals', label: 'Vitals (BP, Temp, HR)', placeholder: 'e.g. 120/80 mmHg, 98.6F, 72BPM' },
                ]}
                onConfirm={async (vals) => {
                    if (!vals.patient) return toast.error("Select patient");
                    try {
                        toast.loading('Logging record...');
                        const payload = {
                            patientId: vals.patient,
                            patient_name: patients.find(p => p.id === parseInt(vals.patient))?.get_name,
                            diagnosis: vals.diagnosis || 'Routine Check',
                            treatment_plan: vals.vitals ? `Vitals Logged: ${vals.vitals}` : 'No plan provided.',
                            visit_date: new Date().toISOString().split('T')[0]
                        };
                        await api.post('medical-records/', payload);
                        toast.dismiss();
                        toast.success('Record saved.');
                        setRecordModal({ open: false });
                        const r = await api.get('medical-records/');
                        setRecords(r.data);
                    } catch (e) {
                         toast.dismiss();
                         toast.error('Failed to log record.');
                    }
                }}
                onCancel={() => setRecordModal({ open: false })}
            />
            {/* DOCUMENT VAULT HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--luna-border)' }}>
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        <FileText className="w-6 h-6 inline mr-2 text-teal-500" /> Clinical Archives
                    </h1>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--luna-text-dim)' }}>Secure medical history and prescriptions vault.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-bold rounded-lg border transition-all hover:bg-white/5 flex items-center gap-2" style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <Filter className="w-3.5 h-3.5" /> Filter Records
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* MEDICAL RECORDS COLUMN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-teal-500">Medical History</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="animate-shimmer h-24 rounded-2xl border border-white/5" />) :
                            records.length > 0 ? records.map((r, i) => (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={r.id || i} 
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all relative overflow-hidden cursor-pointer" 
                                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                    <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center border" style={{ background: 'var(--luna-navy)', color: 'var(--luna-teal)', borderColor: 'var(--luna-border)' }}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow relative z-10">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-black text-base" style={{ color: 'var(--luna-text-main)' }}>{r.diagnosis || 'Clinical Assessment'}</p>
                                        </div>
                                        <p className="text-xs font-bold mb-2" style={{ color: 'var(--luna-text-muted)' }}>Dr. {r.doctor_name || 'Assigned Specialist'}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md text-teal-500 bg-teal-500/10 border border-teal-500/20">
                                                {r.visit_date}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setDetailsModal({ open: true, item: r })} className="self-start sm:self-center text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl transition-all hover:bg-teal-500 hover:text-white shadow-sm relative z-10" style={{ color: 'var(--luna-teal)', background: 'var(--luna-navy)' }}>View</button>
                                </motion.div>
                            )) : <div className="p-10 text-center rounded-3xl border flex flex-col items-center justify-center shadow-inner" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                    <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4"><Activity className="w-8 h-8 opacity-50"/></div>
                                    <p className="text-sm font-bold opacity-60" style={{ color: 'var(--luna-text-main)' }}>No medical records encrypted in archive.</p>
                                </div>}
                    </div>
                </div>

                {/* PRESCRIPTIONS COLUMN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500">Active E-Prescriptions</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="animate-shimmer h-24 rounded-2xl border border-white/5" />) :
                            prescriptions.length > 0 ? prescriptions.map((p, i) => (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={p.id || i} 
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all relative overflow-hidden cursor-pointer" 
                                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center border" style={{ background: 'var(--luna-navy)', color: LUNA.info_text, borderColor: 'var(--luna-border)' }}>
                                        <QrCode className="w-7 h-7" />
                                    </div>
                                    <div className="flex-grow relative z-10">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-black text-base" style={{ color: 'var(--luna-text-main)' }}>Digital Vault Tx.</p>
                                        </div>
                                        <p className="text-xs font-bold mb-2" style={{ color: 'var(--luna-text-muted)' }}>Authorized by Dr. {p.doctor_name || 'Specialist'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md">HASH: {p.qr_code_id}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setDetailsModal({ open: true, item: p })} className="self-start sm:self-center text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl transition-all hover:bg-indigo-500 hover:text-white shadow-sm relative z-10" style={{ color: 'var(--luna-text-muted)', background: 'var(--luna-navy)' }}>Open</button>
                                </motion.div>
                            )) : <div className="p-10 text-center rounded-3xl border flex flex-col items-center justify-center shadow-inner" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4"><QrCode className="w-8 h-8 opacity-50"/></div>
                                    <p className="text-sm font-bold opacity-60" style={{ color: 'var(--luna-text-main)' }}>No digital prescriptions found.</p>
                                </div>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};



export default RecordsPage;
