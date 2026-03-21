import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileText, X } from 'lucide-react';
import { LUNA } from '../Constants';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'info' }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm card shadow-2xl relative z-10" style={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)' }}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--luna-text-muted)' }}>{message}</p>
                        <div className="flex w-full gap-3">
                            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}>Cancel Operation</button>
                            <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg ${type === 'danger' ? 'bg-red-500 shadow-red-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}>Confirm Action</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export const InputModal = ({ isOpen, title, fields, onConfirm, onCancel }) => {
    const [vals, setVals] = React.useState({});
    React.useEffect(() => {
        if (isOpen) {
            const initial = {};
            fields.forEach(f => { initial[f.key] = f.initialValue || ''; });
            setVals(initial);
        }
    }, [isOpen, fields]);

    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="w-full max-w-xl card shadow-2xl relative z-10" style={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)' }}>
                    <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: 'var(--luna-border)' }}>
                        <h3 className="text-xl font-black" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                        <button onClick={onCancel} className="p-2 transition-colors hover:bg-slate-500/10 rounded-lg" style={{ color: 'var(--luna-text-muted)' }}><X className="w-5 h-5"/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                        {fields.map(f => (
                            <div key={f.key} className={`${f.fullWidth ? 'col-span-2' : 'col-span-2 sm:col-span-1'} space-y-1.5`}>
                                <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: LUNA.steel }}>{f.label}</label>
                                <div className="relative group">
                                    {f.icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-teal-400" style={{ color: LUNA.steel }}>{f.icon}</div>}
                                    {f.type === 'select' ? (
                                        <select value={vals[f.key]} onChange={e => setVals({ ...vals, [f.key]: e.target.value })} className={`input !py-3 ${f.icon ? '!pl-11' : '!px-4'}`}>
                                            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    ) : f.type === 'textarea' ? (
                                        <textarea value={vals[f.key]} onChange={e => setVals({ ...vals, [f.key]: e.target.value })} placeholder={f.placeholder} disabled={f.disabled} className={`input !py-3 min-h-[100px] ${f.icon ? '!pl-11' : '!px-4'}`} />
                                    ) : (
                                        <input type={f.type || 'text'} value={vals[f.key]} onChange={e => setVals({ ...vals, [f.key]: e.target.value })} placeholder={f.placeholder} disabled={f.disabled} autoFocus={f.autoFocus} className={`input !py-3 ${f.icon ? '!pl-11' : '!px-4'}`} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-8 pt-4 border-t" style={{ borderColor: 'var(--luna-border)' }}>
                        <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold border transition-all active:scale-95" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}>Cancel</button>
                        <button onClick={() => onConfirm(vals)} className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg btn-primary active:scale-95">Save Transmission</button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export const DetailsModal = ({ isOpen, title, data, onCancel }) => {
    if (!isOpen || !data) return null;

    const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const formatValue = (key, val) => {
        if (val === null || val === undefined || val === '') return <span className="text-slate-400 italic font-medium">Not available</span>;
        if (key === 'created_at' || key === 'updated_at') return new Date(val).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        if (key === 'consultation_fee' || key.includes('amount')) return `INR ${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        if (key === 'experience_years') return `${val} years of practice`;
        return String(val);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-indigo-950/20 backdrop-blur-xl" />
                <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                    className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border relative z-10 flex flex-col"
                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>

                    <div className="px-8 py-6 border-b flex items-center justify-between shadow-sm relative z-20" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/[0.03] to-transparent pointer-events-none" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border transition-transform hover:scale-105 duration-500" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-teal)' }}>
                                <FileText className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                    <p className="text-[10px] uppercase font-black tracking-[0.25em] opacity-50" style={{ color: 'var(--luna-text-main)' }}>Institutional Health Record 00-41X</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onCancel} className="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95" style={{ background: 'var(--luna-navy)', border: '1px solid var(--luna-border)', color: 'var(--luna-text-muted)' }}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-0 overflow-y-auto custom-scrollbar relative z-10" style={{ maxHeight: '65vh' }}>
                        <div className="grid grid-cols-1">
                            {Object.entries(data).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) return null;
                                if (['id', 'user', 'profile_pic', 'status', 'is_deleted'].includes(key)) return null;

                                return (
                                    <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 px-8 py-5 hover:bg-slate-500/5 transition-all duration-300" style={{ borderBottom: '1px solid var(--luna-border)' }}>
                                        <div className="sm:w-1/3 flex-shrink-0">
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50" style={{ color: 'var(--luna-text-muted)' }}>{formatLabel(key)}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold leading-relaxed tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                                {formatValue(key, value)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};
