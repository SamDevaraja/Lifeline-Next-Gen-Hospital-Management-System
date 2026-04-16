import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import logo from '/lifeline_themed_v1.svg?v=cachebust123';

const LUNA = {
    sky: 'var(--luna-teal)',
    teal: 'var(--luna-blue)',
    steel: 'var(--luna-steel)',
    dark: 'var(--luna-bg)',
    text: 'var(--luna-text-main)',
    muted: 'var(--luna-text-muted)'
};

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer style={{ background: 'var(--luna-bg)', borderTop: '1px solid var(--luna-border)' }}>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-0.5 rounded-xl transition-all" style={{ background: 'rgba(56,189,248,0.03)' }}>
                                <img src={logo} alt="Lifeline" className="w-9 h-9 object-contain" />
                            </div>
                            <div>
                                <p className="font-extrabold text-lg" style={{ color: LUNA.sky }}>Lifeline</p>
                                <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: LUNA.teal }}>Next-Gen HMS</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold leading-relaxed mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.85 }}>
                            A unified, AI-powered hospital management platform built for modern healthcare institutions.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" aria-label="Social link"
                                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                                    style={{ background: 'var(--luna-navy)', color: 'var(--luna-teal)' }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'var(--luna-blue)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'var(--luna-navy)'; e.currentTarget.style.color = 'var(--luna-teal)'; }}>
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: LUNA.teal }}>Navigation</p>
                        <ul className="space-y-3">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/about', label: 'Our Mission' },
                                { to: '/ai-assistant', label: 'AI Assistant' },
                                { to: '/contact', label: 'Support' },
                                { to: '/login', label: 'Sign In' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to}
                                        className="text-sm font-bold transition-all"
                                        style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}
                                        onMouseOver={e => e.currentTarget.style.color = 'var(--luna-teal)'}
                                        onMouseOut={e => e.currentTarget.style.color = 'var(--luna-text-main)'}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: LUNA.teal }}>Services</p>
                        <ul className="space-y-3">
                            {[
                                'Patient Management',
                                'Doctor Scheduling',
                                'AI Diagnostics',
                                'Billing & Invoices',
                                'Medical Records',
                                'Notifications',
                            ].map(s => (
                                <li key={s}>
                                    <span className="text-sm font-bold" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: LUNA.teal }}>Contact & Emergency</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: LUNA.teal }} />
                                <div>
                                    <p className="text-xs font-bold text-red-500 uppercase">Emergency Hotline</p>
                                    <p className="text-sm font-extrabold" style={{ color: 'var(--luna-teal)' }}>+91 7395954829</p>
                                    <p className="text-xs" style={{ color: 'var(--luna-text-dim)' }}>Available 24/7</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                <a href="mailto:support@lifeline.health"
                                    className="text-sm font-bold transition-all" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}
                                    onMouseOver={e => e.currentTarget.style.color = 'var(--luna-teal)'}
                                    onMouseOut={e => e.currentTarget.style.color = 'var(--luna-text-main)'}>
                                    support@lifeline.health
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--luna-teal)' }} />
                                <p className="text-sm" style={{ color: 'var(--luna-text-muted)' }}>
                                    Lifeline Medical Tower,<br />Bangalore — 560001, India
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="divider" />

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-xs" style={{ color: 'var(--luna-text-muted)' }}>
                        © {year} Lifeline HMS. All rights reserved.
                    </p>
                    <div className="flex flex-wrap gap-6 text-xs justify-center md:justify-end" style={{ color: 'var(--luna-text-muted)' }}>
                        {[
                            { to: '/privacy-policy', label: 'Privacy Policy' },
                            { to: '/terms-of-service', label: 'Terms of Service' },
                            { to: '/cookie-policy', label: 'Cookie Policy' },
                            { to: '/hipaa-notice', label: 'HIPAA Notice' },
                        ].map(link => (
                            <Link key={link.to} to={link.to}
                                className="font-bold transition-all"
                                style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--luna-teal)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--luna-text-main)'}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
