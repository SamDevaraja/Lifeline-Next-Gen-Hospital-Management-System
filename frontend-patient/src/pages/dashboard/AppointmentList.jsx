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

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let apptUrl = 'appointments/';
            let params = new URLSearchParams();
            if (user?.role === 'doctor') params.append('doctor_id', user.id);
            if (user?.role === 'patient') params.append('patient_id', user.id);
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
                    api.post('appointments/', { appointment_date: date, appointment_time: time, status: 'pending', patient: user.id, doctor })
                        .then(() => {
                            toast.success("Appointment scheduled.");
                            setNewApptModal({ open: false });
                            fetchAppointments();
                        })
                        .catch(() => toast.error("Scheduling conflict."));
                }}
                onCancel={() => setNewApptModal({ open: false })}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Clinical Schedule</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>Manage and optimize appointments with AI</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setNewApptModal({ open: true })}
                        className="btn-primary text-sm px-5 py-2.5"
                    >
                        <Plus className="w-4 h-4" /> New Appointment
                    </button>
                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer transition-all appearance-none pr-10 shadow-lg h-[46px]"
                            style={{ background: 'var(--luna-navy)', color: theme === 'dark' ? 'white' : 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}
                        >
                            {['pending', 'confirmed', 'completed', 'cancelled', 'all'].map(f => (
                                <option key={f} value={f} className="font-black" style={{ background: 'var(--luna-card)', color: theme === 'dark' ? 'white' : 'var(--luna-blue)', fontWeight: '900' }}>{f} status</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:scale-110" style={{ color: theme === 'dark' ? 'white' : 'var(--luna-blue)' }}>
                            <Filter className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Today', value: stats.today, color: LUNA.steel }, { label: 'Pending', value: stats.pending, color: '#f59e0b' }, { label: 'Completed', value: stats.completed, color: '#10b981' }].map((s, i) => (
                    <div key={i} className="card text-center py-6 shadow-sm border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: LUNA.steel }}>{s.label}</p>
                    </div>
                ))}
            </div>


            <div className="card overflow-hidden p-0 shadow-sm border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <table className="table-clinical">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            {user?.role !== 'admin' && <th>Meeting Link</th>}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <tr key={i}><td colSpan={user?.role === 'admin' ? 5 : 6} className="px-6 py-4"><div className="animate-shimmer h-4 rounded w-full" /></td></tr>
                            ))
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={user?.role === 'admin' ? 5 : 6} className="text-center py-24 text-gray-400 italic font-medium tracking-wide">No appointments found in this clinical state.</td></tr>
                        ) : filteredData.map((a, i) => (
                            <tr key={a.id || i}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-8 h-8 text-[10px]">{a.patientName?.[0] || 'P'}</div>
                                        <span className="font-bold text-sm" style={{ color: 'var(--luna-text-main)' }}>{a.patientName}</span>
                                    </div>
                                </td>
                                <td><span className="text-sm font-semibold" style={{ color: 'var(--luna-text-muted)' }}>{a.doctorName}</span></td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold" style={{ color: 'var(--luna-text-main)' }}>{a.appointment_date}</span>
                                        <span className="text-[10px] font-bold" style={{ color: 'var(--luna-text-muted)' }}>{a.appointment_time || 'No Time'}</span>
                                    </div>
                                </td>
                                <td><span className={a.status === 'confirmed' || a.status === 'completed' ? 'badge-success' : 'badge-warn'} style={{ display: 'inline-flex' }}>{a.status.toUpperCase()}</span></td>
                                {user?.role !== 'admin' && (
                                    <td>
                                        {user?.role === 'patient' && (
                                            a.meeting_link ? (
                                                <button
                                                    onClick={() => window.open(a.meeting_link, '_blank')}
                                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-500 text-white flex items-center gap-1 shadow-md hover:bg-teal-600 w-fit"
                                                >
                                                    <Video className="w-3 h-3" /> Join Call
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 italic bg-slate-100 px-3 py-1.5 rounded-lg flex items-center w-fit">Waiting for secure link...</span>
                                            )
                                        )}

                                        {user?.role === 'doctor' && (
                                            <button
                                                onClick={async () => {
                                                    const link = window.prompt("Enter new Google Meet Link:", a.meeting_link || "");
                                                    if (!link) return;
                                                    try {
                                                        toast.loading("Updating link...", { id: 'edit-link' });
                                                        await api.patch(`/appointments/${a.id}/`, { meeting_link: link });
                                                        toast.success("Link updated successfully!", { id: 'edit-link' });
                                                        fetchAppointments();
                                                    } catch (err) { toast.error("Failed to update.", { id: 'edit-link' }); }
                                                }}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-500/20 text-teal-600 hover:bg-teal-50 transition-all w-fit"
                                            >
                                                {a.meeting_link ? 'Edit Meet Link' : 'Attach Meet Link'}
                                            </button>
                                        )}
                                    </td>
                                )}
                                <td>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setDetailsModal({ open: true, item: a })}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-teal-100"
                                            style={{ color: LUNA.teal, background: 'rgba(46,196,182,0.08)' }}>Details</button>
                                        {(a.status === 'pending' || a.status === 'confirmed') && (
                                            <button
                                                onClick={() => setConfirmCancel({ open: true, id: a.id })}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-red-100"
                                                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)' }}>Cancel</button>
                                        )}
                                    </div>
                                </td>
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