const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

// Color palette - Warm Neutral (Option C)
const C = {
  bg: 'FAFAF9',
  card: 'F5F5F4',
  border: 'E7E5E3',
  primary: '57534E',
  accent: '6D9775',
  accentLight: 'F0FDF4',
  text: '1C1917',
  muted: 'A8A29E',
  darkBg: '1C1917',
  white: 'FFFFFF',
  red: 'DC2626',
  orange: 'C2410C',
  amber: 'B45309',
  green: '16A34A',
  blue: '0284C7',
};

const assetsDir = path.join(__dirname, 'ppt_assets');
const img = (name) => path.join(assetsDir, 'screenshots', name).replace(/\\/g, '/');

// ============================================================
// SLIDE 1: Title
// ============================================================
let s1 = pres.addSlide();
s1.background = { color: C.darkBg };

// Top accent line
s1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });

// Main title
s1.addText('MPLADS AI Sentinel', {
  x: 0.8, y: 1.2, w: 8.4, h: 0.8,
  fontSize: 40, fontFace: 'Cambria', color: C.white, bold: true,
});

// Subtitle
s1.addText('AI-Powered Anomaly, Fraud & Inefficiency Detection\nfor MPLAD Scheme Implementation', {
  x: 0.8, y: 2.1, w: 8.4, h: 0.8,
  fontSize: 16, fontFace: 'Calibri', color: C.muted, lineSpacingMultiple: 1.3,
});

// PS info line
s1.addShape(pres.ShapeType.rect, { x: 0.8, y: 3.2, w: 3.5, h: 0.01, fill: { color: C.accent } });

s1.addText([
  { text: 'Problem Statement 26102', options: { fontSize: 13, color: C.accent, bold: true } },
  { text: '  |  ', options: { fontSize: 13, color: '57534E' } },
  { text: 'MoSPI / DIID', options: { fontSize: 13, color: C.muted } },
  { text: '  |  ', options: { fontSize: 13, color: '57534E' } },
  { text: 'Smart Automation', options: { fontSize: 13, color: C.muted } },
], { x: 0.8, y: 3.4, w: 8.4, h: 0.4 });

// Team info
s1.addText('Smart India Hackathon 2026', {
  x: 0.8, y: 4.2, w: 8.4, h: 0.4,
  fontSize: 12, fontFace: 'Calibri', color: '57534E',
});

// Bottom bar
s1.addShape(pres.ShapeType.rect, { x: 0, y: 5.4, w: 10, h: 0.225, fill: { color: C.accent } });


// ============================================================
// SLIDE 2: Problem Statement
// ============================================================
let s2 = pres.addSlide();
s2.background = { color: C.bg };

s2.addText('The Problem', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s2.addText('MPLADS tracks WHAT happened but cannot detect WHAT IS WRONG', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted, italic: true,
});

// Big stat cards
const stats = [
  { num: '₹161 Cr', label: 'Unsupported expenditure\nfound by CAG', color: C.red },
  { num: '98.53%', label: 'Works with no handover\nrecord (ghost assets)', color: C.orange },
  { num: '8.3%', label: 'Anomaly rate across\n1.43 lakh works', color: C.amber },
  { num: '0', label: 'AI detection systems\ncurrently exist', color: C.blue },
];

stats.forEach((st, i) => {
  const x = 0.6 + i * 2.25;
  s2.addShape(pres.ShapeType.rect, {
    x, y: 1.5, w: 2.05, h: 1.6,
    fill: { color: C.white }, rectRadius: 0.08,
    shadow: { type: 'outer', blur: 4, offset: 1, color: '000000', opacity: 0.06 },
  });
  s2.addText(st.num, {
    x, y: 1.65, w: 2.05, h: 0.6,
    fontSize: 28, fontFace: 'Calibri', color: st.color, bold: true, align: 'center',
  });
  s2.addText(st.label, {
    x, y: 2.3, w: 2.05, h: 0.65,
    fontSize: 10, fontFace: 'Calibri', color: C.muted, align: 'center', lineSpacingMultiple: 1.2,
  });
});

// Key gaps
s2.addText('Key Gaps in Current System', {
  x: 0.6, y: 3.4, w: 8.8, h: 0.35,
  fontSize: 14, fontFace: 'Calibri', color: C.primary, bold: true,
});

const gaps = [
  ['No Anomaly Detection', 'Suspicious patterns go unnoticed until manual audits'],
  ['No Predictive Analytics', 'Cannot predict fraud before fund disbursement'],
  ['No Image Verification', 'Ghost assets — 98.53% works had no handover record'],
  ['No Explainable AI', 'No audit-ready explanation for flagged works'],
];

gaps.forEach((g, i) => {
  const y = 3.85 + i * 0.38;
  s2.addText([
    { text: g[0], options: { fontSize: 11, color: C.text, bold: true } },
    { text: ' — ' + g[1], options: { fontSize: 11, color: C.muted } },
  ], { x: 0.8, y, w: 8.4, h: 0.35 });
});


// ============================================================
// SLIDE 3: Solution Overview
// ============================================================
let s3 = pres.addSlide();
s3.background = { color: C.bg };

s3.addText('Our Solution', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s3.addText('MPLADS AI Sentinel — An AI-powered monitoring platform with role-based dashboards', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted,
});

// 3-column solution cards
const solutions = [
  {
    title: '3 Role-Based Dashboards',
    icon: '📊',
    items: ['MP Dashboard — "MY ₹5 crore"', 'DA+CAG Dashboard — "MY district"', 'Ministry Dashboard — "ALL states"'],
    color: C.blue,
  },
  {
    title: 'AI Anomaly Detection',
    icon: '🤖',
    items: ['XGBoost (supervised)', 'Isolation Forest (unsupervised)', 'SHAP explainability per alert'],
    color: C.accent,
  },
  {
    title: 'IA Agency App (Proposed)',
    icon: '📷',
    items: ['Photo upload + geotagging', 'AI verification (De-Fake + CLIP)', 'Stage payment verification'],
    color: C.orange,
  },
];

solutions.forEach((sol, i) => {
  const x = 0.6 + i * 3.05;
  s3.addShape(pres.ShapeType.rect, {
    x, y: 1.5, w: 2.85, h: 3.5,
    fill: { color: C.white }, rectRadius: 0.08,
    shadow: { type: 'outer', blur: 4, offset: 1, color: '000000', opacity: 0.06 },
  });

  // Color top bar
  s3.addShape(pres.ShapeType.rect, {
    x, y: 1.5, w: 2.85, h: 0.06,
    fill: { color: sol.color },
  });

  s3.addText(sol.icon, {
    x, y: 1.7, w: 2.85, h: 0.5,
    fontSize: 28, align: 'center',
  });

  s3.addText(sol.title, {
    x: x + 0.2, y: 2.25, w: 2.45, h: 0.4,
    fontSize: 13, fontFace: 'Calibri', color: C.text, bold: true, align: 'center',
  });

  sol.items.forEach((item, j) => {
    s3.addText('•  ' + item, {
      x: x + 0.25, y: 2.75 + j * 0.4, w: 2.35, h: 0.35,
      fontSize: 10, fontFace: 'Calibri', color: C.muted, lineSpacingMultiple: 1.1,
    });
  });
});

// Build vs Propose footer
s3.addShape(pres.ShapeType.rect, {
  x: 0.6, y: 5.1, w: 8.8, h: 0.01, fill: { color: C.border },
});

s3.addText([
  { text: 'Build: ', options: { fontSize: 10, color: C.accent, bold: true } },
  { text: '3 dashboards + AI detection + SHAP   ', options: { fontSize: 10, color: C.muted } },
  { text: '|  Propose: ', options: { fontSize: 10, color: C.orange, bold: true } },
  { text: 'IA App + AI verification   ', options: { fontSize: 10, color: C.muted } },
  { text: '|  Future: ', options: { fontSize: 10, color: C.blue, bold: true } },
  { text: 'eSAKSHI + satellite + citizen app', options: { fontSize: 10, color: C.muted } },
], { x: 0.6, y: 5.15, w: 8.8, h: 0.35 });


// ============================================================
// SLIDE 4: User Flow
// ============================================================
let s4 = pres.addSlide();
s4.background = { color: C.bg };

s4.addText('User Flow', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s4.addText('Three roles, three dashboards, one AI engine', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted,
});

// User flow diagram (HTML-rendered)
const userflowImg = img('userflow.png');
if (fs.existsSync(userflowImg.replace(/\//g, '\\'))) {
  s4.addImage({
    path: userflowImg,
    x: 0.15, y: 1.35, w: 9.7, h: 3.7,
  });
}

// Role descriptions below
const roles = [
  { role: 'MP', question: '"What\'s happening with MY ₹5 crore?"', color: C.blue },
  { role: 'DA + CAG', question: '"What\'s suspicious in MY district?"', color: C.accent },
  { role: 'Ministry', question: '"What\'s happening across ALL states?"', color: C.orange },
];

roles.forEach((r, i) => {
  const x = 0.6 + i * 3.05;
  s4.addShape(pres.ShapeType.rect, {
    x, y: 4.85, w: 2.85, h: 0.55,
    fill: { color: C.white }, rectRadius: 0.06,
    line: { color: C.border, width: 1 },
  });
  s4.addText([
    { text: r.role + '  ', options: { fontSize: 11, color: r.color, bold: true } },
    { text: r.question, options: { fontSize: 10, color: C.muted, italic: true } },
  ], { x: x + 0.15, y: 4.88, w: 2.55, h: 0.5, valign: 'middle' });
});


// ============================================================
// SLIDE 5: Technical Architecture
// ============================================================
let s5 = pres.addSlide();
s5.background = { color: C.bg };

s5.addText('Technical Architecture', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s5.addText('End-to-end AI pipeline: Data → ML → Explainability → Dashboards', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted,
});

// Architecture diagram (HTML-rendered)
const archImg = img('architecture.png');
if (fs.existsSync(archImg.replace(/\//g, '\\'))) {
  s5.addImage({
    path: archImg,
    x: 0.15, y: 1.3, w: 9.7, h: 4.0,
  });
}


// ============================================================
// SLIDE 6: AI/ML Engine
// ============================================================
let s6 = pres.addSlide();
s6.background = { color: C.bg };

s6.addText('AI / ML Engine', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s6.addText('Dual-model ensemble with explainable risk scoring', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted,
});

// ML engine diagram (HTML-rendered)
const mlImg = img('ml_engine.png');
if (fs.existsSync(mlImg.replace(/\//g, '\\'))) {
  s6.addImage({
    path: mlImg,
    x: 0.15, y: 1.35, w: 9.7, h: 3.4,
  });
}

// Feature engineering mini-table below
s6.addText('12-Dimensional Feature Vector', {
  x: 0.6, y: 4.85, w: 8.8, h: 0.3,
  fontSize: 12, fontFace: 'Calibri', color: C.primary, bold: true,
});

const features = [
  ['cost_overrun_ratio', '#1 fraud predictor'],
  ['vendor_concentration', 'Collusion signal'],
  ['sanction_delay_days', 'Process violation'],
  ['work_category_risk', 'Guideline violation'],
  ['tenure_phase', 'Spending rush pattern'],
  ['mp_utilization_rate', 'Underutilization'],
];

features.forEach((f, i) => {
  const col = Math.floor(i / 3);
  const row = i % 3;
  const x = 0.8 + col * 4.5;
  const y = 5.15 + row * 0.22;
  s6.addText([
    { text: f[0], options: { fontSize: 8, fontFace: 'Consolas', color: C.accent } },
    { text: '  —  ' + f[1], options: { fontSize: 8, color: C.muted } },
  ], { x, y, w: 4.2, h: 0.2 });
});


// ============================================================
// SLIDE 7: Use Cases (CAG Fraud Patterns)
// ============================================================
let s7 = pres.addSlide();
s7.background = { color: C.bg };

s7.addText('Use Cases', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s7.addText('Real fraud patterns from CAG reports — detected by our AI engine', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted,
});

const useCases = [
  {
    title: 'Cost Overrun',
    stat: '340%',
    desc: 'Road construction sanctioned ₹12L, actual cost ₹52.8L. XGBoost flags cost_overrun_ratio > 1.0 as CRITICAL.',
    rule: 'COST-002',
    color: C.red,
  },
  {
    title: 'Vendor Collusion',
    stat: '62%',
    desc: 'One vendor gets 62% of all works in a district. Isolation Forest detects abnormal concentration.',
    rule: 'VEND-002',
    color: C.orange,
  },
  {
    title: 'Duplicate Works',
    stat: '2',
    desc: 'Same road project, different IDs, different vendors. Cosine similarity > 0.85 on work descriptions.',
    rule: 'DUP-001',
    color: C.amber,
  },
  {
    title: 'Ghost Assets',
    stat: '98.53%',
    desc: 'Works marked complete but no handover record. IA App would verify with photos + geotag.',
    rule: 'GEO-001',
    color: C.red,
  },
];

useCases.forEach((uc, i) => {
  const x = 0.6 + i * 2.25;
  s7.addShape(pres.ShapeType.rect, {
    x, y: 1.5, w: 2.05, h: 3.6,
    fill: { color: C.white }, rectRadius: 0.08,
    shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.05 },
  });

  // Stat badge
  s7.addShape(pres.ShapeType.rect, {
    x: x + 0.6, y: 1.7, w: 0.85, h: 0.55,
    fill: { color: C.card }, rectRadius: 0.06,
  });
  s7.addText(uc.stat, {
    x: x + 0.6, y: 1.72, w: 0.85, h: 0.5,
    fontSize: 20, fontFace: 'Calibri', color: uc.color, bold: true, align: 'center', valign: 'middle',
  });

  s7.addText(uc.title, {
    x: x + 0.15, y: 2.4, w: 1.75, h: 0.3,
    fontSize: 12, fontFace: 'Calibri', color: C.text, bold: true,
  });

  s7.addText(uc.desc, {
    x: x + 0.15, y: 2.75, w: 1.75, h: 1.6,
    fontSize: 9, fontFace: 'Calibri', color: C.muted, lineSpacingMultiple: 1.3,
  });

  // Rule badge
  s7.addShape(pres.ShapeType.rect, {
    x: x + 0.15, y: 4.55, w: 0.8, h: 0.3,
    fill: { color: C.card }, rectRadius: 0.04,
  });
  s7.addText(uc.rule, {
    x: x + 0.15, y: 4.55, w: 0.8, h: 0.3,
    fontSize: 8, fontFace: 'Consolas', color: C.muted, align: 'center', valign: 'middle',
  });
});


// ============================================================
// SLIDE 8: Prototype Screenshots
// ============================================================
let s8 = pres.addSlide();
s8.background = { color: C.bg };

s8.addText('Prototype', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s8.addText('Role-based dashboards with AI-powered risk scoring and SHAP explanations', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted,
});

// 2x2 grid of screenshots
const screenshots = [
  { file: 'login.png', label: 'Login — Role Selector', x: 0.4, y: 1.4 },
  { file: 'mp_dashboard.png', label: 'MP Dashboard', x: 5.1, y: 1.4 },
  { file: 'da_cag_dashboard.png', label: 'DA + CAG Dashboard', x: 0.4, y: 3.35 },
  { file: 'ministry_dashboard.png', label: 'Ministry Dashboard', x: 5.1, y: 3.35 },
];

screenshots.forEach((sc) => {
  const scPath = img(sc.file);
  if (fs.existsSync(scPath.replace(/\//g, '\\'))) {
    s8.addShape(pres.ShapeType.rect, {
      x: sc.x - 0.05, y: sc.y - 0.05, w: 4.55, h: 2.1,
      fill: { color: C.card }, rectRadius: 0.06,
    });
    s8.addImage({
      path: scPath,
      x: sc.x, y: sc.y, w: 4.45, h: 1.85,
      rounding: true,
    });
    s8.addText(sc.label, {
      x: sc.x, y: sc.y + 1.9, w: 4.45, h: 0.25,
      fontSize: 9, fontFace: 'Calibri', color: C.muted, align: 'center',
    });
  }
});


// ============================================================
// SLIDE 9: IA Agency App (Proposed)
// ============================================================
let s9 = pres.addSlide();
s9.background = { color: C.bg };

s9.addText('IA Agency App — Proposed Feature', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.text, bold: true,
});

s9.addText('AI verification at every payment stage — could plug into eSAKSHI portal', {
  x: 0.6, y: 0.9, w: 8.8, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.muted,
});

// Stage payment flow
const stages = [
  { stage: 'Stage 1', label: 'First Payment', pct: '25%', desc: 'Initial progress\nAI: Photo + Geotag', color: C.blue },
  { stage: 'Stage 2', label: 'Second Payment', pct: '50%', desc: 'Substantial progress\nAI: CLIP + Timeline', color: C.accent },
  { stage: 'Stage 3', label: 'Completion', pct: '25%', desc: 'Final verification\nAI: 3+ photos, before/after', color: C.orange },
];

stages.forEach((st, i) => {
  const x = 0.6 + i * 3.05;
  s9.addShape(pres.ShapeType.rect, {
    x, y: 1.5, w: 2.85, h: 1.8,
    fill: { color: C.white }, rectRadius: 0.08,
    shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.05 },
  });
  s9.addShape(pres.ShapeType.rect, {
    x, y: 1.5, w: 2.85, h: 0.05, fill: { color: st.color },
  });
  s9.addText(st.stage, {
    x: x + 0.15, y: 1.65, w: 1.2, h: 0.25,
    fontSize: 9, fontFace: 'Calibri', color: st.color, bold: true,
  });
  s9.addText(st.pct, {
    x: x + 1.5, y: 1.6, w: 1.2, h: 0.35,
    fontSize: 22, fontFace: 'Calibri', color: C.text, bold: true, align: 'right',
  });
  s9.addText(st.label, {
    x: x + 0.15, y: 2.0, w: 2.55, h: 0.3,
    fontSize: 13, fontFace: 'Calibri', color: C.text, bold: true,
  });
  s9.addText(st.desc, {
    x: x + 0.15, y: 2.35, w: 2.55, h: 0.8,
    fontSize: 10, fontFace: 'Calibri', color: C.muted, lineSpacingMultiple: 1.2,
  });

  // Arrow between stages
  if (i < 2) {
    s9.addText('→', {
      x: x + 2.85, y: 2.1, w: 0.2, h: 0.4,
      fontSize: 18, color: C.muted, align: 'center', valign: 'middle',
    });
  }
});

// AI verification checks
s9.addText('AI Verification Checks', {
  x: 0.6, y: 3.6, w: 8.8, h: 0.35,
  fontSize: 14, fontFace: 'Calibri', color: C.primary, bold: true,
});

const checks = [
  ['De-Fake Model', 'Is this photo AI-generated?', C.red],
  ['Geotag Check', 'EXIF GPS vs work location (500m radius)', C.accent],
  ['CLIP Matching', 'Does photo match work description?', C.blue],
  ['Timeline Check', 'EXIF date vs sanction date', C.orange],
];

checks.forEach((ch, i) => {
  const col = Math.floor(i / 2);
  const row = i % 2;
  const x = 0.8 + col * 4.5;
  const y = 4.05 + row * 0.45;

  s9.addShape(pres.ShapeType.rect, {
    x, y, w: 4.2, h: 0.38,
    fill: { color: C.white }, rectRadius: 0.04,
    line: { color: C.border, width: 1 },
  });
  s9.addText([
    { text: ch[0], options: { fontSize: 10, color: ch[2], bold: true } },
    { text: '  —  ' + ch[1], options: { fontSize: 10, color: C.muted } },
  ], { x: x + 0.1, y, w: 4.0, h: 0.38, valign: 'middle' });
});


// ============================================================
// SLIDE 10: Future Scope & Team
// ============================================================
let s10 = pres.addSlide();
s10.background = { color: C.darkBg };

s10.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });

s10.addText('Future Scope & Team', {
  x: 0.6, y: 0.35, w: 8.8, h: 0.5,
  fontSize: 28, fontFace: 'Cambria', color: C.white, bold: true,
});

// Future scope cards
const future = [
  { title: 'eSAKSHI Integration', desc: 'AI verification layer plugs into existing portal via API', icon: '🔗' },
  { title: 'Satellite Verification', desc: 'Sentinel-2 imagery for construction progress verification', icon: '🛰' },
  { title: 'Citizen App', desc: 'Mobile app for ground-truthing works with photo upload', icon: '📱' },
  { title: 'Federated Learning', desc: 'Privacy-preserving cross-state fraud pattern analysis', icon: '🔒' },
];

future.forEach((f, i) => {
  const x = 0.6 + i * 2.25;
  s10.addShape(pres.ShapeType.rect, {
    x, y: 1.1, w: 2.05, h: 1.5,
    fill: { color: '292524' }, rectRadius: 0.08,
  });
  s10.addText(f.icon, {
    x, y: 1.2, w: 2.05, h: 0.4,
    fontSize: 20, align: 'center',
  });
  s10.addText(f.title, {
    x: x + 0.1, y: 1.6, w: 1.85, h: 0.3,
    fontSize: 11, fontFace: 'Calibri', color: C.white, bold: true, align: 'center',
  });
  s10.addText(f.desc, {
    x: x + 0.1, y: 1.9, w: 1.85, h: 0.55,
    fontSize: 9, fontFace: 'Calibri', color: C.muted, align: 'center', lineSpacingMultiple: 1.2,
  });
});

// Team section
s10.addText('Team', {
  x: 0.6, y: 2.9, w: 8.8, h: 0.35,
  fontSize: 16, fontFace: 'Calibri', color: C.white, bold: true,
});

const team = [
  { role: 'ML Lead', task: 'XGBoost, Isolation Forest, SHAP, feature engineering' },
  { role: 'Backend Lead', task: 'FastAPI, database, data pipeline, API integration' },
  { role: 'Frontend Lead', task: 'Next.js dashboards, maps, charts, animations' },
  { role: 'Design Lead', task: 'UI/UX, login page, India map, presentation' },
  { role: 'QA Lead', task: 'Testing, demo data, fallbacks, deployment' },
];

team.forEach((t, i) => {
  const y = 3.35 + i * 0.32;
  s10.addText([
    { text: t.role, options: { fontSize: 10, color: C.accent, bold: true } },
    { text: '  —  ' + t.task, options: { fontSize: 10, color: C.muted } },
  ], { x: 0.8, y, w: 8.4, h: 0.3 });
});

// Timeline
s10.addText('36-Hour Hackathon Timeline', {
  x: 0.6, y: 4.95, w: 8.8, h: 0.3,
  fontSize: 13, fontFace: 'Calibri', color: C.white, bold: true,
});

const timeline = [
  { phase: '0-6h', label: 'Foundation', w: 1.5 },
  { phase: '6-14h', label: 'ML Engine', w: 2.0 },
  { phase: '14-26h', label: 'Dashboards', w: 2.5 },
  { phase: '26-32h', label: 'Integration', w: 1.5 },
  { phase: '32-36h', label: 'Polish', w: 1.0 },
];

let tx = 0.6;
timeline.forEach((t) => {
  s10.addShape(pres.ShapeType.rect, {
    x: tx, y: 5.3, w: t.w, h: 0.22,
    fill: { color: C.accent }, rectRadius: 0.03,
  });
  s10.addText(t.label, {
    x: tx, y: 5.3, w: t.w, h: 0.22,
    fontSize: 8, fontFace: 'Calibri', color: C.darkBg, bold: true, align: 'center', valign: 'middle',
  });
  tx += t.w + 0.1;
});


// ============================================================
// Write file
// ============================================================
const outputPath = path.join(__dirname, 'MPLADS_AI_Sentinel_SIH2026_v2.pptx');
pres.writeFile({ fileName: outputPath })
  .then(() => console.log('PPT created: ' + outputPath))
  .catch(err => console.error('Error:', err));
