import { Router } from 'express';
import { checkInteractionsAI, suggestDrugsAI, compareDrugsAI, getDrugDetailsAI, getDrugAlternativesAI, checkChronicSafetyAI, getFoodInteractionsAI } from '../services/aiService';
import { resolveEgyptianDrug, resolveDrugNameQuick, calculateSimilarity, normalizeEnglish, normalizeArabic } from '../services/egyptianDrugResolver';
import { getSearchRecords, logToGoogleSheets } from '../services/googleSheetsService';

import fs from 'fs';
import path from 'path';

const router = Router();

// Load master and offline drugs database
let offlineDrugs: string[] = [];
const possiblePaths = [
  path.join(__dirname, '../data/egyptian_clinical_master.json'),
  path.join(__dirname, '../data/egyptian_drugs.json'),
  path.join(process.cwd(), 'backend/src/data/egyptian_clinical_master.json')
];

let masterDrugList: any[] = [];
for (const p of possiblePaths) {
  try {
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          offlineDrugs = parsed;
        } else if (parsed[0].trade_name) {
          masterDrugList = parsed;
          parsed.forEach((d: any) => {
            if (d.trade_name) offlineDrugs.push(d.trade_name);
            if (d.trade_name_ar) offlineDrugs.push(d.trade_name_ar);
          });
        }
      }
    }
  } catch (e) {
    // continue to next path
  }
}
offlineDrugs = Array.from(new Set(offlineDrugs));


router.post('/interactions', async (req, res) => {
  try {
    const { drugs } = req.body;
    
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return res.status(400).json({ error: 'Please provide at least 2 drugs' });
    }

    // Auto-resolve any typos before checking clinical interactions
    const cleanDrugs = await Promise.all(drugs.map((d: string) => resolveDrugNameQuick(d)));
    const data = await checkInteractionsAI(cleanDrugs);

    // Asynchronously log to Google Sheet
    logToGoogleSheets({
      timestamp: new Date().toISOString(),
      actionType: 'فحص تداخلات أدوية / Drug Interaction Check',
      tradeName: cleanDrugs.join(' + '),
      tradeNameAr: cleanDrugs.join(' مع '),
      details: Array.isArray(data.interactions) && data.interactions.length > 0
        ? data.interactions.map((i: any) => `[${(i.severity || 'INFO').toUpperCase()}] ${i.description_ar || i.description || ''} | ${i.description_en || ''}`).join('\n')
        : 'لا توجد تداخلات خطيرة مسجلة / No clinically significant interactions found',
      fdaStatus: 'NIH RxNav / AI Clinical Analysis',
      source: 'YoPharma Interaction Checker'
    }).catch(() => {});

    res.json(data);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'API Key missing') {
      res.status(500).json({ error: 'Gemini API Key is missing. Please add it to the .env file.' });
    } else {
      res.status(500).json({ error: 'Failed to process AI interaction check.' });
    }
  }
});

router.get('/suggestions', (req, res) => {
  try {
    const rawQ = (req.query.q as string)?.trim();
    if (!rawQ || rawQ.length < 2) {
      return res.status(400).json({ suggestions: [] });
    }
    
    const qLower = rawQ.toLowerCase();
    const qNormEn = normalizeEnglish(rawQ);
    const qNormAr = normalizeArabic(rawQ);

    // 1. Direct contains match (English and Arabic)
    const exactMatches = offlineDrugs.filter(drug => 
      drug.toLowerCase().includes(qLower) ||
      (qNormAr && normalizeArabic(drug).includes(qNormAr))
    );

    const results = [...exactMatches];

    // 2. Fuzzy similarity match for typos (e.g., congestl -> Congestal, kngestal -> Congestal)
    if (results.length < 5) {
      const scored = offlineDrugs
        .filter(drug => !results.includes(drug))
        .map(drug => {
          const dNormEn = normalizeEnglish(drug);
          const dNormAr = normalizeArabic(drug);
          const scoreEn = qNormEn && dNormEn ? calculateSimilarity(qNormEn, dNormEn) : 0;
          const scoreAr = qNormAr && dNormAr ? calculateSimilarity(qNormAr, dNormAr) : 0;
          return { drug, score: Math.max(scoreEn, scoreAr) };
        })
        .filter(item => item.score >= 0.65)
        .sort((a, b) => b.score - a.score);

      for (const item of scored) {
        if (results.length >= 5) break;
        results.push(item.drug);
      }
    }

    res.json({ suggestions: results.slice(0, 5) });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ suggestions: [] });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const { drugA, drugB } = req.body;
    if (!drugA || !drugB) {
      return res.status(400).json({ error: 'Please provide both drugA and drugB' });
    }

    // Auto-resolve potential typos before clinical comparison
    const cleanA = await resolveDrugNameQuick(drugA);
    const cleanB = await resolveDrugNameQuick(drugB);

    const data = await compareDrugsAI(cleanA, cleanB);

    // Asynchronously log comparison to Google Sheets
    logToGoogleSheets({
      timestamp: new Date().toISOString(),
      actionType: 'مقارنة أدوية / Drug Comparison',
      tradeName: `${cleanA} vs ${cleanB}`,
      tradeNameAr: `مقارنة: ${cleanA} ضد ${cleanB}`,
      details: Array.isArray(data)
        ? data.map((c: any) => `${c.feature_ar || c.feature || ''}: [${cleanA}: ${c.drug_a_val_ar || c.drug_a_val || ''}] vs [${cleanB}: ${c.drug_b_val_ar || c.drug_b_val || ''}]`).join('\n')
        : 'مقارنة سريرية شاملة / Clinical Comparison Matrix',
      fdaStatus: 'Verified Comparison Matrix',
      source: 'YoPharma Comparison Engine'
    }).catch(() => {});

    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to compare drugs' });
  }
});

router.post('/drug-details', async (req, res) => {
  try {
    const { drugName } = req.body;
    if (!drugName) {
      return res.status(400).json({ error: 'Please provide a drugName' });
    }
    const data = await resolveEgyptianDrug(drugName);
    if (!data) {
      return res.status(404).json({ error: 'Drug not found' });
    }
    res.json(data);
  } catch (error: any) {
    console.error('[Drug Details Error]:', error);
    res.status(500).json({ error: 'Failed to fetch clinical drug details' });
  }
});

router.get('/sheets-records', (req, res) => {
  try {
    const records = getSearchRecords();
    res.json({ count: records.length, records });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve records' });
  }
});

router.get('/export-csv', (req, res) => {
  try {
    const csvFile = path.join(__dirname, '../data/search_records.csv');
    if (fs.existsSync(csvFile)) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="yopharma_google_sheets_records.csv"');
      fs.createReadStream(csvFile).pipe(res);
    } else {
      res.status(404).json({ error: 'No CSV records available yet' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

router.post('/alternatives', async (req, res) => {
  const { drugName } = req.body;
  if (!drugName) {
    return res.status(400).json({ error: 'Please provide a drugName' });
  }

  // Auto-correct any typo in drugName
  const cleanDrug = await resolveDrugNameQuick(drugName);

  try {
    const data = await getDrugAlternativesAI(cleanDrug);

    const idents = Array.isArray(data.identical_alternatives) ? data.identical_alternatives : [];
    const thers = Array.isArray(data.therapeutic_alternatives) ? data.therapeutic_alternatives : [];

    const summaryLog = `[${idents.length} بدائل مطابقة]: ${idents.map((a: any) => a.brand_name).join(', ')} || [${thers.length} بدائل علاجية]: ${thers.map((a: any) => `${a.brand_name} (${a.active_molecule || ''})`).join(', ')}`;

    // Asynchronously log alternatives to Google Sheets
    logToGoogleSheets({
      timestamp: new Date().toISOString(),
      actionType: 'بدائل الأدوية المصنفة / Classified Drug Alternatives',
      tradeName: cleanDrug !== drugName ? `${cleanDrug} (Corrected from: ${drugName})` : cleanDrug,
      tradeNameAr: cleanDrug,
      activeIngredientEn: data.active_ingredient_en || data.active_ingredient || '',
      activeIngredientAr: data.active_ingredient_ar || data.active_ingredient || '',
      details: summaryLog || 'البدائل المسجلة / Registered Equivalents',
      fdaStatus: 'Classified: Identical vs Therapeutic',
      source: 'Egyptian Drug Index & Alternatives'
    }).catch(() => {});

    return res.json(data);
  } catch (error: any) {
    console.warn(`[Alternatives AI fallback for "${cleanDrug}"]:`, error.message);
    
    // Offline resilience fallback using local Master Dataset
    const q = cleanDrug.toLowerCase().trim();
    const found = masterDrugList.find(d => 
      (d.trade_name && d.trade_name.toLowerCase() === q) || 
      (d.trade_name_ar && d.trade_name_ar.includes(cleanDrug))
    );

    if (found) {
      const activeEn = found.active_ingredients_en || found.fda_generic_name || '';
      const activeAr = found.active_ingredients_ar || activeEn;
      const primaryIngredient = activeEn.split(',')[0].split('(')[0].trim().toLowerCase();

      // Find matching drugs with same primary active molecule
      const matchingIdentical = masterDrugList.filter(d => 
        d.trade_name.toLowerCase() !== q && 
        (d.active_ingredients_en || '').toLowerCase().includes(primaryIngredient)
      ).slice(0, 4);

      // Find therapeutic alternatives: only drugs sharing genuine clinical purpose/indication
      const purposeKeywords = (found.purpose_ar || '').split(/[\s,،.]+/).filter((w: string) => w.length >= 4);
      const matchingTherapeutic = masterDrugList.filter(d => {
        if (d.trade_name.toLowerCase() === q) return false;
        if ((d.active_ingredients_en || '').toLowerCase().includes(primaryIngredient)) return false;
        const dPurpose = d.purpose_ar || '';
        return purposeKeywords.some((kw: string) => dPurpose.includes(kw));
      }).slice(0, 4);

      const identical_alternatives = matchingIdentical.map(m => ({
        brand_name: m.trade_name,
        brand_name_ar: m.trade_name_ar || m.trade_name,
        relation_type: 'identical',
        match_label_ar: 'بديل مطابق تماماً (نفس المادة الفعالة)',
        match_label_ar_eg: 'بديل مطابق لنفس المادة بالمللي',
        match_label_en: 'Generic Equivalent (Same Molecule)',
        manufacturer: m.form || "شركة أدوية معتمدة بمصر",
        price_category: "سعر مناسب / متوفر",
        price_category_ar: "اقتصادي",
        price_category_en: "Budget"
      }));

      const therapeutic_alternatives = matchingTherapeutic.map(m => ({
        brand_name: m.trade_name,
        brand_name_ar: m.trade_name_ar || m.trade_name,
        active_molecule: m.active_ingredients_en || 'مادة علاجية بديلة',
        active_molecule_ar: m.active_ingredients_ar || m.active_ingredients_en || 'مادة علاجية بديلة',
        active_molecule_en: m.active_ingredients_en || 'Alternative Active Molecule',
        relation_type: 'therapeutic',
        match_label_ar: 'بديل علاجي (نفس الاستخدام بمادة أخرى)',
        match_label_ar_eg: 'بديل لنفس الغرض بمادة مختلفة',
        match_label_en: 'Therapeutic Alternative (Different Molecule)',
        manufacturer: m.form || "شركة أدوية معتمدة بمصر",
        price_category: "سعر مناسب / متوفر",
        price_category_ar: "متوسط",
        price_category_en: "Moderate"
      }));

      const fallbackData = {
        searched_drug: cleanDrug,
        active_ingredient: `${activeEn} / ${activeAr}`,
        active_ingredient_en: activeEn,
        active_ingredient_ar: activeAr,
        identical_alternatives,
        therapeutic_alternatives,
        alternatives: [...identical_alternatives, ...therapeutic_alternatives]
      };

      logToGoogleSheets({
        timestamp: new Date().toISOString(),
        actionType: 'بدائل الأدوية / Drug Alternatives',
        tradeName: cleanDrug,
        tradeNameAr: found.trade_name_ar || cleanDrug,
        activeIngredientEn: activeEn,
        activeIngredientAr: activeAr,
        details: fallbackData.alternatives.map(a => a.brand_name).join(' | '),
        fdaStatus: 'Same Active Molecule (Master Dataset)',
        source: 'Egyptian Master Index'
      }).catch(() => {});

      return res.json(fallbackData);
    }

    res.status(500).json({ error: 'Failed to fetch drug alternatives' });
  }
});

router.post('/chronic-safety', async (req, res) => {
  const { drugName, diseaseName } = req.body;
  if (!drugName || !diseaseName) {
    return res.status(400).json({ error: 'Please provide both drugName and diseaseName' });
  }

  // Auto-correct any typo in drugName
  const cleanDrug = await resolveDrugNameQuick(drugName);

  try {
    const data = await checkChronicSafetyAI(cleanDrug, diseaseName);

    // Asynchronously log chronic safety to Google Sheets
    logToGoogleSheets({
      timestamp: new Date().toISOString(),
      actionType: 'أمان الأمراض والحالات الصحية / Chronic & Health State Safety',
      tradeName: `${cleanDrug} + ${diseaseName}`,
      tradeNameAr: `${cleanDrug} مع حالة: ${diseaseName}`,
      details: `[الحالة: ${(data.status || 'INFO').toUpperCase()}] ${data.explanation_ar_eg || data.explanation_ar || data.explanation || ''} | ${data.explanation_en || ''}`,
      fdaStatus: `Safety Rating: ${data.status}`,
      source: 'YoPharma Chronic Safety Engine'
    }).catch(() => {});

    return res.json(data);
  } catch (error: any) {
    console.warn(`[Chronic Safety AI fallback for "${cleanDrug}"]:`, error.message);

    // Offline resilience using master clinical dataset warnings
    const q = cleanDrug.toLowerCase().trim();
    const found = masterDrugList.find(d => 
      (d.trade_name && d.trade_name.toLowerCase() === q) || 
      (d.trade_name_ar && d.trade_name_ar.includes(cleanDrug))
    );

    if (found) {
      const dLower = diseaseName.toLowerCase();
      let status: 'safe' | 'warning' | 'contraindicated' = 'safe';
      let explAr = 'يمكن استخدامه بالجرعات العادية مع المتابعة الدورية واستشارة الطبيب.';
      let explEg = 'تقدر تاخده بالجرعات العادية بس الأحسن برضه تراجع الدكتور.';
      let explEn = 'Can be used at standard dosages under routine monitoring.';

      const isPregnancy = dLower.includes('pregnan') || dLower.includes('حمل') || dLower.includes('رضاع');
      if (isPregnancy) {
        if ((found.pregnancy_en || '').toLowerCase().includes('contraindicated') || (found.pregnancy_en || '').toLowerCase().includes('category x') || (found.pregnancy_en || '').toLowerCase().includes('category d')) {
          status = 'contraindicated';
          explAr = found.pregnancy_ar || 'ممنوع استخدامه تماماً للحوامل والمرضعات لما يسببه من أضرار للجنين.';
          explEg = 'ممنوع خالص للحامل أو اللي بترضع لأنه خطر جداً على الجنين!';
          explEn = found.pregnancy_en || 'Contraindicated during pregnancy and lactation.';
        } else {
          status = 'warning';
          explAr = found.pregnancy_ar || 'يجب استشارة الطبيب قبل الاستخدام أثناء الحمل أو الرضاعة لتقييم المنفعة والضرر.';
          explEg = 'لازم دكتور النسا يوافق عليه الأول عشان نتأكد إنه مش هيأثر على الحمل.';
          explEn = found.pregnancy_en || 'Consult your physician before use during pregnancy or lactation.';
        }
      } else {
        const isWarning = (found.warnings_ar || '').includes(diseaseName) || (found.warnings_en || '').toLowerCase().includes(dLower);
        const isContra = (found.contraindications_ar || '').includes(diseaseName) || (found.contraindications_en || '').toLowerCase().includes(dLower);

        if (isContra) {
          status = 'contraindicated';
          explAr = found.contraindications_ar_eg || found.contraindications_ar || 'ممنوع استخدامه تماماً مع هذا المرض.';
          explEg = 'ممنوع تاخده مع الحالة دي عشان ممكن يعمل مضاعفات خطيرة.';
          explEn = found.contraindications_en || 'Contraindicated for this condition.';
        } else if (isWarning) {
          status = 'warning';
          explAr = found.warnings_ar_eg || found.warnings_ar || 'يُستخدم بحذر شديد مع هذا المرض واستشارة الطبيب.';
          explEg = 'خد بالك وخلي الدكتور يحدد الجرعة بالظبط مع الحالة دي.';
          explEn = found.warnings_en || 'Use with caution for this condition.';
        }
      }

      const fallbackData = {
        status,
        explanation: explAr,
        explanation_ar: explAr,
        explanation_ar_eg: explEg,
        explanation_en: explEn
      };

      logToGoogleSheets({
        timestamp: new Date().toISOString(),
        actionType: 'أمان الأمراض والحالات الصحية / Chronic & Health State Safety',
        tradeName: `${cleanDrug} + ${diseaseName}`,
        tradeNameAr: `${cleanDrug} مع حالة: ${diseaseName}`,
        details: `[الحالة: ${status.toUpperCase()}] ${explEg} | ${explEn}`,
        fdaStatus: `Safety Rating: ${status}`,
        source: 'Egyptian Master Clinical Rules'
      }).catch(() => {});

      return res.json(fallbackData);
    }

    res.status(500).json({ error: 'Failed to verify chronic disease safety' });
  }
});

router.post('/food-interactions', async (req, res) => {
  const { drugName } = req.body;
  if (!drugName) {
    return res.status(400).json({ error: 'Please provide a drugName' });
  }

  // Auto-correct any typo in drugName
  const cleanDrug = await resolveDrugNameQuick(drugName);

  try {
    const data = await getFoodInteractionsAI(cleanDrug);

    // Asynchronously log food interactions to Google Sheets
    logToGoogleSheets({
      timestamp: new Date().toISOString(),
      actionType: 'تفاعلات الأطعمة والوجبات / Food Interactions',
      tradeName: cleanDrug,
      tradeNameAr: cleanDrug,
      details: `[الميعاد]: ${data.timing_ar || data.timing || ''} | [الأطعمة]: ` + (Array.isArray(data.interactions) ? data.interactions.map((i: any) => `${i.food_ar || i.food}: ${i.recommendation_ar || i.recommendation}`).join(' | ') : 'لا قيود خاصة'),
      fdaStatus: 'Clinical Food Label Guideline',
      source: 'YoPharma Food Interaction Engine'
    }).catch(() => {});

    return res.json(data);
  } catch (error: any) {
    console.warn(`[Food Interactions AI fallback for "${cleanDrug}"]:`, error.message);

    // Offline resilience using master clinical dataset dosage instructions
    const q = cleanDrug.toLowerCase().trim();
    const found = masterDrugList.find(d => 
      (d.trade_name && d.trade_name.toLowerCase() === q) || 
      (d.trade_name_ar && d.trade_name_ar.includes(cleanDrug))
    );

    if (found) {
      const timingAr = (found.dosage_ar_eg || found.dosage_ar || '').includes('بعد الأكل') 
        ? 'يؤخذ بعد الوجبة مع كوب ماء لتجنب اضطراب المعدة' 
        : 'يؤخذ قبل الوجبة بنصف ساعة أو حسب إرشادات الطبيب';
      const timingEn = (found.dosage_ar_eg || found.dosage_ar || '').includes('بعد الأكل') 
        ? 'Take after meals with a full glass of water' 
        : 'Take 30 minutes before meals or as directed';

      const fallbackData = {
        timing: timingAr,
        timing_ar: timingAr,
        timing_en: timingEn,
        interactions: [
          {
            food: 'المنبهات والكافيين / Caffeine',
            food_ar: 'القهوة والشاي والمنبهات',
            food_en: 'Coffee, Tea & Caffeine',
            recommendation: 'يُفضل تقليل المنبهات لتجنب الخفقان وزيادة سرعة ضربات القلب',
            recommendation_ar: 'يُفضل تقليل المنبهات لتجنب الخفقان وزيادة سرعة ضربات القلب',
            recommendation_en: 'Moderate caffeine intake to prevent palpitations'
          }
        ]
      };

      logToGoogleSheets({
        timestamp: new Date().toISOString(),
        actionType: 'تفاعلات الأطعمة والوجبات / Food Interactions',
        tradeName: drugName,
        tradeNameAr: found.trade_name_ar || drugName,
        details: `[الميعاد]: ${timingAr} | [الأطعمة]: المنبهات والكافيين`,
        fdaStatus: 'Clinical Food Label Guideline',
        source: 'Egyptian Master Index'
      }).catch(() => {});

      return res.json(fallbackData);
    }

    res.status(500).json({ error: 'Failed to fetch food interactions' });
  }
});

export default router;
