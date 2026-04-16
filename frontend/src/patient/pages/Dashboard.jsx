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
import logo from '/lifeline_themed_v1.svg?v=cachebust123';
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
            title: 'Primary Core',
            items: [
                { to: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Health Dashboard', exact: true },
            ]
        },
        {
            title: 'Clinical Services',
            items: [
                { to: '/patient/dashboard/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Care Schedule' },
                { to: '/patient/dashboard/telemedicine', icon: <Video className="w-5 h-5" />, label: 'Tele-Consultation' },
                { to: '/patient/dashboard/records', icon: <FileText className="w-5 h-5" />, label: 'Medical Vault' },
                { to: '/patient/dashboard/lab', icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Results' },
            ]
        },
        {
            title: 'Institutional Finance',
            items: [
                { to: '/patient/dashboard/billing', icon: <Wallet className="w-5 h-5" />, label: 'Account Ledger' }
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
        <div className="flex min-h-screen" style={{ background: 'var(--luna-bg)' }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600, fontSize: '14px' } }} />
            {/* Sidebar */}
            <>
                {/* Mobile overlay */}
                {sidebarOpen && <div className="fixed inset-0 z-30 md:hidden bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />}
                <aside className={`fixed left-0 top-0 h-screen w-72 flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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
                                <p className="text-[8.5px] uppercase font-black tracking-[0.12em] opacity-40 mt-0.5" style={{ color: 'var(--luna-text-main)' }}>Medical Care Gateway</p>
                            </div>
                        </div>
                        <button className="md:hidden p-1" style={{ color: LUNA.sky }} onClick={() => setSidebarOpen(false)}>
                            <X className="w-4 h-4" />
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
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>Terminal:</span>
                                    <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border" 
                                          style={{ 
                                              background: 'var(--luna-success-bg)', 
                                              color: 'var(--luna-success-text)',
                                              borderColor: 'var(--luna-success-text)',
                                              opacity: 0.8
                                          }}>
                                        Active
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
                            style={{ color: 'var(--luna-steel)' }}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative hidden md:block group cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-hover:text-[var(--luna-teal)]" style={{ color: 'var(--luna-blue)' }} />
                            <div className="input !pl-14 py-2 pr-4 text-sm w-96 h-10 shadow-inner flex items-center justify-between opacity-50 group-hover:opacity-100 transition-all border border-transparent group-hover:border-[var(--luna-border)]">
                                <span>Search institutional database...</span>
                                <div className="flex items-center gap-1 opacity-40">
                                    <span className="text-[10px] bg-white/10 px-1 rounded">⌘</span>
                                    <span className="text-[10px] bg-white/10 px-1 rounded">K</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 notranslate" translate="no">
                        {/* Language Switcher */}
                        <div className="relative" ref={langRef}>
                            <button
                                id="dash-lang-btn"
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-2xl backdrop-blur-md active:scale-95"
                                style={{
                                    color: 'var(--luna-text-main)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderColor: 'var(--luna-border)'
                                }}
                                onClick={() => setLangOpen(!langOpen)}
                                aria-label="Switch language">
                                <Globe className="w-3.5 h-3.5 opacity-60" style={{ color: 'var(--luna-teal)' }} />
                                <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
                                <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
                                <ChevronDown className="w-3 h-3 opacity-40" />
                            </button>

                            {langOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
                                    style={{
                                        background: 'var(--luna-card)',
                                        border: '1px solid var(--luna-border)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                        backdropFilter: 'blur(20px)'
                                    }}>
                                    <div className="px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] opacity-40 border-b" style={{ borderColor: 'var(--luna-border)' }}>
                                        Translation Hub
                                    </div>
                                    {LANGUAGES.map(lang => (
                                        <button key={lang.code} id={`dash-lang-${lang.code}`}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 transition-all hover:bg-[var(--luna-info-bg)]"
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
                                                <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ background: 'var(--luna-blue)' }} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[var(--luna-border)]"
                            style={{ background: 'var(--luna-info-bg)', color: 'var(--luna-teal)' }}
                            aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <Link to="/patient/dashboard/notifications"
                            className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-all hover:bg-[var(--luna-border)]"
                            style={{ background: 'var(--luna-info-bg)', color: 'var(--luna-text-muted)' }}>
                            <BellRing className="w-5 h-5" />
                            <AnimatePresence>
                                {unreadCount > 0 && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-sm"
                                        style={{ background: 'var(--luna-danger-text)' }}>
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
                                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--luna-teal)', borderTopColor: 'transparent' }} />
                                <p className="font-bold text-sm" style={{ color: 'var(--luna-text-muted)' }}>Synchronizing Clinical Environment...</p>
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

