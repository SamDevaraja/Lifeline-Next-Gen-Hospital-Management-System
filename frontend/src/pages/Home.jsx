import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    ShieldCheck, Activity, Users, ArrowRight, BrainCircuit,
    Stethoscope, CheckCircle, CheckCircle2, HeartPulse, Zap, Globe,
    BarChart3, FileText, Bell, Star, ChevronRight, Play, Sparkles,
    Award, Clock, TrendingUp, Lock, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

const LUNA = {
    sky: '#38bdf8',
    teal: 'var(--luna-teal)',
    blue: 'var(--luna-blue)',
    steel: 'var(--luna-steel)',
    navy: 'var(--luna-navy)',
    dark: 'var(--luna-bg)',
    text: 'var(--luna-text-main)',
    muted: 'var(--luna-text-muted)'
};

// ─── Animated Counter Hook ───
const useCounter = (target, inView, duration = 1500) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = (target / duration) * 16;
        const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setVal(Math.floor(start));
            if (start >= target) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target, duration]);
    return val;
};

// ─── StatNumber ───
const StatNumber = ({ value, suffix = '', prefix = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const num = useCounter(value, inView);
    return <span ref={ref}>{prefix}{num.toLocaleString()}{suffix}</span>;
};

const HeroStats = () => {
    const [stats, setStats] = useState({ uptime: 99.9, hospitals: 0, patients_served: 0, ai_accuracy: 97 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('public-stats/')
            .then(res => setStats(res.data))
            .catch(err => console.error("Public stats error", err))
            .finally(() => setLoading(false));
    }, []);

    const items = [
        { label: 'System Uptime', value: stats.uptime, suffix: '%', sub: 'Reliability SLA', icon: <Activity className="w-6 h-6" /> },
        { label: 'Hospitals', value: stats.hospitals, suffix: '+', sub: 'Global Facilities', icon: <Globe className="w-6 h-6" /> },
        { label: 'Patients Served', value: stats.patients_served, suffix: '+', sub: 'Annually', icon: <HeartPulse className="w-6 h-6" /> },
        { label: 'AI Accuracy', value: stats.ai_accuracy, suffix: '%', sub: 'Diagnostic Assist', icon: <BrainCircuit className="w-6 h-6" /> },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:gap-5">
            {items.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="card-glass group cursor-default text-center p-6 lg:p-8"
                    style={{ border: '1px solid var(--luna-border)' }}>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--luna-teal)' }}>
                        {s.icon}
                    </div>
                    <p className="text-3xl lg:text-4xl font-extrabold mb-1 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                        {loading ? '...' : <StatNumber value={s.value} suffix={s.suffix} />}
                    </p>
                    <p className="text-[12px] lg:text-[14px] font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--luna-teal)' }}>{s.label}</p>
                    <p className="text-[9px] lg:text-[11px] uppercase font-black tracking-[0.2em]" style={{ color: 'var(--luna-teal)', opacity: 0.8 }}>{s.sub}</p>
                </motion.div>
            ))}
        </div>
    );
};

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="overflow-x-hidden">
            {/* ══ HERO ══ */}
            <section className="relative min-h-screen flex items-center overflow-hidden pt-20"
                style={{ background: `var(--luna-bg)` }}>
                {/* Animated orbs */}
                <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.08] animate-float pointer-events-none"
                    style={{ background: 'var(--luna-teal)', filter: 'blur(80px)' }} />
                <div className="absolute bottom-[5%] left-[0%] w-[400px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
                    style={{ background: 'var(--luna-blue)', filter: 'blur(60px)', animationDelay: '1s' }} />
                <div className="absolute top-[40%] left-[25%] w-[200px] h-[200px] rounded-full opacity-[0.05] pointer-events-none"
                    style={{ background: '#ffffff', filter: 'blur(40px)' }} />

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(var(--luna-teal) 1px, transparent 1px), linear-gradient(90deg, var(--luna-teal) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="max-w-7xl mx-auto px-6 py-16 w-full relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left */}
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                            <div className="section-tag mb-8 inline-flex px-4 py-2" style={{ background: 'var(--luna-navy)', color: 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>
                                <Sparkles className="w-4 h-4" /> Internal Staff Intranet v2.1
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black mb-6 leading-[1.15] tracking-tight" style={{ color: 'var(--luna-text-main)' }}>
                                Lifeline Network <br />
                                <span className="text-gradient drop-shadow-lg">Clinical Operations Command</span>
                            </h1>

                            <div className="w-24 h-1.5 rounded-full mb-10" style={{ background: `linear-gradient(90deg, ${LUNA.teal}, transparent)` }} />

                            <p className="text-lg mb-10 leading-relaxed max-w-xl font-bold" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
                                Centralized, secure access gateway for authorized medical practitioners, nursing staff, and facility administrators.
                            </p>

                            <div className="flex flex-wrap items-center gap-5 mb-20">
                                <Link to="/login" id="hero-launch-btn" className="btn-teal px-10 py-4 text-base">
                                    Authenticate Session <Lock className="w-5 h-5 ml-2" />
                                </Link>
                                <Link to="/signup" id="hero-register-btn" className="btn-white px-10 py-4 text-base">
                                    Request Access Clearance
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap items-center gap-6">
                                {[
                                    { icon: <ShieldCheck className="w-4 h-4" />, text: 'HIPAA Compliant' },
                                    { icon: <Lock className="w-4 h-4" />, text: 'ISO 27001 Certified' },
                                    { icon: <Award className="w-4 h-4" />, text: 'WHO Approved' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-black uppercase tracking-wide"
                                        style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                                        {item.icon} {item.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right - Stat Cards */}
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="hidden lg:block">
                            <HeroStats />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
                            fill="var(--luna-bg)" />
                    </svg>
                </div>
            </section>

            {/* ══ FEATURES ══ */}
            <FeaturesSection />

            {/* ══ MODULES ══ */}
            <ModulesSection />

            {/* ══ TESTIMONIALS ══ */}
            <TestimonialsSection />

            {/* ══ CTA ══ */}
            <CTASection t={t} />

            {/* ══ FOOTER ══ */}
            <Footer />
        </div>
    );
};

// ─── Features Section ───
const FeaturesSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const features = [
        { icon: <ShieldCheck className="w-7 h-7" />, title: 'HIPAA Compliant', desc: 'Military-grade encryption and audited access controls protect every patient record at every layer.', color: LUNA.blue },
        { icon: <Activity className="w-7 h-7" />, title: 'Real-Time Monitoring', desc: 'Live dashboards and AI alerts keep clinical staff informed of every critical change instantly.', color: LUNA.steel },
        { icon: <Users className="w-7 h-7" />, title: 'Role-Based Access', desc: 'Distinct, optimized environments for Administrators, Doctors, and Patients — all in one platform.', color: LUNA.teal },
        {
            icon: <BrainCircuit className="w-7 h-7" />, title: 'AI Neural Core', desc: "Lifeline's AI assistant analyzes symptoms, suggests diagnoses, and optimizes appointments automatically.", color: '#6366f1'
        },
        { icon: <Globe className="w-7 h-7" />, title: 'Multilingual Support', desc: 'Available in 7 Indian languages: English, Hindi, Tamil, Telugu, Malayalam, Kannada, and Bengali.', color: '#059669' },
        { icon: <FileText className="w-7 h-7" />, title: 'Billing & Receipts', desc: 'Generate professional PDF invoices, discharge summaries, and payment receipts automatically.', color: '#d97706' },
    ];

    return (
        <section ref={ref} className="py-16" style={{ background: 'var(--luna-bg)' }}>
            <div className="max-w-7xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-12">
                    <div className="section-tag mx-auto inline-flex mb-4">
                        <Zap className="w-4 h-4" /> Core Capabilities
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-5" style={{ color: 'var(--luna-text-main)' }}>
                        Built for Clinical Excellence
                    </h2>
                    <p className="text-lg font-bold leading-relaxed" style={{ color: 'var(--luna-text-main)', opacity: 0.85 }}>
                        Every module is designed with a single priority: better patient outcomes and smarter hospital operations.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            className="card group text-center p-10 relative overflow-hidden"
                            style={{ background: 'var(--luna-card)', border: '1px solid var(--luna-border)' }}
                            id={`feature-card-${i}`}>
                            <div className="absolute top-0 left-0 w-full h-1" style={{ background: f.color, opacity: 0.1 }} />
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-white transition-all group-hover:rotate-6 group-hover:scale-110 shadow-lg"
                                style={{ background: f.color, boxShadow: `0 8px 20px -5px ${f.color}` }}>
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{f.title}</h3>
                            <p className="leading-relaxed text-sm font-bold" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>{f.desc}</p>
                            <div className="mt-8 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest" style={{ color: LUNA.teal }}>
                                <CheckCircle className="w-3.5 h-3.5" /> Clinical Quality API
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── Modules Section ───
const ModulesSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const modules = [
        { icon: <BarChart3 />, title: 'Admin Command', desc: 'Real-time analytics, revenue overview, and hospital-wide insights.', color: '#6366f1' },
        { icon: <Stethoscope />, title: "Medical Gateway", desc: 'Manage ward lists, view schedules, access records, and verify prescriptions.', color: LUNA.steel },
        { icon: <ShieldCheck />, title: "Zero-Trust Architecture", desc: 'Military grade encryption guarding electronic health records cross-departmentally.', color: LUNA.teal },
        { icon: <Calendar />, title: 'Duty Rosters', desc: 'Smart shifts scheduling with AI optimization and conflict detection.', color: '#d97706' },
        { icon: <FileText />, title: 'Asset & Finance', desc: 'Internal auto-generation of inventory requisitions and payroll summaries.', color: '#059669' },
        { icon: <Bell />, title: 'Code Alerts', desc: 'Immediate paging, SMS, and in-app alerts for critical ER influx events.', color: '#ef4444' },
    ];

    return (
        <section ref={ref} className="py-16 bg-[var(--luna-bg)]">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center max-w-3xl mx-auto mb-12">
                    <div className="section-tag mx-auto inline-flex mb-4">
                        <BarChart3 className="w-4 h-4" /> Platform Modules
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--luna-text-main)' }}>
                        Everything Your Hospital Needs
                    </h2>
                    <p className="text-lg font-medium max-w-2xl mx-auto" style={{ color: 'var(--luna-text-muted)' }}>
                        A complete medical operating system — from administration to AI diagnostics — in one unified platform.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((m, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: i * 0.09 }}
                            className="card-clinical p-8 group transition-all duration-300"
                            onMouseOver={e => e.currentTarget.style.borderColor = m.color}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(46,196,182,0.12)'}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg"
                                style={{ background: m.color, boxShadow: `0 8px 15px -5px ${m.color}` }}>
                                {React.cloneElement(m.icon, { className: 'w-6 h-6' })}
                            </div>
                            <h3 className="text-xl font-black mb-3" style={{ color: 'var(--luna-text-main)' }}>{m.title}</h3>
                            <p className="text-sm leading-relaxed font-bold mb-6 uppercase tracking-ticker" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>{m.desc}</p>
                            <div className="w-6 h-1 rounded-full group-hover:w-12 transition-all" style={{ background: m.color }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── Testimonials ───
const TestimonialsSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const reviews = [
        { name: 'Dr. Priya Sharma', role: 'Chief of Cardiology, AIIMS Delhi', text: 'Lifeline transformed how we manage patient records and appointments. The AI diagnostic assistant is remarkable.', rating: 5 },
        { name: 'Dr. Rajesh Kumar', role: 'Director, Apollo Hospitals', text: 'The multilingual support was a game-changer for our diverse patient base. Tamil and Hindi support especially.', rating: 5 },
        { name: 'Admin. Kavitha N.', role: 'Hospital Administrator, Manipal', text: 'Revenue tracking, billing automation, and real-time dashboards have saved us hours of manual work every day.', rating: 5 },
    ];

    return (
        <section ref={ref} className="py-16" style={{ background: 'var(--luna-bg)' }}>
            <div className="max-w-7xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
                    <div className="section-tag mx-auto inline-flex mb-4">
                        <Star className="w-4 h-4" /> Trusted by Professionals
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>
                        What Medical Leaders Say
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((r, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
                            className="card-clinical p-8">
                            <div className="flex gap-1 mb-6">
                                {Array(r.rating).fill(0).map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} />
                                ))}
                            </div>
                            <p className="text-sm leading-relaxed mb-6 italic" style={{ color: 'var(--luna-text-muted)' }}>"{r.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="avatar w-10 h-10 text-xs">{r.name[0]}{r.name.split(' ')[1]?.[0]}</div>
                                <div>
                                    <p className="font-bold text-sm" style={{ color: 'var(--luna-text-main)' }}>{r.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--luna-teal)' }}>{r.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── CTA Section ───
const CTASection = ({ t }) => (
    <section className="py-16 relative overflow-hidden"
        style={{ background: 'var(--luna-card)', borderTop: '1px solid var(--luna-border)' }}>
        <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--luna-teal) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <HeartPulse className="w-14 h-14 mx-auto mb-6 animate-pulse" style={{ color: LUNA.teal }} />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight" style={{ color: 'var(--luna-text-main)' }}>
                Internal Security Perimeter
            </h2>
            <p className="text-lg mb-12 font-bold max-w-2xl mx-auto" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
                Unauthorized access to the clinical terminal is strictly monitored. Ensure your credentials are active.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
                <Link to="/login" id="cta-signup-btn" className="btn-teal px-12 py-5 text-lg">
                    Proceed to Authentication <Lock className="w-5 h-5 ml-2" />
                </Link>

            </div>
        </div>
    </section>
);

export default Home;
