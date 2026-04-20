import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Video, Globe, Clock, Stethoscope, ArrowRight, Activity, ShieldCheck, ExternalLink, RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';

const TelemedicinePage = ({ user }) => {
    const { theme } = useTheme();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('teleconsult/');
            setSessions(res.data.filter(s => s.status === 'live' || s.status === 'scheduled'));
        } catch (err) {
            console.error("Connection Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />

            {/* Institutional Header */}
            <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Virtual Consultation</h1>
                    <button onClick={fetchData} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Connected</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-dim)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        {sessions.length} Available Sessions
                    </div>
                </div>
            </header>

            {/* Institutional Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Live Consultations', value: sessions.filter(s => s.status === 'live').length, color: '#10b981' },
                    { label: 'Scheduled Today', value: sessions.filter(s => s.status === 'scheduled').length, color: '#f59e0b' },
                    { label: 'Past Sessions', value: '42', color: 'var(--luna-teal)' },
                    { label: 'Connection Status', value: 'Stable', color: '#6366f1' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Virtual Access Ledger - Zero-Overflow Protocol */}
            <div className="border rounded-xl shadow-sm bg-[var(--luna-card)] border-[var(--luna-border)] overflow-hidden">
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] w-[40%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Specialist Node</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden md:table-cell w-[20%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Schedule</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center w-[25%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status</th>
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && sessions.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="4" className="px-4 py-10 animate-pulse text-center opacity-40 text-xs font-bold uppercase tracking-widest">
                                            Loading virtual sessions...
                                        </td>
                                    </tr>
                                ))
                            ) : sessions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-28 text-center" style={{ color: 'var(--luna-text-main)' }}>
                                        <div className="flex flex-col items-center">
                                            <Video className="w-12 h-12 opacity-10 mb-4" />
                                            <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase">No Active Sessions</h3>
                                            <p className="text-xs font-semibold opacity-30 mt-1 uppercase tracking-tighter">No virtual consultation sessions currently active.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sessions.map((sess, idx) => (
                                <tr key={sess.id || idx} className="border-b hover:bg-[var(--luna-navy)] transition-colors group" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-4 py-4 text-left w-[40%]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 bg-[var(--luna-navy)] border-[var(--luna-border)]">
                                                <Video className="w-3.5 h-3.5 opacity-40 text-[var(--luna-teal)]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[12px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Dr. {sess.created_by_name}</p>
                                                <p className="text-[9px] font-black uppercase opacity-20 tracking-wider">Clinical Node</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden sm:table-cell text-left w-[20%]">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[12px] font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                                {sess.appointment_date || '2026-04-20'}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] font-medium opacity-30" style={{ color: 'var(--luna-text-main)' }}>
                                                <Clock className="w-3 h-3" />
                                                <span>{sess.appointment_time ? sess.appointment_time.substring(0, 5) : '12:38'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center w-[25%]">
                                        <div className="flex justify-center">
                                            <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                                                sess.status === 'live' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                            }`}>
                                                <div className={`w-1 h-1 rounded-full ${sess.status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                                                <span>{sess.status}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right w-[15%]">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => window.open(sess.meeting_link, '_blank')}
                                                className="p-2.5 rounded-lg border bg-[var(--luna-card)] border-[var(--luna-border)] text-[var(--luna-text-dim)] hover:bg-[var(--luna-teal)]/10 hover:text-[var(--luna-teal)] transition-all group"
                                            >
                                                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all" />
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
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Lifeline Telemedicine System</p>
            </footer>
        </motion.div>
    );
};

export default TelemedicinePage;
