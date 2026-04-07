import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, Lock, Eye, Database, Globe, Bell, ChevronRight, 
    FileText, Users, AlertTriangle, Scale, RefreshCw,
    Cookie, Settings, BarChart3, ShieldOff, AlertCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const Section = ({ icon: Icon, title, children }) => (
    <motion.div {...fadeUp} className="mb-12">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl" style={{ background: 'var(--luna-navy)', color: 'var(--luna-teal)', border: '1px solid var(--luna-border)' }}>
                <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>{title}</h2>
        </div>
        <div className="pl-0 md:pl-16 text-[15px] font-bold leading-relaxed space-y-4" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
            {children}
        </div>
    </motion.div>
);

// --- Privacy Policy ---
export const PrivacyPolicy = () => {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen" style={{ background: 'var(--luna-bg)' }}>
            <div className="pt-28 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(var(--luna-teal) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div {...fadeUp}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-6"
                            style={{ background: 'rgba(56,189,248,0.08)', color: 'var(--luna-teal)', borderColor: 'rgba(56,189,248,0.2)' }}>
                            <ShieldCheck className="w-3.5 h-3.5" /> Legal Document
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--luna-text-main)' }}>
                            Privacy Policy
                        </h1>
                        <p className="text-lg font-bold mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            How Lifeline HMS collects, uses, and protects your information.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>
                            <span>Effective: January 1, 2025</span>
                            <span>•</span>
                            <span>Last Updated: March 1, 2025</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="rounded-3xl p-8 md:p-12 border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <Section icon={Eye} title="Information We Collect">
                        <p>Lifeline HMS collects information to provide better services to all our users. We collect information in the following ways:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Personal identifiers such as name, email address, phone number, and date of birth.',
                                'Medical and health information including diagnoses, treatment records, prescriptions, and lab results.',
                                'Account credentials and authentication data when you register for our platform.',
                                'Usage data including pages visited, features used, and session duration for analytics and improvement.',
                                'Device and browser information for security and compatibility purposes.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={Database} title="How We Use Your Information">
                        <p>We use the information we collect from all our services for the following purposes:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Providing, maintaining, and improving the Lifeline HMS platform and its clinical features.',
                                'Processing medical appointments, billing, prescriptions, and health record management.',
                                'Communicating with you about your account, appointments, and important health updates.',
                                'Ensuring the security and integrity of our platform against unauthorised access.',
                                'Complying with applicable legal obligations under Indian healthcare regulations.',
                                'AI-powered clinical assistance, diagnostic support, and personalised health recommendations.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={Lock} title="Data Security & Protection">
                        <p>The security of your health data is our highest priority. We implement industry-leading security measures:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.',
                                'Role-based access controls (RBAC) ensure that only authorised personnel can access patient records.',
                                'Regular third-party security audits and penetration testing are conducted quarterly.',
                                'Multi-factor authentication (MFA) is available and strongly recommended for all accounts.',
                                'Audit logs are maintained for all data access events for 7 years as per healthcare standards.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={Globe} title="Data Sharing & Third Parties">
                        <p>We do not sell your personal health information. We may share information only in the following limited circumstances:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'With treating physicians, nurses, and healthcare providers directly involved in your care.',
                                'With contracted service providers (e.g., cloud hosting, payment processors) under strict data processing agreements.',
                                'To comply with legal obligations, court orders, or government authority requests.',
                                'In the event of a business merger or acquisition, with appropriate notice to users.',
                                'With your explicit written consent for research or educational purposes.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={Bell} title="Your Rights">
                        <p>As a user of Lifeline HMS, you have the following rights regarding your personal data:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Right to access: Request a copy of all personal data we hold about you.',
                                'Right to rectify: Correct any inaccurate or incomplete information in your records.',
                                'Right to erasure: Request deletion of your personal data, subject to legal retention requirements.',
                                'Right to portability: Receive your health records in a machine-readable format.',
                                'Right to object: Opt out of processing for marketing or non-essential purposes at any time.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <div className="mt-12 p-8 rounded-3xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--luna-teal)' }}>Questions about this policy?</p>
                        <p className="text-base font-bold mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
                            Contact our Data Protection Officer at{' '}
                            <a href="mailto:privacy@lifeline.health" className="font-black underline decoration-2 underline-offset-4" style={{ color: 'var(--luna-teal)' }}>privacy@lifeline.health</a>
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link to="/patient/contact" className="btn-teal text-xs px-5 py-2.5">Contact Support</Link>
                            <button onClick={() => navigate(-1)} className="text-xs font-bold px-5 py-2.5 rounded-xl border" style={{ color: 'var(--luna-text-muted)', borderColor: 'var(--luna-border)' }}>← Go Back</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

// --- Terms of Service ---
export const TermsOfService = () => {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen" style={{ background: 'var(--luna-bg)' }}>
            <div className="pt-28 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(var(--luna-teal) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div {...fadeUp}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-6"
                            style={{ background: 'rgba(56,189,248,0.08)', color: 'var(--luna-teal)', borderColor: 'rgba(56,189,248,0.2)' }}>
                            <FileText className="w-3.5 h-3.5" /> Legal Document
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--luna-text-main)' }}>
                            Terms of Service
                        </h1>
                        <p className="text-lg font-bold mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            The rules, guidelines, and agreements governing your use of the Lifeline HMS platform.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>
                            <span>Effective: January 1, 2025</span>
                            <span>•</span>
                            <span>Last Updated: March 1, 2025</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="rounded-3xl p-8 md:p-12 border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <Section icon={FileText} title="Acceptance of Terms">
                        <p>By accessing or using the Lifeline Hospital Management System ("Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                        <p>If you do not agree to these terms, you must immediately discontinue use of the Service. Use of the Service by employees or agents of a healthcare institution constitutes agreement on behalf of that institution.</p>
                    </Section>

                    <Section icon={Users} title="User Accounts & Eligibility">
                        <p>To use Lifeline HMS, you must:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Be at least 18 years of age, or have verifiable legal guardian consent.',
                                'Be a licensed healthcare professional, authorised hospital staff, or a registered patient.',
                                'Provide accurate, current, and complete information during the registration process.',
                                'Maintain the security of your account credentials and not share them with any third party.',
                                'Immediately notify us of any unauthorised use of your account or security breach.',
                                'Comply with all applicable local, state, and national healthcare legislation.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={AlertTriangle} title="Prohibited Uses">
                        <p>You agree not to misuse the Lifeline HMS platform. The following activities are strictly prohibited:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Accessing, tampering with, or using non-public areas of the platform without authorisation.',
                                'Uploading false, misleading, or fraudulent patient or medical data.',
                                'Attempting to probe, scan, or test the system for vulnerabilities or bypass security measures.',
                                'Using the AI diagnostic tools as a substitute for professional medical judgement in critical care.',
                                'Reproducing, distributing, or creating derivative works from any platform content without written consent.',
                                'Engaging in any activity that disrupts or interferes with the platform\'s performance or other users.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={Scale} title="Limitation of Liability">
                        <p>To the maximum extent permitted by applicable law, Lifeline HMS and its affiliates shall not be liable for:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Any indirect, incidental, special, consequential, or punitive damages arising from use of the Service.',
                                'Clinical decisions made by healthcare providers that rely solely on AI-generated recommendations.',
                                'Loss of data, revenue, or profits resulting from service interruptions or technical failures.',
                                'Actions taken by third-party integrations or API partners connected to the platform.',
                                'Any unauthorised access to or use of our servers and any personal information stored therein.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={RefreshCw} title="Modifications to Terms">
                        <p>We reserve the right to modify these Terms of Service at any time. When we make material changes:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'We will notify registered users via email and an in-platform notification at least 30 days in advance.',
                                'The "Last Updated" date at the top of this page will be revised accordingly.',
                                'Continued use of the Service after the effective date constitutes your acceptance of the new terms.',
                                'If you do not agree with the modified terms, you must stop using the platform and may request account closure.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p>These Terms shall be governed by the laws of India, with jurisdiction in the courts of Bangalore, Karnataka.</p>
                    </Section>

                    <div className="mt-12 p-8 rounded-3xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--luna-teal)' }}>Questions about these terms?</p>
                        <p className="text-base font-bold mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
                            Contact our legal team at{' '}
                            <a href="mailto:legal@lifeline.health" className="font-black underline decoration-2 underline-offset-4" style={{ color: 'var(--luna-teal)' }}>legal@lifeline.health</a>
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link to="/patient/contact" className="btn-teal text-xs px-5 py-2.5">Contact Support</Link>
                            <button onClick={() => navigate(-1)} className="text-xs font-bold px-5 py-2.5 rounded-xl border" style={{ color: 'var(--luna-text-muted)', borderColor: 'var(--luna-border)' }}>← Go Back</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

// --- Cookie Policy ---
const COOKIE_TYPES = [
    {
        name: 'Strictly Necessary',
        badge: 'Always Active',
        badgeColor: '#10b981',
        desc: 'These cookies are essential for the platform to function and cannot be switched off. They are set in response to actions made by you, such as logging in, filling in forms, or setting language preferences.',
        examples: ['Authentication token (login session)', 'Language preference (googtrans)', 'CSRF protection cookie', 'Theme preference']
    },
    {
        name: 'Functional',
        badge: 'Optional',
        badgeColor: '#6366f1',
        desc: 'These cookies enable enhanced functionality and personalisation, such as remembering your dashboard layout preferences or your last-visited section.',
        examples: ['Dashboard layout state', 'Notification preferences', 'Last visited section']
    },
    {
        name: 'Analytics',
        badge: 'Optional',
        badgeColor: '#f59e0b',
        desc: 'We use analytics cookies to understand how users interact with our platform to improve performance and user experience. All analytics data is anonymised.',
        examples: ['Page view counts', 'Feature usage frequency', 'Session duration']
    },
    {
        name: 'Third-Party Translation',
        badge: 'Optional',
        badgeColor: '#38bdf8',
        desc: 'The Google Translate integration sets a cookie to remember your selected language across all pages of the platform.',
        examples: ['googtrans (language selection)', 'NID (Google session)']
    },
];

export const CookiePolicy = () => {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen" style={{ background: 'var(--luna-bg)' }}>
            <div className="pt-28 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(var(--luna-teal) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div {...fadeUp}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-6"
                            style={{ background: 'rgba(56,189,248,0.08)', color: 'var(--luna-teal)', borderColor: 'rgba(56,189,248,0.2)' }}>
                            <Cookie className="w-3.5 h-3.5" /> Legal Document
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--luna-text-main)' }}>
                            Cookie Policy
                        </h1>
                        <p className="text-lg font-bold mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            How Lifeline HMS uses cookies and similar technologies to improve your experience.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>
                            <span>Effective: January 1, 2025</span>
                            <span>•</span>
                            <span>Last Updated: March 1, 2025</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="rounded-3xl p-8 md:p-12 border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <Section icon={Cookie} title="What Are Cookies?">
                        <p>Cookies are small text files that are placed on your device when you visit a website or web application. They are widely used to make platforms work correctly, improve their efficiency, and provide information to the site's owners.</p>
                        <p>Lifeline HMS uses cookies and similar browser storage technologies (localStorage, sessionStorage) to maintain your session, remember your preferences, and enable critical security functions.</p>
                    </Section>

                    <motion.div {...fadeUp} className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl" style={{ background: 'var(--luna-navy)', color: 'var(--luna-teal)' }}>
                                <Settings className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Types of Cookies We Use</h2>
                        </div>
                        <div className="pl-0 space-y-4">
                            {COOKIE_TYPES.map((type, i) => (
                                <div key={i} className="p-6 rounded-2xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="font-black text-base" style={{ color: 'var(--luna-text-main)' }}>{type.name}</p>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
                                            style={{ background: type.badgeColor + '20', color: type.badgeColor, border: `1px solid ${type.badgeColor}40` }}>
                                            {type.badge}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold leading-relaxed mb-4" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>{type.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {type.examples.map((ex, j) => (
                                            <span key={j} className="text-[11px] font-black px-3 py-1.5 rounded-xl border"
                                                style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }}>
                                                {ex}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <Section icon={BarChart3} title="How Long Are Cookies Retained?">
                        <ul className="space-y-2 list-none">
                            {[
                                'Session cookies are deleted automatically when you close your browser.',
                                'Authentication tokens are retained for 24 hours of inactivity, after which you must log in again.',
                                'Language preference cookies (googtrans) are retained for up to 1 year.',
                                'Theme preference cookies are retained for up to 1 year.',
                                'Analytics cookies are retained for up to 90 days.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={ShieldOff} title="Managing & Disabling Cookies">
                        <p>You can control and manage cookies in multiple ways. Please note that disabling certain cookies may affect your ability to use the platform:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Browser settings: All modern browsers allow you to view, block, or delete cookies. Refer to your browser\'s help documentation.',
                                'Clearing localStorage: You can clear stored preferences from your browser\'s developer tools (Application tab).',
                                'Disabling Google Translate: Clearing cookies with the "googtrans" prefix will reset language to English.',
                                'Note: Disabling strictly necessary cookies will prevent you from logging in to the platform.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <div className="mt-12 p-8 rounded-3xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--luna-teal)' }}>Questions about cookies?</p>
                        <p className="text-base font-bold mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
                            Contact us at{' '}
                            <a href="mailto:privacy@lifeline.health" className="font-black underline decoration-2 underline-offset-4" style={{ color: 'var(--luna-teal)' }}>privacy@lifeline.health</a>
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link to="/patient/contact" className="btn-teal text-xs px-5 py-2.5">Contact Support</Link>
                            <button onClick={() => navigate(-1)} className="text-xs font-bold px-5 py-2.5 rounded-xl border" style={{ color: 'var(--luna-text-muted)', borderColor: 'var(--luna-border)' }}>← Go Back</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

// --- HIPAA Notice ---
const HIPAA_RIGHTS = [
    {
        title: 'Right of Access (§164.524)',
        desc: 'Patients have the right to inspect and obtain a copy of their protected health information (PHI) maintained by a covered entity in a designated record set.',
        color: '#10b981'
    },
    {
        title: 'Right to Amend (§164.526)',
        desc: 'Patients may request corrections to their PHI if they believe it is incorrect or incomplete. The covered entity must respond within 60 days.',
        color: '#6366f1'
    },
    {
        title: 'Right to Restriction (§164.522)',
        desc: 'Patients may request restriction on the use or disclosure of PHI for treatment, payment, or operations. The covered entity must comply with restrictions on disclosures to health plans for self-paid services.',
        color: '#38bdf8'
    },
    {
        title: 'Right to Accounting (§164.528)',
        desc: 'Patients have the right to receive an accounting of disclosures of their PHI made by a covered entity in the previous six years.',
        color: '#f59e0b'
    },
];

export const HIPAANotice = () => {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen" style={{ background: 'var(--luna-bg)' }}>
            <div className="pt-28 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(var(--luna-teal) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div {...fadeUp}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-6"
                            style={{ background: 'rgba(56,189,248,0.08)', color: 'var(--luna-teal)', borderColor: 'rgba(56,189,248,0.2)' }}>
                            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliance
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--luna-text-main)' }}>
                            HIPAA Notice of Privacy Practices
                        </h1>
                        <p className="text-lg font-bold mb-6" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>
                            Your rights under the Health Insurance Portability and Accountability Act. Required by law to be provided to all patients.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--luna-text-dim)' }}>
                            <span>Effective: January 1, 2025</span>
                            <span>•</span>
                            <span>Last Revised: March 1, 2025</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="rounded-3xl p-8 md:p-12 border" style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                    <motion.div {...fadeUp} className="mb-12 p-8 rounded-3xl border flex items-start gap-4"
                        style={{ background: 'rgba(251, 191, 36, 0.08)', borderColor: 'rgba(251,191,36,0.3)' }}>
                        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: '#f59e0b' }}>Important Legal Notice</p>
                            <p className="text-[15px] font-bold leading-relaxed" style={{ color: 'var(--luna-text-main)' }}>
                                This Notice describes how medical information about you may be used and disclosed and how you can get access to this information. <strong className="font-black underline decoration-2 underline-offset-4" style={{ color: 'var(--luna-text-main)' }}>Please review it carefully.</strong> Lifeline HMS is committed to maintaining the privacy and security of your Protected Health Information (PHI).
                            </p>
                        </div>
                    </motion.div>

                    <Section icon={ShieldCheck} title="Our Commitment to HIPAA Compliance">
                        <p>Lifeline HMS is designed and operated in compliance with the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and its implementing regulations, including the Privacy Rule (45 CFR Part 164), the Security Rule (45 CFR Part 164), and the Breach Notification Rule.</p>
                        <p>We are committed to protecting the privacy of your health information and providing you with this Notice of our legal duties and privacy practices with respect to your Protected Health Information (PHI).</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'We maintain the privacy of your Protected Health Information (PHI).',
                                'We provide you with this Notice of our legal duties and privacy practices.',
                                'We follow the terms of the Notice currently in effect.',
                                'We will notify you promptly in the event of a breach of your unsecured PHI.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon={FileText} title="How We May Use & Disclose Your PHI">
                        <p>We may use and disclose your health information for the following treatment, payment, and operations purposes without requiring your authorisation:</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Treatment: Sharing information with physicians, nurses, and specialists directly involved in your care.',
                                'Payment: Submitting claims to insurance companies, processing billing, and verifying coverage.',
                                'Healthcare Operations: Quality assurance, staff training, compliance audits, and business management.',
                                'As Required by Law: Reporting to public health authorities, courts, or government agencies as mandated.',
                                'Emergency Situations: Disclosing information to prevent serious threat to your health or safety.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <motion.div {...fadeUp} className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl" style={{ background: 'var(--luna-navy)', color: 'var(--luna-teal)' }}>
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--luna-text-main)' }}>Your Patient Rights Under HIPAA</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {HIPAA_RIGHTS.map((right, i) => (
                                <div key={i} className="p-6 rounded-2xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: right.color }} />
                                        <p className="text-sm font-black" style={{ color: right.color }}>{right.title}</p>
                                    </div>
                                    <p className="text-[13px] font-bold leading-relaxed" style={{ color: 'var(--luna-text-main)', opacity: 0.8 }}>{right.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <Section icon={Lock} title="Security Safeguards">
                        <p>We have implemented the administrative, physical, and technical safeguards required by the HIPAA Security Rule to protect your electronic PHI (ePHI):</p>
                        <ul className="space-y-2 list-none">
                            {[
                                'Administrative: Risk analysis & management, security training, access management policies.',
                                'Physical: Facility access controls, workstation security, and device disposal procedures.',
                                'Technical: Access controls, audit controls, data integrity, and transmission security (TLS/AES-256).',
                                'Breach Response: Documented incident response plan with mandatory 60-day notification protocol.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--luna-teal)' }} />
                                    <span className="font-extrabold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <div className="mt-12 p-8 rounded-3xl border" style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)' }}>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--luna-teal)' }}>Privacy Officer Contact</p>
                        <p className="text-base font-bold mb-3" style={{ color: 'var(--luna-text-main)', opacity: 0.9 }}>
                            To exercise your rights or file a complaint, contact our Privacy Officer:
                        </p>
                        <p className="text-base font-black" style={{ color: 'var(--luna-text-main)' }}>
                            <a href="mailto:hipaa@lifeline.health" className="underline decoration-2 underline-offset-4" style={{ color: 'var(--luna-teal)' }}>hipaa@lifeline.health</a>
                            {' '}| +91 7395954829 | Bangalore 560001
                        </p>
                        <p className="text-[13px] font-bold mt-4" style={{ color: 'var(--luna-text-dim)' }}>
                            You may also file a complaint with the U.S. Department of Health and Human Services (HHS) Office for Civil Rights. We will not retaliate against you for filing a complaint.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link to="/patient/contact" className="btn-teal text-xs px-5 py-2.5">Contact Support</Link>
                            <button onClick={() => navigate(-1)} className="text-xs font-bold px-5 py-2.5 rounded-xl border" style={{ color: 'var(--luna-text-muted)', borderColor: 'var(--luna-border)' }}>← Go Back</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

