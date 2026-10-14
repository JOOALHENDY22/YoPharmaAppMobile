import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Search, Activity, Scale, Heart, History, Info, Moon, Sun, 
  Menu, X, Globe, RefreshCw, ShieldAlert, HeartPulse, Utensils, 
  Download, Copy, Check, Home, Layers, Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getBackendUrl } from '../services/api';
import SplashScreen from '../components/SplashScreen';

export default function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  
  // Luxury Splash Screen on initial app launch
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('yp_splash_seen');
    }
    return true;
  });

  const location = useLocation();
  const { t, i18n } = useTranslation();
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowGreeting(true), 2500);
    const timer2 = setTimeout(() => setShowGreeting(false), 8000);
    return () => { 
      clearTimeout(timer1); 
      clearTimeout(timer2); 
    };
  }, []);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close more sheet on route change
  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [location.pathname]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setIsApkModalOpen(true);
    }
  };

  const copyAppShareUrl = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSplashDone = () => {
    sessionStorage.setItem('yp_splash_seen', 'true');
    setShowSplash(false);
  };

  // Primary navigation items
  const primaryNavItems = [
    { name: t('nav.search'), path: '/search', icon: Search },
    { name: t('nav.alternatives'), path: '/alternatives', icon: RefreshCw },
    { name: t('nav.chronic_safety'), path: '/chronic-safety', icon: ShieldAlert },
    { name: t('nav.interactions'), path: '/interaction', icon: Activity },
    { name: t('nav.compare'), path: '/compare', icon: Scale },
  ];

  // Secondary clinical services
  const secondaryServices = [
    { 
      name: t('nav.vitals'), 
      path: '/vitals', 
      icon: HeartPulse, 
      desc: 'فحص تأثير الأدوية على الضغط والسكري والكلى والنبض',
      badge: 'سريري'
    },
    { 
      name: t('nav.food_interactions'), 
      path: '/food-interactions', 
      icon: Utensils, 
      desc: 'تداخلات الأدوية مع الأطعمة والعصائر والشاي والقهوة',
      badge: 'تغذية'
    },
    { 
      name: t('nav.favorites'), 
      path: '/favorites', 
      icon: Heart, 
      desc: 'قائمة الأدوية والمراجع المحفوظة للرجوع السريع',
      badge: 'شخصي'
    },
    { 
      name: t('nav.history'), 
      path: '/history', 
      icon: History, 
      desc: 'سجل عمليات البحث والفحوصات الأخيرة',
      badge: 'سجل'
    },
    { 
      name: t('nav.about'), 
      path: '/about', 
      icon: Info, 
      desc: 'دليل المنظومة والمصادر السريرية والاعتمادات',
      badge: 'معلومات'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
      
      {/* Animated Luxury Splash Screen on First Launch */}
      {showSplash && <SplashScreen onComplete={handleSplashDone} />}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* New Stylized Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-200 border border-white/20 overflow-hidden p-1">
                <img src="/icon.svg" alt="YoPharma Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
                    Yo<span className="text-emerald-600 dark:text-emerald-400">Pharma</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                    Clinical AI
                  </span>
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  نيو فارما | الدليل الدوائي
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Desktop More Menu trigger */}
              <button
                onClick={() => setIsMoreSheetOpen(true)}
                className="flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <Layers className="h-4 w-4" />
                <span>المزيد</span>
              </button>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">

              {/* Language Switcher */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="تغيير اللغة"
                >
                  <Globe className="h-5 w-5" />
                </button>
                
                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-2xl shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden z-50 p-1.5"
                    >
                      <button 
                        onClick={() => changeLanguage('ar')} 
                        className={`w-full text-right px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                          i18n.language === 'ar' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        🇪🇬 عربي فصحى
                      </button>
                      <button 
                        onClick={() => changeLanguage('ar-EG')} 
                        className={`w-full text-right px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                          i18n.language === 'ar-EG' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        🗣️ عامية مصرية
                      </button>
                      <button 
                        onClick={() => changeLanguage('en')} 
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                          i18n.language === 'en' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="الوضع الليلي"
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
              </button>
              
              {/* Mobile Quick Drawer Toggle */}
              <button
                onClick={() => setIsMoreSheetOpen(!isMoreSheetOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="القائمة"
              >
                {isMoreSheetOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Generous bottom padding pb-28 on mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-28 md:pb-8">
        <Outlet />
      </main>

      {/* Android Mobile Native Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] py-1.5 px-2">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          
          {/* Tab 1: Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              location.pathname === '/' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Home className="h-5 w-5 mb-0.5" />
            <span className="text-[11px] leading-tight">الرئيسية</span>
          </Link>

          {/* Tab 2: Search */}
          <Link
            to="/search"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              location.pathname === '/search' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Search className="h-5 w-5 mb-0.5" />
            <span className="text-[11px] leading-tight">البحث</span>
          </Link>

          {/* Tab 3: Alternatives (Primary Hero Action) */}
          <Link
            to="/alternatives"
            className="flex flex-col items-center justify-center -mt-4 group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              location.pathname === '/alternatives'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}>
              <RefreshCw className="h-6 w-6 transform group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <span className={`text-[11px] mt-1 font-bold ${
              location.pathname === '/alternatives' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              البدائل
            </span>
          </Link>

          {/* Tab 4: Chronic Safety */}
          <Link
            to="/chronic-safety"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              location.pathname === '/chronic-safety' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-5 w-5 mb-0.5" />
            <span className="text-[11px] leading-tight">الأمان</span>
          </Link>

          {/* Tab 5: More / Services Drawer */}
          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              isMoreSheetOpen 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="h-5 w-5 mb-0.5" />
            <span className="text-[11px] leading-tight">المزيد</span>
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Up Bottom Sheet Drawer */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Sheet Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Top Drag Indicator */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Sheet Header */}
              <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    خدمات YoPharma المتطورة
                  </h3>
                </div>
                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Sheet Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-12">

                {/* Additional Clinical Services List */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                    الأدوات السريرية والتحليلية
                  </div>

                  {secondaryServices.map((service) => {
                    const Icon = service.icon;
                    const isActive = location.pathname === service.path;
                    return (
                      <Link
                        key={service.name}
                        to={service.path}
                        onClick={() => setIsMoreSheetOpen(false)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            isActive 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 dark:bg-slate-700/60 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold">{service.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                              {service.desc}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {service.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Android APK & PWA Download Modal */}
      <AnimatePresence>
        {isApkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApkModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center p-1 border border-white/20">
                    <img src="/icon.svg" alt="YoPharma" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">تطبيق YoPharma للأندرويد</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">تثبيت فوري كتطبيق ويب أو تحميل ملف الـ APK</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApkModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-4 my-5">
                
                {/* Method 1: Instant PWA Install */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">تثبيت فوري على الشاشة الرئيسية (PWA)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">موصى به</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    يعمل كتطبيق كامل بشاشة كاملة وبأيقونة YoPharma الجديدة، مع تحديثات فورية وخفة فائقة.
                  </p>
                  <button
                    onClick={handleTriggerInstall}
                    disabled={isPwaInstalled}
                    className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-75"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isPwaInstalled ? 'التطبيق مثبت بالفعل على جهازك ✓' : 'تثبيت التطبيق على الشاشة الرئيسية الآن'}</span>
                  </button>
                </div>

                {/* Method 2: Native APK Download */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">تحميل ملف الـ APK المباشر</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">Android APK</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    ملف الحزمة الكاملة <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">YoPharma.apk</code> مُوقّع وجاهز للتثبيت المباشر على جميع هواتف Android.
                  </p>
                  <a
                    href={`${getBackendUrl()}/yopharma.apk`}
                    download="YoPharma.apk"
                    className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                  >
                    <Download className="h-4 w-4" />
                    <span>تحميل وتثبيت ملف YoPharma.apk</span>
                  </a>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 mt-2">
                    💡 <strong>للتثبيت السريع:</strong> بعد اكتمال التحميل اضغط على إشعار التنزيل، وسيتعرف عليه هاتفك تلقائياً كبرنامج ويظهر زر <strong>"تثبيت / Install"</strong>.
                  </div>
                </div>

                {/* Local Wi-Fi Quick Access */}
                <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">رابط الفتح من أي جهاز على نفس الشبكة:</div>
                    <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-0.5" dir="ltr">
                      http://192.168.1.39:5173
                    </div>
                  </div>
                  <button
                    onClick={copyAppShareUrl}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center gap-1.5"
                  >
                    {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>

              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsApkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Greeting Toast */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-6 right-6 rtl:left-6 rtl:right-auto z-[100] bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-900/50 flex items-center space-x-3 rtl:space-x-reverse"
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <p className="font-bold text-base tracking-wide text-emerald-700 dark:text-emerald-400">
              صَلِّ عَلَى النَّبِيِّ مُحَمَّد ﷺ
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
