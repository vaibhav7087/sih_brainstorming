const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const RD = path.join(__dirname, 'ppt_assets', 'renders');
const OD = path.join(__dirname, 'generated_ppts');
if (!fs.existsSync(OD)) fs.mkdirSync(OD, { recursive: true });

const C = { navy:'0B1D3A', blue:'1A73E8', green:'0D9276', red:'D93C3E', orange:'E86C00', white:'FFFFFF', dt:'1A1A2E', gray:'666666', lt:'94A3B8' };
const FH = 'Cambria', FB = 'Calibri';

function img(name) { const p = path.join(RD, name); return fs.existsSync(p) ? p : null; }

function addFooter(slide, num, total) {
  slide.addText('MPLADS AI Sentinel  |  SIH 2026  |  PS 26102', {
    x: 0.5, y: 5.15, w: 12.3, h: 0.3, fontSize: 8, fontFace: FB, color: C.gray, align: 'right'
  });
  slide.addText(num + ' / ' + total, {
    x: 0.5, y: 5.15, w: 1, h: 0.3, fontSize: 8, fontFace: FB, color: C.gray, align: 'left'
  });
}

function addBullets(slide, items, x, y, w, h, opts) {
  const textArr = items.map(t => ({
    text: '\u2022  ' + t,
    options: { fontSize: opts.fs || 10, fontFace: FB, color: opts.color || C.dt, paraSpaceAfter: 4, breakLine: true }
  }));
  slide.addText(textArr, { x, y, w, h, valign: 'top', margin: 0 });
}

function addTwoCol(slide, lt, li, rt, ri) {
  slide.addShape(1, { x: 0.4, y: 0.95, w: 5.8, h: 0.32, fill: { color: C.blue } });
  slide.addText(lt, { x: 0.5, y: 0.96, w: 5.6, h: 0.3, fontSize: 12, fontFace: FB, bold: true, color: C.white });
  addBullets(slide, li, 0.4, 1.35, 5.8, 3.8, { fs: 10 });

  slide.addShape(1, { x: 6.5, y: 0.95, w: 5.8, h: 0.32, fill: { color: C.green } });
  slide.addText(rt, { x: 6.6, y: 0.96, w: 5.6, h: 0.3, fontSize: 12, fontFace: FB, bold: true, color: C.white });
  addBullets(slide, ri, 6.5, 1.35, 5.8, 3.8, { fs: 10 });
}

// Slide 1: Title
function s1(prs) {
  const s = prs.addSlide();
  const titleImg = img('slide_title.png');
  if (titleImg) {
    s.addImage({ path: titleImg, x: 0, y: 0, w: 13.33, h: 7.5 });
  } else {
    s.addShape(1, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.navy } });
    s.addText('SMART INDIA HACKATHON 2026', { x: 1, y: 1.5, w: 11, h: 0.8, fontSize: 20, fontFace: FH, bold: true, color: C.white, align: 'center' });
    s.addText('MPLADS AI Sentinel', { x: 1, y: 2.5, w: 11, h: 1.2, fontSize: 44, fontFace: FH, bold: true, color: C.white, align: 'center' });
    s.addText('Intelligent Anomaly, Fraud & Inefficiency Detection System for Parliamentary Fund Monitoring using Explainable AI', { x: 2, y: 3.8, w: 9, h: 0.8, fontSize: 16, fontFace: FB, color: C.lt, align: 'center' });
    s.addText('PS 26102  |  MoSPI / DIID  |  Smart Automation  |  Software', { x: 2, y: 5, w: 9, h: 0.5, fontSize: 14, fontFace: FB, color: '60A5FA', align: 'center' });
  }
}

// Slide 2: Solution overview (image-rendered)
function s2(prs) {
  const s = prs.addSlide();
  s.addImage({ path: img('slide_solution.png'), x: 0, y: 0, w: 13.33, h: 7.5 });
  addFooter(s, 2, 8);
}

// Slide 3: Architecture (image-rendered)
function s3(prs) {
  const s = prs.addSlide();
  s.addImage({ path: img('slide_architecture.png'), x: 0, y: 0, w: 13.33, h: 7.5 });
  addFooter(s, 3, 8);
}

// Slide 4: Tech stack (image-rendered)
function s4(prs) {
  const s = prs.addSlide();
  s.addImage({ path: img('slide_techstack.png'), x: 0, y: 0, w: 13.33, h: 7.5 });
  addFooter(s, 4, 8);
}

// Slide 5: Feasibility (image-rendered)
function s5(prs) {
  const s = prs.addSlide();
  s.addImage({ path: img('slide_feasibility.png'), x: 0, y: 0, w: 13.33, h: 7.5 });
  addFooter(s, 5, 8);
}

// Slide 6: Impact (image-rendered)
function s6(prs) {
  const s = prs.addSlide();
  s.addImage({ path: img('slide_impact.png'), x: 0, y: 0, w: 13.33, h: 7.5 });
  addFooter(s, 6, 8);
}

// Slide 7: References (native pptx)
function s7(prs, refs) {
  const s = prs.addSlide();
  s.addShape(1, { x: 0, y: 0, w: 13.33, h: 0.7, fill: { color: C.navy } });
  s.addText('References & Supporting Documentation', { x: 0.5, y: 0.12, w: 12, h: 0.45, fontSize: 18, fontFace: FH, bold: true, color: C.white });
  addBullets(s, refs, 0.5, 0.9, 12.3, 4.2, { fs: 10, color: C.dt });
  addFooter(s, 7, 8);
}

// Slide 8: Thank you
function s8(prs) {
  const s = prs.addSlide();
  s.addShape(1, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.navy } });
  s.addText('Thank You', { x: 1, y: 2, w: 11, h: 1.5, fontSize: 52, fontFace: FH, bold: true, color: C.white, align: 'center' });
  s.addText('MPLADS AI Sentinel', { x: 1, y: 3.5, w: 11, h: 0.8, fontSize: 24, fontFace: FB, bold: true, color: '60A5FA', align: 'center' });
  s.addText('PS 26102  |  MoSPI / DIID  |  Smart Automation', { x: 1, y: 4.3, w: 11, h: 0.6, fontSize: 14, fontFace: FB, color: C.lt, align: 'center' });
  s.addText('Ready for Grand Finale Deployment', { x: 1, y: 5.2, w: 11, h: 0.5, fontSize: 12, fontFace: FB, color: '34D399', align: 'center' });
}

const OPTIONS = {
  OptionA: {
    name: 'MPLADS_AI_Sentinel_OptionA_HighTech_v2.pptx',
    refs: [
      'CAG Performance Audits of MPLADS (2005-2024) - 85 fraud cases worth Rs.32,133+ crore',
      'MPLADS Guidelines 2023 - Ministry of Statistics and Programme Implementation official rules',
      'eSAKSHI Portal (esakshi.mp.gov.in) - existing digital transaction tracking system',
      'data.gov.in MPLADS Dataset - 143,257 records of works and expenditures across India',
      'Lundberg & Lee (2017) - SHAP: A Unified Approach to Interpreting Model Predictions (NeurIPS)',
      'Liu et al. (2012) - Isolation Forest anomaly detection (IEEE TKDE)',
      'RedFlags.ai - Kazakhstan saved $86M in 6 months using rule-based fraud detection',
      'Tazama (Linux Foundation) - Open-source real-time payment monitoring at 2,300 TPS',
    ]
  },
  OptionB: {
    name: 'MPLADS_AI_Sentinel_OptionB_BusinessImpact_v2.pptx',
    refs: [
      'ARC (2011) Report on MPLADS - Recommended abolishing scheme due to systemic corruption',
      'NAC Recommendations - National Advisory Council reform proposals for MPLADS governance',
      '2005 Sting Operations - 18 MPs caught demanding commissions (documented in CAG reports)',
      'DPDP Act 2023 - Digital Personal Data Protection Act compliance framework for AI systems',
      'RTI Act 2005 - Right to Information Act transparency requirements for public fund monitoring',
      'UK HMRC AI Platform - GBP 175M Quantexa contract for entity resolution in tax fraud',
      'RBI MuleHunter.AI - 85-90% accuracy rate with 26+ bank partnerships',
      'MPLADS Annual Reports (2019-2024) - Fund utilization: 37-52% across parliamentary terms',
    ]
  },
  OptionC: {
    name: 'MPLADS_AI_Sentinel_OptionC_Innovation_v2.pptx',
    refs: [
      'Flower (flwr) - Production-ready federated learning framework (flwr.ai)',
      'NetworkX + Node2Vec - Graph-based anomaly detection validated in fintech fraud',
      'Sentence-BERT (Reimers & Gurevych, 2019) - 92%+ accuracy on semantic similarity',
      'Sentinel-2 Satellite Data - ESA freely available 10m resolution for construction monitoring',
      "Benford's Law Application - Nigrini (2012) fraud detection methodology for financial data",
      'Coima (Argentina) - Open-source graph-based anti-corruption platform',
      'CTGAN + SMOTE-NC - Synthetic data generation for imbalanced fraud classification',
      'LSTM Autoencoder - Time-series anomaly detection (Malhotra et al.)',
    ]
  }
};

function generate(key) {
  const opt = OPTIONS[key];
  console.log('Generating: ' + opt.name);
  const prs = new pptxgen();
  prs.layout = 'LAYOUT_WIDE';
  prs.author = 'MPLADS AI Sentinel';
  prs.company = 'SIH 2026';
  prs.subject = 'PS 26102 - Smart Automation of MPLADS';
  prs.title = 'MPLADS AI Sentinel - ' + key;

  s1(prs);
  console.log('  Slide 1: Title');
  s2(prs);
  console.log('  Slide 2: Solution');
  s3(prs);
  console.log('  Slide 3: Architecture');
  s4(prs);
  console.log('  Slide 4: Tech Stack');
  s5(prs);
  console.log('  Slide 5: Feasibility');
  s6(prs);
  console.log('  Slide 6: Impact');
  s7(prs, opt.refs);
  console.log('  Slide 7: References');
  s8(prs);
  console.log('  Slide 8: Thank You');

  const out = path.join(OD, opt.name);
  prs.writeFile({ fileName: out }).then(() => {
    console.log('  SAVED: ' + out);
  }).catch(err => {
    console.error('  ERROR: ' + err.message);
  });
}

generate('OptionA');
generate('OptionB');
generate('OptionC');
