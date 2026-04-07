import React from 'react';

const Logo = ({ size = "lg", className = "" }) => {
    const isMobile = size === "sm";
    
    return (
        <div className={`flex flex-col items-center justify-center group ${className}`}>
            <div className="relative p-1 rounded-2xl transition-transform duration-500 group-hover:scale-110 mb-2"
                style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid var(--luna-border)', boxShadow: 'inset 0 0 20px rgba(56,189,248,0.1)' }}>
                <img 
                    src="/lifeline_themed_v1.svg?v=cachebust123" 
                    alt="Lifeline Logo" 
                    className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]`} 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--luna-teal)] to-transparent opacity-10 animate-pulse pointer-events-none rounded-2xl" />
            </div>
            
            <div className="flex flex-col items-center justify-center -space-y-1.5 pt-1">
                <span className={`${isMobile ? 'text-lg' : 'text-2xl'} font-black tracking-[0.25em] transition-all`} 
                    style={{ color: 'var(--luna-text-main)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    LIFELINE
                </span>
                <div className="flex items-center w-full gap-2 mt-1 px-1">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--luna-teal)] opacity-60" />
                    <span className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-[0.5em] pb-1`} 
                        style={{ color: 'var(--luna-teal)' }}>
                        HMS
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--luna-teal)] opacity-60" />
                </div>
            </div>
        </div>
    );
};

export default Logo;

