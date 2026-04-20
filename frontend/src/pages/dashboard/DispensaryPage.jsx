import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Search, CheckCircle, X, Plus, Trash2, User, ShoppingBag,
    RefreshCw, ClipboardList, Database, Pill, ShoppingCart, PackageOpen,
    Minus, Receipt, Hash, Clock, ChevronDown, ArrowRight, Save, CreditCard, UserCheck, AlertTriangle,
    Printer
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const DispensaryPage = ({ user }) => {
    const { theme } = useTheme();

    // Core Data
    const [prescriptions, setPrescriptions] = useState([]);
    const [pharmacyOrders, setPharmacyOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
    const [searchTermPatient, setSearchTermPatient] = useState('');
    const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);

    // Cart & Checkout State
    const [cart, setCart] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [customerType, setCustomerType] = useState('registered'); 
    const [guestName, setGuestName] = useState('');
    const [guestMobile, setGuestMobile] = useState('');
    const [relatedRxId, setRelatedRxId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
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
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isDispensed = useCallback((pId) => pharmacyOrders.some(o => o.prescription === pId && o.status === 'completed'), [pharmacyOrders]);
    const pendingRx = useMemo(() => prescriptions.filter(p => !isDispensed(p.id)), [prescriptions, isDispensed]);

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
            toast.success(`Prescription staged.`);
        }
    };

    const submitOrder = async () => {
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
            toast.success('Completed!', { id: 'txn' });
            setCart([]); setSelectedPatientId(''); setRelatedRxId(null);
            fetchData(true);
        } catch (e) { toast.error('Failed.', { id: 'txn' }); }
    };

    const textMain = { color: 'var(--luna-text-main)' };
    if (loading && inventory.length === 0) return <div className="h-full flex items-center justify-center p-20 opacity-30"><RefreshCw className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 antialiased">
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                
                <div className="w-[340px] flex flex-col rounded-2xl border shadow-sm overflow-hidden" 
                     style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <header className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-100">Queue</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {pendingRx.map(p => (
                            <button key={p.id} onClick={() => stageRx(p)}
                                className="w-full text-left p-4 rounded-2xl border transition-all hover:bg-white/5"
                                style={{ background: 'var(--luna-background-secondary)', borderColor: 'var(--luna-border)' }}>
                                <p className="text-[12px] font-black uppercase tracking-tight" style={textMain}>{p.patient_name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col rounded-2xl border shadow-sm overflow-hidden" 
                     style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <header className="p-7 border-b flex flex-col gap-6" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                        <div className="flex gap-4">
                           <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent p-3 border rounded-xl" />
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto px-7 py-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                                    <th className="py-4 pl-4 text-[10px] font-black uppercase w-[45%]">Description</th>
                                    <th className="py-4 text-[10px] font-black uppercase w-[15%]">Category</th>
                                    <th className="py-4 text-center w-[10%] text-[10px] font-black uppercase">Stock</th>
                                    <th className="py-4 text-right w-[15%] text-[10px] font-black uppercase">Price</th>
                                    <th className="py-4 pr-4 text-center w-[15%] text-[10px] font-black uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.filter(i => (i.name||'').toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                                    <tr key={item.id} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td className="py-4 pl-4 w-[45%] text-[13px] font-black uppercase" style={textMain}>{item.name}</td>
                                        <td className="w-[15%] text-[10px] font-black uppercase">{item.category}</td>
                                        <td className="text-center w-[10%] font-black">{item.stock_level}</td>
                                        <td className="text-right w-[15%] font-black">₹{item.unit_price}</td>
                                        <td className="text-center w-[15%]">
                                            <button onClick={() => addToCart(item)} className="p-2 bg-[var(--luna-primary)]/10 text-[var(--luna-primary)] rounded-full"><Plus className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="w-[380px] flex flex-col rounded-2xl border shadow-2xl overflow-hidden" 
                     style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <header className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                        <h1 className="text-[11px] font-black uppercase tracking-widest">Billing</h1>
                    </header>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
                        {cart.map(item => (
                            <div key={item.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-background-secondary)' }}>
                                <span className="text-[10px] font-black uppercase">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateCartQty(item.id, -1)}><Minus className="w-3 h-3" /></button>
                                    <span className="text-[10px] font-black">{item.qty}</span>
                                    <button onClick={() => updateCartQty(item.id, 1)}><Plus className="w-3 h-3" /></button>
                                </div>
                                <span className="text-[11px] font-black">₹{item.unit_price * item.qty}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t flex flex-col gap-4">
                        <div className="flex justify-between font-black">
                            <span className="text-[10px] uppercase opacity-40">Total</span>
                            <span className="text-xl">₹{total}</span>
                        </div>
                        <button onClick={submitOrder} className="w-full py-4 bg-[var(--luna-primary)] text-white font-black uppercase tracking-[0.2em] rounded-xl">Process</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DispensaryPage;
