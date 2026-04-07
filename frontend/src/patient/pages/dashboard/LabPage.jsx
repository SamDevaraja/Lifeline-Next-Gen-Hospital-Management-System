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
            {/* DIAGNOSTICS HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-6" style={{ borderColor: 'var(--luna-border)' }}>
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        <FlaskConical className="w-6 h-6 inline mr-2 text-rose-500" /> Laboratory Diagnostics
                    </h1>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--luna-text-dim)' }}>Hematology, biochemistry, and pathology tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role !== 'patient' && (
                        <button className="bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Log Result
                        </button>
                    )}
                    <button className="px-4 py-2 text-xs font-bold rounded-lg border transition-all hover:bg-white/5 flex items-center gap-2" style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <Filter className="w-3.5 h-3.5" /> Filter Panels
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl shadow-sm h-[400px] flex flex-col border p-6" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><AlertCircle className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Abnormal Results</h3>
                            <p className="text-xs font-bold uppercase tracking-widest mt-1 text-rose-500">High Priority Flags</p>
                        </div>
                    </div>

                    <div className="flex-grow space-y-4 z-10 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? <p className="text-center mt-20 italic font-medium" style={{ color: 'var(--luna-text-muted)' }}>Scanning database...</p> :
                            abnormal.length > 0 ? abnormal.map((t, i) => (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={t.id || i} className="p-5 flex items-start gap-4 border-l-4 border-rose-500 rounded-r-xl border-y border-r shadow-sm hover:shadow-md transition-all cursor-pointer"
                                    style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-extrabold text-base mb-1" style={{ color: 'var(--luna-text-main)' }}><span className="text-rose-500 mr-2">{t.test_name}:</span>{t.result_value} <span className="text-xs opacity-70" style={{ color: 'var(--luna-text-muted)' }}>{t.unit}</span></p>
                                        <p className="text-xs font-bold mb-2" style={{ color: 'var(--luna-text-muted)' }}>Patient: {t.patient_name} • Ref: {t.reference_range}</p>
                                        {t.ai_flag_reason && <p className="text-xs p-2 rounded-lg font-bold border" style={{ background: 'var(--luna-warn-bg)', color: 'var(--luna-warn-text)', borderColor: 'var(--luna-border)' }}>{t.ai_flag_reason}</p>}
                                    </div>
                                    <button onClick={() => setDetailsModal({ open: true, item: t })} className="text-xs font-bold px-4 py-2 rounded-lg transition-all flex-shrink-0 border hover:bg-white/5" style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>Review</button>
                                </motion.div>
                            )) : <div className="flex-grow flex flex-col items-center justify-center opacity-80 p-6 border-2 border-dashed rounded-xl mt-4" style={{ borderColor: 'var(--luna-border)' }}>
                                <CheckCircle className="w-10 h-10 mb-3" style={{ color: 'var(--luna-text-muted)' }} />
                                <p className="text-sm font-bold" style={{ color: 'var(--luna-text-muted)' }}>No abnormal detections found.</p>
                            </div>}
                    </div>
                </div>

                <div className="card shadow-2xl border flex flex-col h-[450px]" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500"><Activity className="w-6 h-6" /></div>
                        <h3 className="font-black text-xl" style={{ color: 'var(--luna-text-main)' }}>Recent Scans</h3>
                    </div>
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? <p className="text-center py-20" style={{ color: 'var(--luna-text-muted)' }}>Loading records...</p> :
                            tests.length > 0 ? tests.map((t, i) => (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={t.id || i} className="flex items-center p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-teal-500/20 hover:shadow-md group" style={{ background: 'var(--luna-navy)' }}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-inner group-hover:scale-110 transition-transform" style={{ background: 'var(--luna-card)', color: 'var(--luna-teal)' }}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-black truncate mb-1" style={{ color: 'var(--luna-text-main)' }}>{t.test_name}</p>
                                        <p className="text-xs font-bold truncate opacity-80" style={{ color: 'var(--luna-text-muted)' }}>{t.patient_name} • {t.category}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end pl-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-500/10 px-2 py-1 rounded-md mb-2" style={{ color: 'var(--luna-text-muted)' }}>{new Date(t.test_date).toLocaleDateString()}</span>
                                        {t.is_abnormal ? <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full shadow-sm" style={{ background: LUNA.danger_bg, color: LUNA.danger_text, border: `1px solid ${LUNA.danger_text}` }}>HIGH RISK</span> : <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full shadow-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">OPTIMAL</span>}
                                    </div>
                                </motion.div>
                            )) : <div className="flex-grow flex flex-col items-center justify-center opacity-80 p-6 border-2 border-dashed rounded-xl mt-4" style={{ borderColor: 'var(--luna-border)' }}>
                                    <p className="text-sm font-bold" style={{ color: 'var(--luna-text-muted)' }}>No recent investigations.</p>
                                 </div>}
                    </div>
                    <button onClick={() => navigate('/dashboard/records')} className="w-full mt-6 text-xs font-bold px-4 py-3 rounded-xl border transition-all hover:bg-white/5 flex items-center justify-center gap-2" style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                        <ArrowRight className="w-4 h-4 text-teal-500" /> Go to Archive Explorer
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ── AI Hub Logic & Data ──

export default LabPage;
