# MPLADS AI Sentinel — Intelligent Anomaly, Fraud & Inefficiency Detection System

[![Problem Statement](https://img.shields.io/badge/SIH%202026-PS%2026102-blue.svg)](https://www.sih.gov.in/)
[![Ministry](https://img.shields.io/badge/Ministry-MoSPI%20%7C%20DIID-darkgreen.svg)](https://mospi.gov.in/)
[![Category](https://img.shields.io/badge/Theme-Smart%20Automation-purple.svg)](#)
[![Status](https://img.shields.io/badge/Evaluation-PPT%20Shortlisting%20Ready-success.svg)](#)

> **"Transforming MPLADS monitoring from passive transaction logging into an active, explainable 3-Layer AI audit defense."**

---

## 🏛️ Problem Statement Context

- **Scheme**: Members of Parliament Local Area Development Scheme (MPLADS)
- **Problem Statement ID**: **26102**
- **Organization**: Ministry of Statistics and Programme Implementation (MoSPI)
- **Department**: Data Informatics & Innovation Division (DIID)
- **Scale**: **788 Members of Parliament** (543 Lok Sabha + 245 Rajya Sabha) across **700+ districts**, with an annual entitlement exceeding **₹3,940+ crore** and active managed outlays past **₹4,400+ crore**.

### The Core Problem
While MoSPI successfully digitized transactions via the **eSAKSHI portal**, the portal only records *what happened*, but **cannot detect what is wrong**:
1. **₹161+ Crore** unsupported and irregular expenditure documented in CAG Performance Audits (Report No. 31/2010, Report No. 18/2021).
2. **98.53% Ghost Asset Risk**: CAG revealed that 98.53% of sampled assets lacked any inspection or formal handover records to user agencies.
3. **No Automated Anomaly Detection**: Procurement collusion, artificial transaction splitting below technical sanctions, and sanction delays remain unnoticed until manual audits years later.

---

## 🛡️ Proposed Solution: 3-Layer Explainable AI Sentinel

MPLADS AI Sentinel establishes an automated, multi-tiered audit and verification defense:

```
                      DATA INGESTION
          (data.gov.in • eSAKSHI • CAG Audit Archives)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             3-LAYER ML ANOMALY DETECTION ENGINE             │
│                                                             │
│  [LAYER 1] Deterministic Statutory Rule Gatekeeper          │
│            • Enforces MPLADS 2023 Guidelines & thresholds   │
│                                                             │
│  [LAYER 2] Isolation Forest (Unsupervised)                  │
│            • Isolates novel zero-day multi-attribute skews  │
│                                                             │
│  [LAYER 3] XGBoost Risk Classifier (Supervised)             │
│            • Calibrated on 500+ CAG findings & benchmarks   │
│                                                             │
│  [EXPLAINABILITY] SHAP TreeExplainer & Local Waterfalls     │
│            • Legally defensible attribution for every alert │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            MULTI-TIER GOVERNANCE DASHBOARDS                 │
│  • MP Dashboard: Entitlement tracking & work visibility     │
│  • DA + CAG Console: Actionable anomaly queue & dossiers    │
│  • Ministry National View: Pan-India heatmaps & benchmarks  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Document Hierarchy & Source of Truth

To ensure absolute consistency across presentation slides, technical defenses, and documentation, follow this hierarchy:

| Document | Primary Role | Source of Truth For |
|:---|:---|:---|
| **[prd.md](prd.md)** | **Master Product Requirements** | Functional scope, stakeholder requirements, and non-functional compliance |
| **[FINAL_ARCHITECTURE.md](FINAL_ARCHITECTURE.md)** | **Technical Master Architecture** | 3-Layer defense model, canonical 12 features, and multi-tier dashboards |
| **[FRAUD_DETECTION_RULES.md](FRAUD_DETECTION_RULES.md)** | **Statutory Rules Corpus** | 12 Core MVP rules + full taxonomy of 30+ rules mapped to CAG findings |
| **[SIH_WINNING_TACTICS.md](SIH_WINNING_TACTICS.md)** | **Jury & Pitch Strategy** | 60-second pitch, jury defense scripts, scoring rubrics, and competitive edge |
| **[explain.md](explain.md)** | **Executive Summary** | Plain-English briefing, jury questions, and 5-minute deep-dive presentation |
| **[report.md](report.md)** | **Empirical Audit Database** | 85 documented fraud/misuse exposés and official CAG report citations |
| **[TECH_STACK.md](TECH_STACK.md)** | **Engineering Blueprint** | Complete software libraries, database schemas, and cloud deployment tiers |
| **[ML_AI_ANOMALY_DETECTION_ARCHITECTURE.md](ML_AI_ANOMALY_DETECTION_ARCHITECTURE.md)** | **Deep Research Roadmap** | Advanced GNN, LSTM forecasting, and deep computer vision specifications |

---

## 🎯 Canonical 12-Dimensional Feature Vector

Every work across all 788 MPs is evaluated on this standardized vector:

| # | Feature Key | Mathematical Formulation | Regulatory & Audit Rationale |
|:---|:---|:---|:---|
| 1 | `cost_overrun_ratio` | `(sanctioned - estimate) / estimate` | #1 predictor of inflated estimates and corrupt revisions |
| 2 | `vendor_concentration` | `vendor_works / total_district_works` | Identifies procurement monopolization and syndicate capture |
| 3 | `sanction_delay_days` | `sanction_date - recommendation_date` | Flags administrative stalling exceeding statutory 45-day SLA |
| 4 | `work_category_risk` | Categorical risk index (0.1 to 1.0) | Enforces bans on prohibited categories (commercial/religious) |
| 5 | `tenure_phase` | Election cycle phase (0.2, 0.5, 0.8, 1.0) | Detects artificial end-of-tenure expenditure rushes |
| 6 | `mp_utilization_rate` | `total_spent / total_allocated` | Evaluates chronic underutilization vs over-commitment |
| 7 | `amount_near_threshold`| `min_dist(₹50L, ₹1Cr, ₹5Cr)` | Intercepts artificial contract splitting to bypass approvals |
| 8 | `district_anomaly_rate`| `historical_flagged / total_works` | Measures systemic district administrative delinquency |
| 9 | `days_since_sanction` | `today - sanction_date` (uncompleted) | Identifies stalled or abandoned ghost projects |
| 10 | `works_same_vendor_30d`| Count of vendor tenders in last 30 days | Exposes rapid-fire contract awarding to preferred vendors |
| 11 | `geographic_match` | Boolean / RS State boundary check | Enforces constituency and state jurisdictional boundaries |
| 12 | `completion_rate` | `completed / sanctioned` (for agency) | Quantifies implementing agency historical delivery capacity |

---

## ⚖️ Legal, Statutory & Jurisdictional Defensibility

1. **Digital Personal Data Protection (DPDP) Act, 2023**: Anonymization of citizen petitioners, role-scoped credentialing, zero public leakage of vendor bank credentials.
2. **RTI Act, 2005**: Full public transparency of completed assets and sanctioned expenditure while protecting active audit dossiers.
3. **MPLADS Revised Guidelines (April 2023)**: Strict adherence to web portal mandates and direct-benefit release triggers.
4. **Parliamentary Jurisdictions**:
   - **Lok Sabha MPs**: Confined to their respective constituencies (disaster exception up to ₹1 Cr under Section 5.1).
   - **Rajya Sabha MPs**: Permitted to recommend works across their entire elected State (Rule 2.4).
   - **Nominated MPs**: Permitted to recommend works anywhere in India (Rule 2.5).

---

## ⏱️ The Winning 60-Second Demo Flow

| Step | Perspective | High-Impact Demonstration Point | Time |
|:---|:---|:---|:---|
| **1** | **Ministry Command View** | Interactive India GIS map highlighting state anomaly heatmaps and systemic leaks. | 10 sec |
| **2** | **District Authority Console**| Drill down to District view; open Work #4523 flagged at **82/100 Anomaly Risk Index**. | 15 sec |
| **3** | **SHAP Explainability** | Expand waterfall attribution: *Cost Overrun (+42), Vendor Collusion (+31), Delay (+14)*. | 10 sec |
| **4** | **Vendor Collusion Graph** | District procurement graph showing one syndicate capturing 62% of tenders. | 10 sec |
| **5** | **Multi-Tier Role Switching**| Instant animated transition across MP, District Authority, and Ministry roles. | 10 sec |
| **6** | **Impact & Integration** | Close with projected >₹120 Cr/yr public savings and direct eSAKSHI API compatibility. | 5 sec |

---

*MPLADS AI Sentinel — Smart India Hackathon 2026 Submission Repository*  
*Maintained for Problem Statement 26102 (MoSPI / DIID)*
