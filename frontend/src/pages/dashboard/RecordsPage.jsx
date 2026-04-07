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
                    
                    // Auto-open modal if context passed from Telemedicine
                    const params = new URLSearchParams(window.location.search);
                    const pid = params.get('patient_id');
                    if (pid) {
                        setRecordModal({ open: true, initialPatient: pid });
                    }
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
                    { key: 'patient', label: 'Patient', type: 'select', options: patients.map(p => ({ value: p.id, label: p.get_name })), initialValue: recordModal.initialPatient },
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Clinical Records & E-Prescriptions</h1>
                {isAdminOrClinical && (
                    <button onClick={() => setRecordModal({ open: true })} className="btn-primary text-xs px-5 py-2 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Clinical Log
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--luna-teal)' }}>Recent Medical Records</h3>
                    <div className="space-y-4">
                        {loading ? <div className="p-8 text-center rounded-2xl border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' }}>Loading...</div> :
                            records.length > 0 ? records.map((r, i) => (
                                <div key={r.id || i} className="card flex items-center gap-4 shadow-sm border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                    <div className="avatar w-12 h-12 flex-shrink-0 font-black">{r.patient_name?.[0] || 'P'}</div>
                                    <div className="flex-grow">
                                        <p className="font-black text-sm" style={{ color: 'var(--luna-text-main)' }}>{r.patient_name}</p>
                                        <p className="text-[11px] font-bold" style={{ color: 'var(--luna-text-muted)' }}>{r.diagnosis || 'General Assessment'}</p>
                                        <p className="text-[9px] font-black mt-1 opacity-60 uppercase tracking-widest">Visit: {r.visit_date}</p>
                                    </div>
                                    <button onClick={() => setDetailsModal({ open: true, item: r })} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all" style={{ color: 'var(--luna-teal)', background: 'var(--luna-navy)' }}>View</button>
                                </div>
                            )) : <div className="p-8 text-center rounded-2xl border italic text-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' }}>No medical records encrypted in archive.</div>}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--luna-text-muted)' }}>Latest E-Prescriptions</h3>
                    <div className="space-y-4">
                        {loading ? <div className="p-8 text-center rounded-2xl border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' }}>Loading...</div> :
                            prescriptions.length > 0 ? prescriptions.map((p, i) => (
                                <div key={p.id || i} className="card flex items-center gap-4 shadow-sm border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: LUNA.info_bg, color: LUNA.info_text }}>
                                        <QrCode className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-black text-sm" style={{ color: 'var(--luna-text-main)' }}>{p.patient_name}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">HASH: {p.qr_code_id}</p>
                                        <p className="text-[10px] mt-0.5 font-bold" style={{ color: 'var(--luna-text-muted)' }}>By {p.doctor_name}</p>
                                    </div>
                                    <button onClick={() => setDetailsModal({ open: true, item: p })} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl" style={{ color: 'var(--luna-text-muted)', background: 'var(--luna-navy)' }}>Open</button>
                                </div>
                            )) : <div className="p-8 text-center rounded-2xl border italic text-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' }}>No digital prescriptions found.</div>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};



export default RecordsPage;