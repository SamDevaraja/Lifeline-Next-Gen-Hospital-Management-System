import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, BrainCircuit, Menu, X, Globe, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/index.js';
import { useTheme } from '../context/ThemeContext';
import logo from '/lifeline_themed_v1.svg?v=cachebust123';

const LUNA = {
    sky: 'var(--luna-teal)', teal: 'var(--luna-blue)', steel: 'var(--luna-steel)', navy: 'var(--luna-navy)', dark: 'var(--luna-bg)'
};

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [mobileLangOpen, setMobileLangOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const langRef = useRef(null);
    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
        setIsMenuOpen(false);
        setLangOpen(false);
        setMobileLangOpen(false);
    }, [location]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const switchLang = (code) => {
        // 1. Manual i18next Update (High Performance)
        i18n.changeLanguage(code);
        localStorage.setItem('lifeline-lang', code);

        // 2. Google Global Neural Translation Trigger (Complete Coverage)
        // This cookie tells the Google Translate script to translate the entire page
        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
        const cookieStr = `googtrans=/en/${code}; path=/; expires=${expireDate.toUTCString()}`;
        // eslint-disable-next-line react-hooks/immutability
        document.cookie = cookieStr;
        // eslint-disable-next-line react-hooks/immutability
        document.cookie = `${cookieStr}; domain=${window.location.hostname}`;

        setLangOpen(false);

        // 3. System Sync - Full Page Refresh for Global Asset Translation
        window.location.reload();
    };

    const navStyle = {
        background: scrolled
            ? 'var(--luna-nav-bg)'
            : 'var(--luna-bg)',
        borderBottom: `1px solid var(--luna-border)`,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.3s ease',
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50" style={navStyle}>
            {/* Hidden Google Translate Target */}
            <div id="google_translate_element" style={{ display: 'none' }} />

            <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to={isLoggedIn ? "/dashboard" : "/home"} className="flex items-center gap-3 group">
                    <div className="p-0.5 rounded-2xl transition-all group-hover:scale-110"
                        style={{ background: 'rgba(46,196,182,0.03)' }}>
                        <img src={logo} alt="Lifeline Logo" className="w-11 h-11 object-contain drop-shadow-2xl" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-extrabold tracking-tight" style={{ color: LUNA.sky }}>
                            Lifeline
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: LUNA.teal }}>
                            Next-Gen HMS
                        </span>
                    </div>
                </Link>

                {/* Utility Controls - Mobile Only Theme Toggle */}
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme}
                        className="md:hidden p-2.5 rounded-xl transition-all hover:bg-white/10"
                        style={{ color: 'var(--luna-teal)' }}
                        aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2 rounded-xl transition-all"
                        style={{ color: LUNA.sky, background: isMenuOpen ? 'rgba(46,196,182,0.1)' : 'transparent' }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu">
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
                    <NavLink to="/home" label={t('home')} />
                    <NavLink to="/about" label={t('about')} />
                    <NavLink to="/contact" label={t('contact')} />
                </div>

                {/* Right Side */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Desktop Theme Toggle */}
                    <button onClick={toggleTheme}
                        className="p-2.5 rounded-xl transition-all hover:bg-white/10"
                        style={{ color: 'var(--luna-teal)' }}
                        aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    {/* Language Switcher */}
                    <div className="relative notranslate" ref={langRef} translate="no">
                        <button id="lang-switcher-btn"
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.22em] transition-all border shadow-sm group relative overflow-hidden"
                            style={{
                                color: 'var(--luna-teal)',
                                background: langOpen ? 'rgba(56,189,248,0.15)' : 'var(--luna-glass)',
                                borderColor: langOpen ? 'var(--luna-teal)' : 'rgba(56,189,248,0.2)',
                                backdropFilter: 'blur(16px)',
                                boxShadow: langOpen ? '0 0 25px rgba(56,189,248,0.15)' : 'none'
                            }}
                            onClick={() => setLangOpen(!langOpen)}
                            aria-label="Switch language">
                            <Globe className={`w-3.5 h-3.5 opacity-80 ${langOpen ? 'rotate-[360deg]' : 'group-hover:rotate-45'} transition-transform duration-700`} />
                            <span className="translate-y-[0.5px]">{currentLang.label}</span>
                            <div className="relative flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-pulse" />
                                <div className="absolute w-3 h-3 rounded-full border border-blue-500/20 animate-ping opacity-30" />
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-60 ${langOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {langOpen && (
                            <div className="absolute right-0 mt-3 w-64 rounded-[2rem] overflow-hidden z-20 animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.3)] border" 
                                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', backdropFilter: 'blur(30px)' }}>
                                <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-1.5">
                                    {LANGUAGES.map(lang => (
                                        <button key={lang.code} className="w-full text-left px-4 py-3 text-[13px] font-bold flex items-center justify-between gap-3 rounded-xl transition-all hover:bg-white/5 group/item"
                                            style={{ color: i18n.language === lang.code ? 'var(--luna-teal)' : 'var(--luna-text-muted)' }}
                                            onClick={() => switchLang(lang.code)}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg transition-transform group-hover/item:scale-125">{lang.flag}</span>
                                                <span className="tracking-tight">{lang.label}</span>
                                            </div>
                                            {i18n.language === lang.code && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    {isLoggedIn ? (
                        <Link to={JSON.parse(localStorage.getItem('lifeline-user') || '{}').role === 'patient' ? '/patient/dashboard' : '/dashboard'} 
                            id="nav-dashboard-btn" className="btn-teal text-sm px-5 py-2.5">
                            <LayoutDashboard className="w-4 h-4" /> {t('dashboard')}
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" id="nav-signin-btn"
                                className="text-sm font-bold transition-all px-4 py-2 rounded-xl"
                                style={{ color: 'var(--luna-text-main)' }}
                                onMouseOver={e => { e.currentTarget.style.color = 'var(--luna-teal)'; e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.color = 'var(--luna-text-main)'; e.currentTarget.style.background = 'transparent'; }}>
                                {t('signIn')}
                            </Link>
                            <Link to="/patient/signup" id="nav-register-btn" className="btn-teal text-sm px-5 py-2.5">
                                {t('register')}
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden p-4 space-y-1 animate-fade-in"
                        style={{ background: 'var(--luna-card)', borderTop: '1px solid var(--luna-border)' }}>
                        {[
                            { to: '/home', label: t('home') },
                            { to: '/about', label: t('about') },
                            { to: '/contact', label: t('contact') },
                        ].map(l => (
                            <Link key={l.to} to={l.to}
                                className="block font-bold py-3 px-4 rounded-xl transition-all text-sm"
                                style={{ color: 'var(--luna-text-main)' }}
                                onMouseOver={e => e.currentTarget.style.background = 'var(--luna-navy)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                {l.label}
                            </Link>
                        ))}
                        <div className="pt-3 space-y-2 notranslate" style={{ borderTop: '1px solid rgba(167,235,242,0.1)' }} translate="no">
                            <div className="px-2 pb-2">
                                <button
                                    onClick={() => setMobileLangOpen(!mobileLangOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all border"
                                    style={{
                                        background: 'var(--luna-navy)',
                                        color: 'var(--luna-teal)',
                                        borderColor: mobileLangOpen ? 'var(--luna-teal)' : 'var(--luna-border)'
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        <span>{currentLang.label}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileLangOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {mobileLangOpen && (
                                    <div className="mt-2 space-y-1 pl-2">
                                        {LANGUAGES.map(lang => (
                                            <button key={lang.code}
                                                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                                                style={{
                                                    color: i18n.language === lang.code ? 'var(--luna-teal)' : 'var(--luna-text-muted)',
                                                    background: i18n.language === lang.code ? 'rgba(56,189,248,0.05)' : 'transparent',
                                                }}
                                                onClick={() => switchLang(lang.code)}>
                                                <div className="flex items-center gap-2">
                                                    <span>{lang.flag}</span>
                                                    <span>{lang.label}</span>
                                                </div>
                                                {i18n.language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {isLoggedIn ? (
                                <Link to={JSON.parse(localStorage.getItem('lifeline-user') || '{}').role === 'patient' ? '/patient/dashboard' : '/dashboard'} 
                                    className="btn-teal w-full text-sm">{t('dashboard')}</Link>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-center font-bold py-2" style={{ color: 'var(--luna-text-main)' }}>{t('signIn')}</Link>
                                    <Link to="/patient/signup" className="btn-teal w-full text-sm">{t('register')}</Link>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </nav >
    );
};

const NavLink = ({ to, label, icon, highlight }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

    return (
        <Link to={to}
            className="flex items-center gap-1.5 transition-all duration-200 text-sm font-bold px-3 py-2 rounded-xl"
            style={{
                color: isActive || highlight ? 'var(--luna-teal)' : 'var(--luna-text-main)',
                background: isActive ? 'var(--luna-navy)' : 'transparent',
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--luna-teal)'; if (!isActive) e.currentTarget.style.background = 'var(--luna-navy)'; }}
            onMouseOut={e => {
                e.currentTarget.style.color = isActive || highlight ? 'var(--luna-teal)' : 'var(--luna-text-main)';
                if (!isActive) e.currentTarget.style.background = 'transparent';
            }}>
            {icon} {label}
        </Link>
    );
};

export default Navbar;
