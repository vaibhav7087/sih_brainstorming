# System Implementation & Deployment Plan — MPLADS AI Sentinel

**Smart India Hackathon 2026 | Problem Statement 26102 (MoSPI / DIID)**  
**Theme:** Smart Automation | **Status:** Shortlisting & PPT Round Architecture

---

## 1. System Architecture Overview

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

## 2. Technology Stack & Component Blueprints

| Subsystem | Primary Technology | Architectural Role |
|:---|:---|:---|
| **Frontend Framework** | Next.js 15 (App Router) + TypeScript | Server-side rendering, role-based dashboard switching, micro-frontend ready |
| **Styling & Components**| Tailwind CSS + shadcn/ui | High-contrast government aesthetic, responsive layout, dark/light modes |
| **Backend API** | FastAPI (Python 3.11+) | Async high-throughput REST endpoints, automatic OpenAPI/Swagger documentation |
| **Database & Cache** | PostgreSQL (Neon / Cloud) + SQLite (Demo) | ACID compliance, JSON schema attributes, spatial constituency metadata |
| **Layer 1: Rule Engine**| Python Deterministic Filter | Millisecond enforcement of statutory bans, cost ceilings, and tender splits |
| **Layer 2: Anomaly ML** | Isolation Forest (scikit-learn) | Unsupervised multivariate outlier detection without requiring prior labels |
| **Layer 3: Risk Model** | XGBoost Classifier | Calibrated gradient boosting predicting fraud likelihood (0–100 scale) |
| **Explainable AI** | SHAP (SHapley Additive exPlanations) | Generates per-work waterfall contribution plots and natural language summaries |
| **Computer Vision** | De-Fake + CLIP (openai/clip-vit-base) | Generative image fraud detection + semantic photo-to-work description alignment |
| **GIS & Mapping** | React-Leaflet + OpenStreetMap | Interactive India map, drill-down state/district heatmaps, coordinate pins |

---

## 3. Canonical 12-Dimensional Feature Pipeline

Every work across all 788 MPs is evaluated on this standardized feature vector:

1. **`cost_overrun_ratio`**: `(sanctioned_amount - estimated_cost) / estimated_cost`
2. **`vendor_concentration`**: `vendor_works / total_district_works` (30% warning, 50% critical)
3. **`sanction_delay_days`**: `sanction_date - recommendation_date` (>45-day statutory SLA)
4. **`work_category_risk`**: Statutory guideline compliance risk (prohibited=1.0, sensitive=0.5, normal=0.1)
5. **`tenure_phase`**: Parliamentary term phase (early=0.2, mid=0.5, late=0.8, post=1.0)
6. **`mp_utilization_rate`**: `total_spent / total_allocated` (flags chronic underutilization <40%)
7. **`amount_near_threshold`**: Proximity to technical sanction thresholds (`₹50 Lakh`, `₹1 Crore`, `₹5 Crore`)
8. **`district_anomaly_rate`**: Historical proportion of flagged works in the district
9. **`days_since_sanction`**: `current_date - sanction_date` for stalled/uncompleted assets
10. **`works_same_vendor_30d`**: Frequency of contract awards to identical vendor in 30-day window
11. **`geographic_match`**: Boundary verification (Constituency for LS, State for RS, Pan-India for Nominated)
12. **`completion_rate`**: `completed / sanctioned` delivery ratio for the assigned Implementing Agency

---

## 4. Phased Enterprise Rollout Roadmap

```
  ┌───────────────────────┐      ┌────────────────────────┐      ┌───────────────────────┐
  │   PHASE 1 (PILOT)     │ ───► │  PHASE 2 (FULL SUITE)  │ ───► │ PHASE 3 (INTEGRATION) │
  │ Rule Gatekeeper &     │      │ ML Anomaly Classifier  │      │ Direct eSAKSHI API &  │
  │ Data Ingestion Engine │      │ & SHAP Explainability  │      │ IA Photo Verification │
  └───────────────────────┘      └────────────────────────┘      └───────────────────────┘
```

### Phase 1: Ingestion & Rule-Based Gatekeeper
- Establish automated data acquisition pipeline ingesting 143,257 records from data.gov.in and eSAKSHI.
- Operationalize the 12 Core Priority Rules to catch immediate procedural and guideline violations.
- Baseline District Authority and CAG audit dashboard interface.

### Phase 2: ML Anomaly Classifier & SHAP Explainability
- Calibration and deployment of Isolation Forest (unsupervised) and XGBoost (supervised).
- Integrated SHAP waterfall visualizer and natural language audit dossier generator.
- Pan-India interactive GIS heatmaps with cross-district benchmarking.

### Phase 3: eSAKSHI API Integration & Field Verification
- Secure RESTful middleware directly interfacing with MoSPI's eSAKSHI portal.
- Implementing Agency (IA) mobile verification flow (EXIF GPS check, De-Fake, and CLIP matching).
- Automated executive audit briefings for Ministry leadership.

---

## 5. 12 Core Priority Statutory Rules

| Rule ID | Mathematical Trigger | CAG Audit Pattern Mapped | Enforcement Action |
|:---|:---|:---|:---|
| **COST-001** | `cost_overrun_ratio > 0.20` | Unjustified cost inflation | Flagged for technical review |
| **COST-002** | `cost_overrun_ratio > 1.00` | >2x official market estimate | High-severity sanction block |
| **TIME-001** | `sanction_delay_days > 45` | Administrative stalling past guideline limit | Escalated to State Nodal Authority |
| **TIME-002** | `days_since_sanction > 365` (uncompleted) | Stalled / abandoned project | On-site verification notice issued |
| **VEND-001** | `vendor_concentration > 0.30` | Vendor capture / favoritism | Procurement scrutiny alert |
| **VEND-002** | `vendor_concentration > 0.50` | Syndicate monopolization | Critical audit red flag |
| **DUP-001** | `cosine_similarity > 0.85` | Duplicate / ghost asset submission | Cross-district duplication freeze |
| **GEO-001** | Boundary mismatch | Recommending outside permitted jurisdiction | Immediate guideline rejection |
| **CAT-001** | Prohibited category keyword match | Prohibited commercial or religious construction | Direct statutory disqualification |
| **UTIL-001** | `mp_utilization_rate < 0.40` | Chronic underutilization of public funds | Velocity advisory in MP dashboard |
| **THRESH-001**| `works_near_threshold > 5` | Split contracts bypassing sanction caps | Aggregated contract audit |
| **TENURE-001**| Late tenure & `spending_rate > 2x` | Pre-election spending rush | Priority physical inspection queue |

*(For the complete 30+ rule statutory taxonomy, refer to `FRAUD_DETECTION_RULES.md`)*

---

## 6. PPT Shortlisting Presentation Strategy

### 60-Second Elevator Pitch
1. **Pan-India Heatmap (10s)**: Display Ministry Command Center with national anomaly distribution across 543 LS + 245 RS constituencies.
2. **District Audit Dossier (15s)**: Drill down into DA Console to inspect Work #4523 flagged at 82/100 risk.
3. **SHAP Waterfall Attribution (10s)**: Prove explainability: *Cost overrun (+42), Vendor capture (+31), Delay (+14)*.
4. **Vendor Collusion Graph (10s)**: Visual graph exposing a single contractor holding 62% of district tenders.
5. **Role-Based Perspectives (10s)**: Demonstrate frictionless transition between MP, District Collector, and Ministry views.
6. **Value Proposition (5s)**: >₹120 Cr/year projected savings and immediate plug-in feasibility with eSAKSHI.

---

*Document Version: 2.0 | Last Updated: September 2026*  
*MPLADS AI Sentinel — Project Implementation Plan for SIH 2026*
