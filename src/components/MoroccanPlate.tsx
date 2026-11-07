import React from 'react';

interface MoroccanPlateProps {
  matricule: string; // Format like "12345-A-1" or "11223-A-12" or "67890-B-6"
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MoroccanPlate: React.FC<MoroccanPlateProps> = ({
  matricule,
  className = '',
  size = 'md'
}) => {
  const parts = matricule.split('-');
  const leftNum = parts[0] || matricule;
  const middleLetter = parts[1] || 'A';
  const rightRegion = parts[2] || '1';

  // Arabic equivalent letter for authentic Moroccan plate style
  const arabicLetterMap: Record<string, string> = {
    'A': 'أ',
    'B': 'ب',
    'D': 'د',
    'E': 'هـ',
    'H': 'ح',
    'J': 'ج',
    'M': 'م',
    'S': 'س',
    'W': 'و'
  };

  const arabicLetter = arabicLetterMap[middleLetter.toUpperCase()] || 'أ';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-mono gap-1.5',
    md: 'text-xs px-2.5 py-1 font-mono gap-2',
    lg: 'text-sm px-3.5 py-1.5 font-mono gap-2.5'
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-bold tracking-wider rounded-lg bg-black/60 text-white border border-white/20 shadow-md backdrop-blur-md select-none ${sizeClasses[size]} ${className}`}
      title={`Matricule Marocain: ${matricule}`}
    >
      <span className="text-amber-400 font-bold">{leftNum}</span>
      <span className="text-white/20 font-light">|</span>
      <div className="flex items-center gap-0.5 text-slate-100">
        <span>{middleLetter}</span>
        <span className="text-[10px] text-amber-300 font-sans font-normal">({arabicLetter})</span>
      </div>
      <span className="text-white/20 font-light">|</span>
      <span className="text-slate-300">{rightRegion}</span>
    </div>
  );
};
