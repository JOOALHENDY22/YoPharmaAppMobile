import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ShieldCheck, AlertCircle, AlertOctagon, Heart, HelpCircle, Activity, Info, Baby, PenLine, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchChronicSafety, fetchDrugSuggestions } from '../services/api';

interface ChronicCondition {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: any;
  colorClass: string;
}

export default function ChronicSafety() {
  const { i18n } = useTranslation();
  const [drugQuery, setDrugQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [customDisease, setCustomDisease] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [isChecking, setIsChecking] = useState(false);
  const [safetyResult, setSafetyResult] = useState<any>(null);
  const [error, setError] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (safetyResult && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [safetyResult]);

  const suggestionRef = useRef<HTMLDivElement>(null);
  const isEn = i18n.language.startsWith('en');
  const isEg = i18n.language === 'ar-EG';
  const isArabic = !isEn;

  const conditions: ChronicCondition[] = [
    { id: 'pregnancy', nameEn: 'Pregnancy & Lactation', nameAr: 'الحمل والرضاعة', icon: Baby, colorClass: 'border-pink-500 text-pink-500 bg-pink-50 dark:bg-pink-950/15' },
    { id: 'hypertension', nameEn: 'Hypertension', nameAr: 'ارتفاع ضغط الدم', icon: Activity, colorClass: 'border-red-500 text-red-500 bg-red-50 dark:bg-red-950/15' },
    { id: 'diabetes', nameEn: 'Diabetes', nameAr: 'مرض السكري', icon: Activity, colorClass: 'border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-950/15' },
    { id: 'kidney_disease', nameEn: 'Chronic Kidney Disease', nameAr: 'الفشل وقصور الكلى', icon: Activity, colorClass: 'border-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-950/15' },
    { id: 'heart_failure', nameEn: 'Heart Failure', nameAr: 'قصور وعضلة القلب', icon: Heart, colorClass: 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-950/15' },
    { id: 'asthma', nameEn: 'Asthma / COPD', nameAr: 'حساسية الصدر والربو', icon: Activity, colorClass: 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/15' },
    { id: 'peptic_ulcer', nameEn: 'Peptic Ulcer', nameAr: 'قرحة المعدة', icon: Info, colorClass: 'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/15' },
    { id: 'liver_disease', nameEn: 'Liver Cirrhosis', nameAr: 'تليف وأمراض الكبد', icon: Info, colorClass: 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/15' },
    { id: 'g6pd_deficiency', nameEn: 'G6PD Deficiency (Favism)', nameAr: 'أنيميا الفول', icon: AlertCircle, colorClass: 'border-yellow-500 text-yellow-500 bg-yellow-50 dark:bg-yellow-950/15' },
  ];

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for autocomplete suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (drugQuery.length >= 2) {
        const results = await fetchDrugSuggestions(drugQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [drugQuery]);

  const activeConditionName = () => {
    if (selectedDisease === 'custom') {
      return customDisease.trim();
    }
    const cond = conditions.find(c => c.id === selectedDisease);
    return cond ? (isArabic ? cond.nameAr : cond.nameEn) : '';
  };

  const handleCheck = async () => {
    const diseaseName = selectedDisease === 'custom' 
      ? customDisease.trim() 
      : conditions.find(c => c.id === selectedDisease)?.nameEn || selectedDisease;

    if (!drugQuery.trim() || !diseaseName) return;

    setIsChecking(true);
    setError(false);
    setSafetyResult(null);

    try {
      const data = await fetchChronicSafety(drugQuery, diseaseName);
      if (data && data.status) {
        setSafetyResult(data);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'safe':
        return {
          title: isArabic ? 'آمن للاستخدام' : 'Safe to Use',
          icon: ShieldCheck,
          cardClass: 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30',
          textClass: 'text-green-800 dark:text-green-400',
          iconClass: 'text-green-500',
        };
      case 'warning':
        return {
          title: isArabic ? 'يستخدم بحذر شديد / استشر طبيبك' : 'Use with Caution / Consult Doctor',
          icon: AlertCircle,
          cardClass: 'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30',
          textClass: 'text-amber-800 dark:text-amber-400',
          iconClass: 'text-amber-500',
        };
      case 'contraindicated':
        return {
          title: isArabic ? 'ممنوع تماماً (يشكل خطراً!)' : 'Contraindicated (Danger!)',
          icon: AlertOctagon,
          cardClass: 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30',
          textClass: 'text-red-800 dark:text-red-400',
          iconClass: 'text-red-500',
        };
      default:
        return {
          title: isArabic ? 'غير محدد' : 'Unknown',
          icon: HelpCircle,
          cardClass: 'border-l-4 border-l-gray-500 bg-gray-50/50 dark:bg-gray-800/10 border border-gray-100 dark:border-gray-700',
          textClass: 'text-gray-800 dark:text-gray-400',
          iconClass: 'text-gray-500',
        };
    }
  };

  const hasSelectedDisease = Boolean(
    (selectedDisease && selectedDisease !== 'custom') || 
    (selectedDisease === 'custom' && customDisease.trim())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary-500" />
          {isEn ? 'Chronic Disease & Pregnancy Safety Checker' : (isEg ? 'أمان الأدوية مع الأمراض المزمنة والحمل' : 'سلامة الأدوية مع الأمراض المزمنة والحمل')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {isEn 
            ? 'Enter a drug name and select a condition (or type any custom medical disease) to check compatibility, pregnancy safety, and clinical contraindications.'
            : (isEg 
              ? 'اكتب اسم الدوا واختار الحالة (أو الحمل أو اكتب أي مرض خاص بيك) عشان تعرف ينفع تاخده ولا خطر بالعامية المصرية' 
              : 'اكتب اسم الدواء واختر الحالة المرضية أو الحمل (أو اكتب أي مرض مخصص) للتأكد من السلامة وقراءة التوجيهات الطبية')}
        </p>
      </div>

      {/* Grid Inputs */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Drug Input Panel */}
        <div className="glass-panel p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-xs text-primary-600 dark:text-primary-400 font-bold">1</span>
              {isEn ? 'Specify Drug Name' : (isEg ? 'اكتب اسم الدوا' : 'ادخل اسم الدواء')}
            </h2>
            
            <div className="relative" ref={suggestionRef}>
              <div className="relative">
                <input
                  type="text"
                  className="block w-full pl-4 pr-10 rtl:pl-10 rtl:pr-4 py-4 rounded-xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  placeholder={isEn ? 'e.g. Voltaren, Aspirin, Congestal...' : (isEg ? 'مثلاً: فولتارين، أسبرين، كونجستال...' : 'مثال: Voltaren, Aspirin, Congestal...')}
                  value={drugQuery}
                  onChange={(e) => setDrugQuery(e.target.value)}
                  onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                />
                <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setDrugQuery(suggestion); setShowSuggestions(false); }}
                      className="w-full text-left rtl:text-right px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700 text-sm"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs text-gray-500">
            {isEn 
              ? 'Works with Egyptian trade names and generic active molecules.' 
              : (isEg 
                ? 'شغال مع كل الأسماء التجارية في الصيدليات والمواد العلمية.' 
                : 'متوافق مع الأسماء التجارية المصرية والمواد العلمية العالمية.')}
          </div>
        </div>

        {/* Chronic Condition Selection Panel */}
        <div className="glass-panel p-6 flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-xs text-primary-600 dark:text-primary-400 font-bold">2</span>
            {isArabic ? 'اختر الحالة الصحية أو اكتبها' : 'Select or Type Condition'}
          </h2>
          
          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
            {conditions.map((cond) => {
              const Icon = cond.icon;
              const isSelected = selectedDisease === cond.id;
              return (
                <button
                  key={cond.id}
                  onClick={() => {
                    setSelectedDisease(cond.id);
                    setCustomDisease('');
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-semibold ring-2 ring-primary-500/25 scale-[0.98]' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{isArabic ? cond.nameAr : cond.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Disease Free-Text Input */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5 text-primary-500" />
              <span>{isEn ? 'Or type ANY custom medical condition / disease:' : (isEg ? 'أو اكتب أي مرض أو حالة صحية خاصة هنا:' : 'أو اكتب أي مرض أو حالة صحية مخصصة هنا:')}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customDisease}
                onChange={(e) => {
                  setCustomDisease(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedDisease('custom');
                  }
                }}
                placeholder={isEn ? 'e.g. Epilepsy, Glaucoma, Hypothyroidism, Gout, Colon...' : (isEg ? 'مثلاً: الصرع، قصور الغدة الدرقية، النقرس، المياه الزرقاء، القولون...' : 'مثال: الصرع، قصور الغدة الدرقية، النقرس، الجلوكوما، القولون...')}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all ${
                  selectedDisease === 'custom' && customDisease.trim()
                    ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                } text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500`}
              />
              {selectedDisease === 'custom' && customDisease.trim() && (
                <span className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center text-[10px] font-bold text-primary-600 bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 rounded my-auto h-5">
                  {isArabic ? 'حالة مخصصة' : 'Custom'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Indicator Banner */}
      {hasSelectedDisease && drugQuery.trim() && (
        <div className="mb-6 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/40 text-center text-xs text-primary-900 dark:text-primary-300 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <span>
            {isEn ? 'Checking safety of ' : (isEg ? 'فحص أمان ' : 'فحص سلامة ')}
            <strong className="underline decoration-primary-500">{drugQuery.trim()}</strong>
            {isEn ? ' for patient with ' : (isEg ? ' مع حالة: ' : ' مع: ')}
            <strong className="underline decoration-primary-500">{activeConditionName()}</strong>
          </span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleCheck}
          disabled={!drugQuery.trim() || !hasSelectedDisease || isChecking}
          className="btn-primary py-4 px-12 rounded-xl font-semibold shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{isEn ? 'Running Clinical Analysis...' : (isEg ? 'بنتأكد من أمان الدوا مع حالتك...' : 'جاري الفحص السريري...')}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              <span>{isEn ? 'Check Safety Suitability' : (isEg ? 'افحص أمان الدوا مع حالتك' : 'افحص مدى السلامة')}</span>
            </>
          )}
        </button>
      </div>

      {/* Loading state indicator */}
      {isChecking && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-3" />
          <p className="text-gray-500 text-sm">
            {isEn 
              ? 'Cross-checking with contraindications, FDA labeling, and pregnancy/disease risks...' 
              : (isEg 
                ? 'بنشوف موانع الاستعمال وسلامة الحالة والحمل مع الدوا دا...' 
                : 'جاري الفحص المتقاطع مع الدواعي وموانع الاستعمال ومحاذير الحمل والأمراض...')}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isChecking && (
        <div className="glass-panel p-8 text-center border-l-4 border-l-red-500">
          <AlertOctagon className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">{isArabic ? 'عذراً، فشل فحص السلامة' : 'Safety Check Failed'}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isArabic 
              ? `لم نتمكن من تحليل تركيبة الدواء "${drugQuery}" مع الحالة المختارة. يرجى مراجعة صيدلاني مختص.` 
              : `Could not evaluate safety for "${drugQuery}" with the selected condition. Please try again or consult a pharmacist.`}
          </p>
        </div>
      )}

      {/* Results outcome panel */}
      {safetyResult && !isChecking && (() => {
        const display = getStatusDisplay(safetyResult.status);
        const Icon = display.icon;
        
        // Localized explanation
        const explanationText = isEg 
          ? (safetyResult.explanation_ar_eg || safetyResult.explanation_ar || safetyResult.explanation)
          : (isArabic 
            ? (safetyResult.explanation_ar || safetyResult.explanation_ar_eg || safetyResult.explanation)
            : (safetyResult.explanation_en || safetyResult.explanation));

        // Localized precautions
        const precautionsText = isEg
          ? (safetyResult.precautions_ar_eg || safetyResult.precautions_ar)
          : (isArabic ? (safetyResult.precautions_ar || safetyResult.precautions_ar_eg) : safetyResult.precautions_en);

        return (
          <div ref={resultsRef} className={`glass-panel p-6 space-y-4 animate-fade-in scroll-mt-24 ${display.cardClass}`}>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${display.iconClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{isArabic ? 'حالة السلامة السريرية' : 'Clinical Safety Status'}</h3>
                  <p className={`text-lg font-bold ${display.textClass}`}>
                    {display.title}
                  </p>
                </div>
              </div>

              <div className="text-right rtl:text-left text-xs text-gray-500">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{drugQuery}</span> + <span className="font-semibold text-gray-800 dark:text-gray-200">{activeConditionName()}</span>
              </div>
            </div>
            
            {/* Scientific and Practical Explanation */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary-500" />
                {isEn ? 'Clinical Assessment & Guidance:' : (isEg ? 'التوضيح والنصيحة الطبية:' : 'الإرشادات والتفسير العلمي:')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {explanationText}
              </p>
            </div>

            {/* Actionable Precautions if present */}
            {precautionsText && (
              <div className="p-3 bg-white/70 dark:bg-gray-800/50 rounded-xl text-xs space-y-1 border border-gray-100 dark:border-gray-700/50">
                <strong className="text-gray-900 dark:text-white flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary-500" />
                  {isEn ? 'Precautions & Practical Advice:' : (isEg ? 'نصايح وإرشادات مهمة:' : 'الاحتياطات والإرشادات الوقائية:')}
                </strong>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {precautionsText}
                </p>
              </div>
            )}

            <div className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg text-[10px] text-gray-500 leading-normal border border-gray-100 dark:border-gray-800">
              <strong>{isArabic ? 'تنبيه: ' : 'Notice: '}</strong>
              {isArabic 
                ? 'نتائج التحليل تمثل دليلاً إرشادياً عاماً، ولا تحل بأي حال من الأحوال محل الاستشارة الطبية المباشرة من طبيبك المختص.'
                : 'Evaluation results represent general guidelines and are not a substitute for direct consultation with your physician.'}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
