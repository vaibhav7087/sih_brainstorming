# MPLADS AI Sentinel — Final Architecture

**Problem Statement:** 26102 — AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation  
**Organization:** MoSPI / DIID  
**Theme:** Smart Automation  
**Category:** Software

---

## 1. System Overview

MPLADS AI Sentinel is a **standalone AI-powered monitoring platform** with role-based dashboards that detect anomalies, fraud, and inefficiencies in MPLADS implementation. The system includes a proposed AI verification layer for Implementing Agencies that could plug into the existing eSAKSHI portal.

### What We Build (Hackathon)
- 3 role-based dashboards (MP, DA+CAG, Ministry)
- AI anomaly detection engine (XGBoost + Isolation Forest)
- SHAP explainability for every alert
- Geographic visualization (India map with heatmap)
- Demo data with real CAG-flagged fraud patterns

### What We Propose (Feature)
- IA Agency App with photo upload + geotagging
- AI verification layer (De-Fake + CLIP + geotag check)
- Stage payment verification (3+ stages)
- Could plug into eSAKSHI portal

### What We Mention (Future)
- Full eSAKSHI integration via API
- Satellite verification (Sentinel-2)
- Mobile app for citizen ground-truthing
- Federated learning across states

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    IA AGENCY APP (Proposed Feature)              │
│                                                                 │
│  Field worker uploads:                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Photo    │ │ Milestone│ │ Location │ │ Amount   │          │
│  │ (camera) │ │ (stage)  │ │ (GPS)    │ │ (₹)      │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  Stage 1: First Payment (25%)                                   │
│  Stage 2: Second Payment (50%)                                  │
│  Stage 3: Completion (25%)                                      │
│  (Additional stages configurable per work type)                 │
│                                                                 │
│  Could integrate with eSAKSHI portal (future)                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AI VERIFICATION SERVER                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  VERIFICATION CHECKS                                     │   │
│  │                                                          │   │
│  │  1. De-Fake Model (Pre-trained)                          │   │
│  │     → Is this photo AI-generated?                        │   │
│  │     → Confidence: 0.0 (real) to 1.0 (fake)              │   │
│  │                                                          │   │
│  │  2. Geotag Verification                                  │   │
│  │     → EXIF GPS coordinates vs work location              │   │
│  │     → Tolerance: 500m radius                             │   │
│  │                                                          │   │
│  │  3. CLIP Image-Work Matching                             │   │
│  │     → Does this photo match the work description?        │   │
│  │     → "Road construction" ↔ image of road                │   │
│  │     → Cosine similarity > 0.7 = match                    │   │
│  │                                                          │   │
│  │  4. Timeline Verification                                │   │
│  │     → EXIF date vs sanction date                         │   │
│  │     → Photo taken after sanction?                        │   │
│  │     → Photo taken before completion claim?               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  VERIFICATION RESULT                                     │   │
│  │                                                          │   │
│  │  ✅ ALL PASS → "Verified" → Payment recommended          │   │
│  │  ⚠️ PARTIAL → "Suspicious" → DA review required          │   │
│  │  ❌ FAIL → "Rejected" → Payment blocked, IA notified     │   │
│  │                                                          │   │
│  │  For completion (stricter):                               │   │
│  │  • Minimum 3 photos from different angles                │   │
│  │  • Before/after comparison (CLIP)                        │   │
│  │  • Quality check (resolution, clarity)                   │   │
│  │  • Cross-check with anomaly list                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Runs at central server (offline not a concern)                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ML ANOMALY DETECTION ENGINE                   │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │ XGBoost          │  │ Isolation Forest│  │ SHAP           │ │
│  │ (Supervised)     │  │ (Unsupervised)  │  │ (Explainability│ │
│  │                  │  │                  │  │                │ │
│  │ Trained on:      │  │ Finds:           │  │ Shows:         │ │
│  │ CAG-labeled      │  │ Statistical      │  │ Why each work  │ │
│  │ fraud patterns   │  │ outliers         │  │ was flagged    │ │
│  │                  │  │                  │  │                │ │
│  │ Features:        │  │ Features:        │  │ Per-work:      │ │
│  │ - cost_overrun   │  │ - all numeric    │  │ waterfall chart│ │
│  │ - vendor_conc    │  │   features       │  │                │ │
│  │ - sanction_delay │  │                  │  │ Global:        │ │
│  │ - work_category  │  │                  │  │ feature        │ │
│  │ - tenure_phase   │  │                  │  │ importance     │ │
│  └────────┬─────────┘  └────────┬────────┘  └───────┬────────┘ │
│           │                     │                    │          │
│           └─────────────────────┼────────────────────┘          │
│                                 │                               │
│                    ┌────────────▼────────────┐                  │
│                    │  ENSEMBLE RISK SCORE    │                  │
│                    │  0-100 per work         │                  │
│                    │  + SHAP explanation     │                  │
│                    └────────────┬────────────┘                  │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              MULTI-TIER GOVERNANCE DASHBOARDS                   │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │ MP Dashboard    │  │ DA+CAG Dashboard│  │ Ministry Nat'l │ │
│  │                 │  │                 │  │ Dashboard      │ │
│  │ • Fund balance  │  │ • Risk ranking  │  │ • India map    │ │
│  │ • Works list    │  │ • Flagged works │  │ • State metrics│ │
│  │ • AI flags      │  │ • Vendor charts │  │ • Systemic risk│ │
│  │ • Constituency  │  │ • Approvals     │  │ • Heatmaps     │ │
│  └─────────────────┘  └─────────────────┘  └────────────────┘ │
│                                                                 │
│  Switch views seamlessly with animated transition               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. User Roles & Dashboards

### Role 1: MP (Member of Parliament)

**Question answered:** "What's happening with MY ₹5 crore in MY constituency?"

| Component | What It Shows |
|-----------|--------------|
| Fund Status | Allocated / Spent / Committed / Available |
| My Works | Total, completed, in progress, pending, AI-flagged |
| AI Flags | Works in constituency flagged by anomaly detection |
| SHAP Explanation | Why each work was flagged (cost, vendor, delay) |
| Photo Upload | Upload photos of completed works (proposed feature) |
| Milestones | Track work progress through stages |

### Role 2: DA + CAG (District Authority + Auditor)

**Question answered:** "What's suspicious in MY district? What should I investigate?"

| Tab | What It Shows |
|-----|--------------|
| Pending Approvals | Works waiting for DA sanction with AI verification verdict |
| AI Flags | Vendor collusion, cost overrun, delayed works |
| Audit List | Top suspicious works ranked by risk score (CAG view) |
| SHAP Details | Feature importance for each flagged work |

### Role 3: Ministry (MoSPI)

**Question answered:** "What's happening across ALL states?"

| Component | What It Shows |
|-----------|--------------|
| National Overview | Total works, value, anomaly rate, flagged count |
| India Map | Heatmap of anomaly rates by state (click to drill) |
| Systemic Patterns | AI-detected patterns across all data |
| Verification Stats | How many photos verified/rejected (proposed feature) |
| State Comparison | Which states have highest/lowest anomaly rates |

---

## 4. AI & Anomaly Detection Architecture (3-Layer Defense)

To ensure zero blind spots, the detection pipeline employs a **three-layered defense model**:

```
  ┌────────────────────────────────────────────────────────────────┐
  │ LAYER 1: DETERMINISTIC STATUTORY RULE ENGINE                    │
  │ Hard-checks guideline violations, prohibited items & splitting │
  └───────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
  ┌────────────────────────────────────────────────────────────────┐
  │ LAYER 2: ISOLATION FOREST (UNSUPERVISED OUTLIER DETECTOR)      │
  │ Identifies unknown & zero-day multi-dimensional deviations     │
  └───────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
  ┌────────────────────────────────────────────────────────────────┐
  │ LAYER 3: XGBOOST RISK CLASSIFIER (SUPERVISED RISK SCORING)     │
  │ Quantifies empirical probability of fraud based on CAG findings│
  └───────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
  ┌────────────────────────────────────────────────────────────────┐
  │ EXPLAINABILITY LAYER: SHAP TREE-EXPLAINER & LOCAL ATTRIBUTIONS │
  │ Transparent, legally defensible per-work audit reasoning       │
  └────────────────────────────────────────────────────────────────┘
```

### Layer 1: Deterministic Rule Engine
- **Role**: Immediate enforcement of statutory thresholds and prohibited categories.
- **Rule Corpus**: 12 core priority rules (detailed in §7; selected from the 30+ taxonomy in `FRAUD_DETECTION_RULES.md`).
- **Trigger**: Policy violations (e.g., prohibited works, cost > 2x estimate, repeat vendor allocation).

### Layer 2: Isolation Forest (Unsupervised)
```
Purpose: Find multivariate outliers and unexpected anomalies without historical labels
Training Data: All continuous and encoded attributes across all active works
Why: Uncovers novel collusion, abnormal cost-to-asset ratios, and artificial spending rushes
Output: Anomaly score (-1 = outlier, 1 = normal), normalized to 0–100 Outlier Scale
```

### Layer 3: XGBoost Classifier (Supervised)
```
Purpose: Predict calibrated probability of fraud and project failure based on CAG historical audits
Training Data: 143,257 records (data.gov.in) + labeled fraud instances from CAG audit reports & report.md
Features (Authoritative 12-Dimensional Vector):
  1. cost_overrun_ratio: (sanctioned - estimate) / estimate
  2. vendor_concentration: vendor_works / total_district_works
  3. sanction_delay_days: sanction_date - recommendation_date
  4. work_category_risk: prohibited=1.0, sensitive=0.5, normal=0.1
  5. tenure_phase: early=0.2, mid=0.5, late=0.8, post=1.0
  6. mp_utilization_rate: total_spent / total_allocated
  7. amount_near_threshold: min_distance_to(₹50L, ₹1Cr, ₹5Cr)
  8. district_anomaly_rate: historical_flagged / total_works
  9. days_since_sanction: today - sanction_date (uncompleted)
  10. works_same_vendor_30d: count(vendor_works in last 30 days)
  11. geographic_match: work_state == mp_state (RS State boundary compliant)
  12. completion_rate: completed / sanctioned for agency

Output: Calibrated Risk Probability (0.0 to 1.0) and Risk Score (0–100)
```

### Composite Risk Scoring Formula
$$\text{ARI} = \max\Big(\text{Rule Penalty}, \; 0.55 \times \text{XGBoost Score} + 0.45 \times \text{IsoForest Outlier Score}\Big)$$
- Direct guideline breaches (e.g. prohibited work categories) automatically assign maximum severity.
- Subtle multivariate deviations are continuously ranked by the ensemble score.

### SHAP Explainability (Audit-Grade Transparency)
```
Purpose: Explain WHY each work was flagged in human-understandable terms
Method: TreeExplainer on XGBoost model with background reference distribution
Output per work:
  - Waterfall chart: Top features shifting score away from baseline
  - Feature magnitude: Quantified point attribution (+42, +31, +14)
  - Natural language briefing: Plain-English summary paragraph for district officers

Example:
  "Work #4523 Flagged [HIGH RISK - Score 82/100]:
   • Cost overrun ratio: 340% above median (+42 points)
   • Vendor concentration: 62% of district works (+31 points)
   • Sanction delay: 89 days vs 45-day statutory threshold (+14 points)"
```

### AI Verification Models (Proposed Feature)

| Model | Purpose | Input | Output |
|-------|---------|-------|--------|
| De-Fake | Detect AI-generated images | Photo | Fake probability 0-1 |
| Geotag Check | Verify location match | EXIF GPS + work coordinates | Pass/Fail + distance |
| CLIP | Match image to description | Photo + work description text | Cosine similarity 0-1 |
| Timeline Check | Verify date consistency | EXIF date + sanction date | Pass/Fail |

---

## 5. Data Sources

| Source | Data | Access | Volume |
|--------|------|--------|--------|
| data.gov.in | MPLADS works, sanctions, payments | REST API | 143,257 records |
| eSAKSHI Portal | Real-time work status | Dashboard scraping | 18th Lok Sabha |
| CAG Reports | Historical fraud findings | PDF extraction | ~500 labeled cases |
| report.md | 85 fraud/misuse reports | Already compiled | Documented patterns |

---

## 6. Feature Engineering

### 12-Dimensional Feature Vector

| # | Feature | Calculation | Why It Matters |
|---|---------|-------------|----------------|
| 1 | cost_overrun_ratio | (sanctioned - estimate) / estimate | #1 fraud predictor |
| 2 | vendor_concentration | vendor_works / total_district_works | Collusion signal |
| 3 | sanction_delay_days | sanction_date - recommendation_date | Process violation |
| 4 | work_category_risk | prohibited=1.0, sensitive=0.5, normal=0.1 | Guideline violation |
| 5 | tenure_phase | early=0.2, mid=0.5, late=0.8, post=1.0 | Spending rush pattern |
| 6 | mp_utilization_rate | total_spent / total_allocated | Underutilization |
| 7 | amount_near_threshold | min_distance_to(₹50L, ₹1Cr, ₹5Cr) | Transaction splitting |
| 8 | district_anomaly_rate | historical_flagged / total_works | Systemic issues |
| 9 | days_since_sanction | today - sanction_date | Delayed works |
| 10 | works_same_vendor_30d | count(vendor_works in last 30 days) | Vendor concentration |
| 11 | geographic_match | work_state == mp_state | Geographic violation |
| 12 | completion_rate | completed / sanctioned for agency | Agency reliability |

---

## 7. Fraud Detection Rules (Mapped to CAG Findings)

> [!NOTE]
> The table below outlines the **12 Core Priority Rules** running in the primary gatekeeper pipeline. For the exhaustive regulatory corpus of **30+ detailed rules** across 8 fraud categories, consult [FRAUD_DETECTION_RULES.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/mplads/FRAUD_DETECTION_RULES.md).

| Rule ID | Rule | CAG Finding | Severity |
|---------|------|-------------|----------|
| COST-001 | cost_overrun_ratio > 0.20 | Inflated cost estimates | HIGH |
| COST-002 | cost_overrun_ratio > 1.00 | >2x market rate | CRITICAL |
| TIME-001 | sanction_delay_days > 45 | Late sanctioning | HIGH |
| TIME-002 | days_since_sanction > 365 AND status != completed | Abandoned works | HIGH |
| VEND-001 | vendor_concentration > 0.30 | Vendor collusion | HIGH |
| VEND-002 | vendor_concentration > 0.50 | Severe concentration | CRITICAL |
| DUP-001 | cosine_similarity(work_A, work_B) > 0.85 | Duplicate works | HIGH |
| GEO-001 | geographic_match == false | Wrong constituency | CRITICAL |
| CAT-001 | work_category IN prohibited_list | Prohibited works | CRITICAL |
| UTIL-001 | mp_utilization_rate < 0.40 | Severe underutilization | MEDIUM |
| THRESH-001 | works_near_threshold > 5 | Transaction splitting | HIGH |
| TENURE-001 | tenure_phase == late AND spending_rate > 2x | End-of-tenure rush | MEDIUM |

---

## 8. Tech Stack

### Frontend
```
Framework:        Next.js 15 (App Router) + TypeScript
UI Library:       Tailwind CSS v4 + shadcn/ui
State Management: Zustand
Charts:           Recharts
Maps:             React-Leaflet + OpenStreetMap
Icons:            Lucide React
Animations:       Framer Motion (dashboard switching)
```

### Backend
```
Framework:        FastAPI (Python 3.11+)
Database:         SQLite (local/demo) → PostgreSQL (production)
ORM:              SQLAlchemy
API Docs:         Auto-generated (Swagger UI / OpenAPI)
```

### ML / Anomaly Engine
```
Layer 1 Rules:    Python Deterministic Engine (MPLADS 2023 Guidelines)
Layer 2 Outliers: Isolation Forest (scikit-learn)
Layer 3 Scoring:  XGBoost Classifier (calibrated on CAG cases)
Explainability:   SHAP (TreeExplainer with waterfall visualizer)
Data Processing:  pandas, NumPy, SciPy
CV Verification:  De-Fake (image forgery) + CLIP (multimodal alignment)
```

### Deployment & Infrastructure
```
Frontend:         Vercel / Cloud Container
Backend:          Railway / NIC / MeghRaj Government Cloud
Database:         PostgreSQL
Operating Cost:   ₹0 (evaluation prototype) / ~₹15,000/mo (enterprise cloud)
```

---

## 9. Demo Flow (60 Seconds)

| Step | Screen | What Judge Sees | Time |
|------|--------|----------------|------|
| 1 | Login | Role selector: MP / DA+CAG / Ministry | 5 sec |
| 2 | DA Dashboard | District overview, pending approvals with AI verdicts | 10 sec |
| 3 | Work Detail | Click Work #4523 → AI verification: "Photo ✅, Geotag ✅" | 10 sec |
| 4 | AI Flags | SHAP explanation: "Cost overrun 340%, vendor 62%" | 10 sec |
| 5 | Photo Upload | Upload photo → AI checks: "Fake detected!" or "Verified" | 10 sec |
| 6 | View Switch | Popups → MP view → Ministry view (animation) | 10 sec |
| 7 | Closing | "This could plug into eSAKSHI as AI verification layer" | 5 sec |

---

## 10. What Makes This Win

| Criteria | How We Score |
|----------|-------------|
| **Innovation (20%)** | 3-Layer Defense model combining statutory rules, zero-day anomaly isolation, and CAG-calibrated risk scoring |
| **Technical Feasibility (20%)** | Fully explainable pipeline (SHAP) + pre-trained vision models (De-Fake & CLIP) — no unproven black boxes |
| **Impact (20%)** | Solves the 98.53% ghost asset handover crisis and ₹161Cr unsupported expenditure documented by CAG |
| **Presentation (15%)** | High-polish live dashboards with animated role transitions and interactive GIS heatmaps |
| **Completeness (10%)** | Comprehensive rule taxonomy, data pipeline, edge-case mitigation, and statutory compliance |

### Sharp Differentiator
> "Rules-first, explainable defense — every alert has a human-readable SHAP attribution rooted in CAG audit findings, not an opaque AI probability."

### Data Source
> "143,257 records from data.gov.in, empirical fraud patterns from CAG audits, and 85 verified investigative reports."

---

## 11. Future Scope (Enterprise Roadmap)

1. **eSAKSHI Integration** — Direct RESTful middleware injecting verification verdicts into the eSAKSHI payment approval workflow.
2. **Satellite Progress Validation** — Automated Sentinel-2 optical/SAR imagery diffing for large infrastructure works (>₹50 Lakh).
3. **Citizen Ground-Truthing Mobile App** — Crowdsourced photo geotagging and asset feedback.
4. **Federated Cross-Scheme Intelligence** — Connecting MPLADS with MGNREGA and PMGSY procurement graphs to detect cross-scheme double-billing.
5. **Automated Audit Dossiers** — LLM-driven generation of CAG-formatted executive inspection reports.

---

## 12. Legal, Statutory & Jurisdictional Framework

### 12.1 Compliance by Design
- **Digital Personal Data Protection (DPDP) Act, 2023**: Pseudonymization of citizen petitioners and whistleblowers; zero public exposure of sensitive vendor banking information; role-scoped access control.
- **RTI Act, 2005**: All sanctioned amounts, physical milestones, and completion certificates remain fully queryable in public data views to ensure grassroots transparency.
- **MPLADS Guidelines 2023 Compliance**: Strict codification of revised circulars (April 2023) enforcing direct-benefit transfers and mandatory web portal tracking.

### 12.2 Parliamentary Jurisdictions
- **Lok Sabha MPs**: Works strictly confined to their territorial constituencies (except for allowed disaster relief under Section 5.1).
- **Rajya Sabha MPs**: Entitled to recommend works anywhere within the State from which they were elected (Rule 2.4). Geographic anomaly boundaries are automatically scoped state-wide.
- **Nominated MPs (LS/RS)**: Permitted to recommend works anywhere across India (Rule 2.5). System bypasses state boundary alerts while enforcing sector and cost checks.

---

*Document Version: 2.0*  
*Last Updated: September 15, 2026*  
*Prepared for: Smart India Hackathon 2026 — Problem Statement 26102*
