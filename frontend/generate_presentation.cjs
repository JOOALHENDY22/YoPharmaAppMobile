const pptxgen = require('pptxgenjs');

async function createPresentation() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Youssef Mohamed';
  pptx.company = 'Egyptian Chinese University (ECU)';
  pptx.subject = 'YoPharma Full Clinical Platform Guide';
  pptx.title = 'YoPharma - Clinical Pharmacy Platform Complete Feature Guide';

  const TEAL_DARK = '0F766E';
  const TEAL_PRIMARY = '0D9488';
  const SLATE_DARK = '0F172A';
  const SLATE_MUTED = '64748B';
  const SLATE_BG = 'F8FAFC';
  const WHITE = 'FFFFFF';
  const RED = 'DC2626';

  function addHeader(slide, title, category = 'YoPharma | دليل واجهات ومميزات المنصة') {
    slide.background = { color: SLATE_BG };
    
    slide.addText(category.toUpperCase(), {
      x: 0.6,
      y: 0.35,
      w: 10,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: TEAL_PRIMARY,
      bold: true,
    });

    slide.addText(title, {
      x: 0.6,
      y: 0.6,
      w: 12,
      h: 0.55,
      fontSize: 18,
      fontFace: 'Arial',
      color: SLATE_DARK,
      bold: true,
    });

    slide.addShape(pptx.ShapeType.line, {
      x: 0.6,
      y: 1.2,
      w: 12.1,
      h: 0,
      line: { color: 'CBD5E1', width: 1.2 },
    });
  }

  function addFooter(slide) {
    slide.addText('كلية الصيدلة • الجامعة المصرية الصينية (ECU) | تطوير: يوسف محمد | YoPharma Clinical Suite', {
      x: 0.6,
      y: 7.05,
      w: 12.1,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: SLATE_MUTED,
      align: 'left',
    });
  }

  // Slide 1: Cover
  {
    const slide = pptx.addSlide();
    slide.background = { color: SLATE_DARK };

    slide.addText('ACADEMIC CLINICAL PHARMACY PLATFORM', {
      x: 1.0,
      y: 1.0,
      w: 10,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Arial',
      color: '5EEAD4',
      bold: true,
      letterSpacing: 2,
    });

    slide.addText('YoPharma — الشرح الشامل لواجهات ومميزات المنصة', {
      x: 1.0,
      y: 1.5,
      w: 11.3,
      h: 1.1,
      fontSize: 32,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    slide.addText('دليل تشريحي لكل خانة وواجهة في الموقع: المشكلة السريرية، طريقة الحل، وعناصر التحكم والأسهم', {
      x: 1.0,
      y: 2.6,
      w: 11.3,
      h: 0.8,
      fontSize: 15,
      fontFace: 'Arial',
      color: '94A3B8',
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 3.8,
      w: 11.3,
      h: 2.7,
      rectRadius: 0.12,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 },
    });

    slide.addText([
      { text: '🏥 الوحدات والواجهات المغطاة في هذا العرض:\n', options: { bold: true, color: '5EEAD4', fontSize: 13 } },
      { text: '1. الصفحة الرئيسية وشريط الأوامر السريع (Quick Clinical Command Bar)\n' },
      { text: '2. سلة الروشتة التفاعلية وفحص التداخلات الدوائية (Drug-Drug Matrix & Triage)\n' },
      { text: '3. تفاعلات الأغذية وتوقيت الجرعات والمشروبات الممنوعة (Food Timing & Dietary Precautions)\n' },
      { text: '4. دليل ومقيّم المقاييس الحيوية والتحاليل المخبرية (22 Clinical Biomarkers Evaluator)\n' },
      { text: '5. دليل البدائل والمثائل والأسعار في السوق المصري (Egyptian Drug Alternatives & Pricing)\n' },
      { text: '6. أمان الأمراض المزمنة وموانع الاستعمال (Chronic Disease Contraindications)\n' },
      { text: '7. مصفوفة المقارنة الدوائية المباشرة وجهاً لوجه (Side-by-Side Drug Comparison)' }
    ], {
      x: 1.3,
      y: 4.0,
      w: 10.7,
      h: 2.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: WHITE,
      lineSpacing: 17,
    });
  }

  // Section Generator Function
  const sections = [
    {
      num: '1',
      title: 'الواجهة الرئيسية وشريط البحث السريري السريع',
      problem: 'يستغرق الصيدلي وقتاً طويلاً في البحث بين مراجع ورقية أو مواقع مشتتة للوصول إلى دواء معين أثناء وجود المريض أمامه في الصيدلية أو العيادة.',
      solution: 'شريط بحث فوري متصل بكاش الذاكرة (< 1ms) مع اختصار لوحة المفاتيح (زر "/") وقائمة إكمال تلقائي فورية تشمل آلاف الأدوية بالاسم التجاري والمادة الفعالة مع بطاقات سريعة لأشهر أدوية السوق المصري.',
      diagramTitle: '🖥️ تشريح عناصر واجهة البحث الرئيسية (UI Breakdown):',
      callouts: [
        { label: '[1] شريط الإدخال الذكي ➔', text: 'يدعم البحث بالاسم التجاري (مثل Augmentin) أو العلمي (Amoxicillin) مع التركيز التلقائي بزر [/].', border: '0D9488' },
        { label: '[2] قائمة الإكمال التلقائي ➔', text: 'تظهر أثناء الكتابة بعد حرفين فقط وتتيح التنقل بأسهم الكيبورد واختيار الدواء فوراً.', border: '38BDF8' },
        { label: '[3] بطاقات الأدوية الشائعة ➔', text: 'أزرار وصول مباشر لأشهر 6 أدوية متداولة في مصر (Augmentin, Concor, Cataflam, Glucophage, Panadol, Cipro).', border: 'F59E0B' }
      ]
    },
    {
      num: '2',
      title: 'فاحص التفاعلات الدوائية المتبادلة (Drug-Drug Interactions)',
      problem: 'عندما يتناول المريض أكثر من دواء في نفس الوقت، قد يحدث تفاعل دوائي خطير يؤدي إلى فشل العلاج أو حدوث نزيف أو توقف للقلب دون أن يدرك المريض أو مقدم الرعاية.',
      solution: 'تقوم الواجهة بفحص كافة الأزواج المتقاطعة بين الأدوية، وتصنيف الخطورة بألوان صلبة (أحمر، برتقالي، أزرق)، مع كتابة آلية التفاعل الفارماكولوجية والتوصية السريرية العملية للصيدلي.',
      diagramTitle: '🖥️ تشريح عناصر واجهة فاحص التفاعلات (UI Breakdown):',
      callouts: [
        { label: '[1] شارات تصنيف الخطورة ➔', text: 'شارات ملونة (🔴 عالي الخطورة / 🟠 متوسط / 🔵 بسيط) لمعرفة مستوى الخطورة في ثانية واحدة.', border: 'DC2626' },
        { label: '[2] صندوق آلية التفاعل ➔', text: 'يوضح المسار الحيوي (مثل تثبيط إنزيمات الكبد CYP450 أو التنافس على بروتينات البلازما).', border: '38BDF8' },
        { label: '[3] التوصية السريرية العملية ➔', text: 'خطة التدخل: فصل الجرعات بساعتين، تعديل الجرعة للنصف، أو استبدال الدواء ببديل آمن.', border: '10B981' }
      ]
    },
    {
      num: '3',
      title: 'تفاعلات الأدوية مع الطعام وتوقيت الجرعات (Food Interactions)',
      problem: 'جهل المريض بمواعيد الدواء مع الأكل، أو تناوله مع أطعمة محظورة (كاللبن، الجريب فروت، الأطعمة الغنية بالبوتاسيوم)، مما يقلل فاعلية العلاج بنسبة تصل إلى 80% أو يسبب سمية مفاجئة.',
      solution: 'تقدم جدولاً زمنياً مرتباً لكل دواء (قبل الأكل، مع الأكل، بعد الأكل)، مع قائمة تفصيلية بالأطعمة والمشروبات المحظورة وشرح تأثيرها المباشر على الامتصاص.',
      diagramTitle: '🖥️ تشريح واجهة تفاعلات الطعام ومواعيد الوجبات (UI Breakdown):',
      callouts: [
        { label: '[1] شارة التوقيت الزمني الدقيق ➔', text: '(قبل الأكل بساعة / مع الأكل مباشرة / بعد الأكل بساعتين) مع إرشادات الامتصاص.', border: 'F59E0B' },
        { label: '[2] شبكة الأطعمة الممنوعة ➔', text: 'بطاقات تحذيرية حمراء تبرز الأغذية المتعارضة (منتجات الألبان، الكافيين، الجريب فروت).', border: 'DC2626' },
        { label: '[3] إرشادات التناول المبسطة ➔', text: 'نصوص إرشادية جاهزة يمكن للصيدلي قراءتها مباشرة للمريض عند صرف الروشتة.', border: '38BDF8' }
      ]
    },
    {
      num: '4',
      title: 'دليل المقاييس الحيوية والتحاليل المخبرية (22 Biomarkers)',
      problem: 'صعوبة حفظ النطاقات المرجعية الطبيعية لعشرات التحاليل المعقدة (مثل eGFR, HbA1c, INR, Creatinine)، والارتباك في تفسير حالة المريض هل هي طبيعية أم في مرحلة الخطر.',
      solution: 'مرجع سريري يضم 22 تحليلاً مقسمة لأربع مجموعات (قلب، سكر، كلى، كبد) ومزودة بمقيّم رقمي فوري: يكتب الصيدلي رقم التحليل فتظهر النتيجة السريرية واللون التشخيصي فوراً.',
      diagramTitle: '🖥️ تشريح واجهة دليل ومقيّم المقاييس الحيوية (UI Breakdown):',
      callouts: [
        { label: '[1] تصنيف الفئات السريرية ➔', text: 'تبويبات منظمة (Cardiovascular, Glycemic, Renal, Hepatic) لسهولة الوصول للتحليل.', border: '0D9488' },
        { label: '[2] حقل المقيّم الرقمي التفاعلي ➔', text: 'إدخال قيمة التحليل (مثل كتابة 1.8 في خانة الكرياتينين) لحساب الحالة والتقييم مباشرة.', border: '38BDF8' },
        { label: '[3] شارة التشخيص اللوني ➔', text: '(أخضر = طبيعي / أصفر = حذر / أحمر = خطر) مع الدلالة الطبية والتوصية السريرية.', border: '10B981' }
      ]
    },
    {
      num: '5',
      title: 'دليل البدائل والمثائل في السوق المصري (Egyptian Alternatives)',
      problem: 'نقص الأدوية المتكرر في الصيدليات المصرية، وارتفاع أسعار الأدوية المستوردة على المرضى محدودي الدخل، مع صعوبة حصر البدائل التجارية المتطابقة كيميائياً.',
      solution: 'تحلل الواجهة المادة الفعالة العلمية وتستخرج فوراً كافة البدائل المصرية المسجلة مع الشركات المصنعة وتصنيف الفئة السعرية (رخيص / متوسط / مرتفع) لتوفير خيارات مناسبة للجميع.',
      diagramTitle: '🖥️ تشريح واجهة دليل البدائل والأسعار في مصر (UI Breakdown):',
      callouts: [
        { label: '[1] بطاقة المادة الفعالة ➔', text: 'عرض الاسم العلمي المعتمد (Active Ingredient) لضمان التطابق العلاجي التام.', border: '0D9488' },
        { label: '[2] جدول البدائل والشركات ➔', text: 'قائمة واضحة تضم الأسماء التجارية المتاحة في السوق والشركات المرخصة.', border: '38BDF8' },
        { label: '[3] تصنيف الفئات السعرية ➔', text: 'شارات ملونة توضح الفئة السعرية (رخيص / متوسط / مرتفع) لاختيار البديل الاقتصادي.', border: 'F59E0B' }
      ]
    },
    {
      num: '6',
      title: 'أمان وموانع استعمال الأمراض المزمنة (Chronic Disease Safety)',
      problem: 'صرف أدوية شائعة (مثل المسكنات أو بعض المضادات) لمرضى الضغط أو السكري أو القصور الكلوي، مما يسبب تدهوراً حاداً في وظائف الكلى أو ارتفاع خطير في ضغط الدم.',
      solution: 'فاحص ذكي يقيم أمان الدواء مع 7 حالات مزمنة (الضغط، السكري، القصور الكلوي CKD، الكبد، قرحة المعدة، الربو، الحمل) ويصنفها (آمن / تحذير / ممنوع تماماً) مع معادلات ضبط الجرعة.',
      diagramTitle: '🖥️ تشريح واجهة أمان الأمراض المزمنة (UI Breakdown):',
      callouts: [
        { label: '[1] محدد الحالات المزمنة ➔', text: 'قائمة اختيار سريعة (Hypertension, Diabetes, CKD, Hepatic, Asthma, Pregnancy).', border: 'BE123C' },
        { label: '[2] بطاقة تقييم الأمان ➔', text: '(ممنوع تماماً Contraindicated / تحذير وتعديل جرعة Caution / آمن Safe).', border: 'DC2626' },
        { label: '[3] إرشادات الجرعات الكلوية ➔', text: 'تحديد النسب والحدود الآمنة لـ CrCl لتجنب تراكم الدواء وسميته في الجسم.', border: '10B981' }
      ]
    },
    {
      num: '7',
      title: 'مصفوفة المقارنة الدوائية السريرية المباشرة (Side-by-Side Comparison)',
      problem: 'الحيرة بين دوائين من نفس المجموعة الدوائية (مثل Concor vs Tenormin أو Augmentin vs Ciprofloxacin) وصعوبة تحديد الفروق الدقيقة في الجرعات والآثار الجانبية.',
      solution: 'مصفوفة مقارنة عمودية تضع الدواءين وجهاً لوجه في جدول سريري يقارن: المادة الفعالة، دواعي الاستعمال، الجرعات، الآثار الجانبية، مع خلاصة وتوصية سريرية لاختيار الأنسب.',
      diagramTitle: '🖥️ تشريح واجهة مصفوفة المقارنة المباشرة (UI Breakdown):',
      callouts: [
        { label: '[1] حقلا اختيار الدواءين ➔', text: 'إدخال الدواء (أ) والدواء (ب) مع اقتراحات الإكمال التلقائي الذكية.', border: '2563EB' },
        { label: '[2] جدول المقارنة العمودي ➔', text: 'مقارنة تفصيلية في المادة الفعالة، الاستخدامات، الآثار الجانبية، وموانع الاستعمال.', border: '38BDF8' },
        { label: '[3] التوصية السريرية النهائية ➔', text: 'خلاصة توضح متى يُفضل الدواء (أ) ومتى يُفضل الدواء (ب) وفق الحالة الصحية.', border: '10B981' }
      ]
    }
  ];

  sections.forEach((sec) => {
    const slide = pptx.addSlide();
    addHeader(slide, `${sec.num}. ${sec.title}`);

    // Left Column: Problem & Solution Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 4.8,
      h: 5.5,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide.addText('⚠️ المشكلة الواقعية:', {
      x: 0.8,
      y: 1.5,
      w: 4.4,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: RED,
    });

    slide.addText(sec.problem, {
      x: 0.8,
      y: 1.85,
      w: 4.4,
      h: 1.2,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 15,
    });

    slide.addText('✨ كيف تحل هذه الواجهة المشكلة؟', {
      x: 0.8,
      y: 3.15,
      w: 4.4,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: TEAL_DARK,
    });

    slide.addText(sec.solution, {
      x: 0.8,
      y: 3.5,
      w: 4.4,
      h: 1.5,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 15,
    });

    // Right Column: UI Mockup Diagram
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.6,
      y: 1.35,
      w: 7.1,
      h: 5.5,
      rectRadius: 0.1,
      fill: { color: '0F172A' },
      line: { color: '334155', width: 1 },
    });

    slide.addText(sec.diagramTitle, {
      x: 5.8,
      y: 1.5,
      w: 6.7,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: '5EEAD4',
    });

    sec.callouts.forEach((c, cIdx) => {
      const cy = 1.95 + cIdx * 1.15;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.8,
        y: cy,
        w: 6.7,
        h: 1.0,
        rectRadius: 0.08,
        fill: { color: '1E293B' },
        line: { color: c.border, width: 1.5 },
      });

      slide.addText([
        { text: c.label + ' ', options: { bold: true, color: '5EEAD4', fontSize: 10 } },
        { text: c.text, options: { color: WHITE, fontSize: 9.5 } }
      ], {
        x: 5.95,
        y: cy + 0.1,
        w: 6.4,
        h: 0.8,
        fontFace: 'Arial',
        lineSpacing: 14,
      });
    });

    addFooter(slide);
  });

  // Final Slide
  {
    const slide = pptx.addSlide();
    slide.background = { color: SLATE_DARK };

    slide.addText('خاتمة المشروع والأثر الأكاديمي', {
      x: 1.0,
      y: 0.8,
      w: 10,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: '5EEAD4',
      bold: true,
    });

    slide.addText('YoPharma — منظومة سريرية متكاملة لخدمة الصيدلة في مصر', {
      x: 1.0,
      y: 1.2,
      w: 11,
      h: 0.6,
      fontSize: 24,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    const sumCards = [
      {
        title: '🎓 تدريب سريري تفاعلي',
        desc: 'أداة تعليمية وتطبيقية لطلاب كليات الصيدلة أثناء التدريب الميداني والتحضير للامتحانات السريرية OSCE.',
      },
      {
        title: '🏥 دعم القرار بالصيدليات',
        desc: 'حماية المرضى من أخطاء التداخلات الدوائية ومواعيد الطعام واختيار البدائل الاقتصادية في ثوانٍ معدودة.',
      },
      {
        title: '⚡ أداء فائق واعتمادية',
        desc: 'كاش RAM تحت الملي ثانية، قاعدة بيانات دائمة، وتدوير ذكي لنماذج الذكاء الاصطناعي لمنع أي توقف.',
      },
    ];

    sumCards.forEach((sc, idx) => {
      const x = 1.0 + idx * 3.8;
      const y = 2.1;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 3.5,
        h: 3.2,
        rectRadius: 0.12,
        fill: { color: '1E293B' },
        line: { color: '334155', width: 1 },
      });

      slide.addText(sc.title, {
        x: x + 0.25,
        y: y + 0.3,
        w: 3.0,
        h: 0.6,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: '5EEAD4',
      });

      slide.addText(sc.desc, {
        x: x + 0.25,
        y: y + 1.0,
        w: 3.0,
        h: 1.9,
        fontSize: 11,
        fontFace: 'Arial',
        color: '94A3B8',
        lineSpacing: 18,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 5.6,
      w: 11.3,
      h: 1.1,
      rectRadius: 0.1,
      fill: { color: '134E4A' },
      line: { color: '0D9488', width: 1 },
    });

    slide.addText([
      { text: 'تطوير: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'يوسف محمد  |  ', options: { color: WHITE } },
      { text: 'المؤسسة الأكاديمية: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'كلية الصيدلة - الجامعة المصرية الصينية (ECU)  |  ', options: { color: WHITE } },
      { text: 'الدعم والتواصل: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'wa.me/qr/2ZQYXCK7REOIC1', options: { color: WHITE } }
    ], {
      x: 1.3,
      y: 5.8,
      w: 10.7,
      h: 0.7,
      fontSize: 12,
      fontFace: 'Arial',
      align: 'center',
    });
  }

  const outputPath = 'c:/Users/Lenovo/Downloads/Telegram Desktop/app/YoPharma_Clinical_Presentation.pptx';
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Updated Presentation created successfully at: ${outputPath}`);
}

createPresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
