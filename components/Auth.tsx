import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { Mail, Lock, Loader2, Sparkles, ChevronRight, UserPlus, LogIn, Heart, Moon, Star } from 'lucide-react';

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
    <div className="min-h-screen w-full relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 overflow-hidden transition-all duration-500">
          
          {/* Hero Section */}
          <div className="relative h-56 flex flex-col items-center justify-center text-center px-8 overflow-hidden">
            {/* Animated Light Orb */}
            <div className="absolute w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative z-10 mb-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-white font-black text-3xl">N</span>
              </div>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">NurTrack</h1>
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">
                <Sparkles size={12} />
                Illuminating Your Path
              </div>
            </div>
          </div>

          <div className="px-8 pb-10 md:px-14">
            {/* Toggle Switch */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-10 w-full max-w-xs mx-auto border border-slate-200/50 dark:border-slate-700/50">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. servant@nurtrack.com"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <Lock size={12} /> Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl border border-rose-100 dark:border-rose-800/50 animate-in shake-200">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[1.5rem] shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>{isLogin ? 'Enter NurTrack' : 'Begin Journey'}</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 flex flex-col gap-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink mx-6 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">Invited Entry</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <button 
                onClick={onGuestMode}
                className="w-full py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-[1.5rem] border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex items-center justify-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                  <Heart size={16} fill="currentColor" />
                </div>
                Explore as Guest
              </button>
            </div>

            {/* Spiritual Footer */}
            <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800/50 text-center">
              <p className="text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed italic px-4">
                "Verily, in the remembrance of Allah do hearts find rest." 
                <span className="block mt-1 font-bold opacity-60">— Surah Ar-Ra'd 13:28</span>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Icons for Aesthetic Depth */}
        <div className="hidden lg:block absolute -top-12 -right-12 text-emerald-500/20 animate-bounce" style={{ animationDuration: '4s' }}>
          <Star size={48} />
        </div>
        <div className="hidden lg:block absolute -bottom-12 -left-12 text-blue-500/20 animate-bounce" style={{ animationDuration: '6s' }}>
          <Moon size={48} />
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Auth;