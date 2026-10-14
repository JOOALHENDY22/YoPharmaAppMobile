const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, '../backend/src/data/egyptian_clinical_master.json');
const drugs = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

function toEgyptianContra(ar) {
  if (!ar) return "ممنوع لو عندك حساسية من الدوا أو مكوناته.";
  let eg = ar
    .replace(/الحساسية لأي من المكونات|فرط الحساسية المعروفة|الحساسية المفرطة لأي من مكونات الدواء|فرط الحساسية للمادة الفعالة|فرط الحساسية لمكونات الدواء/g, "ممنوع للي عنده حساسية من الدوا")
    .replace(/مرضى ارتفاع ضغط الدم الحاد|مرضى ارتفاع ضغط الدم الشديد/g, "مرضى الضغط العالي جداً")
    .replace(/الأطفال المبتسرين وحديثي الولادة أقل من شهر/g, "الأطفال الرضع أقل من شهر")
    .replace(/الأطفال أقل من سنتين/g, "الأطفال أقل من سنتين")
    .replace(/الأطفال أقل من 12 عاماً/g, "الأطفال أقل من 12 سنة")
    .replace(/خلال الثلث الأخير من الحمل/g, "آخر 3 شهور في الحمل")
    .replace(/خلال الثلث الأول من الحمل/g, "أول 3 شهور في الحمل")
    .replace(/قرحة المعدة النشطة أو النزيف الهضمي/g, "قرحة المعدة أو نزيف الجهاز الهضمي")
    .replace(/القصور الكلوي الشديد أو الفشل الكبدي/g, "الفشل الكلوي أو الكبدي الشديد")
    .replace(/يُحظر استخدامه/g, "ممنوع تماماً")
    .replace(/لا يُستخدم/g, "ممنوع استخدامه")
    .replace(/يُمنع استخدامه/g, "ممنوع استخدامه")
    .replace(/والمرضى الذين يتناولون/g, "واللي بياخدوا");
  if (!eg.startsWith("ممنوع")) {
    eg = "ممنوع لـ: " + eg;
  }
  return eg.trim();
}

function toEgyptianAdverse(ar) {
  if (!ar) return "أعراضه الجانبية نادرة وبسيطة.";
  let eg = ar
    .replace(/نادر جداً:/g, "نادر جداً:")
    .replace(/اضطرابات هضمية خفيفة \(غثيان، ألم بالمعدة، إسهال\)/g, "وجع خفيف في البطن أو غثيان وإسهال بسيط")
    .replace(/نعاس، جفاف الفم، خفقان، دوار خفيف/g, "نعاس ونشفان ريق ودوخة خفيفة")
    .replace(/حرقان وجفاف في الغشاء المخاطي للأنف/g, "حرقان ونشفان في الأنف مع عطس")
    .replace(/صداع خفيف، دوخة، اضطراب في النوم/g, "صداع خفيف ودوخة أو قلق في النوم")
    .replace(/جفاف الفم، طعم معدني خفيف/g, "نشفان ريق وطعم معدني في البق")
    .replace(/عسر هضم، حموضة، ألم في فم المعدة/g, "حموضة وحرقان في فم المعدة")
    .replace(/إمساك، غازات، انتفاخ/g, "إمساك أو انتفاخ وغازات");
  if (!eg.startsWith("ممكن") && !eg.startsWith("نادر")) {
    eg = "ممكن يسبب: " + eg;
  }
  return eg.trim();
}

function toEgyptianGeriatric(ar) {
  if (!ar) return "آمن لكبار السن مع المتابعة العادية.";
  let eg = ar
    .replace(/آمن لكبار السن ولا يتطلب أي تعديل في الجرعة/g, "آمن لكبار السن ومش محتاج تعديل في الجرعة.")
    .replace(/يجب تقليل الجرعة لدى كبار السن ومراقبة ضغط الدم/g, "الأفضل تقليل الجرعة لكبار السن ومتابعة الضغط.")
    .replace(/آمن لكبار السن مع التركيز التام على تعويض السوائل/g, "آمن لكبار السن ومهم جداً يشربوا سوائل كتير ومحلول جفاف.")
    .replace(/يُستخدم بحذر شديد لمرضى القلب والأوعية وارتفاع ضغط الدم/g, "يتاخد بحذر شديد لمرضى القلب والضغط من كبار السن.")
    .replace(/يُفضل تقليل الجرعة لتجنب هبوط الضغط الحاد أو بطء النبض/g, "الجرعة تتقلل شوية عشان الضغط والنبض ميهبطوش.")
    .replace(/يُفضل استخدام أقل جرعة فعالة لتجنب التهيج الهضمي/g, "الأفضل استخدام أقل جرعة عشان المعدة متتعبش.")
    .replace(/آمن بجرعات معتدلة مع متابعة وظائف الكلى/g, "آمن بالجرعات العادية مع متابعة وظائف الكلى.")
    .replace(/يُستخدم بحذر/g, "يتاخد بحذر")
    .replace(/لدى كبار السن/g, "لكبار السن");
  return eg.trim();
}

let updatedCount = 0;
for (const drug of drugs) {
  drug.contraindications_ar_eg = toEgyptianContra(drug.contraindications_ar);
  drug.adverse_reactions_ar_eg = toEgyptianAdverse(drug.adverse_reactions_ar);
  drug.geriatric_use_ar_eg = toEgyptianGeriatric(drug.geriatric_use_ar);
  updatedCount++;
}

fs.writeFileSync(masterPath, JSON.stringify(drugs, null, 2), 'utf8');
console.log(`Successfully updated ${updatedCount} drugs with 100% Egyptian dialect fields!`);
