import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Utensils, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Apple, 
  Search, 
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchDrugSuggestions, fetchFoodInteractions } from '../services/api';

export default function FoodInteractions() {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const isEg = i18n.language === 'ar-EG';
  const isAr = !isEn;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  // Popular Egyptian medications for quick testing
  const popularDrugs = [
    { name: 'Ciprofloxacin', label_ar: 'سيبروفلوكساسين (سيبورباي)', label_en: 'Ciprofloxacin (Ciprobay)' },
    { name: 'Warfarin', label_ar: 'وارفارين (ماريفان)', label_en: 'Warfarin (Marevan)' },
    { name: 'Glucophage', label_ar: 'جلوكوفاج (ميتفورمين)', label_en: 'Glucophage (Metformin)' },
    { name: 'Eltroxin', label_ar: 'التروكسين (هرمون الغدة)', label_en: 'Eltroxin (Levothyroxine)' },
    { name: 'Concor', label_ar: 'كونكور (بيسوبرولول)', label_en: 'Concor (Bisoprolol)' },
    { name: 'Augmentin', label_ar: 'أوجمنتين (مضاد حيوي)', label_en: 'Augmentin (Amoxicillin/Clav)' },
    { name: 'Aspirin Protect', label_ar: 'أسبرين بروتكت', label_en: 'Aspirin Protect' }
  ];

  // Outside click to close autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const results = await fetchDrugSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (drugName: string) => {
    const target = drugName.trim();
    if (!target) return;
    setQuery(target);
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchFoodInteractions(target);
      if (data) {
        setResult(data);
      } else {
        setError(isAr ? 'لم نتمكن من جلب تفاعلات الطعام لهذا الدواء حالياً.' : 'Could not fetch food interactions for this drug.');
      }
    } catch (e: any) {
      console.error(e);
      setError(isAr ? 'حدث خطأ أثناء فحص التفاعلات الغذائية. يرجى المحاولة مرة أخرى.' : 'Error checking food interactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    const s = sev?.toLowerCase();
    if (s === 'high' || s === 'severe') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3 h-3" />
          {isAr ? 'خطر مرتفع' : 'High Severity'}
        </span>
      );
    }
    if (s === 'moderate' || s === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3" />
          {isAr ? 'تأثير متوسط' : 'Moderate Severity'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
        <Info className="w-3 h-3" />
        {isAr ? 'تأثير خفيف / انتباه' : 'Minor / Caution'}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Utensils className="w-4 h-4" />
          <span>{isEn ? 'Clinical Dietary & Drug Guidelines' : (isEg ? 'مواعيد الأكل وتفاعلات الوجبات مع الدوا' : 'التوجيهات الغذائية والدوائية السريرية')}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <Utensils className="h-10 w-10 text-primary-500" />
          <span>{isEn ? 'Drug & Food Interactions' : (isEg ? 'تفاعل الدوا مع الأكل والمشروبات' : 'تفاعل الدواء مع الأكل والمشروبات')}</span>
        </h1>

        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {isEn 
            ? 'Find precise meal timing guidelines (before or after food) and foods or beverages that impair absorption or trigger dangerous adverse effects.'
            : (isEg 
              ? 'اعرف ميعاد الدوا بالظبط (قبل الأكل ولا بعده)، وإيه الأكلات والمشروبات اللي تبعد عنها عشان متبوظش مفعول الدوا.' 
              : 'اعرف التوقيت الدقيق لتناول الدواء (قبل أو بعد الأكل)، والأطعمة والمشروبات التي تؤثر على امتصاصه أو تسبب آثاراً جانبية خطيرة.')}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-xl mb-8" ref={searchRef}>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {isEn ? 'Enter Medication Name (Egyptian Brand or Generic)' : (isEg ? 'اكتب اسم الدوا (مصري أو علمي)' : 'اكتب اسم الدواء (تجاري مصري أو علمي)')}
        </label>

        <div className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={isEn ? 'e.g. Ciprofloxacin, Concor, Warfarin...' : (isEg ? 'مثلاً: كونجستال، بنادول، أوجمنتين، كونكور...' : 'مثال: Ciprobay، Concor، Glucophage، Marevan...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              className="input-field w-full text-base py-3 pl-12 pr-12 rounded-2xl font-medium"
            />

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[100]">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(s)}
                    className="w-full text-right rtl:text-right ltr:text-left px-5 py-3 text-sm hover:bg-primary-50 dark:hover:bg-primary-950/40 text-gray-800 dark:text-gray-200 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700/50 flex items-center justify-between"
                  >
                    <span className="font-medium">{s}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleSearch(query)}
            disabled={loading || !query.trim()}
            className="btn-primary px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEn ? 'Analyzing...' : (isEg ? 'بنشوف تفاعل الأكل...' : 'جاري الفحص...')}</span>
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4" />
                <span>{isEn ? 'Check Interactions' : (isEg ? 'افحص تفاعل الأكل' : 'فحص التفاعلات')}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Picks */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80">
          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2 font-medium">
            {isAr ? 'أدوية شائعة للفحص السريع:' : 'Quick check popular medications:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {popularDrugs.map((d, i) => (
              <button
                key={i}
                onClick={() => handleSearch(d.name)}
                className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all font-medium border border-transparent hover:border-primary-300"
              >
                {isAr ? d.label_ar : d.label_en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-8 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 scroll-mt-24"
        >
          {/* Timing Banner Card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border-t-4 border-t-emerald-500 shadow-xl bg-gradient-to-br from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-gray-900 dark:to-gray-900">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {isAr ? 'توقيت تناول الجرعة السريري' : 'Administration Timing'}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {result.drug_name}
                  </h2>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'إرشادات معتمدة' : 'Clinical Guideline'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-emerald-100 dark:border-emerald-900/40 text-base font-semibold text-emerald-900 dark:text-emerald-200 mb-3">
              {isAr ? (result.timing_ar || result.timing) : (result.timing_en || result.timing)}
            </div>

            {(result.instructions_ar || result.instructions_en) && (
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {isAr ? result.instructions_ar : (result.instructions_en || result.instructions_ar)}
              </p>
            )}
          </div>

          {/* Specific Food & Beverage Warnings */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>{isAr ? 'الأطعمة والمشروبات التي تتطلب الحذر أو المنع' : 'Foods & Beverages Requiring Caution or Avoidance'}</span>
            </h3>

            {result.interactions && result.interactions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {result.interactions.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 hover:border-primary-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {isAr ? item.food_ar : (item.food_en || item.food_ar)}
                        </h4>
                        {getSeverityBadge(item.severity)}
                      </div>

                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <p>
                          <strong className="text-gray-900 dark:text-gray-200">{isAr ? 'الأثر السريري: ' : 'Clinical Effect: '}</strong>
                          {isAr ? item.effect_ar : (item.effect_en || item.effect_ar)}
                        </p>
                        <p className="text-primary-700 dark:text-primary-400 font-medium">
                          <strong>{isAr ? 'التوصية الصيدلانية: ' : 'Recommendation: '}</strong>
                          {isAr ? item.recommendation_ar : (item.recommendation_en || item.recommendation_ar)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl text-sm font-medium">
                {isAr 
                  ? 'لا توجد تفاعلات خطيرة مسجلة مع أطعمة معينة لهذا الدواء، يمكن تناوله بشكل طبيعي مع الوجبات أو بدونها.'
                  : 'No critical specific food interactions found. May generally be taken with or without food.'}
              </div>
            )}
          </div>

          {/* Clinical Dietary Tips */}
          {((result.dietary_tips_ar && result.dietary_tips_ar.length > 0) || (result.dietary_tips_en && result.dietary_tips_en.length > 0)) && (
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Apple className="w-5 h-5 text-emerald-500" />
                <span>{isAr ? 'نصائح غذائية هامة للمريض' : 'Essential Dietary Tips for the Patient'}</span>
              </h3>

              <ul className="space-y-2.5">
                {(isAr ? result.dietary_tips_ar : (result.dietary_tips_en || result.dietary_tips_ar)).map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
