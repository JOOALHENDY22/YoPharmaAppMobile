import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Search, ArrowRight, Loader2, Info, Factory, AlertTriangle, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchDrugAlternatives, fetchDrugSuggestions } from '../services/api';

type FilterType = 'all' | 'identical' | 'therapeutic';

export default function DrugAlternatives() {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [alternatives, setAlternatives] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [error, setError] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alternatives && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [alternatives]);
  
  const suggestionRef = useRef<HTMLDivElement>(null);

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
      if (searchQuery.length >= 2) {
        const results = await fetchDrugSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setShowSuggestions(false);
    setIsSearching(true);
    setError(false);
    setAlternatives(null);
    setSelectedFilter('all');

    try {
      const data = await fetchDrugAlternatives(query);
      if (data && (data.alternatives || data.identical_alternatives || data.therapeutic_alternatives)) {
        setAlternatives(data);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setIsSearching(false);
    }
  };

  const isEn = i18n.language.startsWith('en');
  const isEg = i18n.language === 'ar-EG';
  const isArabic = !isEn;

  // Extract classified arrays
  const identicalList: any[] = alternatives?.identical_alternatives || 
    (alternatives?.alternatives ? alternatives.alternatives.filter((a: any) => a.relation_type === 'identical' || !a.relation_type) : []);
  
  const therapeuticList: any[] = alternatives?.therapeutic_alternatives || 
    (alternatives?.alternatives ? alternatives.alternatives.filter((a: any) => a.relation_type === 'therapeutic') : []);

  const totalCount = identicalList.length + therapeuticList.length;

  const displayedList = selectedFilter === 'identical' 
    ? identicalList 
    : selectedFilter === 'therapeutic' 
      ? therapeuticList 
      : [...identicalList, ...therapeuticList];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary-500 animate-spin-slow" />
          {isEn ? 'Egyptian & Generic Drug Alternatives' : (isEg ? 'بدائل الأدوية في السوق المصري' : 'بدائل الأدوية المصرية والعالمية')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isEn 
            ? 'Find and classify alternatives into identical active molecules or therapeutic alternatives for the same purpose.'
            : (isEg 
              ? 'صنف بدائل أي دوا في مصر: بديل مطابق لنفس المادة بالمللي، وبديل علاجي لنفس الاستخدام بس بمادة تانية' 
              : 'تصنيف دقيق لبدائل الأدوية: بدائل مطابقة تماماً للمادة الفعالة، وبدائل علاجية تحقق نفس الغرض')}
        </p>
      </div>

      {/* Search Section */}
      <div className="relative mb-10" ref={suggestionRef}>
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="relative">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 rtl:pl-4 rtl:pr-12 pr-32 rtl:pr-12 rtl:pl-32 py-5 text-lg rounded-2xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg shadow-gray-200/20 dark:shadow-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all"
            placeholder={isEn ? 'Enter drug name (e.g. Voltaren, Congestal, Augmentin)...' : (isEg ? 'اكتب اسم الدوا (مثلاً: فولتارين، كونجستال، أوجمنتين)...' : 'ادخل اسم الدواء (مثال: Voltaren, Congestal, Augmentin)...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
          />
          <div className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center">
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="btn-primary py-3 px-6 rounded-xl text-sm"
            >
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEn ? 'Find Alternatives' : (isEg ? 'دور على البدائل' : 'ابحث عن البدائل'))}
            </button>
          </div>
        </form>

        {/* Live Auto-Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(suggestion)}
                className="w-full text-left rtl:text-right px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-white">{suggestion}</span>
                <ArrowRight className="h-4 w-4 text-gray-400 rtl:rotate-180" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-3" />
          <p className="text-gray-500 text-sm">
            {isEn ? 'Analyzing active ingredient & classifying alternatives...' : (isEg ? 'بنشوف المادة الفعالة وبنصنف لك البدائل المطابقة والعلاجية...' : 'جاري تحليل المادة الفعالة وتصنيف البدائل المطابقة والعلاجية...')}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isSearching && (
        <div className="glass-panel p-8 text-center border-l-4 border-l-red-500">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">{isArabic ? 'لم نتمكن من العثور على بدائل' : 'No Alternatives Found'}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isArabic 
              ? `عذراً، لم نتمكن من تحديد المادة الفعالة أو بدائل مسجلة لـ "${searchQuery}". تأكد من صحة الاسم.` 
              : `Could not identify active ingredients or Egyptian equivalents for "${searchQuery}". Please check the spelling.`}
          </p>
        </div>
      )}

      {/* Results Section */}
      {alternatives && !isSearching && (
        <div ref={resultsRef} className="space-y-6 animate-fade-in scroll-mt-24">
          {/* Active Ingredient & Indication Summary */}
          <div className="glass-panel p-6 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border-l-4 border-l-primary-500 space-y-3">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Info className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-primary-800 dark:text-primary-300 uppercase tracking-wider">
                  {isArabic ? 'المادة الفعالة / الاسم العلمي' : 'Active Scientific Ingredient'}
                </h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {isArabic 
                    ? (alternatives.active_ingredient_ar || alternatives.active_ingredient) 
                    : (alternatives.active_ingredient_en || alternatives.active_ingredient)}
                </p>

                {/* Primary indication */}
                {(alternatives.indication_summary_ar_eg || alternatives.indication_summary_ar || alternatives.indication_summary_en) && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {isEn ? 'Primary Purpose:' : (isEg ? 'الاستخدام العلاجي:' : 'دواعي الاستعمال الرئيسية:')}
                    </span>
                    <span>
                      {isEg 
                        ? (alternatives.indication_summary_ar_eg || alternatives.indication_summary_ar)
                        : (isArabic ? (alternatives.indication_summary_ar || alternatives.indication_summary_ar_eg) : (alternatives.indication_summary_en || alternatives.indication_summary_ar))}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Classification Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
            {/* All */}
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedFilter === 'all'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>{isEn ? 'All Alternatives' : 'جميع البدائل'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedFilter === 'all' ? 'bg-primary-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {totalCount}
              </span>
            </button>

            {/* Identical (Same Active Molecule) */}
            <button
              onClick={() => setSelectedFilter('identical')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedFilter === 'identical'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{isEn ? 'Generic Equivalents (Identical Molecule)' : (isEg ? 'بدائل مطابقة لنفس المادة' : 'بدائل مطابقة تماماً (نفس المادة)')}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedFilter === 'identical' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'}`}>
                {identicalList.length}
              </span>
            </button>

            {/* Therapeutic (Same Indication / Different Molecule) */}
            <button
              onClick={() => setSelectedFilter('therapeutic')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedFilter === 'therapeutic'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 border border-purple-200 dark:border-purple-800/40'
              }`}
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>{isEn ? 'Therapeutic Alternatives (Same Purpose)' : (isEg ? 'بدائل علاجية لنفس الاستخدام' : 'بدائل علاجية (نفس الاستخدام بمادة أخرى)')}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedFilter === 'therapeutic' ? 'bg-purple-700 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200'}`}>
                {therapeuticList.length}
              </span>
            </button>
          </div>

          {/* Alternatives Grid */}
          <div>
            <div className="grid md:grid-cols-2 gap-4">
              {displayedList.map((alt: any, idx: number) => {
                const isIdentical = alt.relation_type === 'identical' || (!alt.relation_type && !alt.active_molecule);
                
                return (
                  <Link
                    key={idx}
                    to={`/drug/${encodeURIComponent(alt.brand_name)}`}
                    className={`glass-panel p-5 transition-all duration-300 flex flex-col justify-between group hover:shadow-lg ${
                      isIdentical 
                        ? 'border-l-4 border-l-emerald-500 hover:border-emerald-500' 
                        : 'border-l-4 border-l-purple-500 hover:border-purple-500'
                    }`}
                  >
                    <div>
                      {/* Top Row: Brand & Category Badge */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                          {alt.brand_name_ar && isArabic ? `${alt.brand_name_ar} (${alt.brand_name})` : alt.brand_name}
                        </h3>
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full shrink-0 flex items-center gap-1 ${
                          isIdentical
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                        }`}>
                          {isIdentical ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{isEn ? 'Identical Molecule' : (isEg ? 'نفس المادة بالمللي' : 'مطابق تماماً')}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              <span>{isEn ? 'Therapeutic Alternative' : (isEg ? 'بديل لنفس الغرض' : 'بديل علاجي')}</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Therapeutic Molecule Description */}
                      {!isIdentical && (alt.active_molecule || alt.active_molecule_ar) && (
                        <div className="mb-2 p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/15 border border-purple-100 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-300">
                          <span className="font-semibold">{isArabic ? 'المادة الفعالة البديلة: ' : 'Alternative Molecule: '}</span>
                          <span>{isArabic ? (alt.active_molecule_ar || alt.active_molecule) : (alt.active_molecule_en || alt.active_molecule)}</span>
                        </div>
                      )}

                      {/* Manufacturer */}
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1.5 mt-1">
                        <Factory className="h-3.5 w-3.5" />
                        <span>{alt.manufacturer || (isArabic ? 'سوق الدواء المصري' : 'Egyptian Market')}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Price category & View Arrow */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {isArabic 
                          ? (alt.price_category_ar || alt.price_category || 'متوفر') 
                          : (alt.price_category_en || alt.price_category || 'Available')}
                      </span>

                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                        <span>{isEn ? 'View Drug Details' : (isEg ? 'عرض كارت الدوا' : 'عرض التفاصيل')}</span>
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/10 rounded-xl border border-amber-200 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 text-center leading-relaxed">
            <strong>{isArabic ? 'تنبيه طبي وتوجيه صيدلي: ' : 'Medical & Clinical Notice: '}</strong>
            {isArabic 
              ? 'البدائل المطابقة تحتوي على نفس المادة الفعالة، بينما البدائل العلاجية تستخدم لنفس الغرض بمادة مختلفة. يرجى دائماً مراجعة الصيدلي أو الطبيب للتأكد من ملاءمة الجرعة والشكل الصيدلي لحالتك الصحية.' 
              : 'Generic equivalents share the exact active ingredient, while therapeutic alternatives achieve similar goals via different molecules. Always verify dosage and pharmaceutical form with your pharmacist.'}
          </div>
        </div>
      )}
    </div>
  );
}
