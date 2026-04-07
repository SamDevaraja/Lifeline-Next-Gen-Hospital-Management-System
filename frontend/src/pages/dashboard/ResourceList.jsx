import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Search, Plus, Stethoscope, BrainCircuit,
    Clock, DollarSign, QrCode, User, Mail, Smartphone,
    Lock, HeartPulse, Droplets, CalendarDays, Filter,
    FileText, Phone, MapPin, Settings
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal, InputModal, DetailsModal } from './Modals';
import { LUNA } from "./Constants";

const ResourceList = ({ type, title, user }) => {
    const { theme } = useTheme();
    
    const role = (user?.role || '').toLowerCase();
    const isAdmin = role === 'admin' || user?.is_superuser;
    const isDoctor = role === 'doctor';
    const isReceptionist = role === 'receptionist';
    const isNurse = role === 'nurse';

    const canCreate = isAdmin || (type === 'patients' && (isReceptionist || isDoctor || isNurse));
    const canEdit = canCreate;
    const canDelete = isAdmin;
    const [data, setData] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [inputModal, setInputModal] = useState({ open: false, mode: 'create', item: null });
    const [detailsModal, setDetailsModal] = useState({ open: false, item: null });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const r = await api.get(`${type}/`);
                setData(r.data);
                if (type === 'patients') {
                    const dr = await api.get('doctors/');
                    setDoctorsList(dr.data.filter(d => Boolean(d.status)));
                }
            } catch (err) {
                toast.error("Failed to load clinical records.");
            }
            setLoading(false);
        };
        load();
    }, [type]);

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        const id = confirmDelete.id;
        try {
            toast.loading("Purging clinical record...", { id: 'archive' });
            await api.delete(`${type}/${id}/`);
            toast.success("Record legally archived & locked.", { id: 'archive' });
            setConfirmDelete({ open: false, id: null });
            setData(prev => prev.filter(i => String(i.id) !== String(id)));
        } catch (err) {
            console.error("Delete Error:", err);
            const msg = err.response?.data?.detail || err.message || "Operation failed.";
            toast.error(`System Protocol Error: ${msg}`, { id: 'archive' });
            setConfirmDelete({ open: false, id: null });
        }
    };

    const handleCreateEdit = async (vals) => {
        try {
            toast.loading(inputModal.mode === 'create' ? "Authenticating & generating record..." : "Committing changes...", { id: 'save' });
            
            if (inputModal.mode === 'create') {
                if (type === 'doctors') {
                    if (!vals.first_name || !vals.email || !vals.password || !vals.username) throw new Error("Missing required core credentials.");
                    const payload = {
                        first_name: vals.first_name,
                        last_name: vals.last_name || '',
                        email: vals.email,
                        password: vals.password,
                        username: vals.username,
                        mobile: vals.mobile || '',
                        address: vals.address || 'Unspecified Headquarters',
                        department: vals.department || 'General Medicine',
                        status: String(vals.status) === 'true',
                        qualification: vals.qualification || '',
                        experience_years: vals.experience_years || 0,
                        consultation_fee: vals.consultation_fee || 0
                    };
                    await api.post(`${type}/`, payload);
                } else {
                    if (!vals.first_name || !vals.password || !vals.username) throw new Error("Missing required core credentials.");
                    
                    const payload = {
                        first_name: vals.first_name,
                        last_name: vals.last_name || '',
                        email: vals.email || `${vals.username}@patient.local`,
                        password: vals.password,
                        username: vals.username,
                        mobile: vals.mobile || '',
                        address: vals.address || 'Unspecified Residence',
                        date_of_birth: vals.date_of_birth || null,
                        blood_group: vals.blood_group || '',
                        symptoms: vals.symptoms || '',
                        allergies: vals.allergies || '',
                        medical_history: vals.medical_history || '',
                        emergency_contact: vals.emergency_contact || '',
                        status: String(vals.status) === 'true',
                        risk_level: vals.risk_level || 'low'
                    };
                    if (isDoctor && user.doctor_id) {
                        payload.assigned_doctor = parseInt(user.doctor_id, 10);
                    } else if (vals.assigned_doctor) {
                        payload.assigned_doctor = parseInt(vals.assigned_doctor, 10);
                    }
                    await api.post(`${type}/`, payload);
                }
                toast.success("New entry definitively recorded.", { id: 'save' });
            } else {
                if (type === 'doctors') {
                    const payload = { 
                        first_name: vals.first_name,
                        last_name: vals.last_name,
                        username: vals.username,
                        address: vals.address || 'Unspecified Headquarters',
                        department: vals.department, 
                        status: String(vals.status) === 'true',
                        qualification: vals.qualification || '', 
                        experience_years: vals.experience_years || 0, 
                        consultation_fee: vals.consultation_fee || 0 
                    };
                    if (vals.password && vals.password.trim() !== '') {
                        payload.password = vals.password;
                    }
                    await api.patch(`${type}/${inputModal.item.id}/`, payload);
                } else {
                    const payload = { 
                        first_name: vals.first_name,
                        last_name: vals.last_name,
                        username: vals.username,
                        mobile: vals.mobile || '',
                        address: vals.address || 'Unspecified Residence',
                        date_of_birth: vals.date_of_birth || null,
                        blood_group: vals.blood_group || '',
                        symptoms: vals.symptoms || '',
                        allergies: vals.allergies || '',
                        medical_history: vals.medical_history || '',
                        emergency_contact: vals.emergency_contact || '',
                        status: String(vals.status) === 'true',
                        risk_level: vals.risk_level || 'low'
                    };
                    if (isDoctor && user.doctor_id) {
                        payload.assigned_doctor = parseInt(user.doctor_id, 10);
                    } else if (vals.assigned_doctor) {
                        payload.assigned_doctor = parseInt(vals.assigned_doctor, 10);
                    }
                    if (vals.password && vals.password.trim() !== '') {
                        payload.password = vals.password;
                    }
                    await api.patch(`${type}/${inputModal.item.id}/`, payload);
                }
                toast.success("Registry framework updated securely.", { id: 'save' });
            }
            setInputModal({ open: false, mode: 'create', item: null });
            const r = await api.get(`${type}/`);
            setData(r.data);
        } catch (err) {
            console.error("Save Error Details:", err.response?.data);
            const backendError = err.response?.data;
            let errorMsg = "Violation of validation parameters.";
            
            if (backendError && typeof backendError === 'object') {
                const firstKey = Object.keys(backendError)[0];
                const firstVal = backendError[firstKey];
                errorMsg = Array.isArray(firstVal) ? firstVal[0] : (typeof firstVal === 'string' ? firstVal : errorMsg);
                if (firstKey !== 'detail' && firstKey !== 'non_field_errors') {
                    errorMsg = `${firstKey.replace('_', ' ')}: ${errorMsg}`;
                }
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            toast.error(errorMsg, { id: 'save' });
        }
    };

    const filterOptions = React.useMemo(() => {
        if (type === 'doctors') {
            const depts = [...new Set(data.map(d => d.department).filter(Boolean))];
            return ['all', ...depts];
        }
        return ['all', 'Active', 'Discharged'];
    }, [data, type]);

    const filtered = React.useMemo(() => {
        const results = data.filter(item => {
            const name = item.get_name || item.patientName || item.first_name || '';
            const matchesSearch = name.toLowerCase().includes(search.toLowerCase());

            let matchesFilter = true;
            if (statusFilter !== 'all') {
                if (type === 'doctors') {
                    matchesFilter = item.department === statusFilter;
                } else {
                    const statusStr = item.status ? 'Active' : 'Discharged';
                    matchesFilter = statusStr === statusFilter;
                }
            }
            return matchesSearch && matchesFilter;
        });

        return results.sort((a, b) => {
            const nameA = (a.get_name || a.patientName || a.first_name || '').toLowerCase();
            const nameB = (b.get_name || b.patientName || b.first_name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [data, search, statusFilter, type]);

    const DOCTOR_FIELDS = inputModal.mode === 'create' ? [
        { key: 'first_name', label: 'First Name', placeholder: 'Dr. John', icon: <User className="w-4 h-4"/> },
        { key: 'last_name', label: 'Last Name', placeholder: 'Doe', icon: <User className="w-4 h-4"/> },
        { key: 'email', label: 'Official Email', placeholder: 'doctor@hospital.com', type: 'email', icon: <Mail className="w-4 h-4"/> },
        { key: 'mobile', label: 'Secure Mobile', placeholder: '+91 90000 00000', icon: <Smartphone className="w-4 h-4"/> },
        { key: 'department', label: 'Clinical Department', type: 'select', icon: <Stethoscope className="w-4 h-4"/>, options: [
            {label: 'Cardiologist', value: 'Cardiologist'}, {label: 'Dermatologist', value: 'Dermatologist'},
            {label: 'Emergency Medicine', value: 'Emergency Medicine'}, {label: 'Neurologist', value: 'Neurologist'},
            {label: 'Pediatrician', value: 'Pediatrician'}, {label: 'Orthopedic Surgeon', value: 'Orthopedic Surgeon'},
            {label: 'Oncologist', value: 'Oncologist'}, {label: 'General Surgery', value: 'General Surgery'},
            {label: 'Internal Medicine', value: 'Internal Medicine'}
        ]},
        { key: 'qualification', label: 'Qualifications', placeholder: 'e.g. MD, MBBS', icon: <BrainCircuit className="w-4 h-4"/> },
        { key: 'experience_years', label: 'Experience (Years)', type: 'number', placeholder: 'e.g. 10', icon: <Clock className="w-4 h-4"/> },
        { key: 'consultation_fee', label: 'Consultation Fee (₹)', type: 'number', placeholder: 'e.g. 500', icon: <DollarSign className="w-4 h-4"/> },
        { key: 'status', label: 'Operational Status', type: 'select', initialValue: 'true', icon: <Activity className="w-4 h-4"/>, options: [
            {label: 'Active & Verified', value: 'true'}, {label: 'Suspended / Inactive', value: 'false'}
        ]},
        { key: 'username', label: 'System Alias (Login ID)', placeholder: 'e.g. jdoe_cardio', icon: <QrCode className="w-4 h-4"/> },
        { key: 'password', label: 'Initial Auth Password', placeholder: 'Temporary secure password', type: 'password', icon: <Lock className="w-4 h-4"/> }
    ] : [
        { key: 'first_name', label: 'First Name', initialValue: inputModal.item?.user?.first_name || (inputModal.item?.get_name || '').split(' ')[0] },
        { key: 'last_name', label: 'Last Name', initialValue: inputModal.item?.user?.last_name || (inputModal.item?.get_name || '').split(' ')[1] || '' },
        { key: 'department', label: 'Clinical Department', type: 'select', initialValue: inputModal.item?.department, options: [
            {label: 'Cardiologist', value: 'Cardiologist'}, {label: 'Dermatologist', value: 'Dermatologist'},
            {label: 'Emergency Medicine', value: 'Emergency Medicine'}, {label: 'Neurologist', value: 'Neurologist'},
            {label: 'Pediatrician', value: 'Pediatrician'}, {label: 'Orthopedic Surgeon', value: 'Orthopedic Surgeon'},
            {label: 'Oncologist', value: 'Oncologist'}, {label: 'General Surgery', value: 'General Surgery'},
            {label: 'Internal Medicine', value: 'Internal Medicine'}
        ]},
        { key: 'qualification', label: 'Qualifications', placeholder: 'e.g. MD, MBBS', initialValue: inputModal.item?.qualification },
        { key: 'consultation_fee', label: 'Consultation Fee (₹)', type: 'number', placeholder: 'e.g. 500', initialValue: inputModal.item?.consultation_fee },
        { key: 'address', label: 'Residential Address', initialValue: inputModal.item?.address },
        { key: 'status', label: 'Operational Status', type: 'select', initialValue: String(inputModal.item?.status), options: [
            {label: 'Active & Verified', value: 'true'}, {label: 'Suspended / Inactive', value: 'false'}
        ]},
        { key: 'username', label: 'System Alias (Login ID)', initialValue: inputModal.item?.user?.username, disabled: true },
        { key: 'password', label: 'Override Auth Password', placeholder: 'Leave blank to keep unchanged', type: 'password' }
    ];

    const PATIENT_FIELDS = inputModal.mode === 'create' ? [
        { key: 'first_name', label: 'First Name', placeholder: 'Jane', icon: <User className="w-4 h-4" /> },
        { key: 'last_name', label: 'Last Name', placeholder: 'Smith', icon: <User className="w-4 h-4" /> },
        { key: 'username', label: 'System Alias (Login)', placeholder: 'jane_s', icon: <QrCode className="w-4 h-4" /> },
        { key: 'password', label: 'Initial Vault Password', placeholder: 'Secure password', type: 'password', icon: <Lock className="w-4 h-4" /> },
        { key: 'mobile', label: 'Emergency Mobile', placeholder: '+1 900 000 0000', icon: <Phone className="w-4 h-4" /> },
        { key: 'address', label: 'Residential Address', placeholder: '123 Health Ave', icon: <MapPin className="w-4 h-4" /> },
        { key: 'date_of_birth', label: 'Date of Birth Parameter', type: 'date', icon: <CalendarDays className="w-4 h-4" /> },
        { key: 'blood_group', label: 'Blood Group Matrix', type: 'select', icon: <Droplets className="w-4 h-4 text-red-500" />, options: [
            {label: 'A+', value: 'A+'}, {label: 'B+', value: 'B+'}, {label: 'O+', value: 'O+'}, {label: 'AB+', value: 'AB+'},
            {label: 'A-', value: 'A-'}, {label: 'B-', value: 'B-'}, {label: 'O-', value: 'O-'}, {label: 'AB-', value: 'AB-'}
        ]},
        { key: 'risk_level', label: 'Triage Risk Level', type: 'select', icon: <Activity className="w-4 h-4" />, options: [
            {label: 'Low Priority', value: 'low'}, {label: 'Moderate', value: 'moderate'}, 
            {label: 'High Severity', value: 'high'}, {label: 'CRITICAL', value: 'critical'}
        ]},
        { key: 'status', label: 'Admittance State', type: 'select', initialValue: 'true', icon: <Activity className="w-4 h-4" />, options: [
            {label: 'Admitted / Active', value: 'true'}, {label: 'Discharged / Finalized', value: 'false'}
        ]},
        !isDoctor && { key: 'assigned_doctor', label: 'Assigned Lead Specialist', type: 'select', icon: <Stethoscope className="w-4 h-4" />, options: doctorsList.map(d => ({label: `Dr. ${d.get_name || d.user?.first_name}`, value: d.id})) },
        { key: 'symptoms', label: 'Current Chief Complaint (Symptoms)', placeholder: 'Brief description...', fullWidth: true, icon: <HeartPulse className="w-4 h-4" /> }
    ].filter(Boolean) : [
        { key: 'first_name', label: 'First Name', initialValue: inputModal.item?.user?.first_name || (inputModal.item?.get_name || '').split(' ')[0] },
        { key: 'username', label: 'System Alias (Login)', initialValue: inputModal.item?.user?.username, disabled: true },
        { key: 'password', label: 'Override Vault Password', placeholder: 'Leave blank to keep unchanged', type: 'password' },
        { key: 'mobile', label: 'Emergency Mobile', initialValue: inputModal.item?.mobile },
        { key: 'address', label: 'Residential Address', initialValue: inputModal.item?.address },
        { key: 'date_of_birth', label: 'Date of Birth Parameter', type: 'date', initialValue: inputModal.item?.date_of_birth },
        { key: 'blood_group', label: 'Blood Group Matrix', type: 'select', initialValue: inputModal.item?.blood_group, options: [
            {label: 'A+', value: 'A+'}, {label: 'B+', value: 'B+'}, {label: 'O+', value: 'O+'}, {label: 'AB+', value: 'AB+'},
            {label: 'A-', value: 'A-'}, {label: 'B-', value: 'B-'}, {label: 'O-', value: 'O-'}, {label: 'AB-', value: 'AB-'}
        ]},
        { key: 'risk_level', label: 'Triage Risk Level', type: 'select', initialValue: inputModal.item?.risk_level, options: [
            {label: 'Low Priority', value: 'low'}, {label: 'Moderate', value: 'moderate'}, 
            {label: 'High Severity', value: 'high'}, {label: 'CRITICAL', value: 'critical'}
        ]},
        { key: 'status', label: 'Admittance State', type: 'select', initialValue: String(inputModal.item?.status), options: [
            {label: 'Admitted / Active', value: 'true'}, {label: 'Discharged / Finalized', value: 'false'}
        ]},
        !isDoctor && { key: 'assigned_doctor', label: 'Assigned Lead Specialist', type: 'select', initialValue: inputModal.item?.assigned_doctor, options: doctorsList.map(d => ({label: `Dr. ${d.get_name || d.user?.first_name}`, value: d.id})) },
        { key: 'symptoms', label: 'Current Chief Complaint (Symptoms)', initialValue: inputModal.item?.symptoms, fullWidth: true }
    ].filter(Boolean);

    const getRiskColors = (level) => {
        switch(level) {
            case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
            case 'high': return { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' };
            case 'moderate': return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' };
            default: return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <ConfirmModal
                isOpen={confirmDelete.open}
                title={`Purge ${type === 'doctors' ? 'Specialist' : 'Patient'} Record`}
                message="This will permanently dissolve the user directory and all associated clinical logs. Are you absolutely certain?"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete({ open: false, id: null })}
                type="danger"
            />
            <DetailsModal
                isOpen={detailsModal.open}
                title={`${type === 'doctors' ? 'Dr.' : 'Patient'} Complete Data Layer`}
                data={detailsModal.item}
                onCancel={() => setDetailsModal({ open: false, item: null })}
            />
            <InputModal
                isOpen={inputModal.open}
                title={inputModal.mode === 'create' ? `Formalize New ${type === 'doctors' ? 'Specialist' : 'Patient'}` : `Modify Clinical Profile`}
                fields={type === 'doctors' ? DOCTOR_FIELDS : PATIENT_FIELDS}
                onConfirm={handleCreateEdit}
                onCancel={() => setInputModal({ open: false, mode: 'create', item: null })}
            />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>{title}</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                        {loading ? 'Decrypting records...' : `Total Registered: ${filtered.length}`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 transition-colors group-focus-within:text-teal-400" style={{ color: LUNA.teal }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            type="text"
                            placeholder={`Scan ${type}...`}
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
                            {filterOptions.map(f => (
                                <option key={f} value={f} className="font-black" style={{ background: 'var(--luna-card)', color: theme === 'dark' ? 'white' : 'var(--luna-blue)', fontWeight: '900' }}>
                                    {f === 'all' ? `All ${type === 'doctors' ? 'Depts' : 'Status'}` : f}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:scale-110" style={{ color: theme === 'dark' ? 'white' : 'var(--luna-blue)' }}>
                            <Filter className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {canCreate && (
                        <button
                            onClick={() => setInputModal({ open: true, mode: 'create', item: null })}
                            className="btn-teal text-[10px] font-black uppercase tracking-widest px-6 h-[46px] flex items-center gap-2 shadow-xl hover:shadow-teal-500/30">
                            <Plus className="w-4 h-4" /> Initialize Protocol
                        </button>
                    )}
                </div>
            </div>

            <div className="card overflow-hidden p-0 shadow-2xl rounded-2xl" border={{ border: '1px solid var(--luna-border)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr style={{ background: 'var(--luna-navy)', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="text-left pl-6 pr-4 py-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[22%]" style={{ color: 'var(--luna-text-main)' }}>{type === 'doctors' ? 'Dr. Profile' : 'Patient Demographics'}</th>
                                {type === 'doctors' ? (
                                    <>
                                        <th className="text-left py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[20%]" style={{ color: 'var(--luna-text-main)' }}>Department</th>
                                        <th className="text-center py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[15%]" style={{ color: 'var(--luna-text-main)' }}>Consultation Fee</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="text-center py-4 px-2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[10%]" style={{ color: 'var(--luna-text-main)' }}>Blood Grp</th>
                                        <th className="text-center py-4 px-2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[12%]" style={{ color: 'var(--luna-text-main)' }}>Triage Risk</th>
                                        <th className="text-left py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[15%]" style={{ color: 'var(--luna-text-main)' }}>Assigned Doctor</th>
                                    </>
                                )}
                                <th className="text-center py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[12%]" style={{ color: 'var(--luna-text-main)' }}>Status Layer</th>
                                <th className="text-center py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] opacity-60 w-[15%]" style={{ color: 'var(--luna-text-main)' }}>Terminal Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="6" className="px-6 py-6">
                                            <div className="animate-pulse h-6 rounded-lg w-full" style={{ background: 'var(--luna-navy)' }} />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24 font-medium italic" style={{ color: LUNA.steel }}>
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <span>Zero database matches identified</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((item, i) => {
                                const patientRiskColors = getRiskColors(item.risk_level);
                                return (
                                    <tr key={i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td className="pl-6 pr-4 py-4 align-middle">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner shrink-0 uppercase border"
                                                    style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}>
                                                    {(item.get_name && item.get_name !== " " ? item.get_name[0] : (item.first_name ? item.first_name[0] : '?'))}
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <p className="font-extrabold text-[14px] truncate" style={{ color: 'var(--luna-text-main)' }}>{item.get_name || item.patientName || 'Anonymous Identity'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 opacity-60">
                                                        {type === 'doctors' ? <Stethoscope className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                        <p className="text-[10px] font-black uppercase tracking-widest truncate" style={{ color: 'var(--luna-text-muted)' }}>IDX-{String(item.id || i + 10).padStart(4, '0')} • {item.mobile || 'No Dial'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {type === 'doctors' ? (
                                            <>
                                                <td className="text-left px-4 py-4 align-middle">
                                                    <span className="text-[11px] font-black uppercase tracking-wider block truncate" style={{ color: LUNA.steel }}>
                                                        {item.department || 'General Assembly'}
                                                    </span>
                                                    <span className="text-[9px] font-bold opacity-50 block mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>{item.experience_years ? `${item.experience_years} Years Active` : 'Novice Protocol'}</span>
                                                </td>
                                                <td className="text-center px-4 py-4 align-middle">
                                                    <span className="font-black text-[14px] whitespace-nowrap" style={{ color: 'var(--luna-text-main)' }}><span className="opacity-40 mr-1">₹</span>{parseFloat(item.consultation_fee || 0).toLocaleString()}</span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="text-center px-2 py-4 align-middle">
                                                    <span className="text-[11px] font-black px-2 py-1 rounded-md border text-red-500 bg-red-500/10 border-red-500/20 shadow-sm mx-auto flex items-center justify-center w-max gap-1">
                                                        <Droplets className="w-3 h-3"/> {item.blood_group || 'UNK'}
                                                    </span>
                                                </td>
                                                <td className="text-center px-2 py-4 align-middle">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm mx-auto inline-block whitespace-nowrap ${patientRiskColors.bg} ${patientRiskColors.text} ${patientRiskColors.border}`}>
                                                        {item.risk_level || 'LOW'}
                                                    </span>
                                                </td>
                                                <td className="text-left px-4 py-4 align-middle">
                                                    <span className="text-[11px] font-bold block truncate" style={{ color: 'var(--luna-text-muted)' }}>
                                                        {item.assigned_doctor_name ? `Dr. ${item.assigned_doctor_name}` : 'Unassigned Route'}
                                                    </span>
                                                </td>
                                            </>
                                        )}

                                        <td className="text-center px-4 py-4 align-middle">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-black uppercase tracking-widest text-[9px] rounded-md border shadow-sm mx-auto whitespace-nowrap ${item.status ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}/>
                                                {item.status ? 'Active' : (type === 'doctors' ? 'Suspended' : 'Discharged')}
                                            </span>
                                        </td>
                                        
                                        <td className="text-center px-4 py-4 align-middle">
                                            <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity mx-auto w-max">
                                                {type === 'patients' && isDoctor && (
                                                    <button onClick={() => {
                                                        const url = `/dashboard/appointments?patient_id=${item.id}&patient_name=${encodeURIComponent(item.get_name)}`;
                                                        window.location.href = url; // Hard nav or navigate if using hook
                                                    }} title="Schedule Slot"
                                                        className="p-1.5 rounded-lg border transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:-translate-y-0.5"
                                                        style={{ color: '#10b981', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                        <CalendarDays className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); setDetailsModal({ open: true, item }); }} title="Execute Analytics"
                                                    className="p-1.5 rounded-lg border transition-all hover:bg-teal-500/10 hover:border-teal-500/30 hover:-translate-y-0.5"
                                                    style={{ color: LUNA.teal, background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                {canEdit && (
                                                    <button onClick={(e) => { e.stopPropagation(); setInputModal({ open: true, mode: 'edit', item }); }} title="Configure Override"
                                                        className="p-1.5 rounded-lg border transition-all hover:bg-blue-500/10 hover:border-blue-500/30 hover:-translate-y-0.5"
                                                        style={{ color: '#3b82f6', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: item.id }); }} title="Terminate Protocol"
                                                        className="p-1.5 rounded-lg border transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:-translate-y-0.5"
                                                        style={{ color: '#ef4444', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                        <Lock className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default ResourceList;