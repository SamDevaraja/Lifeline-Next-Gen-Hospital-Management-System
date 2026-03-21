import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/index.js';

const LUNA = {
    sky: 'var(--luna-teal)',
    teal: 'var(--luna-blue)',
    steel: 'var(--luna-steel)',
    navy: 'var(--luna-navy)',
    dark: 'var(--luna-bg)',
    text: 'var(--luna-text-main)',
    muted: 'var(--luna-text-muted)',
    dim: 'var(--luna-text-dim)',
    success_bg: 'var(--luna-success-bg)',
    success_text: 'var(--luna-success-text)',
    warn_bg: 'var(--luna-warn-bg)',
    warn_text: 'var(--luna-warn-text)',
    danger_bg: 'var(--luna-danger-bg)',
    danger_text: 'var(--luna-danger-text)',
    info_bg: 'var(--luna-info-bg)',
    info_text: 'var(--luna-info-text)'
};



import { ConfirmModal, InputModal, DetailsModal } from './dashboard/Modals';
const Overview = lazy(() => import('./dashboard/Overview'));
const ResourceList = lazy(() => import('./dashboard/ResourceList'));
const AppointmentList = lazy(() => import('./dashboard/AppointmentList'));
const BillingPage = lazy(() => import('./dashboard/BillingPage'));
const RecordsPage = lazy(() => import('./dashboard/RecordsPage'));
const TelemedicinePage = lazy(() => import('./dashboard/TelemedicinePage'));
const PharmacyPage = lazy(() => import('./dashboard/PharmacyPage'));
const LabPage = lazy(() => import('./dashboard/LabPage'));
const NotificationsPage = lazy(() => import('./dashboard/NotificationsPage'));
const ReportsPage = lazy(() => import('./dashboard/ReportsPage'));
const SettingsPage = lazy(() => import('./dashboard/SettingsPage'));
const TaskPage = lazy(() => import('./dashboard/TaskPage'));

const getNavGroups = (role) => {
    const r = (role || '').toLowerCase();
    const isAdmin = r === 'admin' || r === 'administrator';
    const isDoctor = r === 'doctor';
    const isPatient = r === 'patient';
    const isReceptionist = r === 'receptionist';
    const isPharmacist = r === 'pharmacist';
    const isNurse = r === 'nurse';
    const isSupervisor = r === 'supervisor';

    const groups = [];

    let overviewLabel = 'Pulse Overview';
    if (isAdmin) overviewLabel = 'Admin Dashboard';
    else if (isDoctor) overviewLabel = 'Doctor Panel';
    else if (isPatient) overviewLabel = 'My Health Hub';
    else if (isReceptionist) overviewLabel = 'Reception Desk';
    else if (isPharmacist) overviewLabel = 'Pharmacy Panel';
    else if (isNurse) overviewLabel = 'Nurse Station';
    else if (isSupervisor) overviewLabel = 'Supervisor Panel';

    groups.push({
        title: 'Platform Overview',
        items: [
            { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: overviewLabel, exact: true },
        ]
    });

    if (isAdmin || isDoctor || isReceptionist || isNurse) {
        const opsItems = [];
        if (isAdmin) {
            opsItems.push({ to: '/dashboard/doctors', icon: <Stethoscope className="w-5 h-5" />, label: 'Specialists' });
        }
        if (isAdmin || isReceptionist || isNurse || isDoctor) {
            opsItems.push({ to: '/dashboard/patients', icon: <HeartPulse className="w-5 h-5" />, label: isDoctor ? 'My Patients' : 'Patient Registry' });
        }
        if (isAdmin || isReceptionist || isDoctor) {
            opsItems.push({ to: '/dashboard/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Schedule' });
        }
        if (isAdmin || isDoctor || isNurse) {
            opsItems.push({ to: '/dashboard/records', icon: <FileText className="w-5 h-5" />, label: 'Clinical Records' });
        }
        if (isAdmin || isDoctor || isNurse) {
            opsItems.push({ to: '/dashboard/telemedicine', icon: <Video className="w-5 h-5" />, label: 'Tele-Consults' });
        }
        groups.push({ title: 'Clinical Operations', items: opsItems });
    }

    // Strict Clinical Side. No patient routes here.

    if (isAdmin || isPharmacist || isNurse) {
        const invItems = [];
        if (isAdmin || isPharmacist) {
            invItems.push({ to: '/dashboard/pharmacy', icon: <Pill className="w-5 h-5" />, label: 'Pharmacy Core' });
        }
        if (isAdmin || isNurse || isPharmacist) {
            invItems.push({ to: '/dashboard/lab', icon: <FlaskConical className="w-5 h-5" />, label: 'Diagnostics' });
        }
        groups.push({ title: 'Inventory & Labs', items: invItems });
    }

    if (isAdmin || isSupervisor) {
        const opsItems = [];
        if (isAdmin || isSupervisor) {
            opsItems.push({ to: '/dashboard/tasks', icon: <CheckCircle className="w-5 h-5" />, label: 'Facility Tasks' });
        }
        groups.push({ title: 'Facility Management', items: opsItems });
    }

    if (isAdmin || isReceptionist || isPatient) {
        const finItems = [];
        finItems.push({ to: '/dashboard/billing', icon: <DollarSign className="w-5 h-5" />, label: isPatient ? 'My Bills' : 'Billing Engine' });
        if (isAdmin) {
            finItems.push({ to: '/dashboard/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' });
        }
        groups.push({ title: 'Intelligence & Finance', items: finItems });
    }

    return groups;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(() => {
        // Instant load from cache — eliminates spinner flash on sign-in
        try { return JSON.parse(localStorage.getItem('lifeline-user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(!localStorage.getItem('lifeline-user'));
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef(null);
    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotificationsGlobally = async () => {
        try {
            const res = await api.get('notifications/');
            const unread = res.data.filter(n => !n.is_read).length;
            setUnreadCount(unread);
            if (unread > 0) {
                document.title = `(${unread}) Lifeline HMS`;
            } else {
                document.title = `Lifeline HMS`;
            }
        } catch (e) { }
    };

    useEffect(() => {
        if (user) {
            fetchNotificationsGlobally();
            // Smart polling: pause when tab is hidden, poll every 45s when visible
            let interval = setInterval(fetchNotificationsGlobally, 45000);

            const handleVisibility = () => {
                if (document.hidden) {
                    clearInterval(interval);
                } else {
                    fetchNotificationsGlobally();
                    interval = setInterval(fetchNotificationsGlobally, 45000);
                }
            };
            
            const handleReadAll = () => {
                setUnreadCount(0);
                document.title = 'Lifeline HMS';
            };
            const handleReadSingle = () => {
                setUnreadCount(p => {
                    const newCount = Math.max(0, p - 1);
                    document.title = newCount > 0 ? `(${newCount}) Lifeline HMS` : 'Lifeline HMS';
                    return newCount;
                });
            };

            document.addEventListener('visibilitychange', handleVisibility);
            window.addEventListener('notifications_updated', fetchNotificationsGlobally);
            window.addEventListener('notifications_read_all', handleReadAll);
            window.addEventListener('notifications_read_single', handleReadSingle);
            return () => {
                clearInterval(interval);
                document.removeEventListener('visibilitychange', handleVisibility);
                window.removeEventListener('notifications_updated', fetchNotificationsGlobally);
                window.removeEventListener('notifications_read_all', handleReadAll);
                window.removeEventListener('notifications_read_single', handleReadSingle);
            };
        }
    }, [user]);

    // Show deferred login success toast (set by Login page to avoid delay there)
    useEffect(() => {
        const loginMsg = sessionStorage.getItem('login-toast');
        if (loginMsg) {
            toast.success(loginMsg);
            sessionStorage.removeItem('login-toast');
        }
    }, []);

    // Close lang dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (!localStorage.getItem('token')) { navigate('/login'); return; }
            try {
                const res = await api.get('me/');
                setUser(res.data);
                localStorage.setItem('lifeline-user', JSON.stringify(res.data));
            } catch (_err) {
                localStorage.removeItem('token');
                localStorage.removeItem('lifeline-user');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const switchLang = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('lifeline-lang', code);
        // Set googtrans cookie for global translation
        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
        const cookieStr = `googtrans=/en/${code}; path=/; expires=${expireDate.toUTCString()}`;
        document.cookie = cookieStr;
        document.cookie = `${cookieStr}; domain=${window.location.hostname}`;
        setLangOpen(false);
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('lifeline-user');
        toast.success('Signed out successfully');
        navigate('/login');
    };

    const isActive = (item) => item.exact
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to) && item.to !== '/dashboard';

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600, fontSize: '14px' } }} />

            {/* Sidebar */}
            <>
                {/* Mobile overlay */}
                {sidebarOpen && <div className="fixed inset-0 z-30 md:hidden bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />}

                <aside className={`fixed left-0 top-0 h-screen w-72 flex flex-col z-40 transition-transform duration-300
                                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                    style={{
                        background: 'var(--luna-card)',
                        borderRight: '1px solid var(--luna-border)',
                        boxShadow: '10px 0 50px rgba(0,0,0,0.02)'
                    }}>

                    {/* Logo */}
                    <div className="h-20 flex items-center justify-between px-6" style={{ borderBottom: '1px solid var(--luna-border)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ background: 'rgba(30, 58, 138, 0.1)' }}>
                                <HeartPulse className="w-5 h-5" style={{ color: LUNA.blue }} />
                            </div>
                            <div>
                                <p className="font-extrabold text-base uppercase tracking-tighter" style={{ color: LUNA.blue }}>Lifeline</p>
                                <p className="text-[9px] uppercase font-black tracking-widest" style={{ color: LUNA.teal }}>Intelligence</p>
                            </div>
                        </div>
                        <button className="md:hidden p-1" style={{ color: LUNA.sky }} onClick={() => setSidebarOpen(false)}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* User Profile - Zero Noise Edition */}
                    <div className="mx-6 mt-8 flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl avatar shadow-2xl ring-1 ring-white/10 group-hover:ring-blue-500/30 transition-all duration-300 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ borderColor: 'var(--luna-bg)' }} />
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-black uppercase tracking-wider group-hover:text-teal-400 transition-colors" style={{ color: 'var(--luna-text-main)' }}>
                                {user?.first_name ? `${user.first_name}` : user?.role || 'ADMIN'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--luna-text-dim)' }}>Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="sidebar-nav flex-grow px-4 py-4 space-y-4 overflow-y-auto mt-2">
                        {getNavGroups(user?.role).map((group, gi) => (
                            <div key={gi} className="space-y-1.5">
                                <p className="text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-1" style={{ color: 'var(--luna-text-dim)' }}>
                                    {group.title}
                                </p>
                                {group.items.map(item => {
                                    const active = isActive(item) || (item.exact && location.pathname === '/dashboard');
                                    return (
                                        <Link key={item.to} to={item.to}
                                            className={`sidebar-link ${active ? 'active' : ''}`}
                                            onClick={() => setSidebarOpen(false)}>
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            <ChevronRight className={`w-3 h-3 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* Bottom */}
                    <div className="px-4 pb-6 space-y-1" style={{ borderTop: '1px solid rgba(167,235,242,0.08)' }}>
                        <Link to="/dashboard/settings" className="sidebar-link mt-4">
                            <div className="flex items-center gap-3"><Settings className="w-5 h-5" /><span>Settings</span></div>
                        </Link>
                        <button onClick={handleLogout} className="sidebar-link w-full text-left" style={{ color: 'var(--luna-text-muted)' }}>
                            <div className="flex items-center gap-3"><LogOut className="w-5 h-5" /><span>Sign Out</span></div>
                        </button>
                    </div>
                </aside>
            </>

            {/* Main */}
            <div className="flex-grow md:ml-72 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30"
                    style={{
                        background: 'var(--luna-nav-bg)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid var(--luna-border)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.02)'
                    }}>
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 rounded-xl" onClick={() => setSidebarOpen(true)}
                            style={{ color: LUNA.steel }}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: LUNA.blue }} />
                            <input id="dashboard-search" type="text" placeholder="Search institutional database: records, staff, analytics..."
                                className="input !pl-14 py-2 pr-4 text-sm w-96 h-10 shadow-inner" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 notranslate" translate="no">
                        {/* Language Switcher */}
                        <div className="relative" ref={langRef}>
                            <button
                                id="dash-lang-btn"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border"
                                style={{
                                    color: 'var(--luna-teal)',
                                    background: langOpen ? 'rgba(56,189,248,0.1)' : 'rgba(46,196,182,0.05)',
                                    borderColor: langOpen ? 'var(--luna-teal)' : 'var(--luna-border)',
                                }}
                                onClick={() => setLangOpen(!langOpen)}
                                aria-label="Switch language">
                                <Globe className="w-3.5 h-3.5" />
                                <span>{currentLang.flag} {currentLang.label}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {langOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
                                    style={{
                                        background: 'var(--luna-card)',
                                        border: '1px solid var(--luna-border)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                        backdropFilter: 'blur(20px)'
                                    }}>
                                    <div className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] opacity-40 border-b bg-white/5" style={{ borderColor: 'var(--luna-border)' }}>
                                        Translation Hub
                                    </div>
                                    {LANGUAGES.map(lang => (
                                        <button key={lang.code} id={`dash-lang-${lang.code}`}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 transition-all hover:bg-white/5"
                                            style={{
                                                color: i18n.language === lang.code ? 'var(--luna-teal)' : 'var(--luna-text-muted)',
                                                background: i18n.language === lang.code ? 'var(--luna-navy)' : 'transparent',
                                            }}
                                            onClick={() => switchLang(lang.code)}>
                                            <div className="flex items-center gap-2">
                                                <span>{lang.flag}</span>
                                                <span>{lang.label}</span>
                                            </div>
                                            {i18n.language === lang.code && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
                            style={{ background: 'rgba(46,196,182,0.08)', color: 'var(--luna-teal)' }}
                            aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <div className="badge-live hidden md:flex">
                            <span className="w-2 h-2 rounded-full bg-current animate-ping" /> AI Core Active
                        </div>
                        <Link to="/dashboard/notifications"
                            className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-all hover:bg-white/10"
                            style={{ background: 'rgba(46,196,182,0.08)', color: 'var(--luna-text-muted)' }}>
                            <Bell className="w-5 h-5" />
                            <AnimatePresence>
                                {unreadCount > 0 && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                                        style={{ background: '#ef4444' }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow p-6 lg:p-8 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4" />
                                <p className="font-bold text-sm" style={{ color: 'var(--luna-text-muted)' }}>Synchronizing Clinical Environment...</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="animate-pulse flex flex-col items-center"><div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mb-2" /></div></div>}><Routes location={location} key={location.pathname}>
                                <Route path="/" element={<Overview user={user} />} />
                                <Route path="/doctors" element={<ResourceList type="doctors" title="Medical Specialists" user={user} />} />
                                <Route path="/patients" element={<ResourceList type="patients" title="Patient Registry" user={user} />} />
                                <Route path="/appointments" element={<AppointmentList user={user} />} />
                                <Route path="/billing" element={<BillingPage user={user} />} />
                                <Route path="/records" element={<RecordsPage user={user} />} />
                                <Route path="/telemedicine" element={<TelemedicinePage user={user} />} />
                                <Route path="/pharmacy" element={<PharmacyPage user={user} />} />
                                <Route path="/lab" element={<LabPage user={user} />} />
                                <Route path="/notifications" element={<NotificationsPage user={user} />} />
                                <Route path="/reports" element={<ReportsPage user={user} />} />
                                <Route path="/tasks" element={<TaskPage user={user} />} />
                                <Route path="/settings" element={<SettingsPage user={user} onUpdate={async () => {
                                    const res = await api.get('me/');
                                    setUser(res.data);
                                }} />} />
                            </Routes></Suspense>
                        </AnimatePresence>
                    )}
                </main>
            </div>
        </div>
    );
};

// ── Overview Wrapper ──

export default Dashboard;
