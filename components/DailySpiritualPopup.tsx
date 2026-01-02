import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Quote, Share2 } from 'lucide-react';
import { SPIRITUAL_CONTENT, SpiritualContent, SpiritualContentType } from '../constants';
import { getTodayDateString } from '../utils/dateTime';

const STORAGE_KEY_DATE = 'nurtrack_daily_content_last_date';
const STORAGE_KEY_TYPE = 'nurtrack_daily_content_last_type';
const STORAGE_KEY_ID = 'nurtrack_daily_content_last_id';

const DailySpiritualPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<SpiritualContent | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const checkAndSchedulePopup = () => {
      const today = getTodayDateString();
      const lastDate = localStorage.getItem(STORAGE_KEY_DATE);

      // 1. Show only once per calendar day
      if (lastDate === today) {
        return;
      }

      // 2. Determine Logic for Rotation
      const lastType = localStorage.getItem(STORAGE_KEY_TYPE) as SpiritualContentType | null;
      const lastId = localStorage.getItem(STORAGE_KEY_ID);

      // Alternate type: If last was ayah, show hadith, otherwise ayah. Default to ayah.
      const nextType: SpiritualContentType = lastType === 'ayah' ? 'hadith' : 'ayah';

      // Filter available content by type
      const availableContent = SPIRITUAL_CONTENT.filter(c => c.type === nextType);

      // Select random item, trying to avoid immediate repeat of exact ID if pool is small
      let nextContent = availableContent[Math.floor(Math.random() * availableContent.length)];
      
      // Simple retry once if we hit the exact same ID (unlikely with alternating types, but good for safety)
      if (nextContent.id === lastId && availableContent.length > 1) {
         const others = availableContent.filter(c => c.id !== lastId);
         nextContent = others[Math.floor(Math.random() * others.length)];
      }

      setContent(nextContent);

      // 3. Wait 4-5 seconds before showing
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Persist "shown" state immediately when shown
        localStorage.setItem(STORAGE_KEY_DATE, today);
        localStorage.setItem(STORAGE_KEY_TYPE, nextType);
        localStorage.setItem(STORAGE_KEY_ID, nextContent.id);
      }, 4000);

      return () => clearTimeout(timer);
    };

    checkAndSchedulePopup();
  }, []);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 500); // Match duration of fade-out animation
  };

  if (!isOpen || !content) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 w-screen h-screen overflow-hidden transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-700 w-full h-full"
        onClick={handleClose}
      ></div>

      {/* Main Card */}
      <div 
        className="relative z-10 w-full max-w-md bg-white dark:bg-charcoal-surface rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-charcoal-border overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decoration */}
        <div className="h-32 bg-gradient-to-br from-emerald-600 to-emerald-800 relative flex items-center justify-center overflow-hidden">
           {/* Background Patterns */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
           <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-400 rounded-full blur-2xl opacity-40"></div>
           <div className="absolute -top-6 -left-6 w-24 h-24 bg-white rounded-full blur-2xl opacity-20"></div>

           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                {content.type === 'ayah' ? <BookOpen className="text-white" size={28} /> : <Quote className="text-white" size={28} />}
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide uppercase text-shadow-sm">
                {content.type === 'ayah' ? 'Ayah of the Day' : 'Hadith of the Day'}
              </h2>
           </div>

           <button 
             onClick={handleClose}
             className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
           >
             <X size={20} />
           </button>
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col items-center text-center space-y-6">
           
           {/* Arabic Text */}
           <div className="w-full space-y-4">
             <p className="text-2xl md:text-3xl leading-[2.0] md:leading-[2.2] text-slate-800 dark:text-emerald-50 font-medium arabic-font" dir="rtl">
               {content.arabic}
             </p>
             
             {/* Reference */}
             <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50">
               <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 arabic-font">
                 {content.reference}
               </p>
             </div>
           </div>

           <div className="w-16 h-px bg-slate-100 dark:bg-charcoal-border"></div>

           {/* Urdu Translation */}
           <div className="w-full">
             <p className="text-lg md:text-xl leading-loose text-slate-600 dark:text-charcoal-text arabic-font" dir="rtl">
               {content.urdu}
             </p>
           </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-charcoal/50 p-4 border-t border-slate-100 dark:border-charcoal-border flex justify-center">
           <button 
             onClick={handleClose}
             className="px-8 py-3 bg-white dark:bg-charcoal-surface border border-slate-200 dark:border-charcoal-border text-slate-600 dark:text-charcoal-text font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-charcoal transition-colors shadow-sm"
           >
             Close
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DailySpiritualPopup;