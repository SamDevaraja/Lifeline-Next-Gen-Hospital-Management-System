import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Activity, FileText, LayoutDashboard, LogOut, Users, Calendar, 
    CreditCard, FlaskConical, Pill, Sparkles, BrainCircuit, Bell, 
    TrendingUp, Settings, HelpCircle, ShieldCheck 
} from 'lucide-react';
import { LUNA } from './Constants';

const Sidebar = ({ user, menuOpen, setMenuOpen, getNavGroups, handleLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside
            className={`fixed top-0 left-0 h-full z-[100] transition-all duration-500 overflow-hidden flex flex-col border-r shadow-2xl ${menuOpen ? 'w-64' : 'w-0 lg:w-20'}`}
            style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            {/* Platform Identity */}
            <div className="h-20 flex items-center px-6 gap-4 border-b relative z-10" style={{ borderColor: 'var(--luna-border)' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-glow" style={{ background: 'var(--luna-navy)', border: '1px solid var(--luna-border)' }}>
                    <Activity className="w-5 h-5 text-teal-400" />
                </div>
                <div className={`transition-all duration-500 delay-100 ${menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <h2 className="text-sm font-black tracking-tighter uppercase italic leading-none" style={{ color: 'var(--luna-text-main)' }}>Lifeline HMS</h2>
                    <p className="text-[8px] font-black tracking-[0.3em] mt-1 text-teal-500 uppercase">Neural Stream</p>
                </div>
            </div>

            {/* Command Navigation */}
            <nav className="flex-grow py-8 px-3 custom-scrollbar overflow-y-auto relative z-10">
                {getNavGroups().map((group, idx) => (
                    <div key={idx} className="mb-8">
                        <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-4 px-4 transition-all duration-500 ${menuOpen ? 'opacity-40' : 'opacity-0'}`} style={{ color: LUNA.steel }}>{group.label}</p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => { navigate(item.path); if (window.innerWidth < 1024) setMenuOpen(false); }}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${active ? 'shadow-lg shadow-teal-500/10' : 'hover:bg-slate-500/5'}`}
                                        style={{ color: active ? 'var(--luna-teal)' : 'var(--luna-text-muted)', background: active ? 'var(--luna-navy)' : 'transparent' }}
                                    >
                                        <div className={`transition-transform duration-500 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>{item.icon}</div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${menuOpen ? 'opacity-100 translate-x-0' : 'lg:opacity-0 lg:-translate-x-4'}`}>{item.label}</span>
                                        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-teal-500 shadow-[0_0_10px_rgba(45,196,182,0.5)]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Administrative Termination */}
            <div className="p-3 mt-auto border-t relative z-10" style={{ borderColor: 'var(--luna-border)' }}>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl transition-all text-red-500 hover:bg-red-500/5 font-black uppercase tracking-[0.2em] text-[10px]"
                >
                    <LogOut className="w-4 h-4" />
                    <span className={`transition-all duration-500 ${menuOpen ? 'opacity-100' : 'lg:hidden opacity-0'}`}>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
