import React, { useState } from 'react';
import { ChevronRight, User, Shield, Check, Sparkles, UserCircle2, User2 } from 'lucide-react';
import { AppSettings } from '../types.ts';
import { Logo } from '../constants.tsx';

interface OnboardingProps {
  onComplete: (updates: Partial<AppSettings>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AppSettings>>({
    userName: '',
    gender: 'male',
    strictness: 'normal',
    intentions: []
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete({ ...formData, onboardingCompleted: true });
  };

  const handleSkip = () => {
    onComplete({ onboardingCompleted: true });
  };

  const toggleIntention = (intention: string) => {
    const current = formData.intentions || [];
    if (current.includes(intention)) {
      setFormData({ ...formData, intentions: current.filter(i => i !== intention) });
    } else {
      setFormData({ ...formData, intentions: [...current, intention] });
    }
  };

  const progress = (step / totalSteps) * 100;

  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 py-4 flex flex-col items-center animate-step-enter">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 mb-2 shadow-sm border border-emerald-100 dark:border-emerald-800">
               <User size={36} />
            </div>
            
            <div className="w-full space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Your Name</label>
                 <div className="relative w-full group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    autoFocus
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-[#1E1E1E] border-2 border-slate-100 dark:border-[#444444] focus:border-emerald-500 rounded-2xl outline-none transition-all text-lg font-bold dark:text-white placeholder:text-slate-300"
                  />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                 <div className="space-y-2.5">
                    {[
                      { id: 'male', label: 'Male', icon: User, desc: 'Optimized for congregation.' },
                      { id: 'female', label: 'Female', icon: User2, desc: 'Optimized for privacy.' },
                      { id: 'other', label: 'Prefer not to say', icon: UserCircle2, desc: 'Standard settings.' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setFormData({ ...formData, gender: g.id as any })}
                        className={`w-full p-3.5 rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-[0.98] ${
                          formData.gender === g.id 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm' 
                          : 'bg-white dark:bg-[#1E1E1E]/50 border-slate-100 dark:border-[#444444] hover:border-emerald-200'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            formData.gender === g.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-[#2C2C2C] text-slate-400'
                         }`}>
                           <g.icon size={20} />
                         </div>
                         <div className="flex-1 text-left">
                           <span className={`block text-sm font-bold ${formData.gender === g.id ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-700 dark:text-[#E0E0E0]'}`}>
                             {g.label}
                           </span>
                           <span className={`block text-[10px] ${formData.gender === g.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                             {g.desc}
                           </span>
                         </div>
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.gender === g.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 dark:border-[#444444]'
                         }`}>
                            {formData.gender === g.id && <Check size={12} strokeWidth={4} />}
                         </div>
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3 py-2 animate-step-enter">
            {[
              { id: 'soft', label: 'Soft', desc: 'Graceful tracking, easy to adjust later.' },
              { id: 'normal', label: 'Normal', desc: 'The balanced path of consistency.' },
              { id: 'strict', label: 'Strict', desc: 'Firm tracking. No edits after saving.' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setFormData({ ...formData, strictness: m.id as any })}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group active:scale-[0.98] ${
                  formData.strictness === m.id 
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 shadow-md transform scale-[1.02]' 
                  : 'bg-white dark:bg-[#1E1E1E]/50 border-slate-100 dark:border-[#444444] hover:border-slate-200 dark:hover:border-[#888888]'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                  formData.strictness === m.id 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-100 dark:bg-[#2C2C2C] text-slate-400 group-hover:text-slate-600'
                }`}>
                  <Shield size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-base block text-slate-900 dark:text-white leading-tight mb-0.5">{m.label}</span>
                  <p className="text-xs text-slate-500 dark:text-[#B0B0B0] font-medium leading-tight truncate">{m.desc}</p>
                </div>
                <div className={`flex-shrink-0 ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                   formData.strictness === m.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 dark:border-[#444444]'
                }`}>
                  {formData.strictness === m.id && <Check size={12} strokeWidth={4} />}
                </div>
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-2 py-2 animate-step-enter">
            {[
              'Improve prayer consistency',
              'Focus on praying on time',
              'Build a long-term habit',
              'Reconnect spiritually'
            ].map((goal) => {
              const isActive = formData.intentions?.includes(goal);
              return (
                <button
                  key={goal}
                  onClick={() => toggleIntention(goal)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 active:scale-[0.98] ${
                    isActive
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm' 
                    : 'bg-white dark:bg-[#1E1E1E]/50 border-slate-100 dark:border-[#444444] text-slate-500 hover:bg-slate-50 dark:hover:bg-[#1E1E1E]'
                  }`}
                >
                  <span className="text-sm font-bold text-left flex-1 mr-2">{goal}</span>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-[#2C2C2C] text-slate-300'
                  }`}>
                    {isActive ? <Check size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-[#444444]" />}
                  </div>
                </button>
              );
            })}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center justify-center h-full py-4 text-center animate-step-enter">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
              <Logo size={120} className="relative z-10 drop-shadow-2xl" />
            </div>
            <div className="space-y-4 max-w-xs mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black uppercase text-[10px] tracking-widest rounded-full">
                <Sparkles size={12} />
                Bismillah
              </div>
              <h2 className="font-black text-3xl text-slate-900 dark:text-white tracking-tight">You're Ready</h2>
              <p className="text-slate-500 dark:text-[#B0B0B0] text-sm font-medium leading-relaxed">
                Your spiritual journey is configured. May your heart find peace in every prayer.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const titles = [
    { title: "Ahlan wa Sahlan", sub: "Tell us about yourself." },
    { title: "Choose Your Path", sub: "Select your preferred tracking discipline." },
    { title: "Daily Intention", sub: "Focusing your intent brings barakah." },
    { title: "Welcome", sub: "Setup complete." }
  ];

  return (
    <div className="fixed inset-0 z-[500] bg-slate-50 dark:bg-[#121212] flex items-center justify-center p-4 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Container - Fixed Height for Stability */}
      <div className="w-full max-w-md bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 dark:border-[#444444] relative flex flex-col h-[600px] max-h-[85vh] overflow-hidden transition-all duration-500">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-[#121212]">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col h-full p-6 md:p-10">
          {/* Static Header Section - Prevents jumping */}
          <div className="flex-shrink-0 mb-4 transition-all duration-300">
            <h2 key={step + 'title'} className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter leading-none animate-fade-in-up">
              {titles[step-1].title}
            </h2>
            <p key={step + 'sub'} className="text-sm text-slate-500 dark:text-[#888888] font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {titles[step-1].sub}
            </p>
          </div>
          
          {/* Dynamic Content Area - Keyed for animation */}
          {/* Added px-2 to prevent border clipping */}
          <div className="flex-1 relative overflow-y-auto no-scrollbar mask-gradient-b px-2 -mx-2">
            <div key={step}>
              {renderStepContent()}
            </div>
          </div>

          {/* Footer Actions - Optimized Padding for Mobile */}
          <div className="mt-8 flex items-center justify-between gap-3 flex-shrink-0 pt-4 border-t border-slate-50 dark:border-[#444444]/50">
            {step < totalSteps && (
              <button 
                onClick={handleSkip}
                className="px-4 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-[#E0E0E0] font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Skip
              </button>
            )}
            <button 
              onClick={handleNext}
              className={`py-3.5 px-6 sm:px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group ${step === totalSteps ? 'w-full' : 'ml-auto'}`}
            >
              <span className="text-sm whitespace-nowrap">{step === totalSteps ? 'Start Journey' : 'Continue'}</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .mask-gradient-b {
          mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        }

        @keyframes step-enter {
          from { opacity: 0; transform: translateX(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        .animate-step-enter {
          animation: step-enter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;