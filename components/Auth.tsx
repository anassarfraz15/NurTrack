import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { Mail, Lock, Loader2, ChevronRight, Heart, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  // Map raw Supabase errors to user-friendly messages
  const mapAuthError = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes('valid email')) return "Please enter a valid email address.";
    if (msg.includes('password') && (msg.includes('short') || msg.includes('characters'))) return "Password should be at least 6 characters.";
    if (msg.includes('email not confirmed')) return "Please confirm your email address before logging in.";
    if (msg.includes('invalid login credentials')) return "Incorrect email or password. Please try again.";
    if (msg.includes('user already registered')) return "This email is already registered. Please log in.";
    // Catch-all
    return "Something went wrong. Please try again in a moment.";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setShowResend(false);

    try {
      if (isLogin) {
        const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await (supabase.auth as any).signUp({ 
          email, 
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        
        // Handle Email Confirmation Flow
        if (data.user && !data.session) {
          setSuccessMessage("You’re almost done! Please check your email and confirm your account before logging in.");
          setIsLogin(true); // Switch to login mode
          setPassword('');  // Clear password for security
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err.message);
      const friendlyMsg = mapAuthError(err.message || "");
      setError(friendlyMsg);
      
      if (friendlyMsg.includes("confirm your email")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await (supabase.auth as any).resend({ type: 'signup', email });
      if (error) throw error;
      setSuccessMessage("Confirmation email resent. Please check your inbox.");
      setError(null);
      setShowResend(false);
    } catch (err: any) {
      setError(mapAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-slate-50 dark:bg-charcoal overflow-hidden p-4">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col justify-center">
        <div className="bg-white/90 dark:bg-charcoal-surface/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white/50 dark:border-charcoal-border flex flex-col overflow-hidden transition-all duration-500">
          
          {/* Compressed Hero Header */}
          <div className="relative pt-8 pb-6 flex flex-col items-center justify-center text-center px-6 border-b border-slate-50 dark:border-charcoal-border/50">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent pointer-events-none"></div>
            <div className="relative z-10 mb-4 transform hover:scale-105 transition-transform duration-500">
               <Logo size={70} className="drop-shadow-xl" />
            </div>
            <div className="relative z-10">
              <h1 className="text-2xl font-black text-slate-900 dark:text-charcoal-text tracking-tighter leading-none mb-1">NurTrack</h1>
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles size={10} className="text-emerald-500" />
                <p className="text-[9px] font-bold text-slate-400 dark:text-charcoal-accent uppercase tracking-[0.25em]">Spiritual Companion</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-5 sm:px-8 py-6 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
            
            {/* Smooth Toggle Switch */}
            <div className="relative flex p-1 bg-slate-100 dark:bg-charcoal rounded-xl mb-6 w-full border border-slate-200/50 dark:border-charcoal-border/50 shrink-0">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-charcoal-surface rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isLogin ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'}`} 
              />
              <button 
                onClick={() => { setIsLogin(true); setError(null); setSuccessMessage(null); setShowResend(false); }}
                className={`flex-1 relative py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isLogin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
              >
                Login
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(null); setSuccessMessage(null); setShowResend(false); }}
                className={`flex-1 relative py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${!isLogin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
              >
                Register
              </button>
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {successMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5" key={isLogin ? 'login' : 'register'}>
              <div className="space-y-4 animate-slide-in">
                <div className="group space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={10} /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="servant@nurtrack.com"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-charcoal/50 border border-slate-200 dark:border-charcoal-border rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-charcoal-accent text-sm font-bold"
                    required
                  />
                </div>

                <div className="group space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={10} /> Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-charcoal/50 border border-slate-200 dark:border-charcoal-border rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-charcoal-accent text-sm font-bold"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-100 dark:border-rose-900/50 text-center animate-shake leading-tight flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                  {showResend && (
                    <button 
                      type="button" 
                      onClick={handleResend}
                      className="text-[10px] underline hover:text-rose-700 dark:hover:text-rose-300 mt-1 uppercase tracking-wider font-black"
                    >
                      Resend Verification Email
                    </button>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden relative max-w-full disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <span className="relative z-10 truncate">{isLogin ? 'Enter App' : 'Create Account'}</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform shrink-0" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 space-y-4 animate-fade-in delay-100">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-charcoal-border"></div>
                <span className="flex-shrink mx-4 text-[8px] font-black text-slate-300 dark:text-charcoal-accent uppercase tracking-[0.4em]">Or</span>
                <div className="flex-grow border-t border-slate-100 dark:border-charcoal-border"></div>
              </div>

              <button 
                onClick={onGuestMode}
                className="w-full py-3.5 bg-white dark:bg-charcoal-surface text-slate-600 dark:text-charcoal-sub font-bold text-xs rounded-2xl border border-slate-200 dark:border-charcoal-border hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-charcoal/50 transition-all flex items-center justify-center gap-2 group active:scale-[0.99] max-w-full"
              >
                <Heart size={14} className="text-rose-500 fill-rose-500/20 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">Continue as Guest</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-50 dark:border-charcoal-border bg-slate-50/50 dark:bg-charcoal/50 text-center">
             <p className="text-slate-400 dark:text-charcoal-accent text-[10px] leading-relaxed italic">
               "Verily, in the remembrance of Allah do hearts find rest."
             </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; opacity: 0; animation-fill-mode: forwards; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Auth;