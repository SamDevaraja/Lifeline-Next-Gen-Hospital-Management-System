import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Video, Globe, Clock, User, CheckCircle2, 
    ArrowRight, Search, Zap, ExternalLink, Link2, Filter, AlertCircle, ShieldCheck
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from "./Constants";

const TelemedicinePage = ({ user }) => {
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [meetingLinks, setMeetingLinks] = useState({});
    const { theme } = useTheme();

    const fetchData = async () => {
        try {
            const role = user?.profile?.role || user?.role;
            if (role === 'doctor') {
                const apptRes = await api.get(`appointments/?date=${new Date().toISOString().split('T')[0]}`);
                setTodayAppointments(apptRes.data);
            }
        } catch (err) {
            console.error("Clinical Registry Pulse Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const handleUpdateLink = (id, value) => {
        setMeetingLinks(prev => ({ ...prev, [id]: value }));
    };

    const handleUsePermanent = (appt) => {
        if (appt.doctor_permanent_link) {
            handleUpdateLink(appt.id, appt.doctor_permanent_link);
            toast.success("Permanent Specialist Bridge Selected");
        } else {
            toast.error("No Permanent Link Defined for Node.");
        }
    };

    const handleInitializeBridge = async (appt) => {
        const customLink = meetingLinks[appt.id];
        
        if (!customLink && !appt.meeting_link) {
            toast.error("GMeet Link Required", { 
                icon: <AlertCircle className="text-rose-500" />
            });
            return;
        }

        try {
            toast.loading("Synchronizing GMeet Bridge...", { id: 'bridge' });
            await api.post('teleconsult/create/', { 
                appointment: appt.id,
                patient: appt.patient,
                meeting_link: customLink || appt.meeting_link
            });
            toast.success("Clinical Bridge Active", { id: 'bridge' });
            fetchData();
        } catch (err) {
            toast.error("Bridge synchronization failed.", { id: 'bridge' });
        }
    };

    const filteredAppts = todayAppointments.filter(a => 
        a.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col pt-3 px-6 space-y-6 -mt-6">
            <Toaster position="top-right" />
            
            {/* HERO TERMINAL */}
            <div className="card rounded-[2.5rem] shadow-xl relative overflow-hidden p-8 border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: `radial-gradient(var(--luna-teal) 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--luna-text-main)' }}>Specialist Tele-Consultation Terminal</h1>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2 text-[var(--luna-teal)]">
                            <ShieldCheck className="w-3.5 h-3.5" /> GMeet Clinical Vanguard Protocol - Zero-Trust
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Scan patient registry..." 
                                className="pl-12 pr-6 py-3 rounded-2xl border-none outline-none text-xs font-bold w-64 shadow-inner"
                                style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* VANGUARD REGISTRY TABLE */}
            <div className="card rounded-[2.5rem] shadow-2xl border overflow-hidden" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-bg)' }}>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Patient Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Clinical Window</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">GMeet Bridge Identifier</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-right">Operational Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: 'var(--luna-border)' }}>
                            <AnimatePresence>
                                {filteredAppts.map((appt, idx) => (
                                    <motion.tr 
                                        key={appt.id} 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-500/5 group transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner" style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}>
                                                    {appt.patientName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black" style={{ color: 'var(--luna-text-main)' }}>{appt.patientName}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] mt-0.5">REF: PID-{appt.patient?.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black flex items-center gap-2" style={{ color: 'var(--luna-text-main)' }}>
                                                    <Clock className="w-3.5 h-3.5 text-[var(--luna-teal)]" /> {appt.appointment_time?.slice(0,5)}
                                                </span>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${appt.status==='confirmed'?'bg-emerald-500/10 text-emerald-500':'bg-amber-500/10 text-amber-500'}`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="relative group/input flex-grow max-w-sm">
                                                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--luna-teal)] opacity-50" />
                                                    <input 
                                                        type="text" 
                                                        value={meetingLinks[appt.id] !== undefined ? meetingLinks[appt.id] : (appt.meeting_link || '')}
                                                        placeholder="Paste GMeet clinical link..." 
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-transparent outline-none text-[10px] font-bold shadow-inner transition-all hover:border-[var(--luna-teal)]/30 focus:border-[var(--luna-teal)]"
                                                        style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}
                                                        onChange={(e) => handleUpdateLink(appt.id, e.target.value)}
                                                    />
                                                </div>
                                                {appt.doctor_permanent_link && (
                                                    <button 
                                                        onClick={() => handleUsePermanent(appt)}
                                                        className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[var(--luna-teal)] transition-all flex items-center gap-1.5 w-fit"
                                                    >
                                                        <Zap className="w-3 h-3" /> Use My Permanent Link
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 transition-all duration-500">
                                                {appt.meeting_link ? (
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => window.open(appt.meeting_link, '_blank')}
                                                            className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                            title="Launch Specialist Bridge"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                           onClick={async () => {
                                                               try {
                                                                   toast.loading("Decommissioning clinical bridge...", { id: 'end-sess' });
                                                                   // Find the live session for this appointment and complete it
                                                                   const sessions = await api.get('teleconsult/');
                                                                   const session = sessions.data.find(s => s.appointment === appt.id && s.status === 'live');
                                                                   if (session) {
                                                                       await api.patch(`teleconsult/${session.id}/`, { status: 'completed' });
                                                                       toast.success("Bridge terminated. Finalizing session.", { id: 'end-sess' });
                                                                       // Navigation to records with pre-filled context
                                                                       window.location.href = `/dashboard/records?patient_id=${appt.patient}&appointment_id=${appt.id}`;
                                                                   } else {
                                                                       toast.error("No active bridge found for node.", { id: 'end-sess' });
                                                                   }
                                                               } catch (e) {
                                                                   toast.error("Termination protocol failed.", { id: 'end-sess' });
                                                               }
                                                           }}
                                                           className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                           title="Terminate Bridge & Finalize"
                                                       >
                                                           <CheckCircle2 className="w-4 h-4" />
                                                       </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleInitializeBridge(appt)}
                                                        className="px-6 py-3 rounded-xl bg-[var(--luna-teal)] text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--luna-teal)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        Authorize Bridge <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default TelemedicinePage;