import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, CheckCircle, X, Plus, Trash2, User, ShoppingBag,
    RefreshCw, ClipboardList, Database, Pill, ShoppingCart, PackageOpen,
    Minus, Receipt, Hash, Clock, ChevronDown, ArrowRight, Save, CreditCard, UserCheck, AlertTriangle,
    Printer
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from './Constants';

const DispensaryPage = ({ user }) => {
    const { theme } = useTheme();

    // Core Data
    const [prescriptions, setPrescriptions] = useState([]);
    const [pharmacyOrders, setPharmacyOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UI Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
    const [searchTermPatient, setSearchTermPatient] = useState('');
    const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);

    // Cart & Checkout State
    const [cart, setCart] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [customerType, setCustomerType] = useState('registered'); // 'registered' | 'guest'
    const [guestName, setGuestName] = useState('');
    const [guestMobile, setGuestMobile] = useState('');
    const [relatedRxId, setRelatedRxId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        try {
            const [prescRes, orderRes, invRes, patRes] = await Promise.all([
                api.get('prescriptions/'),
                api.get('pharmacy-orders/').catch(() => ({ data: [] })),
                api.get('pharmacy/'),
                api.get('patients/')
            ]);
            setPrescriptions(prescRes.data);
            setPharmacyOrders(orderRes.data);
            setInventory(invRes.data);
            setPatients(patRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const isDispensed = useCallback((pId) => pharmacyOrders.some(o => o.prescription === pId && o.status === 'completed'), [pharmacyOrders]);
    const pendingRx = useMemo(() => prescriptions.filter(p => !isDispensed(p.id)), [prescriptions, isDispensed]);

    // Cart Logic
    const addToCart = (item, qty = 1) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: Math.min(c.qty + qty, c.stock_level) } : c);
            return [...prev, { ...item, qty: Math.min(qty, item.stock_level) }];
        });
    };

    const updateCartQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) return { ...item, qty: Math.max(1, Math.min(item.qty + delta, item.stock_level)) };
            return item;
        }));
    };

    const subtotal = cart.reduce((sum, i) => sum + (i.unit_price * i.qty), 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    const stageRx = (p) => {
        const pat = patients.find(pat => pat.id === p.patient);
        if (pat) {
            setCustomerType('registered');
            setSelectedPatientId(pat.id);
            setRelatedRxId(p.id);
            const mapped = [];
            p.medicines.forEach(m => {
                const hit = inventory.find(inv => inv.name.toLowerCase() === m.name.toLowerCase());
                if (hit) mapped.push({ ...hit, qty: m.quantity || 1 });
            });
            setCart(mapped);
            toast.success(`Prescription for ${p.patient_name} staged.`);
        } else {
            toast.error("Patient record mismatch.");
        }
    };

    const submitOrder = async () => {
        if (customerType === 'registered' && !selectedPatientId) return toast.error('Please select a patient first.');
        if (customerType === 'guest' && !guestName) return toast.error('Please enter guest name.');
        if (cart.length === 0) return toast.error('Add items to the bill.');

        try {
            toast.loading('Processing...', { id: 'txn' });
            const payload = {
                mode: relatedRxId ? 'rx' : 'pos',
                prescription_id: relatedRxId,
                patient_id: customerType === 'registered' ? selectedPatientId : null,
                guest_name: customerType === 'guest' ? guestName : null,
                guest_mobile: customerType === 'guest' ? guestMobile : null,
                items: cart.map(i => ({ id: i.id, quantity: i.qty })),
                payment_status: paymentMethod === 'cash' ? 'paid' : 'pending'
            };
            const { data } = await api.post('pharmacy-orders/process_order/', payload);
            toast.success('Transaction Completed!', { id: 'txn' });
            
            // Try to open bill PDF
            try {
                const pdfResponse = await api.get(`bills/${data.bill_id}/generate_pdf/`, { responseType: 'blob' });
                const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            } catch (pdfErr) {
                console.warn('PDF auto-open blocked or failed', pdfErr);
            }
            
            setCart([]); setSelectedPatientId(''); setRelatedRxId(null); setSearchTermPatient('');
            setGuestName(''); setGuestMobile('');
            fetchData(true);
        } catch (e) { 
            toast.error(e.response?.data?.error || 'Transaction failed.', { id: 'txn' }); 
        }
    };

    const cardStyle = { background: 'var(--luna-card)', border: '1px solid var(--luna-border)' };
    const textMain = { color: 'var(--luna-text-main)' };
    const textMuted = { color: 'var(--luna-text-muted)' };

    if (loading && inventory.length === 0) return <div className="h-full flex items-center justify-center p-20 opacity-30"><RefreshCw className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 antialiased">
            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                
                {/* 1. PRESCRIPTION QUEUE (Active Inbound Feed) */}
                <div className="w-[340px] flex flex-col rounded-2xl border shadow-sm overflow-hidden" style={cardStyle}>
                    <header className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                        <div className="flex items-center gap-3">
                            <ClipboardList className="w-4 h-4 text-emerald-500" />
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-100">Prescription Queue</h2>
                        </div>
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{pendingRx.length} LIVE</span>
                    </header>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3" style={{ background: 'var(--luna-card)' }}>
                        {pendingRx.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center" style={{ color: 'var(--luna-text-main)' }}>
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/5 opacity-20">
                                    <Search className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase mb-1">Queue Depleted</h3>
                                <p className="text-[10px] font-semibold opacity-30 max-w-[200px] leading-relaxed">
                                    No active prescriptions currently require fulfillment.
                                </p>
                            </div>
                        ) : (
                            pendingRx.map(p => (
                                <button key={p.id} onClick={() => stageRx(p)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${relatedRxId === p.id ? 'ring-2 ring-emerald-500' : 'hover:bg-white/5'}`}
                                    style={{ background: 'var(--luna-background-secondary)', borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><User className="w-3.5 h-3.5" /></div>
                                        <div className="text-[8px] font-black uppercase opacity-40">{p.created_at?.split('T')[1].slice(0,5)}</div>
                                    </div>
                                    <p className="text-[12px] font-black uppercase tracking-tight" style={textMain}>{p.patient_name}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Pill className="w-3 h-3 opacity-30" />
                                        <p className="text-[9px] font-bold opacity-40 uppercase truncate">{p.medicines.map(m => m.name).join(', ')}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. INVENTORY / CATALOG */}
                <div className="flex-1 flex flex-col rounded-2xl border shadow-sm overflow-hidden" style={cardStyle}>
                    <header className="p-7 border-b flex flex-col gap-6" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
                            {/* Search: Reduced Size */}
                            <div className="relative group w-full md:w-1/3">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30 group-focus-within:text-[#7c3aed] transition-all" />
                                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search medicine..."
                                    onFocus={() => setShowMedicineSuggestions(true)}
                                    className="w-full bg-transparent pl-10 pr-10 py-3 h-[46px] rounded-xl text-[11px] font-black uppercase tracking-widest border outline-none focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-slate-500 placeholder:opacity-70"
                                    style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }} />
                                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-transform duration-300 ${showMedicineSuggestions ? 'rotate-180' : ''}`} style={{ color: '#7c3aed' }} />
                                
                                <AnimatePresence>
                                    {showMedicineSuggestions && inventory.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 right-0 mt-3 border rounded-2xl shadow-2xl z-[100] max-h-80 overflow-y-auto overflow-x-hidden custom-scrollbar p-2"
                                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}
                                        >
                                            {inventory
                                                .filter(item => {
                                                    const s = searchTerm.toLowerCase();
                                                    return item.name.toLowerCase().includes(s) || item.category.toLowerCase().includes(s);
                                                })
                                                .map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            addToCart(item);
                                                            setSearchTerm('');
                                                            setShowMedicineSuggestions(false);
                                                        }}
                                                        className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-all group flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center border border-[#7c3aed]/20 group-hover:bg-[#7c3aed] group-hover:text-white transition-all">
                                                                <Pill className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-black uppercase tracking-tight" style={textMain}>{item.name}</p>
                                                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-40" style={textMain}>{item.category} • STOCK: {item.stock_level}</p>
                                                            </div>
                                                        </div>
                                                        <Plus className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-all text-[#7c3aed]" />
                                                    </button>
                                                ))
                                            }
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Customer Type Toggle */}
                            <div className="flex bg-blue-500/5 p-1 rounded-xl border border-blue-500/10 h-[46px]">
                                <button onClick={() => setCustomerType('registered')}
                                    className={`px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${customerType === 'registered' ? 'text-white shadow-md' : 'opacity-30'}`}
                                    style={{
                                        background: customerType === 'registered' ? '#7c3aed' : 'transparent',
                                        color: customerType === 'registered' ? 'white' : 'var(--luna-text-main)'
                                    }}>
                                    Registered
                                </button>
                                <button onClick={() => setCustomerType('guest')}
                                    className={`px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${customerType === 'guest' ? 'text-white shadow-md' : 'opacity-30'}`}
                                    style={{
                                        background: customerType === 'guest' ? '#7c3aed' : 'transparent',
                                        color: customerType === 'guest' ? 'white' : 'var(--luna-text-main)'
                                    }}>
                                    Walk-in
                                </button>
                            </div>

                            {customerType === 'registered' ? (
                                <div className="relative group flex-1">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                                        <User className="w-3.5 h-3.5 opacity-40" style={{ color: '#7c3aed' }} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="SEARCH NAME OR PATIENT ID [PID-XXXX]..."
                                        className="w-full h-[46px] pl-12 pr-12 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] outline-none border transition-all placeholder:text-slate-500 placeholder:opacity-90 focus:border-[#7c3aed]/50"
                                        style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                                        value={searchTermPatient}
                                        onChange={(e) => {
                                            setSearchTermPatient(e.target.value);
                                            setSelectedPatientId('');
                                            setRelatedRxId(null);
                                        }}
                                        onFocus={() => setShowPatientSuggestions(true)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {selectedPatientId && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPatientId('');
                                                    setSearchTermPatient('');
                                                    setRelatedRxId(null);
                                                }}
                                                className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#7c3aed]/10 hover:bg-[#7c3aed] hover:text-white transition-all border border-[#7c3aed]/20"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showPatientSuggestions ? 'rotate-180' : ''}`} style={{ color: '#7c3aed' }} />
                                    </div>
                                    <AnimatePresence>
                                        {showPatientSuggestions && patients.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 right-0 mt-3 border rounded-2xl shadow-2xl z-[100] max-h-80 overflow-y-auto overflow-x-hidden custom-scrollbar p-2"
                                                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}
                                            >
                                                {patients
                                                    .filter(p => {
                                                        const name = (p.get_name || '').toLowerCase();
                                                        const id = `pid-${p.id}`;
                                                        const phone = (p.phone || p.mobile || '').toLowerCase();
                                                        const search = searchTermPatient.toLowerCase();
                                                        return name.includes(search) || id.includes(search) || phone.includes(search);
                                                    })
                                                    .map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => {
                                                                setSelectedPatientId(p.id);
                                                                setSearchTermPatient(p.get_name || p.user?.username || '');
                                                                setShowPatientSuggestions(false);
                                                                setRelatedRxId(null);
                                                            }}
                                                            className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-all group flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center border border-[#7c3aed]/20 group-hover:bg-[#7c3aed] group-hover:text-white transition-all">
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] font-black uppercase tracking-tight" style={textMain}>{p.get_name || p.user?.username}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#7c3aed', opacity: 0.4 }}>PID-{p.id}</p>
                                                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                                                        <p className="text-[9px] font-bold tracking-widest" style={{ color: '#7c3aed', opacity: 0.4 }}>{p.phone || p.mobile || 'NO PHONE'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#7c3aed]" />
                                                        </button>
                                                    ))
                                                }
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex-1 flex gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                                            <User className="w-3.5 h-3.5 opacity-30" />
                                        </div>
                                        <input value={guestName} onChange={e => setGuestName(e.target.value)}
                                            placeholder="GUEST NAME..."
                                            className="w-full h-[46px] bg-slate-500/5 pl-11 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none focus:border-[#7c3aed]/50 transition-all placeholder:text-slate-500 placeholder:opacity-70"
                                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }} />
                                    </div>
                                    <div className="relative flex-1">
                                        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                                            <span className="text-[10px] font-black opacity-30" style={{ color: 'var(--luna-text-main)' }}>+91</span>
                                        </div>
                                        <input value={guestMobile} onChange={e => setGuestMobile(e.target.value)}
                                            placeholder="MOBILE..."
                                            className="w-full h-[46px] bg-slate-500/5 pl-12 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none focus:border-[#7c3aed]/50 transition-all placeholder:text-slate-500 placeholder:opacity-70"
                                            style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: 'var(--luna-card)' }}>
                        <div className="px-7 py-2">
                            <table className="w-full text-left order-collapse relative">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-y transition-colors duration-300"
                                        style={{
                                            borderColor: 'var(--luna-border)',
                                            background: 'var(--luna-navy)'
                                        }}>
                                        <th className={`py-4 pl-4 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Medical Description</th>
                                        <th className={`py-4 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Category</th>
                                        <th className={`py-4 text-[10px] font-black uppercase tracking-widest text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Stock</th>
                                        <th className={`py-4 text-[10px] font-black uppercase tracking-widest text-right ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Unit Price</th>
                                        <th className={`py-4 pr-4 text-[10px] font-black uppercase tracking-widest text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Add to Bill</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory
                                        .filter(i => {
                                            const search = searchTerm.toLowerCase();
                                            const nameMatch = (i.name || '').toLowerCase().includes(search);
                                            const descMatch = (i.description || '').toLowerCase().includes(search);
                                            const catMatch = (i.category || '').toLowerCase().includes(search);
                                            return nameMatch || descMatch || catMatch;
                                        })
                                        .map(item => (
                                            <tr key={item.id} className="group hover:bg-slate-500/5 transition-all border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                                <td className="py-4.5 pl-2">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 grid place-items-center shrink-0">
                                                            <Pill className="w-4 h-4" style={{ color: '#7c3aed' }} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-black uppercase tracking-tight" style={textMain}>{item.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="text-center font-black text-xs">
                                                    <span className={item.stock_level === 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}>{item.stock_level}</span>
                                                </td>
                                                <td className="text-right text-[14px] font-black" style={textMain}>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                                                <td className="text-center">
                                                    <div className="flex justify-center">
                                                        <button onClick={() => addToCart(item)}
                                                            className="w-8 h-8 flex items-center justify-center bg-[#7c3aed]/10 text-[#7c3aed] rounded-full transition-all hover:bg-[#7c3aed] hover:text-white active:scale-95 shadow-sm border border-[#7c3aed]/10">
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            {inventory.length === 0 && (
                                <div className="py-28 flex flex-col items-center justify-center text-center" style={{ color: 'var(--luna-text-main)' }}>
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/5 opacity-20">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase mb-1">Zero Assets</h3>
                                    <p className="text-xs font-semibold opacity-30 max-w-[320px] leading-relaxed">
                                        No matches found. Please try a different search term.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* THE BILL: RETAIL PREVIEW */}
                <div className="w-[380px] flex flex-col rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
                    <header className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center border border-[#7c3aed]/20 shadow-inner">
                                <ShoppingCart className="w-5 h-5 text-[#7c3aed]" />
                            </div>
                            <div className="flex items-center">
                                <h1 className="text-[11px] font-black uppercase tracking-widest leading-none outline-none" style={{ color: 'var(--luna-text-main)' }}>
                                    Billing Console
                                </h1>
                            </div>
                        </div>
                        {cart.length > 0 && (
                            <button onClick={() => { setCart([]); setRelatedRxId(null); setSelectedPatientId(''); }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-500/10 text-red-500 transition-all active:scale-95 border border-transparent hover:border-red-500/20">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 custom-scrollbar" style={{ background: 'var(--luna-card)' }}>
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center" style={{ color: 'var(--luna-text-main)' }}>
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/5 opacity-20">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold tracking-[0.2em] opacity-40 uppercase mb-1">Empty Console</h3>
                                <p className="text-[10px] font-semibold opacity-30 max-w-[200px] leading-relaxed">
                                    No items staged for billing. Select items from the catalog.
                                </p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="py-2 px-4 rounded-xl border transition-all hover:bg-white/[0.03] group relative flex items-center"
                                    style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>

                                    {/* Medical Specification */}
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-[10px] font-black uppercase tracking-tight leading-tight" style={textMain} title={item.name}>{item.name}</p>
                                    </div>

                                    {/* Fulfillment Units */}
                                    <div className="flex-shrink-0 px-2">
                                        <div className="flex items-center rounded-lg border p-0.5"
                                            style={{ background: 'var(--luna-background-secondary)', borderColor: 'var(--luna-border)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                                            <button onClick={() => updateCartQty(item.id, -1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md transition-all opacity-40 hover:opacity-100"
                                                style={textMain}>
                                                <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <span className="w-7 text-center text-[10px] font-black" style={textMain}>{item.qty}</span>
                                            <button onClick={() => updateCartQty(item.id, 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md transition-all text-[#7c3aed] hover:bg-[#7c3aed]/10">
                                                <Plus className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Financial Total */}
                                    <div className="w-20 text-right px-2">
                                        <p className="text-[11px] font-black" style={textMain}>₹{(parseFloat(item.unit_price) * item.qty).toFixed(2)}</p>
                                    </div>

                                    {/* Operational Removal */}
                                    <div className="w-9 flex justify-end">
                                        <button onClick={() => updateCartQty(item.id, -item.qty)}
                                            className="w-8 h-8 flex items-center justify-center opacity-20 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90 border border-transparent hover:border-red-500/10 rounded-lg">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Subtle highlight edge */}
                                    <div className="absolute top-0 inset-x-0 h-px bg-white/5" />
                                </div>
                            ))
                        )}
                    </div>

                    {/* CONDENSED BILLING FOOTER */}
                    <div className="px-6 py-4 border-t flex flex-col gap-4"
                        style={{
                            borderColor: 'var(--luna-border)',
                            background: 'var(--luna-card)'
                        }}>

                        <div className="flex justify-between items-center px-1">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#60a5fa] opacity-80">Subtotal: ₹{subtotal.toFixed(2)}</span>
                                <span className="text-[14px] font-black uppercase tracking-[0.1em]" style={textMain}>Terminal Total</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[22px] font-black tracking-tight" style={textMain}>
                                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* INSTITUTIONAL PAYMENT TOGGLE */}
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl border border-white/5 bg-slate-500/5 h-[42px]">
                            <button onClick={() => setPaymentMethod('cash')}
                                className={`rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'cash' ? 'bg-[#7c3aed] text-white shadow-md' : 'text-[#7c3aed]/70 hover:text-[#7c3aed]'}`}>
                                Settled
                            </button>
                            <button onClick={() => setPaymentMethod('credit')}
                                className={`rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'credit' ? 'bg-[#7c3aed] text-white shadow-md' : 'text-[#7c3aed]/70 hover:text-[#7c3aed]'}`}>
                                Credit
                            </button>
                        </div>

                        {/* INSTITUTIONAL ACTION TRIGGER */}
                        <button onClick={submitOrder}
                            disabled={cart.length === 0 || (customerType === 'registered' && !selectedPatientId) || (customerType === 'guest' && !guestName)}
                            className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-[#7c3aed]/20"
                            style={{
                                background: '#7c3aed',
                                color: 'white'
                            }}>
                            <Printer className="w-4 h-4 text-white/90" />
                            Finalize & Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlusCircle = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PackagePlus = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export default DispensaryPage;
