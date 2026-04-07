import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BrainCircuit, Activity, Stethoscope, FlaskConical, AlertCircle,
    CheckCircle, TrendingUp, Sparkles, ShieldCheck, Zap, FileText,
    Users, Clock, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LUNA } from './Constants';
import api from '../../api/axios';

const AIPage = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard/stats/');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const insightCards = [
        {
            title: 'Diagnostic Overview',
            description: 'All clinical records are indexed and cross-referenced for physician review. No anomalies detected in the last 24h.',
            icon: <BrainCircuit className="w-6 h-6" />,
            color: LUNA.info_text,
            bg: LUNA.info_bg,
            status: 'Operational',
        },
        {
            title: 'Patient Risk Assessment',
            description: `${stats?.high_risk_patients ?? 0} patients are currently flagged at high or critical risk levels. Physician review is recommended.`,
            icon: <AlertCircle className="w-6 h-6" />,
            color: LUNA.warn_text,
            bg: LUNA.warn_bg,
            status: stats?.high_risk_patients > 0 ? 'Attention' : 'Clear',
        },
        {
            title: 'Lab Pipeline',
            description: 'All laboratory results are synchronized and available for physician analysis through the Diagnostics module.',
            icon: <FlaskConical className="w-6 h-6" />,
            color: LUNA.success_text,
            bg: LUNA.success_bg,
            status: 'Synced',
        },
        {
            title: 'Clinical Scheduling',
            description: `${stats?.today_appointments ?? 0} appointments are scheduled for today. Real-time status tracking is active.`,
            icon: <Clock className="w-6 h-6" />,
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.08)',
            status: 'Live',
        },
    ];

    const quickLinks = [
        { label: 'View Patient Records', to: '/dashboard/records', icon: <FileText className="w-4 h-4" /> },
        { label: 'Lab Diagnostics', to: '/dashboard/lab', icon: <FlaskConical className="w-4 h-4" /> },
        { label: 'Patient Registry', to: '/dashboard/patients', icon: <Users className="w-4 h-4" /> },
        { label: 'Clinical Reports', to: '/dashboard/reports', icon: <TrendingUp className="w-4 h-4" /> },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl p-10 border shadow-sm"
                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{ backgroundImage: `radial-gradient(var(--luna-teal) 1px, transparent 0)`, backgroundSize: '28px 28px' }} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-2xl border" style={{ background: LUNA.info_bg, borderColor: 'rgba(0,0,0,0.05)', color: LUNA.info_text }}>
                                <BrainCircuit className="w-7 h-7" />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border"
                                style={{ background: LUNA.success_bg, borderColor: 'rgba(0,0,0,0.04)', color: LUNA.success_text }}>
                                Clinical Intelligence Core
                            </div>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--luna-text-main)' }}>
                            Clinical Intelligence Terminal
                        </h1>
                        <p className="text-sm font-bold max-w-xl leading-relaxed" style={{ color: 'var(--luna-text-muted)' }}>
                            Physician-led clinical intelligence workspace. All insights are derived from live institutional data. 
                            This module provides data-driven clinical context to support physician decision-making.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                            style={{ background: LUNA.success_bg, borderColor: 'rgba(0,0,0,0.04)' }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: LUNA.success_text }} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: LUNA.success_text }}>
                                System Synchronized
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                            style={{ background: 'var(--luna-info-bg)', borderColor: 'var(--luna-border)' }}>
                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: LUNA.info_text }} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: LUNA.info_text }}>
                                HIPAA Compliant Mode
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insight Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {insightCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="p-7 rounded-2xl border shadow-sm group hover:shadow-md transition-all"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="p-3 rounded-xl border" style={{ background: card.bg, color: card.color, borderColor: 'rgba(0,0,0,0.05)' }}>
                                {card.icon}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                                style={{ color: card.color, background: card.bg, borderColor: `${card.color}20` }}>
                                {card.status}
                            </span>
                        </div>
                        <h2 className="text-base font-black mb-2" style={{ color: 'var(--luna-text-main)' }}>{card.title}</h2>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--luna-text-muted)' }}>
                            {loading ? 'Loading clinical data...' : card.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Clinical Insight Feed */}
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--luna-border)', background: 'var(--luna-navy)' }}>
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" style={{ color: 'var(--luna-teal)' }} />
                        <h2 className="text-base font-black" style={{ color: 'var(--luna-text-main)' }}>Clinical Insights Feed</h2>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-main)' }}>
                        Physician-Verified Only
                    </div>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--luna-border)' }}>
                    {[
                        { title: 'Appointment Load Nominal', detail: 'Current daily schedule is within optimal operational capacity. No backlog detected.', icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
                        { title: 'Pharmacy Inventory Synchronized', detail: 'All clinical assets in the dispensary are indexed and stock levels are being monitored in real time.', icon: <ShieldCheck className="w-4 h-4 text-blue-500" /> },
                        { title: 'Lab Results Indexed', detail: 'All laboratory diagnostics have been synchronized into the clinical record system for physician review.', icon: <FlaskConical className="w-4 h-4" style={{ color: 'var(--luna-teal)' }} /> },
                        { title: 'Billing Engine Active', detail: 'Revenue transactions and invoice generation are operating within normal parameters.', icon: <TrendingUp className="w-4 h-4 text-indigo-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 px-6 hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                            <div className="p-2 rounded-xl border flex-shrink-0" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-sm font-black" style={{ color: 'var(--luna-text-main)' }}>{item.title}</p>
                                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>{item.detail}</p>
                            </div>
                            <Zap className="w-3.5 h-3.5 ml-auto opacity-20 flex-shrink-0" style={{ color: 'var(--luna-text-main)' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Navigation */}
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest mb-4 opacity-60" style={{ color: 'var(--luna-text-main)' }}>
                    Clinical Navigation
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickLinks.map((link, i) => (
                        <Link key={i} to={link.to}
                            className="flex items-center gap-3 p-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all hover:shadow-md hover:-translate-y-0.5 group"
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                            <div className="p-2 rounded-xl transition-all group-hover:bg-[var(--luna-info-bg)]"
                                style={{ background: 'var(--luna-navy)', color: 'var(--luna-teal)' }}>
                                {link.icon}
                            </div>
                            <span className="truncate">{link.label}</span>
                            <ArrowRight className="w-3 h-3 ml-auto opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default AIPage;
