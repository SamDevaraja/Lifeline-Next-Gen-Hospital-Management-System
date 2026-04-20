import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Bell, AlertCircle, AlertTriangle, Info,
    CheckCircle, Clock, ChevronDown, MoreHorizontal, Inbox,
    Activity, BarChart2, Shield
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const NotificationsPage = () => {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNotifications = async () => {
        try {
            const r = await api.get('notifications/');
            setNotifs(r.data);
        } catch (err) {
            setNotifs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markSingleRead = async (id) => {
        const target = notifs.find(n => n.id === id);
        if (!target || target.is_read) return;
        try {
            setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
            await api.post(`notifications/${id}/mark_read/`);
        } catch (_e) { }
    };

    const markAllRead = async () => {
        const unreadIds = notifs.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;
        try {
            setNotifs(p => p.map(n => ({ ...n, is_read: true })));
            await api.post('notifications/mark_all_read/');
            toast.success('All notifications marked as read');
        } catch (_e) {
            fetchNotifications();
            toast.error('Failed to update notifications');
        }
    };

    // Filter Logic
    const filtered = notifs.filter(n => {
        const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             n.message?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        const title = n.title?.toLowerCase() || '';
        if (activeTab === 'critical') return title.includes('critical') || title.includes('urgent');
        if (activeTab === 'warning') return title.includes('warning') || title.includes('escalate');
        if (activeTab === 'info') return !title.includes('critical') && !title.includes('warning');
        return true;
    });

    const counts = {
        all: notifs.length,
        critical: notifs.filter(n => n.title?.toLowerCase().includes('critical') || n.title?.toLowerCase().includes('urgent')).length,
        warning: notifs.filter(n => n.title?.toLowerCase().includes('warning') || n.title?.toLowerCase().includes('escalate')).length,
        info: notifs.filter(n => !n.title?.toLowerCase().includes('critical') && !n.title?.toLowerCase().includes('warning')).length,
    };

    const getPriority = (n) => {
        const title = n.title?.toLowerCase() || '';
        if (title.includes('critical') || title.includes('urgent')) return { label: 'Critical', color: 'var(--luna-danger-text)', bg: 'var(--luna-danger-bg)', icon: AlertCircle };
        if (title.includes('warning') || title.includes('escalate')) return { label: 'Warning', color: 'var(--luna-warn-text)', bg: 'var(--luna-warn-bg)', icon: AlertTriangle };
        return { label: 'Info', color: 'var(--luna-info-text)', bg: 'var(--luna-info-bg)', icon: Info };
    };

    return (
        <div className="min-h-full w-full transition-colors" style={{ background: 'var(--luna-bg)', color: 'var(--luna-text-main)' }}>
            <div className="max-w-[1400px] mx-auto px-6 py-6 font-sans">
            <Toaster position="top-right" />

            {/* Header: CLEAN & MINIMAL */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Notifications</h1>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                        <input 
                            type="text" 
                            placeholder="Search clinical feed..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--luna-teal)] transition-all"
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={markAllRead}
                            disabled={notifs.filter(n => !n.is_read).length === 0}
                            title="Mark all as read"
                            className="w-10 h-10 border rounded-xl transition-all flex items-center justify-center disabled:opacity-20 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/5 active:scale-90"
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-success-text)' }}
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                            title="Filter preferences"
                            className="w-10 h-10 border rounded-xl transition-all flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:scale-90"
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}
                        >
                            <Filter className="w-5 h-5 opacity-60" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-8">
                {/* Full Width Alerts Feed (Centered) */}
                <main className="w-full max-w-4xl mx-auto space-y-4">
            {/* Tabs Area */}
            <div className="flex border-b gap-6 overflow-x-auto no-scrollbar scroll-smooth" style={{ borderColor: 'var(--luna-border)' }}>
                {['all', 'critical', 'warning', 'info'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium transition-all relative capitalize whitespace-nowrap ${activeTab === tab ? '' : 'opacity-40 hover:opacity-100'}`}
                        style={{ color: activeTab === tab ? 'var(--luna-text-main)' : 'var(--luna-text-dim)' }}
                    >
                        {tab}
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0" style={{ background: 'rgba(0,0,0,0.05)', borderColor: 'var(--luna-border)' }}>
                            {counts[tab]}
                        </span>
                        {activeTab === tab && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--luna-text-main)' }} />
                        )}
                    </button>
                ))}
            </div>

                    <div className="space-y-px border rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        {loading ? (
                            <div className="py-20 text-center opacity-40 text-sm animate-pulse tracking-widest uppercase font-black">Synchronizing Stream...</div>
                        ) : filtered.length > 0 ? (
                            filtered.map((n, i) => {
                                const priority = getPriority(n);
                                
                                return (
                                    <div 
                                        key={n.id || i}
                                        onClick={() => markSingleRead(n.id)}
                                        className={`group p-4 flex gap-4 border-b last:border-none cursor-pointer transition-all ${!n.is_read ? 'bg-black/[0.02] dark:bg-white/[0.02]' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
                                        style={{ borderColor: 'var(--luna-border)' }}
                                    >
                                        <div className="mt-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: !n.is_read ? priority.color : 'var(--luna-text-dim)' }} />
                                        </div>
                                        
                                        <div className="flex-grow min-w-0 space-y-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0`} style={{ color: priority.color, backgroundColor: priority.bg, borderColor: `${priority.color}30` }}>
                                                        {priority.label}
                                                    </span>
                                                    <h3 className={`text-sm font-semibold whitespace-normal leading-tight overflow-hidden break-words`}>
                                                        {n.title}
                                                    </h3>
                                                </div>
                                                <div className="flex-shrink-0 text-[11px] font-medium opacity-40 flex items-center gap-1.5 whitespace-nowrap">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm leading-relaxed pr-2 opacity-70 break-words">
                                                {n.message}
                                            </p>

                                            <div className="flex items-center gap-3 pt-1">
                                                <span className={`text-[11px] font-bold`} style={{ color: n.is_read ? 'var(--luna-success-text)' : 'var(--luna-text-dim)' }}>
                                                    {n.is_read ? 'Resolved' : 'Institutional Alert'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
                                                <MoreHorizontal className="w-4 h-4 opacity-40" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-20 h-20 rounded-full border flex items-center justify-center mb-6 shadow-sm"
                                    style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}
                                >
                                    <Bell className="w-8 h-8 opacity-20" style={{ color: 'var(--luna-text-main)' }} />
                                </motion.div>
                                <h3 className="text-lg font-bold tracking-tight opacity-40 uppercase tracking-[0.2em] mb-2">No Notifications</h3>
                                <p className="text-xs font-semibold opacity-30 max-w-[280px] leading-relaxed">
                                    You're all caught up! There are no new alerts or messages for you to check right now.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            </div>
        </div>
    );
};

export default NotificationsPage;