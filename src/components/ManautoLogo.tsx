import React from 'react';
import darkLogo from '../assets/images/manauto_dark_logo_1787837006380.jpg';
import lightLogo from '../assets/images/app_phone_logo_1787510482700.jpg';

interface ManautoLogoProps {
  variant?: 'full' | 'compact' | 'emblem' | 'print';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light';
  showSubtitle?: boolean;
}

export const ManautoLogo: React.FC<ManautoLogoProps> = ({
  variant = 'compact',
  size = 'md',
  className = '',
  theme = 'dark',
  showSubtitle = true,
}) => {
  const isDark = theme === 'dark';
  const logoSrc = isDark ? darkLogo : lightLogo;

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Luxury Cadre with Rounded Corners & Golden Ambient Halo */}
        <div className="relative flex items-center justify-center group">
          {/* Ambient Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/40 via-amber-400/25 to-amber-600/40 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Main Logo Cadre with border-radius */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-3xl p-2.5 sm:p-3 bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-white/10 overflow-hidden flex items-center justify-center">
            {/* Logo Image fitted into cadre */}
            <img
              src={logoSrc}
              alt="MANAUTO GESTION Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-2xl filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.3)] transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = lightLogo;
              }}
            />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="mt-3.5 text-center">
          <div className="flex items-center justify-center tracking-tight">
            <span className={`text-2xl sm:text-3xl md:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-wider`}>
              MAN
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 tracking-wider">
              AUTO
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="h-[1.5px] w-6 sm:w-8 bg-gradient-to-r from-transparent to-amber-400"></span>
            <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-[0.28em] text-amber-400 uppercase">
              GESTION
            </span>
            <span className="h-[1.5px] w-6 sm:w-8 bg-gradient-to-l from-transparent to-amber-400"></span>
          </div>

          {showSubtitle && (
            <p className={`text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-wider uppercase mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Système de Gestion de Location de Voitures
            </p>
          )}

          {/* 4 Management Pillars (Réservations, Parc, Contrats, Caisse) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2.5 pt-2 border-t border-white/10 max-w-[260px] mx-auto text-amber-400/90 text-xs">
            <div className="flex items-center gap-1 hover:text-amber-300 transition-colors" title="Réservations & Planning">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1 hover:text-white transition-colors" title="Parc Automobile">
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1 hover:text-amber-300 transition-colors" title="Contrats & Signatures">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1 hover:text-emerald-300 transition-colors" title="Bilan & Caisse">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Emblem only
  if (variant === 'emblem') {
    const dim = size === 'xs' ? 'w-7 h-7' : size === 'sm' ? 'w-9 h-9' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : 'w-20 h-20';
    return (
      <div className={`relative rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center shrink-0 ${dim} ${className}`}>
        <img
          src={logoSrc}
          alt="MANAUTO MG Emblem"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
    );
  }

  // Compact Header / Nav Bar layout
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl p-1 bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0 overflow-hidden flex items-center justify-center group">
        <img
          src={logoSrc}
          alt="MANAUTO"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center tracking-tight font-black text-sm sm:text-base md:text-lg">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>MAN</span>
          <span className="text-amber-400">AUTO</span>
          <span className="ml-1.5 text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-lg border border-amber-500/30">
            GESTION
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
            Location de Voitures
          </span>
        )}
      </div>
    </div>
  );
};
