import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 1800 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timerProgress1 = setTimeout(() => setProgress(65), 500);
    const timerProgress2 = setTimeout(() => setProgress(100), 1200);

    const timerComplete = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(timerProgress1);
      clearTimeout(timerProgress2);
      clearTimeout(timerComplete);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between py-12 px-6 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white select-none overflow-hidden"
        >
          {/* Ambient Background Glow Circles */}
          <div className="absolute top-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 w-64 h-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

          {/* Top Spacer */}
          <div className="w-full flex justify-center pt-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
              YoPharma Clinical AI
            </span>
          </div>

          {/* Center Brand Identity */}
          <div className="flex flex-col items-center text-center">
            {/* Animated Logo Emblem */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: 'spring', damping: 14 }}
              className="relative mb-6"
            >
              {/* Outer Pulsing Glow */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-30 blur-lg animate-pulse" />
              
              {/* Logo Box */}
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-0.5 shadow-2xl shadow-emerald-950 flex items-center justify-center border border-white/20">
                <img 
                  src="/icon.svg" 
                  alt="YoPharma Logo" 
                  className="w-20 h-20 drop-shadow-md"
                />
              </div>
            </motion.div>

            {/* App Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-1"
            >
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
                Yo<span className="text-emerald-400">Pharma</span>
              </h1>
              <p className="text-xs font-semibold text-emerald-200/80 tracking-wide">
                المنظومة السريرية الذكية للأدوية وبدائل الصيدليات
              </p>
            </motion.div>
          </div>

          {/* Bottom Progress & Clinical Loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-xs flex flex-col items-center space-y-3"
          >
            {/* Sleek Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-white/5">
              <motion.div
                initial={{ width: '10%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              />
            </div>

            <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">بدء المحرك السريري...</span>
              <span>{progress}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
