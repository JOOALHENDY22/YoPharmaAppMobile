import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HeartPulse, 
  Search, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  FileText,
  Calculator,
  ShieldCheck,
  Stethoscope,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricItem {
  id: string;
  name_ar: string;
  name_en: string;
  unit: string;
  category: string;
  description_ar: string;
  description_en: string;
  ranges: {
    label_ar: string;
    label_en: string;
    range: string;
    status: 'optimal' | 'normal' | 'warning' | 'high' | 'critical';
    note_ar?: string;
    note_en?: string;
  }[];
}

export default function VitalRef() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  const [activeTab, setActiveTab] = useState<'reference' | 'evaluator'>('reference');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Evaluator States
  const [evalMetric, setEvalMetric] = useState<string>('fasting_glucose');
  const [evalGender, setEvalGender] = useState<'male' | 'female'>('male');
  const [evalValue1, setEvalValue1] = useState<string>('');
  const [evalValue2, setEvalValue2] = useState<string>('');
  const evalResultRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', name_ar: 'الكل', name_en: 'All Categories' },
    { id: 'glucose', name_ar: 'السكر وضبط الجلوكوز', name_en: 'Blood Glucose & Diabetes' },
    { id: 'cardio', name_ar: 'القلب والعلامات الحيوية', name_en: 'Cardiovascular & Vitals' },
    { id: 'renal', name_ar: 'وظائف الكلى والأملاح', name_en: 'Renal & Electrolytes' },
    { id: 'lipids', name_ar: 'دهون الدم والكوليسترول', name_en: 'Lipid Profile' },
    { id: 'liver', name_ar: 'وظائف الكبد', name_en: 'Liver Enzymes' },
    { id: 'cbc', name_ar: 'صورة الدم الكاملة والحديد', name_en: 'CBC & Iron' }
  ];

  const metricsData: MetricItem[] = [
    // 1. Glucose
    {
      id: 'fasting_glucose',
      name_ar: 'سكر الدم الصائم (Fasting Glucose)',
      name_en: 'Fasting Blood Glucose (FBG)',
      unit: 'mg/dL',
      category: 'glucose',
      description_ar: 'يُقاس بعد صيام من 8 إلى 12 ساعة عن الطعام مع شرب الماء فقط.',
      description_en: 'Measured after an overnight fast of 8 to 12 hours (water permitted).',
      ranges: [
        { label_ar: 'طبيعي ومثالي', label_en: 'Normal & Optimal', range: '70 - 99 mg/dL', status: 'optimal', note_ar: 'حساسية إنسولين ممتازة', note_en: 'Excellent insulin sensitivity' },
        { label_ar: 'مرحلة ما قبل السكري (Impaired)', label_en: 'Pre-diabetes', range: '100 - 125 mg/dL', status: 'warning', note_ar: 'تتطلب تعديل النمط الغذائي والرياضة', note_en: 'Requires diet & lifestyle changes' },
        { label_ar: 'تشخيص السكري (مرتفع)', label_en: 'Diabetic Range', range: '≥ 126 mg/dL', status: 'critical', note_ar: 'يستوجب مراجعة الطبيب لتأكيد التشخيص', note_en: 'Requires clinical confirmation' },
        { label_ar: 'الهدف العلاجي لمريض السكر', label_en: 'Diabetic Target Goal', range: '80 - 130 mg/dL', status: 'normal', note_ar: 'حسب الجمعية الأمريكية للسكري (ADA)', note_en: 'Per American Diabetes Association (ADA)' }
      ]
    },
    {
      id: 'postprandial_glucose',
      name_ar: 'السكر الفاطر بعد الأكل بساعتين (2-Hour PPG)',
      name_en: 'Postprandial Blood Glucose (2-hr PPG)',
      unit: 'mg/dL',
      category: 'glucose',
      description_ar: 'يُحسب التوقيت بدءاً من أول لقمة في الوجبة.',
      description_en: 'Measured precisely 2 hours after the start of a meal.',
      ranges: [
        { label_ar: 'طبيعي لغير المصابين', label_en: 'Normal Non-diabetic', range: '< 140 mg/dL', status: 'optimal', note_ar: 'كفاءة البنكرياس في التعامل مع الوجبة', note_en: 'Normal pancreatic response' },
        { label_ar: 'مرحلة ما قبل السكري', label_en: 'Pre-diabetes', range: '140 - 199 mg/dL', status: 'warning', note_ar: 'اضطراب تحمل الجلوكوز', note_en: 'Impaired glucose tolerance' },
        { label_ar: 'تشخيص السكري', label_en: 'Diabetic Diagnosis', range: '≥ 200 mg/dL', status: 'critical', note_ar: 'ارتفاع صريح في سكر الدم', note_en: 'Clear hyper-glycemic elevation' },
        { label_ar: 'الهدف العلاجي لمريض السكر', label_en: 'Diabetic Target Goal', range: '< 180 mg/dL', status: 'normal', note_ar: 'الهدف الآمن لمنع مضاعفات الشرايين', note_en: 'Target to avoid microvascular complications' }
      ]
    },
    {
      id: 'hba1c',
      name_ar: 'السكر التراكمي (HbA1c)',
      name_en: 'Glycated Hemoglobin (HbA1c)',
      unit: '%',
      category: 'glucose',
      description_ar: 'يقيس متوسط نسبة الجلوكوز المرتبط بكريات الدم الحمراء خلال آخر 2 إلى 3 أشهر.',
      description_en: 'Measures average blood glucose over the past 2 to 3 months.',
      ranges: [
        { label_ar: 'طبيعي للشخص السليم', label_en: 'Normal Range', range: '< 5.7 %', status: 'optimal', note_ar: 'خطر منخفض لمضاعفات السكر', note_en: 'Low risk of metabolic complications' },
        { label_ar: 'مرحلة ما قبل السكري', label_en: 'Pre-diabetes Range', range: '5.7 % - 6.4 %', status: 'warning', note_ar: 'فرصة ذهبية للوقاية وتعديل العادات', note_en: 'High risk; reversible with lifestyle' },
        { label_ar: 'تشخيص السكري المؤكد', label_en: 'Diabetes Diagnosis', range: '≥ 6.5 %', status: 'critical', note_ar: 'تأكيد الإصابة بالسكري', note_en: 'Diagnostic cutoff for diabetes' },
        { label_ar: 'الهدف العام لمعظم مرضى السكر', label_en: 'General Diabetic Target', range: '< 7.0 %', status: 'normal', note_ar: 'يحمي شبكية العين، الكلى، والأعصاب', note_en: 'Target to protect microvasculature' },
        { label_ar: 'هدف كبار السن وحالات الهبوط', label_en: 'Elderly / Hypo-prone Target', range: '< 7.5% - 8.0%', status: 'normal', note_ar: 'لتفادي نوبات هبوط السكر القاتلة', note_en: 'Tolerated to avoid severe hypoglycemia' }
      ]
    },
    {
      id: 'random_glucose',
      name_ar: 'السكر العشوائي (Random Blood Sugar)',
      name_en: 'Random Blood Glucose (RBS)',
      unit: 'mg/dL',
      category: 'glucose',
      description_ar: 'يُقاس في أي وقت من اليوم بغض النظر عن موعد آخر وجبة.',
      description_en: 'Drawn at any time of day regardless of meal times.',
      ranges: [
        { label_ar: 'طبيعي', label_en: 'Normal', range: '< 140 mg/dL', status: 'optimal' },
        { label_ar: 'اشتباه سكري / مراقبة', label_en: 'Borderline', range: '140 - 199 mg/dL', status: 'warning' },
        { label_ar: 'سكري مؤكد مع أعراض العطش والتبول', label_en: 'Diabetic with Classic Symptoms', range: '≥ 200 mg/dL', status: 'critical' }
      ]
    },

    // 2. Cardio & Vitals
    {
      id: 'blood_pressure',
      name_ar: 'ضغط الدم الشرياني (Blood Pressure)',
      name_en: 'Arterial Blood Pressure (BP)',
      unit: 'mmHg',
      category: 'cardio',
      description_ar: 'يُقاس في وضع الجلوس والراحة التامة لمدة 5 دقائق على الأقل.',
      description_en: 'Measured while seated after at least 5 minutes of quiet rest.',
      ranges: [
        { label_ar: 'مثالي وطبيعي (Normal)', label_en: 'Optimal / Normal', range: '< 120 / < 80 mmHg', status: 'optimal', note_ar: 'ضغط صحي مثالي للقلب', note_en: 'Ideal cardiovascular baseline' },
        { label_ar: 'ضغط مرتفع بسيط (Elevated)', label_en: 'Elevated BP', range: '120-129 / < 80 mmHg', status: 'warning', note_ar: 'يتطلب خفض الملح وتخفيف الوزن', note_en: 'Lifestyle & sodium control' },
        { label_ar: 'ارتفاع ضغط - مرحلة 1 (Stage 1)', label_en: 'Hypertension Stage 1', range: '130-139 أو 80-89 mmHg', status: 'high', note_ar: 'استشارة طبيب لبدء خطة علاجية', note_en: 'Clinical evaluation & meds if needed' },
        { label_ar: 'ارتفاع ضغط - مرحلة 2 (Stage 2)', label_en: 'Hypertension Stage 2', range: '≥ 140 أو ≥ 90 mmHg', status: 'high', note_ar: 'علاج دوائي معتمد متعدد الفئات', note_en: 'Requires anti-hypertensive therapy' },
        { label_ar: 'أزمة ارتفاع ضغط حادة (Hypertensive Crisis)', label_en: 'Hypertensive Crisis', range: '> 180 و/أو > 120 mmHg', status: 'critical', note_ar: 'طوارئ طبية عاجلة فوراً', note_en: 'Emergency medical intervention needed' },
        { label_ar: 'هبوط ضغط الدم (Hypotension)', label_en: 'Hypotension (Low BP)', range: '< 90 / < 60 mmHg', status: 'warning', note_ar: 'قد يسبب دوخة وإغماء وجفاف', note_en: 'Dizziness, dehydration, or syncopal risk' }
      ]
    },
    {
      id: 'heart_rate',
      name_ar: 'معدل ضربات القلب أثناء الراحة (Resting Heart Rate)',
      name_en: 'Resting Heart Rate (Pulse)',
      unit: 'bpm',
      category: 'cardio',
      description_ar: 'عدد ضربات القلب في الدقيقة الواحدة في حالة الاسترخاء.',
      description_en: 'Beats per minute while awake and fully relaxed.',
      ranges: [
        { label_ar: 'رياضي ممتاز / بطء نبض صحي', label_en: 'Athlete / Highly Fit', range: '40 - 59 bpm', status: 'optimal', note_ar: 'شائع عند الرياضيين وأصحاب اللياقة العالية', note_en: 'Common in well-conditioned athletes' },
        { label_ar: 'المعدل الطبيعي للبالغين', label_en: 'Normal Adult Range', range: '60 - 100 bpm', status: 'normal', note_ar: 'المعدل الفسيولوجي المعتاد', note_en: 'Standard adult physiological baseline' },
        { label_ar: 'تسارع ضربات القلب (Tachycardia)', label_en: 'Tachycardia (High)', range: '> 100 bpm', status: 'high', note_ar: 'قد ينتج عن قلق، جفاف، فقر دم، أو أدوية', note_en: 'Fever, anemia, anxiety, or medication effect' },
        { label_ar: 'بطء شديد غير رياضي (Bradycardia)', label_en: 'Bradycardia (< 50 bpm)', range: '< 50 bpm', status: 'warning', note_ar: 'يتطلب فحص في حال وجود إجهاد أو دوار', note_en: 'Evaluate if accompanied by presyncope' }
      ]
    },
    {
      id: 'oxygen_saturation',
      name_ar: 'تشبع الأكسجين في الدم (SpO2)',
      name_en: 'Blood Oxygen Saturation (SpO2)',
      unit: '%',
      category: 'cardio',
      description_ar: 'نسبة الهيموجلوبين المحمل بالأكسجين في الدم المحيطي عبر جهاز مقياس النبض.',
      description_en: 'Measured via pulse oximeter on the fingertip.',
      ranges: [
        { label_ar: 'طبيعي ومثالي', label_en: 'Normal & Healthy', range: '95 % - 100 %', status: 'optimal', note_ar: 'تبادل غازي رئوي سليم', note_en: 'Adequate tissue oxygenation' },
        { label_ar: 'نقص أكسجين خفيف (Mild Hypoxia)', label_en: 'Mild Hypoxemia', range: '91 % - 94 %', status: 'warning', note_ar: 'مقبول لمرضى السدة الرئوية المزمنة (COPD)', note_en: 'Often target range in COPD' },
        { label_ar: 'نقص أكسجين حرج (Severe)', label_en: 'Severe Hypoxia', range: '≤ 90 %', status: 'critical', note_ar: 'يتطلب تدخل أكسجين طبي عاجل', note_en: 'Requires prompt oxygen therapy & ER' }
      ]
    },
    {
      id: 'body_temp',
      name_ar: 'درجة حرارة الجسم (Body Temperature)',
      name_en: 'Body Temperature',
      unit: '°C',
      category: 'cardio',
      description_ar: 'درجة الحرارة الأساسية للجسم (عن طريق الفم أو الأذن).',
      description_en: 'Core body temperature measured orally or tympanically.',
      ranges: [
        { label_ar: 'طبيعي', label_en: 'Normal Range', range: '36.5 °C - 37.5 °C', status: 'optimal' },
        { label_ar: 'حرارة مرتفعة طفيفة (Low Fever)', label_en: 'Low-grade Fever', range: '37.6 °C - 38.2 °C', status: 'warning' },
        { label_ar: 'حمى واضحة (Fever / Pyrexia)', label_en: 'High Fever', range: '38.3 °C - 39.5 °C', status: 'high' },
        { label_ar: 'حمى شديدة مفرطة (Hyperpyrexia)', label_en: 'Dangerous Hyperpyrexia', range: '> 39.5 °C', status: 'critical' },
        { label_ar: 'انخفاض حرارة الجسم (Hypothermia)', label_en: 'Hypothermia', range: '< 35.0 °C', status: 'critical' }
      ]
    },

    // 3. Renal & Electrolytes
    {
      id: 'creatinine',
      name_ar: 'الكرياتينين في الدم (Serum Creatinine)',
      name_en: 'Serum Creatinine',
      unit: 'mg/dL',
      category: 'renal',
      description_ar: 'مؤشر مباشر على كفاءة ترشيح الكليتين للفضلات العضلية.',
      description_en: 'Key biomarker for glomerular filtration and muscle waste clearance.',
      ranges: [
        { label_ar: 'طبيعي للرجال', label_en: 'Normal Males', range: '0.7 - 1.3 mg/dL', status: 'optimal' },
        { label_ar: 'طبيعي للنساء', label_en: 'Normal Females', range: '0.6 - 1.1 mg/dL', status: 'optimal' },
        { label_ar: 'ارتفاع دال على قصور كلوي', label_en: 'Elevated (Impaired Function)', range: '> 1.4 mg/dL', status: 'high', note_ar: 'يستلزم ضبط جرعات المضادات والأدوية', note_en: 'Dose adjustment needed for many drugs' }
      ]
    },
    {
      id: 'egfr',
      name_ar: 'معدل الفلترة الكبيبية التقديري (eGFR)',
      name_en: 'Estimated Glomerular Filtration Rate (eGFR)',
      unit: 'mL/min/1.73m²',
      category: 'renal',
      description_ar: 'أدق مقياس لمراحل القصور الكلوي المزمن (CKD).',
      description_en: 'Gold standard clinical classification for Chronic Kidney Disease.',
      ranges: [
        { label_ar: 'وظائف كلوية طبيعية (المرحلة 1)', label_en: 'Normal (Stage 1)', range: '≥ 90 mL/min', status: 'optimal' },
        { label_ar: 'انخفاض طفيف (المرحلة 2)', label_en: 'Mild Decrease (Stage 2)', range: '60 - 89 mL/min', status: 'normal' },
        { label_ar: 'قصور معتدل (المرحلة 3A / 3B)', label_en: 'Moderate (Stage 3)', range: '30 - 59 mL/min', status: 'warning', note_ar: 'ممنوع بعض الأدوية مثل الميتفورمين بجرعات عالية', note_en: 'Metformin & NSAID precautions' },
        { label_ar: 'قصور كلوي شديد (المرحلة 4)', label_en: 'Severe (Stage 4)', range: '15 - 29 mL/min', status: 'high', note_ar: 'حظر كامل لمضادات الالتهاب غير الستيرويدية (NSAIDs)', note_en: 'NSAIDs strictly contraindicated' },
        { label_ar: 'فشل كلوي نهائي (المرحلة 5)', label_en: 'Kidney Failure (Stage 5)', range: '< 15 mL/min', status: 'critical', note_ar: 'مرحلة الغسيل الكلوي', note_en: 'Dialysis required' }
      ]
    },
    {
      id: 'uric_acid',
      name_ar: 'حمض اليوريك / حمض البوليك (Uric Acid)',
      name_en: 'Serum Uric Acid',
      unit: 'mg/dL',
      category: 'renal',
      description_ar: 'ناتج تكسير البيورينات، ارتفاعه يرتبط بنوبات النقرس وحصوات الكلى.',
      description_en: 'Purine metabolite; hyperuricemia causes gout and nephrolithiasis.',
      ranges: [
        { label_ar: 'طبيعي للرجال', label_en: 'Normal Males', range: '3.5 - 7.2 mg/dL', status: 'optimal' },
        { label_ar: 'طبيعي للنساء', label_en: 'Normal Females', range: '2.6 - 6.0 mg/dL', status: 'optimal' },
        { label_ar: 'هدف مريض النقرس المزمن', label_en: 'Gout Patient Target', range: '< 6.0 mg/dL', status: 'normal', note_ar: 'لمنع ترسب بلورات اليورات في المفاصل', note_en: 'Prevents tophi and acute attacks' },
        { label_ar: 'ارتفاع حمض اليوريك (Hyperuricemia)', label_en: 'Hyperuricemia', range: '> 7.5 mg/dL', status: 'high' }
      ]
    },
    {
      id: 'potassium',
      name_ar: 'البوتاسيوم في الدم (Serum Potassium - K+)',
      name_en: 'Serum Potassium (K+)',
      unit: 'mEq/L',
      category: 'renal',
      description_ar: 'أخطر إلكتروليت للقلب؛ أي خلل به يهدد بحدوث اضطراب ضربات القلب.',
      description_en: 'Vital electrolyte; tight physiological range critical for cardiac rhythm.',
      ranges: [
        { label_ar: 'طبيعي ومثالي', label_en: 'Normal Physiological', range: '3.5 - 5.0 mEq/L', status: 'optimal' },
        { label_ar: 'انخفاض بوتاسيوم (Hypokalemia)', label_en: 'Hypokalemia (Low)', range: '< 3.5 mEq/L', status: 'warning', note_ar: 'يحدث مع مدرات البول مثل Lasix', note_en: 'Common with loop/thiazide diuretics' },
        { label_ar: 'ارتفاع بوتاسيوم (Hyperkalemia)', label_en: 'Hyperkalemia (High)', range: '> 5.2 mEq/L', status: 'high', note_ar: 'حذر شديد مع أدوية الضغط (ACEi / ARBs)', note_en: 'Caution with ACEi, ARBs, Spironolactone' },
        { label_ar: 'ارتفاع حرج مهدد للحياة', label_en: 'Critical Hyperkalemia', range: '≥ 6.0 mEq/L', status: 'critical', note_ar: 'خطر توقف عضلة القلب فجأة', note_en: 'Life-threatening arrhythmia risk' }
      ]
    },
    {
      id: 'sodium',
      name_ar: 'الصوديوم في الدم (Serum Sodium - Na+)',
      name_en: 'Serum Sodium (Na+)',
      unit: 'mEq/L',
      category: 'renal',
      description_ar: 'المنظم الرئيسي لتوازن السوائل والضغط الأسموزي في الجسم والخلايا العصبية.',
      description_en: 'Key extracellular cation maintaining fluid and osmotic balance.',
      ranges: [
        { label_ar: 'طبيعي', label_en: 'Normal', range: '135 - 145 mEq/L', status: 'optimal' },
        { label_ar: 'نقص صوديوم (Hyponatremia)', label_en: 'Hyponatremia (< 135)', range: '< 135 mEq/L', status: 'warning', note_ar: 'يسبب دوار وتشوش ذهني', note_en: 'Causes headache and mental confusion' },
        { label_ar: 'ارتفاع صوديوم (Hypernatremia)', label_en: 'Hypernatremia (> 145)', range: '> 145 mEq/L', status: 'warning', note_ar: 'يرتبط بالجفاف الشديد', note_en: 'Associated with severe dehydration' }
      ]
    },

    // 4. Lipid Profile
    {
      id: 'cholesterol_total',
      name_ar: 'الكوليسترول الكلي (Total Cholesterol)',
      name_en: 'Total Blood Cholesterol',
      unit: 'mg/dL',
      category: 'lipids',
      description_ar: 'إجمالي الكوليسترول في الدم المحمول على جميع البروتينات الدهنية.',
      description_en: 'Combined sum of LDL, HDL, and VLDL in the bloodstream.',
      ranges: [
        { label_ar: 'مرغوب ومثالي (Desirable)', label_en: 'Desirable', range: '< 200 mg/dL', status: 'optimal' },
        { label_ar: 'حد مرتفع (Borderline High)', label_en: 'Borderline High', range: '200 - 239 mg/dL', status: 'warning', note_ar: 'ينصح بالحمية الغذائية والرياضة', note_en: 'Dietary modifications suggested' },
        { label_ar: 'مرتفع (High Risk)', label_en: 'High Risk', range: '≥ 240 mg/dL', status: 'high', note_ar: 'زيادة خطر تصلب الشرايين', note_en: 'Elevated atherogenic risk' }
      ]
    },
    {
      id: 'ldl',
      name_ar: 'الكوليسترول الضار (LDL - Low-Density Lipoprotein)',
      name_en: 'LDL Cholesterol (Bad Cholesterol)',
      unit: 'mg/dL',
      category: 'lipids',
      description_ar: 'المسؤول الأساسي عن ترسب اللويحات الدهنية وتصلب الشرايين التاجية.',
      description_en: 'Primary driver of coronary atheroma formation and plaque buildup.',
      ranges: [
        { label_ar: 'مثالي للشخص السليم', label_en: 'Optimal for General Public', range: '< 100 mg/dL', status: 'optimal' },
        { label_ar: 'الهدف لمرضى القلب والشرايين', label_en: 'Coronary Disease / Stent Target', range: '< 70 أو < 55 mg/dL', status: 'optimal', note_ar: 'هدف صارم بالستاتينات (Atorvastatin)', note_en: 'Intensive statin target' },
        { label_ar: 'حد مرتفع', label_en: 'Borderline High', range: '130 - 159 mg/dL', status: 'warning' },
        { label_ar: 'مرتفع جداً', label_en: 'Very High', range: '≥ 190 mg/dL', status: 'critical', note_ar: 'يتطلب علاجاً مكثفاً بستاتين عالي القوة', note_en: 'High-intensity statin indicated' }
      ]
    },
    {
      id: 'hdl',
      name_ar: 'الكوليسترول الجيد النافع (HDL)',
      name_en: 'HDL Cholesterol (Good Cholesterol)',
      unit: 'mg/dL',
      category: 'lipids',
      description_ar: 'يقوم بكنس الدهون من الشرايين وإعادتها إلى الكبد للتخلص منها.',
      description_en: 'Reverse cholesterol transport; protects arterial endothelial lining.',
      ranges: [
        { label_ar: 'حماية ممتازة للقلب', label_en: 'Protective & Healthy', range: '≥ 60 mg/dL', status: 'optimal', note_ar: 'عامل وقاية وعائي طبيعي', note_en: 'Protective against heart disease' },
        { label_ar: 'مقبول للرجال', label_en: 'Acceptable Men', range: '40 - 59 mg/dL', status: 'normal' },
        { label_ar: 'مقبول للنساء', label_en: 'Acceptable Women', range: '50 - 59 mg/dL', status: 'normal' },
        { label_ar: 'منخفض (عامل خطورة)', label_en: 'Low (Major Risk Factor)', range: '< 40 (رجال) / < 50 (نساء)', status: 'warning', note_ar: 'يزيد احتمالية أمراض القلب', note_en: 'Elevates coronary risk' }
      ]
    },
    {
      id: 'triglycerides',
      name_ar: 'الدهون الثلاثية (Serum Triglycerides)',
      name_en: 'Serum Triglycerides (TG)',
      unit: 'mg/dL',
      category: 'lipids',
      description_ar: 'دهون تخزين الطاقة، ترتبط بزيادة السكريات ومقاومة الإنسولين.',
      description_en: 'Reflects dietary sugar, alcohol intake, and insulin resistance.',
      ranges: [
        { label_ar: 'طبيعي ومثالي', label_en: 'Normal Range', range: '< 150 mg/dL', status: 'optimal' },
        { label_ar: 'حد مرتفع', label_en: 'Borderline High', range: '150 - 199 mg/dL', status: 'warning' },
        { label_ar: 'مرتفع', label_en: 'High', range: '200 - 499 mg/dL', status: 'high' },
        { label_ar: 'مرتفع بشدة (خطر التهاب البنكرياس)', label_en: 'Severe (Pancreatitis Risk)', range: '≥ 500 mg/dL', status: 'critical', note_ar: 'خطر حاد لالتهاب البنكرياس (Acute Pancreatitis)', note_en: 'Urgent medical therapy (Fibrates)' }
      ]
    },

    // 5. Liver Enzymes
    {
      id: 'alt',
      name_ar: 'إنزيم الكبد (ALT / SGPT)',
      name_en: 'Alanine Aminotransferase (ALT / SGPT)',
      unit: 'U/L',
      category: 'liver',
      description_ar: 'أكثر إنزيمات الكبد تخصصاً؛ يرتفع عند التهاب خلايا الكبد أو سمية الأدوية.',
      description_en: 'Most liver-specific transaminase; rises during hepatocellular injury.',
      ranges: [
        { label_ar: 'طبيعي', label_en: 'Normal Baseline', range: '7 - 56 U/L', status: 'optimal' },
        { label_ar: 'ارتفاع طفيف (كبد دهني / أدوية)', label_en: 'Mild Elevation (Fatty liver/Meds)', range: '57 - 120 U/L', status: 'warning', note_ar: 'يتطلب مراجعة الأدوية والدهون الكبدية', note_en: 'Monitor medication toxicity & steatosis' },
        { label_ar: 'ارتفاع ملحوظ إلى حاد', label_en: 'Significant Hepatotoxicity', range: '> 150 U/L', status: 'critical', note_ar: 'إيقاف فوري للأدوية السامة للكبد', note_en: 'Discontinue hepatotoxic drugs promptly' }
      ]
    },
    {
      id: 'ast',
      name_ar: 'إنزيم الكبد (AST / SGOT)',
      name_en: 'Aspartate Aminotransferase (AST / SGOT)',
      unit: 'U/L',
      category: 'liver',
      description_ar: 'يتواجد في الكبد والقلب والعضلات الهيكلية.',
      description_en: 'Found in liver parenchyma, heart muscle, and skeletal tissue.',
      ranges: [
        { label_ar: 'طبيعي', label_en: 'Normal Baseline', range: '10 - 40 U/L', status: 'optimal' },
        { label_ar: 'ارتفاع مرضي', label_en: 'Elevated AST', range: '> 40 U/L', status: 'high' }
      ]
    },
    {
      id: 'bilirubin',
      name_ar: 'البيليروبين الكلي / الصفراء (Total Bilirubin)',
      name_en: 'Total Serum Bilirubin',
      unit: 'mg/dL',
      category: 'liver',
      description_ar: 'مؤشر إفراز الصفراء وسلامة القنوات المرارية، يسبب ارتفاعه اليرقان.',
      description_en: 'Biliary breakdown product; elevated levels cause clinical jaundice.',
      ranges: [
        { label_ar: 'طبيعي', label_en: 'Normal', range: '0.2 - 1.2 mg/dL', status: 'optimal' },
        { label_ar: 'ارتفاع مسبب لصفار العين والجلد', label_en: 'Hyperbilirubinemia (Jaundice)', range: '> 2.0 mg/dL', status: 'critical', note_ar: 'فحص وظائف الكبد والمرارة فوراً', note_en: 'Investigate biliary obstruction or hemolysis' }
      ]
    },

    // 6. CBC & Blood
    {
      id: 'hemoglobin',
      name_ar: 'الهيموجلوبين (Hemoglobin - Hb)',
      name_en: 'Hemoglobin (Hb)',
      unit: 'g/dL',
      category: 'cbc',
      description_ar: 'البروتين الحامل للأكسجين في الدم، انخفاضه يعني فقر الدم (الأنيميا).',
      description_en: 'Oxygen-binding metalloprotein; low levels signify anemia.',
      ranges: [
        { label_ar: 'طبيعي للرجال البالغين', label_en: 'Normal Adult Males', range: '13.5 - 17.5 g/dL', status: 'optimal' },
        { label_ar: 'طبيعي للنساء البالغات', label_en: 'Normal Adult Females', range: '12.0 - 15.5 g/dL', status: 'optimal' },
        { label_ar: 'طبيعي أثناء الحمل', label_en: 'Normal in Pregnancy', range: '11.0 - 14.0 g/dL', status: 'normal', note_ar: 'بسبب التخفيف الفسيولوجي لحجم الدم', note_en: 'Physiological hemodilution' },
        { label_ar: 'أنيميا معتدلة إلى شديدة', label_en: 'Moderate-Severe Anemia', range: '< 10.0 g/dL', status: 'high', note_ar: 'يتطلب مكملات حديد وفحص السبب', note_en: 'Iron therapy / clinical workup' },
        { label_ar: 'أنيميا حرجة تستدعي نقل دم', label_en: 'Critical (Transfusion Threshold)', range: '< 7.0 g/dL', status: 'critical', note_ar: 'طوارئ طبية', note_en: 'Emergency transfusion indicated' }
      ]
    },
    {
      id: 'platelets',
      name_ar: 'الصفائح الدموية (Platelet Count)',
      name_en: 'Platelet Count (PLT)',
      unit: '/µL',
      category: 'cbc',
      description_ar: 'المسؤولة عن تجلط الدم ومنع النزيف الداخلي والخارجي.',
      description_en: 'Cell fragments essential for primary hemostasis and clot formation.',
      ranges: [
        { label_ar: 'طبيعي', label_en: 'Normal Platelet Range', range: '150,000 - 450,000 /µL', status: 'optimal' },
        { label_ar: 'نقص صفائح طفيف (Thrombocytopenia)', label_en: 'Mild Thrombocytopenia', range: '100,000 - 149,000 /µL', status: 'warning' },
        { label_ar: 'نقص شديد (خطر نزيف عفوي)', label_en: 'Severe Bleeding Risk', range: '< 50,000 /µL', status: 'critical', note_ar: 'حظر كامل لمسيلات الدم والأسبرين', note_en: 'Anticoagulants / NSAIDs strictly held' }
      ]
    }
  ];

  // Filtered metrics for reference tab
  const filteredMetrics = metricsData.filter(m => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      m.name_ar.toLowerCase().includes(q) || 
      m.name_en.toLowerCase().includes(q) ||
      m.description_ar.toLowerCase().includes(q) ||
      m.description_en.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // Comprehensive Evaluation Logic for ALL 22 Biomarkers
  const getEvaluation = () => {
    const val1 = parseFloat(evalValue1);
    const val2 = parseFloat(evalValue2);

    if (isNaN(val1) && evalMetric !== 'blood_pressure') return null;

    // 1. Fasting Glucose
    if (evalMetric === 'fasting_glucose') {
      if (val1 < 70) return { status: 'warning', title_ar: 'هبوط في سكر الدم (Hypoglycemia)', title_en: 'Hypoglycemia (Low Sugar)', advice_ar: 'تناول 15 جراماً من السكريات السريعة (عصير أو تمر) وأعد القياس بعد 15 دقيقة.', advice_en: 'Consume 15g fast-acting carbs (juice/honey) and recheck in 15 minutes.' };
      if (val1 <= 99) return { status: 'optimal', title_ar: 'طبيعي ومثالي جداً (Normal)', title_en: 'Normal & Healthy', advice_ar: 'استمر على نظامك الغذائي المتوازن وممارسة النشاط البدني.', advice_en: 'Maintain balanced diet and regular physical activity.' };
      if (val1 <= 125) return { status: 'warning', title_ar: 'مرحلة ما قبل السكري (Pre-diabetes)', title_en: 'Pre-diabetes', advice_ar: 'فرصة ذهبية لعكس الحالة؛ خفف السكريات البسيطة والنشويات ومارس المشي 30 دقيقة يومياً.', advice_en: 'Window of opportunity to reverse: reduce refined sugars and walk 30 mins daily.' };
      return { status: 'critical', title_ar: 'ارتفاع دال على مرض السكري (Diabetic Range)', title_en: 'Diabetic Range', advice_ar: 'يجب مراجعة طبيب باطنة/غدد صماء لإجراء تحليل السكر التراكمي وتحديد الخطة العلاجية.', advice_en: 'Consult a physician for HbA1c confirmation and treatment plan.' };
    }

    // 2. Postprandial Glucose
    if (evalMetric === 'postprandial_glucose') {
      if (val1 < 140) return { status: 'optimal', title_ar: 'طبيعي وسليم (Normal)', title_en: 'Normal Glucose Tolerance', advice_ar: 'استجابة إنسولين ممتازة للوجبة الغذائية.', advice_en: 'Excellent insulin response to food.' };
      if (val1 <= 199) return { status: 'warning', title_ar: 'مرحلة ما قبل السكري (Impaired Tolerance)', title_en: 'Impaired Glucose Tolerance', advice_ar: 'قلل حجم الوجبات وركز على الألياف والخضار قبل الكربوهيدرات.', advice_en: 'Reduce carb portions and increase fiber before meals.' };
      return { status: 'critical', title_ar: 'ارتفاع سكري صريح (Elevated Postprandial)', title_en: 'Elevated Postprandial', advice_ar: 'استشر الطبيب لتقييم جرعات العلاج أو بدء التدخل الدوائي.', advice_en: 'Consult doctor for therapeutic intervention or dosage adjustment.' };
    }

    // 3. Random Glucose
    if (evalMetric === 'random_glucose') {
      if (val1 < 140) return { status: 'optimal', title_ar: 'سكر عشوائي طبيعي', title_en: 'Normal Random Blood Sugar', advice_ar: 'القراءة ضمن النطاق الطبيعي الصحي.', advice_en: 'Reading within healthy standard boundaries.' };
      if (val1 < 200) return { status: 'warning', title_ar: 'اشتباه سكري / قراءة حدودية', title_en: 'Borderline Elevation', advice_ar: 'يُنصح بإجراء فحص السكر الصائم والسكر التراكمي للتحقق بدقة.', advice_en: 'Recommend testing fasting glucose and HbA1c for confirmation.' };
      return { status: 'critical', title_ar: 'قراءة مرتفعة دالة على السكري (≥ 200 mg/dL)', title_en: 'Diabetic Range (≥ 200 mg/dL)', advice_ar: 'خاصة عند وجود أعراض كالعطش الزائد وكثرة التبول؛ راجع الطبيب لتأكيد التشخيص.', advice_en: 'Strong indicator of diabetes if symptoms (polyuria/polydipsia) present.' };
    }

    // 4. HbA1c
    if (evalMetric === 'hba1c') {
      if (val1 < 5.7) return { status: 'optimal', title_ar: 'طبيعي ومثالي (Normal)', title_en: 'Optimal HbA1c', advice_ar: 'متوسط سكر دم ممتاز خلال الأشهر الثلاثة الماضية.', advice_en: 'Excellent 3-month average glucose control.' };
      if (val1 <= 6.4) return { status: 'warning', title_ar: 'مرحلة ما قبل السكري (Pre-diabetes)', title_en: 'Pre-diabetic Range', advice_ar: 'يتطلب فحص دوري كل 6 أشهر مع تعديل جاد لنمط الحياة لتفادي الإصابة.', advice_en: 'Bi-annual checkups recommended with active lifestyle changes.' };
      if (val1 <= 7.0) return { status: 'normal', title_ar: 'هدف علاجي ممتاز لمريض السكر', title_en: 'Good Diabetic Control Target', advice_ar: 'تحكم سليم يقي شرايين القلب والعين والكلى من التلف والمضاعفات.', advice_en: 'Good glycemic control protecting against microvascular damage.' };
      return { status: 'critical', title_ar: 'سكر تراكمي مرتفع غير منضبط', title_en: 'Uncontrolled Glycemia (High)', advice_ar: 'يتطلب تعديل فوري في جرعات أدوية السكر أو الإنسولين تحت إشراف الطبيب.', advice_en: 'Requires prompt medical review of anti-diabetic medications.' };
    }

    // 5. Blood Pressure
    if (evalMetric === 'blood_pressure') {
      const sys = val1;
      const dia = val2;
      if (isNaN(sys) || isNaN(dia)) return null;

      if (sys > 180 || dia > 120) return { status: 'critical', title_ar: 'أزمة ارتفاع ضغط دم طارئة (Hypertensive Crisis)', title_en: 'Hypertensive Crisis (Emergency)', advice_ar: 'توجه إلى أقرب قسم طوارئ فوراً إذا ترافق مع صداع حاد، تشوش رؤية أو ألم بالصدر.', advice_en: 'Seek immediate emergency care if accompanied by chest pain, shortness of breath, or headache.' };
      if (sys < 90 || dia < 60) return { status: 'warning', title_ar: 'هبوط ضغط الدم (Hypotension)', title_en: 'Hypotension (Low BP)', advice_ar: 'اشرب كمية كافية من السوائل والأملاح وارفع الساقين عند الشعور بالدوخة.', advice_en: 'Hydrate with fluids and elevate legs if dizzy.' };
      if (sys < 120 && dia < 80) return { status: 'optimal', title_ar: 'ضغط دم مثالي وصحي (Optimal)', title_en: 'Optimal Blood Pressure', advice_ar: 'ضغط دم ممتاز يقلل من مخاطر السكتات الدماغية وأمراض القلب.', advice_en: 'Ideal pressure reducing stroke and coronary risks.' };
      if (sys <= 129 && dia < 80) return { status: 'warning', title_ar: 'ضغط دم مرتفع طفيفاً (Elevated)', title_en: 'Elevated BP', advice_ar: 'قلل الصوديوم والملح في طعامك واحرص على النوم الكافي وممارسة المشي.', advice_en: 'Reduce dietary sodium and manage stress and sleep.' };
      if (sys <= 139 || dia <= 89) return { status: 'high', title_ar: 'ارتفاع ضغط دم - مرحلة أولى (Stage 1)', title_en: 'Hypertension Stage 1', advice_ar: 'سجّل قراءاتك يومياً لمدة أسبوع واعرضها على طبيبك لتحديد الحاجة للعلاج.', advice_en: 'Log readings daily for a week and review with your physician.' };
      return { status: 'high', title_ar: 'ارتفاع ضغط دم - مرحلة ثانية (Stage 2)', title_en: 'Hypertension Stage 2', advice_ar: 'يستلزم التزاماً بالعلاج الدوائي الخافض للضغط ومتابعة وظائف الكلى.', advice_en: 'Requires anti-hypertensive drug therapy and regular renal monitoring.' };
    }

    // 6. Heart Rate
    if (evalMetric === 'heart_rate') {
      if (val1 < 50) return { status: 'warning', title_ar: 'بطء نبضات القلب (Bradycardia)', title_en: 'Bradycardia', advice_ar: 'طبيعي جداً للرياضيين؛ استشر الطبيب فقط إذا شعرت بدوخة أو إجهاد غير مبرر.', advice_en: 'Normal for conditioned athletes; check with MD if symptomatic.' };
      if (val1 <= 100) return { status: 'optimal', title_ar: 'معدل نبض طبيعي للبالغين', title_en: 'Normal Resting Heart Rate', advice_ar: 'إيقاع قلبي منتظم وسليم.', advice_en: 'Healthy sinus rhythm.' };
      return { status: 'high', title_ar: 'تسارع ضربات القلب (Tachycardia)', title_en: 'Tachycardia', advice_ar: 'تجنب المنبهات والكافيين الزائد، وافحص نسبة الهيموجلوبين والغدة الدرقية.', advice_en: 'Limit caffeine; check hydration, thyroid function, and hemoglobin.' };
    }

    // 7. Oxygen Saturation
    if (evalMetric === 'oxygen_saturation') {
      if (val1 >= 95) return { status: 'optimal', title_ar: 'تشبع أكسجين سليم ومثالي', title_en: 'Optimal Oxygenation', advice_ar: 'رئتان تؤديان وظيفتهما بكفاءة كاملة.', advice_en: 'Adequate pulmonary oxygen exchange.' };
      if (val1 >= 91) return { status: 'warning', title_ar: 'نقص أكسجين خفيف (Mild Hypoxia)', title_en: 'Mild Hypoxia', advice_ar: 'اجلس مستقيماً وخذ أنفاساً عميقة؛ إذا كان لديك ربو استخدم بخاخك الطبي واقترب من نافذة.', advice_en: 'Sit upright, take deep breaths, and monitor closely.' };
      return { status: 'critical', title_ar: 'نقص أكسجين حرج يستدعي رعاية طبية عاجلة', title_en: 'Critical Hypoxia (Urgent)', advice_ar: 'توجه للمستشفى أو اتصل بالطوارئ فوراً لتلقي دعم الأكسجين الطبي.', advice_en: 'Immediate emergency medical oxygen therapy needed.' };
    }

    // 8. Body Temperature
    if (evalMetric === 'body_temp') {
      if (val1 < 35.0) return { status: 'critical', title_ar: 'انخفاض حرارة الجسم (Hypothermia)', title_en: 'Hypothermia', advice_ar: 'تدفئة المريض بالملابس والأغطية فوراً ومراجعة الطوارئ.', advice_en: 'Warm patient immediately and seek medical attention.' };
      if (val1 < 36.5) return { status: 'warning', title_ar: 'حرارة منخفضة طفيفة', title_en: 'Subnormal Temperature', advice_ar: 'احرص على التدفئة المناسبة والمشروبات الدافئة.', advice_en: 'Ensure adequate warmth and warm fluids.' };
      if (val1 <= 37.5) return { status: 'optimal', title_ar: 'درجة حرارة طبيعية ومثالية', title_en: 'Normal Body Temperature', advice_ar: 'الجسم في نطاقه الفسيولوجي المعتدل.', advice_en: 'Physiological normal thermal balance.' };
      if (val1 <= 38.2) return { status: 'warning', title_ar: 'حرارة مرتفعة طفيفة (Low-grade fever)', title_en: 'Low-grade Fever', advice_ar: 'الراحة، شرب كميات وافرة من السوائل، وكمادات ماء فاتر.', advice_en: 'Rest, hydration, and lukewarm compresses.' };
      if (val1 <= 39.5) return { status: 'high', title_ar: 'حمى واضحة (Fever)', title_en: 'High Fever', advice_ar: 'استخدام خافض حرارة آمن مثل الباراسيتامول ومراجعة الطبيب لتحديد مصدر العدوى.', advice_en: 'Use antipyretic (paracetamol) and evaluate for infection source.' };
      return { status: 'critical', title_ar: 'حمى شديدة مفرطة (Hyperpyrexia)', title_en: 'Dangerous Hyperpyrexia', advice_ar: 'طوارئ طبية عاجلة لتفادي التشنجات الحرارية وتلف الخلايا.', advice_en: 'Emergency medical intervention needed to prevent febrile seizures.' };
    }

    // 9. Creatinine
    if (evalMetric === 'creatinine') {
      const maxNormal = evalGender === 'male' ? 1.3 : 1.1;
      const minNormal = evalGender === 'male' ? 0.7 : 0.6;

      if (val1 < minNormal) return { status: 'normal', title_ar: 'كرياتينين منخفض', title_en: 'Low Creatinine', advice_ar: 'يرتبط عادة بنقص الكتلة العضلية أو التغذية، ليس له دلالة مرضية كلوية.', advice_en: 'Typically reflects low muscle mass; generally benign.' };
      if (val1 <= maxNormal) return { status: 'optimal', title_ar: 'وظائف كلوية طبيعية ومثالية', title_en: 'Normal Renal Function', advice_ar: 'ترشيح كلوي سليم وكفاءة عالية في تنقية الفضلات.', advice_en: 'Excellent glomerular filtration and waste clearance.' };
      if (val1 <= 2.0) return { status: 'high', title_ar: 'ارتفاع الكرياتينين (قصور كلوي)', title_en: 'Elevated Creatinine (Renal Impairment)', advice_ar: 'يستوجب فحص الطبيب وتعديل جرعات بعض الأدوية وحساب معدل الفلترة eGFR.', advice_en: 'Requires clinical review; adjust dosages of renal-cleared drugs.' };
      return { status: 'critical', title_ar: 'ارتفاع حاد في الكرياتينين', title_en: 'Severe Renal Elevation', advice_ar: 'استشارة طبيب كلى فوراً ومراقبة توازن الأملاح والسوائل وتجنب مسكنات NSAIDs نهائياً.', advice_en: 'Urgent nephrology consult needed; strictly avoid NSAIDs.' };
    }

    // 10. eGFR
    if (evalMetric === 'egfr') {
      if (val1 >= 90) return { status: 'optimal', title_ar: 'وظائف كلوية طبيعية (المرحلة 1)', title_en: 'Normal Kidney Function (Stage 1)', advice_ar: 'كفاءة ترشيح كبيبي ممتازة.', advice_en: 'Optimal glomerular filtration.' };
      if (val1 >= 60) return { status: 'normal', title_ar: 'انخفاض طفيف في وظائف الكلى (المرحلة 2)', title_en: 'Mild Decrease (Stage 2)', advice_ar: 'متابعة دورية مع شرب الماء الكافي وضبط الضغط والسكر.', advice_en: 'Regular monitoring; optimize blood pressure and glucose.' };
      if (val1 >= 30) return { status: 'warning', title_ar: 'قصور كلوي معتدل (المرحلة 3)', title_en: 'Moderate Renal Impairment (Stage 3)', advice_ar: 'ممنوع الجرعات العالية من الميتفورمين ويجب ضبط جرعات الأدوية بدقة.', advice_en: 'Dose adjustment required for Metformin, antibiotics, and other drugs.' };
      if (val1 >= 15) return { status: 'high', title_ar: 'قصور كلوي شديد (المرحلة 4)', title_en: 'Severe Impairment (Stage 4)', advice_ar: 'حظر كامل لمسكنات البروفين والفولتارين (NSAIDs) ومتابعة طبيب كلى دورياً.', advice_en: 'NSAIDs strictly contraindicated; close nephrology follow-up.' };
      return { status: 'critical', title_ar: 'فشل كلوي نهائي (المرحلة 5)', title_en: 'Kidney Failure (Stage 5)', advice_ar: 'مرحلة الغسيل الكلوي أو زراعة الكلى.', advice_en: 'Renal replacement therapy (dialysis or transplant) required.' };
    }

    // 11. Uric Acid
    if (evalMetric === 'uric_acid') {
      const maxNormal = evalGender === 'male' ? 7.2 : 6.0;
      if (val1 <= maxNormal) return { status: 'optimal', title_ar: 'حمض يوريك طبيعي', title_en: 'Normal Uric Acid', advice_ar: 'مستوى متوازن يقي من نوبات النقرس وتكون حصوات الكلى.', advice_en: 'Balanced level protecting from gout flares and urate stones.' };
      if (val1 <= 8.5) return { status: 'high', title_ar: 'ارتفاع حمض اليوريك (Hyperuricemia)', title_en: 'Hyperuricemia', advice_ar: 'قلل اللحوم الحمراء والبقوليات ومأكولات البحر واشرب 3 لترات ماء يومياً.', advice_en: 'Reduce red meat, purine-rich foods, and drink plenty of water.' };
      return { status: 'critical', title_ar: 'ارتفاع شديد في حمض اليوريك', title_en: 'Markedly Elevated Uric Acid', advice_ar: 'خطر مرتفع لنوبات نقرس حادة وحصوات بولية، راجع الطبيب لبدء علاج خافض لليوريك.', advice_en: 'High risk of acute gout flares and nephrolithiasis; consult doctor.' };
    }

    // 12. Potassium
    if (evalMetric === 'potassium') {
      if (val1 < 3.5) return { status: 'warning', title_ar: 'انخفاض بوتاسيوم الدم (Hypokalemia)', title_en: 'Hypokalemia (Low)', advice_ar: 'قد يسبب تقلصات عضلية وضعف؛ شائع مع مدرات البول مثل Lasix.', advice_en: 'Can cause muscle cramps and weakness; common with loop diuretics.' };
      if (val1 <= 5.0) return { status: 'optimal', title_ar: 'بوتاسيوم طبيعي ومثالي', title_en: 'Normal Potassium Balance', advice_ar: 'يحافظ على انتظام ضربات القلب وسلامة الإشارات العصبية.', advice_en: 'Critical for cardiac electrical stability.' };
      if (val1 <= 5.9) return { status: 'high', title_ar: 'ارتفاع بوتاسيوم الدم (Hyperkalemia)', title_en: 'Hyperkalemia (High)', advice_ar: 'حذر مع أدوية الضغط (ACEi/ARBs) ومكملات البوتاسيوم؛ راجع طبيبك.', advice_en: 'Caution with ACE-inhibitors, ARBs, and potassium supplements.' };
      return { status: 'critical', title_ar: 'ارتفاع بوتاسيوم حرج مهدد للحياة (≥ 6.0)', title_en: 'Critical Hyperkalemia (Emergency)', advice_ar: 'طوارئ طبية عاجلة لخطر توقف عضلة القلب فجأة؛ توجه للمستشفى فوراً.', advice_en: 'Emergency medical care needed due to immediate lethal arrhythmia risk.' };
    }

    // 13. Sodium
    if (evalMetric === 'sodium') {
      if (val1 < 135) return { status: 'warning', title_ar: 'نقص صوديوم الدم (Hyponatremia)', title_en: 'Hyponatremia', advice_ar: 'يسبب دوار وصداع وتشوش ذهني؛ قد ينتج عن الإفراط في الماء أو أدوية معينة.', advice_en: 'May cause nausea and confusion; check diuretic use.' };
      if (val1 <= 145) return { status: 'optimal', title_ar: 'صوديوم طبيعي ومثالي', title_en: 'Normal Sodium Level', advice_ar: 'توازن أسموزي ممتاز للخلايا والسوائل.', advice_en: 'Optimal extracellular fluid and electrolyte balance.' };
      return { status: 'warning', title_ar: 'ارتفاع صوديوم الدم (Hypernatremia)', title_en: 'Hypernatremia', advice_ar: 'دلالة على جفاف أو نقص شرب السوائل؛ احرص على ترطيب الجسم بالماء.', advice_en: 'Indicates dehydration or fluid deficit; rehydrate adequately.' };
    }

    // 14. Total Cholesterol
    if (evalMetric === 'cholesterol_total') {
      if (val1 < 200) return { status: 'optimal', title_ar: 'كوليسترول كلي مثالي ومرغوب', title_en: 'Desirable Cholesterol (< 200)', advice_ar: 'مستوى ممتاز يقلل من احتمالية أمراض القلب وتصلب الشرايين.', advice_en: 'Low cardiovascular atherogenic risk.' };
      if (val1 <= 239) return { status: 'warning', title_ar: 'حد مرتفع للكوليسترول (Borderline High)', title_en: 'Borderline High (200-239)', advice_ar: 'تعديل النظام الغذائي بالابتعاد عن الدهون المتحولة والمقليات وممارسة الرياضة.', advice_en: 'Adopt low saturated fat diet and 150 mins weekly aerobic exercise.' };
      return { status: 'high', title_ar: 'كوليسترول كلي مرتفع (High Risk)', title_en: 'High Total Cholesterol (≥ 240)', advice_ar: 'يستوجب تقييم عوامل الخطورة القلبية واحتمالية الحاجة لأدوية الستاتين.', advice_en: 'Higher coronary risk; clinical evaluation for statin therapy.' };
    }

    // 15. LDL Cholesterol
    if (evalMetric === 'ldl') {
      if (val1 < 100) return { status: 'optimal', title_ar: 'كوليسترول ضار مثالي للشخص السليم', title_en: 'Optimal LDL (< 100)', advice_ar: 'حماية ممتازة لجدران الشرايين التاجية والدماغية.', advice_en: 'Protects arterial endothelium from atheroma formation.' };
      if (val1 <= 129) return { status: 'normal', title_ar: 'قريب من المثالي', title_en: 'Near Optimal (100-129)', advice_ar: 'مقبول لغير المصابين بأمراض القلب أو السكري.', advice_en: 'Acceptable in individuals without vascular disease.' };
      if (val1 <= 159) return { status: 'warning', title_ar: 'حد مرتفع (Borderline High)', title_en: 'Borderline High (130-159)', advice_ar: 'ينصح بالحمية الغذائية وزيادة الألياف والنشاط البدني.', advice_en: 'Dietary fiber and lifestyle management indicated.' };
      if (val1 < 190) return { status: 'high', title_ar: 'كوليسترول ضار مرتفع', title_en: 'High LDL (160-189)', advice_ar: 'استشر الطبيب لتقييم الحاجة للعلاج الدوائي الخافض للدهون.', advice_en: 'Requires medical review for lipid-lowering pharmacotherapy.' };
      return { status: 'critical', title_ar: 'كوليسترول ضار مرتفع جداً (≥ 190)', title_en: 'Very High LDL (≥ 190)', advice_ar: 'يتطلب علاجاً بستاتين مكثف فوراً لوجود خطر وراثي وتصلب شرايين صريح.', advice_en: 'High-intensity statin therapy strongly indicated.' };
    }

    // 16. HDL Cholesterol
    if (evalMetric === 'hdl') {
      if (val1 >= 60) return { status: 'optimal', title_ar: 'كوليسترول نافع ممتاز (وقاية للقلب)', title_en: 'Optimal & Cardioprotective (≥ 60)', advice_ar: 'عامل حماية فسيولوجي فعال يكنس الدهون من الشرايين.', advice_en: 'Actively clears plaque and protects coronary vasculature.' };
      const minThreshold = evalGender === 'male' ? 40 : 50;
      if (val1 >= minThreshold) return { status: 'normal', title_ar: 'كوليسترول نافع مقبول', title_en: 'Acceptable HDL', advice_ar: 'مستوى جيد؛ يمكن رفعه أكثر بممارسة الرياضة وزيت الزيتون والمكسرات.', advice_en: 'Healthy; can be enhanced with aerobic fitness and healthy fats.' };
      return { status: 'warning', title_ar: 'كوليسترول نافع منخفض (عامل خطورة)', title_en: 'Low HDL (Cardiovascular Risk)', advice_ar: 'يزيد احتمالية أمراض القلب؛ تجنب التدخين، مارس المشي واستهلك أوميجا 3.', advice_en: 'Increases cardiovascular risk; quit smoking and exercise regularly.' };
    }

    // 17. Triglycerides
    if (evalMetric === 'triglycerides') {
      if (val1 < 150) return { status: 'optimal', title_ar: 'دهون ثلاثية طبيعية ومثالية', title_en: 'Normal Triglycerides (< 150)', advice_ar: 'مستوى صحي متوازن لتخزين طاقة الدهون.', advice_en: 'Normal metabolic clearance of dietary triglycerides.' };
      if (val1 <= 199) return { status: 'warning', title_ar: 'حد مرتفع للدهون الثلاثية', title_en: 'Borderline High (150-199)', advice_ar: 'قلل المشروبات السكرية والحلويات والنشويات المكررة ومارس الرياضة.', advice_en: 'Cut refined sugars, sodas, and carbohydrates.' };
      if (val1 < 500) return { status: 'high', title_ar: 'دهون ثلاثية مرتفعة', title_en: 'High Triglycerides (200-499)', advice_ar: 'ترتبط بمقاومة الإنسولين والكبد الدهني؛ استشر طبيبك لبدء خطة علاجية.', advice_en: 'Linked to insulin resistance and steatosis; review with doctor.' };
      return { status: 'critical', title_ar: 'ارتفاع شديد مهدد بالتهاب البنكرياس (≥ 500)', title_en: 'Severe Hypertriglyceridemia (≥ 500)', advice_ar: 'خطر حاد لالتهاب البنكرياس الحاد؛ يتطلب تدخلاً دوائياً عاجلاً (Fibrates).', advice_en: 'Acute pancreatitis danger; urgent medication therapy required.' };
    }

    // 18. ALT
    if (evalMetric === 'alt') {
      if (val1 <= 56) return { status: 'optimal', title_ar: 'إنزيم ALT طبيعي (سلامة خلايا الكبد)', title_en: 'Normal ALT (Healthy Liver)', advice_ar: 'خلايا الكبد تؤدي وظائفها دون علامات التهاب أو سمية.', advice_en: 'No evidence of hepatocellular damage.' };
      if (val1 <= 120) return { status: 'warning', title_ar: 'ارتفاع طفيف في إنزيم الكبد ALT', title_en: 'Mild Elevation (57-120)', advice_ar: 'شائع مع الكبد الدهني، الوزن الزائد، أو بعض الأدوية؛ راجع طبيبك.', advice_en: 'Common in fatty liver (NAFLD) or drug exposure; monitor.' };
      return { status: 'critical', title_ar: 'ارتفاع ملحوظ إلى حاد في إنزيم ALT', title_en: 'Significant Hepatotoxicity (> 120)', advice_ar: 'يستوجب فحص فوري لوظائف الكبد وإيقاف أي أدوية سامة للكبد تحت إشراف طبي.', advice_en: 'Urgent evaluation needed; hold suspected hepatotoxic medications.' };
    }

    // 19. AST
    if (evalMetric === 'ast') {
      if (val1 <= 40) return { status: 'optimal', title_ar: 'إنزيم AST طبيعي وسليم', title_en: 'Normal AST (10-40)', advice_ar: 'مستوى فسيولوجي سليم.', advice_en: 'Normal transaminase baseline.' };
      return { status: 'high', title_ar: 'ارتفاع إنزيم AST', title_en: 'Elevated AST (> 40)', advice_ar: 'قد ينتج عن إجهاد كبدي، عضلي، أو أدوية؛ يُفضل تقييمه بالتزامن مع ALT.', advice_en: 'May reflect liver or muscular origin; evaluate alongside ALT.' };
    }

    // 20. Bilirubin
    if (evalMetric === 'bilirubin') {
      if (val1 <= 1.2) return { status: 'optimal', title_ar: 'صفراء الدم طبيعية ومثالية', title_en: 'Normal Bilirubin (0.2-1.2)', advice_ar: 'تصريف سليم للمرارة وتكسير طبيعي لكرات الدم الحمراء.', advice_en: 'Adequate biliary excretion and RBC turnover.' };
      if (val1 <= 2.0) return { status: 'warning', title_ar: 'ارتفاع طفيف في البيليروبين', title_en: 'Mild Elevation (1.3-2.0)', advice_ar: 'قد يكون مرتبطاً بمتلازمة جيلبرت الحميدة أو إجهاد؛ يُتابع مع الطبيب.', advice_en: 'May be Gilbert syndrome or mild hemolysis; clinical follow-up.' };
      return { status: 'critical', title_ar: 'ارتفاع مسبب لصفار الجلد والعينين (يرقان)', title_en: 'Clinical Jaundice (> 2.0 mg/dL)', advice_ar: 'استشارة طبيب باطنة وجهاز هضمي فوراً لفحص القنوات المرارية وسبب اليرقان.', advice_en: 'Investigate biliary obstruction or acute hepatic disease immediately.' };
    }

    // 21. Hemoglobin
    if (evalMetric === 'hemoglobin') {
      const minNormal = evalGender === 'male' ? 13.5 : 12.0;
      const maxNormal = evalGender === 'male' ? 17.5 : 15.5;

      if (val1 < 7.0) return { status: 'critical', title_ar: 'أنيميا حرجة خطيرة (خطر هبوط تروية)', title_en: 'Critical Anemia (< 7.0 g/dL)', advice_ar: 'تستلزم نقل دم عاجل وطوارئ بالمستشفى لتفادي قصور عضلة القلب.', advice_en: 'Emergency transfusion threshold; seek ER immediately.' };
      if (val1 < 10.0) return { status: 'high', title_ar: 'أنيميا معتدلة إلى شديدة', title_en: 'Moderate to Severe Anemia', advice_ar: 'تتطلب فحص مخزون الحديد (Ferritin) وفيتامين B12 وبدء كورس علاجي مكثف.', advice_en: 'Investigate ferritin, vitamin B12, and begin iron therapy.' };
      if (val1 < minNormal) return { status: 'warning', title_ar: 'أنيميا خفيفة (فقر دم طفيف)', title_en: 'Mild Anemia', advice_ar: 'أكثر من الأغذية الغنية بالحديد وفيتامين C وتجنب شرب الشاي والقهوة مع الوجبات.', advice_en: 'Increase dietary iron and vitamin C; separate tea/coffee from meals.' };
      if (val1 <= maxNormal) return { status: 'optimal', title_ar: 'هيموجلوبين طبيعي ومثالي جداً', title_en: 'Normal & Healthy Hemoglobin', advice_ar: 'تروية دموية وأكسجين سليم لكافة أنسجة وأعضاء الجسم.', advice_en: 'Optimal oxygen-carrying capacity and red cell mass.' };
      return { status: 'warning', title_ar: 'ارتفاع الهيموجلوبين (زيادة كرات الدم الحمراء)', title_en: 'Elevated Hemoglobin (Polycythemia)', advice_ar: 'قد ينتج عن التدخين، الجفاف، أو العيش بالمرتفعات؛ يُنصح بشرب سوائل وافرة.', advice_en: 'Associated with dehydration, smoking, or polycythemia; hydrate well.' };
    }

    // 22. Platelets
    if (evalMetric === 'platelets') {
      if (val1 < 50000) return { status: 'critical', title_ar: 'نقص صفائح شديد (خطر نزيف عفوي)', title_en: 'Severe Thrombocytopenia (< 50,000)', advice_ar: 'حظر فوري وتام لمسيلات الدم والأسبرين والبروفين؛ توجه للمستشفى فوراً.', advice_en: 'Critical bleeding risk; immediately hold all anticoagulants and NSAIDs.' };
      if (val1 < 150000) return { status: 'warning', title_ar: 'نقص صفائح طفيف إلى معتدل', title_en: 'Mild Thrombocytopenia', advice_ar: 'يستوجب فحص الأدوية المتناولة وأسباب النقص مع طبيب باطنة/أمراض دم.', advice_en: 'Investigate medication causes and viral or immune factors.' };
      if (val1 <= 450000) return { status: 'optimal', title_ar: 'صفائح دموية طبيعية ومثالية', title_en: 'Normal Platelet Count', advice_ar: 'تخثر دم سليم ووقاية تامة من النزيف والتجلطات غير الطبيعية.', advice_en: 'Adequate hemostatic reserve.' };
      return { status: 'warning', title_ar: 'ارتفاع الصفائح الدموية (Thrombocytosis)', title_en: 'Thrombocytosis (> 450,000)', advice_ar: 'قد يكون تفاعلياً ناتجاً عن التهاب أو نقص حديد؛ راجع الطبيب للمتابعة.', advice_en: 'Often reactive to inflammation or iron deficiency; monitor.' };
    }

    return null;
  };

  const evalResult = getEvaluation();

  useEffect(() => {
    if (evalResult && evalResultRef.current) {
      setTimeout(() => {
        evalResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [evalResult?.title_en, evalResult?.title_ar]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'normal':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800';
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // Helper to check if current metric needs gender selection
  const needsGender = ['creatinine', 'uric_acid', 'hdl', 'hemoglobin'].includes(evalMetric);

  // Helper to get unit for current eval metric
  const getCurrentUnit = () => {
    switch (evalMetric) {
      case 'fasting_glucose':
      case 'postprandial_glucose':
      case 'random_glucose':
      case 'cholesterol_total':
      case 'ldl':
      case 'hdl':
      case 'triglycerides':
      case 'creatinine':
      case 'uric_acid':
      case 'bilirubin':
        return 'mg/dL';
      case 'hba1c':
      case 'oxygen_saturation':
        return '%';
      case 'blood_pressure':
        return 'mmHg';
      case 'heart_rate':
        return 'bpm';
      case 'body_temp':
        return '°C';
      case 'egfr':
        return 'mL/min';
      case 'potassium':
      case 'sodium':
        return 'mEq/L';
      case 'alt':
      case 'ast':
        return 'U/L';
      case 'hemoglobin':
        return 'g/dL';
      case 'platelets':
        return '/µL';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-3">
          <Stethoscope className="w-4 h-4" />
          <span>{isAr ? 'الدليل السريري المرجعي المعتمد' : 'Clinical Standard Reference Guide'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <HeartPulse className="h-10 w-10 text-primary-500" />
          <span>{isAr ? 'المقاييس والمراجع الحيوية والمخبرية' : 'Vital Signs & Biomarkers Reference'}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
          {isAr 
            ? 'مرجع سريري شامل للمعدلات الطبيعية، أهداف مرضى السكر والضغط والقلب والكلى، مع أداة تقييم فوري شاملة لـ 22 فحصاً ومؤشراً حيوياً لتوضيح دلالاتها الطبية بدقة.'
            : 'Comprehensive clinical reference for normal values, therapeutic goals for diabetes, hypertension, lipids, and renal function, plus an instant interactive evaluator for 22 vital biomarkers.'}
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl flex items-center gap-2 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab('reference')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'reference'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'جداول المراجع والمقاييس' : 'Reference Tables'}</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluator')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'evaluator'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{isAr ? 'فاحص ومُقيّم القراءات الفوري' : 'Instant Reading Evaluator'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'reference' ? (
        <div>
          {/* Categories and Search Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
                    selectedCategory === c.id
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-400'
                  }`}
                >
                  {isAr ? c.name_ar : c.name_en}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={isAr ? 'ابحث عن تحليل أو مؤشر...' : 'Search biomarker or test...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full text-sm pl-10 pr-10 py-2 rounded-xl"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMetrics.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 border-t-4 border-t-primary-500 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {isAr ? item.name_ar : item.name_en}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono font-medium text-gray-500">
                      {item.unit}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                    {isAr ? item.description_ar : item.description_en}
                  </p>

                  {/* Ranges Table */}
                  <div className="space-y-2 mb-4">
                    {item.ranges.map((r, idx) => (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 transition-all ${getStatusColor(r.status)}`}
                      >
                        <span className="font-semibold">
                          {isAr ? r.label_ar : r.label_en}
                        </span>
                        <span className="font-mono font-bold whitespace-nowrap">
                          {r.range}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footnotes if any */}
                {item.ranges.some(r => r.note_ar || r.note_en) && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
                    {item.ranges.filter(r => (isAr ? r.note_ar : r.note_en)).map((r, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-primary-500 shrink-0" />
                        <span><strong>{isAr ? r.label_ar : r.label_en}:</strong> {isAr ? r.note_ar : r.note_en}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredMetrics.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching biomarkers found'}</p>
            </div>
          )}
        </div>
      ) : (
        /* Evaluator Tab */
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-xl">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
              <Sliders className="w-5 h-5 text-primary-500" />
              <span>{isAr ? 'أدخل قراءتك للتقييم السريري الفوري' : 'Enter Reading for Instant Evaluation'}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {isAr 
                ? 'اختر أي فحص أو مؤشر حيوي من القائمة أدناه، واكتب نتيجتك لرؤية التوجيه الطبي المعتمد فوراً.'
                : 'Select any biomarker or clinical test below and enter your reading to receive instant clinical guidance.'}
            </p>

            <div className="space-y-4 mb-6">
              {/* Measurement Selector with Categories */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'نوع القياس أو التحليل (22 مؤشراً حيوياً متاحاً)' : 'Measurement or Lab Test (22 Biomarkers Available)'}
                </label>
                <select
                  value={evalMetric}
                  onChange={(e) => {
                    setEvalMetric(e.target.value);
                    setEvalValue1('');
                    setEvalValue2('');
                  }}
                  className="input-field w-full text-sm font-medium py-3 rounded-xl"
                >
                  {/* Glucose */}
                  <optgroup label={isAr ? '🩸 فحوصات السكر وضبط الجلوكوز' : '🩸 Blood Glucose & Diabetes'}>
                    <option value="fasting_glucose">{isAr ? 'سكر الدم الصائم (Fasting Glucose - mg/dL)' : 'Fasting Blood Glucose (mg/dL)'}</option>
                    <option value="postprandial_glucose">{isAr ? 'سكر فاطر بعد الأكل بساعتين (2-hr PPG - mg/dL)' : '2-Hour Postprandial Glucose (mg/dL)'}</option>
                    <option value="random_glucose">{isAr ? 'السكر العشوائي (Random Glucose - mg/dL)' : 'Random Blood Sugar (mg/dL)'}</option>
                    <option value="hba1c">{isAr ? 'السكر التراكمي (HbA1c - %)' : 'Glycated Hemoglobin (HbA1c %)'}</option>
                  </optgroup>

                  {/* Cardio & Vitals */}
                  <optgroup label={isAr ? '❤️ القلب والعلامات الحيوية' : '❤️ Cardiovascular & Vital Signs'}>
                    <option value="blood_pressure">{isAr ? 'ضغط الدم الشرياني (Blood Pressure - mmHg)' : 'Blood Pressure (Systolic / Diastolic)'}</option>
                    <option value="heart_rate">{isAr ? 'نبضات القلب أثناء الراحة (Pulse - bpm)' : 'Resting Heart Rate (bpm)'}</option>
                    <option value="oxygen_saturation">{isAr ? 'تشبع الأكسجين في الدم (SpO2 - %)' : 'Oxygen Saturation (SpO2 %)'}</option>
                    <option value="body_temp">{isAr ? 'درجة حرارة الجسم (Temperature - °C)' : 'Body Temperature (°C)'}</option>
                  </optgroup>

                  {/* Renal & Electrolytes */}
                  <optgroup label={isAr ? '💧 وظائف الكلى والأملاح' : '💧 Renal Function & Electrolytes'}>
                    <option value="creatinine">{isAr ? 'الكرياتينين في الدم (Serum Creatinine - mg/dL)' : 'Serum Creatinine (mg/dL)'}</option>
                    <option value="egfr">{isAr ? 'معدل الفلترة الكبيبية (eGFR - mL/min)' : 'Glomerular Filtration Rate eGFR (mL/min)'}</option>
                    <option value="uric_acid">{isAr ? 'حمض اليوريك / النقرس (Uric Acid - mg/dL)' : 'Serum Uric Acid (mg/dL)'}</option>
                    <option value="potassium">{isAr ? 'البوتاسيوم في الدم (Potassium K+ - mEq/L)' : 'Serum Potassium (mEq/L)'}</option>
                    <option value="sodium">{isAr ? 'الصوديوم في الدم (Sodium Na+ - mEq/L)' : 'Serum Sodium (mEq/L)'}</option>
                  </optgroup>

                  {/* Lipids */}
                  <optgroup label={isAr ? '🫀 دهون الدم والكوليسترول' : '🫀 Lipid Profile'}>
                    <option value="cholesterol_total">{isAr ? 'الكوليسترول الكلي (Total Cholesterol - mg/dL)' : 'Total Cholesterol (mg/dL)'}</option>
                    <option value="ldl">{isAr ? 'الكوليسترول الضار (LDL - mg/dL)' : 'LDL Cholesterol (mg/dL)'}</option>
                    <option value="hdl">{isAr ? 'الكوليسترول الجيد النافع (HDL - mg/dL)' : 'HDL Cholesterol (mg/dL)'}</option>
                    <option value="triglycerides">{isAr ? 'الدهون الثلاثية (Triglycerides - mg/dL)' : 'Serum Triglycerides (mg/dL)'}</option>
                  </optgroup>

                  {/* Liver */}
                  <optgroup label={isAr ? '🧪 وظائف الكبد والمرارة' : '🧪 Liver Function Enzymes'}>
                    <option value="alt">{isAr ? 'إنزيم الكبد (ALT / SGPT - U/L)' : 'Liver ALT / SGPT (U/L)'}</option>
                    <option value="ast">{isAr ? 'إنزيم الكبد (AST / SGOT - U/L)' : 'Liver AST / SGOT (U/L)'}</option>
                    <option value="bilirubin">{isAr ? 'الصفراء / البيليروبين الكلي (Bilirubin - mg/dL)' : 'Total Bilirubin (mg/dL)'}</option>
                  </optgroup>

                  {/* CBC */}
                  <optgroup label={isAr ? '🩸 صورة الدم الكاملة (CBC)' : '🩸 Complete Blood Count (CBC)'}>
                    <option value="hemoglobin">{isAr ? 'الهيموجلوبين / الأنيميا (Hemoglobin - g/dL)' : 'Hemoglobin Hb (g/dL)'}</option>
                    <option value="platelets">{isAr ? 'الصفائح الدموية (Platelets - /µL)' : 'Platelet Count (/µL)'}</option>
                  </optgroup>
                </select>
              </div>

              {/* Gender Selector if metric depends on sex */}
              {needsGender && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-500" />
                    <span>{isAr ? 'الجنس (تختلف المعدلات الطبيعية حسب الجنس):' : 'Sex (Normal values differ by sex):'}</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEvalGender('male')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        evalGender === 'male'
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {isAr ? '👨 ذكر (Male)' : '👨 Male'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvalGender('female')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        evalGender === 'female'
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {isAr ? '👩 أنثى (Female)' : '👩 Female'}
                    </button>
                  </div>
                </div>
              )}

              {/* Input Fields */}
              {evalMetric === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'الضغط الانقباضي (العالي - Systolic)' : 'Systolic (Top number)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="e.g. 120"
                        value={evalValue1}
                        onChange={(e) => setEvalValue1(e.target.value)}
                        className="input-field w-full text-base font-mono py-2.5 rounded-xl pl-14 rtl:pl-3 rtl:pr-14"
                      />
                      <span className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-xs font-bold text-gray-400">mmHg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'الضغط الانبساطي (الواطي - Diastolic)' : 'Diastolic (Bottom number)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={evalValue2}
                        onChange={(e) => setEvalValue2(e.target.value)}
                        className="input-field w-full text-base font-mono py-2.5 rounded-xl pl-14 rtl:pl-3 rtl:pr-14"
                      />
                      <span className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-xs font-bold text-gray-400">mmHg</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {isAr ? 'قيمة القراءة المسجلة' : 'Recorded Value'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={['hba1c', 'creatinine', 'uric_acid', 'potassium', 'bilirubin', 'hemoglobin', 'body_temp'].includes(evalMetric) ? '0.1' : '1'}
                      placeholder={
                        evalMetric === 'hba1c' ? 'e.g. 6.2' :
                        evalMetric === 'fasting_glucose' ? 'e.g. 95' :
                        evalMetric === 'body_temp' ? 'e.g. 37.0' :
                        evalMetric === 'creatinine' ? 'e.g. 0.9' :
                        evalMetric === 'potassium' ? 'e.g. 4.2' :
                        evalMetric === 'platelets' ? 'e.g. 250000' :
                        'e.g. 100'
                      }
                      value={evalValue1}
                      onChange={(e) => setEvalValue1(e.target.value)}
                      className="input-field w-full text-base font-mono py-2.5 rounded-xl pl-16 rtl:pl-3 rtl:pr-16"
                    />
                    <span className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-xs font-mono font-bold text-gray-400">
                      {getCurrentUnit()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Evaluation Result Card */}
            {evalResult ? (
              <motion.div
                ref={evalResultRef}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border-2 transition-all scroll-mt-24 ${getStatusColor(evalResult.status)}`}
              >
                <div className="flex items-center gap-2.5 font-bold text-base mb-2">
                  {evalResult.status === 'optimal' || evalResult.status === 'normal' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : evalResult.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <AlertOctagon className="w-5 h-5 text-rose-500" />
                  )}
                  <span>{isAr ? evalResult.title_ar : evalResult.title_en}</span>
                </div>

                <p className="text-sm font-medium leading-relaxed mb-3">
                  {isAr ? evalResult.advice_ar : evalResult.advice_en}
                </p>

                <div className="text-[11px] opacity-75 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? 'التقييم استرشادي سريري ولا يغني عن استشارة الطبيب المعالج.' : 'Clinical guideline advisory; not a substitute for formal diagnosis.'}</span>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-xs">
                {isAr ? 'أدخل القيمة في الخانة بالأعلى لرؤية التصنيف الطبي والإرشادات السريرية فوراً.' : 'Enter your value above to see immediate clinical classification & guidelines.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
    </svg>
  );
}
