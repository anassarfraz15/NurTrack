
import React, { useState } from 'react';
import { X, BookOpen, Menu, ChevronLeft } from 'lucide-react';

interface DuaProps {
  onOpenDrawer: () => void;
}

const TABS = [
  { id: 'namaz', label: 'Namaz' },
  { id: 'wuzu', label: 'Wuzu' },
  { id: 'fasting', label: 'Fasting' },
  { id: 'duas', label: 'Duas' },
];

const NAMAZ_STEPS = [
  { id: 0, title: 'تعارف' },
  { id: 1, title: 'تکبیرِ تحریمہ' },
  { id: 2, title: 'سورۃ الفاتحہ' },
  { id: 3, title: 'رکوع' },
  { id: 4, title: 'سجدہ' },
  { id: 5, title: 'تشہد اور اہم دعائیں' }
];

const Dua: React.FC<DuaProps> = ({ onOpenDrawer }) => {
  const [activeTab, setActiveTab] = useState('namaz');
  const [selectedStep, setSelectedStep] = useState<{ id: number; title: string } | null>(null);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      {/* Header Section */}
      <header className="flex-shrink-0 mb-4 flex flex-col items-center relative">
        <button 
          onClick={onOpenDrawer}
          className="lg:hidden absolute left-0 top-1 p-2 text-slate-400 hover:text-emerald-600 transition-colors z-10"
          aria-label="Open Settings"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col items-center gap-2 mb-2 w-full">
           <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
             <BookOpen size={24} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center">Islamic Guide</h2>
        </div>
      </header>

      {/* 1. Top Horizontal Tabs */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 pb-20">
        
        {/* 3. Namaz Tab Structure */}
        {activeTab === 'namaz' && (
          <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
            {NAMAZ_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step)}
                className="w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/50 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 transition-colors">
                  {index + 1}
                </div>
                <span className="flex-1 text-right text-xl font-bold text-slate-800 dark:text-slate-100 arabic-font mr-4">
                  {step.title}
                </span>
                <ChevronLeft size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors opacity-50" />
              </button>
            ))}
          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab !== 'namaz' && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">Content Coming Soon</h3>
            <p className="text-sm text-slate-400 mt-1">Authentic guidance for {TABS.find(t => t.id === activeTab)?.label} is being prepared.</p>
          </div>
        )}
      </div>

      {/* 4. Popup Structure */}
      {selectedStep && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-t sm:border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-10 duration-300 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0 border-b border-slate-100 dark:border-slate-800 pb-4">
              <button 
                onClick={() => setSelectedStep(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white arabic-font">{selectedStep.title}</h3>
            </div>

            {/* Popup Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              {selectedStep.id === 0 ? (
                /* Introduction Content */
                <div dir="rtl" className="space-y-6 text-right pb-4">
                  <p className="text-lg leading-loose text-slate-700 dark:text-slate-300 arabic-font">
                    نماز کا مسنون طریقہ صحیح احادیث کی روشنی میں یہاں بیان کیا جا رہا ہے۔ نبی کریم ﷺ کا ارشاد ہے:
                  </p>
                  
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-6 rounded-2xl border-r-4 border-emerald-500 my-6">
                    <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed arabic-font mb-3">
                      "نماز اس طرح پڑھو جس طرح مجھے پڑھتے ہوئے دیکھتے ہو۔"
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 arabic-font">
                      (صحیح بخاری: 631)
                    </p>
                  </div>

                  <p className="text-lg leading-loose text-slate-700 dark:text-slate-300 arabic-font">
                    یہاں تکبیر تحریمہ سے لے کر سلام تک نماز کے ارکان اور ان میں پڑھی جانے والی مسنون دعائیں صحیح احادیث کے حوالوں کے ساتھ دی جا رہی ہیں۔
                  </p>
                </div>
              ) : (
                /* Placeholder for Future Steps */
                <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                  <BookOpen size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">Authentic Hadith content loading...</p>
                </div>
              )}
            </div>

            {/* Popup Footer (Close Button) */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
              <button 
                onClick={() => setSelectedStep(null)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dua;
