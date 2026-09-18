# MPLADS AI Sentinel — Plain Explanation

## What Is This?

MPLADS AI Sentinel is an AI-powered monitoring platform that helps detect fraud, anomalies, and inefficiencies in the Members of Parliament Local Area Development Scheme (MPLADS). It provides role-based dashboards for MPs, District Authorities, and Ministry officials.

---

## The Problem

- **788 MPs** (543 Lok Sabha + 245 Rajya Sabha) receive ₹5 crore each year to develop communities
- **Thousands of works** are recommended, sanctioned, and executed across 700+ districts
- **eSAKSHI portal** tracks what happened but cannot detect what is wrong
- **₹161 crore** unsupported expenditure documented in CAG performance audits
- **98.53%** of assets had no record of formal handover — risking "ghost assets"
- **No automated intelligence** exists to intercept fraud before public money is disbursed

---

## Our Solution

```
IA Agency App → AI Verification → 3-Layer ML Engine → Multi-Tier Dashboards
(proposed)      De-Fake + CLIP    Rules + IF + XGBoost MP / DA+CAG / Ministry
```

### What We Build (Core Solution)
1. **3-Layer ML Detection Engine** — Deterministic statutory rules + Isolation Forest + XGBoost
2. **SHAP Explainability** — Human-readable attribution waterfall explaining why every work was flagged
3. **Multi-Tier Governance Dashboards** — Role-tailored views for MP, DA+CAG, and Ministry
4. **Interactive India Map** — Pan-India heatmap showing district anomaly concentrations
5. **12 Core Priority Rules** — Mapped to CAG audit findings (from 30+ rule taxonomy)

### What We Propose (Subsystems)
1. **IA Agency Mobile App** — Geotagged photo upload and milestone submission
2. **AI Computer Vision Layer** — De-Fake (detects generative AI photos) + CLIP (verifies work description)
3. **Stage-Gated Payments** — Fund release conditioned on passing AI verification

### What We Mention (Enterprise Roadmap)
1. Direct RESTful API integration into MoSPI's eSAKSHI portal
2. Sentinel-2 satellite optical/SAR construction verification
3. Citizen crowdsourced ground-truthing app

---

## How It Works

### Step 1: Data Collection
- Download 143,257 records from data.gov.in
- Scrape eSAKSHI portal for current data
- Extract labeled fraud cases from CAG reports

### Step 2: Feature Engineering
Create 12 features for each work:
- Cost overrun ratio (is the cost too high?)
- Vendor concentration (does one vendor get too much?)
- Sanction delay (how long to approve?)
- Work category risk (is it a prohibited work?)
- And 8 more...

### Step 3: ML Detection
- **XGBoost** (supervised) — learns from known fraud patterns
- **Isolation Forest** (unsupervised) — finds outliers without labels
- **Ensemble** — combines both models for final risk score

### Step 4: Explainability
- **SHAP waterfall chart** — shows which features pushed the score
- **Natural language** — "This work was flagged because cost overrun is 340%"
- **Audit-ready** — every decision is explainable

### Step 5: Dashboards
- **MP View** — "What's happening with MY ₹5 crore?"
- **DA+CAG View** — "What's suspicious in MY district?"
- **Ministry View** — "What's happening across ALL states?"

---

## The IA Agency App (Proposed Feature)

### How It Works
1. **IA uploads photos** of work in progress
2. **AI verifies**:
   - Is the image fake? (De-Fake)
   - Does it match the work description? (CLIP)
   - Is the geotag correct?
   - Does the timeline make sense?
3. **Payment proceeds** only if AI verifies
4. **Could plug into eSAKSHI** in the future

### Stage Payments
- **First Payment (25%)** — Initial progress verified by AI
- **Second Payment (50%)** — Substantial progress verified
- **Completion (25%)** — Final verification with minimum 3 photos

---

## Why It's Different

| Existing System | Our Solution |
|----------------|--------------|
| Tracks what happened | Detects what's wrong |
| Manual audits | AI-powered detection |
| No explanations | SHAP explainability |
| Reactive | Proactive alerts |
| No verification | AI photo verification (proposed) |

---

## SIH Judging Criteria

| Criteria | How We Win |
|----------|-----------|
| **Innovation** (20-25%) | First ML-powered MPLADS monitoring + AI verification |
| **Technical** (20-25%) | XGBoost + IsoForest + SHAP + De-Fake + CLIP |
| **Impact** (20-25%) | ₹100+ crore/year fraud prevention |
| **Demo** (15-20%) | Beautiful dashboards + India map + live ML |
| **Completeness** (10-15%) | Full stack + future roadmap |

---

## Presentation & Demo Flows

### 60-Second Elevator Pitch (Quick Jury Round)
1. **Pan-India Overview (10 sec)**: Open Ministry dashboard → interactive India map with district anomaly concentrations.
2. **District Audit Dossier (15 sec)**: Drill down to District Authority view → Work #4523 flagged at 82/100 risk score.
3. **Explainability Waterfall (10 sec)**: Expand SHAP breakdown → *Cost overrun (+42 pts), Vendor concentration (+31 pts), Sanction delay (+14 pts)*.
4. **Vendor Collusion Evidence (10 sec)**: Vendor network chart showing 62% district tender capture by single entity.
5. **Role Transitions (10 sec)**: Seamless switch across MP, District, and Ministry dashboards.
6. **Closing Impact (5 sec)**: >₹120 Cr/year projected savings with direct eSAKSHI API compatibility.

### 5-Minute Comprehensive Presentation
1. **The Problem & CAG Audit Truth** (45 sec) — ₹161 Cr unsupported spending, ghost assets, and lack of automated alerts.
2. **System Architecture & 3-Layer Defense** (60 sec) — Deterministic rules, Isolation Forest, XGBoost risk scoring.
3. **National Ministry Command Center** (60 sec) — Heatmaps, inter-state disparity analysis, systemic leakage patterns.
4. **District Authority & CAG Audit Console** (60 sec) — Actionable queue, vendor collusion graphs, instant dossier generation.
5. **MP Empowerment Dashboard** (45 sec) — Real-time ₹5 Cr entitlement tracking, constituent visibility, and recommendation status.
6. **Vision AI & Mobile Verification Subsystem** (30 sec) — EXIF geotagging, De-Fake image check, CLIP description matching.

---

## Technical Details

### 3-Layer Detection Engine
- **Layer 1: Deterministic Rules** — Python gatekeeper enforcing statutory guidelines and expenditure limits.
- **Layer 2: Isolation Forest** — Unsupervised outlier detection isolating novel multidimensional deviations without labels.
- **Layer 3: XGBoost Classifier** — Supervised gradient boosting trained on 143K+ records calibrated with CAG-labeled fraud patterns.
- **Explainability**: SHAP TreeExplainer delivering transparent per-feature point additions for non-technical officers.
- **Ensemble Formula**: $\text{ARI} = \max\Big(\text{Rule Penalty}, \; 0.55 \times \text{XGBoost} + 0.45 \times \text{IsoForest}\Big)$

### Feature Engineering (Canonical 12-Dimensional Vector)
1. `cost_overrun_ratio`: (sanctioned - estimate) / estimate
2. `vendor_concentration`: vendor_works / total_district_works
3. `sanction_delay_days`: sanction_date - recommendation_date
4. `work_category_risk`: prohibited=1.0, sensitive=0.5, normal=0.1
5. `tenure_phase`: early=0.2, mid=0.5, late=0.8, post=1.0
6. `mp_utilization_rate`: total_spent / total_allocated
7. `amount_near_threshold`: min_distance_to(₹50L, ₹1Cr, ₹5Cr)
8. `district_anomaly_rate`: historical_flagged / total_works
9. `days_since_sanction`: today - sanction_date (uncompleted)
10. `works_same_vendor_30d`: count(vendor_works in last 30 days)
11. `geographic_match`: work_state == mp_state (RS boundary compliant)
12. `completion_rate`: completed / sanctioned for agency

### Fraud Rules Framework
- **12 Core Priority Rules**: Directly operationalized for real-time alerts (COST-001/002, TIME-001/002, VEND-001/002, DUP-001, GEO-001, CAT-001, UTIL-001, THRESH-001, TENURE-001).
- **Full Taxonomy (30+ Rules)**: Exhaustive statutory catalog across 8 categories detailed in `FRAUD_DETECTION_RULES.md`.

---

*Document Version: 2.0 | Last Updated: September 2026*  
*MPLADS AI Sentinel — Project Overview & Pitch Strategy*
