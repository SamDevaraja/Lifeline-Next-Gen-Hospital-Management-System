import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, ChevronRight, Search, Plus, 
    HeartPulse, Sparkles, TrendingUp, FileText, Bell, DollarSign, 
    Stethoscope, BrainCircuit, BarChart3, AlertCircle, CheckCircle, 
    Clock, X, Menu, Video, Pill, FlaskConical, Smartphone, 
    QrCode, User, Mic, ArrowRight, Sun, Moon, Globe, 
    ChevronDown, Filter, Mail, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal, InputModal, DetailsModal } from './Modals';
import { LUNA } from "./Constants";

const AppointmentList = ({ user }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [allAppointments, setAllAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [myPatients, setMyPatients] = useState([]);
    const [confirmCancel, setConfirmCancel] = useState({ open: false, id: null });
    const [linkModal, setLinkModal] = useState({ open: false, appt: null });
    const [newApptModal, setNewApptModal] = useState({ open: false });
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let apptUrl = 'appointments/';
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            const query = params.toString();
            if (query) apptUrl += `?${query}`;

            const promises = [api.get(apptUrl)];
            if (user?.role === 'patient' || user?.role === 'receptionist' || user?.role === 'admin') {
                promises.push(api.get('doctors/available/'));
            } else if (user?.role === 'doctor') {
                promises.push(api.get('patients/'));
            }

            const results = await Promise.all(promises);
            setAllAppointments(results[0].data);
            if (results[1]) {
                if (user?.role === 'doctor') setMyPatients(results[1].data);
                else setDoctors(results[1].data);
            }

        } catch (err) {
            console.error("Clinical sync error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const filteredData = React.useMemo(() => {
        const list = allAppointments.filter(a => {
            const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
            const matchesSearch = (a.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (a.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        return list.sort((a, b) => {
            // 1. Specialized clinical priority mapping (Completed as last)
            const priorities = { 'pending': 1, 'confirmed': 2, 'cancelled': 3, 'completed': 4 };
            const pA = priorities[a.status] || 5;
            const pB = priorities[b.status] || 5;
            
            if (pA !== pB) return pA - pB;
            
            // 2. Secondary alphabetical patient alignment
            const nameA = (a.patientName || '').toLowerCase();
            const nameB = (b.patientName || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [allAppointments, statusFilter, searchQuery]);

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
        confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            <ConfirmModal
                isOpen={confirmCancel.open}
                title="Decommission Slot"
                message="Are you sure you want to cancel this clinical appointment? This action will immediately release the synchronized slot."
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
                    user?.role === 'doctor' ? {
                        key: 'patient',
                        label: 'Select Patient',
                        type: 'select',
                        initialValue: new URLSearchParams(window.location.search).get('patient_id'),
                        options: myPatients.map(p => ({ value: p.id, label: p.get_name }))
                    } : {
                        key: 'doctor',
                        label: 'Select Specialist',
                        type: 'select',
                        options: doctors.map(d => ({ value: d.id, label: `Dr. ${d.get_name} (${d.department})` }))
                    }
                ]}
                onConfirm={(vals) => {
                    const { date, time, doctor, patient } = vals;
                    const finalPatient = user?.role === 'doctor' ? patient : user.id;
                    const finalDoctor = user?.role === 'doctor' ? user.doctor_id : doctor;
                    
                    if (!date || !time || !finalPatient || !finalDoctor) {
                        toast.error("All clinical parameters are required.");
                        return;
                    }
                    
                    api.post('appointments/', { appointment_date: date, appointment_time: time, status: 'pending', patient: finalPatient, doctor: finalDoctor })
                        .then(() => {
                            toast.success("Appointment scheduled.");
                            setNewApptModal({ open: false });
                            fetchAppointments();
                        })
                        .catch(() => toast.error("Scheduling conflict."));
                }}
                onCancel={() => setNewApptModal({ open: false })}
            />

            {/* Doctor Availability Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {doctors.filter(d => d.status).slice(0, 4).map(d => (
                    <div key={d.id} className="card p-4 flex items-center justify-between border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-black text-blue-500 border border-blue-500/20">
                                    {d.get_name[0]}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--luna-card)] animate-pulse" />
                            </div>
                            <div>
                                <p className="font-extrabold text-[12px]" style={{ color: 'var(--luna-text-main)' }}>Dr. {d.get_name}</p>
                                <p className="text-[9px] font-black uppercase tracking-tighter opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{d.department}</p>
                            </div>
                        </div>
                        <Activity className="w-4 h-4 text-emerald-500 opacity-40" />
                    </div>
                ))}
                {doctors.filter(d => d.status).length === 0 && (
                    <div className="col-span-full py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-muted)' }}>
                        No secondary specialists flagged as active
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Clinical Schedule</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                        {loading ? 'Initializing schedule...' : `Total Records: ${allAppointments.length} • Today: ${stats.today}`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 transition-colors group-focus-within:text-[var(--luna-teal)]" style={{ color: LUNA.teal }} />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            type="text"
                            placeholder="Scan schedule..."
                            className="w-48 md:w-64 !pl-12 py-3 text-sm rounded-xl outline-none transition-all border shadow-inner font-bold tracking-tight focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20"
                            style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                        />
                    </div>

                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer transition-all appearance-none pr-10 shadow-lg h-[46px]"
                            style={{ background: 'var(--luna-navy)', color: theme === 'dark' ? 'white' : 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}
                        >
                            {['all', 'pending', 'confirmed', 'arrived', 'in-consultation', 'completed', 'cancelled'].map(f => (
                                <option key={f} value={f} className="font-black" style={{ background: 'var(--luna-card)', color: theme === 'dark' ? 'white' : 'var(--luna-blue)', fontWeight: '900' }}>
                                    {f.replace('-', ' ').toUpperCase()} STATUS
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:scale-110" style={{ color: theme === 'dark' ? 'white' : 'var(--luna-blue)' }}>
                            <Filter className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {(user?.role === 'patient' || user?.role === 'doctor') && (
                        <button
                            onClick={() => setNewApptModal({ open: true })}
                            className="btn-teal text-[10px] font-black uppercase tracking-widest px-6 h-[46px] flex items-center gap-2 shadow-xl hover:shadow-teal-500/30">
                            <Plus className="w-4 h-4" /> Initialize Protocol
                        </button>
                    )}
                </div>
            </div>

            <div className="card overflow-hidden p-0 shadow-2xl rounded-2xl border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'var(--luna-navy)', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="pl-6 pr-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Patient Demographics</th>
                                {user?.role !== 'doctor' && <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Assigned Doctor</th>}
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Date & Time</th>
                                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Status Layer</th>
                                {user?.role !== 'admin' && <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Meeting Bridge</th>}
                                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Terminal Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan="6" className="px-6 py-6"><div className="animate-pulse h-6 rounded-lg w-full" style={{ background: 'var(--luna-navy)' }} /></td></tr>
                                ))
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24 font-medium italic" style={{ color: LUNA.steel }}>
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <span>Zero schedule matches identified</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.map((a, i) => (
                                <tr key={a.id || i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="pl-6 pr-4 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner shrink-0 uppercase border"
                                                style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}>
                                                {a.patientName?.[0] || 'P'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-extrabold text-[14px]" style={{ color: 'var(--luna-text-main)' }}>{a.patientName}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>
                                                    REF-{String(a.id).padStart(4, '0')} • SYNCED
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    {user?.role !== 'doctor' && (
                                        <td className="px-4 py-4">
                                            <span className="text-[11px] font-bold" style={{ color: 'var(--luna-text-muted)' }}>Dr. {a.doctorName}</span>
                                        </td>
                                    )}
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black" style={{ color: 'var(--luna-text-main)' }}>{a.appointment_date}</span>
                                            <div className="flex items-center gap-1.5 opacity-60 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase">{a.appointment_time || 'UNSET'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-black uppercase tracking-widest text-[9px] rounded-md border shadow-sm mx-auto whitespace-nowrap ${
                                            a.status === 'confirmed' || a.status === 'completed' || a.status === 'arrived' || a.status === 'in-consultation'
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                            : a.status === 'cancelled'
                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                (a.status === 'confirmed' || a.status === 'completed' || a.status === 'arrived' || a.status === 'in-consultation') 
                                                ? 'bg-emerald-500 animate-pulse' 
                                                : a.status === 'cancelled' 
                                                ? 'bg-rose-500' 
                                                : 'bg-yellow-500'}`}/>
                                            {a.status.replace('-', ' ')}
                                        </span>
                                    </td>
                                    {user?.role !== 'admin' && (
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                {user?.role === 'patient' ? (
                                                    (a.meeting_link || a.doctor_permanent_link) ? (
                                                        <button
                                                            onClick={() => window.open(a.meeting_link || a.doctor_permanent_link, '_blank')}
                                                            className="px-3 py-1.5 rounded-lg border border-[var(--luna-teal)]/20 text-[var(--luna-teal)] hover:bg-[var(--luna-teal)]/10 transition-all flex items-center gap-2"
                                                        >
                                                            <Video className="w-3.5 h-3.5" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Launch Bridge</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[9px] font-black uppercase text-slate-400 italic bg-slate-400/5 px-3 py-1.5 rounded-lg border border-transparent">
                                                            Standby Protocol
                                                        </span>
                                                    )
                                                ) : (
                                                    <button
                                                        onClick={() => setLinkModal({ open: true, appt: a })}
                                                        className="px-3 py-1.5 rounded-lg border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all flex items-center gap-2"
                                                    >
                                                        <LinkIcon className="w-3.5 h-3.5" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Link Config</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity mx-auto w-max">
                                            <button onClick={() => setDetailsModal({ open: true, item: a })} title="View Analytics"
                                                className="p-1.5 rounded-lg border transition-all hover:bg-[var(--luna-teal)]/10 hover:border-[var(--luna-teal)]/30 hover:-translate-y-0.5"
                                                style={{ color: LUNA.teal, background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                <FileText className="w-4 h-4" />
                                            </button>

                                            {(a.status === 'confirmed' && (user.role === 'admin' || user.role === 'receptionist')) && (
                                                <button onClick={async () => {
                                                    try {
                                                        await api.patch(`appointments/${a.id}/`, { status: 'arrived' });
                                                        toast.success("Patient Check-in Confirmed.");
                                                        fetchAppointments();
                                                    } catch (e) { toast.error("Check-in failed."); }
                                                }} title="Confirm Arrival"
                                                    className="p-1.5 rounded-lg border transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:-translate-y-0.5"
                                                    style={{ color: '#10b981', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}

                                            {(a.status === 'arrived' && user.role === 'doctor') && (
                                                <button onClick={async () => {
                                                    try {
                                                        await api.patch(`appointments/${a.id}/`, { status: 'in-consultation' });
                                                        toast.success("Consultation Sequence Started.");
                                                        fetchAppointments();
                                                    } catch (e) { toast.error("Signal failure."); }
                                                }} title="Start Consultation"
                                                    className="p-1.5 rounded-lg border transition-all hover:bg-blue-500/10 hover:border-blue-500/30 hover:-translate-y-0.5"
                                                    style={{ color: '#3b82f6', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                    <Activity className="w-4 h-4" />
                                                </button>
                                            )}

                                            {(a.status === 'in-consultation' && user.role === 'doctor') && (
                                                <button onClick={async () => {
                                                    try {
                                                        await api.patch(`appointments/${a.id}/`, { status: 'completed' });
                                                        toast.success("Consultation finalized.");
                                                        fetchAppointments();
                                                    } catch (e) { toast.error("Closure failed."); }
                                                }} title="Complete Consultation"
                                                    className="p-1.5 rounded-lg border transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:-translate-y-0.5"
                                                    style={{ color: '#10b981', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            {(a.status === 'pending' || a.status === 'confirmed') && (
                                                <button onClick={() => setConfirmCancel({ open: true, id: a.id })} title="Terminate Slot"
                                                    className="p-1.5 rounded-lg border transition-all hover:bg-rose-500/10 hover:border-rose-500/30 hover:-translate-y-0.5"
                                                    style={{ color: '#ef4444', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                    <Lock className="w-4 h-4" />
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
        </motion.div>
    );
};

const LinkIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);

export default AppointmentList;