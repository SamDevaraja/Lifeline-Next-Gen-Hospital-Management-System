import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, LayoutDashboard,
    ChevronRight, Search, Plus, HeartPulse, Sparkles, TrendingUp,
    FileText, Bell, DollarSign, Stethoscope, BrainCircuit,
    BarChart3, AlertCircle, CheckCircle, Clock, X, Menu,
    Video, Pill, FlaskConical, Smartphone, QrCode, User, ArrowRight, Sun, Moon, Globe, ChevronDown, Filter,
    Mail, Lock, Archive, Bed
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import logo from '/lifeline_themed_v1.svg?v=cachebust123';
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



import Overview from './dashboard/Overview';
import DispensaryPage from './dashboard/DispensaryPage';
import PharmacyPage from './dashboard/PharmacyPage';
import { ConfirmModal, InputModal, DetailsModal } from './dashboard/Modals';

const ResourceList = lazy(() => import('./dashboard/ResourceList'));
const AppointmentList = lazy(() => import('./dashboard/AppointmentList'));
const BillingPage = lazy(() => import('./dashboard/BillingPage'));
const RecordsPage = lazy(() => import('./dashboard/RecordsPage'));
const TelemedicinePage = lazy(() => import('./dashboard/TelemedicinePage'));
const LabPage = lazy(() => import('./dashboard/LabPage'));
const NotificationsPage = lazy(() => import('./dashboard/NotificationsPage'));
const ReportsPage = lazy(() => import('./dashboard/ReportsPage'));
const SettingsPage = lazy(() => import('./dashboard/SettingsPage'));
const AIPage = lazy(() => import('./dashboard/AIPage'));
const AdmissionsPage = lazy(() => import('./dashboard/AdmissionsPage'));

const getNavGroups = (role) => {
    const r = (role || '').toLowerCase();
    const isAdmin = r === 'admin' || r === 'administrator';
    const isDoctor = r === 'doctor';
    const isPatient = r === 'patient';
    const isReceptionist = r === 'receptionist';
    const isPharmacist = r === 'pharmacist';

    const groups = [];

    let overviewLabel = 'Pulse Overview';
    if (isAdmin) overviewLabel = 'Admin Dashboard';
    else if (isDoctor) overviewLabel = 'Doctor Panel';
    else if (isPatient) overviewLabel = 'My Health Hub';
    else if (isReceptionist) overviewLabel = 'Reception Desk';
    else if (isPharmacist) overviewLabel = 'Pharmacy Panel';

    groups.push({
        title: 'Platform Overview',
        items: [
            { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: overviewLabel, exact: true },
        ]
    });

    if (isAdmin || isDoctor || isReceptionist) {
        const opsItems = [];
        if (isAdmin) {
            opsItems.push({ to: '/dashboard/doctors', icon: <Stethoscope className="w-5 h-5" />, label: 'Specialists' });
        }
        if (isAdmin || isReceptionist || isDoctor) {
            opsItems.push({ to: '/dashboard/patients', icon: <HeartPulse className="w-5 h-5" />, label: isDoctor ? 'My Patients' : 'Patient Registry' });
        }
        if (isAdmin || isReceptionist || isDoctor) {
            opsItems.push({ to: '/dashboard/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Schedule' });
        }
        if (isAdmin || isReceptionist || isDoctor) {
            opsItems.push({ to: '/dashboard/admissions', icon: <Bed className="w-5 h-5" />, label: 'Ward Admissions' });
        }
        if (isAdmin || isDoctor) {
            opsItems.push({ to: '/dashboard/records', icon: <FileText className="w-5 h-5" />, label: 'Clinical Records' });
        }
        if (isAdmin || isDoctor) {
            opsItems.push({ to: '/dashboard/telemedicine', icon: <Video className="w-5 h-5" />, label: 'Tele-Consults' });
        }
        if (isAdmin || isDoctor || isPatient) {
            opsItems.push({ to: '/dashboard/ai', icon: <BrainCircuit className="w-5 h-5" />, label: 'Clinical Intel' });
        }
        groups.push({ title: 'Clinical Operations', items: opsItems });
    }

    // Strict Clinical Side. No patient routes here.

    if (isAdmin || isPharmacist || isDoctor) {
        const invItems = [];
        if (isAdmin || isPharmacist || isDoctor) {
            invItems.push({ to: '/dashboard/pharmacy', icon: <Pill className="w-5 h-5" />, label: 'Pharmacy Core' });
        }
        if (isAdmin || isPharmacist) {
            invItems.push({ to: '/dashboard/dispensary', icon: <Archive className="w-5 h-5" />, label: 'Dispensary Engine' });
            invItems.push({ to: '/dashboard/lab', icon: <FlaskConical className="w-5 h-5" />, label: 'Diagnostics' });
        }
        groups.push({ title: 'Inventory & Labs', items: invItems });
    }


    if (isAdmin || isReceptionist || isPatient) {
        const finItems = [];
        if (isAdmin || isReceptionist || isPatient) {
            finItems.push({ to: '/dashboard/billing', icon: <DollarSign className="w-5 h-5" />, label: isPatient ? 'My Bills' : 'Billing Engine' });
        }
        if (isAdmin) {
            finItems.push({ to: '/dashboard/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' });
        }
        groups.push({ title: 'Finance & Governance', items: finItems });
    }

    return groups;
};

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center p-20 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--luna-teal)', borderTopColor: 'transparent' }} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Synchronizing Institutional Terminal...</p>
    </div>
);

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
                document.title = `(${unread}) Lifeline • Staff Terminal`;
            } else {
                document.title = `Lifeline • Staff Terminal`;
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
                document.title = 'Lifeline • Staff Terminal';
            };
            const handleReadSingle = () => {
                setUnreadCount(p => {
                    const newCount = Math.max(0, p - 1);
                    document.title = newCount > 0 ? `(${newCount}) Lifeline • Staff Terminal` : 'Lifeline • Staff Terminal';
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
        <div data-role={user?.role?.toLowerCase() || 'admin'} className="flex min-h-screen" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600, fontSize: '14px' } }} />

            {/* Sidebar */}
            {user?.role?.toLowerCase() !== 'pharmacist' && (
                <div className="flex">
                    {/* Mobile overlay */}
                    {sidebarOpen && <div className="fixed inset-0 z-30 md:hidden bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />}

                    <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-40 transition-transform duration-300
                                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                        style={{
                            background: 'var(--luna-card)',
                            borderRight: '1px solid var(--luna-border)',
                            boxShadow: '10px 0 50px rgba(0,0,0,0.02)'
                        }}>

                        {/* Logo Section - Detached Aesthetic */}
                        <div className="pt-8 pb-6 flex items-center justify-between px-6 shrink-0" style={{ borderBottom: '1px solid var(--luna-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-0.5 rounded-2xl" style={{ background: 'rgba(30, 58, 138, 0.03)' }}>
                                    <img src={logo} alt="Lifeline" className="w-9 h-9 object-contain drop-shadow-md" />
                                </div>
                                <div>
                                    <p className="font-black text-[1.35rem] uppercase tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>
                                        Lifeline <span style={{ color: 'var(--luna-blue)' }}>HMS</span>
                                    </p>
                                    <p className="text-[8.5px] uppercase font-black tracking-[0.12em] opacity-60 mt-0.5" style={{ color: 'var(--luna-text-main)' }}>Hospital Management System</p>
                                </div>
                            </div>
                            <button className="md:hidden p-1" style={{ color: LUNA.sky }} onClick={() => setSidebarOpen(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* User Profile - Zero Noise Edition */}
                        <div className="mx-6 mt-1 flex items-center gap-3 group cursor-pointer py-2 px-3 rounded-2xl transition-all hover:bg-[var(--luna-info-bg)] border border-transparent hover:border-[var(--luna-border)]">
                            <div className="relative">
                                <div className="w-11 h-11 rounded-xl avatar shadow-2xl ring-1 ring-[var(--luna-border)] group-hover:ring-[var(--luna-teal)] transition-all duration-300 flex items-center justify-center">
                                    <User className="w-7 h-7 text-white" strokeWidth={2.5} />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 shadow-sm" style={{ background: 'var(--luna-success-text)', borderColor: 'var(--luna-bg)' }} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-[14.5px] font-black uppercase tracking-wider group-hover:text-[var(--luna-teal)] transition-colors" style={{ color: 'var(--luna-text-main)' }}>
                                    {user?.first_name ? `${user.first_name}` : user?.role || 'ADMIN'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--luna-teal)' }}>Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="sidebar-nav flex-grow px-4 py-2 space-y-1 overflow-y-auto mt-2 custom-scrollbar">
                            {getNavGroups(user?.role).map((group, gi) => (
                                <div key={gi} className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] px-4 pt-4 pb-2 opacity-70 hover:opacity-100 transition-opacity" style={{ color: 'var(--luna-text-main)' }}>
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
                        <div className="px-4 pb-6 pt-4 space-y-1" style={{ borderTop: '1px solid var(--luna-border)' }}>
                            <Link to="/dashboard/settings" className="sidebar-link">
                                <div className="flex items-center gap-3"><Settings className="w-4 h-4 opacity-70" /><span>Settings</span></div>
                            </Link>
                            <button onClick={handleLogout} className="sidebar-link w-full text-left">
                                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity" style={{ color: 'var(--luna-danger-text)' }}><LogOut className="w-4 h-4" /><span>Sign Out</span></div>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
            {/* Main */}
            <div className={`flex-grow flex flex-col h-screen overflow-hidden ${user?.role?.toLowerCase() !== 'pharmacist' ? 'md:ml-64' : ''}`}>
                {/* Topbar - Floating Institutional Pill */}
                <header className="mt-4 mx-6 rounded-2xl border flex items-center justify-between px-6 sticky top-4 z-30 shrink-0 h-16"
                    style={{
                        background: 'var(--luna-nav-bg)',
                        backdropFilter: 'blur(24px)',
                        borderColor: 'var(--luna-border)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                    }}>
                    
                    {user?.role?.toLowerCase() === 'pharmacist' ? (
                        <div className="flex items-center justify-between w-full h-full gap-4">
                            <div className="flex-1 flex items-center justify-start min-w-0">
                                <div className="flex items-center gap-3 pr-4 sm:pr-10 border-r border-dashed shrink-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <div className="p-0.5 rounded-lg shrink-0" style={{ background: 'rgba(30, 58, 138, 0.05)' }}>
                                        <img src={logo} alt="Lifeline" className="w-8 h-8 object-contain" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="flex flex-col">
                                            <p className="font-black text-base uppercase tracking-tighter leading-none" style={{ color: 'var(--luna-text-main)' }}>
                                                LIFELINE <span style={{ color: 'var(--luna-blue)' }}>HMS</span>
                                            </p>
                                            <p className="font-bold text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1" style={{ color: 'var(--luna-text-main)' }}>
                                                Pharmacy Portal
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex justify-center min-w-0">
                                <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                                    {[
                                        { to: '/dashboard/dispensary', label: 'Dispensary', icon: <Archive className="w-4 h-4"/> },
                                        { to: '/dashboard/pharmacy', label: 'Inventory', icon: <Pill className="w-4 h-4"/> },
                                        { to: '/dashboard/lab', label: 'Labs', icon: <FlaskConical className="w-4 h-4"/> }
                                    ].map(link => {
                                        const active = location.pathname.startsWith(link.to);
                                        return (
                                            <Link key={link.to} to={link.to} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'shadow-sm border' : 'opacity-50 hover:opacity-100'}`}
                                                style={active ? { background: 'var(--luna-info-bg)', color: 'var(--luna-teal)', borderColor: 'var(--luna-teal)' } : { color: 'var(--luna-text-main)' }}>
                                                {link.icon} <span>{link.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                            
                            <div className="flex-1 flex items-center justify-end gap-3 shrink-0">
                                <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0" style={{ color: 'var(--luna-teal)', borderColor: 'var(--luna-border)' }}>
                                    {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                                </button>
                                <Link to="/dashboard/notifications" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0 relative" style={{ color: 'var(--luna-teal)', borderColor: 'var(--luna-border)' }}>
                                    <Bell className="w-4.5 h-4.5" />
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2" style={{ borderColor: 'var(--luna-nav-bg)' }} />
                                </Link>
                                <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all bg-red-600 shrink-0">
                                    <LogOut className="w-4 h-4" /> <span className="hidden xl:inline">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full h-full">
                            <div className="flex items-center gap-4">
                                <button className="md:hidden p-2 rounded-xl" onClick={() => setSidebarOpen(true)} style={{ color: 'var(--luna-steel)' }}><Menu className="w-5 h-5" /></button>
                                <div className="relative hidden md:block">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--luna-blue)' }} />
                                    <input id="dashboard-search" type="text" placeholder="Search institutional database..." className="input !pl-14 py-2 pr-4 text-sm w-80 h-9 shadow-inner" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 notranslate" translate="no">
                                <div className="relative" ref={langRef}>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border" style={{ color: 'var(--luna-teal)', background: langOpen ? 'var(--luna-info-bg)' : 'transparent', borderColor: langOpen ? 'var(--luna-teal)' : 'var(--luna-border)' }} onClick={() => setLangOpen(!langOpen)}>
                                        <Globe className="w-3.5 h-3.5" /> <span>{currentLang.flag} {currentLang.label}</span> <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {langOpen && (
                                        <div className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50 shadow-2xl border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                            <div className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] opacity-40 border-b" style={{ borderColor: 'var(--luna-border)' }}>Translation Hub</div>
                                            {LANGUAGES.map(lang => (
                                                <button key={lang.code} className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 transition-all hover:bg-[var(--luna-info-bg)]" style={{ color: i18n.language === lang.code ? 'var(--luna-teal)' : 'var(--luna-text-muted)', background: i18n.language === lang.code ? 'var(--luna-navy)' : 'transparent' }} onClick={() => switchLang(lang.code)}>
                                                    <div className="flex items-center gap-2"><span>{lang.flag}</span> <span>{lang.label}</span></div>
                                                    {i18n.language === lang.code && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--luna-blue)' }} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button onClick={toggleTheme} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-[var(--luna-border)]" style={{ background: 'var(--luna-info-bg)', color: 'var(--luna-teal)' }}>{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
                                <div className="badge-live hidden md:flex h-8"><span className="w-2 h-2 rounded-full bg-current animate-ping" /> AI Core Active </div>
                                <Link to="/dashboard/notifications" className="w-8 h-8 rounded-xl flex items-center justify-center relative transition-all hover:bg-[var(--luna-border)]" style={{ background: 'var(--luna-info-bg)', color: 'var(--luna-text-muted)' }}>
                                    <Bell className="w-4 h-4" />
                                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] font-black flex items-center justify-center" style={{ background: 'var(--luna-danger-text)' }}>{unreadCount}</span>}
                                </Link>
                            </div>
                        </div>
                    )}
                </header>

                {/* Content Area - SCROLLABLE COMPARTMENT */}
                <main className="flex-grow overflow-y-auto px-6 py-6 custom-scrollbar pb-24">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--luna-teal)', borderTopColor: 'transparent' }} />
                                <p className="font-bold text-sm" style={{ color: 'var(--luna-text-muted)' }}>Synchronizing Clinical Environment...</p>
                            </div>
                        </div>
                    ) : (
                        <Routes location={location} key={location.pathname}>
                                <Route path="/" element={user?.role?.toLowerCase() === 'pharmacist' ? <Navigate to="/dashboard/dispensary" replace /> : <Overview user={user} />} />
                                <Route path="/doctors" element={<Suspense fallback={null}><ResourceList type="doctors" title="Medical Specialists" user={user} /></Suspense>} />
                                <Route path="/patients" element={<Suspense fallback={<LoadingState />}><ResourceList type="patients" title="Patient Registry" user={user} /></Suspense>} />
                                <Route path="/appointments" element={<Suspense fallback={<LoadingState />}><AppointmentList user={user} /></Suspense>} />
                                <Route path="/admissions" element={<Suspense fallback={<LoadingState />}><AdmissionsPage user={user} /></Suspense>} />
                                <Route path="/billing" element={<Suspense fallback={<LoadingState />}><BillingPage user={user} /></Suspense>} />
                                <Route path="/records" element={<Suspense fallback={<LoadingState />}><RecordsPage user={user} /></Suspense>} />
                                <Route path="/telemedicine" element={<Suspense fallback={<LoadingState />}><TelemedicinePage user={user} /></Suspense>} />
                                <Route path="/pharmacy" element={<PharmacyPage user={user} />} />
                                <Route path="/dispensary" element={<DispensaryPage user={user} />} />
                                <Route path="/lab" element={<Suspense fallback={<LoadingState />}><LabPage user={user} /></Suspense>} />
                                <Route path="/ai" element={<Suspense fallback={<LoadingState />}><AIPage user={user} /></Suspense>} />
                                <Route path="/notifications" element={<Suspense fallback={null}><NotificationsPage user={user} /></Suspense>} />
                                <Route path="/reports" element={<Suspense fallback={null}><ReportsPage user={user} /></Suspense>} />
                                <Route path="/settings" element={<Suspense fallback={null}><SettingsPage user={user} onUpdate={async () => {
                                    const res = await api.get('me/');
                                    setUser(res.data);
                                }} /></Suspense>} />
                            </Routes>
                    )}
                </main>
            </div>
        </div>
    );
};

// ── Overview Wrapper ──

export default Dashboard;
