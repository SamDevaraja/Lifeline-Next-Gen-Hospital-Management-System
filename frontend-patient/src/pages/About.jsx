import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, ShieldCheck, BrainCircuit, Globe, Award, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LUNA = {
    navy: 'var(--luna-teal)',
    blue: 'var(--luna-blue)',
    steel: 'var(--luna-steel)',
    wash: 'var(--luna-navy)',
    bg: 'var(--luna-bg)',
    text: 'var(--luna-text-main)',
    muted: 'var(--luna-text-muted)',
    dim: 'var(--luna-text-dim)'
};

const About = () => (
    <div className="min-h-screen" style={{ background: 'var(--luna-bg)' }}>
        {/* Institutional Hero */}
        <section className="pt-32 pb-12 relative overflow-hidden">
            {/* Background Architecture */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.1]"
                style={{ background: 'var(--luna-blue)', filter: 'blur(120px)' }} />
            <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full opacity-[0.05]"
                style={{ background: 'var(--luna-teal)', filter: 'blur(80px)' }} />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="section-tag mx-auto inline-flex mb-8 uppercase tracking-[0.3em] font-black"
                            style={{ background: 'var(--luna-navy)', color: 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>
                            <HeartPulse className="w-4 h-4" /> Mission Protocol
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>
                            The Logic of <br />
                            <span className="text-gradient">Modern Healing.</span>
                        </h1>
                        <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-bold tracking-tight" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
                            Engineered for high-performing clinical environments, Lifeline integrates AI intelligence with empathetic human care to establish the new global standard for hospital management.
                        </p>

                        <div className="flex flex-wrap justify-center gap-8 mb-16">
                            {[
                                { label: 'Global Reach', value: '450+', sub: 'Medical Facilities' },
                                { label: 'Data Integrity', value: '99.9%', sub: 'Uptime Protocol' },
                                { label: 'AI Accuracy', value: '97.2%', sub: 'Diagnostic Assist' },
                            ].map((s, i) => (
                                <div key={i} className="text-center px-8 border-r last:border-0" style={{ borderColor: 'var(--luna-border)' }}>
                                    <p className="text-4xl font-black tracking-tighter mb-1" style={{ color: 'var(--luna-blue)' }}>{s.value}</p>
                                    <p className="text-[11px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--luna-teal)' }}>{s.label}</p>
                                    <p className="text-[10px] font-black opacity-60 mt-0.5 uppercase" style={{ color: 'var(--luna-text-main)' }}>{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Clinical Design Pillars */}
        <section className="py-12 relative overflow-hidden" style={{ background: 'var(--luna-nav-bg)' }}>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8">
                    <div className="max-w-2xl">
                        <div className="section-tag inline-flex mb-4 uppercase tracking-[.2em] font-black" style={{ background: 'var(--luna-navy)', color: 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>
                            <ShieldCheck className="w-4 h-4" /> Our Pillars
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Foundation of Excellence</h2>
                    </div>
                    <p className="text-lg font-black tracking-tight md:text-right max-w-md" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                        Our core operational principles drive every clinical module we deploy into the field.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <ShieldCheck className="w-8 h-8" />, title: 'Absolute Data Privacy', desc: 'Implementing HIPAA and military-grade AES-256 encryption at every touchpoint of patient data.', color: 'var(--luna-blue)' },
                        { icon: <BrainCircuit className="w-8 h-8" />, title: 'Cognitive Assistance', desc: 'Leveraging AI Neural networks to assist specialists in real-time diagnostic and rescheduling protocols.', color: 'var(--luna-blue)' },
                        { icon: <Globe className="w-8 h-8" />, title: 'Global Interoperability', desc: 'Seamlessly syncing with international healthcare standards to eliminate boundaries in patient care.', color: 'var(--luna-blue)' },
                    ].map((v, i) => (
                        <div key={i} className="card-clinical p-12 group transition-all hover:-translate-y-2 border shadow-2xl" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                            <div className="w-16 h-16 mb-8 rounded-2.5xl flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ background: 'var(--luna-navy)', color: v.color }}>
                                {v.icon}
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{v.title}</h3>
                            <p className="text-[16px] leading-relaxed font-bold" style={{ color: 'var(--luna-text-main)', opacity: 0.85 }}>{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Governance & Leadership */}
        <section className="py-12" style={{ background: 'var(--luna-bg)' }}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8">
                    <div>
                        <div className="section-tag inline-flex mb-4 uppercase tracking-[.2em] font-black" style={{ borderColor: 'var(--luna-border)' }}>
                            <Users className="w-4 h-4" /> Leadership
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Medical Governance Board</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { name: 'Dr.Saashwati', role: 'Chief Medical Officer', dept: 'Clinical Compliance', tag: 'MD/Surgery' },
                        { name: 'Hong Emily', role: 'Chief Technology Officer', dept: 'AI Neural Core', tag: 'PhD AI' },
                        { name: 'Tanushree', role: 'Compliance Officer', dept: 'Legal & Ethics', tag: 'LLB/Ethics' },
                        { name: 'Shrutika', role: 'Lead Data Architect', dept: 'System Integrity', tag: 'Cloud Sec' },
                    ].map((m, i) => (
                        <div key={i} className="card-clinical p-8 transition-all hover:scale-[1.02]" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="avatar w-14 h-14 text-xl font-black shadow-lg border" style={{ background: 'var(--luna-navy)', color: 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>{m.name[0]}</div>
                                <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border" style={{ background: 'var(--luna-navy)', color: 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>{m.tag}</div>
                            </div>
                            <p className="font-black text-lg mb-1" style={{ color: 'var(--luna-text-main)' }}>{m.name}</p>
                            <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--luna-blue)' }}>{m.role}</p>
                            <div className="h-px w-full bg-blue-500/5 mb-3" />
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--luna-text-muted)' }}>{m.dept}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>



        {/* Action Sector */}
        <section className="py-12 relative overflow-hidden" style={{ background: 'var(--luna-card)', borderTop: '1px solid var(--luna-border)' }}>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--luna-blue) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>Ready for the Next Generation of Care?</h2>
                <p className="text-[20px] font-black mb-12 max-w-2xl mx-auto" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>Join the elite circle of healthcare facilities using the Lifeline Intelligence System.</p>
                <div className="flex justify-center gap-6">
                    <Link to="/signup" className="btn-teal px-12 py-5 text-sm font-black uppercase tracking-widest shadow-2xl">
                        Initialize Console <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            </div>
        </section>

        <Footer />
    </div>
);

export default About;
