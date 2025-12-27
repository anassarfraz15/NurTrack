import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { Mail, Lock, Loader2, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { Logo } from '../constants.tsx';

interface AuthProps {
  onGuestMode: () => void;
}

const Auth: React.FC<AuthProps> = ({ onGuestMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isLogin 
        ? await (supabase.auth as any).signInWithPassword({ email, password })
        : await (supabase.auth as any).signUp({ email, password });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden p-4">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col justify-center">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 dark:border-slate-800 flex flex-col overflow-hidden max-h-[95vh]">
          
          {/* Compressed Hero Header */}
          <div className="relative pt-8 pb-4 flex flex-col items-center justify-center text-center px-6">
            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-50 opacity-50"></div>
            <div className="relative z-10 mb-3">
               <Logo size={80} className="drop-shadow-lg" />
            </div>
            <div className="relative z-10">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">NurTrack</h1>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Sparkles size={10} className="text-emerald-500" />
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Spiritual Companion</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
            {/* Toggle Switch */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-6 w-full max-w-[220px] mx-auto border border-slate-200/50 dark:border-slate-700/50">
              <button 
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                Login
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Mail size={10} /> Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="servant@nurtrack.com"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Lock size={10} /> Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm font-medium"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-xl border border-rose-100 dark:border-rose-800/50 text-center animate-in shake-200">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group overflow-hidden"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <span>{isLogin ? 'Enter App' : 'Create Account'}</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">Alternative</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <button 
                onClick={onGuestMode}
                className="w-full py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 group"
              >
                <Heart size={14} className="text-rose-500 fill-rose-500/20 group-hover:fill-rose-500 transition-colors" />
                Continue as Guest
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800/50 text-center">
              <p className="text-slate-400 dark:text-slate-500 text-[9px] leading-relaxed italic px-2">
                "Verily, in the remembrance of Allah do hearts find rest." 
                <span className="block mt-0.5 font-bold opacity-60">Surah Ar-Ra'd 13:28</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake-200 {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Auth;