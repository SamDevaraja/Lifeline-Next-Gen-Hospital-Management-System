import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Pill, Search, Plus, Filter, AlertCircle, ShoppingCart, PackagePlus, Edit2, Trash2, Activity, ChevronRight, BarChart3, FlaskConical, TrendingUp, Archive
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from './Constants';
import { ConfirmModal, InputModal } from './Modals';

const CATEGORIES = [
    'Analgesic', 'Antibiotic', 'Anti-inflammatory', 'Antiviral', 'Antifungal', 'Antidiabetic',
    'Antihypertensive', 'Cardiovascular', 'Gastrointestinal', 'Neurological',
    'Antiseptic', 'Statin', 'Vitamin/Supplement', 'Vaccine', 'IV Fluid', 'Surgical Supply', 'Other'
];

const PharmacyPage = ({ user }) => {
    const { theme } = useTheme();
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState([]);
    const [prescriptionsToday, setPrescriptionsToday] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    // UI Modal State
    const [itemModal, setItemModal] = useState({ open: false, mode: 'create', item: null });
    const [restockModal, setRestockModal] = useState({ open: false, item: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [invRes, prescRes, summaryRes] = await Promise.all([
                api.get('pharmacy/'),
                api.get(`prescriptions/?date=${new Date().toISOString().split('T')[0]}`),
                api.get('pharmacy/summary/')
            ]);
            setItems(invRes.data);
            setPrescriptionsToday(prescRes.data.length);
            setSummary(summaryRes.data.slice(0, 6)); 
        } catch (err) {
            console.error('Pharmacy sync error', err);
            toast.error("Inventory sync failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const filtered = useMemo(() => {
        return (items || []).filter(m => {
            const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
                                 (m.category || '').toLowerCase().includes(search.toLowerCase());
            const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
            return matchesSearch && matchesCat;
        });
    }, [items, search, categoryFilter]);

    const stats = useMemo(() => {
        const si = items || [];
        return {
            total: si.length,
            low: si.filter(m => m.status === 'Low Stock').length,
            critical: si.filter(m => m.status === 'Critical').length,
            value: si.reduce((a, b) => a + ((b.stock_level || 0) * (parseFloat(b.unit_price) || 0)), 0),
        };
    }, [items]);

    const handleSave = async (vals) => {
        const id = itemModal.mode === 'create' ? 'add' : 'edit';
        try {
            toast.loading(itemModal.mode === 'create' ? 'Adding medicine...' : 'Updating record...', { id });
            const payload = {
                ...vals,
                stock_level: parseInt(vals.stock_level),
                unit_price: parseFloat(vals.unit_price)
            };
            if (itemModal.mode === 'create') {
                await api.post('pharmacy/', payload);
            } else {
                await api.patch(`pharmacy/${itemModal.item.id}/`, payload);
            }
            toast.success("Inventory updated.", { id });
            setItemModal({ open: false });
            fetchAll();
        } catch (err) {
            toast.error("Operation failed.", { id });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Toaster position="top-right" />
            
            {/* Modal Layer */}
            <InputModal 
                isOpen={itemModal.open}
                title={itemModal.mode === 'create' ? 'Register New Medicine' : 'Edit Medicine Dossier'}
                fields={[
                    { key: 'name', label: 'Medicine Name', type: 'text', initialValue: itemModal.item?.name, fullWidth: true },
                    { key: 'category', label: 'Category', type: 'select', options: CATEGORIES.map(c => ({ value: c, label: c })), initialValue: itemModal.item?.category },
                    { key: 'unit_price', label: 'Unit Price (₹)', type: 'number', initialValue: itemModal.item?.unit_price },
                    { key: 'stock_level', label: 'Initial Stock Level', type: 'number', initialValue: itemModal.item?.stock_level },
                    { key: 'expiry_date', label: 'Expiry Date', type: 'date', initialValue: itemModal.item?.expiry_date },
                    { key: 'supplier', label: 'Supplier Name', type: 'text', initialValue: itemModal.item?.supplier, fullWidth: true },
                ]}
                onConfirm={handleSave}
                onCancel={() => setItemModal({ open: false })}
            />

            <ConfirmModal 
                isOpen={deleteModal.open}
                title="Decommission Medicine"
                message={`Are you sure you want to remove ${deleteModal.name} from the pharmacy inventory? This action is permanent.`}
                onConfirm={async () => {
                    try {
                        await api.delete(`pharmacy/${deleteModal.id}/`);
                        toast.success("Item removed.");
                        setDeleteModal({ open: false });
                        fetchAll();
                    } catch (e) { toast.error("Removal failed."); }
                }}
                onCancel={() => setDeleteModal({ open: false })}
            />

            {/* Standard Project Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Pharmacy Inventory</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                        Institutional Drug Registry • Real-time Procurement Sync
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 opacity-30" style={{ color: LUNA.teal }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Scoping inventory..."
                            className="w-48 md:w-64 pl-12 py-3 text-sm rounded-xl outline-none border transition-all font-bold tracking-tight focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20"
                            style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }} />
                    </div>
                    <button onClick={() => setItemModal({ open: true, mode: 'create', item: null })} 
                        className="btn-primary text-[10px] font-black uppercase tracking-widest px-6 h-[46px] flex items-center gap-2 shadow-xl">
                        <Plus className="w-4 h-4" /> Procure Stock
                    </button>
                </div>
            </div>

            {/* Institutional Stat Matrix - Museum Clean Edition */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Medicine SKUs', value: stats.total, color: 'var(--luna-blue)', icon: <Pill className="w-6 h-6"/> },
                    { label: 'Low Stock Alerts', value: stats.low, color: '#f59e0b', icon: <AlertCircle className="w-6 h-6"/> },
                    { label: 'Critical Depletion', value: stats.critical, color: '#ef4444', icon: <Activity className="w-6 h-6"/> },
                    { label: 'Today Dispensed', value: prescriptionsToday, color: '#10b981', icon: <ShoppingCart className="w-6 h-6"/> },
                ].map((s, i) => (
                    <div key={i} className="card p-6 flex items-center gap-5 border shadow-sm"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        
                        {/* Professional Icon Bucket */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black border shadow-inner shrink-0"
                            style={{ background: 'var(--luna-navy)', color: s.color, borderColor: 'var(--luna-border)' }}>
                            {s.icon}
                        </div>
                        
                        {/* Data Stack - Vertically Centered */}
                        <div className="flex flex-col justify-center">
                            <p className="text-[12px] font-extrabold uppercase opacity-40 mb-1" style={{ color: 'var(--luna-text-main)' }}>{s.label}</p>
                            <h3 className="text-3xl font-black tracking-tighter leading-none" style={{ color: 'var(--luna-text-main)' }}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inventory Ledger - Perfect Alignment Unified Table Format */}
            <div className="card overflow-hidden p-0 shadow-2xl rounded-2xl border" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'var(--luna-navy)', borderBottom: '1px solid var(--luna-border)' }}>
                                <th className="pl-10 pr-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Medicine</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Category</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60 text-center" style={{ color: 'var(--luna-text-main)' }}>Stock</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Price</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.25em] opacity-60 text-center" style={{ color: 'var(--luna-text-main)' }}>Status</th>
                                <th className="pr-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: 'var(--luna-text-main)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan="6" className="px-8 py-8"><div className="animate-pulse h-10 rounded-2xl w-full" style={{ background: 'var(--luna-navy)' }} /></td></tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-28 font-medium italic" style={{ color: LUNA.steel }}>
                                        <div className="flex flex-col items-center gap-4">
                                            <Archive className="w-10 h-10 opacity-10" />
                                            <span>Zero inventory matches identified</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((m, i) => (
                                <tr key={m.id || i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <td className="pl-8 pr-4 py-4">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner shrink-0 uppercase border"
                                                style={{ background: 'var(--luna-navy)', color: i % 2 === 0 ? '#14b8a6' : '#2563eb', borderColor: 'var(--luna-border)' }}>
                                                {m.name?.[0] || 'M'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-extrabold text-[14px]" style={{ color: 'var(--luna-text-main)' }}>{m.name}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>
                                                    Batch-{String(m.id).padStart(4, '0')} • Exp: {m.expiry_date || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border" 
                                            style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--luna-blue)' }}>
                                            {m.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <p className="font-black text-[15px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{m.stock_level}</p>
                                        <p className="text-[8px] font-black uppercase opacity-30 mt-0.5">Units / Packs</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <p className="font-extrabold text-[14px] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>₹{parseFloat(m.unit_price).toFixed(2)}</p>
                                        <p className="text-[8px] font-black uppercase opacity-30 mt-0.5">Base Rate</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
                                            m.status === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                            m.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                            {m.status || 'Optimal'}
                                        </span>
                                    </td>
                                    <td className="pr-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setItemModal({ open: true, mode: 'edit', item: m })} 
                                                className="p-2.5 rounded-xl border transition-all hover:bg-blue-600 hover:text-white"
                                                style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: 'var(--luna-text-main)' }}>
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setDeleteModal({ open: true, id: m.id, name: m.name })} 
                                                className="p-2.5 rounded-xl border transition-all hover:bg-red-600 hover:text-white"
                                                style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)', color: '#ef4444' }}>
                                                <Trash2 className="w-3.5 h-3.5" />
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

export default PharmacyPage;