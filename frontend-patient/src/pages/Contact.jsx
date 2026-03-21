import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HeartPulse, Plus, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
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

const Contact = () => {
    const { theme } = useTheme();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            toast.success('Message sent! Our support team will respond within 24 hours.');
            setForm({ name: '', email: '', subject: '', message: '' });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--luna-bg)' }}>
            <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none" />

            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600, background: 'var(--luna-card)', color: 'var(--luna-text-main)', border: '1px solid var(--luna-border)' } }} />

            {/* Institutional Hero - Reduced Scale for Professionalism */}
            <section className="pt-32 pb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full opacity-[0.08]"
                    style={{ background: 'radial-gradient(circle, var(--luna-blue) 0%, transparent 70%)', filter: 'blur(150px)' }} />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="section-tag mx-auto inline-flex mb-6 uppercase tracking-[0.4em] font-black"
                            style={{ background: 'var(--luna-navy)', color: 'var(--luna-blue)', borderColor: 'var(--luna-border)' }}>
                            <MessageSquare className="w-3.5 h-3.5" /> Support Protocol v3.5
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-none tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>
                            Institutional <br />
                            <span className="text-gradient">Axis Support.</span>
                        </h1>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-bold tracking-tight" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            Global clinical communication grid providing real-time data bridges between specialists and patients.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-6 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* Compact Command Column */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="px-1">
                                <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--luna-text-main)' }}>Registry Access</h2>
                                <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.2em]" style={{ color: 'var(--luna-teal)' }}>Clinical Support Nodes</p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl border"
                                style={{
                                    background: 'var(--luna-card)',
                                    borderColor: 'rgba(239, 68, 68, 0.2)',
                                    boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.15)'
                                }}>
                                {/* Background HUD Graphics */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                                <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                                    <HeartPulse className="w-48 h-48 text-red-600" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-xl shadow-red-600/30 ring-4 ring-red-500/10">
                                                <HeartPulse className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-red-600 text-[10px] uppercase tracking-[0.3em] mb-0.5">Critical Trauma Axis</p>
                                                <p className="text-[9px] font-black opacity-40 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>Emergency Dispatch Terminal</p>
                                            </div>
                                        </div>
                                        <div className="badge-live bg-red-600/10 text-red-600 border-red-600/20 text-[9px] font-black px-3 py-1">LIVE</div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-6xl font-black text-red-600 mb-2 tracking-tighter tabular-nums font-mono">108/911</h3>
                                        <div className="h-1 w-full bg-red-600/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-red-600"
                                                animate={{ width: ["0%", "100%"] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5" style={{ color: 'var(--luna-text-main)' }}>
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                                            </span>
                                            Global Protocol ACTIVE
                                        </p>
                                        <p className="text-[10px] font-black opacity-30 italic" style={{ color: 'var(--luna-text-main)' }}>SEC-L0</p>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="space-y-3">
                                {[
                                    { icon: <Phone className="w-4 h-4" />, label: 'Switchboard', val: '+91 80 4567 8900', color: 'var(--luna-blue)' },
                                    { icon: <Mail className="w-4 h-4" />, label: 'Registry Logs', val: 'systems@lifeline.health', color: 'var(--luna-teal)' },
                                    { icon: <MapPin className="w-4 h-4" />, label: 'Command HQ', val: 'Bangalore, India', color: 'var(--luna-steel)' },
                                ].map((c, i) => (
                                    <motion.div key={i}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all hover:shadow-lg"
                                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
                                            style={{ background: 'var(--luna-navy)', color: c.color }}>
                                            {c.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 mb-0.5" style={{ color: 'var(--luna-text-main)' }}>{c.label}</p>
                                            <p className="font-black text-base tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{c.val}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Streamlined Transmission Console */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-8 card-clinical p-8 border relative overflow-hidden"
                            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>

                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500 opacity-[0.02] rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2.5xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Support Uplink</h2>
                                            <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.25em]" style={{ color: 'var(--luna-teal)' }}>Encrypted Clinical Handshake</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="badge-live px-4 py-1.5 text-[10px] shadow-sm font-black border-blue-500/20">Protocol ACTIVE</div>
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest" style={{ color: 'var(--luna-text-main)' }}>Latency: 12ms</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6 flex flex-col">
                                        {/* 01. Origin Authentication */}
                                        <div className="p-6 rounded-2xl bg-blue-500/[0.02] border border-blue-500/10 space-y-6">
                                            <p className="text-[11px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--luna-text-main)' }}>01. Origin Authentication</p>
                                            {[
                                                { name: 'name', label: 'Personnel Name', type: 'text', placeholder: 'Identification' },
                                                { name: 'email', label: 'Email Axis', type: 'email', placeholder: 'name@node.com' }
                                            ].map((field) => (
                                                <div key={field.name} className="group">
                                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-2.5 opacity-70 transition-all group-focus-within:text-blue-500"
                                                        style={{ color: 'var(--luna-text-main)' }}>
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        value={form[field.name]}
                                                        onChange={update(field.name)}
                                                        className="w-full py-3.5 px-5 text-sm font-bold rounded-xl transition-all border outline-none focus:ring-4 focus:ring-blue-500/10"
                                                        style={{ 
                                                            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(37, 99, 235, 0.02)',
                                                            color: 'var(--luna-text-main)',
                                                            borderColor: 'var(--luna-border)'
                                                        }}
                                                        placeholder={field.placeholder}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* 02. Priority Routing */}
                                        <div className="p-6 rounded-2xl bg-blue-500/[0.02] border border-blue-500/10 space-y-4 flex-1">
                                            <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: 'var(--luna-text-main)' }}>02. Priority Routing</p>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-2.5 opacity-70 transition-all group-focus-within:text-blue-500"
                                                style={{ color: 'var(--luna-text-main)' }}>
                                                Priority Vector
                                            </label>
                                            <select
                                                value={form.subject}
                                                onChange={update('subject')}
                                                className="w-full py-3.5 px-5 text-sm font-bold rounded-xl transition-all border outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                                                style={{ 
                                                    background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(37, 99, 235, 0.02)',
                                                    color: 'var(--luna-text-main)',
                                                    borderColor: 'var(--luna-border)'
                                                }}
                                                required
                                            >
                                                <option value="" className="bg-slate-900">Select Protocol</option>
                                                {['Emergency', 'Integration', 'Technical Registry'].map(o => <option key={o} className="bg-slate-900">{o}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 03. Payload Vector */}
                                    <div className="flex flex-col bg-blue-500/[0.02] border border-blue-500/10 p-6 rounded-2xl">
                                        <div className="flex flex-col flex-1 group">
                                            <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-6" style={{ color: 'var(--luna-text-main)' }}>03. Payload Vector</p>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] mb-2.5 opacity-70 transition-all group-focus-within:text-blue-500"
                                                style={{ color: 'var(--luna-text-main)' }}>
                                                Message Payload
                                            </label>
                                            <textarea
                                                rows={8}
                                                value={form.message}
                                                onChange={update('message')}
                                                className="flex-1 w-full py-4 px-5 text-sm font-bold rounded-xl transition-all border outline-none focus:ring-4 focus:ring-blue-500/10 resize-none shadow-inner"
                                                style={{ 
                                                    background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(37, 99, 235, 0.02)',
                                                    color: 'var(--luna-text-main)',
                                                    borderColor: 'var(--luna-border)'
                                                }}
                                                placeholder="Clinical context..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-teal w-full py-4 text-[11px] font-black uppercase tracking-[0.4em] shadow-lg hover:shadow-blue-500/20"
                                        >
                                            {loading ? 'MODULATING...' : (
                                                <span className="flex items-center justify-center gap-3">
                                                    <Send className="w-5 h-5" />
                                                    Initialize Transmission
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Knowledge Base Track - High Density FAQ */}
            <section className="py-12 mt-8 relative overflow-hidden" style={{ background: 'var(--luna-nav-bg)' }}>
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="flex items-center justify-between mb-8 border-l-4 border-blue-500 pl-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--luna-text-main)' }}>
                                Intelligence <span className="text-gradient">FAQ</span>
                            </h2>
                            <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--luna-text-muted)' }}>Protocols v3.5</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {[
                            { q: 'Institutional Access Protocol', a: 'Access control is governed by multi-factor authentication (MFA) for patients and biometric credentialing for clinical personnel, ensuring comprehensive security for sensitive institutional records.' },
                            { q: 'Data Encryption Excellence', a: 'Our infrastructure implements industry-leading AES-256 encryption at rest and TLS 1.3 for all data in transit, maintaining the absolute integrity of clinical transmissions.' },
                            { q: 'AI Diagnostics Integration', a: 'The Lifeline AI Core synchronizes directly with clinical laboratory nodes, facilitating automated pathology mapping and high-precision diagnostic support for medical professionals.' },
                            { q: 'Secure Billing Gateways', a: 'Financial transactions are processed through enterprise-grade, PCI-DSS Level 1 compliant gateways, utilizing tokenization to safeguard fiscal data and patient privacy.' },
                        ].map((faq, i) => (
                            <details key={i} className="card-clinical group cursor-pointer border shadow-sm transition-all hover:bg-blue-500/[0.01]"
                                style={{ padding: '1.25rem 1.75rem', background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                                <summary className="font-black text-[15px] list-none flex items-center justify-between" style={{ color: 'var(--luna-text-main)' }}>
                                    <span className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-[10px] font-black border border-blue-500/10">0{i + 1}</div>
                                        {faq.q}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-green-500/10 text-green-600 border border-green-500/20">Verified</span>
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-open:rotate-[135deg] bg-blue-500/10 text-blue-500" >
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </summary>
                                <div className="mt-4 pt-6 border-t border-dashed border-blue-500/20 text-[14px] font-bold leading-relaxed" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
