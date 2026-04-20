import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, RefreshCw
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/index.js';

import { ConfirmModal, InputModal, DetailsModal, Modal } from './Modals';
import { LUNA } from "./Constants";

const AppointmentList = ({ user }) => {
    const { theme } = useTheme();
    const [allAppointments, setAllAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirmCancel, setConfirmCancel] = useState({ open: false, id: null });
    const [newApptModal, setNewApptModal] = useState({ open: false });
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const [availableSlots, setAvailableSlots] = useState({});

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let apptUrl = 'appointments/';
            let params = new URLSearchParams();
            if (user?.role === 'patient') params.append('patient_id', user.patient_id);
            const query = params.toString();
            if (query) apptUrl += `?${query}`;

            const promises = [api.get(apptUrl)];
            if (user?.role === 'patient') {
                promises.push(api.get('doctors/available/'));
            }

            const results = await Promise.all(promises);
            setAllAppointments(Array.isArray(results[0].data) ? results[0].data : []);
            if (results[1]) setDoctors(Array.isArray(results[1].data) ? results[1].data : []);

        } catch (err) {
            console.error("Clinical sync error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    // Zero-latency filtering and prioritized sorting engine
    const filteredData = React.useMemo(() => {
        let list = [...allAppointments];
        if (statusFilter !== 'all') {
            list = list.filter(a => a.status === statusFilter);
        }

        // Sorting priority protocol: Pending > Confirmed > Completed > Cancelled
        const priority = {
            'pending': 1,
            'confirmed': 2,
            'completed': 3,
            'cancelled': 4
        };

        return list.sort((a, b) => {
            const pA = priority[a.status] || 99;
            const pB = priority[b.status] || 99;
            if (pA !== pB) return pA - pB;
            
            // Secondary sort: Most recent date first
            return new Date(b.appointment_date) - new Date(a.appointment_date);
        });
    }, [allAppointments, statusFilter]);

    const handleCancel = async () => {
        const id = confirmCancel.id;
        try {
            toast.loading("Updating institutional schedule...", { id: 'cancel' });
            await api.patch(`appointments/${id}/`, { status: 'cancelled' });
            toast.success("Engagement formally terminated.", { id: 'cancel' });
            setConfirmCancel({ open: false, id: null });
            fetchAppointments();
        } catch (err) {
            toast.error("Termination failure.", { id: 'cancel' });
            setConfirmCancel({ open: false, id: null });
        }
    };

    const handleModalFieldChange = async (key, val, allValues) => {
        const date = allValues.date;
        const doctorId = allValues.doctor;
        if (date && doctorId) {
            try {
                // Trigger clinical capacity audit
                const res = await api.get(`appointments/check_availability/?doctor=${doctorId}&date=${date}`);
                setAvailableSlots(res.data.slots || {});
            } catch (e) {
                console.error("Clinical capacity check failed:", e);
                toast.error("Capacity sync failure. Using default allocation.");
            }
        }
    };

    const generateTimeOptions = () => {
        const options = [];
        for (let h = 8; h < 20; h++) {
            for (let m of [0, 30]) {
                const clock = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const occupancy = availableSlots[clock] || 0;
                
                // Admin logic: 3 slots per 30m block
                if (occupancy < 3) {
                    const [h_p, m_p] = clock.split(':').map(Number);
                    const blockEndTotal = m_p + 30;
                    const blockEndH = h_p + Math.floor(blockEndTotal / 60);
                    const blockEndM = blockEndTotal % 60;
                    const blockRange = `${clock} - ${String(blockEndH).padStart(2, '0')}:${String(blockEndM).padStart(2, '0')}`;

                    options.push({ 
                        value: clock, 
                        label: (
                            <div className="flex flex-col items-center justify-center py-2 px-1">
                                <span className="text-[14px] font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{blockRange}</span>
                                <div className="mt-2 w-full h-[3px] rounded-full overflow-hidden flex gap-[2px] bg-slate-500/10">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`flex-1 transition-all duration-300 ${i <= (3 - occupancy) ? 'bg-[var(--luna-teal)]' : 'bg-transparent'}`} />
                                    ))}
                                </div>
                                <span className="text-[7px] font-bold opacity-30 mt-2 tracking-[0.05em] uppercase">
                                    {3 - occupancy} SLOTS AVAILABLE
                                </span>
                            </div>
                        )
                    });
                }
            }
        }
        return options;
    };

    const stats = {
        today: allAppointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length,
        pending: allAppointments.filter(a => a.status === 'pending').length,
        completed: allAppointments.filter(a => a.status === 'completed').length,
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            <ConfirmModal
                isOpen={confirmCancel.open}
                title="Terminate Engagement"
                message="Are you sure you want to cancel this appointment? This action will immediately release the clinical slot for other patients."
                onConfirm={handleCancel}
                onCancel={() => setConfirmCancel({ open: false, id: null })}
                type="danger"
            />
            <DetailsModal
                isOpen={detailsModal.open}
                title="Clinical Appointment Record"
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />
            <InputModal
                isOpen={newApptModal.open}
                title="Schedule New Encounter"
                onFieldChange={handleModalFieldChange}
                fields={[
                    {
                        key: 'doctor',
                        label: 'Clinical Lead Specialist',
                        type: 'select',
                        options: (doctors || []).map(d => ({ value: d.id, label: `Dr. ${d.get_name || 'Staff'} (${d.department || 'General'})` })),
                        fullWidth: true
                    },
                    { key: 'date', label: 'Date of Encounter', type: 'date', initialValue: new Date().toISOString().split('T')[0] },
                    { 
                        key: 'time', 
                        label: 'Time Slot (30m Interval)', 
                        type: 'radio-grid',
                        options: generateTimeOptions(),
                        fullWidth: true
                    },
                    { key: 'description', label: 'Clinical Indication / Symptoms', placeholder: 'Brief description of chief complaint...', fullWidth: true }
                ]}
                onConfirm={(vals) => {
                    const { date, time, doctor, description } = vals;
                    if (!date || !time || !doctor) {
                        toast.error("Missing critical scheduling parameters.");
                        return;
                    }
                    api.post('appointments/', { 
                            appointment_date: date, 
                            appointment_time: time, 
                            description: description || '',
                            status: 'pending', 
                            patient: user.patient_id, 
                            doctor 
                        })
                        .then(() => {
                            toast.success("Encounter definitively scheduled.");
                            setNewApptModal({ open: false });
                            setAvailableSlots({});
                            fetchAppointments();
                        })
                        .catch((err) => {
                            const errorMsg = err.response?.data?.error || "Scheduling conflict. Please verify clinical capacity.";
                            toast.error(errorMsg);
                        });
                }}
                onCancel={() => { setNewApptModal({ open: false }); setAvailableSlots({}); }}
            />
            
            {/* Header */}
            <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Appointments</h1>
                    <button onClick={fetchAppointments} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Live Sync</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="relative">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest border rounded-xl appearance-none cursor-pointer focus:outline-none transition-all shadow-sm bg-[var(--luna-card)]"
                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        >
                            <option value="all">All Status</option>
                            {['pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                                <option key={f} value={f}>{f.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30 rotate-90 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => setNewApptModal({ open: true })}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors shadow-lg active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" /> Initialize Protocol
                    </button>
                </div>
            </header>

            {/* Minimal Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Appointments', value: allAppointments.length, color: 'var(--luna-teal)' },
                    { label: 'Pending Auth', value: stats.pending, color: '#f59e0b' },
                    { label: 'Finalized', value: stats.completed, color: '#10b981' },
                    { label: 'Today', value: stats.today, color: '#6366f1' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{loading ? '...' : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Appointments List */}
            <div className="border rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Specialist Demographic</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Institutional Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell text-center" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status Layer</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Encounter Hub</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td colSpan="4" className="px-6 py-8 animate-pulse text-center opacity-40 text-[10px] font-black uppercase tracking-widest">
                                            Synchronizing appointment ledger...
                                        </td>
                                    </tr>
                                ))
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-28 text-center" style={{ color: 'var(--luna-text-main)' }}>
                                        <div className="flex flex-col items-center">
                                            <Calendar className="w-12 h-12 opacity-10 mb-4" />
                                            <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase">Clear Schedule</h3>
                                            <p className="text-[10px] font-semibold opacity-30 mt-1 uppercase tracking-tighter">No active encounters found in this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.map((a) => (
                                <tr key={a.id} className="border-b hover:bg-[var(--luna-navy)] transition-colors group" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 bg-[var(--luna-navy)] border-[var(--luna-border)] transition-transform group-hover:scale-105">
                                                <Stethoscope className="w-4 h-4 opacity-40 text-[var(--luna-teal)]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-semibold text-[12px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Dr. {a.doctorName}</p>
                                                <p className="text-[8px] font-bold opacity-30 mt-0.5 uppercase tracking-wider">REF-{String(a.id).padStart(4, '0')} • Specialist</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-semibold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{a.appointment_date}</span>
                                            <div className="flex items-center gap-1.5 opacity-40 mt-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{a.appointment_time || 'UNSET SESSION'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.05em] border transition-all ${
                                            a.status === 'confirmed' || a.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                            a.status === 'cancelled' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                (a.status === 'confirmed' || a.status === 'completed') ? 'bg-emerald-500 animate-pulse' : 
                                                a.status === 'cancelled' ? 'bg-slate-500' : 'bg-amber-500'
                                            }`} />
                                            {a.status?.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {a.meeting_link && a.status === 'confirmed' && (
                                                <button 
                                                    onClick={() => window.open(a.meeting_link, '_blank')} 
                                                    className="p-2.5 rounded-lg bg-indigo-500 text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                    title="Launch Telemedicine Bridge"
                                                >
                                                    <Video className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setDetailsModal({ open: true, item: a })} 
                                                className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-[var(--luna-border)]"
                                                title="View Record Details"
                                            >
                                                <Settings className="w-4 h-4 opacity-40" />
                                            </button>
                                            {a.status === 'pending' && (
                                                <button 
                                                    onClick={() => setConfirmCancel({ open: true, id: a.id })} 
                                                    className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                                    title="Mark for Discontinuation"
                                                >
                                                    <X className="w-4 h-4 opacity-40" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="text-center pb-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Secure Patient Care Scheduling • Institutional Protocol 5.2</p>
            </footer>
        </motion.div>
    );
};

export default AppointmentList;
