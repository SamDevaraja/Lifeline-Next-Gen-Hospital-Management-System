import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, AlertCircle, CheckCircle, X, UploadCloud, FileText
} from 'lucide-react';
import { LUNA } from "./Constants";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border relative z-10"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="p-7">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm`} style={{ background: 'var(--luna-navy)', color: type === 'danger' ? LUNA.danger_text : LUNA.info_text, borderColor: 'var(--luna-border)' }}>
                            {type === 'danger' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                    </div>
                    <p className="text-sm opacity-60 leading-relaxed pl-15" style={{ color: 'var(--luna-text-main)' }}>{message}</p>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 pt-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-black/5" style={{ color: 'var(--luna-text-dim)' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'}`}>
                        {type === 'danger' ? 'Remove Registry' : 'Confirm'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const InputModal = ({ isOpen, title, fields, onConfirm, onCancel, onFieldChange }) => {
    const [values, setValues] = useState({});

    useEffect(() => {
        if (isOpen) {
            setValues(prev => {
                const updated = { ...prev };
                fields.forEach(f => {
                    if (updated[f.key] === undefined) {
                        const val = f.initialValue !== undefined ? f.initialValue : '';
                        updated[f.key] = val;
                        // Trigger initial sync for critical fields
                        if (onFieldChange) onFieldChange(f.key, val, updated);
                    }
                });
                return updated;
            });
        } else {
            setValues({});
        }
    }, [isOpen, fields, onFieldChange]);

    if (!isOpen) return null;

    const handleChange = (key, val) => {
        setValues(prev => {
            const next = { ...prev, [key]: val };
            if (onFieldChange) onFieldChange(key, val, next);
            return next;
        });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border relative z-10 flex flex-col"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)' }}>
                    <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                    <button onClick={onCancel} className="p-1.5 hover:bg-black/5 rounded-lg transition-all opacity-40 hover:opacity-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {fields.map(f => (
                            <div key={f.key} className={`space-y-1.5 ${f.fullWidth ? 'md:col-span-2' : ''}`}>
                                <label className="block text-[11px] font-bold opacity-40 uppercase tracking-widest">{f.label}</label>
                                {f.type === 'select' ? (
                                    <div className="relative">
                                        <select
                                            value={values[f.key] || ''}
                                            onChange={e => handleChange(f.key, e.target.value)}
                                            disabled={f.disabled}
                                            className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-transparent"
                                            style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}
                                        >
                                            <option value="" disabled>Select {f.label}</option>
                                            {f.options?.map(opt => (
                                                <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                ) : f.type === 'radio-grid' ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-2">
                                        {f.options?.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                disabled={opt.disabled}
                                                onClick={() => handleChange(f.key, opt.value)}
                                                className={`relative overflow-hidden group px-4 py-3 rounded-2xl border transition-all duration-300 text-center ${
                                                    values[f.key] === opt.value 
                                                    ? 'shadow-2xl scale-[1.05] border-[var(--luna-teal)] z-10' 
                                                    : 'hover:bg-white/[0.05] hover:border-slate-500/30'
                                                } ${opt.disabled ? 'opacity-10 cursor-not-allowed hidden' : ''}`}
                                                style={{ 
                                                    background: values[f.key] === opt.value ? 'var(--luna-navy)' : 'rgba(255, 255, 255, 0.02)',
                                                    borderColor: values[f.key] === opt.value ? 'var(--luna-teal)' : 'var(--luna-border)'
                                                }}
                                            >
                                                {/* Selection Glow */}
                                                {values[f.key] === opt.value && (
                                                    <motion.div layoutId="slot-glow" className="absolute inset-0 bg-[var(--luna-teal)]/10 blur-xl block" />
                                                )}
                                                <div className="relative z-10 flex flex-col items-center">
                                                    {opt.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : f.type === 'file' ? (
                                    <div className="relative border-2 border-dashed rounded-xl p-8 text-center transition-all hover:bg-black/5 cursor-pointer" style={{ borderColor: 'var(--luna-border)' }}>
                                        <input
                                            type="file"
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => handleChange(f.key, reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <UploadCloud className="w-8 h-8 opacity-20" />
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-wider">{values[f.key] ? "File Attached" : "Upload Document"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type={f.type || 'text'}
                                        value={values[f.key] || ''}
                                        onChange={e => handleChange(f.key, e.target.value)}
                                        placeholder={f.placeholder}
                                        disabled={f.disabled}
                                        className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent"
                                        style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-8 pt-0">
                    <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-black/5" style={{ color: 'var(--luna-text-dim)' }}>
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(values)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 active:scale-95">
                        Confirm Clinical Data
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const DetailsModal = ({ isOpen, title, data, onCancel }) => {
    if (!isOpen || !data) return null;
    const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formatValue = (key, val) => {
        if (val === null || val === undefined || val === '') return <span className="opacity-30 italic">Not specified</span>;
        if (key === 'created_at' || key === 'updated_at' || key === 'last_restocked') {
            return new Date(val).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        if (key.includes('price') || key.includes('fee')) return `₹${parseFloat(val).toLocaleString()}`;
        if (key === 'status') {
            return (
                <span className={`${
                    val === 'Critical' ? 'badge-danger' : 
                    val === 'Low Stock' ? 'badge-warn' : 
                    'badge-success'}`}
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: '700', letterSpacing: '0.05em', fontSize: '9px' }}>
                    {val || 'Optimal'}
                </span>
            );
        }
        return String(val);
    };

    return (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border relative z-10 flex flex-col"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)' }}>
                    <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                    <button onClick={onCancel} className="p-1.5 hover:bg-black/5 rounded-lg transition-all opacity-40 hover:opacity-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-0 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="flex flex-col">
                        {Object.entries(data).map(([key, value]) => {
                            if (['id', 'user', 'is_deleted'].includes(key)) return null;
                            if (key === 'image_data' && value) {
                                return (
                                    <div key={key} className="p-8 space-y-3 border-b" style={{ borderColor: 'rgba(37, 99, 235, 0.1)' }}>
                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">{formatLabel(key)}</p>
                                        <img src={value} alt="Scan" className="w-full rounded-xl border shadow-sm" style={{ borderColor: 'var(--luna-border)' }} />
                                    </div>
                                );
                            }
                            return (
                                <div key={key} className="flex justify-between items-center px-8 py-4 hover:bg-[var(--luna-navy)] transition-colors border-b" style={{ borderColor: 'rgba(37, 99, 235, 0.1)' }}>
                                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">{formatLabel(key)}</p>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--luna-text-main)' }}>{formatValue(key, value)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    )};

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className={`w-full ${maxWidth} rounded-2xl overflow-hidden shadow-2xl border relative z-10 flex flex-col`}
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)' }}>
                    <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-lg transition-all opacity-40 hover:opacity-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto max-h-[85vh] custom-scrollbar">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export { ConfirmModal, InputModal, DetailsModal, Modal };