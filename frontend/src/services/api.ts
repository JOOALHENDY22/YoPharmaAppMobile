import axios from 'axios';

export const PUBLIC_CLOUD_API = 'https://yo-pharma-app-mobile.vercel.app';
export const LOCAL_LAN_API = 'http://192.168.1.39:5050';

let cachedActiveUrl: string | null = null;

// Auto-probe LAN vs Cloud for ultra-fast response
if (typeof window !== 'undefined') {
  axios.get(`${LOCAL_LAN_API}/api/health`, { timeout: 1200 })
    .then((res) => {
      if (res.data?.status === 'ok') cachedActiveUrl = LOCAL_LAN_API;
    })
    .catch(() => {
      cachedActiveUrl = PUBLIC_CLOUD_API;
    });
}

// Attach header for public tunnel compatibility
axios.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

export const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('yp_custom_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
    if (cachedActiveUrl) {
      return cachedActiveUrl;
    }
    // Auto-detect local LAN IP when accessing from Android phone over Wi-Fi
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:5050`;
    }
  }
  return (import.meta as any).env?.VITE_API_URL || PUBLIC_CLOUD_API;
};

export const setBackendUrl = (url: string) => {
  if (!url || !url.trim()) {
    localStorage.removeItem('yp_custom_api_url');
  } else {
    localStorage.setItem('yp_custom_api_url', url.trim().replace(/\/+$/, ''));
  }
};

export const testBackendConnection = async (targetUrl?: string): Promise<{ ok: boolean; statusText: string; latencyMs: number }> => {
  const base = (targetUrl && targetUrl.trim()) ? targetUrl.trim().replace(/\/+$/, '') : getBackendUrl();
  const startTime = performance.now();
  try {
    const res = await axios.get(`${base}/api/health`, { timeout: 3500 });
    const latencyMs = Math.round(performance.now() - startTime);
    if (res.status === 200 && res.data?.status === 'ok') {
      return { ok: true, statusText: 'متصل بنجاح بالسيرفر', latencyMs };
    }
    return { ok: false, statusText: `استجابة غير متوقعة: ${res.status}`, latencyMs };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return { ok: false, statusText: err.message || 'تعذر الاتصال بالسيرفر', latencyMs };
  }
};

// Instant 2-Tier Client Cache (In-Memory Map + Persistent LocalStorage for < 1ms Sub-Second Load)
const memCache = new Map<string, any>();
const STORAGE_PREFIX = 'yp_fast_v4_';
const CLIENT_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

const getFastCache = (key: string): any | null => {
  if (memCache.has(key)) {
    return memCache.get(key);
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.exp) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
    memCache.set(key, parsed.data);
    return parsed.data;
  } catch {
    return null;
  }
};

const setFastCache = (key: string, data: any) => {
  memCache.set(key, data);
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({
      data,
      exp: Date.now() + CLIENT_TTL
    }));
  } catch {
    // Graceful fallback if localStorage quota is exceeded
  }
};

const fetchAIDrugDetails = async (drugName: string) => {
  const cacheKey = `details:${drugName.toLowerCase().trim()}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.post(`${getBackendUrl()}/api/drug-details`, { drugName });
    if (res.data) {
      setFastCache(cacheKey, res.data);
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("AI Drug Details Fetch Error:", error);
    return null;
  }
};

export const searchDrugFDA = async (query: string) => {
  // Always resolve through YoPharma's clinical backend engine (0ms local master + fuzzy guard + Gemini bilingual synthesis)
  return await fetchAIDrugDetails(query);
};

const commonEgyptianDrugs = [
  // Pain, Cold & Fever
  "Congestal", "Panadol", "Panadol Extra", "Panadol Advance", "Panadol Cold & Flu", "Panadol Joint", "Panadol Sinus", "Panadol Night", 
  "Cetafen", "Cetal", "Paramol", "Abimol", "Novaldol", "Doliprane", "Adol", "Brufen", "Megafen", "Cataflam", "Voltaren", "Ketofan", 
  "Ketolac", "Ketorolac", "Mobitil", "Mobic", "Feldene", "Celebrex", "Arcoxia", "Comtrex", "1,2,3", "Flurest", "Rhinopro", "C-Retard",
  // Antibiotics & Anti-infectives
  "Augmentin", "Hibiotic", "Megamox", "Amoclan", "Curam", "E-Mox", "Amoxicillin", "Flumox", "Keflex", "Zithromax", "Zisrocin", "Azrolid", 
  "Tavanic", "Ciprofar", "Ciprofloxacin", "Tarivid", "Flagyl", "Amrizole", "Flasyl", "Suprax", "Cefotax", "Ceftriaxone", "Rocephin",
  // Gastrointestinal
  "Nexium", "Controloc", "Pantoloc", "Omeprazole", "Downoprazol", "Gastrazole", "Antinal", "Diax", "Motilium", "Motinorm", "Mosapride", 
  "Gas-Reg", "Spasmocanulase", "Spasmo-Digestin", "Digestin", "Colona", "Coloverin", "Librax", "Gaviscon", "Epicogel", "Maalox",
  // Cardiovascular & Hypertension
  "Concor", "Concor Plus", "Bisoprolol", "Capozide", "Capoten", "Lisinopril", "Zestril", "Amlodipine", "Alkapress", "Exforge", 
  "Tareg", "Diovan", "Ator", "Atorvastatin", "Lipitor", "Crestor", "Rosuvastatin", "Cordarone", "Plavix", "Clopidogrel", 
  "Aspirin Protect", "Jusprin", "Lasix", "Aldactone", "Spiromide",
  // Diabetes
  "Glucophage", "Cidophage", "Metformin", "Amaryl", "Glimepiride", "Diamicron", "Gliclazide", "Galvus", "Galvus Met", "Januvia", 
  "Janumet", "Trajenta", "Forxiga", "Jardiance", "Novomix", "Lantus", "Mixtard",
  // Respiratory, Asthma & Allergy
  "Albuterol", "Ventolin", "Farcolin", "Symbicort", "Seretide", "Claritine", "Zyrtec", "Histazine", "Mosadin", "Telfast", 
  "Aerius", "Levohistamine", "Erius", "Otrin", "Otrivin", "Bisolvon", "Mucosolvan", "Bronchicum", "Prospan", "Pentamix",
  // Supplements & Vitamins
  "Neuroton", "Neurovit", "Milga", "Milga Advance", "Centrum", "Vitayami", "Feroglobine", "Osteocare", "Cal-Mag", "Maddovit", 
  "Limitless", "C-Retard", "Sanso", "VitaZinc", "Zinco", "Omega 3 Plus",
  // Hormones & Thyroid
  "Eltroxin", "Euthyrox", "Thyrox", "Levothyroxine", "Gynera", "Yasmin", "Yaz", "Diane 35", "Microcept", "Cidolut Nor",
  // Neuro/Psychiatric
  "Cipralex", "Estikan", "Lustral", "Prozac", "Tegretol", "Depakine", "Keppra", "Lyrica", "Gaba", "Neurontin",
  // Topical & Others
  "Fucidin", "Fucicort", "Garamycin", "Kenacomb", "Betaderm", "Dermovate", "Elidel", "Bepanthen", "Panthenol", "Sudocrem",
  "Betadine", "Refresh", "Systane", "Hyfresh"
];

export const fetchDrugSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 2) return [];
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Try smart backend suggestions (includes typo-tolerant fuzzy matching)
  try {
    const res = await axios.get(`${getBackendUrl()}/api/suggestions?q=${encodeURIComponent(query.trim())}`, { timeout: 1200 });
    if (res.data && Array.isArray(res.data.suggestions) && res.data.suggestions.length > 0) {
      return res.data.suggestions;
    }
  } catch (e) {
    // Fall back to client-side list
  }

  // 2. Client-side fallback with substring and prefix matching
  const direct = commonEgyptianDrugs.filter(d => d.toLowerCase().includes(normalizedQuery));
  if (direct.length > 0) return direct.slice(0, 5);

  return commonEgyptianDrugs.filter(d => {
    const target = d.toLowerCase();
    return target.startsWith(normalizedQuery.slice(0, 3));
  }).slice(0, 5);
};

export const fetchDrugComparison = async (drugA: string, drugB: string) => {
  const sorted = [drugA.toLowerCase().trim(), drugB.toLowerCase().trim()].sort();
  const cacheKey = `compare:${sorted[0]}:${sorted[1]}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.post(`${getBackendUrl()}/api/compare`, { drugA, drugB });
    if (res.data && res.data.comparison) {
      setFastCache(cacheKey, res.data.comparison);
      return res.data.comparison;
    }
    return null;
  } catch (error) {
    console.error("AI Compare API Error:", error);
    throw error;
  }
};

// --- NIH RxNav API for Drug Interactions ---
const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export const getRxCUI = async (drugName: string): Promise<string | null> => {
  try {
    const res = await axios.get(`${RXNAV_BASE_URL}/rxcui.json?name=${encodeURIComponent(drugName)}`);
    if (res.data.idGroup && res.data.idGroup.rxnormId) {
      return res.data.idGroup.rxnormId[0];
    }
    return null;
  } catch (error) {
    console.error("RxNav API Error fetching CUI:", error);
    return null;
  }
};

export const checkInteractions = async (drugs: string[]) => {
  const sortedHash = drugs.map(d => d.toLowerCase().trim()).sort().join(',');
  const cacheKey = `interactions:${sortedHash}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.post(`${getBackendUrl()}/api/interactions`, { drugs });
    if (res.data && res.data.interactions) {
      setFastCache(cacheKey, res.data.interactions);
      return res.data.interactions;
    }
    return [];
  } catch (error) {
    console.error("AI API Error checking interactions:", error);
    throw error;
  }
};

export const fetchDrugAlternatives = async (drugName: string) => {
  const cacheKey = `alternatives:${drugName.toLowerCase().trim()}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.post(`${getBackendUrl()}/api/alternatives`, { drugName });
    if (res.data) {
      setFastCache(cacheKey, res.data);
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("AI Alternatives API Error:", error);
    throw error;
  }
};

export const fetchChronicSafety = async (drugName: string, diseaseName: string) => {
  const cacheKey = `safety:${drugName.toLowerCase().trim()}:${diseaseName.toLowerCase().trim()}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.post(`${getBackendUrl()}/api/chronic-safety`, { drugName, diseaseName });
    if (res.data) {
      setFastCache(cacheKey, res.data);
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("AI Chronic Safety API Error:", error);
    throw error;
  }
};

export const fetchFoodInteractions = async (drugName: string) => {
  const cacheKey = `food:${drugName.toLowerCase().trim()}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.post(`${getBackendUrl()}/api/food-interactions`, { drugName });
    if (res.data) {
      setFastCache(cacheKey, res.data);
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("Food Interactions API Error:", error);
    throw error;
  }
};
