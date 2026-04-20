import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill, Search, Plus, Filter, AlertCircle, ShoppingCart, Edit2, Trash2, ChevronRight, RefreshCw, Box, Archive, Table as TableIcon
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { LUNA } from './Constants';
import { ConfirmModal, InputModal, DetailsModal } from './Modals';

const CATEGORIES = [
    'Analgesic', 'Antibiotic', 'Anti-inflammatory', 'Antiviral', 'Antifungal', 'Antidiabetic',
    'Antihypertensive', 'Cardiovascular', 'Gastrointestinal', 'Neurological',
    'Antiseptic', 'Statin', 'Vitamin/Supplement', 'Vaccine', 'IV Fluid', 'Surgical Supply', 'Other'
];

const PharmacyPage = ({ user }) => {
    const { theme } = useTheme();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // UI Modal State
    const [itemModal, setItemModal] = useState({ open: false, mode: 'create', item: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    const [viewModal, setViewModal] = useState({ open: false, item: null });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await api.get('pharmacy/');
            setItems(res.data);
        } catch (err) {
            toast.error("Failed to sync inventory.");
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
        };
    }, [items]);

    const handleSave = async (vals) => {
        const id = itemModal.mode === 'create' ? 'add' : 'edit';
        try {
            toast.loading(itemModal.mode === 'create' ? 'Adding item...' : 'Updating record...', { id });
            const payload = {
                ...vals,
                stock_level: parseInt(vals.stock_level) || 0,
                unit_price: parseFloat(vals.unit_price) || 0
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
        <div className="min-h-full w-full" style={{ background: 'var(--luna-bg)', color: 'var(--luna-text-main)' }}>
        <div className="max-w-[1600px] mx-auto px-6 pt-1 pb-6 font-sans space-y-6">
                <Toaster position="top-right" />

                {/* Modals */}
                <InputModal
                    isOpen={itemModal.open}
                    title={itemModal.mode === 'create' ? 'Add New Item' : 'Edit Item'}
                    fields={[
                        { key: 'name', label: 'Medicine Name', type: 'text', initialValue: itemModal.item?.name, fullWidth: true },
                        { key: 'category', label: 'Category', type: 'select', options: CATEGORIES.map(c => ({ value: c, label: c })), initialValue: itemModal.item?.category },
                        { key: 'unit_price', label: 'Unit Price', type: 'number', initialValue: itemModal.item?.unit_price },
                        { key: 'stock_level', label: 'Stock Level', type: 'number', initialValue: itemModal.item?.stock_level },
                        { key: 'expiry_date', label: 'Expiry Date', type: 'date', initialValue: itemModal.item?.expiry_date },
                        { key: 'supplier', label: 'Supplier', type: 'text', initialValue: itemModal.item?.supplier, fullWidth: true },
                    ]}
                    onConfirm={handleSave}
                    onCancel={() => setItemModal({ open: false })}
                />

                <ConfirmModal
                    isOpen={deleteModal.open}
                    title="Delete Item"
                    message={`Are you sure you want to delete ${deleteModal.name}?`}
                    onConfirm={async () => {
                        try {
                            await api.delete(`pharmacy/${deleteModal.id}/`);
                            toast.success("Item deleted.");
                            setDeleteModal({ open: false });
                            fetchAll();
                        } catch (e) { toast.error("Delete failed."); }
                    }}
                    onCancel={() => setDeleteModal({ open: false })}
                />

                <DetailsModal
                    isOpen={viewModal.open}
                    title="Medicine Details"
                    data={viewModal.item}
                    onCancel={() => setViewModal({ open: false })}
                />

                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-transform hover:scale-105" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                            <Pill className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Pharmacy Inventory</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Lead Specialist • Departmental Terminal</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative group w-full lg:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-all text-blue-500" />
                            <input 
                                type="text"
                                placeholder="Scan inventory..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 text-[10px] border rounded-xl outline-none transition-all font-bold tracking-tight bg-[var(--luna-card)] hover:border-blue-500/30 focus:border-blue-500/50 shadow-sm"
                                style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                            />
                        </div>
                        <div className="relative w-full sm:min-w-[150px] sm:w-auto">
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 text-[10px] border rounded-xl appearance-none cursor-pointer focus:outline-none bg-[var(--luna-card)] font-bold tracking-tight shadow-sm hover:border-blue-500/30"
                                style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                            >
                                <option value="all">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30 pointer-events-none rotate-90" />
                        </div>
                        {user?.role !== 'doctor' && (
                            <button
                                onClick={() => setItemModal({ open: true, mode: 'create', item: null })}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--luna-blue)] to-[#1e4ed8] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
                            >
                                <Plus className="w-3.5 h-3.5 stroke-[3px]" /> Add Item
                            </button>
                        )}
                    </div>
                </header>

                {/* Minimal Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Medicines', value: stats.total, color: 'var(--luna-teal)' },
                        { label: 'Low Stock', value: stats.low, color: '#f59e0b' },
                        { label: 'Critical', value: stats.critical, color: '#ef4444' },
                        { label: 'Types', value: CATEGORIES.length, color: '#6366f1' },
                    ].map((s, i) => (
                        <div key={i} className="p-4 border rounded-xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Clean Inventory Table */}
                <div className="border rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b" style={{ borderColor: 'var(--luna-border)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] w-[40%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Medicine Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] hidden sm:table-cell w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center hidden sm:table-cell w-[10%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Stock</th>
                                    {user?.role !== 'doctor' && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center hidden sm:table-cell w-[10%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Price</th>}
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center hidden sm:table-cell w-[15%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status</th>
                                    {user?.role !== 'doctor' && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right w-[10%]" style={{ color: 'var(--luna-text-dim)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                            <td colSpan="6" className="px-6 py-8 animate-pulse text-center opacity-40 text-xs font-bold uppercase tracking-widest">
                                                Synchronizing Clinical Data...
                                            </td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-28 text-center" style={{ color: 'var(--luna-text-main)' }}>
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
                                ) : filtered.map((m) => (
                                    <tr key={m.id} className="border-b hover:bg-[var(--luna-navy)] transition-colors" style={{ borderColor: 'var(--luna-border)' }}>
                                        <td className="px-6 py-4 w-[40%]">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer"
                                                onClick={() => setViewModal({ open: true, item: m })}
                                            >
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 shadow-sm"
                                                    style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                                    <Pill className="w-4 h-4 opacity-40" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{m.name}</p>
                                                    <p className="text-[10px] opacity-40">Exp: {m.expiry_date || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell w-[15%]">
                                            <span className="text-[11px] font-semibold px-3 py-1 rounded-lg border capitalize shadow-sm transition-all"
                                                style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                                                {m.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-sm hidden sm:table-cell w-[10%]">{m.stock_level}</td>
                                        {user?.role !== 'doctor' && <td className="px-6 py-4 text-center font-semibold text-sm hidden sm:table-cell w-[10%]">₹{parseFloat(m.unit_price).toLocaleString()}</td>}
                                        <td className="px-6 py-4 text-center hidden sm:table-cell w-[15%]">
                                            <span className={`${m.status === 'Critical' ? 'badge-danger' :
                                                    m.status === 'Low Stock' ? 'badge-warn' :
                                                        'badge-success'}`}
                                                style={{ fontFamily: "'Inter', sans-serif", fontWeight: '700', letterSpacing: '0.05em', fontSize: '9px' }}>
                                                {m.status || 'Optimal'}
                                            </span>
                                        </td>
                                        {user?.role !== 'doctor' && (
                                            <td className="px-6 py-4 text-right w-[10%]">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setItemModal({ open: true, mode: 'edit', item: m })} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setDeleteModal({ open: true, id: m.id, name: m.name })} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors opacity-40 hover:opacity-100">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Link: Keep it centered and minimal */}
                <div className="text-center pb-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Pharmacy Inventory Management System V1.0</p>
                </div>
            </div>
        </div>
    );
};

export default PharmacyPage;