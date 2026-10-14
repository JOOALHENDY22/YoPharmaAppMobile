import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getPersistentCache, setPersistentCache } from './persistentCache';

dotenv.config();

// Helper to get active API keys from environment variables
const getApiKeys = (): string[] => {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr.split(',').map(k => k.trim()).filter(Boolean);
};

// Safe JSON parser for LLM responses with or without markdown code fences
const cleanJson = (text: string): any => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
};

// Infinite Round-Robin & Auto-Failover Key Manager
let currentKeyIndex = 0;

const executeWithRotation = async <T>(fn: (genAI: GoogleGenerativeAI, modelName: string) => Promise<T>): Promise<T> => {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error('API Key missing');
  }

  // Prioritize ultra-fast flash-lite models for sub-second execution
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];
  let lastError: any = null;

  const startIndex = currentKeyIndex;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIdx = (startIndex + attempt) % keys.length;
    const key = keys[keyIdx];

    for (const modelName of models) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const result = await fn(genAI, modelName);
        
        // Advance round-robin pointer for the next request so keys share traffic infinitely
        currentKeyIndex = (keyIdx + 1) % keys.length;
        console.log(`[Gemini Engine ⚡] Successfully processed using Key #${keyIdx + 1}/${keys.length} (${modelName})`);
        return result;
      } catch (error: any) {
        lastError = error;
        const msg = error.message || String(error);
        console.warn(`[Gemini Key Failover 🔄] Key #${keyIdx + 1}/${keys.length} with ${modelName} encountered an issue: ${msg.slice(0, 100)}...`);
        // If auth error or quota error, skip remaining models on this key immediately
        if (msg.includes('401') || msg.includes('403') || msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
          break;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini API keys and fallback models failed');
};

// High-speed In-Memory & Persistent Disk Cache (< 1ms instant responses)
const getRam = (key: string): any | null => {
  return getPersistentCache(key);
};

const setRam = (key: string, data: any) => {
  setPersistentCache(key, data);
};

export const checkInteractionsAI = async (drugs: string[]): Promise<any> => {
  // Sort and hash drug list for consistent caching index
  const sortedDrugs = drugs.map(d => d.toLowerCase().trim()).sort();
  const drugsHash = sortedDrugs.join(',');

  const memKey = `interactions:${drugsHash}`;
  const memHit = getRam(memKey);
  if (memHit) {
    console.log(`[RAM Hit ⚡] Instant interactions for [${drugs.join(', ')}] (<1ms)`);
    return memHit;
  }

  // 1. Try Supabase Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_interactions')
        .select('interactions_json')
        .eq('drugs_hash', drugsHash)
        .single();
      
      if (data && !error) {
        const json = data.interactions_json;
        const isBilingual = !Array.isArray(json) || json.length === 0 || json.some((item: any) => item.description_ar || item.description_en);
        if (isBilingual) {
          console.log(`[Cache Hit] Serving bilingual interactions for [${drugs.join(', ')}] from Supabase.`);
          setRam(memKey, json);
          return json;
        }
        console.log(`[Cache Outdated] Legacy single-language interactions cache found for [${drugs.join(', ')}]. Upgrading to bilingual...`);
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Interactions:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const prompt = `
    You are an expert clinical pharmacist in Egypt. 
    The user is asking about the drug interactions between the following medications: ${drugs.join(', ')}.
    Some of these might be Egyptian brand names or generic names.

    Please provide a summary of their interactions in BOTH Arabic and English.
    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "interactions": [
        {
          "severity": "high" or "moderate" or "minor",
          "description": "Clear explanation of the interaction and clinical management in Arabic.",
          "description_ar": "Clear explanation of the interaction and clinical management in Arabic.",
          "description_en": "Clear explanation of the interaction and clinical management in English.",
          "drugs": ["Drug 1", "Drug 2"]
        }
      ]
    }
    If there are absolutely no known interactions, return:
    {
      "interactions": []
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Raw AI Response (Interactions):", text);
    
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_interactions')
        .upsert({ drugs_hash: drugsHash, interactions_json: resultData }, { onConflict: 'drugs_hash' });
      console.log(`[Cache Write] Saved interactions for [${drugs.join(', ')}] to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Interactions:", e.message || e);
    }
  }

  setRam(memKey, resultData);
  return resultData;
};

export const suggestDrugsAI = async (query: string): Promise<any> => {
  return await executeWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert pharmacist.
    The user typed "${query}". 
    Provide a list of 5 real drug names. Include both Egyptian brand names and international/generic names that start with or match this query.

    Format EXACTLY as:
    {
      "suggestions": ["Drug 1", "Drug 2", "Drug 3", "Drug 4", "Drug 5"]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });
};

export const compareDrugsAI = async (drugA: string, drugB: string): Promise<any> => {
  // Sort keys for consistent caching index
  const sortedPair = [drugA.toLowerCase().trim(), drugB.toLowerCase().trim()].sort();
  const dA = sortedPair[0];
  const dB = sortedPair[1];
  const memKey = `compare:${dA}:${dB}`;

  const memHit = getRam(memKey);
  if (memHit) {
    console.log(`[RAM Hit ⚡] Instant comparison for "${drugA}" vs "${drugB}" (<1ms)`);
    return memHit;
  }

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_comparisons')
        .select('comparison_json')
        .eq('drug_a', dA)
        .eq('drug_b', dB)
        .single();
      
      if (data && !error) {
        const json = data.comparison_json;
        const isBilingual = !Array.isArray(json) || json.length === 0 || json.some((item: any) => item.feature_ar || item.feature_en);
        if (isBilingual) {
          console.log(`[Cache Hit] Serving bilingual comparison for "${drugA}" vs "${drugB}" from Supabase.`);
          setRam(memKey, json);
          return json;
        }
        console.log(`[Cache Outdated] Legacy single-language comparison cache found for "${drugA}" vs "${drugB}". Upgrading to bilingual...`);
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Comparison:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert Egyptian pharmacist.
    Compare these two drugs available in Egypt: "${drugA}" and "${drugB}".

    Provide a detailed clinical comparison in BOTH Arabic and English.
    Format EXACTLY as:
    {
      "comparison": [
        {
          "feature": "المادة الفعالة / Active Ingredient",
          "feature_ar": "المادة الفعالة",
          "feature_en": "Active Ingredient",
          "drugA": "Active ingredient in Arabic and English",
          "drugA_ar": "المادة الفعالة بالعربية",
          "drugA_en": "Active ingredient in English",
          "drugB": "Active ingredient in Arabic and English",
          "drugB_ar": "المادة الفعالة بالعربية",
          "drugB_en": "Active ingredient in English"
        },
        {
          "feature": "دواعي الاستعمال / Indications",
          "feature_ar": "دواعي الاستعمال",
          "feature_en": "Therapeutic Indications",
          "drugA": "Indications summary",
          "drugA_ar": "دواعي الاستعمال بالعربية",
          "drugA_en": "Therapeutic indications in English",
          "drugB": "Indications summary",
          "drugB_ar": "دواعي الاستعمال بالعربية",
          "drugB_en": "Therapeutic indications in English"
        },
        {
          "feature": "الآثار الجانبية الشائعة / Common Side Effects",
          "feature_ar": "الآثار الجانبية الشائعة",
          "feature_en": "Common Side Effects",
          "drugA": "Side effects summary",
          "drugA_ar": "الآثار الجانبية بالعربية",
          "drugA_en": "Common side effects in English",
          "drugB": "Side effects summary",
          "drugB_ar": "الآثار الجانبية بالعربية",
          "drugB_en": "Common side effects in English"
        },
        {
          "feature": "الفئة الدوائية للحمل / Pregnancy Category",
          "feature_ar": "الفئة الدوائية للحمل",
          "feature_en": "Pregnancy Category & Safety",
          "drugA": "Pregnancy category",
          "drugA_ar": "أمان الحمل بالعربية",
          "drugA_en": "Pregnancy safety in English",
          "drugB": "Pregnancy category",
          "drugB_ar": "أمان الحمل بالعربية",
          "drugB_en": "Pregnancy safety in English"
        },
        {
          "feature": "الجرعة المعتادة / Typical Dosage",
          "feature_ar": "الجرعة المعتادة",
          "feature_en": "Typical Dosage",
          "drugA": "Dosage summary",
          "drugA_ar": "الجرعة المعتادة بالعربية",
          "drugA_en": "Typical dosage in English",
          "drugB": "Dosage summary",
          "drugB_ar": "الجرعة المعتادة بالعربية",
          "drugB_en": "Typical dosage in English"
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_comparisons')
        .upsert({ drug_a: dA, drug_b: dB, comparison_json: resultData }, { onConflict: 'drug_a,drug_b' });
      console.log(`[Cache Write] Saved comparison for "${drugA}" vs "${drugB}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Comparison:", e.message || e);
    }
  }

  setRam(memKey, resultData);
  return resultData;
};

export interface DrugCorrectionResult {
  is_corrected: boolean;
  original_query: string;
  corrected_name: string;
  trade_name_ar?: string;
  generic_name?: string;
  generic_name_ar?: string;
  rationale?: string;
}

export const correctDrugNameAI = async (query: string): Promise<DrugCorrectionResult> => {
  if (!query || !query.trim()) {
    return { is_corrected: false, original_query: query, corrected_name: query };
  }

  const normalized = query.toLowerCase().trim();
  const memKey = `typo:${normalized}`;
  const memHit = getRam(memKey);
  if (memHit) return memHit;

  try {
    const resultData = await executeWithRotation(async (genAI, modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
      You are an expert clinical pharmacist and pharmaceutical search engine specialist for Egyptian and international drugs.
      Analyze the user query: "${query}".
      The user might have made spelling errors, typos (such as missing/extra letters, phonetic typos like 'k' instead of 'c', 'ph' instead of 'f', 'g' instead of 'j'), spacing errors (e.g. 'panadolextra' instead of 'Panadol Extra'), or informal Arabic transliterations (e.g. 'كنجستل' or 'اوترفين').

      Determine the exact intended trade/brand or generic drug name.

      Format your response EXACTLY as a valid JSON object matching this structure:
      {
        "is_corrected": true or false,
        "original_query": "${query}",
        "corrected_name": "Standard Trade or Generic Name in English (e.g., Congestal, Panadol Extra, Augmentin, Otrivin)",
        "trade_name_ar": "اسم الدواء باللغة العربية (مثال: كنجستال, بنادول إكسترا, أوجمنتين, أوترفين)",
        "generic_name": "Active scientific ingredient in English (e.g., Paracetamol, Amoxicillin / Clavulanic Acid)",
        "generic_name_ar": "المادة الفعالة بالعربية",
        "rationale": "Brief 1-sentence explanation in Arabic of what was corrected"
      }
      `;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      return cleanJson(text);
    });

    if (resultData && resultData.corrected_name) {
      setRam(memKey, resultData);
      return resultData;
    }
  } catch (err: any) {
    console.warn(`[AI Typo Resolver Error for "${query}"]:`, err.message || err);
  }

  return {
    is_corrected: false,
    original_query: query,
    corrected_name: query
  };
};

export const getDrugDetailsAI = async (drugName: string): Promise<any> => {
  const normalizedName = drugName.toLowerCase().trim();
  const memKey = `details_v2:${normalizedName}`;

  const memHit = getRam(memKey);
  if (memHit) {
    console.log(`[RAM Hit ⚡] Instant drug details for "${drugName}" (<1ms)`);
    return memHit;
  }

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_details')
        .select('details_json')
        .eq('drug_name', normalizedName)
        .single();
      
      if (data && !error) {
        const json = data.details_json;
        const isBilingual = json && json.trade_name_ar && (json.purpose_ar_eg || json.purpose_ar);
        if (isBilingual) {
          console.log(`[Cache Hit] Serving bilingual details for "${drugName}" from Supabase.`);
          setRam(memKey, json);
          return json;
        }
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Details:", e.message || e);
    }
  }

  // 2. Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacist and pharmaceutical nomenclature specialist.
    Analyze the drug query: "${drugName}".
    Identify whether it is an Egyptian trade brand (e.g. Antinal, Congestal, Cetafen, Novaldol, Hibiotic, Brufen, etc.) or an international medication (e.g. Bengay, Differin, Concor, Panadol, Tylenol, Advil, etc.).
    
    CRITICAL FORMAT & LOCALIZATION RULES:
    1. KEEP ALL ANSWERS CONCISE, CLINICAL, AND HIGH-YIELD (1 to 2 sentences per field). NO long essays, NO regulatory legal disclaimers, NO dense text walls.
    2. "trade_name": Standard Trade / Generic name in English (e.g. "Bengay", "Differin", "Panadol Extra").
    3. "trade_name_ar": Accurate Arabic phonetic/trade name (e.g. "بينجاي", "ديفرين", "بنادول إكسترا"). MUST be in Arabic script. NEVER leave in English!
    4. "dosage_form": Short dosage form in Arabic (e.g. "كريم موضعي مسكن للآلام" / "جل موضعي للبشرة" / "أقراص مغلفة").
    5. "active_ingredients_en": Clean active molecules in English (e.g. "Camphor 4%, Menthol 10%, Methyl Salicylate 30%" or "Adapalene 0.1%").
    6. "active_ingredients_ar": Active molecules in Arabic (e.g. "كافور 4%، منثول 10%، ميثيل ساليسيلات 30%" or "أدابالين 0.1%"). MUST be in Arabic script!
    7. FOR ALL "_ar_eg" FIELDS: Write in natural, warm, clear EGYPTIAN COLLOQUIAL ARABIC (اللهجة العامية المصرية السريرية).
    8. FOR ALL "_ar" FIELDS: Write in Modern Standard Arabic (العربية الفصحى).
    9. FOR ALL "_en" FIELDS: Write in concise, professional medical English.
    10. ZERO English words allowed in ANY "_ar" or "_ar_eg" field.

    Format your response EXACTLY as a valid JSON object matching this schema:
    {
      "trade_name": "Standard Brand Name in English",
      "trade_name_ar": "اسم الدواء باللغة العربية",
      "dosage_form": "الشكل الصيدلي بالعربية",
      "active_ingredients_en": "Active scientific molecules in English",
      "active_ingredients_ar": "المادة الفعالة بالعربية",
      "openfda": {
        "brand_name": ["Brand Name in English"],
        "generic_name": ["Generic active molecules in English"],
        "generic_name_ar": ["المادة الفعالة بالعربية"],
        "generic_name_en": ["Generic active molecules in English"],
        "dosage_form": ["Dosage Form"],
        "manufacturer_name": ["Manufacturer Name"],
        "product_type": ["Prescription / OTC"]
      },
      "purpose": ["ملخص دواعي الاستعمال بالعربية."],
      "purpose_ar": ["ملخص دواعي الاستعمال بالعربية الفصحى في جملة أو جملتين."],
      "purpose_en": ["Concise clinical indication summary in English."],
      "purpose_ar_eg": ["علاج دوائي سريع ومختصر بالعامية المصرية في جملة أو جملتين."],
      "indications_and_usage": ["دواعي الاستعمال المعتمدة بالعربية."],
      "indications_and_usage_ar": ["أهم الحالات التي يعالجها الدواء بالعربية الفصحى."],
      "indications_and_usage_en": ["Concise therapeutic indications in English."],
      "indications_and_usage_ar_eg": ["بيستخدم لأيه بالضبط بالعامية المصرية."],
      "dosage_and_administration": ["الجرعة وطريقة الاستخدام بالعربية."],
      "dosage_and_administration_ar": ["الجرعة المعتادة وطريقة الاستخدام الصحيحة بالعربية الفصحى."],
      "dosage_and_administration_en": ["Concise dosage and administration instructions in English."],
      "dosage_and_administration_ar_eg": ["يتاخد أو يندهن إزاي وبالتحديد كام مرة في اليوم بالعامية المصرية."],
      "warnings": ["التحذيرات والاحتياطات الهامة بالعربية."],
      "warnings_ar": ["أهم الاحتياطات والتحذيرات السريرية بالعربية الفصحى."],
      "warnings_en": ["Important precautions and safety advice in English."],
      "warnings_ar_eg": ["أهم التحذيرات اللي لازم تخلي بالك منها بالعامية المصرية."],
      "contraindications": ["موانع الاستعمال بالعربية."],
      "contraindications_ar": ["الحالات التي يُمنع فيها استخدام الدواء بالعربية الفصحى."],
      "contraindications_en": ["Key contraindications in English."],
      "contraindications_ar_eg": ["مين اللي ممنوع ياخده أو يستخدمه تماماً بالعامية المصرية."],
      "adverse_reactions": ["الآثار الجانبية المحتملة بالعربية."],
      "adverse_reactions_ar": ["أبرز الأعراض الجانبية الشائعة بالعربية الفصحى."],
      "adverse_reactions_en": ["Common possible adverse effects in English."],
      "adverse_reactions_ar_eg": ["الأعراض الجانبية المتوقعة والخفيفة بالعامية المصرية."],
      "pregnancy": ["إرشادات الحمل والرضاعة بالعربية."],
      "pregnancy_ar": ["مدى أمان الاستخدام للحامل والمرضع بالعربية الفصحى."],
      "pregnancy_en": ["Concise pregnancy and lactation guidelines in English."],
      "pregnancy_ar_eg": ["ينفع للحامل والمرضع ولا لأ وموقف استشارة الطبيب بالعامية المصرية."],
      "pediatric_use": ["إرشادات استخدام الأطفال بالعربية."],
      "pediatric_use_ar": ["إرشادات الأمان للأطفال وتحديد السن المسموح بالعربية الفصحى."],
      "pediatric_use_en": ["Concise pediatric safety guideline and age limits in English."],
      "pediatric_use_ar_eg": ["ينفع للأطفال ولا لأ ومن سن كام بالعامية المصرية."],
      "geriatric_use": ["إرشادات كبار السن بالعربية."],
      "geriatric_use_ar": ["مدى أمان الاستخدام للمسنين والاحتياطات بالعربية الفصحى."],
      "geriatric_use_en": ["Concise geriatric safety guideline in English."],
      "geriatric_use_ar_eg": ["أمانه لكبار السن والنصايح الخاصة بيهم بالعامية المصرية."]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_details')
        .upsert({ drug_name: normalizedName, details_json: resultData }, { onConflict: 'drug_name' });
      console.log(`[Cache Write] Saved details for "${drugName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Details:", e.message || e);
    }
  }

  setRam(memKey, resultData);
  return resultData;
};

export const getDrugAlternativesAI = async (drugName: string): Promise<any> => {
  const normalizedName = drugName.toLowerCase().trim();
  const memKey = `alternatives_v3:${normalizedName}`;

  const memHit = getRam(memKey);
  if (memHit) {
    console.log(`[RAM Hit ⚡] Instant classified alternatives for "${drugName}" (<1ms)`);
    return memHit;
  }

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_alternatives')
        .select('alternatives_json')
        .eq('drug_name', normalizedName)
        .single();
      
      if (data && !error) {
        const json = data.alternatives_json;
        const isClassified = json && (Array.isArray(json.identical_alternatives) || Array.isArray(json.therapeutic_alternatives));
        if (isClassified) {
          console.log(`[Cache Hit] Serving classified alternatives for "${drugName}" from Supabase.`);
          setRam(memKey, json);
          return json;
        }
        console.log(`[Cache Outdated] Legacy unclassified alternatives cache found for "${drugName}". Upgrading to classified...`);
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Alternatives:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert Egyptian clinical pharmacist and pharmaceutical consultant.
    The user is asking about alternative medications available in Egypt for the drug: "${drugName}".
    
    You MUST classify the alternatives into TWO EXPLICIT CLINICAL CATEGORIES:

    Category 1: "identical_alternatives" (بدائل مطابقة تماماً / Generic Equivalents)
    - Medications available in Egypt that contain the EXACT SAME active chemical molecule / scientific ingredient (and salt) as "${drugName}".
    - Examples: For "Voltaren" (Diclofenac) -> Cataflam, Clofen, Rheumafen, Olfen, Dolphin, Voltaren.
    - Examples: For "Augmentin" (Amoxicillin/Clavulanate) -> Hibiotic, Curam, Megamox, Klavox.
    - Examples: For "Congestal" (Paracetamol, Pseudoephedrine, Chlorpheniramine) -> 1,2,3, Cold-Free, Day & Night.

    Category 2: "therapeutic_alternatives" (بدائل علاجية لنفس الاستخدام / Therapeutic Alternatives)
    - Medications available in Egypt with a DIFFERENT active chemical ingredient or class, but prescribed for the EXACT SAME therapeutic clinical indication.
    - Examples: For "Voltaren" (Analgesic & NSAID) -> Ketofan (Ketoprofen), Brufen (Ibuprofen), Feldene (Piroxicam), Celebrex (Celecoxib), Cetafen.
    - Examples: For "Augmentin" (Antibiotic for resp/ENT infections) -> Zithromax (Azithromycin), Klacid (Clarithromycin), Cefzil (Cefprozil).

    Provide at least 3-6 items for each category whenever available in Egypt.
    
    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "searched_drug": "${drugName}",
      "active_ingredient": "Scientific Name in English & Arabic (e.g. Diclofenac Sodium / ديكلوفيناك صوديوم)",
      "active_ingredient_ar": "المادة الفعالة بالعربية (مثال: ديكلوفيناك صوديوم)",
      "active_ingredient_en": "Scientific Name in English (e.g. Diclofenac Sodium)",
      "indication_summary_ar": "الاستخدام العلاجي بالعربية الفصحى (مثال: مسكن للآلام ومضاد للالتهابات وخافض للحرارة)",
      "indication_summary_ar_eg": "بيستخدم في إيه بالعامية المصرية (مثال: مسكن قوي لوجع المفاصل والعظام والصداع)",
      "indication_summary_en": "Primary therapeutic indication in English (e.g. Pain relief and anti-inflammatory)",
      "identical_alternatives": [
        {
          "brand_name": "Brand Name (e.g. Cataflam)",
          "brand_name_ar": "اسم الدواء بالعربية (مثال: كتافلام)",
          "relation_type": "identical",
          "match_label_ar": "بديل مطابق تماماً (نفس المادة الفعالة)",
          "match_label_ar_eg": "بديل مطابق لنفس المادة بالمللي",
          "match_label_en": "Generic Equivalent (Same Molecule)",
          "manufacturer": "Manufacturer Name (e.g. Novartis)",
          "price_category": "رخيص / متوسط / مرتفع",
          "price_category_ar": "اقتصادي / متوسط / مرتفع",
          "price_category_en": "Budget / Moderate / Premium"
        }
      ],
      "therapeutic_alternatives": [
        {
          "brand_name": "Brand Name (e.g. Ketofan)",
          "brand_name_ar": "اسم الدواء بالعربية (مثال: كيتوفان)",
          "active_molecule": "Active ingredient (e.g. Ketoprofen / كيتوبروفين)",
          "active_molecule_ar": "المادة الفعالة بالعربية (مثال: كيتوبروفين)",
          "active_molecule_en": "Active ingredient in English (e.g. Ketoprofen)",
          "relation_type": "therapeutic",
          "match_label_ar": "بديل علاجي (نفس الاستخدام بمادة أخرى)",
          "match_label_ar_eg": "بديل لنفس الغرض بمادة مختلفة",
          "match_label_en": "Therapeutic Alternative (Different Molecule, Same Indication)",
          "manufacturer": "Manufacturer Name (e.g. Amoun)",
          "price_category": "رخيص / متوسط / مرتفع",
          "price_category_ar": "اقتصادي / متوسط / مرتفع",
          "price_category_en": "Budget / Moderate / Premium"
        }
      ],
      "alternatives": []
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const parsed = cleanJson(text);

    // Merge identical and therapeutic into flat alternatives array for backward compatibility
    if (parsed && typeof parsed === 'object') {
      const idents = Array.isArray(parsed.identical_alternatives) ? parsed.identical_alternatives : [];
      const thers = Array.isArray(parsed.therapeutic_alternatives) ? parsed.therapeutic_alternatives : [];
      if (!parsed.alternatives || parsed.alternatives.length === 0) {
        parsed.alternatives = [...idents, ...thers];
      }
    }

    return parsed;
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_alternatives')
        .upsert({ drug_name: normalizedName, alternatives_json: resultData }, { onConflict: 'drug_name' });
      console.log(`[Cache Write] Saved classified alternatives for "${drugName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Alternatives:", e.message || e);
    }
  }

  setRam(memKey, resultData);
  return resultData;
};

export const checkChronicSafetyAI = async (drugName: string, diseaseName: string): Promise<any> => {
  const normalizedDrug = drugName.toLowerCase().trim();
  const normalizedDisease = diseaseName.toLowerCase().trim();
  const memKey = `safety_v3:${normalizedDrug}:${normalizedDisease}`;

  const memHit = getRam(memKey);
  if (memHit) {
    console.log(`[RAM Hit ⚡] Instant safety for "${drugName}" + "${diseaseName}" (<1ms)`);
    return memHit;
  }

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_disease_safety')
        .select('safety_json')
        .eq('drug_name', normalizedDrug)
        .eq('disease_name', normalizedDisease)
        .single();
      
      if (data && !error) {
        const json = data.safety_json;
        const isLocalized = json && (json.explanation_ar_eg || json.explanation_ar);
        if (isLocalized) {
          console.log(`[Cache Hit] Serving localized disease safety for "${drugName}" + "${diseaseName}" from Supabase.`);
          setRam(memKey, json);
          return json;
        }
        console.log(`[Cache Outdated] Legacy single-language safety cache found for "${drugName}". Upgrading...`);
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Disease Safety:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacologist, obstetrician-pharmacist, and patient safety specialist.
    Analyze the safety and clinical compatibility of the drug: "${drugName}" 
    for a patient with the medical condition, disease, or physiological state: "${diseaseName}".
    
    SPECIAL CLINICAL CASES TO NOTE:
    - If "${diseaseName}" is "Pregnancy & Lactation", "pregnancy", or "الحمل والرضاعة", evaluate FDA/clinical pregnancy category, risk of teratogenicity, trimesters safety (1st, 2nd, 3rd), and excretion into breast milk.
    - If "${diseaseName}" is any custom chronic or acute disease (e.g. Hypertension, Peptic Ulcer, Favism/G6PD, Asthma, Renal Failure, Liver Cirrhosis, Glaucoma, Epilepsy, Hypothyroidism, Gout, Cardiac Arrhythmia, etc.), evaluate drug-disease interactions, risks of exacerbation, or contraindications.

    Determine whether it is:
    1. "safe": Safe to use under standard therapeutic instructions.
    2. "warning": Requires extreme caution, dose reduction, close monitoring, or strict medical supervision.
    3. "contraindicated": Strictly forbidden, dangerous, or causes severe complications / harm.

    FORMAT AND LOCALIZATION RULES:
    1. Keep all explanations CONCISE, DIRECT, AND HIGH-YIELD (2-3 sentences max). NO long essays.
    2. Provide an Egyptian Colloquial explanation ("explanation_ar_eg") that is friendly, practical, and in clear Egyptian dialect.
    3. Provide Standard Arabic ("explanation_ar") and English ("explanation_en").
    4. Provide actionable precautions ("precautions_ar", "precautions_ar_eg", "precautions_en").

    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "status": "safe" or "warning" or "contraindicated",
      "disease_analyzed": "${diseaseName}",
      "drug_analyzed": "${drugName}",
      "explanation": "Clear clinical guidelines and explanation in Arabic.",
      "explanation_ar": "إرشادات وتفسيرات سريرية واضحة للمريض بالعربية الفصحى (مختصرة ومفيدة).",
      "explanation_ar_eg": "توضيح مختصر ومباشر وسهل بالعامية المصرية عن سبب الأمان أو الخطورة والنصيحة العملية للمريض.",
      "explanation_en": "Clear, concise patient-friendly clinical explanation and precautions in English.",
      "precautions_ar": "نصائح وإرشادات وقائية سريعة بالعربية",
      "precautions_ar_eg": "نصائح سريعة ومهمة بالعامية المصرية",
      "precautions_en": "Quick actionable precautions in English"
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_disease_safety')
        .upsert({ drug_name: normalizedDrug, disease_name: normalizedDisease, safety_json: resultData }, { onConflict: 'drug_name,disease_name' });
      console.log(`[Cache Write] Saved disease safety for "${drugName}" + "${diseaseName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Disease Safety:", e.message || e);
    }
  }

  setRam(memKey, resultData);
  return resultData;
};

export const getFoodInteractionsAI = async (drugName: string): Promise<any> => {
  const normalizedName = drugName.toLowerCase().trim();
  const memKey = `food:${normalizedName}`;

  const memHit = getRam(memKey);
  if (memHit) {
    console.log(`[RAM Hit ⚡] Instant food interactions for "${drugName}" (<1ms)`);
    return memHit;
  }

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_food_interactions')
        .select('food_interactions_json')
        .eq('drug_name', normalizedName)
        .single();
      
      if (data && !error) {
        console.log(`[Cache Hit] Serving food interactions for "${drugName}" from Supabase.`);
        setRam(memKey, data.food_interactions_json);
        return data.food_interactions_json;
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Food Interactions:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacist in Egypt.
    Provide comprehensive food and beverage interaction guidelines for the drug: "${drugName}".
    Identify any Egyptian brand names or generic active ingredients.
    
    Provide all information in BOTH Arabic and English.
    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "drug_name": "${drugName}",
      "timing": "Clear meal timing instruction in Arabic (e.g. يؤخذ قبل الأكل بساعة أو بعد الأكل بساعتين على معدة فارغة)",
      "timing_ar": "تعليمات توقيت تناول الجرعة بالنسبة للوجبات بالعربية",
      "timing_en": "Meal timing instructions in English (e.g. Take 1 hour before or 2 hours after meals on an empty stomach)",
      "instructions_ar": "إرشادات عامة هامة للمريض حول الهضم والامتصاص بالعربية",
      "instructions_en": "Important general patient instructions regarding absorption and meals in English",
      "interactions": [
        {
          "food_ar": "اسم الطعام أو الشراب بالعربية (مثال: عصير الجريب فروت / منتجات الألبان والكالسيوم / الموز والأطعمة الغنية بالبوتاسيوم / الكافيين)",
          "food_en": "Food or beverage name in English (e.g. Grapefruit Juice / Dairy & Calcium Products / High Potassium Foods / Caffeine)",
          "severity": "high" or "moderate" or "minor",
          "effect_ar": "تأثير التفاعل السريري بالعربية",
          "effect_en": "Clinical effect and mechanism in English",
          "recommendation_ar": "التوصية الصيدلانية السريرية الدقيقة بالعربية",
          "recommendation_en": "Precise clinical pharmaceutical recommendation in English"
        }
      ],
      "dietary_tips_ar": [
        "نصيحة غذائية سريرية 1",
        "نصيحة غذائية سريرية 2"
      ],
      "dietary_tips_en": [
        "Clinical dietary tip 1 in English",
        "Clinical dietary tip 2 in English"
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_food_interactions')
        .upsert({ drug_name: normalizedName, food_interactions_json: resultData }, { onConflict: 'drug_name' });
      console.log(`[Cache Write] Saved food interactions for "${drugName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Food Interactions (may need table creation in Supabase):", e.message || e);
    }
  }

  setRam(memKey, resultData);
  return resultData;
};
