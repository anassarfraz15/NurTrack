import React, { useState } from 'react';
import { ChevronRight, User, Shield, Heart, Check } from 'lucide-react';
import { AppSettings } from '../types.ts';
import { Logo } from '../constants.tsx';

interface OnboardingProps {
  onComplete: (updates: Partial<AppSettings>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AppSettings>>({
    userName: '',
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

  const StepWrapper: React.FC<{ children: React.ReactNode, title: string, subtitle: string }> = ({ children, title, subtitle }) => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-500">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">{title}</h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{subtitle}</p>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-1">
        {children}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 flex-shrink-0">
        <button 
          onClick={handleSkip}
          className="px-4 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Skip
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="text-sm">{step === totalSteps ? 'Get Started' : 'Continue'}</span>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-emerald-400 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Container - Non Scrollable */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 relative flex flex-col h-auto max-h-[90vh] overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 md:p-10 flex flex-col h-full min-h-0">
          {step === 1 && (
            <StepWrapper 
              title="Assalamu Alaikum" 
              subtitle="Let's start your journey. What should we call you?"
            >
              <div className="space-y-4 py-4">
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                  <input 
                    autoFocus
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Your Name"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all text-base font-bold dark:text-white"
                  />
                </div>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest px-1">This name will be used throughout your journey.</p>
              </div>
            </StepWrapper>
          )}

          {step === 2 && (
            <StepWrapper 
              title="Your Path" 
              subtitle="Choose the level of discipline that fits your lifestyle."
            >
              <div className="grid grid-cols-1 gap-3 py-2">
                {[
                  { id: 'soft', label: 'Soft', desc: 'Flexible tracking for beginners.' },
                  { id: 'normal', label: 'Normal', desc: 'The balanced daily standard.' },
                  { id: 'strict', label: 'Strict', desc: 'No edits allowed after marking.' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFormData({ ...formData, strictness: m.id as any })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                      formData.strictness === m.id 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-xl bg-white dark:bg-slate-700 ${formData.strictness === m.id ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-sm block dark:text-white leading-tight">{m.label}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {step === 3 && (
            <StepWrapper 
              title="Your Intent" 
              subtitle="Focus your energy. Select up to three core goals."
            >
              <div className="grid grid-cols-1 gap-2.5 py-2">
                {[
                  'Improve consistency',
                  'Pray on time',
                  'Build a habit',
                  'Reconnect spiritually'
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleIntention(goal)}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                      formData.intentions?.includes(goal)
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-bold">{goal}</span>
                    {formData.intentions?.includes(goal) ? (
                      <div className="bg-emerald-500 text-white rounded-full p-0.5"><Check size={12} /></div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
                    )}
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {step === 4 && (
            <StepWrapper 
              title="Ready to Begin" 
              subtitle="May your journey be filled with light and barakah."
            >
              <div className="flex flex-col items-center justify-center flex-1 py-4">
                <div className="relative mb-6 transform scale-90">
                  <Logo size={110} className="animate-pulse" />
                  <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full -z-10"></div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="font-black text-xl text-slate-900 dark:text-white">Bismillah!</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Your account is ready. Safe sync enabled.</p>
                </div>
              </div>
            </StepWrapper>
          )}
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Onboarding;