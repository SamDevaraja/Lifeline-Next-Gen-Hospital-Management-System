import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, X, Activity, Calendar, FileText, FlaskConical, 
    Wallet, Settings, User, BellRing, ChevronRight, Clock,
    CornerDownLeft, Box, LayoutGrid, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const SearchModal = ({ isOpen, onClose, userRole = 'doctor' }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { theme } = useTheme();

    const isPatient = userRole === 'patient';
    const baseUrl = isPatient ? '/patient/dashboard' : '/dashboard';

    const navigationItems = useMemo(() => [
        { label: 'Patient Registry', to: `/dashboard/patients`, icon: <User className="w-4 h-4" />, category: 'Navigation', desc: 'Manage patient database' },
        { label: 'Dashboard Overview', to: `/dashboard`, icon: <Activity className="w-4 h-4" />, category: 'Navigation', desc: 'Main system overview' },
        { label: 'Appointments List', to: `/dashboard/appointments`, icon: <Calendar className="w-4 h-4" />, category: 'Clinical', desc: 'View and manage schedule' },
        { label: 'Medical Records', to: `/dashboard/records`, icon: <FileText className="w-4 h-4" />, category: 'Clinical', desc: 'Access medical history' },
        { label: 'Pharmacy Inventory', to: `/dashboard/pharmacy`, icon: <Box className="w-4 h-4" />, category: 'Clinical', desc: 'Stock and prescriptions' },
        { label: 'Laboratory Results', to: `/dashboard/lab`, icon: <FlaskConical className="w-4 h-4" />, category: 'Clinical', desc: 'Diagnostic test reports' },
        { label: 'Billing & Invoices', to: `/dashboard/billing`, icon: <Wallet className="w-4 h-4" />, category: 'Finance', desc: 'Payments and accounts' },
        { label: 'System Reports', to: `/dashboard/reports`, icon: <BarChart3 className="w-4 h-4" />, category: 'Analytics', desc: 'Hospital performance metrics' },
        { label: 'Account Settings', to: `/dashboard/settings`, icon: <Settings className="w-4 h-4" />, category: 'Account', desc: 'Profile and preferences' },
    ].filter(item => {
        if (isPatient && item.to === '/dashboard/reports') return false;
        return true;
    }), [isPatient]);

    const filteredItems = useMemo(() => {
        if (!query) return navigationItems;
        return navigationItems.filter(item => 
            item.label.toLowerCase().includes(query.toLowerCase()) || 
            item.category.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, navigationItems]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredItems.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            }
            if (e.key === 'Enter' && filteredItems[selectedIndex]) {
                navigate(filteredItems[selectedIndex].to);
                onClose();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, filteredItems, selectedIndex, navigate]);

    if (!isOpen) return null;

    const categories = Array.from(new Set(filteredItems.map(i => i.category)));

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 sm:pt-40">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={onClose} 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            
            <motion.div 
                initial={{ scale: 0.98, opacity: 0, y: -10 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.98, opacity: 0, y: -10 }}
                className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border relative z-10 flex flex-col"
                style={{ 
                    background: 'var(--luna-card)', 
                    borderColor: 'var(--luna-border)',
                }}
            >
                {/* Search Bar */}
                <div className="px-5 py-4 border-b flex items-center gap-4" style={{ borderColor: 'var(--luna-border)' }}>
                    <Search className="w-5 h-5 opacity-40" style={{ color: 'var(--luna-teal)' }} />
                    <input 
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for pages and patient records..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:opacity-30"
                        style={{ color: 'var(--luna-text-main)' }}
                    />
                    <div className="flex items-center gap-2 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 opacity-40">
                        <span className="text-[10px] font-black uppercase tracking-tighter">ESC</span>
                    </div>
                </div>

                {/* Results Area */}
                <div className="p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="py-12 text-center text-[var(--luna-text-dim)]">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40">No matching pages found</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {categories.map(cat => (
                                <div key={cat} className="space-y-1">
                                    <p className="px-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-30" style={{ color: 'var(--luna-teal)' }}>{cat}</p>
                                    <div className="grid grid-cols-1">
                                        {filteredItems.filter(i => i.category === cat).map((item, i) => {
                                            const globalIdx = filteredItems.indexOf(item);
                                            const isActive = globalIdx === selectedIndex;
                                            return (
                                                <button
                                                    key={item.to}
                                                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                    onClick={() => {
                                                        navigate(item.to);
                                                        onClose();
                                                    }}
                                                    className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all ${isActive ? 'bg-[var(--luna-info-bg)]' : 'hover:bg-white/5'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${isActive ? 'bg-[var(--luna-navy)] border-[var(--luna-teal)]/30 text-[var(--luna-teal)]' : 'bg-white/5 border-transparent text-[var(--luna-text-dim)]'}`}>
                                                            {item.icon}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-[13px] font-black uppercase tracking-wider leading-none ${isActive ? 'text-[var(--luna-teal)]' : 'text-[var(--luna-text-main)]'}`}>{item.label}</p>
                                                            <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.1em] mt-1">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                    {isActive && <CornerDownLeft className="w-3.5 h-3.5 opacity-40" style={{ color: 'var(--luna-teal)' }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SearchModal;


