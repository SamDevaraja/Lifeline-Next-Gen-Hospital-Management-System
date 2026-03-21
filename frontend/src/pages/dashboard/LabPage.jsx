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

const LabPage = ({ user }) => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                let url = 'lab-tests/';
                if (user?.role === 'doctor') url += `?doctor_id=${user.id}`;
                if (user?.role === 'patient') url += `?patient_id=${user.id}`;
                const res = await api.get(url);
                setTests(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, [user]);

    const abnormal = tests.filter(t => t.is_abnormal);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <DetailsModal
                isOpen={detailsModal.open}
                title="Lab Test Details"
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Clinical Diagnostics</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>AI-assisted laboratory monitoring & automated flagging</p>
                </div>
                <button className="btn-primary text-sm px-5"><Plus className="w-4 h-4" /> New Test Entry</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card shadow-md h-96 flex flex-col relative overflow-hidden group border-0" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                    <div className="absolute right-0 top-0 p-4 opacity-10"><FlaskConical className="w-48 h-48 text-indigo-500" /></div>
                    <h3 className="text-lg font-black" style={{ color: 'var(--luna-teal)' }}>Latest Abnormal Results</h3>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1" style={{ color: LUNA.danger_text }}>
                        <AlertCircle className="w-3.5 h-3.5" /> High Priority Flags
                    </p>

                    <div className="flex-grow space-y-3 z-10 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? <p className="text-center mt-20 italic" style={{ color: 'var(--luna-text-muted)' }}>Scanning database...</p> :
                            abnormal.length > 0 ? abnormal.map((t, i) => (
                                <div key={t.id || i} className="p-4 flex items-start gap-4 border-l-4 border-red-500 rounded-r-xl shadow-sm hover:-translate-x-1 transition-transform cursor-pointer"
                                    style={{ background: 'var(--luna-bg)', borderColor: 'var(--luna-border)' }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm" style={{ color: 'var(--luna-text-main)' }}>{t.test_name}: {t.result_value} {t.unit}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--luna-text-muted)' }}>Patient: {t.patient_name} • Ref: {t.reference_range}</p>
                                        {t.ai_flag_reason && <p className="text-[10px] p-1 rounded mt-1 font-semibold" style={{ background: LUNA.danger_bg, color: LUNA.danger_text }}>{t.ai_flag_reason}</p>}
                                    </div>
                                    <button onClick={() => setDetailsModal({ open: true, item: t })} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0" style={{ color: LUNA.danger_text, background: LUNA.danger_bg, border: `1px solid ${LUNA.danger_text}`, boxShadow: '0 0 10px rgba(239,68,68,0.25)' }}>Review</button>
                                </div>
                            )) : <p className="text-center mt-20 italic" style={{ color: 'var(--luna-text-muted)' }}>No abnormal detections found.</p>}
                    </div>
                </div>

                <div className="card shadow-sm border flex flex-col" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                    <h3 className="font-bold text-md mb-4" style={{ color: 'var(--luna-text-main)' }}>Recent Scans & Investigations</h3>
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '300px' }}>
                        {loading ? <p className="text-center py-20" style={{ color: 'var(--luna-text-muted)' }}>Loading records...</p> :
                            tests.length > 0 ? tests.map((t, i) => (
                                <div key={t.id || i} className="flex items-center p-3 rounded-xl cursor-pointer transition-colors border border-transparent" style={{ background: 'var(--luna-navy)' }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4" style={{ background: 'var(--luna-card)', color: 'var(--luna-text-muted)' }}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-bold truncate" style={{ color: 'var(--luna-text-main)' }}>{t.test_name}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--luna-text-muted)' }}>{t.patient_name} • {t.category}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: 'var(--luna-text-muted)' }}>{new Date(t.test_date).toLocaleDateString()}</span>
                                        {t.is_abnormal ? <span className="text-[8px] font-black px-1.5 rounded-full mt-1" style={{ background: LUNA.danger_text, color: 'white' }}>HIGH</span> : <span className="text-[8px] font-black px-1.5 rounded-full mt-1" style={{ background: LUNA.success_text, color: 'white' }}>OK</span>}
                                    </div>
                                </div>
                            )) : <p className="text-center py-20" style={{ color: 'var(--luna-text-muted)' }}>No recent investigations.</p>}
                    </div>
                    <button onClick={() => navigate('/dashboard/records')} className="w-full mt-6 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2" style={{ color: 'var(--luna-teal)', background: 'var(--luna-navy)', border: '1px solid var(--luna-teal)', boxShadow: '0 0 12px color-mix(in srgb, var(--luna-teal) 20%, transparent)' }}><ArrowRight className="w-3.5 h-3.5" />Archive Explorer</button>
                </div>
            </div>
        </motion.div>
    );
};

// ── AI Hub Logic & Data ──

export default LabPage;