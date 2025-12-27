
import React from 'react';
import { PartyPopper, Star, Sparkles, Heart } from 'lucide-react';

interface AchievementPopupProps {
  onClose: () => void;
  userName?: string;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ onClose, userName }) => {
  const displayName = userName ? ` ${userName}` : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-500/20 border border-emerald-100 dark:border-emerald-900/50 animate-in zoom-in-95 duration-500">
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Masha'Allah{displayName}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            You've achieved your goal of praying all five namaz <span className="text-emerald-600 dark:text-emerald-400 font-bold">On Time</span> today. May Allah accept your efforts and grant you steadfastness.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              Alhamdulillah
              <Heart size={18} className="group-hover:fill-current transition-all" />
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">
              Keep the light shining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;
