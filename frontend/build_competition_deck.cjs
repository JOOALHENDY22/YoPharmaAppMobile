const pptxgen = require('pptxgenjs');

async function buildCompetitionDeck() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Team PharmaMind';
  pptx.company = 'Egyptian Chinese University (ECU)';
  pptx.subject = 'Pharmacy Innovation & AI Competition';
  pptx.title = 'YoPharma Drug Check - Competition Presentation';

  // High-Contrast Clinical Palette
  const TEAL_DARK = '0F766E';
  const TEAL_PRIMARY = '0D9488';
  const TEAL_LIGHT = 'F0FDFA';
  const TEAL_BORDER = '99F6E4';
  const SLATE_DARK = '0F172A';
  const SLATE_CARD = '1E293B';
  const SLATE_MUTED = '64748B';
  const SLATE_BG = 'F8FAFC';
  const WHITE = 'FFFFFF';
  const RED = 'DC2626';
  const RED_BG = 'FEF2F2';
  const AMBER = 'D97706';
  const AMBER_BG = 'FFFBEB';
  const BLUE = '2563EB';
  const BLUE_BG = 'EFF6FF';
  const EMERALD = '059669';
  const EMERALD_BG = 'ECFDF5';

  function addSlideHeader(slide, slideNum, title, category = 'YoPharma Drug Check | Team PharmaMind') {
    slide.background = { color: SLATE_BG };

    slide.addText(`SLIDE ${slideNum} • ${category.toUpperCase()}`, {
      x: 0.6,
      y: 0.35,
      w: 10,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: TEAL_PRIMARY,
      bold: true,
      letterSpacing: 1,
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

  function addSlideFooter(slide) {
    slide.addText('Team PharmaMind (يوسف محمد • نور عبدالمجيد • رنا ماهر • وفاء طه • نور جمال) | ECU Faculty of Pharmacy', {
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

  // SLIDE 1: COVER
  {
    const slide = pptx.addSlide();
    slide.background = { color: SLATE_DARK };

    slide.addText('FACULTY OF PHARMACY — EGYPTIAN CHINESE UNIVERSITY (ECU)', {
      x: 1.0,
      y: 0.8,
      w: 10,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: '5EEAD4',
      bold: true,
      letterSpacing: 2,
    });

    slide.addText('YoPharma Drug Check', {
      x: 1.0,
      y: 1.2,
      w: 11.3,
      h: 1.1,
      fontSize: 42,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    slide.addText('"Search it. Understand it. Compare it. Check it."', {
      x: 1.0,
      y: 2.3,
      w: 11.3,
      h: 0.5,
      fontSize: 18,
      fontFace: 'Arial',
      color: '99F6E4',
      italic: true,
    });

    slide.addText('Evidence-Based Clinical Pharmacy Decision Support Platform\nالمرجع الصيدلاني السريري الذكي لفحص الروشتات، التداخلات، والبدائل في مصر', {
      x: 1.0,
      y: 2.85,
      w: 11.3,
      h: 0.8,
      fontSize: 13,
      fontFace: 'Arial',
      color: '94A3B8',
      lineSpacing: 18,
    });

    const coverBoxes = [
      { label: 'Team', val: 'PharmaMind' },
      { label: 'Track', val: 'Pharmacy Innovation & AI' },
      { label: 'Institution', val: 'Faculty of Pharmacy • ECU' },
    ];

    coverBoxes.forEach((b, idx) => {
      const x = 1.0 + idx * 3.8;
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 3.8,
        w: 3.6,
        h: 1.2,
        rectRadius: 0.1,
        fill: { color: SLATE_CARD },
        line: { color: '334155', width: 1 },
      });

      slide.addText(b.label.toUpperCase(), {
        x: x + 0.25,
        y: 3.95,
        w: 3.1,
        h: 0.25,
        fontSize: 9,
        fontFace: 'Arial',
        color: '5EEAD4',
        bold: true,
      });

      slide.addText(b.val, {
        x: x + 0.25,
        y: 4.25,
        w: 3.1,
        h: 0.6,
        fontSize: 12,
        fontFace: 'Arial',
        color: WHITE,
        bold: true,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 5.3,
      w: 11.2,
      h: 1.4,
      rectRadius: 0.1,
      fill: { color: '134E4A' },
      line: { color: TEAL_PRIMARY, width: 1 },
    });

    slide.addText([
      { text: 'Core Platform Capabilities: ', options: { bold: true, color: '5EEAD4', fontSize: 11 } },
      { text: 'Unified Multi-Drug Triage  •  Food-Drug Timing Schedules  •  22 Clinical Biomarkers Evaluator  •  Egyptian Generic Equivalents Directory  •  Chronic Disease Contraindications  •  Multi-Model AI Failover Architecture', options: { color: WHITE, fontSize: 10.5 } }
    ], {
      x: 1.3,
      y: 5.5,
      w: 10.6,
      h: 1.0,
      fontFace: 'Arial',
      lineSpacing: 18,
    });
  }

  // SLIDE 2: THE REAL PROBLEM
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '2', 'The Real Problem: Fragmented Clinical Information');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 4.8,
      h: 5.5,
      rectRadius: 0.12,
      fill: { color: RED_BG },
      line: { color: 'FECACA', width: 1.5 },
    });

    slide.addText('⚠️  The Clinical Reality in Pharmacy', {
      x: 0.85,
      y: 1.55,
      w: 4.3,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: RED,
    });

    slide.addText([
      { text: 'A pharmacist evaluating a prescription must assess 6 crucial dimensions for every patient:\n\n', options: { bold: true, fontSize: 11 } },
      { text: '1. Multi-Drug Regimens (3–6 drugs per Rx)\n' },
      { text: '2. Drug-Drug Cross Interactions\n' },
      { text: '3. Meal Timing & Food Restrictions\n' },
      { text: '4. Comorbidity & Disease Precautions\n' },
      { text: '5. Dosage & Organ Impairment Adjustments\n' },
      { text: '6. Egyptian Market Generic Alternatives\n\n' },
      { text: 'THE CORE PROBLEM:\n', options: { bold: true, color: RED } },
      { text: 'Information is scattered across 5+ disconnected reference books, foreign websites, and separate price lists — making prescription review slow, error-prone, and overwhelming.' }
    ], {
      x: 0.85,
      y: 1.95,
      w: 4.3,
      h: 4.6,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 16,
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.6,
      y: 1.35,
      w: 7.1,
      h: 5.5,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide.addText('Disjointed Clinical Workflow: Jumping Between Screens', {
      x: 5.85,
      y: 1.55,
      w: 6.6,
      h: 0.3,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: SLATE_DARK,
    });

    const fragCards = [
      { title: '🖥️ Screen 1: Foreign Interaction Site', desc: 'Checks US drug names only; misses Egyptian brand names and local formulations.', color: AMBER, bg: AMBER_BG, border: 'FDE68A' },
      { title: '📖 Screen 2: PDF Dosage Reference', desc: 'Slow manual lookups for renal (CrCl) & hepatic impairment cutoff values.', color: BLUE, bg: BLUE_BG, border: 'BFDBFE' },
      { title: '📑 Screen 3: Egyptian Price Index', desc: 'Separated lists for trade names with no clinical interaction context.', color: TEAL_DARK, bg: TEAL_LIGHT, border: TEAL_BORDER },
      { title: '❓ Result: High Cognitive Load', desc: 'Pharmacist spends 5–10 minutes per patient; high risk of missing subtle interactions.', color: RED, bg: RED_BG, border: 'FECACA' },
    ];

    fragCards.forEach((c, idx) => {
      const cy = 2.0 + idx * 1.15;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.85,
        y: cy,
        w: 6.6,
        h: 1.0,
        rectRadius: 0.08,
        fill: { color: c.bg },
        line: { color: c.border, width: 1 },
      });

      slide.addText(c.title, {
        x: 6.0,
        y: cy + 0.1,
        w: 6.3,
        h: 0.25,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: c.color,
      });

      slide.addText(c.desc, {
        x: 6.0,
        y: cy + 0.38,
        w: 6.3,
        h: 0.55,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: SLATE_DARK,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 3: WHY CURRENT WORKFLOW IS NOT IDEAL
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '3', 'The Traditional 8-Step Fragmented Workflow');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.1,
      h: 5.5,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide.addText('Traditional Manual Prescription Audit (Time Lost: 6–10 Minutes per Patient):', {
      x: 0.9,
      y: 1.55,
      w: 11.5,
      h: 0.3,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: RED,
    });

    const steps = [
      { step: '1', title: 'Prescription\nReceived', desc: '3–5 drugs prescribed' },
      { step: '2', title: 'Search Drug 1\non Source A', desc: 'Check indication & dose' },
      { step: '3', title: 'Search Drug 2\non Source B', desc: 'Inspect contraindications' },
      { step: '4', title: 'Cross Check\nInteraction', desc: 'Look up cross-reaction' },
      { step: '5', title: 'Search Food\nPrecautions', desc: 'Meal timing instructions' },
      { step: '6', title: 'Check Disease\nSafety', desc: 'CKD / HTN / Liver check' },
      { step: '7', title: 'Find Egyptian\nAlternatives', desc: 'Search missing generics' },
      { step: '8', title: 'Clinical\nDecision', desc: 'Final advice to patient' },
    ];

    steps.forEach((st, idx) => {
      const x = 0.9 + idx * 1.44;
      const y = 2.1;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 1.35,
        h: 2.2,
        rectRadius: 0.08,
        fill: { color: idx === 7 ? 'ECFDF5' : 'F8FAFC' },
        line: { color: idx === 7 ? '10B981' : 'CBD5E1', width: 1.2 },
      });

      slide.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.47,
        y: y + 0.15,
        w: 0.4,
        h: 0.4,
        fill: { color: idx === 7 ? EMERALD : TEAL_DARK },
        line: { color: WHITE, width: 1 },
      });

      slide.addText(st.step, {
        x: x + 0.47,
        y: y + 0.17,
        w: 0.4,
        h: 0.35,
        fontSize: 10,
        fontFace: 'Arial',
        color: WHITE,
        bold: true,
        align: 'center',
      });

      slide.addText(st.title, {
        x: x + 0.08,
        y: y + 0.65,
        w: 1.2,
        h: 0.65,
        fontSize: 9.5,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_DARK,
        align: 'center',
      });

      slide.addText(st.desc, {
        x: x + 0.08,
        y: y + 1.35,
        w: 1.2,
        h: 0.7,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: SLATE_MUTED,
        align: 'center',
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.9,
      y: 4.6,
      w: 11.5,
      h: 1.9,
      rectRadius: 0.1,
      fill: { color: 'FEF2F2' },
      line: { color: 'FECACA', width: 1 },
    });

    slide.addText([
      { text: '🚨  Critical Consequences of the Fragmented Workflow:\n', options: { bold: true, color: RED, fontSize: 11 } },
      { text: '• Severe Time Penalty: ', options: { bold: true } },
      { text: 'Pharmacists in busy community dispensaries lack 10 minutes per prescription, forcing rushed decisions.\n' },
      { text: '• Dangerous Blind Spots: ', options: { bold: true } },
      { text: 'Food interactions (e.g. dairy chelation) and subtle chronic contraindications are often skipped.\n' },
      { text: '• Economic Friction: ', options: { bold: true } },
      { text: 'Patients leave when a brand is out of stock because finding registered Egyptian alternatives is too slow.' }
    ], {
      x: 1.1,
      y: 4.75,
      w: 11.1,
      h: 1.6,
      fontSize: 10,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 16,
    });

    addSlideFooter(slide);
  }

  // SLIDE 4: OUR SOLUTION
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '4', 'Our Solution: YoPharma Drug Check');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.1,
      h: 1.3,
      rectRadius: 0.1,
      fill: { color: '134E4A' },
      line: { color: TEAL_PRIMARY, width: 1.5 },
    });

    slide.addText('"One unified platform to explore the medication, understand its risks,\ncompare alternatives, and check the complete regimen in seconds."', {
      x: 0.9,
      y: 1.5,
      w: 11.5,
      h: 1.0,
      fontSize: 15,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
      italic: true,
      align: 'center',
      lineSpacing: 22,
    });

    const solPillars = [
      {
        tag: 'EXPLORE',
        title: 'Instant Medication Lookup',
        desc: 'Search by Egyptian Trade name or active ingredient. Instant autocomplete with sub-millisecond RAM response.',
        color: TEAL_DARK,
        bg: TEAL_LIGHT,
        border: TEAL_BORDER,
      },
      {
        tag: 'UNDERSTAND',
        title: 'Clear Pharmacological Risks',
        desc: 'Explains pharmacokinetic & pharmacodynamic mechanisms with solid color-coded severity triage (🔴/🟠/🔵).',
        color: BLUE,
        bg: BLUE_BG,
        border: 'BFDBFE',
      },
      {
        tag: 'COMPARE',
        title: 'Egyptian Generic Equivalents',
        desc: 'Direct chemical matching across Egyptian brands with verified manufacturers and 3-tier price categorization.',
        color: AMBER,
        bg: AMBER_BG,
        border: 'FDE68A',
      },
      {
        tag: 'CHECK',
        title: 'Multi-Drug Regimen Triage',
        desc: 'Evaluate 2 to 10+ medications simultaneously for cross-interactions, meal timing, and comorbidity safety.',
        color: EMERALD,
        bg: EMERALD_BG,
        border: 'A7F3D0',
      },
    ];

    solPillars.forEach((p, idx) => {
      const x = 0.6 + idx * 3.1;
      const y = 2.85;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 2.9,
        h: 4.0,
        rectRadius: 0.1,
        fill: { color: p.bg },
        line: { color: p.border, width: 1.2 },
      });

      slide.addText(p.tag, {
        x: x + 0.2,
        y: y + 0.25,
        w: 2.5,
        h: 0.25,
        fontSize: 9.5,
        fontFace: 'Arial',
        bold: true,
        color: p.color,
        letterSpacing: 1,
      });

      slide.addText(p.title, {
        x: x + 0.2,
        y: y + 0.55,
        w: 2.5,
        h: 0.65,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_DARK,
      });

      slide.addText(p.desc, {
        x: x + 0.2,
        y: y + 1.25,
        w: 2.5,
        h: 2.5,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: SLATE_MUTED,
        lineSpacing: 16,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 5: HOW DRUG CHECK WORKS
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '5', 'How Drug Check Works: 5-Step Streamlined Workflow');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.1,
      h: 5.5,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
    });

    const workflow = [
      { num: '01', title: 'Search & Add', desc: 'Type Egyptian trade name or generic INN with "/" shortcut. Instant suggestion dropdown.', badge: 'Input Phase' },
      { num: '02', title: 'Build Regimen Tray', desc: 'Medications are organized in an active prescription queue with one-click removal and dosage forms.', badge: 'Prescription Queue' },
      { num: '03', title: 'Set Patient Comorbidities', desc: 'Select chronic conditions: Hypertension, Type 2 Diabetes, CKD, Hepatic, Asthma, Pregnancy.', badge: 'Patient Profile' },
      { num: '04', title: 'Unified Clinical Triage', desc: 'Engine simultaneously analyzes Drug-Drug, Food Timing, Chronic contraindications, and Alternatives.', badge: 'AI & RAM Engine' },
      { num: '05', title: 'Actionable Guidance', desc: 'Pharmacist gets color-coded severity (🔴/🟠/🔵), mechanism explanation, and spacing recommendations.', badge: 'Clinical Output' },
    ];

    workflow.forEach((wf, idx) => {
      const x = 0.85 + idx * 2.36;
      const y = 1.7;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 2.2,
        h: 4.8,
        rectRadius: 0.1,
        fill: { color: 'F8FAFC' },
        line: { color: idx === 3 ? TEAL_PRIMARY : 'CBD5E1', width: idx === 3 ? 2 : 1 },
      });

      slide.addText(wf.num, {
        x: x + 0.15,
        y: y + 0.2,
        w: 1.9,
        h: 0.45,
        fontSize: 22,
        fontFace: 'Arial',
        bold: true,
        color: TEAL_PRIMARY,
      });

      slide.addText(wf.badge.toUpperCase(), {
        x: x + 0.15,
        y: y + 0.75,
        w: 1.9,
        h: 0.25,
        fontSize: 8,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_MUTED,
      });

      slide.addText(wf.title, {
        x: x + 0.15,
        y: y + 1.05,
        w: 1.9,
        h: 0.6,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_DARK,
      });

      slide.addText(wf.desc, {
        x: x + 0.15,
        y: y + 1.75,
        w: 1.9,
        h: 2.8,
        fontSize: 10,
        fontFace: 'Arial',
        color: SLATE_MUTED,
        lineSpacing: 16,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 6: THE CLINICAL WORKBENCH
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '6', 'The Clinical Workbench: Single-Screen Command Center');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 4.4,
      h: 5.5,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide.addText('🎯  Single-Screen Productivity', {
      x: 0.85,
      y: 1.55,
      w: 3.9,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: TEAL_DARK,
    });

    slide.addText([
      { text: 'Traditional tools force pharmacists to click between tabs and reload pages.\n\n', options: { fontSize: 10.5 } },
      { text: 'The YoPharma Clinical Workbench brings the ENTIRE workflow into a unified dual-pane screen:\n\n', options: { bold: true, fontSize: 10.5 } },
      { text: '• Active Prescription Tray on the Left\n' },
      { text: '• Real-Time Triage Matrix on the Right\n' },
      { text: '• Instant Monograph Inspector Drawer\n' },
      { text: '• In-place Egyptian Generic Selector\n\n' },
      { text: 'Result: Zero page switching, zero lost context, and instantaneous triage updates.', options: { bold: true, color: TEAL_PRIMARY } }
    ], {
      x: 0.85,
      y: 1.95,
      w: 3.9,
      h: 4.6,
      fontSize: 10,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 15,
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.2,
      y: 1.35,
      w: 7.5,
      h: 5.5,
      rectRadius: 0.1,
      fill: { color: '0F172A' },
      line: { color: '334155', width: 1 },
    });

    slide.addText('🖥️  Workbench UI Callout Map (Annotated Zones):', {
      x: 5.45,
      y: 1.5,
      w: 7.0,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: '5EEAD4',
    });

    const callouts = [
      { zone: '[1] Command Search Bar', desc: 'Type brand / INN or press [/] hotkey. Real-time autocomplete suggestions.', border: '0D9488' },
      { zone: '[2] Prescription Tray', desc: 'Active drug list with quantity badge, dosage form, and one-click remove [✕].', border: '38BDF8' },
      { zone: '[3] Comorbidity Selector', desc: 'Checkboxes for Hypertension, Type 2 Diabetes, CKD, Hepatic, Asthma, Pregnancy.', border: 'BE123C' },
      { zone: '[4] Drug-Drug Matrix', desc: 'Color-coded severity cards (🔴 High / 🟠 Mod / 🔵 Minor) with clinical management.', border: 'DC2626' },
      { zone: '[5] Food & Meal Schedule', desc: 'Chronological timeline (Empty stomach vs with food) + Prohibited food warnings.', border: 'F59E0B' },
      { zone: '[6] Egyptian Alternatives', desc: 'Direct equivalent brand table with manufacturers and economy/premium pricing.', border: '10B981' },
    ];

    callouts.forEach((co, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 5.45 + col * 3.55;
      const y = 1.95 + row * 1.55;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 3.4,
        h: 1.4,
        rectRadius: 0.08,
        fill: { color: '1E293B' },
        line: { color: co.border, width: 1.5 },
      });

      slide.addText(co.zone, {
        x: x + 0.15,
        y: y + 0.12,
        w: 3.1,
        h: 0.25,
        fontSize: 10.5,
        fontFace: 'Arial',
        bold: true,
        color: '5EEAD4',
      });

      slide.addText(co.desc, {
        x: x + 0.15,
        y: y + 0.38,
        w: 3.1,
        h: 0.95,
        fontSize: 9,
        fontFace: 'Arial',
        color: WHITE,
        lineSpacing: 13,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 7: FEATURE DEEP DIVE
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '7', 'Feature Deep Dive: 6 Core Clinical Modules');

    const modules = [
      { icon: '🔴', title: 'Drug-Drug Checker', points: '• Cross-interaction matrix\n• CYP450 enzyme pathways\n• Pharmacokinetic triage\n• Actionable spacing guidance', color: RED, bg: RED_BG },
      { icon: '🍽️', title: 'Food & Meal Timing', points: '• Meal schedule (pre/post food)\n• Dairy & calcium chelation\n• Grapefruit CYP3A4 alerts\n• Potassium rich food warnings', color: AMBER, bg: AMBER_BG },
      { icon: '🫀', title: '22 Biomarkers & Vitals', points: '• 22 lab tests (eGFR, INR, HbA1c)\n• Interactive digital evaluator\n• Normal range comparison\n• Instant clinical diagnosis', color: TEAL_DARK, bg: TEAL_LIGHT },
      { icon: '🇪🇬', title: 'Egyptian Alternatives', points: '• Chemical INN matching\n• Local pharma manufacturers\n• 3-tier price categorization\n• Verified market availability', color: EMERALD, bg: EMERALD_BG },
      { icon: '🛡️', title: 'Chronic Disease Safety', points: '• HTN, Diabetes, CKD, Liver, Asthma\n• Contraindication classification\n• Renal dose adjustment (CrCl)\n• Pregnancy/lactation safety', color: 'BE123C', bg: 'FFF1F2' },
      { icon: '⚖️', title: 'Side-by-Side Matrix', points: '• Direct head-to-head compare\n• Ingredients & dosage forms\n• Adverse reaction profiles\n• Clinical preference verdict', color: BLUE, bg: BLUE_BG },
    ];

    modules.forEach((m, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.6 + col * 4.1;
      const y = 1.35 + row * 2.75;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 3.9,
        h: 2.55,
        rectRadius: 0.1,
        fill: { color: m.bg },
        line: { color: 'CBD5E1', width: 1 },
      });

      slide.addText(`${m.icon}  ${m.title}`, {
        x: x + 0.2,
        y: y + 0.2,
        w: 3.5,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: m.color,
      });

      slide.addText(m.points, {
        x: x + 0.2,
        y: y + 0.6,
        w: 3.5,
        h: 1.8,
        fontSize: 10,
        fontFace: 'Arial',
        color: SLATE_DARK,
        lineSpacing: 17,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 8: REAL CLINICAL EXAMPLE
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '8', 'Real Clinical Example: Multi-Drug Patient Case');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 4.4,
      h: 5.5,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide.addText('📋  Patient Prescription Case', {
      x: 0.85,
      y: 1.55,
      w: 3.9,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: TEAL_DARK,
    });

    slide.addText([
      { text: 'Patient Profile: ', options: { bold: true } },
      { text: '62-year-old male\n' },
      { text: 'Comorbidities: ', options: { bold: true } },
      { text: 'Hypertension + CKD (Stage 3, eGFR = 38 mL/min)\n\n' },
      { text: 'Prescription Regimen:\n', options: { bold: true } },
      { text: '1. Ciprofloxacin 500mg Tablets\n' },
      { text: '2. Antinal 200mg Capsules\n' },
      { text: '3. Concor 5mg Tablets\n\n' },
      { text: 'What YoPharma Detects Instantly:\n', options: { bold: true, color: TEAL_PRIMARY } },
      { text: 'The engine evaluates Drug-Drug, Food, and Chronic risks simultaneously in < 1 second.' }
    ], {
      x: 0.85,
      y: 1.95,
      w: 3.9,
      h: 4.6,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 16,
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.2,
      y: 1.35,
      w: 7.5,
      h: 5.5,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide.addText('🔍  Automated Triage Output & Action Plan:', {
      x: 5.45,
      y: 1.55,
      w: 7.0,
      h: 0.3,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: SLATE_DARK,
    });

    const findings = [
      {
        badge: '🔴 HIGH RISK DRUG-DRUG INTERACTION',
        title: 'Ciprofloxacin ↔ Antinal (Nifuroxazide)',
        desc: 'Mechanism: Intestinal chelation and altered flora absorption.\nManagement: Separate administration times by at least 2 hours to prevent antibiotic treatment failure.',
        color: RED,
        bg: RED_BG,
        border: 'FECACA',
      },
      {
        badge: '🍽️ DIETARY RESTRICTION ALERT',
        title: 'Ciprofloxacin + Dairy / Calcium Products',
        desc: 'Mechanism: Calcium ions bind fluoroquinolones in the gut, reducing bio-availability by up to 75%.\nManagement: Instruct patient to take on empty stomach (1h before or 2h after dairy).',
        color: AMBER,
        bg: AMBER_BG,
        border: 'FDE68A',
      },
      {
        badge: '🛡️ CHRONIC RENAL CONTRAINDICATION',
        title: 'Ciprofloxacin in Chronic Kidney Disease (CKD Stage 3)',
        desc: 'Mechanism: Renal clearance reduced; risk of central nervous system toxicity and QT prolongation.\nManagement: Reduce dose by 50% (250mg q12h) or monitor serum creatinine closely.',
        color: 'BE123C',
        bg: 'FFF1F2',
        border: 'FECDD3',
      },
    ];

    findings.forEach((f, idx) => {
      const cy = 2.0 + idx * 1.55;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.45,
        y: cy,
        w: 7.0,
        h: 1.4,
        rectRadius: 0.08,
        fill: { color: f.bg },
        line: { color: f.border, width: 1.2 },
      });

      slide.addText(f.badge, {
        x: 5.65,
        y: cy + 0.12,
        w: 6.6,
        h: 0.22,
        fontSize: 8.5,
        fontFace: 'Arial',
        bold: true,
        color: f.color,
      });

      slide.addText(f.title, {
        x: 5.65,
        y: cy + 0.35,
        w: 6.6,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_DARK,
      });

      slide.addText(f.desc, {
        x: 5.65,
        y: cy + 0.65,
        w: 6.6,
        h: 0.68,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: SLATE_DARK,
        lineSpacing: 14,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 9: EGYPTIAN PHARMACY VALUE
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '9', 'Egyptian Pharmacy Value Proposition');

    const egPillars = [
      { num: '01', title: 'Local Trade Name Recognition', desc: 'Foreign clinical checkers only know generic US names. YoPharma indexes over 15,000 Egyptian registered brands (e.g. Concor, Cataflam, Antinal, Hibiotic, Curam).' },
      { num: '02', title: 'Generic Alternatives in Shortages', desc: 'When an imported drug is unavailable, YoPharma identifies equivalent Egyptian manufactured brands sharing the exact chemical INN.' },
      { num: '03', title: '3-Tier Economic Transparency', desc: 'Categorizes equivalents into Economy (رخيص), Moderate (متوسط), and Premium (مرتفع) to help pharmacists support patients with financial constraints.' },
      { num: '04', title: 'Bilingual Clinical Alignment (AR/EN)', desc: 'Clinical mechanisms in English for doctor/pharmacist alignment; patient counseling instructions in clear Arabic for dispensing counters.' },
    ];

    egPillars.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.6 + col * 6.1;
      const y = 1.35 + row * 2.75;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 5.9,
        h: 2.55,
        rectRadius: 0.1,
        fill: { color: WHITE },
        line: { color: 'CBD5E1', width: 1 },
      });

      slide.addText(p.num, {
        x: x + 0.25,
        y: y + 0.2,
        w: 1.0,
        h: 0.35,
        fontSize: 18,
        fontFace: 'Arial',
        bold: true,
        color: TEAL_PRIMARY,
      });

      slide.addText(p.title, {
        x: x + 0.25,
        y: y + 0.6,
        w: 5.4,
        h: 0.45,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_DARK,
      });

      slide.addText(p.desc, {
        x: x + 0.25,
        y: y + 1.1,
        w: 5.4,
        h: 1.3,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: SLATE_MUTED,
        lineSpacing: 16,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 10: TECHNOLOGY & AI ARCHITECTURE
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '10', 'Technology & AI Architecture Pipeline');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.1,
      h: 5.5,
      rectRadius: 0.12,
      fill: { color: '0F172A' },
      line: { color: '334155', width: 1 },
    });

    slide.addText('⚡  Multi-Tier Resilient System Architecture:', {
      x: 0.9,
      y: 1.55,
      w: 11.5,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: '5EEAD4',
    });

    const pipeSteps = [
      { step: '1. User Input', desc: 'Pharmacist enters prescription / vitals' },
      { step: '2. Frontend (React 18)', desc: 'Client RAM cache check (0ms response)' },
      { step: '3. Server Cache Layer', desc: 'Node.js RAM Cache (<1ms response)' },
      { step: '4. AI Rotation Engine', desc: 'Gemini 3.5 Flash ➔ Flash Lite ➔ 3.6 Flash' },
      { step: '5. Structured Database', desc: 'Supabase PostgreSQL + Egyptian Drug DB' },
      { step: '6. Clinical Output', desc: 'Severity triage & pharmacist advice' },
    ];

    pipeSteps.forEach((ps, idx) => {
      const x = 0.9 + idx * 1.9;
      const y = 2.1;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 1.75,
        h: 2.1,
        rectRadius: 0.08,
        fill: { color: '1E293B' },
        line: { color: '0D9488', width: 1.2 },
      });

      slide.addText(ps.step, {
        x: x + 0.1,
        y: y + 0.2,
        w: 1.55,
        h: 0.5,
        fontSize: 10.5,
        fontFace: 'Arial',
        bold: true,
        color: '5EEAD4',
        align: 'center',
      });

      slide.addText(ps.desc, {
        x: x + 0.1,
        y: y + 0.75,
        w: 1.55,
        h: 1.2,
        fontSize: 9,
        fontFace: 'Arial',
        color: WHITE,
        align: 'center',
        lineSpacing: 13,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.9,
      y: 4.5,
      w: 11.5,
      h: 2.0,
      rectRadius: 0.1,
      fill: { color: '134E4A' },
      line: { color: TEAL_PRIMARY, width: 1 },
    });

    slide.addText([
      { text: '🛡️  What AI Does vs What Structured Database Does (Honest Demarcation):\n', options: { bold: true, color: '5EEAD4', fontSize: 11 } },
      { text: '• Structured Database & Cache: ', options: { bold: true } },
      { text: 'Stores Egyptian brand mappings, exact prices, active chemical ingredients, and normal lab ranges deterministically.\n' },
      { text: '• AI Reasoning Engine: ', options: { bold: true } },
      { text: 'Synthesizes complex multi-drug pharmacokinetics, evaluates non-obvious CYP interactions, and drafts clear bilingual explanations.\n' },
      { text: '• Multi-Model Failover: ', options: { bold: true } },
      { text: 'Guarantees 99.9% uptime by automatically rotating fallback models if API quotas or network latency thresholds are hit.' }
    ], {
      x: 1.1,
      y: 4.65,
      w: 11.1,
      h: 1.7,
      fontSize: 10,
      fontFace: 'Arial',
      color: WHITE,
      lineSpacing: 16,
    });

    addSlideFooter(slide);
  }

  // SLIDE 11: IMPACT
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '11', 'Clinical, Educational & Societal Impact');

    const impacts = [
      { icon: '🏪', title: 'Community Pharmacists', desc: '• 80% faster prescription safety verification.\n• Instant finding of in-stock generic alternatives.\n• Prevention of dispensing errors and liability.', color: TEAL_DARK, bg: TEAL_LIGHT },
      { icon: '🏥', title: 'Hospital & Clinical Pharmacists', desc: '• Multi-drug ward round regimen audits.\n• Renal (CrCl) & hepatic dose adjustments.\n• Monitoring of high-risk drug-drug combinations.', color: BLUE, bg: BLUE_BG },
      { icon: '🎓', title: 'Pharmacy Students (ECU)', desc: '• Interactive training for OSCE clinical exams.\n• Pharmacology case study simulation.\n• Bridging academic theory with Egyptian practice.', color: AMBER, bg: AMBER_BG },
      { icon: '🩺', title: 'Patients & Public Health', desc: '• Prevention of toxicities and hospital readmissions.\n• Affordable medicine options via price tiers.\n• Clear patient adherence instructions.', color: EMERALD, bg: EMERALD_BG },
    ];

    impacts.forEach((imp, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.6 + col * 6.1;
      const y = 1.35 + row * 2.75;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 5.9,
        h: 2.55,
        rectRadius: 0.1,
        fill: { color: imp.bg },
        line: { color: 'CBD5E1', width: 1 },
      });

      slide.addText(`${imp.icon}  ${imp.title}`, {
        x: x + 0.25,
        y: y + 0.2,
        w: 5.4,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: imp.color,
      });

      slide.addText(imp.desc, {
        x: x + 0.25,
        y: y + 0.65,
        w: 5.4,
        h: 1.7,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: SLATE_DARK,
        lineSpacing: 18,
      });
    });

    addSlideFooter(slide);
  }

  // SLIDE 12: FINAL TEAM SLIDE (With 5 Team Members)
  {
    const slide = pptx.addSlide();
    slide.background = { color: SLATE_DARK };

    slide.addText('PROJECT CONTRIBUTORS & ACADEMIC TEAM', {
      x: 1.0,
      y: 0.8,
      w: 10,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: '5EEAD4',
      bold: true,
      letterSpacing: 2,
    });

    slide.addText('YoPharma Drug Check', {
      x: 1.0,
      y: 1.2,
      w: 11.3,
      h: 0.9,
      fontSize: 38,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    slide.addText('"Search it. Understand it. Compare it. Check it."', {
      x: 1.0,
      y: 2.15,
      w: 11.3,
      h: 0.45,
      fontSize: 17,
      fontFace: 'Arial',
      color: '99F6E4',
      italic: true,
    });

    // 5 Team Members Grid Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 2.8,
      w: 11.3,
      h: 3.8,
      rectRadius: 0.12,
      fill: { color: SLATE_CARD },
      line: { color: '334155', width: 1 },
    });

    slide.addText('🏆  فريق العمل المشارك في تطوير وتصميم المنصة (Team PharmaMind):', {
      x: 1.3,
      y: 3.0,
      w: 10.7,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: '5EEAD4',
    });

    const members = [
      { nameAr: 'يوسف محمد', nameEn: 'Youssef Mohamed', role: 'Full-Stack Architecture & AI Integration' },
      { nameAr: 'نور عبدالمجيد', nameEn: 'Nour Abdelmageed', role: 'Clinical Pharmacy Research & Interaction Matrix' },
      { nameAr: 'رنا ماهر', nameEn: 'Rana Maher', role: 'Drug Database Curation & Egyptian Generics' },
      { nameAr: 'وفاء طه', nameEn: 'Wafaa Taha', role: 'Biomarkers & Clinical Lab Normal Ranges' },
      { nameAr: 'نور جمال', nameEn: 'Nour Gamal', role: 'Food-Drug Interactions & Dietary Guidelines' },
    ];

    members.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 1.3 + col * 5.4;
      const y = 3.5 + row * 0.95;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 5.1,
        h: 0.8,
        rectRadius: 0.08,
        fill: { color: '0F172A' },
        line: { color: '0D9488', width: 1 },
      });

      slide.addText(`${idx + 1}. ${m.nameAr} (${m.nameEn})`, {
        x: x + 0.2,
        y: y + 0.1,
        w: 4.7,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: WHITE,
      });

      slide.addText(m.role, {
        x: x + 0.2,
        y: y + 0.4,
        w: 4.7,
        h: 0.3,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: '94A3B8',
      });
    });

    slide.addText('Faculty of Pharmacy — Egyptian Chinese University (ECU) • كلية الصيدلة بالجامعة المصرية الصينية', {
      x: 1.3,
      y: 6.15,
      w: 10.7,
      h: 0.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: '5EEAD4',
      align: 'center',
      bold: true,
    });
  }

  // Save presentation
  const outputPath = 'c:/Users/Lenovo/Downloads/Telegram Desktop/app/YoPharma_Drug_Check_Presentation.pptx';
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Updated Presentation with 5 Team Members created successfully at: ${outputPath}`);
}

buildCompetitionDeck().catch(err => {
  console.error('Error creating presentation:', err);
  process.exit(1);
});
