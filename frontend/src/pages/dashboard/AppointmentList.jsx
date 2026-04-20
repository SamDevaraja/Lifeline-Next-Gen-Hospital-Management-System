import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, ChevronRight, Search, Plus,
    HeartPulse, Sparkles, TrendingUp, FileText, Bell, DollarSign,
    Stethoscope, BrainCircuit, BarChart3, AlertCircle, CheckCircle,
    Clock, X, Menu, Video, Pill, FlaskConical, Smartphone,
    QrCode, User, Mic, ArrowRight, Sun, Moon, Globe,
    ChevronDown, Filter, Mail, Lock, RefreshCw, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal, InputModal, DetailsModal, Modal } from './Modals';
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
    const [manageModal, setManageModal] = useState({ open: false, appt: null });
    const [newApptModal, setNewApptModal] = useState({ open: false });
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });
    const [availableSlots, setAvailableSlots] = useState({});

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
            const priorities = { 'pending': 1, 'confirmed': 2, 'cancelled': 3, 'completed': 4 };
            const pA = priorities[a.status] || 5;
            const pB = priorities[b.status] || 5;

            if (pA !== pB) return pA - pB;

            const nameA = (a.patientName || '').toLowerCase();
            const nameB = (b.patientName || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [allAppointments, statusFilter, searchQuery]);

    const stats = React.useMemo(() => ({
        total: allAppointments.length,
        today: allAppointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length,
        pending: allAppointments.filter(a => a.status === 'pending').length,
        confirmed: allAppointments.filter(a => a.status === 'confirmed').length
    }), [allAppointments]);

    const updateStatus = async (apptId, newStatus) => {
        try {
            await api.patch(`appointments/${apptId}/`, { status: newStatus });
            toast.success(`Protocol status updated to ${newStatus.replace('-', ' ')}.`);
            setManageModal({ open: false, appt: null });
            fetchAppointments();
        } catch (e) {
            toast.error("Status synchronization failed.");
        }
    };

    const STATUS_FLOW = [
        { key: 'scheduled', label: 'Confirmed', icon: <CheckCircle className="w-4 h-4"/> },
        { key: 'arrived', label: 'Patient Arrived', icon: <Users className="w-4 h-4"/> },
        { key: 'in-consultation', label: 'In Consultation', icon: <Stethoscope className="w-4 h-4"/> },
        { key: 'completed', label: 'Finalized', icon: <ShieldCheck className="w-4 h-4"/> }
    ];

    const handleCancel = async () => {
        if (!confirmCancel.id) return;
        try {
            await api.patch(`appointments/${confirmCancel.id}/`, { status: 'cancelled' });
            toast.success("Engagement formally terminated.");
            setConfirmCancel({ open: false, id: null });
            setManageModal({ open: false, appt: null });
            fetchAppointments();
        } catch (err) {
            toast.error("Termination failure.");
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

    const handleModalFieldChange = async (key, val, allValues) => {
        const date = allValues.date;
        const doctorId = user?.role === 'doctor' ? user.doctor_id : allValues.doctor;
        if (date && doctorId) {
            try {
                const res = await api.get(`appointments/check_availability/?doctor=${doctorId}&date=${date}`);
                setAvailableSlots(res.data.slots || {});
            } catch (e) { console.error("Slot check failure:", e); }
        }
    };

    const generateTimeOptions = () => {
        const options = [];
        for (let h = 8; h < 20; h++) {
            for (let m of [0, 30]) {
                const clock = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const occupancy = availableSlots[clock] || 0;
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
                                <span className="text-[15px] font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>{blockRange}</span>
                                <div className="mt-2 w-full h-[3px] rounded-full overflow-hidden flex gap-[2px] bg-slate-500/10">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`flex-1 transition-all duration-300 ${i <= (3 - occupancy) ? 'bg-[var(--luna-blue)]' : 'bg-transparent'}`} />
                                    ))}
                                </div>
                                <span className="text-[7.5px] font-bold opacity-30 mt-2 tracking-[0.05em]" style={{ fontFamily: "'Inter', sans-serif" }}>
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

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            <ConfirmModal
                isOpen={confirmCancel.open}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This will immediately free up the time slot for other patients."
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
            <Modal
                isOpen={manageModal.open}
                onClose={() => setManageModal({ open: false, appt: null })}
                title="Manage Appointment"
                maxWidth="max-w-3xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Encounter Identity & Status */}
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl border bg-[var(--luna-navy)] border-[var(--luna-border)]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border shadow-sm"
                                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-blue)' }}>
                                    {manageModal.appt?.patientName[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{manageModal.appt?.patientName}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">ID Number: #{manageModal.appt?.id}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-3 block">Appointment Status</span>
                            <div className="grid grid-cols-1 gap-2">
                                {STATUS_FLOW.map((step) => {
                                    const current = manageModal.appt?.status === step.key;
                                    return (
                                        <button
                                            key={step.key}
                                            onClick={() => updateStatus(manageModal.appt.id, step.key)}
                                            className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${current ? 'bg-[var(--luna-primary)]/10 border-[var(--luna-primary)]/40 text-[var(--luna-primary)]' : 'bg-[var(--luna-card)] border-[var(--luna-border)] opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                        >
                                            <div className={`w-9 h-9 flex items-center justify-center rounded-xl shadow-sm ${current ? 'bg-[var(--luna-primary)] text-white' : 'bg-slate-500/10'}`}>
                                                {step.icon}
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{step.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bridge & Termination */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-3 block">Video Link</span>
                            <button 
                                onClick={() => {
                                    setLinkModal({ open: true, appt: manageModal.appt });
                                    setManageModal({ open: false, appt: null });
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border bg-[var(--luna-card)] border-[var(--luna-border)] hover:bg-[var(--luna-primary)]/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-500/10 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <Globe className="w-4 h-4" style={{ color: 'var(--luna-blue)' }} />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>Edit Video Link</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-40 transition-opacity" />
                            </button>
                            <p className="mt-4 text-[10px] font-bold opacity-30 leading-relaxed px-2">
                                Changing this link will update the patient's portal immediately.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-dashed space-y-4" style={{ borderColor: 'var(--luna-border)' }}>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-center" style={{ color: 'var(--luna-danger-text)' }}>Cancel / Close Appointment</p>
                            <button 
                                onClick={() => setConfirmCancel({ open: true, id: manageModal.appt.id })}
                                className="w-full p-4 rounded-2xl border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-sm active:scale-95"
                            >
                                Cancel Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
            <InputModal
                isOpen={linkModal.open}
                title="Update Video Link"
                fields={[{ key: 'link', label: 'Video Link', placeholder: 'https://meet.google.com/xxx-xxxx-xxx', initialValue: linkModal.appt?.meeting_link, autoFocus: true }]}
                onConfirm={handleUpdateLink}
                onCancel={() => setLinkModal({ open: false, appt: null })}
            />
            <InputModal
                isOpen={newApptModal.open}
                title="Schedule New Appointment"
                onFieldChange={handleModalFieldChange}
                fields={[
                    user?.role === 'doctor' ? {
                        key: 'patient',
                        label: 'Select Patient',
                        type: 'select',
                        initialValue: new URLSearchParams(window.location.search).get('patient_id'),
                        options: myPatients.map(p => ({ value: p.id, label: p.get_name })),
                        fullWidth: true
                    } : {
                        key: 'doctor',
                        label: 'Lead Specialist',
                        type: 'select',
                        options: doctors.map(d => ({ value: d.id, label: `Dr. ${d.get_name} (${d.department})` })),
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
                    const { date, time, doctor, patient, description } = vals;
                    const finalPatient = user?.role === 'doctor' ? patient : (user.patient_id || user.id);
                    const finalDoctor = user?.role === 'doctor' ? (user.doctor_id || user.id) : doctor;

                    if (!date || !time || !finalPatient || !finalDoctor) {
                        toast.error("Missing critical scheduling parameters.");
                        return;
                    }

                    api.post('appointments/', { appointment_date: date, appointment_time: time, description: description || '', status: 'pending', patient: finalPatient, doctor: finalDoctor })
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Appointments', value: allAppointments.length, color: 'var(--luna-blue)' },
                    { label: "Today's Agenda", value: stats.today, color: 'var(--luna-blue)' },
                    { label: 'Pending Auth', value: stats.pending, color: 'var(--luna-blue)' },
                    { label: 'Confirmed Slots', value: stats.confirmed, color: 'var(--luna-blue)' },
                ].map((s, i) => (
                    <div key={i} className="p-4 border rounded-xl shadow-sm bg-[var(--luna-card)]" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                        <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Patient Appointments</h1>
                    <button onClick={fetchAppointments} className={`p-1 opacity-40 hover:opacity-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                             <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            type="text"
                            placeholder="Scan schedule..."
                            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg outline-none transition-all font-bold tracking-tight bg-[var(--luna-card)]"
                            style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-xs border rounded-lg appearance-none cursor-pointer focus:outline-none bg-[var(--luna-card)]"
                            style={{ color: theme === 'dark' ? 'white' : 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}
                        >
                            {['all', 'pending', 'confirmed', 'arrived', 'in-consultation', 'completed', 'cancelled'].map(f => (
                                <option key={f} value={f} style={{ background: 'var(--luna-card)', color: 'var(--luna-text-main)' }}>
                                    {f === 'all' ? `All Status` : f.replace('-', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30 pointer-events-none" />
                    </div>

                    {(user?.role === 'patient' || user?.role === 'doctor') && (
                        <button
                            onClick={() => setNewApptModal({ open: true })}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm">
                            <Plus className="w-3.5 h-3.5" /> Initialize Protocol
                        </button>
                    )}
                </div>
            </div>

            <div className="card overflow-hidden !p-0 shadow-sm rounded-xl border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="pl-6 pr-4 py-4 text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Patient Demographics</th>
                                {user?.role !== 'doctor' && <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Assigned Doctor</th>}
                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Date & Time</th>
                                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status Layer</th>
                                <th className="px-4 py-4 text-right pr-6 text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Terminal Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan="5" className="px-6 py-6"><div className="animate-pulse h-6 rounded-lg w-full" style={{ background: 'var(--luna-navy)' }} /></td></tr>
                                ))
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-28" style={{ color: 'var(--luna-text-main)' }}>
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/5 opacity-20">
                                                <Search className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase mb-1">No Results Found</h3>
                                            <p className="text-xs font-semibold opacity-30 max-w-[320px] leading-relaxed">
                                                No matches found. Please try a different search term.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.map((a, i) => (
                                <tr key={a.id} className="group hover:bg-[var(--luna-navy)] transition-colors border-b last:border-b-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="pl-6 pr-4 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner shrink-0 border transition-transform group-hover:scale-105"
                                                style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                                <User className="w-4 h-4 opacity-40" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-sm tracking-tight cursor-pointer hover:text-[var(--luna-teal)] transition-colors inline-block"
                                                    onClick={() => setDetailsModal({ open: true, item: a })}
                                                    style={{ color: 'var(--luna-text-main)' }}>
                                                    {a.patientName}
                                                </p>
                                                <p className="text-[10px] font-bold opacity-30 mt-0.5 uppercase tracking-wider">
                                                    REF-{String(a.id).padStart(4, '0')} • Synced
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    {user?.role !== 'doctor' && (
                                        <td className="px-4 py-4 hidden sm:table-cell">
                                            <span className="text-[11px] font-bold opacity-60 cursor-pointer hover:text-[var(--luna-teal)] transition-colors"
                                                onClick={() => setDetailsModal({ open: true, item: a })}>
                                                Dr. {a.doctorName}
                                            </span>
                                        </td>
                                    )}

                                    <td className="px-4 py-4 hidden sm:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-semibold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{a.appointment_date}</span>
                                            <div className="flex items-center gap-1.5 opacity-40 mt-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{a.appointment_time || 'UNSET'}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-black uppercase tracking-[0.1em] text-[10px] rounded-md border shadow-sm mx-auto whitespace-nowrap ${a.status === 'confirmed' || a.status === 'completed' || a.status === 'arrived' || a.status === 'in-consultation'
                                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                : a.status === 'cancelled'
                                                    ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${(a.status === 'confirmed' || a.status === 'completed' || a.status === 'arrived' || a.status === 'in-consultation')
                                                    ? 'bg-blue-500 animate-pulse'
                                                    : a.status === 'cancelled'
                                                        ? 'bg-slate-500'
                                                        : 'bg-blue-500'}`} />
                                            {a.status.replace('-', ' ')}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 pr-6">
                                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {/* Primary Bridge Access */}
                                            <button
                                                onClick={() => (a.meeting_link || a.doctor_permanent_link) && window.open(a.meeting_link || a.doctor_permanent_link, '_blank')}
                                                title={(a.meeting_link || a.doctor_permanent_link) ? "Launch Telemedicine Bridge" : "No active clinical bridge established"}
                                                className={`p-2 rounded-lg border bg-[var(--luna-card)] border-[var(--luna-border)] text-[var(--luna-primary)] transition-all shadow-sm ${(a.meeting_link || a.doctor_permanent_link) ? 'hover:bg-[var(--luna-primary)]/10 hover:border-[var(--luna-primary)]/30 hover:-translate-y-0.5' : 'opacity-20 pointer-events-none'}`}>
                                                <Video className="w-4 h-4" />
                                            </button>

                                            <button 
                                                onClick={() => setManageModal({ open: true, appt: a })}
                                                className="p-2 rounded-lg border bg-[var(--luna-card)] border-[var(--luna-border)] text-[var(--luna-text-dim)] hover:bg-[var(--luna-primary)]/5 transition-all shadow-sm"
                                                title="Open Encounter Management">
                                                <Settings className="w-4 h-4" />
                                            </button>
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