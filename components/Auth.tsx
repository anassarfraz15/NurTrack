import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { Mail, Lock, Loader2, Sparkles, ChevronRight, Heart, Moon, Star } from 'lucide-react';
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
    <div className="h-screen w-full relative flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col justify-center">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-white dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Compact Hero Section */}
          <div className="relative flex-shrink-0 pt-8 pb-4 flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative z-10 mb-3 transform scale-90">
               <Logo size={90} className="drop-shadow-xl" />
            </div>
            <div className="relative z-10">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">NurTrack</h1>
              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">Illuminating Your Path</p>
            </div>
          </div>

          <div className="px-6 pb-8 md:px-10 overflow-y-auto no-scrollbar flex-1">
            {/* Toggle Switch */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-6 w-full max-w-[240px] mx-auto border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Mail size={10} /> Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
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
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-xl border border-rose-100 dark:border-rose-800/50 animate-in shake-200 text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <span>{isLogin ? 'Enter NurTrack' : 'Begin Journey'}</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">OR</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <button 
                onClick={onGuestMode}
                className="w-full py-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <Heart size={14} className="text-rose-500 fill-current" />
                Explore as Guest
              </button>
            </div>

            {/* Spiritual Footer - Compact */}
            <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800/50 text-center flex-shrink-0">
              <p className="text-slate-400 dark:text-slate-500 text-[9px] leading-relaxed italic">
                "Verily, in the remembrance of Allah do hearts find rest." 
                <span className="block mt-0.5 font-bold opacity-60">13:28</span>
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Floating Decor */}
        <div className="hidden lg:block absolute -top-10 -right-10 text-emerald-500/10 animate-bounce" style={{ animationDuration: '4s' }}>
          <Star size={40} />
        </div>
      </div>
      
      <style>{`
        @keyframes shake-200 {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-in {
          animation: fade-in 0.6s ease-out forwards;
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