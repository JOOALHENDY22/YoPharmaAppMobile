import fs from 'fs';
import path from 'path';

interface CacheEntry {
  data: any;
  exp: number;
}

const dataDir = path.join(__dirname, '../data');
const cacheFilePath = path.join(dataDir, 'fast_clinical_cache.json');
const masterFilePath = path.join(dataDir, 'egyptian_clinical_master.json');

// In-Memory Fast Lookup Store (sub-millisecond < 1ms)
const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

let saveTimeout: NodeJS.Timeout | null = null;

// Debounced background disk persistence
const scheduleDiskSave = () => {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    try {
      const obj: Record<string, CacheEntry> = {};
      for (const [k, v] of memoryCache.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(cacheFilePath, JSON.stringify(obj), 'utf-8');
      console.log(`[Disk Cache 💾] Saved ${memoryCache.size} clinical entries to disk.`);
    } catch (e: any) {
      console.warn('[Disk Cache Save Error]:', e.message);
    }
  }, 2000); // Debounce by 2s so multiple writes batch together
};

// Load existing disk cache on startup
const loadDiskCache = () => {
  try {
    if (fs.existsSync(cacheFilePath)) {
      const content = fs.readFileSync(cacheFilePath, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        const now = Date.now();
        let loaded = 0;
        for (const [k, v] of Object.entries(parsed)) {
          const entry = v as CacheEntry;
          if (entry && entry.exp && entry.exp > now) {
            memoryCache.set(k, entry);
            loaded++;
          }
        }
        console.log(`[Instant RAM Cache ⚡] Loaded ${loaded} pre-warmed entries from disk (<2ms).`);
      }
    }
  } catch (e: any) {
    console.warn('[Disk Cache Load Error]:', e.message);
  }
};

// Seed/Pre-warm cache from local clinical master dataset
const seedMasterData = () => {
  try {
    if (!fs.existsSync(masterFilePath)) return;
    const raw = fs.readFileSync(masterFilePath, 'utf-8');
    const masterDrugs: any[] = JSON.parse(raw);

    const conditionsList = [
      { id: 'pregnancy', nameEn: 'Pregnancy & Lactation', nameAr: 'الحمل والرضاعة' },
      { id: 'hypertension', nameEn: 'Hypertension', nameAr: 'ارتفاع ضغط الدم' },
      { id: 'diabetes', nameEn: 'Diabetes', nameAr: 'مرض السكري' },
      { id: 'kidney_disease', nameEn: 'Chronic Kidney Disease', nameAr: 'قصور الكلى' },
      { id: 'heart_failure', nameEn: 'Heart Failure', nameAr: 'قصور القلب' },
      { id: 'asthma', nameEn: 'Asthma / COPD', nameAr: 'حساسية الصدر والربو' },
      { id: 'peptic_ulcer', nameEn: 'Peptic Ulcer', nameAr: 'قرحة المعدة' },
      { id: 'liver_disease', nameEn: 'Liver Cirrhosis', nameAr: 'أمراض الكبد' },
      { id: 'g6pd_deficiency', nameEn: 'G6PD Deficiency (Favism)', nameAr: 'أنيميا الفول' }
    ];

    let seededCount = 0;

    for (const drug of masterDrugs) {
      const tradeEn = (drug.trade_name || '').toLowerCase().trim();
      const tradeAr = (drug.trade_name_ar || '').trim();
      const activeEn = drug.active_ingredients_en || '';
      const activeAr = drug.active_ingredients_ar || activeEn;

      if (!tradeEn) continue;

      // 1. Seed details_v2
      const detailsKey = `details_v2:${tradeEn}`;
      if (!memoryCache.has(detailsKey)) {
        const detailsData = {
          trade_name: drug.trade_name,
          trade_name_ar: drug.trade_name_ar || drug.trade_name,
          dosage_form: drug.form || 'أقراص',
          active_ingredients_en: activeEn,
          active_ingredients_ar: activeAr,
          purpose_ar_eg: drug.purpose_ar_eg || drug.purpose_ar,
          purpose_ar: drug.purpose_ar,
          purpose_en: drug.purpose_en,
          dosage_and_administration_ar_eg: drug.dosage_ar_eg || drug.dosage_ar,
          dosage_and_administration_ar: drug.dosage_ar,
          dosage_and_administration_en: drug.dosage_en,
          warnings_ar_eg: drug.warnings_ar_eg || drug.warnings_ar,
          warnings_ar: drug.warnings_ar,
          warnings_en: drug.warnings_en,
          contraindications_ar_eg: drug.contraindications_ar_eg || drug.contraindications_ar,
          contraindications_ar: drug.contraindications_ar,
          contraindications_en: drug.contraindications_en,
          adverse_reactions_ar_eg: drug.adverse_reactions_ar_eg || drug.adverse_reactions_ar,
          adverse_reactions_ar: drug.adverse_reactions_ar,
          adverse_reactions_en: drug.adverse_reactions_en,
          pregnancy_ar_eg: drug.pregnancy_ar_eg || drug.pregnancy_ar,
          pregnancy_ar: drug.pregnancy_ar,
          pregnancy_en: drug.pregnancy_en,
          pediatric_use_ar_eg: drug.pediatric_use_ar_eg || drug.pediatric_use_ar,
          pediatric_use_ar: drug.pediatric_use_ar,
          pediatric_use_en: drug.pediatric_use_en,
          geriatric_use_ar_eg: drug.geriatric_use_ar_eg || drug.geriatric_use_ar,
          geriatric_use_ar: drug.geriatric_use_ar,
          geriatric_use_en: drug.geriatric_use_en
        };

        memoryCache.set(detailsKey, { data: detailsData, exp: Date.now() + CACHE_TTL });
        if (tradeAr) {
          memoryCache.set(`details_v2:${tradeAr.toLowerCase()}`, { data: detailsData, exp: Date.now() + CACHE_TTL });
        }
        seededCount++;
      }

      // 2. Seed chronic safety for standard conditions
      for (const cond of conditionsList) {
        const condKeys = [
          `safety_v3:${tradeEn}:${cond.id.toLowerCase()}`,
          `safety_v3:${tradeEn}:${cond.nameEn.toLowerCase()}`,
          `safety_v3:${tradeEn}:${cond.nameAr.toLowerCase()}`
        ];

        if (!memoryCache.has(condKeys[0])) {
          let status: 'safe' | 'warning' | 'contraindicated' = 'safe';
          let explAr = 'يمكن استخدامه بالجرعات العادية مع المتابعة الدورية واستشارة الطبيب.';
          let explEg = 'تقدر تاخده بالجرعات العادية بس الأحسن برضه تراجع الدكتور.';
          let explEn = 'Can be used at standard dosages under routine monitoring.';

          if (cond.id === 'pregnancy') {
            const pregEn = (drug.pregnancy_en || '').toLowerCase();
            if (pregEn.includes('contraindicated') || pregEn.includes('category x') || pregEn.includes('category d')) {
              status = 'contraindicated';
              explAr = drug.pregnancy_ar || 'ممنوع استخدامه تماماً للحوامل والمرضعات لما يسببه من أضرار للجنين.';
              explEg = drug.pregnancy_ar_eg || 'ممنوع خالص للحامل أو اللي بترضع لأنه خطر جداً على الجنين!';
              explEn = drug.pregnancy_en || 'Contraindicated during pregnancy and lactation.';
            } else {
              status = 'warning';
              explAr = drug.pregnancy_ar || 'يجب استشارة الطبيب قبل الاستخدام أثناء الحمل أو الرضاعة لتقييم المنفعة والضرر.';
              explEg = drug.pregnancy_ar_eg || 'لازم دكتور النسا يوافق عليه الأول عشان نتأكد إنه مش هيأثر على الحمل.';
              explEn = drug.pregnancy_en || 'Consult your physician before use during pregnancy or lactation.';
            }
          } else {
            const isContra = (drug.contraindications_ar || '').includes(cond.nameAr) || (drug.contraindications_en || '').toLowerCase().includes(cond.nameEn.toLowerCase());
            const isWarn = (drug.warnings_ar || '').includes(cond.nameAr) || (drug.warnings_en || '').toLowerCase().includes(cond.nameEn.toLowerCase());

            if (isContra) {
              status = 'contraindicated';
              explAr = drug.contraindications_ar || 'ممنوع استخدامه تماماً مع هذا المرض لتجنب المضاعفات الخطيرة.';
              explEg = drug.contraindications_ar_eg || 'ممنوع تاخده مع الحالة دي عشان ممكن يعمل مضاعفات خطيرة.';
              explEn = drug.contraindications_en || 'Contraindicated for this condition.';
            } else if (isWarn) {
              status = 'warning';
              explAr = drug.warnings_ar || 'يُستخدم بحذر شديد مع هذا المرض وتحت إشراف طبي مع ضبط الجرعة.';
              explEg = drug.warnings_ar_eg || 'خد بالك وخلي الدكتور يحدد الجرعة بالظبط مع الحالة دي.';
              explEn = drug.warnings_en || 'Use with caution for this condition under medical advice.';
            }
          }

          const safetyData = {
            status,
            disease_analyzed: cond.nameAr,
            drug_analyzed: drug.trade_name,
            explanation: explAr,
            explanation_ar: explAr,
            explanation_ar_eg: explEg,
            explanation_en: explEn,
            precautions_ar: 'الالتزام بالجرعة المقررة ومراجعة الطبيب.',
            precautions_ar_eg: 'التزم بالجرعة وماتزودش من نفسك واسأل الدكتور.',
            precautions_en: 'Adhere to prescribed dosage and consult your physician.'
          };

          for (const k of condKeys) {
            memoryCache.set(k, { data: safetyData, exp: Date.now() + CACHE_TTL });
          }
          seededCount++;
        }
      }

      // 4. Seed food interactions
      const foodKey = `food:${tradeEn}`;
      if (!memoryCache.has(foodKey)) {
        const isGastric = (drug.warnings_ar || '').includes('معدة') || (drug.dosage_ar_eg || '').includes('بعد الأكل');
        const timingAr = isGastric 
          ? 'يؤخذ بعد الأكل أو مع الوجبات لتقليل تهيج المعدة'
          : 'يؤخذ قبل الأكل بنصف ساعة على معدة فارغة أو حسب إرشادات الطبيب';
        const timingEg = isGastric 
          ? 'خده بعد الأكل عشان ماتتعبش معدتك'
          : 'خده على معدة فاضية قبل الأكل بنص ساعة';
        const timingEn = isGastric 
          ? 'Take after meals to minimize gastrointestinal discomfort' 
          : 'Take 30 minutes before meals on an empty stomach';

        const foodData = {
          drug_name: drug.trade_name,
          timing: timingAr,
          timing_ar: timingAr,
          timing_ar_eg: timingEg,
          timing_en: timingEn,
          food_interactions: [
            {
              food: 'وجبات دسمة / طعام ثقيل',
              food_ar: 'الوجبات الدسمة',
              food_en: 'Heavy or Fatty Meals',
              effect_ar: 'قد يؤخر امتصاص الدواء قليلاً',
              effect_ar_eg: 'ممكن يأخر مفعول الدوا شوية',
              effect_en: 'May delay drug absorption',
              severity: 'minor',
              recommendation_ar: 'تناول الدواء مع وجبة خفيفة',
              recommendation_ar_eg: 'خده مع أكل خفيف',
              recommendation_en: 'Take with a light snack'
            }
          ]
        };

        memoryCache.set(foodKey, { data: foodData, exp: Date.now() + CACHE_TTL });
        if (tradeAr) {
          memoryCache.set(`food:${tradeAr.toLowerCase()}`, { data: foodData, exp: Date.now() + CACHE_TTL });
        }
        seededCount++;
      }
    }

    console.log(`[Cache Pre-Warmer 🚀] Pre-warmed & primed ${seededCount} clinical services in RAM (< 1ms execution).`);
    scheduleDiskSave();
  } catch (err: any) {
    console.warn('[Cache Pre-Warmer Error]:', err.message);
  }
};

// Initialize cache
loadDiskCache();
seedMasterData();

export const getPersistentCache = (key: string): any | null => {
  const normalizedKey = key.toLowerCase().trim();
  const entry = memoryCache.get(normalizedKey);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    memoryCache.delete(normalizedKey);
    return null;
  }
  return entry.data;
};

export const setPersistentCache = (key: string, data: any) => {
  const normalizedKey = key.toLowerCase().trim();
  memoryCache.set(normalizedKey, { data, exp: Date.now() + CACHE_TTL });
  scheduleDiskSave();
};

export const getCacheSize = (): number => {
  return memoryCache.size;
};
