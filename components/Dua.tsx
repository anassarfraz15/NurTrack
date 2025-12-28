import React, { useState } from 'react';
import { X, Sparkles, BookOpen, ChevronRight, Copy, Check, Menu } from 'lucide-react';

interface DuaItem {
  id: number;
  name: string;
  arabic: string;
  translation: string;
  category: string;
}

const DUAS: DuaItem[] = [
  {
    id: 1,
    name: "Waking Up",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    translation: "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
    category: "Morning"
  },
  {
    id: 2,
    name: "Before Sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    translation: "In Your name, O Allah, I die and I live.",
    category: "Evening"
  },
  {
    id: 3,
    name: "Before Eating",
    arabic: "بِسْمِ اللَّهِ",
    translation: "In the name of Allah.",
    category: "Daily Life"
  },
  {
    id: 4,
    name: "After Eating",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    translation: "Praise be to Allah Who has fed us and given us drink and made us Muslims.",
    category: "Daily Life"
  },
  {
    id: 5,
    name: "Entering Home",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    translation: "In the name of Allah we enter, and in the name of Allah we leave, and upon our Lord we rely.",
    category: "Daily Life"
  },
  {
    id: 6,
    name: "Entering Mosque",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    translation: "O Allah, open the gates of Your mercy for me.",
    category: "Spirituality"
  },
  {
    id: 7,
    name: "Leaving Mosque",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    translation: "O Allah, I ask You from Your favor.",
    category: "Spirituality"
  },
  {
    id: 8,
    name: "Entering Bathroom",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    translation: "O Allah, I seek refuge in You from the male and female evil spirits.",
    category: "Daily Life"
  },
  {
    id: 9,
    name: "Leaving Bathroom",
    arabic: "غُفْرَانَكَ",
    translation: "I ask You for Your forgiveness.",
    category: "Daily Life"
  },
  {
    id: 10,
    name: "Seeking Knowledge",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    translation: "My Lord, increase me in knowledge.",
    category: "Spirituality"
  }
];

interface DuaProps {
  onOpenDrawer: () => void;
}

const Dua: React.FC<DuaProps> = ({ onOpenDrawer }) => {
  const [selectedDua, setSelectedDua] = useState<DuaItem | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <button 
              onClick={onOpenDrawer}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-emerald-600 transition-colors"
              aria-label="Open Settings"
            >
              <Menu size={24} />
            </button>
           <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
             <BookOpen size={24} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Essential Duas</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed md:ml-0 ml-10">Top 10 daily supplications for a blessed day.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {DUAS.map((dua) => (
          <button
            key={dua.id}
            onClick={() => setSelectedDua(dua)}
            className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all hover:scale-[1.01] text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 font-black text-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                {dua.id}
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{dua.category}</span>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{dua.name}</h4>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </button>
        ))}
      </div>

      {selectedDua && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-8 text-slate-50 dark:text-slate-800/10 pointer-events-none rotate-12">
              <BookOpen size={160} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-[0.2em] mb-1">
                    <Sparkles size={12} />
                    Supplication
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedDua.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedDua(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 md:p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50">
                  <p className="text-3xl md:text-4xl leading-relaxed text-right arabic-font font-bold text-slate-900 dark:text-white dir-rtl">
                    {selectedDua.arabic}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Translation</span>
                    <button 
                      onClick={() => handleCopy(`${selectedDua.arabic}\n\n${selectedDua.translation}`)}
                      className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase hover:opacity-80 transition-opacity"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                    "{selectedDua.translation}"
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">May Allah accept your du'as</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dua;