import React, { useEffect, useState } from 'react';
import { PartyPopper, Star, Sparkles, Heart } from 'lucide-react';

interface AchievementPopupProps {
  onClose: () => void;
  title?: string;
  message?: string;
  userName?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  angle: number;
  distance: number;
  rotation: number;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ onClose, title, message, userName }) => {
  const displayName = userName ? ` ${userName}` : '';
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 100 particles for a dense, screen-filling explosion
    const newParticles: Particle[] = [];
    const colors = ['#fbbf24', '#fcd34d', '#f59e0b', '#fbbf24', '#10b981', '#ffffff'];
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: 50, // Center origin %
        y: 50, // Center origin %
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 4,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 2,
        angle: Math.random() * 360,
        distance: 150 + Math.random() * 450,
        rotation: Math.random() * 1080
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500 overflow-hidden">
      
      {/* Main Popup Content - Lower Z-Index (z-10) */}
      <div className="bg-white dark:bg-charcoal-surface w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-500/30 border border-emerald-100 dark:border-charcoal-border animate-in zoom-in-95 duration-500 relative z-10">
        {/* Top Decorative Section */}
        <div className="h-48 bg-gradient-to-br from-emerald-600 to-emerald-800 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-400 rounded-full -mr-16 -mb-16 blur-2xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center ring-1 ring-white/30 mb-4 animate-bounce">
              <PartyPopper size={40} className="text-white" />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <Star key={i} size={16} fill="white" className="text-white opacity-80" />
              ))}
            </div>
          </div>
          
          {/* Sparkle Icons */}
          <Sparkles className="absolute top-10 left-10 text-emerald-300/40" size={24} />
          <Sparkles className="absolute bottom-10 right-10 text-emerald-300/40" size={32} />
        </div>

        {/* Content Section */}
        <div className="p-10 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-charcoal-text tracking-tight mb-2">
            {title || `Masha'Allah${displayName}!`}
          </h2>
          <p className="text-slate-500 dark:text-charcoal-sub text-sm leading-relaxed mb-8">
            {message || "You've achieved a significant milestone in your spiritual journey. May Allah accept your efforts."}
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              Alhamdulillah
              <Heart size={18} className="group-hover:fill-current transition-all" />
            </button>
            <p className="text-[10px] text-slate-400 dark:text-charcoal-accent uppercase font-black tracking-widest">
              Keep the light shining
            </p>
          </div>
        </div>
      </div>

      {/* Golden Glitter / Particle Spray Layer - Higher Z-Index (z-20) to spray OVER the card */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full blur-[0.2px]"
            style={{
              left: '50%',
              top: '50%',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 1.5}px ${p.color}aa`,
              opacity: 0,
              animation: `particle-spray-${p.id} ${p.duration}s cubic-bezier(0.1, 0, 0.3, 1) ${p.delay}s forwards`
            }}
          />
        ))}
      </div>

      <style>{`
        ${particles.map(p => `
          @keyframes particle-spray-${p.id} {
            0% {
              transform: translate(-50%, -50%) rotate(0deg) scale(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
              transform: translate(-50%, -50%) rotate(${p.rotation / 4}deg) scale(1.3);
            }
            70% {
              opacity: 1;
            }
            100% {
              transform: 
                translate(
                  calc(-50% + ${Math.cos(p.angle * Math.PI / 180) * p.distance}px), 
                  calc(-50% + ${Math.sin(p.angle * Math.PI / 180) * p.distance}px + 200px)
                ) 
                rotate(${p.rotation}deg) 
                scale(0);
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default AchievementPopup;