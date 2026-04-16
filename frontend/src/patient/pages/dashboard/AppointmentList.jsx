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

const AppointmentList = ({ user }) => {
    const { theme } = useTheme();
    const [allAppointments, setAllAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [confirmCancel, setConfirmCancel] = useState({ open: false, id: null });
    const [linkModal, setLinkModal] = useState({ open: false, appt: null });
    const [newApptModal, setNewApptModal] = useState({ open: false });
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    // Outside click management for Clinical Dropdown
    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let apptUrl = 'appointments/';
            let params = new URLSearchParams();
            if (user?.role === 'doctor') params.append('doctor_id', user.doctor_id);
            if (user?.role === 'patient') params.append('patient_id', user.patient_id);
            const query = params.toString();
            if (query) apptUrl += `?${query}`;

            // Run requests in parallel for maximum speed
            const promises = [api.get(apptUrl)];
            if (user?.role === 'patient') {
                promises.push(api.get('doctors/available/'));
            }

            const results = await Promise.all(promises);
            setAllAppointments(results[0].data);
            if (results[1]) setDoctors(results[1].data);

        } catch (err) {
            console.error("Clinical sync error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    // Zero-latency filtering engine
    const filteredData = React.useMemo(() => {
        if (statusFilter === 'all') return allAppointments;
        return allAppointments.filter(a => a.status === statusFilter);
    }, [allAppointments, statusFilter]);

    const handleCancel = async () => {
        const id = confirmCancel.id;
        try {
            toast.loading("Updating schedule...", { id: 'cancel' });
            await api.patch(`appointments/${id}/`, { status: 'cancelled' });
            toast.success("Appointment cancelled.", { id: 'cancel' });
            setConfirmCancel({ open: false, id: null });
            fetchAppointments();
        } catch (err) {
            toast.error("Update failed.", { id: 'cancel' });
            setConfirmCancel({ open: false, id: null });
        }
    };

    const handleUpdateLink = async (vals) => {
        const { link } = vals;
        const appt = linkModal.appt;
        try {
            await api.patch(`appointments/${appt.id}/`, { meeting_link: link });
            toast.success("Link updated.");
            setLinkModal({ open: false, appt: null });
            fetchAppointments();
        } catch (err) {
            toast.error("Transmission error.");
        }
    };

    const stats = {
        today: allAppointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length,
        pending: allAppointments.filter(a => a.status === 'pending').length,
        completed: allAppointments.filter(a => a.status === 'completed').length,
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <ConfirmModal
                isOpen={confirmCancel.open}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This action will free up the slot for other patients."
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
                isOpen={linkModal.open}
                title="Update Secure Meeting Link"
                fields={[{ key: 'link', label: 'Meeting URL', placeholder: 'https://meet.google.com/xxx-xxxx-xxx', initialValue: linkModal.appt?.meeting_link, autoFocus: true }]}
                onConfirm={handleUpdateLink}
                onCancel={() => setLinkModal({ open: false, appt: null })}
            />
            <InputModal
                isOpen={newApptModal.open}
                title="Schedule New Appointment"
                fields={[
                    { key: 'date', label: 'Date', type: 'date', initialValue: new Date().toISOString().split('T')[0] },
                    { key: 'time', label: 'Time', type: 'time', initialValue: '10:00' },
                    {
                        key: 'doctor',
                        label: 'Select Specialist',
                        type: 'select',
                        options: doctors.map(d => ({ value: d.id, label: `Dr. ${d.get_name} (${d.department})` }))
                    }
                ]}
                onConfirm={(vals) => {
                    const { date, time, doctor } = vals;
                    if (!date || !time || !doctor) return;
                    api.post('appointments/', { appointment_date: date, appointment_time: time, status: 'pending', patient: user.patient_id, doctor })
                        .then(() => {
                            toast.success("Appointment scheduled.");
                            setNewApptModal({ open: false });
                            fetchAppointments();
                        })
                        .catch(() => toast.error("Scheduling conflict."));
                }}
                onCancel={() => setNewApptModal({ open: false })}
            />
            {/* 🏥 CLINICAL TERMINAL HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm" style={{ background: 'var(--luna-info-bg)', borderColor: 'var(--luna-border)' }}>
                            <Calendar className="w-5 h-5 text-[var(--luna-teal)]" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Consultations & Schedule</h1>
                    </div>
                    <p className="text-xs font-bold opacity-40 ml-13" style={{ color: 'var(--luna-text-main)' }}>Managing active clinical appointments and telemedicine sessions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setNewApptModal({ open: true })}
                        className="btn-teal !px-6 !py-2.5 !text-[11px] h-10 shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Schedule Specialist Visit
                    </button>
                </div>
            </div>

            {/* 🧪 STATUS TERMINAL - EXECUTIVE DROPDOWN */}
            <div className="flex items-center justify-start mb-8">
                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all hover:bg-white/[0.03] group"
                        style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}
                    >
                        <Filter className="w-3.5 h-3.5 text-[var(--luna-teal)] opacity-60" />
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--luna-text-main)' }}>
                                Filter: {statusFilter.toUpperCase()}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[8px] bg-[var(--luna-teal)] text-white font-black">
                                {statusFilter === 'all' ? allAppointments.length : allAppointments.filter(a => a.status === statusFilter).length}
                            </span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 opacity-30 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 4, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 mt-2 w-56 rounded-2xl border shadow-2xl z-50 overflow-hidden"
                                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', backdropFilter: 'blur(20px)' }}
                            >
                                <div className="p-2 space-y-1">
                                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => {
                                        const count = f === 'all' ? allAppointments.length : allAppointments.filter(a => a.status === f).length;
                                        const active = statusFilter === f;
                                        return (
                                            <button
                                                key={f}
                                                onClick={() => {
                                                    setStatusFilter(f);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-between transition-all
                                                    ${active ? 'bg-[var(--luna-navy)] text-[var(--luna-teal)]' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                                            >
                                                <span>{f}</span>
                                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] border ${active ? 'bg-[var(--luna-teal)] text-white border-transparent' : 'bg-white/5 border-white/5'}`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 📑 CLINICAL LEDGER */}
            <div className="card-clinical !p-0 shadow-2xl border-white/5 bg-white/[0.01]">
                <table className="table-clinical">
                    <thead className="bg-[var(--luna-navy)] border-b" style={{ borderColor: 'var(--luna-border)' }}>
                        <tr>
                            <th className="!text-[10px] !py-5"><div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 opacity-40" /> Patient</div></th>
                            <th className="!text-[10px]"><div className="flex items-center gap-2"><Stethoscope className="w-3.5 h-3.5 opacity-40" /> Specialist</div></th>
                            <th className="!text-[10px]"><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 opacity-40" /> Schedule</div></th>
                            <th className="!text-[10px]">Status</th>
                            {user?.role !== 'admin' && <th className="!text-[10px]">Consultation Bridge</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <tr key={i}><td colSpan={user?.role === 'admin' ? 4 : 5} className="px-6 py-8"><div className="animate-pulse h-4 bg-white/5 rounded w-full" /></td></tr>
                            ))
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={user?.role === 'admin' ? 4 : 5} className="py-32">
                                    <div className="flex flex-col items-center justify-center opacity-30">
                                        <AlertCircle className="w-12 h-12 mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest">No clinical sessions found</p>
                                        <p className="text-[10px] font-bold mt-1">Adjust your status filter or schedule a new visit via the terminal.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.map((a, i) => (
                            <tr key={a.id || i} className="group hover:bg-white/[0.02] transition-all">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 avatar shadow-xl ring-2 ring-white/5 group-hover:ring-[var(--luna-teal)]/30 transition-all font-black text-xs">
                                            {a.patientName?.[0] || 'P'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-[13px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{a.patientName}</span>
                                            <span className="text-[9px] font-bold opacity-30 uppercase tracking-tighter">Registration: CID-2024</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black" style={{ color: 'var(--luna-text-main)' }}>Dr. {a.doctorName}</span>
                                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Specialist Unit</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-[var(--luna-teal)] opacity-60" />
                                            <span className="text-[12px] font-black" style={{ color: 'var(--luna-text-main)' }}>{a.appointment_date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-[var(--luna-teal)] opacity-60" />
                                            <span className="text-[10px] font-black opacity-40">{a.appointment_time || 'No Time'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        <span className={a.status === 'confirmed' || a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : 'badge-warn'}>
                                            {a.status}
                                        </span>
                                    </div>
                                </td>
                                {user?.role !== 'admin' && (
                                    <td>
                                        {user?.role === 'patient' && (
                                            <div className="flex items-center gap-3">
                                                {a.meeting_link ? (
                                                    <button
                                                        onClick={() => window.open(a.meeting_link, '_blank')}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--luna-info-bg)] border border-[var(--luna-teal)] text-[var(--luna-teal)] text-[10px] font-black uppercase tracking-wider hover:bg-[var(--luna-teal)] hover:text-white transition-all shadow-lg shadow-blue-500/10"
                                                    >
                                                        <Video className="w-3.5 h-3.5" /> Initialize Bridge
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 opacity-40">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Bridge</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {user?.role === 'doctor' && (
                                            <button
                                                onClick={() => setLinkModal({ open: true, appt: a })}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all"
                                            >
                                                <Video className="w-3.5 h-3.5" /> Configure Bridge
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// ── Billing Page ──

export default AppointmentList;
