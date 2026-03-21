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

const KNOWLEDGE_BASE = {
    conditions: {
        fever: { keywords: ['fever', 'temperature', 'chills', 'hot'], conditions: ['Viral Fever', 'Dengue', 'Typhoid'], advice: 'Monitor temp every 4 hours. Stay hydrated.', tests: ['CBC', 'NS1 Antigen'] },
        headache: { keywords: ['headache', 'migraine', 'head pain'], conditions: ['Migraine', 'Dehydration', 'Hypertension'], advice: 'Rest in a dark room. Apply cold compress.', tests: ['BP Check'] },
        chest_pain: { keywords: ['chest', 'heart', 'pain', 'pressure'], conditions: ['Myocardial Infarction', 'Angina', 'GERD'], advice: '🚨 URGENT: Seek emergency care immediately.', tests: ['ECG', 'Troponin'] },
        respiratory: { keywords: ['breath', 'breathing', 'cough', 'shortness'], conditions: ['Asthma', 'Pneumonia', 'COPD'], advice: '🚨 URGENT: Immediate medical attention required.', tests: ['Pulse Oximetry', 'Chest X-Ray'] },
        diabetes: { keywords: ['diabetes', 'sugar', 'glucose', 'insulin'], conditions: ['Type 2 Diabetes', 'Hyperglycemia'], advice: 'Regular blood glucose monitoring is essential.', tests: ['FBS', 'HbA1c'] },
        mental_health: { keywords: ['depression', 'anxiety', 'mental', 'stress'], conditions: ['General Anxiety', 'Depression'], advice: 'You are not alone. Our professionals are available 24/7.', tests: ['Counseling Session'] }
    },
    departments: {
        cardiology: { keywords: ['cardio', 'heart specialist', 'ecg'], info: 'Cardiology unit: Floor 2, Wing A.', hours: '9:00 AM - 6:00 PM' },
        neurology: { keywords: ['neuro', 'brain', 'nerves'], info: 'Neurology department: Floor 3, Wing B.', hours: '10:00 AM - 5:00 PM' },
        pediatrics: { keywords: ['child', 'baby', 'pediatric'], info: 'Pediatrics: Floor 1, Wing C.', hours: '8 AM - 8 PM' }
    },
    admin: {
        appointment: { keywords: ['appointment', 'book', 'schedule'], response: 'I can help with rescheduling below. For new bookings, use the Registry tab.' },
        emergency: { keywords: ['emergency', 'urgent', 'ambulance'], response: '🚨 Call 911 / 108 immediately for life-threatening cases.' },
        reschedule: { keywords: ['reschedule', 'change date', 'move appointment'], response: 'I can help you reschedule. Fetching your active sessions now...' }
    }
};

const findBestMatch = (msg) => {
    const l = msg.toLowerCase();
    let bestMatch = { type: 'none', score: 0, data: null };
    for (const [key, cat] of Object.entries(KNOWLEDGE_BASE.conditions)) {
        let sc = 0; cat.keywords.forEach(kw => { if (l.includes(kw)) sc += 1; });
        if (sc > bestMatch.score) bestMatch = { type: 'condition', score: sc, data: cat };
    }
    for (const [key, cat] of Object.entries(KNOWLEDGE_BASE.departments)) {
        let sc = 0; cat.keywords.forEach(kw => { if (l.includes(kw)) sc += 1; });
        if (sc > bestMatch.score) bestMatch = { type: 'department', score: sc, data: cat };
    }
    for (const [key, cat] of Object.entries(KNOWLEDGE_BASE.admin)) {
        let sc = 0; cat.keywords.forEach(kw => { if (l.includes(kw)) sc += 1; });
        if (sc > bestMatch.score) bestMatch = { type: 'admin', score: sc, data: cat };
    }
    return bestMatch;
};

// ── AI Page ──
const AIPage = ({ user }) => {
    const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello! I am Lifeline AI Neural Core. I am now synchronized with clinical diagnostic protocols and your hospital records. How can I assist you today?' }]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [pendingAction, setPendingAction] = useState(null); // { type: 'reschedule', step: 'select', targetId: null }
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.role === 'patient') {
                try {
                    const appts = await api.get(`appointments/?patient_id=${user.id}&status=confirmed`);
                    setAppointments(appts.data);
                } catch (err) { console.log("Appointments fetch failed"); }
            }
        };
        fetchUserData();
    }, [user]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onresult = (e) => {
                const tr = e.results[0][0].transcript;
                setInput(tr);
                setIsListening(false);
                send(tr);
            };
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, typing]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            if (!recognitionRef.current) {
                toast.error("Speech recognition not supported");
                return;
            }
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleRescheduleExecution = async (id, newDate) => {
        try {
            await api.patch(`appointments/${id}/`, { appointment_date: newDate });
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `✅ **Sync Success!** Your appointment has been officially moved to **${newDate}**. The database is updated and your specialist has been notified.`
            }]);
            const appts = await api.get(`appointments/?patient_id=${user.id}&status=confirmed`);
            setAppointments(appts.data);
            toast.success("Database synchronized successfully.");
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "❌ I encountered a database sync error. Please verify the date and protocol." }]);
        }
    };

    const buildResponse = (match, rawInput) => {
        if (pendingAction?.type === 'reschedule') {
            if (pendingAction.step === 'select') {
                const choice = parseInt(rawInput) - 1;
                const s = appointments[choice];
                if (s) {
                    setPendingAction({ ...pendingAction, step: 'date', targetId: s.id });
                    return { text: `Acknowledged. Relocating session with **${s.doctorName}**. What is the new preferred clinical date? (YYYY-MM-DD)` };
                }
                return { text: "Protocol Error: Invalid Selection. Please choose a number from the list." };
            }
            if (pendingAction.step === 'date') {
                const dateMatch = rawInput.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                    handleRescheduleExecution(pendingAction.targetId, dateMatch[0]);
                    setPendingAction(null);
                    return { text: `⚙️ **Processing Neural Sync...** Updating record to ${dateMatch[0]}.` };
                }
                return { text: "Date format invalid. Please use YYYY-MM-DD for accurate record sync." };
            }
        }

        if (match.type === 'admin' && match.data.keywords.includes('reschedule')) {
            if (user?.role !== 'patient') return { text: "Rescheduling protocols are currently restricted to secure patient sessions. Please use the Admin Schedule Registry." };
            if (appointments.length === 0) return { text: "No active confirmed sessions found in your registry to reschedule." };
            setPendingAction({ type: 'reschedule', step: 'select', targetId: null });
            return {
                text: `**Found ${appointments.length} active sessions.** Which would you like to move?\n\n${appointments.map((a, i) => `${i + 1}. **${a.doctorName}** - ${a.appointment_date}`).join('\n')}\n\n*Execute by typing the number.*`
            };
        }

        if (match.score > 0) {
            if (match.type === 'condition') return { text: `**Diagnostic Analysis:**\n${match.data.advice}\n\n**Common Tests:** ${match.data.tests.join(', ')}` };
            if (match.type === 'department') return { text: `**Department Intel:** ${match.data.info}\nOperational Hours: ${match.data.hours}` };
            return { text: match.data.response };
        }

        return null;
    };

    const send = async (msg) => {
        const text = msg || input;
        if (!text.trim()) return;

        setMessages(p => [...p, { role: 'user', text }]);
        setInput('');
        setTyping(true);

        setTimeout(async () => {
            const match = findBestMatch(text);
            const response = buildResponse(match, text);

            if (response) {
                setMessages(p => [...p, { role: 'ai', text: response.text }]);
                setTyping(false);
            } else {
                try {
                    const res = await api.post('ai/chat/', { message: text });
                    setMessages(p => [...p, { role: 'ai', text: res.data.text }]);
                } catch (err) {
                    setMessages(p => [...p, { role: 'ai', text: "⚠️ Neural link interrupted. Locally cached protocols suggest consulting a specialist." }]);
                } finally {
                    setTyping(false);
                }
            }
        }, 600);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
            {/* Console Header */}
            <div className="w-full flex items-center border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                        <BrainCircuit className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Intelligence Core</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">{user?.role === 'patient' ? 'Patient Hub' : 'Operational'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural v4.0</span>
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className="badge-live">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_10px_rgba(45,196,182,0.5)]" /> Secure Neural Session
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5">
                {(user?.role === 'patient'
                    ? ['Reschedule my appointment', 'Analyze fever symptoms', 'Cardiology info', 'Chest pain guidance']
                    : ['Analyze high risk zones', 'Available cardiologists', 'Personnel tracking', 'System diagnostics']
                ).map((q, i) => (
                    <button key={i} onClick={() => send(q)}
                        className="text-[10px] font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all border border-white/5 backdrop-blur-md hover:border-teal-500/30 hover:bg-teal-500/5 shadow-sm"
                        style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-muted)' }}>
                        {q}
                    </button>
                ))}
            </div>

            {/* Main Console */}
            <div className="card-clinical flex flex-col h-[500px] sm:h-[600px] !p-0 overflow-hidden shadow-2xl relative border rounded-3xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                {/* AI Header Interface */}
                <div className="flex items-center flex-wrap sm:flex-nowrap gap-3 sm:gap-4 p-4 sm:p-5 z-10" style={{ background: 'var(--luna-navy)', borderBottom: '1px solid var(--luna-border)', backdropBlur: '10px' }}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/10 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                        <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="text-xs sm:text-sm font-black tracking-wide truncate" style={{ color: 'var(--luna-text-main)' }}>Lifeline AI Engine</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                            <span className="text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-widest whitespace-nowrap">v2.1 Clinical</span>
                            <span className="hidden xs:inline text-[8px] sm:text-[9px] font-bold uppercase whitespace-nowrap" style={{ color: 'var(--luna-text-muted)' }}>Synchronized</span>
                        </div>
                    </div>
                </div>

                {/* Message Surface */}
                <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar" style={{ background: 'var(--luna-bg)', opacity: 0.95 }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-lg border ${m.role === 'user'
                                ? 'bg-indigo-600 text-white border-transparent rounded-tr-none'
                                : 'rounded-tl-none font-medium'
                                }`}
                                style={m.role !== 'user' ? { background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' } : {}}>
                                {m.text.split('\n').map((line, idx) => (line.trim() ? <p key={idx}>{line}</p> : <br key={idx} />))}
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div className="flex gap-2 p-3 rounded-2xl w-fit border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                            {[0, 0.15, 0.3].map((d, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: `${d}s` }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Command Bar */}
                <div className="p-3 sm:p-4" style={{ background: 'var(--luna-card)', borderTop: '1px solid var(--luna-border)' }}>
                    <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 sm:gap-3 items-center">
                        <div className="flex-grow relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--luna-text-muted)' }} />
                            <input value={input} onChange={e => setInput(e.target.value)} type="text"
                                placeholder={isListening ? "Listening..." : "Execute command..."}
                                className="w-full border rounded-2xl py-2.5 sm:py-3.5 pl-9 sm:pl-12 pr-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all shadow-inner"
                                style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }} />
                        </div>
                        <button type="button" onClick={toggleListening}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 border ${isListening ? 'bg-red-500 animate-pulse text-white border-transparent shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'hover:scale-105 active:scale-95 shadow-sm'}`}
                            style={!isListening ? { background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-muted)' } : {}}>
                            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button type="submit" disabled={typing}
                            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-center" style={{ color: 'var(--luna-text-dim)' }}>
                <span className="flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Advisory Required</span>
                <span className="hidden sm:block w-1 h-1 rounded-full" style={{ background: 'var(--luna-border)' }} />
                <span>AES-256 Tunnel active</span>
            </div>
        </motion.div>
    );
};

// ── Notifications Page ──

export default AIPage;