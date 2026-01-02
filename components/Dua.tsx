import React, { useState } from 'react';
import { X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const handleNextStep = () => {
    if (!selectedStep) return;
    const nextIndex = selectedStep.id + 1;
    if (nextIndex < NAMAZ_STEPS.length) {
      setSelectedStep(NAMAZ_STEPS[nextIndex]);
    } else {
      setSelectedStep(null); // Close if it's the last step
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      {/* Header Section */}
      <header className="flex-shrink-0 mb-4 flex flex-col items-center relative">
        <div className="flex flex-col items-center gap-2 mb-2 w-full">
           <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
             <BookOpen size={24} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-charcoal-text tracking-tight text-center">Islamic Guide</h2>
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
                    : 'bg-white dark:bg-charcoal-surface text-slate-500 hover:bg-slate-50 dark:hover:bg-charcoal/50 border border-slate-100 dark:border-charcoal-border'
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
                className="w-full bg-white dark:bg-charcoal-surface p-5 rounded-2xl border border-slate-100 dark:border-charcoal-border shadow-sm flex items-center justify-between group hover:border-emerald-500/50 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-charcoal text-slate-400 font-bold text-xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 transition-colors">
                  {index + 1}
                </div>
                <span className="flex-1 text-right text-xl font-bold text-slate-800 dark:text-charcoal-text arabic-font mr-4">
                  {step.title}
                </span>
                <ChevronLeft size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors opacity-50" />
              </button>
            ))}
          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab !== 'namaz' && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-slate-50 dark:bg-charcoal/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-charcoal-border">
            <BookOpen size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">Content Coming Soon</h3>
            <p className="text-sm text-slate-400 mt-1">Authentic guidance for {TABS.find(t => t.id === activeTab)?.label} is being prepared.</p>
          </div>
        )}
      </div>

      {/* 4. Popup Structure */}
      {selectedStep && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 animate-in fade-in duration-300">
          <div 
            className="bg-white dark:bg-charcoal-surface w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-t sm:border border-slate-100 dark:border-charcoal-border animate-in slide-in-from-bottom-10 duration-300 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0 border-b border-slate-100 dark:border-charcoal-border pb-4">
              <button 
                onClick={() => setSelectedStep(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-text transition-colors bg-slate-50 dark:bg-charcoal rounded-xl"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-charcoal-text arabic-font">{selectedStep.title}</h3>
            </div>

            {/* Popup Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              {selectedStep.id === 0 && (
                /* Introduction Content */
                <div dir="rtl" className="space-y-6 text-right pb-4">
                  <p className="text-lg leading-loose text-slate-700 dark:text-charcoal-text arabic-font">
                    نماز کا مسنون طریقہ صحیح احادیث کی روشنی میں یہاں بیان کیا جا رہا ہے۔ نبی کریم ﷺ کا ارشاد ہے:
                  </p>
                  
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-6 rounded-2xl border-r-4 border-emerald-500 my-6">
                    <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-charcoal-text leading-relaxed arabic-font mb-3">
                      "نماز اس طرح پڑھو جس طرح مجھے پڑھتے ہوئے دیکھتے ہو۔"
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 arabic-font">
                      (صحیح بخاری: 631)
                    </p>
                  </div>

                  <p className="text-lg leading-loose text-slate-700 dark:text-charcoal-text arabic-font">
                    یہاں تکبیر تحریمہ سے لے کر سلام تک نماز کے ارکان اور ان میں پڑھی جانے والی مسنون دعائیں صحیح احادیث کے حوالوں کے ساتھ دی جا رہی ہیں۔
                  </p>
                </div>
              )}

              {selectedStep.id === 1 && (
                /* Takbeer-e-Tahrimah Content */
                <div dir="rtl" className="space-y-6 text-right pb-4">
                  <p className="text-lg leading-loose text-slate-700 dark:text-charcoal-text arabic-font">
                    نبی کریم ﷺ جب نماز شروع کرتے تو دونوں ہاتھوں کو کندھوں کے برابر اٹھاتے اور اللہ اکبر کہتے۔
                  </p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 arabic-font mb-4">
                    (صحیح بخاری: 735)
                  </p>

                  <p className="text-lg leading-loose text-slate-700 dark:text-charcoal-text arabic-font">
                    تکبیرِ تحریمہ کے بعد ہاتھ باندھ لیں اور ثناء پڑھیں۔
                  </p>

                  <hr className="border-slate-100 dark:border-charcoal-border my-4" />

                  {/* Section Title */}
                  <h4 className="text-xl font-bold text-slate-900 dark:text-charcoal-text arabic-font mb-4">
                    اس موقع پر نبی ﷺ سے مختلف دعائیں ثابت ہیں، یہاں سب سے زیادہ مشہور اور صحیح ترین دعائیں درج ہیں:
                  </h4>

                  {/* Dua 1: Subhanaka */}
                  <div className="my-6">
                    <div className="w-full bg-[#1e293b] dark:bg-charcoal rounded-2xl p-6 border border-slate-700 relative overflow-hidden shadow-lg">
                       <p className="text-2xl md:text-3xl leading-[2.2] text-center text-white arabic-font mb-4" dir="rtl">
                         سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَىٰ جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ
                       </p>
                       <p className="text-sm font-bold text-emerald-400 arabic-font text-center" dir="rtl">
                         (سنن ابی داؤد: 775، ترمذی: 242 — البانی نے اسے صحیح کہا ہے)
                       </p>
                    </div>
                  </div>

                  {/* Dua 2: Allahumma Baid */}
                  <div className="mt-8">
                     <h5 className="text-lg font-bold text-slate-800 dark:text-slate-200 arabic-font mb-2">
                       دوسری دعا (جو صحیح بخاری و مسلم میں ہے اور بہت فضیلت والی ہے):
                     </h5>
                     <p className="text-base text-slate-600 dark:text-slate-400 arabic-font mb-4 leading-relaxed">
                       حضرت ابوہریرہ رضی اللہ عنہ فرماتے ہیں کہ نبی ﷺ تکبیر اور قراءت کے درمیان تھوڑی دیر خاموش رہتے اور یہ دعا پڑھتے تھے:
                     </p>

                     {/* Arabic Block */}
                     <div className="w-full bg-[#1e293b] dark:bg-charcoal rounded-2xl p-6 border border-slate-700 relative overflow-hidden mb-6 shadow-lg">
                       <p className="text-2xl md:text-3xl leading-[2.2] text-center text-white arabic-font mb-4" dir="rtl">
                         اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ
                       </p>
                       <p className="text-sm font-bold text-emerald-400 arabic-font text-center" dir="rtl">
                         (صحیح بخاری: 744، صحیح مسلم: 598)
                       </p>
                     </div>
                     
                     {/* Urdu Translation Section */}
                     <div className="text-right space-y-2">
                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">ترجمہ</h4>
                        <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font leading-loose">
                          اے اللہ! میرے اور میری خطاؤں کے درمیان اتنی دوری کر دے جتنی دوری تو نے مشرق اور مغرب کے درمیان کی ہے۔
                        </p>
                        <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font leading-loose">
                          اے اللہ! مجھے گناہوں سے اس طرح پاک کر دے جیسے سفید کپڑا میل کچیل سے پاک کیا جاتا ہے۔
                        </p>
                        <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font leading-loose">
                           اے اللہ! میرے گناہوں کو پانی، برف اور اولوں سے دھو ڈال۔
                        </p>
                     </div>
                  </div>
                </div>
              )}

              {selectedStep.id === 2 && (
                /* Surah Al-Fatiha Content */
                <div dir="rtl" className="space-y-6 text-right pb-4">
                  <p className="text-lg leading-loose text-slate-700 dark:text-charcoal-text arabic-font">
                    اب تعوذ (اعوذ باللہ) اور تسمیہ (بسم اللہ) پڑھ کر سورۃ الفاتحہ پڑھیں۔
                  </p>

                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-2xl border-r-4 border-emerald-500 my-2">
                    <p className="text-lg font-bold text-slate-800 dark:text-charcoal-text arabic-font">
                      سورۃ الفاتحہ پڑھنا ہر نماز میں لازمی ہے۔
                    </p>
                    <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font mt-2">
                      حدیث: "اس شخص کی نماز نہیں جس نے سورۃ الفاتحہ نہیں پڑھی۔"
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 arabic-font mt-1">
                      (صحیح بخاری: 756)
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-charcoal-border my-6" />

                  {/* Ameen Section Header */}
                  <h3 className="text-2xl font-black text-slate-900 dark:text-charcoal-text arabic-font mb-2">
                    سورۃ الفاتحہ کے بعد "آمین" کہنا
                  </h3>
                  <p className="text-lg leading-loose text-slate-700 dark:text-charcoal-text arabic-font mb-6">
                    جب سورۃ الفاتحہ ختم ہو (یعنی ولا الضالین کہیں) تو "آمین" کہنا نبی کریم ﷺ کی سنت ہے اور جماعت کے ساتھ نماز پڑھتے ہوئے امام کے پیچھے آمین کہنا بھی ثابت ہے۔ اس کےمتعلق صحیح احادیث درج ذیل ہیں:
                  </p>

                  {/* Point 1 */}
                  <h4 className="text-xl font-bold text-slate-800 dark:text-charcoal-text arabic-font mb-3">
                    1. نبی کریم ﷺ کا خود بلند آواز سے آمین کہنا:
                  </h4>
                  <p className="text-lg text-slate-600 dark:text-slate-400 arabic-font mb-4">
                    نبی کریم ﷺ جب ولا الضالین پڑھتے تو بلند آواز سے آمین کہتے تھے۔
                  </p>
                  {/* Arabic Block 1 */}
                  <div className="w-full bg-[#1e293b] dark:bg-charcoal rounded-2xl p-6 border border-slate-700 relative overflow-hidden mb-6 shadow-lg">
                    <p className="text-2xl md:text-3xl leading-[2.2] text-center text-white arabic-font mb-4">
                      قَرَأَ ‏{`{غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلاَ الضَّالِّينَ}`}‏ فَقَالَ ‏"‏آمِينَ‏"‏ وَمَدَّ بِهَا صَوْتَهُ
                    </p>
                    <p className="text-sm font-bold text-emerald-400 arabic-font text-center">
                      (جامع ترمذی: 248 - امام ترمذی نے اسے حسن صحیح کہا ہے، سنن ابی داؤد: 932)
                    </p>
                  </div>
                  {/* Translation 1 */}
                  <div className="text-right space-y-2 mb-6">
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">ترجمہ</h4>
                    <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font leading-loose">
                      آپ ﷺ نے (سورۃ فاتحہ کی آیت) غیر المغضوب علیہم ولا الضالین پڑھی تو آپ ﷺ نے فرمایا "آمین" اور اس کے ساتھ اپنی آواز کو کھینچا (یعنی بلند کیا)۔
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-charcoal p-4 rounded-xl mb-8 border border-slate-100 dark:border-charcoal-border">
                    <p className="text-base text-slate-600 dark:text-slate-400 arabic-font">
                      <span className="font-bold">مزید:</span> صحیح بخاری میں امام زہری فرماتے ہیں: "وَكَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يَقُولُ آمِينَ" (اور اللہ کے رسول ﷺ آمین کہا کرتے تھے)۔ <span className="text-emerald-600 dark:text-emerald-400 font-bold">(صحیح بخاری، قبل الحدیث: 780)</span>
                    </p>
                  </div>

                  {/* Point 2 */}
                  <h4 className="text-xl font-bold text-slate-800 dark:text-charcoal-text arabic-font mb-3">
                    2۔ امام کے پیچھے مقتدیوں کا آمین کہنا (حکم نبوی ﷺ):
                  </h4>
                  <p className="text-lg text-slate-600 dark:text-slate-400 arabic-font mb-4">
                    جماعت میں جب امام "آمین" کہے تو پیچھے نماز پڑھنے والوں کو بھی "آمین" کہنا چاہیے۔
                  </p>
                  {/* Arabic Block 2 */}
                  <div className="w-full bg-[#1e293b] dark:bg-charcoal rounded-2xl p-6 border border-slate-700 relative overflow-hidden mb-6 shadow-lg">
                    <p className="text-2xl md:text-3xl leading-[2.2] text-center text-white arabic-font mb-4">
                      إِذَا أَمَّنَ الإِمَامُ فَأَمِّنُوا، فَإِنَّهُ مَنْ وَافَقَ تَأْمِينُهُ تَأْمِينَ الْمَلاَئِكَةِ غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ
                    </p>
                    <p className="text-sm font-bold text-emerald-400 arabic-font text-center">
                      (صحیح بخاری: 780، صحیح مسلم: 410)
                    </p>
                  </div>
                  {/* Translation 2 */}
                  <div className="text-right space-y-2 mb-8">
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">ترجمہ</h4>
                    <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font leading-loose">
                      جب امام آمین کہے تو تم بھی آمین کہو، کیونکہ جس کی آمین فرشتوں کی آمین کے ساتھ مل گئی، اس کے پچھلے گناہ معاف کر دیے جاتے ہیں۔
                    </p>
                  </div>

                  {/* Point 3 */}
                  <h4 className="text-xl font-bold text-slate-800 dark:text-charcoal-text arabic-font mb-3">
                    3. آمین کہنے کا درست وقت (امام کے پیچھے):
                  </h4>
                  <p className="text-lg text-slate-600 dark:text-slate-400 arabic-font mb-4">
                    ایک اور روایت میں وضاحت ہے کہ امام کے ولا الضالین کہنے پر آمین کہنی چاہیے۔
                  </p>
                  {/* Arabic Block 3 */}
                  <div className="w-full bg-[#1e293b] dark:bg-charcoal rounded-2xl p-6 border border-slate-700 relative overflow-hidden mb-6 shadow-lg">
                    <p className="text-2xl md:text-3xl leading-[2.2] text-center text-white arabic-font mb-4">
                      إِذَا قَالَ الإِمَامُ ‏{`{‏غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلاَ الضَّالِّينَ‏}`}‏ فَقُولُوا آمِينَ، فَإِنَّ الْمَلاَئِكَةَ تَقُولُ آمِينَ، وَإِنَّ الإِمَامَ يَقُولُ آمِينَ
                    </p>
                    <p className="text-sm font-bold text-emerald-400 arabic-font text-center">
                      (مسند احمد: 7187، صحیح بخاری: 782، سنن نسائی: 927)
                    </p>
                  </div>
                  {/* Translation 3 */}
                  <div className="text-right space-y-2 mb-8">
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">ترجمہ</h4>
                    <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font leading-loose">
                      جب امام غیر المغضوب علیہم ولا الضالین کہے تو تم "آمین" کہو، کیونکہ فرشتے بھی آمین کہتے ہیں اور امام بھی آمین کہتا ہے۔
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
                    <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 arabic-font mb-4">خلاصہ:</h4>
                    <p className="text-lg text-slate-700 dark:text-charcoal-text arabic-font mb-2">لہٰذا ان احادیث سے ثابت ہوا کہ:</p>
                    <ul className="list-disc pr-6 space-y-2 text-lg text-slate-700 dark:text-charcoal-text arabic-font">
                      <li>نبی کریم ﷺ خود بھی آمین کہتے تھے۔</li>
                      <li>امام اور مقتدی دونوں کو آمین کہنی چاہیے۔</li>
                      <li>آمین کہنے کی بہت فضیلت ہے (گناہوں کی معافی)</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {selectedStep.id > 2 && (
                /* Placeholder for Future Steps */
                <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                  <BookOpen size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">Authentic Hadith content loading...</p>
                </div>
              )}
            </div>

            {/* Popup Footer (Navigation Buttons) */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-charcoal-border flex-shrink-0 flex gap-3">
              <button 
                onClick={() => setSelectedStep(null)}
                className="flex-1 py-4 bg-slate-100 dark:bg-charcoal hover:bg-slate-200 dark:hover:bg-charcoal/80 text-slate-600 dark:text-slate-200 font-bold rounded-2xl transition-all active:scale-95"
              >
                Close
              </button>
              <button 
                onClick={handleNextStep}
                className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dua;