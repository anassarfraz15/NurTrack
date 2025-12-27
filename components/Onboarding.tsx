import React, { useState } from 'react';
import { ChevronRight, Sparkles, User, Shield, Heart, Check, X } from 'lucide-react';
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
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
      </div>
      <div className="flex-1">{children}</div>
      <div className="mt-8 flex items-center justify-between gap-4">
        <button 
          onClick={handleSkip}
          className="px-6 py-4 text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          Skip
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          {step === totalSteps ? 'Get Started' : 'Continue'}
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Container */}
      <div className="w-full h-full lg:h-auto lg:max-w-xl bg-white dark:bg-slate-900 lg:rounded-[3rem] lg:shadow-2xl border-slate-100 dark:border-slate-800 lg:border relative flex flex-col p-8 md:p-12 overflow-y-auto">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {step === 1 && (
          <StepWrapper 
            title="Assalamu Alaikum" 
            subtitle="Let's start your spiritual journey. What should we call you?"
          >
            <div className="space-y-6 mt-4">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                <input 
                  autoFocus
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Your Name"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] outline-none transition-all text-lg font-bold dark:text-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest px-2">This is how we'll greet you in the app.</p>
            </div>
          </StepWrapper>
        )}

        {step === 2 && (
          <StepWrapper 
            title="Choose Your Path" 
            subtitle="How would you like to track your progress? You can change this later."
          >
            <div className="grid grid-cols-1 gap-4 mt-4">
              {[
                { id: 'soft', label: 'Soft', desc: 'Flexible tracking, perfect for beginners.', color: 'emerald' },
                { id: 'normal', label: 'Normal', desc: 'The balanced standard for daily tracking.', color: 'blue' },
                { id: 'strict', label: 'Strict', desc: 'No edits allowed after marking. For the disciplined.', color: 'rose' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFormData({ ...formData, strictness: m.id as any })}
                  className={`p-6 rounded-[2rem] border-2 text-left transition-all ${
                    formData.strictness === m.id 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-lg dark:text-white">{m.label}</span>
                    <div className={`p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm ${formData.strictness === m.id ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <Shield size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{m.desc}</p>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 3 && (
          <StepWrapper 
            title="Your Intention" 
            subtitle="This stays private. It's for your own reminder."
          >
            <div className="grid grid-cols-1 gap-3 mt-4">
              {[
                'Improve consistency',
                'Pray on time',
                'Build a habit',
                'Reconnect spiritually'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleIntention(goal)}
                  className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    formData.intentions?.includes(goal)
                    ? 'bg-white dark:bg-slate-800 border-emerald-500 text-emerald-600 shadow-md' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="font-bold">{goal}</span>
                  {formData.intentions?.includes(goal) ? (
                    <div className="bg-emerald-500 text-white rounded-full p-1"><Check size={14} /></div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
                  )}
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 4 && (
          <StepWrapper 
            title="Ready to Grow?" 
            subtitle="Your companion is prepared. May this be a source of barakah."
          >
            <div className="flex flex-col items-center justify-center py-10">
              <div className="relative mb-8 animate-bounce">
                <Logo size={120} />
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full -z-10"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-xl text-slate-900 dark:text-white">Bismillah!</p>
                <p className="text-slate-500 text-sm">Everything is set. Your data will be synced securely.</p>
              </div>
            </div>
          </StepWrapper>
        )}

      </div>
    </div>
  );
};

export default Onboarding;