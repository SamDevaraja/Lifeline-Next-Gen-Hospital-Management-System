import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Video, Globe, Clock, Stethoscope, ArrowRight, Activity, ShieldCheck, ExternalLink
} from 'lucide-react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';

const TelemedicinePage = ({ user }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    const fetchData = async () => {
        try {
            const res = await api.get('teleconsult/');
            setSessions(res.data.filter(s => s.status === 'live' || s.status === 'scheduled'));
        } catch (err) {
            console.error("Patient Bridge Pulse Error:", err);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col pt-3 px-6 space-y-6 -mt-6">
            
            {/* HERO TERMINAL */}
            <div className="card rounded-[2.5rem] shadow-xl relative overflow-hidden p-8 border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: `radial-gradient(var(--luna-teal) 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--luna-text-main)' }}>Patient Consultation Portal</h1>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2 text-[var(--luna-teal)]">
                            <ShieldCheck className="w-3 h-3" /> Secure GMeet Vanguard Terminal Active
                        </p>
                    </div>
                    <div className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {sessions.length} Active Consultations
                    </div>
                </div>
            </div>

            {/* VIRTUAL BRIDGE TABLE */}
            <div className="card rounded-[2.5rem] shadow-2xl border overflow-hidden" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-bg)' }}>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Specialist Registry</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Session Window</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Operational Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-right">Clinical Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: 'var(--luna-border)' }}>
                            <AnimatePresence>
                                {sessions.map((sess, idx) => (
                                    <motion.tr 
                                        key={sess.id} 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-500/5 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner" style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}>
                                                    {sess.created_by_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black" style={{ color: 'var(--luna-text-main)' }}>Dr. {sess.created_by_name}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--luna-teal)] mt-0.5">Assigned Specialist</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-black" style={{ color: 'var(--luna-text-main)' }}>
                                                <Clock className="w-3.5 h-3.5 text-[var(--luna-teal)]" /> 
                                                Live Bridge Active
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Channel Live
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => window.open(sess.meeting_link, '_blank')}
                                                className="px-6 py-3 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ml-auto"
                                            >
                                                Launch GMeet Bridge <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {sessions.length === 0 && !loading && (
                    <div className="py-24 text-center">
                        <Activity className="w-12 h-12 text-[#94a3b8]/20 mx-auto mb-4 animate-pulse" />
                        <p className="text-xs font-bold text-[#94a3b8]">Awaiting secure physician authorization signal.</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]/60 mt-1">LUNA V-TRANS SECURE POLLING ACTIVE</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TelemedicinePage;
