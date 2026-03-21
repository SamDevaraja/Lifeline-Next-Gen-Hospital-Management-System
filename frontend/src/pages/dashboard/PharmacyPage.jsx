import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Pill, AlertCircle, Filter, X, RefreshCw,
    PackagePlus, ShoppingCart, TrendingUp, Archive, ChevronDown,
    Edit2, Trash2, PlusCircle, Activity, DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from './Constants';

const CATEGORIES = [
    'Analgesic', 'Antibiotic', 'Anti-inflammatory', 'Antiviral', 'Antifungal', 'Antidiabetic',
    'Antihypertensive', 'Cardiovascular', 'Gastrointestinal', 'Neurological',
    'Antiseptic', 'Statin', 'Vitamin/Supplement', 'Vaccine', 'IV Fluid', 'Surgical Supply', 'Other'
];

// ── Add / Edit Modal ──
const PharmacyModal = ({ isOpen, mode, item, onConfirm, onCancel }) => {
    const { theme } = useTheme();
    const [vals, setVals] = useState({
        name: '', category: 'Other', stock_level: '', unit_price: '',
        supplier: '', description: '', expiry_date: ''
    });

    useEffect(() => {
        if (item) {
            setVals({
                name: item.name || '',
                category: item.category || 'Other',
                stock_level: item.stock_level ?? '',
                unit_price: item.unit_price ?? '',
                supplier: item.supplier || '',
                description: item.description || '',
                expiry_date: item.expiry_date || ''
            });
        } else {
            setVals({ name: '', category: 'Other', stock_level: '', unit_price: '', supplier: '', description: '', expiry_date: '' });
        }
    }, [item, isOpen]);

    if (!isOpen) return null;

    const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none transition-all focus:ring-2 focus:ring-blue-500/20";
    const inputStyle = { background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--luna-border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.1)' }}>
                            <Pill className="w-4 h-4" style={{ color: LUNA.teal }} />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-wider" style={{ color: 'var(--luna-text-main)' }}>
                                {mode === 'create' ? 'Add New Medicine' : 'Edit Medicine'}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--luna-text-muted)' }}>
                                {mode === 'create' ? 'Register to pharmacy database' : 'Update inventory record'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 rounded-lg hover:bg-white/5 transition-all" style={{ color: 'var(--luna-text-muted)' }}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Row 1: Name + Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>Medicine Name *</label>
                            <input className={inputClass} style={inputStyle} placeholder="e.g. Paracetamol 500mg"
                                value={vals.name} onChange={e => setVals(v => ({ ...v, name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>Category *</label>
                            <select className={inputClass + " appearance-none cursor-pointer"} style={inputStyle}
                                value={vals.category} onChange={e => setVals(v => ({ ...v, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'var(--luna-card)' }}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Stock + Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>Stock Level (units) *</label>
                            <input className={inputClass} style={inputStyle} type="number" min="0" placeholder="100"
                                value={vals.stock_level} onChange={e => setVals(v => ({ ...v, stock_level: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>Unit Price (₹) *</label>
                            <input className={inputClass} style={inputStyle} type="number" min="0" step="0.01" placeholder="12.50"
                                value={vals.unit_price} onChange={e => setVals(v => ({ ...v, unit_price: e.target.value }))} />
                        </div>
                    </div>

                    {/* Row 3: Supplier + Expiry */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>Supplier</label>
                            <input className={inputClass} style={inputStyle} placeholder="e.g. Sun Pharma"
                                value={vals.supplier} onChange={e => setVals(v => ({ ...v, supplier: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>Expiry Date</label>
                            <input className={inputClass} style={inputStyle} type="date"
                                value={vals.expiry_date} onChange={e => setVals(v => ({ ...v, expiry_date: e.target.value }))} />
                        </div>
                    </div>

                    {/* Row 4: Description */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--luna-text-muted)' }}>Description / Notes</label>
                        <textarea className={inputClass + " resize-none h-20"} style={inputStyle} placeholder="Usage notes, dosage info..."
                            value={vals.description} onChange={e => setVals(v => ({ ...v, description: e.target.value }))} />
                    </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-white/5"
                        style={{ color: 'var(--luna-text-muted)', borderColor: 'var(--luna-border)' }}>Cancel</button>
                    <button onClick={() => onConfirm(vals)} className="flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:opacity-90"
                        style={{ background: 'var(--luna-blue)', color: '#fff' }}>
                        {mode === 'create' ? 'Add to Inventory' : 'Save Changes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ── Restock Modal ──
const RestockModal = ({ isOpen, item, onConfirm, onCancel }) => {
    const [qty, setQty] = useState('');
    useEffect(() => { if (isOpen) setQty(''); }, [isOpen]);
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--luna-border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                            <PackagePlus className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="font-black text-sm" style={{ color: 'var(--luna-text-main)' }}>Restock — {item.name}</p>
                            <p className="text-[10px] opacity-50" style={{ color: 'var(--luna-text-muted)' }}>Current: {item.stock_level} units</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--luna-text-muted)' }}>Units to Add</label>
                    <input type="number" min="1" placeholder="Enter quantity..."
                        className="w-full px-4 py-3 rounded-xl text-sm font-bold border outline-none focus:ring-2 focus:ring-emerald-500/20"
                        style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                        value={qty} onChange={e => setQty(e.target.value)} />
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-white/5"
                        style={{ color: 'var(--luna-text-muted)', borderColor: 'var(--luna-border)' }}>Cancel</button>
                    <button onClick={() => onConfirm(parseInt(qty))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all hover:opacity-90"
                        style={{ background: '#10b981' }}>
                        Add Stock
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ── Main Component ──
const PharmacyPage = ({ user }) => {
    const { theme } = useTheme();
    const role = (user?.role || '').toLowerCase();
    const canEdit = role === 'admin' || role === 'pharmacist';

    // Premium Corporate Color Palette mapped by theme
    const STATUS_COLORS = {
        Optimal: {
            bg: theme === 'dark' ? 'rgba(52,211,153,0.1)' : 'rgba(5,150,105,0.06)',
            text: theme === 'dark' ? '#34d399' : '#059669', // Emerald
            border: theme === 'dark' ? 'rgba(52,211,153,0.25)' : 'rgba(5,150,105,0.2)'
        },
        'Low Stock': {
            bg: theme === 'dark' ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.06)',
            text: theme === 'dark' ? '#fbbf24' : '#d97706', // Amber
            border: theme === 'dark' ? 'rgba(251,191,36,0.25)' : 'rgba(217,119,6,0.2)'
        },
        Critical: {
            bg: theme === 'dark' ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)',
            text: theme === 'dark' ? '#f87171' : '#dc2626', // Red
            border: theme === 'dark' ? 'rgba(248,113,113,0.25)' : 'rgba(220,38,38,0.2)'
        },
    };

    const chartColors = theme === 'dark'
        ? ['#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fbbf24', '#38bdf8']
        : ['#2563eb', '#059669', '#7c3aed', '#db2777', '#d97706', '#0284c7'];

    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState([]);
    const [prescriptionsToday, setPrescriptionsToday] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modal, setModal] = useState({ open: false, mode: 'create', item: null });
    const [restock, setRestock] = useState({ open: false, item: null });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

    const fetchAll = async () => {
        try {
            const [invRes, prescRes, summaryRes] = await Promise.all([
                api.get('pharmacy/'),
                api.get(`prescriptions/?date=${new Date().toISOString().split('T')[0]}`),
                api.get('pharmacy/summary/')
            ]);
            setItems(invRes.data);
            setPrescriptionsToday(prescRes.data.length);
            setSummary(summaryRes.data.slice(0, 6)); // Top 6 categories for chart
        } catch (err) {
            console.error('Pharmacy sync error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleSave = async (vals) => {
        const { name, category, stock_level, unit_price, supplier, description, expiry_date } = vals;
        if (!name || !category || !stock_level || !unit_price) {
            toast.error('Name, category, stock and price are required.');
            return;
        }
        const id = modal.mode === 'create' ? 'add' : 'edit';
        try {
            toast.loading(modal.mode === 'create' ? 'Adding medicine...' : 'Updating record...', { id });
            const payload = {
                name, category,
                stock_level: parseInt(stock_level),
                unit_price: parseFloat(unit_price),
                supplier: supplier || '',
                description: description || '',
                expiry_date: expiry_date || null
            };
            if (modal.mode === 'create') {
                await api.post('pharmacy/', payload);
                toast.success('Medicine added to inventory.', { id });
            } else {
                await api.patch(`pharmacy/${modal.item.id}/`, payload);
                toast.success('Inventory record updated.', { id });
            }
            setModal({ open: false, mode: 'create', item: null });
            fetchAll();
        } catch (err) {
            const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            toast.error(`Operation failed: ${serverMsg}`, { id: modal.mode === 'create' ? 'add' : 'edit' });
        }
    };

    const handleRestock = async (qty) => {
        if (!qty || qty <= 0) { toast.error('Enter a valid quantity.'); return; }
        try {
            toast.loading('Restocking...', { id: 'restock' });
            const res = await api.post(`pharmacy/${restock.item.id}/restock/`, { quantity: qty });
            toast.success(res.data.message, { id: 'restock' });
            setRestock({ open: false, item: null });
            fetchAll();
        } catch (err) {
            toast.error('Restock failed.', { id: 'restock' });
        }
    };

    const handleDelete = async () => {
        try {
            toast.loading('Removing item...', { id: 'del' });
            await api.delete(`pharmacy/${confirmDelete.id}/`);
            toast.success(`${confirmDelete.name} removed from inventory.`, { id: 'del' });
            setConfirmDelete({ open: false, id: null, name: '' });
            fetchAll();
        } catch (err) {
            toast.error('Deletion failed.', { id: 'del' });
        }
    };

    const filtered = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return items.filter(m => {
            if (!m) return false;
            const s = (search || '').toLowerCase();
            const safeName = (m.name || '').toLowerCase();
            const safeCat = (m.category || '').toLowerCase();
            const safeSupplier = (m.supplier || '').toLowerCase();
            const safeStatus = (m.status || '').toLowerCase();

            const matchSearch = safeName.includes(s) || safeCat.includes(s) || safeSupplier.includes(s);
            const matchCat = categoryFilter === 'all' || (m.category === categoryFilter);
            const matchStatusFilter = statusFilter === 'all' || safeStatus === (statusFilter || '').toLowerCase();

            return matchSearch && matchCat && matchStatusFilter;
        });
    }, [items, search, categoryFilter, statusFilter]);

    const stats = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : [];
        return {
            total: safeItems.length,
            totalUnits: safeItems.reduce((a, b) => a + (b?.stock_level || 0), 0),
            optimal: safeItems.filter(m => m?.status === 'Optimal').length,
            lowStock: safeItems.filter(m => m?.status === 'Low Stock').length,
            critical: safeItems.filter(m => m?.status === 'Critical').length,
            totalValue: safeItems.reduce((a, b) => a + ((b?.stock_level || 0) * (parseFloat(b?.unit_price) || 0)), 0),
        };
    }, [items]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 w-full max-w-7xl mx-auto overflow-x-hidden pb-10">
            {/* ── Modals ── */}
            <AnimatePresence>
                {modal.open && (
                    <PharmacyModal isOpen={modal.open} mode={modal.mode} item={modal.item}
                        onConfirm={handleSave}
                        onCancel={() => setModal({ open: false, mode: 'create', item: null })} />
                )}
                {restock.open && (
                    <RestockModal isOpen={restock.open} item={restock.item}
                        onConfirm={handleRestock}
                        onCancel={() => setRestock({ open: false, item: null })} />
                )}
                {confirmDelete.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                            style={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)' }}>
                            <p className="font-black text-base mb-2" style={{ color: 'var(--luna-text-main)' }}>Remove Medicine?</p>
                            <p className="text-sm mb-6" style={{ color: 'var(--luna-text-muted)' }}>
                                This will permanently remove <strong>{confirmDelete.name}</strong> from the pharmacy database.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmDelete({ open: false, id: null, name: '' })}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border hover:bg-white/5 transition-all"
                                    style={{ color: 'var(--luna-text-muted)', borderColor: 'var(--luna-border)' }}>Cancel</button>
                                <button onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                                    style={{ background: '#ef4444' }}>Remove</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl md:text-3xl font-extrabold uppercase tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        Pharmacy & Inventory
                    </h1>
                    <p className="text-sm font-medium mt-1.5" style={{ color: 'var(--luna-text-muted)' }}>
                        Medicine categorization • Unit pricing • Real-time stock levels
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end flex-1">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: LUNA.teal }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicines..."
                            className="pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none font-semibold w-52"
                            style={{ background: 'var(--luna-navy)', color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }} />
                    </div>
                    {/* Category filter */}
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-xs font-black border outline-none cursor-pointer uppercase tracking-wider appearance-none"
                        style={{ background: 'var(--luna-navy)', color: theme === 'dark' ? 'white' : LUNA.teal, borderColor: 'var(--luna-border)' }}>
                        <option value="all" style={{ background: 'var(--luna-card)' }}>All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'var(--luna-card)' }}>{c}</option>)}
                    </select>
                    {/* Status filter */}
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-xs font-black border outline-none cursor-pointer uppercase tracking-wider appearance-none"
                        style={{ background: 'var(--luna-navy)', color: theme === 'dark' ? 'white' : LUNA.teal, borderColor: 'var(--luna-border)' }}>
                        {['all', 'Optimal', 'Low Stock', 'Critical'].map(f => (
                            <option key={f} value={f} style={{ background: 'var(--luna-card)' }}>{f === 'all' ? 'All Status' : f}</option>
                        ))}
                    </select>
                    {/* Add Button */}
                    {canEdit && (
                        <button onClick={() => setModal({ open: true, mode: 'create', item: null })}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:opacity-90 shadow-lg"
                            style={{ background: 'var(--luna-blue)' }}>
                            <Plus className="w-4 h-4" /> Add Medicine
                        </button>
                    )}
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Total Items', value: stats.total, color: theme === 'dark' ? '#94a3b8' : '#475569' },
                    { label: 'Total Units', value: stats.totalUnits.toLocaleString(), color: theme === 'dark' ? '#60a5fa' : '#2563eb' },
                    { label: 'Optimal', value: stats.optimal, color: STATUS_COLORS['Optimal'].text },
                    { label: 'Low Stock', value: stats.lowStock, color: STATUS_COLORS['Low Stock'].text },
                    { label: 'Critical', value: stats.critical, color: STATUS_COLORS['Critical'].text },
                    { label: 'Stock Value', value: <span className="flex items-baseline"><span className="text-xl font-bold opacity-70 tracking-normal mr-0.5">₹</span>{(stats.totalValue / 1000).toFixed(1)}k</span>, color: STATUS_COLORS['Optimal'].text },
                ].map((s, i) => (
                    <div key={i} className="py-6 px-4 rounded-xl border flex flex-col items-center justify-center transition-all shadow-sm"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div className="text-4xl font-black tracking-tighter flex justify-center" style={{ color: s.color }}>{s.value}</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: 'var(--luna-text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Chart + Prescriptions today ── */}
            {summary.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 card border" style={{ borderColor: 'var(--luna-border)' }}>
                        <p className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: 'var(--luna-text-main)' }}>
                            Stock by Category
                        </p>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={summary} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--luna-border)" />
                                <XAxis dataKey="category" tick={{ fontSize: 9, fill: 'var(--luna-text-muted)', fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fill: 'var(--luna-text-muted)' }} />
                                <Tooltip
                                    cursor={false}
                                    contentStyle={{
                                        backgroundColor: 'var(--luna-card)',
                                        borderColor: 'var(--luna-border)',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                        color: 'var(--luna-text-main)',
                                        fontWeight: 'bold',
                                        fontSize: '13px',
                                        padding: '8px 14px'
                                    }}
                                    itemStyle={{ color: 'var(--luna-text-main)', fontSize: '12px', padding: 0, marginTop: '2px' }}
                                    labelStyle={{ color: 'var(--luna-text-main)', fontWeight: 800, fontSize: '13px', marginBottom: '2px' }}
                                    formatter={(value) => [value, 'Units']}
                                />
                                <Bar dataKey="total_units" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                    {summary.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card border flex flex-col justify-between" style={{ borderColor: 'var(--luna-border)' }}>
                        <div>
                            <p className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: 'var(--luna-text-main)' }}>Today's Dispensing</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--luna-text-muted)' }}>Prescriptions filled today</p>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                            <p className="text-5xl font-black" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}>{prescriptionsToday}</p>
                            <ShoppingCart className="w-10 h-10 opacity-10" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />
                        </div>
                        <div className="mt-4">
                            <div className="w-full h-2.5 rounded-full" style={{ background: 'var(--luna-navy)' }}>
                                <div className="h-2.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((prescriptionsToday / 20) * 100, 100)}%`, background: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />
                            </div>
                            <p className="text-[9px] font-black mt-1 tracking-widest" style={{ color: 'var(--luna-text-dim)' }}>
                                Target: 20 prescriptions/day
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Inventory Table ── */}
            <div className="card p-0 border shadow-sm w-full relative overflow-hidden" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-card)' }}>
                <div className="w-full">
                    <table className="table-clinical w-full text-left table-fixed">
                        <thead>
                            <tr style={{ background: 'var(--luna-navy)' }}>
                                <th className="text-left pl-6 pr-1 py-3 whitespace-nowrap w-[22%]">Medicine</th>
                                <th className="text-left pl-2 py-3 pr-1 whitespace-nowrap w-[12%]">Category</th>
                                <th className="text-center py-3 px-1 whitespace-nowrap w-[8%]">Stock</th>
                                <th className="text-center py-3 px-1 whitespace-nowrap w-[10%]">Price</th>
                                <th className="text-center py-3 px-1 whitespace-nowrap w-[14%]">Supplier</th>
                                <th className="text-center py-3 px-1 whitespace-nowrap w-[11%]">Expiry</th>
                                <th className="text-center py-3 px-1 whitespace-nowrap w-[12%]">Status</th>
                                <th className="text-center py-3 px-1 whitespace-nowrap w-[11%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="8" className="px-5 py-4">
                                            <div className="animate-pulse h-5 rounded-lg w-full" style={{ background: 'var(--luna-navy)' }} />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered && filtered.length > 0 ? (
                                filtered.map((m) => {
                                    if (!m) return null;
                                    const safeName = m.name || 'Unknown';
                                    const safeInitial = safeName.charAt(0).toUpperCase();
                                    const statusKey = m.status || 'Critical';
                                    const sc = STATUS_COLORS[statusKey] || STATUS_COLORS['Critical'];
                                    const isExpiringSoon = m.expiry_date && new Date(m.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                                    return (
                                        <tr key={m.id || Math.random()} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                            <td className="pl-6 pr-2 py-3 text-left align-middle" title={`${safeName}${m.description ? ' — ' + m.description : ''}`}>
                                                <div className="flex items-center justify-start gap-3 w-full">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm shrink-0 uppercase"
                                                        style={{ background: LUNA.info_bg, color: LUNA.info_text, borderColor: 'var(--luna-border)' }}>
                                                        {safeInitial}
                                                    </div>
                                                    <div className="text-left w-full max-w-[120px] xl:max-w-[160px]">
                                                        <p className="font-extrabold text-[13px] leading-tight truncate" style={{ color: 'var(--luna-text-main)' }}>{safeName}</p>
                                                        {m.description ? <p className="text-[10px] opacity-60 font-medium mt-0.5 truncate" style={{ color: 'var(--luna-text-muted)' }}>{m.description}</p> : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-left pl-2 pr-1 py-3 align-middle" title={m.category || 'Other'}>
                                                <span className="text-[9px] font-black px-2.5 py-1 rounded-md border uppercase tracking-widest inline-block max-w-[70px] xl:max-w-[100px] truncate align-middle"
                                                    style={{ color: LUNA.info_text, background: LUNA.info_bg, border: `1px solid rgba(59,130,246,0.15)` }}>
                                                    {m.category || 'Other'}
                                                </span>
                                            </td>
                                            <td className="text-center px-1 py-3 align-middle">
                                                <span className="font-black text-[15px] tracking-tight text-center block whitespace-nowrap mx-auto" style={{ color: 'var(--luna-text-main)' }}>{(m.stock_level || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="text-center px-2 font-black text-sm py-3 whitespace-nowrap align-middle" style={{ color: 'var(--luna-text-main)' }}>
                                                <span className="opacity-50 mr-0.5">₹</span>{(parseFloat(m.unit_price) || 0).toFixed(2)}
                                            </td>
                                            <td className="text-center px-2 text-[11px] font-bold py-3 align-middle mx-auto" style={{ color: 'var(--luna-text-muted)' }}>
                                                {m.supplier || '—'}
                                            </td>
                                            <td className="text-center px-2 py-3 align-middle">
                                                {m.expiry_date ? (
                                                    <span className={`inline-flex items-center justify-center gap-1.5 text-[10px] whitespace-nowrap font-black px-2 py-1 rounded-md tracking-wider mx-auto ${isExpiringSoon ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-transparent text-[var(--luna-text-muted)]'}`}>
                                                        {isExpiringSoon && <AlertCircle className="w-3 h-3 shrink-0" />}
                                                        <span>{m.expiry_date}</span>
                                                    </span>
                                                ) : <span className="opacity-30 text-[10px] font-bold mx-auto">—</span>}
                                            </td>
                                            <td className="text-center px-2 py-3">
                                                <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 font-black uppercase tracking-widest shadow-sm mx-auto whitespace-nowrap"
                                                    style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontSize: '9px', borderRadius: '4px' }}>
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusKey !== 'Optimal' ? 'animate-pulse' : ''}`}
                                                        style={{ background: sc.text }} />
                                                    <span>{statusKey}</span>
                                                </span>
                                            </td>
                                            <td className="text-center px-2 py-3">
                                                {canEdit ? (
                                                    <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity mx-auto whitespace-nowrap">
                                                        <button onClick={(e) => { e.stopPropagation(); setRestock({ open: true, item: m }); }} title="Restock"
                                                            className="p-1.5 rounded-lg border transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:-translate-y-0.5"
                                                            style={{ color: '#10b981', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                            <PackagePlus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setModal({ open: true, mode: 'EDIT', item: m }); }} title="Edit"
                                                            className="p-1.5 rounded-lg border transition-all hover:bg-blue-500/10 hover:border-blue-500/30 hover:-translate-y-0.5"
                                                            style={{ color: '#3b82f6', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: m.id, name: m.name }); }} title="Remove"
                                                            className="p-1.5 rounded-lg border transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:-translate-y-0.5"
                                                            style={{ color: '#ef4444', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="opacity-30 text-[10px] font-bold">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--luna-navy)' }}>
                                                <Pill className="w-6 h-6 opacity-40" style={{ color: LUNA.teal }} />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-muted)' }}>
                                                No inventory matching filters
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default PharmacyPage;