import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Video, Mic, X, Plus, Clock, User, HeartPulse, BrainCircuit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal, InputModal } from './Modals';
import { LUNA } from "./Constants";

const TelemedicinePage = ({ user }) => {
    const [sessions, setSessions] = useState([]);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmEnd, setConfirmEnd] = useState({ open: false, id: null });
    const [launchModal, setLaunchModal] = useState({ open: false, appt: null });
    const [vitals, setVitals] = useState({ hr: 72, spo2: 98, bp: "120/80" });
    const { theme } = useTheme();

    useEffect(() => {
        const interval = setInterval(() => {
            setVitals(prev => ({
                hr: Math.floor(prev.hr + (Math.random() * 4 - 2)),
                spo2: Math.min(100, Math.max(95, prev.spo2 + (Math.random() > 0.8 ? 1 : Math.random() < 0.2 ? -1 : 0))),
                bp: prev.bp
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            let sessUrl = 'telemed/';
            if (user?.role === 'doctor') sessUrl += `?doctor_id=${user.id}`;
            if (user?.role === 'patient') sessUrl += `?patient_id=${user.id}`;
            const sessRes = await api.get(sessUrl);
            setSessions(sessRes.data);

            if (user?.role === 'doctor') {
                const apptRes = await api.get(`appointments/?doctor_id=${user.id}&appointment_date=${new Date().toISOString().split('T')[0]}`);
                setTodayAppointments(apptRes.data.filter(a => a.status !== 'completed' && a.status !== 'cancelled'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);
        return () => clearInterval(interval);
    }, [user]);

    const activeSession = sessions.find(s => s.status === 'live');

    useEffect(() => {
        if (!activeSession) return;
        let index = activeSession.ai_transcript ? activeSession.ai_transcript.length - 1 : 0;
        if (index < 0) index = 0;

        const fakeTranscripts = [
            { speaker: 'Patient', text: "Hello Doctor, I've been experiencing a persistent headache since yesterday." },
            { speaker: 'Doctor', text: "I see. Have you noticed any other symptoms like fever or nausea?" },
            { speaker: 'Patient', text: "A slight fever, maybe 100°F." },
            { speaker: 'System AI', text: "CLINICAL WARNING: Symptoms pattern matching 'Viral Prodrome' or 'Tension Headache'. Confidence 82%. Advise checking hydration context." },
            { speaker: 'Doctor', text: "Are you drinking enough fluids?" },
            { speaker: 'Patient', text: "Probably not enough, only a couple of glasses today." },
            { speaker: 'Doctor', text: "I will prescribe some paracetamol and you need to increase oral fluids. I'll monitor you directly on the dashboard." },
            { speaker: 'System AI', text: "ACTION FLAG: Suggested adding Paracetamol 500mg to prescription pad." },
            { speaker: 'System', text: "[END OF AUTOMATED TRANSCRIPT]" }
        ];

        const transInterval = setInterval(() => {
            if (index < fakeTranscripts.length) {
                api.patch(`telemed/${activeSession.id}/`, {
                    ai_transcript: [...(activeSession.ai_transcript || []), fakeTranscripts[index]]
                }).then(() => fetchData());
                index++;
            } else {
                clearInterval(transInterval);
            }
        }, 15000);

        return () => clearInterval(transInterval);
    }, [activeSession ? activeSession.id : null]);


    const handleLaunchSession = async (appt, specificLink = null) => {
        let link = specificLink || appt.meeting_link;
        if (!link) {
            // Auto generate standard format
            link = `https://meet.google.com/luna-${Math.random().toString(36).substring(2, 6)}-${appt.id}`;
        }

        try {
            toast.loading("Starting virtual session...", { id: 'tele' });
            await api.post('telemed/', {
                doctor: user.id,
                patient: appt.patient,
                scheduled_at: new Date().toISOString(),
                status: 'live',
                meeting_link: link,
                ai_transcript: [
                    { speaker: 'System', text: '[VIRTUAL CONSULTATION STARTED. AI SCRIBE RECORDING INITIATED.]' }
                ]
            });
            await api.patch(`appointments/${appt.id}/`, { meeting_link: link });
            toast.success("Telehealth Session Live.", { id: 'tele' });
            setLaunchModal({ open: false, appt: null });
            fetchData();
            window.open(link, '_blank');
        } catch (err) {
            toast.error("Initialization failed.", { id: 'tele' });
        }
    };

    const handleCustomLinkSubmit = (vals) => {
        if (vals.link && launchModal.appt) {
            handleLaunchSession(launchModal.appt, vals.link);
        }
    };

    const handleEndSession = async (sessionId) => {
        setConfirmEnd({ open: true, id: sessionId });
    };

    const executeEndSession = async () => {
        const id = confirmEnd.id;
        try {
            toast.loading("Closing session...", { id: 'end-tele' });
            await api.patch(`telemed/${id}/`, { status: 'completed' });
            toast.success("Session closed.", { id: 'end-tele' });
            setConfirmEnd({ open: false, id: null });
            fetchData();
        } catch (err) {
            toast.error("Failed to close session.", { id: 'end-tele' });
            setConfirmEnd({ open: false, id: null });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <ConfirmModal
                isOpen={confirmEnd.open}
                title="End Consultation"
                message="Are you sure you want to end this live session? The consultation will be completed and the record updated."
                onConfirm={executeEndSession}
                onCancel={() => setConfirmEnd({ open: false, id: null })}
                type="danger"
            />
            <InputModal
                isOpen={launchModal.open}
                title="Use Custom Meeting Link"
                fields={[{ key: 'link', label: 'Paste External Meet Link (Zoom, Teams, etc)', placeholder: 'https://...', autoFocus: true }]}
                onConfirm={handleCustomLinkSubmit}
                onCancel={() => setLaunchModal({ open: false, appt: null })}
            />
            {/* Header section with clean styling */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Virtual Consultations</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>Manage and conduct live telemedicine appointments</p>
                </div>
                {activeSession && (
                    <div className="flex items-center gap-6 px-4 py-2 rounded-xl shadow-sm border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold" style={{ color: 'var(--luna-text-main)' }}>Connection: Excellent</span>
                        </div>
                        <div className="flex gap-4 border-l pl-4" style={{ borderColor: 'var(--luna-border)' }}>
                            <span className="text-xs font-semibold" style={{ color: 'var(--luna-text-muted)' }}>Ping: 12ms</span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--luna-text-muted)' }}>Quality: 1080p</span>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20 card shadow-sm border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="flex flex-col items-center gap-4">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-full" />
                        <p className="text-xs font-bold text-slate-400">Loading schedules...</p>
                    </div>
                </div>
            ) : activeSession ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left/Middle: Video & Controls */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card overflow-hidden p-0 shadow-lg border rounded-3xl flex flex-col relative" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                            {/* Video Placeholder Area */}
                            <div className="aspect-video w-full flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--luna-navy)' }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                                <div className="z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--luna-bg)', border: '1px solid var(--luna-border)' }}>
                                        <Video className="w-8 h-8" style={{ color: LUNA.teal }} />
                                    </div>
                                    <p className="font-bold mb-1 text-lg" style={{ color: 'var(--luna-text-main)' }}>Virtual Stream Active</p>
                                    <p className="font-medium text-sm" style={{ color: 'var(--luna-text-muted)' }}>Consultation is being hosted securely.</p>
                                    <button
                                        onClick={() => window.open(activeSession.meeting_link, '_blank')}
                                        className="mt-6 btn-teal px-6 py-2.5 rounded-xl transition shadow-md"
                                    >
                                        Re-Open Meeting Window
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <div className="px-3 py-1.5 rounded-lg text-white font-bold text-xs backdrop-blur-md flex items-center gap-2 border" style={{ background: LUNA.danger_bg, borderColor: 'var(--luna-border)', color: LUNA.danger_text }}>
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: LUNA.danger_text }} /> Live Session
                                    </div>
                                </div>
                            </div>

                            {/* Controls Bar */}
                            <div className="p-5 flex items-center justify-between" style={{ background: 'var(--luna-bg)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border" style={{ background: 'var(--luna-card)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}>
                                        {activeSession.patient_name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm" style={{ color: 'var(--luna-text-main)' }}>{activeSession.patient_name}</h4>
                                        <p className="text-xs font-semibold" style={{ color: LUNA.teal }}>Active Patient</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="w-12 h-12 rounded-xl flex items-center justify-center transition-all border shadow-sm hover:scale-105" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <button className="w-16 h-16 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white border shadow-lg" style={{ background: LUNA.teal, borderColor: 'var(--luna-border)' }}>
                                        <Video className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => handleEndSession(activeSession.id)}
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg text-white border"
                                        style={{ background: '#e11d48', borderColor: 'var(--luna-border)' }}
                                    >
                                        <X className="w-8 h-8" />
                                    </button>
                                </div>
                                <div className="w-32 flex justify-end">
                                    <div className="px-3 py-2 rounded-lg border text-xs font-mono flex items-center gap-2" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' }}>
                                        <Clock className="w-3.5 h-3.5" /> Active Live
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Quick Vitals (Professional layout) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { title: "Heart Rate", value: `${vitals.hr} BPM`, icon: HeartPulse, color: LUNA.danger_text, bg: LUNA.danger_bg },
                                { title: "Blood Pressure", value: vitals.bp, icon: Activity, color: LUNA.teal, bg: 'rgba(46, 196, 182, 0.1)' },
                                { title: "Oxygen Level", value: `${vitals.spo2}%`, icon: User, color: LUNA.success_text, bg: LUNA.success_bg }
                            ].map((v, i) => (
                                <div key={i} className="card shadow-sm border p-5 flex items-center gap-4" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{ background: v.bg, color: v.color }}>
                                        <v.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--luna-text-muted)' }}>{v.title}</p>
                                        <p className="text-xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>{v.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: AI Scribe Sidebar */}
                    <div className="card shadow-sm border flex flex-col h-[700px] overflow-hidden p-0" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <div className="p-5 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--luna-text-main)' }}>
                                <BrainCircuit className="w-4 h-4 text-blue-500" /> AI Clinical Scribe
                            </h3>
                            <p className="text-xs font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>Real-time automated transcription</p>
                        </div>
                        <div className="flex-grow overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {(activeSession.ai_transcript && activeSession.ai_transcript.length > 0) ? (
                                activeSession.ai_transcript.map((t, idx) => (
                                    <div key={idx} className="space-y-1.5 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`} style={{ background: t.speaker === 'Doctor' ? 'var(--luna-navy)' : 'var(--luna-bg)', color: 'var(--luna-text-main)', border: '1px solid var(--luna-border)' }}>
                                                {t.speaker}
                                            </span>
                                            <span className="text-[10px] font-medium" style={{ color: 'var(--luna-text-muted)' }}>00:1{idx}s</span>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed pl-2 border-l-2" style={{ color: 'var(--luna-text-main)', borderColor: t.speaker === 'System AI' ? LUNA.warn_text : 'var(--luna-border)' }}>
                                            {t.text}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-60 py-20 text-center">
                                    <BrainCircuit className="w-12 h-12 mb-4 text-slate-300" />
                                    <p className="text-sm font-bold text-slate-400">Scribe Standby</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card shadow-sm border p-8 min-h-[500px]" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                    {user?.role === 'patient' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--luna-navy)', color: LUNA.teal, border: '1px solid var(--luna-border)' }}>
                                <Video className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--luna-text-main)' }}>Awaiting Consultation</h2>
                            <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--luna-text-muted)' }}>
                                Please hold. The doctor will initiate the live connection shortly. Make sure your video and audio devices are ready.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-8 border-b pb-4" style={{ borderColor: 'var(--luna-border)' }}>
                                <h3 className="text-lg font-bold" style={{ color: 'var(--luna-text-main)' }}>Today's Scheduled Consultations</h3>
                                <div className="px-3 py-1 rounded-lg font-bold text-xs" style={{ background: 'var(--luna-navy)', color: LUNA.teal, border: '1px solid var(--luna-border)' }}>{todayAppointments.length} pending</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {todayAppointments.length > 0 ? todayAppointments.map((a, i) => (
                                    <div key={i} className="p-5 rounded-2xl group transition-all border shadow-sm hover:shadow-md cursor-pointer" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border" style={{ background: 'var(--luna-card)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}>
                                                    {a.patientName?.[0] || 'P'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold truncate max-w-[120px]" style={{ color: 'var(--luna-text-main)' }}>{a.patientName}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" style={{ color: 'var(--luna-text-muted)' }} />
                                                        <p className="text-xs font-semibold" style={{ color: 'var(--luna-text-muted)' }}>{a.appointment_time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleLaunchSession(a)}
                                                className="flex-1 btn-teal py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                                            >
                                                <Video className="w-4 h-4" /> {a.meeting_link ? 'Start Linked Session' : 'Auto-Generate & Start'}
                                            </button>
                                            {!a.meeting_link && (
                                                <button
                                                    onClick={() => setLaunchModal({ open: true, appt: a })}
                                                    className="w-11 h-full py-2.5 rounded-xl flex items-center justify-center border shadow-sm transition-all hover:scale-105"
                                                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                                                    title="Paste custom link"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--luna-border)' }}>
                                        <FileText className="w-12 h-12 text-slate-300 mb-4" />
                                        <p className="text-sm font-bold text-slate-400">No pending virtual consultations for today.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default TelemedicinePage;