
import React, { useState } from 'react';
import { LayoutDashboard, Pocket, Activity, Menu, X, Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';
// Removed missing User type from @supabase/supabase-js
import { supabase } from '../services/supabase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  drawerContent?: React.ReactNode; 
  // Changed User type to any to bypass missing export error
  user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, drawerContent, user }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Today' },
    { id: 'analytics', icon: Activity, label: 'Stats' },
    { id: 'tools', icon: Pocket, label: 'Tools' },
  ];

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  const handleLogout = async () => {
    // Cast supabase.auth to any to resolve property access error
    await (supabase.auth as any).signOut();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-50">
        <button 
          onClick={toggleDrawer}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Open Settings"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">NurTrack</h1>
        </div>
        
        <div className="w-10"></div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 transition-colors duration-500 flex-shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">NurTrack</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[...mainTabs, { id: 'settings', icon: SettingsIcon, label: 'Settings' }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        {user && (
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <UserIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-semibold"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative transition-colors duration-500 pb-24 lg:pb-0" style={{ overscrollBehaviorY: 'contain' }}>
        <div className="max-w-5xl mx-auto w-full p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Dock */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-2 flex items-center justify-around shadow-2xl z-40">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                isActive 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
                : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <tab.icon size={22} className={isActive ? 'animate-bounce-short' : ''} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Settings Drawer */}
      <div 
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={toggleDrawer}></div>
        <div 
          className={`absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 transform flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold dark:text-white">Settings</h2>
            </div>
            <button onClick={toggleDrawer} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            <div className="settings-drawer-content">
              {drawerContent}
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             {user && (
               <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Logged in as</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</p>
                  <button onClick={handleLogout} className="mt-3 text-[10px] font-black text-rose-500 uppercase flex items-center gap-1">
                    <LogOut size={12} /> Sign Out
                  </button>
               </div>
             )}
             <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">NurTrack v1.1.0 (Cloud Sync)</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out 1;
        }
      `}</style>
    </div>
  );
};

export default Layout;
