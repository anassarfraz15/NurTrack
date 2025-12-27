import React from 'react';

export const PRAYER_NAMES: string[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const STATUS_COLORS = {
  ON_TIME: 'bg-emerald-500',
  LATE: 'bg-amber-500',
  MISSED: 'bg-rose-500',
  NOT_MARKED: 'bg-slate-300'
};

export const STATUS_TEXT = {
  ON_TIME: 'On Time',
  LATE: 'Late',
  MISSED: 'Missed',
  NOT_MARKED: 'Untracked'
};

/**
 * High-fidelity brand logo reflecting the mosque silhouette, 
 * five prayer dots, and the success checkmark.
 */
export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Gradients for depth */}
      <linearGradient id="checkmarkGradient" x1="50" y1="130" x2="180" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#15803d" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>
    
    {/* Five Prayer Dots in Arc */}
    <circle cx="28" cy="55" r="10" fill="#fbbf24" /> {/* Yellow - Fajr */}
    <circle cx="62" cy="35" r="10" fill="#f97316" /> {/* Orange - Dhuhr */}
    <circle cx="100" cy="25" r="10" fill="#38bdf8" /> {/* Sky Blue - Asr */}
    <circle cx="138" cy="35" r="10" fill="#2563eb" /> {/* Blue - Maghrib */}
    <circle cx="172" cy="55" r="10" fill="#7c3aed" /> {/* Purple - Isha */}

    {/* Mosque Silhouette */}
    <path 
      d="M10 160C40 160 50 150 50 150V95L42 90V75L50 68L58 75V90L50 95V150C50 150 70 80 100 80C130 80 150 150 150 150C150 150 160 120 175 120C185 120 190 160 190 160" 
      fill="#1e293b" 
    />
    
    {/* Crescent on Main Dome */}
    <path 
      d="M100 55C92 55 86 61 86 69C86 77 92 83 100 83C96 83 93 80 93 74C93 68 96 65 100 65C104 65 107 68 107 74C107 80 104 83 100 83C108 83 114 77 114 69C114 61 108 55 100 55Z" 
      fill="#1e293b" 
    />

    {/* Green Success Checkmark */}
    <path 
      d="M50 135L90 180L185 100L175 90L90 160L60 125L50 135Z" 
      fill="url(#checkmarkGradient)" 
      stroke="#ffffff" 
      strokeWidth="2"
    />
    
    {/* Subtle highlight on checkmark */}
    <path 
      d="M60 130L90 165L170 98" 
      stroke="white" 
      strokeWidth="4" 
      strokeLinecap="round" 
      opacity="0.2" 
    />
  </svg>
);