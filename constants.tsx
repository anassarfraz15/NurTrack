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
      <linearGradient id="moonGradient" x1="60" y1="40" x2="140" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Crescent Moon */}
    <path 
      d="M100 25C70 25 45 50 45 80C45 110 70 135 100 135C85 135 70 120 70 95C70 70 85 55 100 55C115 55 130 70 130 95C130 120 115 135 100 135C130 135 155 110 155 80C155 50 130 25 100 25Z" 
      fill="url(#moonGradient)" 
      filter="url(#glow)"
    />
    
    {/* Star */}
    <path 
      d="M120 75L124 83L133 84L127 90L128 99L120 94L112 99L113 90L107 84L116 83L120 75Z" 
      fill="white" 
      filter="url(#glow)"
    />

    {/* Arches at bottom */}
    <g transform="translate(0, 10)">
      {[35, 65, 100, 135, 165].map((x, i) => (
        <g key={i} transform={`translate(${x}, 160)`}>
          <path 
            d="M-12 0C-12 -15 0 -22 0 -22C0 -22 12 -15 12 0L12 15L-12 15Z" 
            fill="none" 
            stroke="#0369a1" 
            strokeWidth="3"
          />
          <path 
            d="M-5 0L-1 4L6 -4" 
            fill="none" 
            stroke="#0ea5e9" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </g>
      ))}
    </g>
  </svg>
);