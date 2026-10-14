import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Activity, 
  Utensils, 
  HeartPulse, 
  RefreshCw, 
  ShieldAlert, 
  ArrowRight, 
  Pill, 
  Shield, 
  Scale
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchDrugSuggestions } from '../services/api';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language.startsWith('ar');

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Trending & Essential Egyptian Medications
  const popularDrugs = [
    { name: 'Augmentin', label_ar: 'أوجمنتين (Augmentin)', label_en: 'Augmentin' },
    { name: 'Concor', label_ar: 'كونكور (Concor)', label_en: 'Concor' },
    { name: 'Panadol Extra', label_ar: 'بنادول إكسترا (Panadol)', label_en: 'Panadol Extra' },
    { name: 'Cataflam', label_ar: 'كتافلام (Cataflam)', label_en: 'Cataflam' },
    { name: 'Glucophage', label_ar: 'جلوكوفاج (Glucophage)', label_en: 'Glucophage' },
    { name: 'Ciprofloxacin', label_ar: 'سيبروفلوكساسين (Cipro)', label_en: 'Ciprofloxacin' },
  ];

  // Hotkey listener: Press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete fetch
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        const results = await fetchDrugSuggestions(searchQuery.trim());
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/drug/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        navigate(`/drug/${encodeURIComponent(suggestions[selectedSuggestionIndex])}`);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // 6 Core Clinical Tools Showcase
  const clinicalModules = [
    {
      title_ar: 'فاحص التفاعلات الدوائية',
      title_en: 'Drug-Drug Interactions',
      desc_ar: 'فحص فوري للتعارضات بين أدويتك المتعددة وتصنيف مستويات الخطورة (عالية، متوسطة، بسيطة) مع البروتوكول السريري لإدارتها.',
      desc_en: 'Comprehensive cross-interaction analysis with severity stratification and evidence-based clinical management guidelines.',
      icon: Activity,
      path: '/interaction',
      badge_ar: 'فحص متعدد الأدوية',
      badge_en: 'Multi-Drug Checker',
    },
    {
      title_ar: 'تفاعلات الأدوية مع الطعام والشراب',
      title_en: 'Food-Drug Interactions & Timing',
      desc_ar: 'تحديد المواعيد الدقيقة لتناول الجرعات (قبل أو بعد الوجبات)، وقائمة الأطعمة والمشروبات الممنوعة لتجنب تأثر الامتصاص.',
      desc_en: 'Precise meal administration timing, prohibited foods & beverages, and pharmacological absorption mechanisms.',
      icon: Utensils,
      path: '/food-interactions',
      badge_ar: 'جدول الوجبات',
      badge_en: 'Meal Timing',
    },
    {
      title_ar: 'دليل المقاييس الحيوية والتحاليل',
      title_en: 'Vital Signs & Biomarkers Guide',
      desc_ar: 'مرجع شامل لـ 22 مقياساً ومؤشراً مخبرياً (ضغط الدم، السكر التراكمي، وظائف الكلى والكبد) مع مقيّم رقمي فوري.',
      desc_en: 'Clinical reference for 22 vital signs and laboratory biomarkers featuring an interactive numerical evaluator.',
      icon: HeartPulse,
      path: '/vitals',
      badge_ar: '22 مقياس سريري',
      badge_en: '22 Biomarkers',
    },
    {
      title_ar: 'دليل البدائل والمثائل في مصر',
      title_en: 'Egyptian Drug Alternatives',
      desc_ar: 'البحث عن كافة الأدوية البديلة المسجلة في السوق المصري التي تشترك في نفس المادة الفعالة مع الفئات السعرية والشركات.',
      desc_en: 'Find brand equivalents sharing the same active ingredient registered in the Egyptian market with price tiers.',
      icon: RefreshCw,
      path: '/alternatives',
      badge_ar: 'السوق المصري',
      badge_en: 'Egyptian Market',
    },
    {
      title_ar: 'أمان وموانع الأمراض المزمنة',
      title_en: 'Chronic Disease Safety Checker',
      desc_ar: 'التحقق الدقيق من ملاءمة الأدوية وموانع استعمالها لمرضى الضغط، السكري، القصور الكلوي المزمن، وأمراض الكبد.',
      desc_en: 'Evaluate safety profiles and contraindications for patients with Hypertension, Diabetes, CKD, and Hepatic disease.',
      icon: ShieldAlert,
      path: '/chronic-safety',
      badge_ar: 'سلامة المرضى',
      badge_en: 'Patient Safety',
    },
    {
      title_ar: 'مصفوفة المقارنة الدوائية السريرية',
      title_en: 'Side-by-Side Drug Comparison',
      desc_ar: 'مقارنة مباشرة وجهاً لوجه بين دواءين في المادة الفعالة، والجرعات، والآثار الجانبية، وموانع الاستعمال لتسهيل الاختيار.',
      desc_en: 'Side-by-side clinical matrix comparing two drugs across ingredients, dosing guidelines, side effects, and precautions.',
      icon: Scale,
      path: '/compare',
      badge_ar: 'مقارنة مباشرة',
      badge_en: 'Direct Comparison',
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      
      {/* 🏥 Hero Section: Academic & Human Medical Header */}
      <header className="text-center max-w-3xl mx-auto pt-4 pb-2 space-y-4">
        
        {/* Academic University Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 text-teal-800 dark:text-teal-200 text-xs font-semibold shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400"></span>
          <span>{isAr ? 'الجامعة المصرية الصينية (ECU) • كلية الصيدلة' : 'Egyptian Chinese University (ECU) • Faculty of Pharmacy'}</span>
        </div>

        {/* Main Human Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {isAr ? (
            <>
              المرجع الصيدلاني السريري الذكي{' '}
              <span className="text-teal-700 dark:text-teal-400 font-black">YoPharma</span>
            </>
          ) : (
            <>
              Evidence-Based Clinical Pharmacy{' '}
              <span className="text-teal-700 dark:text-teal-400 font-black">YoPharma</span>
            </>
          )}
        </h1>

        {/* Human Editorial Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          {isAr 
            ? 'منصة صيدلانية متخصصة لدعم اتخاذ القرارات السريرية، فحص تداخلات الأدوية والأغذية، ومطابقة بدائل ومثائل الأدوية في السوق المصري.'
            : 'Dedicated clinical platform designed to empower healthcare practitioners with interaction checks, food timing, and Egyptian drug alternatives.'}
        </p>

        {/* 🔍 Primary Search Command Center */}
        <div className="max-w-2xl mx-auto pt-2" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-clinical rounded-2xl bg-white dark:bg-slate-900">
            <div className="absolute left-4 rtl:left-auto rtl:right-4 text-slate-400 pointer-events-none">
              <Search className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            </div>
            
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder={isAr ? 'ابحث عن أي دواء تجاري أو علمي (مثال: Augmentin, Concor, Cataflam)...' : 'Search any brand or generic drug (e.g. Augmentin, Concor, Panadol)...'}
              className="w-full py-3.5 pl-11 pr-28 rtl:pl-28 rtl:pr-11 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 transition-all font-medium"
            />

            <div className="absolute right-2 rtl:right-auto rtl:left-2 flex items-center gap-1.5">
              <button
                type="submit"
                className="px-4 sm:px-5 py-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
              >
                {isAr ? 'بحث سريري' : 'Search'}
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 text-left rtl:text-right max-h-64 overflow-y-auto">
              {suggestions.map((drug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(drug);
                    setShowSuggestions(false);
                    navigate(`/drug/${encodeURIComponent(drug)}`);
                  }}
                  className={`w-full px-4 py-3 text-xs sm:text-sm flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 last:border-none transition-colors ${
                    idx === selectedSuggestionIndex 
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-semibold' 
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Pill className="w-4 h-4 text-teal-600" />
                    {drug}
                  </span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    {isAr ? 'عرض الملف الدوائي ←' : 'View Monograph →'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Popular Medication Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'أدوية متكررة:' : 'Common Drugs:'}
          </span>
          {popularDrugs.map((d, i) => (
            <button
              key={i}
              onClick={() => navigate(`/drug/${encodeURIComponent(d.name)}`)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors font-medium"
            >
              {isAr ? d.label_ar : d.label_en}
            </button>
          ))}
        </div>

      </header>

      {/* 🧭 Quick Action Triage Bar */}
      <section className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isAr ? 'فحص الروشتة السريرية المجمعة' : 'Multi-Drug Prescription Triage'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'أدخل أدوية الروشتة معاً لفحص التداخلات، توقيت الجرعات، وموانع الاستعمال في شاشة واحدة.' : 'Evaluate multiple medications at once for drug-drug interactions and patient safety.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            to="/interaction"
            className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <span>{isAr ? 'بدء فحص الروشتة' : 'Launch Checker'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* 📚 6 Core Clinical Intelligence Modules */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isAr ? 'أدوات القرار الصيدلاني السريري' : 'Core Clinical Decision Modules'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? 'منظومة متكاملة مصممة لتلبية احتياجات التدريب والصيدلة اليومية:' : 'Integrated evidence-based tools for daily practice and clinical rotation:'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {clinicalModules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <Link
                key={idx}
                to={module.path}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/70 dark:hover:border-teal-500/70 rounded-2xl p-5 shadow-subtle hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {isAr ? module.badge_ar : module.badge_en}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {isAr ? module.title_ar : module.title_en}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {isAr ? module.desc_ar : module.desc_en}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 group-hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span>{isAr ? 'فتح الأداة السريرية' : 'Open Clinical Tool'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 📊 Clinical Architecture & Reliability Matrix */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-subtle">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-slate-100 dark:divide-slate-800">
          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">&lt; 1ms</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isAr ? 'استجابة الكاش السريعة' : 'RAM Sub-ms Cache'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-400 font-mono">22+</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isAr ? 'مقياس حيوي ومختبري' : 'Vital Signs Biomarkers'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">100%</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isAr ? 'تغطية السوق الدوائي المصري' : 'Egyptian Market Coverage'}
            </span>
          </div>

          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-400 font-mono">AR / EN</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isAr ? 'دعم لغوي سريري مزدوج' : 'Bilingual Clinical Data'}
            </span>
          </div>
        </div>
      </section>

      {/* 🎓 Academic Credential & ECU Faculty of Pharmacy Card */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-clinical flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left rtl:sm:text-right">
          <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
            <img 
              src="/ecu-logo.png" 
              alt="Egyptian Chinese University Logo" 
              className="h-14 w-auto object-contain"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-teal-900/60 border border-teal-700 text-teal-300 text-xs font-semibold mb-1">
              <Shield className="w-3 h-3" />
              <span>{isAr ? 'الجامعة المصرية الصينية (ECU)' : 'Egyptian Chinese University'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {isAr ? 'مشروع بحث وتطوير صيدلاني سريري' : 'Academic Clinical Pharmacy Initiative'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {isAr 
                ? 'تم تطوير هذه المنصة بواسطة يوسف محمد تحت مظلة كلية الصيدلة بالجامعة المصرية الصينية، بهدف تمكين الطلاب والممارسين بأدوات اتخاذ القرار السريري السريع والموثوق.'
                : 'Developed by Youssef Mohamed at ECU Faculty of Pharmacy to empower pharmacy learners with verified clinical tools.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Link 
            to="/about"
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            {isAr ? 'حول المنصة والمطور' : 'About Platform'}
          </Link>
        </div>
      </section>

      {/* 📄 Clean Human Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 pb-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            &copy; {new Date().getFullYear()} YoPharma Clinical Suite. {t('footer.rights')}
          </p>

          <div className="flex items-center gap-3">
            <span>{t('footer.designed_by')}</span>
            <a 
              href="https://wa.me/qr/2ZQYXCK7REOIC1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-xs font-bold shadow-sm"
            >
              WhatsApp Contact
            </a>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-2xl mx-auto">
          {t('footer.disclaimer')}
        </p>
      </footer>

    </div>
  );
}
