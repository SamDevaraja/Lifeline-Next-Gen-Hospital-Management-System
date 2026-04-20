import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, AlertCircle, ArrowRight, BarChart3, BellRing, Calendar, CheckCircle, 
    ChevronDown, ChevronRight, Clock, DollarSign, FileText, Filter, FlaskConical, Globe, 
    HeartPulse, LayoutDashboard, Lock, LogOut, Mail, Menu, Moon, Pill, Plus, QrCode, Search, 
    Settings, Smartphone, Stethoscope, Sun, TrendingUp, User, Users, Video, Wallet, X
} from 'lucide-react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import logo from '/lifeline_themed_v1.svg';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import SearchModal from '../../components/SearchModal';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/index.js';

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



const Overview = lazy(() => import('./dashboard/Overview'));
const AppointmentList = lazy(() => import('./dashboard/AppointmentList'));
const BillingPage = lazy(() => import('./dashboard/BillingPage'));
const RecordsPage = lazy(() => import('./dashboard/RecordsPage'));
const LabPage = lazy(() => import('./dashboard/LabPage'));
const NotificationsPage = lazy(() => import('./dashboard/NotificationsPage'));
const SettingsPage = lazy(() => import('./dashboard/SettingsPage'));
const TelemedicinePage = lazy(() => import('./dashboard/TelemedicinePage'));

const getNavGroups = () => {
    return [
        {
            title: 'Overview',
            items: [
                { to: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', exact: true },
            ]
        },
        {
            title: 'Medical Services',
            items: [
                { to: '/patient/dashboard/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Appointments' },
                { to: '/patient/dashboard/telemedicine', icon: <Video className="w-5 h-5" />, label: 'Tele-Consultation' },
                { to: '/patient/dashboard/records', icon: <FileText className="w-5 h-5" />, label: 'Medical Records' },
                { to: '/patient/dashboard/lab', icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Results' },
            ]
        },
        {
            title: 'Financial',
            items: [
                { to: '/patient/dashboard/billing', icon: <Wallet className="w-5 h-5" />, label: 'Billing & Invoices' }
            ]
        }
    ];
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchNotificationsGlobally = async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const res = await api.get('notifications/');
            const unread = res.data.filter(n => !n.is_read).length;
            setUnreadCount(unread);
            if (unread > 0) {
                document.title = `(${unread}) Lifeline • Patient Portal`;
            } else {
                document.title = `Lifeline • Patient Portal`;
            }
        } catch (e) { }
    };

    useEffect(() => {
        if (user) {
            fetchNotificationsGlobally();
            // Smart polling: pause when tab is hidden, poll every 45s when visible
            let interval = setInterval(fetchNotificationsGlobally, 45000);

            const handleVisibility = () => {
                clearInterval(interval);
                if (!document.hidden) {
                    fetchNotificationsGlobally();
                    interval = setInterval(fetchNotificationsGlobally, 45000);
                }
            };
            
            const handleReadAll = () => {
                setUnreadCount(0);
                document.title = 'Lifeline • Patient Portal';
            };
            const handleReadSingle = () => {
                setUnreadCount(p => {
                    const newCount = Math.max(0, p - 1);
                    document.title = newCount > 0 ? `(${newCount}) Lifeline • Patient Portal` : 'Lifeline • Patient Portal';
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
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
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
        : location.pathname.startsWith(item.to) && item.to !== '/patient/dashboard';

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden transition-all duration-700 fixed inset-0" 
             style={{ 
                 background: theme === 'dark' 
                    ? 'radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.1) 0px, var(--luna-bg) 100%)' 
                    : 'radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.03) 0px, var(--luna-bg) 100%)',
                 color: 'var(--luna-text-main)' 
             }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600, fontSize: '14px' } }} />
            {/* Sidebar */}
            <>
                {/* Mobile overlay */}
                {sidebarOpen && <div className="fixed inset-0 z-30 md:hidden bg-black/60 backdrop-blur-sm transition-all" onClick={() => setSidebarOpen(false)} />}
                <aside className={`fixed left-0 top-0 h-full w-64 xl:w-72 flex flex-col z-40 transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                    style={{
                        background: 'var(--luna-card)',
                        borderRight: '1px solid var(--luna-border)',
                        boxShadow: '10px 0 50px rgba(0,0,0,0.05)'
                    }}>
                    <div className="h-[100px] flex items-center justify-between px-6 shrink-0 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-0.5 rounded-2xl" style={{ background: 'rgba(30, 58, 138, 0.03)' }}>
                                <img src={logo} alt="Lifeline" className="w-9 h-9 object-contain drop-shadow-md" />
                            </div>
                            <div className="flex flex-col">
                                <p className="font-black text-[1.35rem] uppercase tracking-tighter leading-none whitespace-nowrap" style={{ color: 'var(--luna-text-main)' }}>
                                    Lifeline <span style={{ color: 'var(--luna-blue)' }}>HMS</span>
                                </p>
                                <p className="text-[8.5px] uppercase font-black tracking-[0.12em] opacity-40 mt-1.5" style={{ color: 'var(--luna-text-main)' }}>Patient Portal</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(false)} 
                            className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95 flex items-center justify-center"
                        >
                            <X className="w-4 h-4 opacity-40" />
                        </button>
                    </div>
                    {/* User Terminal Identity - EXECUTIVE PROFILE EDITION */}
                    <div className="mx-5 mt-6 flex items-center justify-between p-3.5 rounded-2xl border transition-all group cursor-pointer hover:bg-white/[0.03]"
                         style={{ 
                             background: theme === 'dark' ? 'var(--luna-navy)' : 'rgba(30, 58, 138, 0.03)', 
                             borderColor: 'var(--luna-border)' 
                         }}>
                        <div className="flex items-center gap-3.5">
                            <div className="relative">
                                <div className="w-11 h-11 rounded-xl shadow-2xl flex items-center justify-center border transition-all group-hover:scale-105" 
                                     style={{ 
                                         background: 'var(--luna-card)', 
                                         borderColor: 'var(--luna-border)',
                                         color: 'var(--luna-teal)' 
                                     }}>
                                    <User className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-[var(--luna-teal)]'}`} />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 bg-emerald-500 animate-pulse" style={{ borderColor: theme === 'dark' ? 'var(--luna-navy)' : '#fff' }} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[13px] font-black uppercase tracking-wider leading-none" style={{ color: 'var(--luna-text-main)' }}>
                                    {user?.first_name || 'Patient'}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>Status:</span>
                                    <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border" 
                                          style={{ 
                                              background: 'var(--luna-success-bg)', 
                                              color: 'var(--luna-success-text)',
                                              borderColor: 'var(--luna-success-text)',
                                              opacity: 0.8
                                          }}>
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-10 group-hover:opacity-100 group-hover:text-[var(--luna-teal)] transition-all" />
                    </div>

                    {/* Nav */}
                    <nav className="sidebar-nav flex-grow px-4 py-2 space-y-0.5 overflow-y-auto mt-2 custom-scrollbar">
                        {getNavGroups().map((group, gi) => (
                            <div key={gi} className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] px-6 pt-4 pb-2 opacity-70 hover:opacity-100 transition-opacity" style={{ color: 'var(--luna-text-main)' }}>
                                    {group.title}
                                </p>
                                {group.items.map(item => {
                                    const active = isActive(item) || (item.exact && location.pathname === '/patient/dashboard');
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
                        <Link to="/patient/dashboard/settings" className="sidebar-link">
                            <div className="flex items-center gap-3"><Settings className="w-4 h-4 opacity-70" /><span>Settings</span></div>
                        </Link>
                        <button onClick={handleLogout} className="sidebar-link w-full text-left">
                            <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity" style={{ color: 'var(--luna-danger-text)' }}><LogOut className="w-4 h-4" /><span>Sign Out</span></div>
                        </button>
                    </div>
                </aside>
            </>

            {/* Main */}
            <div className={`flex-grow md:ml-64 xl:ml-72 flex flex-col h-screen overflow-hidden`}>
                <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30"
                    style={{
                        background: 'var(--luna-nav-bg)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid var(--luna-border)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.02)'
                    }}>
                    <div className="flex items-center justify-between w-full h-full">
                        {/* Left: Clinical Meta-Layer (Time & Date Sync) */}
                        <div className="flex items-center gap-6">
                            <button className="md:hidden p-2 rounded-xl transition-all hover:bg-[var(--luna-border)]" onClick={() => setSidebarOpen(true)} style={{ color: 'var(--luna-teal)' }}>
                                <Menu className="w-5 h-5" />
                            </button>
                            
                            <div className="hidden md:flex items-center gap-5">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-1 h-3.5 rounded-full bg-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                        <p className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--luna-text-main)', fontFamily: "'Outfit', sans-serif" }}>
                                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(' AM', '').replace(' PM', '')}
                                            <span className="text-[9px] font-black opacity-30 ml-1 uppercase">
                                                {currentTime.toLocaleTimeString([], { hour12: true }).split(' ').pop()}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Surgical Divider */}
                                <div className="h-6 w-[1px] opacity-10 hidden md:block" style={{ background: 'var(--luna-text-main)' }} />

                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] leading-none" style={{ color: 'var(--luna-text-main)' }}>
                                        {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                                    </p>
                                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-30 mt-1" style={{ color: 'var(--luna-text-muted)' }}>
                                        {currentTime.toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Operational Controls (Identity & Utilities) */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Identity Badge */}
                            <div className="hidden xl:flex items-center gap-3 mr-4 pr-4 border-r" style={{ borderColor: 'var(--luna-border)' }}>
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border shadow-sm transition-all" 
                                      style={{ 
                                          background: 'var(--luna-info-bg)', 
                                          color: 'var(--luna-teal)',
                                          borderColor: 'var(--luna-teal)',
                                          opacity: 0.9
                                      }}>
                                    {user?.role?.toUpperCase() || 'PATIENT'}
                                </span>
                            </div>

                            {/* Regional Selector */}
                            <div className="relative" ref={langRef}>
                                <button className="flex items-center gap-2.5 px-3 py-2.5 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border bg-[var(--luna-card)] hover:bg-white/5" 
                                        style={{ color: 'var(--luna-text-main)', borderColor: 'var(--luna-border)' }}
                                        onClick={() => setLangOpen(!langOpen)}>
                                    <Globe className="w-3.5 h-3.5 opacity-60" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="hidden lg:inline-block">{currentLang.label}</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${langOpen ? 'rotate-180' : 'opacity-40'}`} />
                                </button>
                                {langOpen && (
                                    <div className="absolute right-0 mt-3 w-56 rounded-2xl overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border" 
                                         style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', backdropFilter: 'blur(30px)' }}>
                                        <div className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.25em] opacity-40 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                            Select Language
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                                            {LANGUAGES.map(lang => (
                                                <button key={lang.code} className="w-full text-left px-4 py-3 text-[11px] font-bold flex items-center justify-between gap-3 rounded-xl transition-all hover:bg-white/5 group/lang" 
                                                        style={{ color: i18n.language === lang.code ? 'var(--luna-teal)' : 'var(--luna-text-muted)', background: i18n.language === lang.code ? 'rgba(56,189,248,0.05)' : 'transparent' }} 
                                                        onClick={() => switchLang(lang.code)}>
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-sm transition-transform group-hover/lang:scale-110">{lang.flag}</span>
                                                        <span>{lang.label}</span>
                                                    </div>
                                                    {i18n.language === lang.code && <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.4)]" style={{ background: 'var(--luna-blue)' }} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Theme Toggle */}
                            <button onClick={toggleTheme} className="flex items-center gap-3 px-5 h-10 rounded-xl transition-all border bg-[var(--luna-card)] hover:bg-white/5" 
                                    style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-teal)' }}>
                                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                                <span className="hidden lg:inline-block text-[10px] font-black uppercase tracking-widest">Theme</span>
                            </button>

                            {/* Notifications */}
                            <Link to="/patient/dashboard/notifications" className="flex items-center gap-3 px-5 h-10 rounded-xl relative transition-all border bg-[var(--luna-card)] hover:bg-white/5" 
                                  style={{ borderColor: 'var(--luna-border)', color: 'var(--luna-text-dim)' }}>
                                <BellRing className="w-3.5 h-3.5 opacity-60" />
                                <span className="hidden lg:inline-block text-[10px] font-black uppercase tracking-widest">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg border-2" 
                                          style={{ background: 'var(--luna-danger-text)', borderColor: 'var(--luna-card)' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Content Area - SCROLLABLE COMPARTMENT */}
                <main className="flex-grow overflow-y-auto px-6 py-6 custom-scrollbar pb-24">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--luna-teal)', borderTopColor: 'transparent' }} />
                                <p className="font-bold text-sm" style={{ color: 'var(--luna-text-muted)' }}>Loading dashboard...</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="animate-pulse flex flex-col items-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-2" style={{ borderColor: 'var(--luna-teal)', borderTopColor: 'transparent' }} /></div></div>}><Routes location={location} key={location.pathname}>
                                <Route path="/" element={<Overview user={user} />} />
                                <Route path="/appointments" element={<AppointmentList user={user} />} />
                                <Route path="/billing" element={<BillingPage user={user} />} />
                                <Route path="/records" element={<RecordsPage user={user} />} />
                                <Route path="/lab" element={<LabPage user={user} />} />
                                <Route path="/notifications" element={<NotificationsPage user={user} />} />
                                <Route path="/telemedicine" element={<TelemedicinePage user={user} />} />
                                <Route path="/settings" element={<SettingsPage user={user} onUpdate={async () => {
                                    const res = await api.get('me/');
                                    setUser(res.data);
                                }} />} />
                            </Routes></Suspense>
                        </AnimatePresence>
                    )}
                </main>
            </div>
            <SearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                userRole="patient" 
            />
        </div>
    );
};

// ── Overview Wrapper ──

export default Dashboard;

