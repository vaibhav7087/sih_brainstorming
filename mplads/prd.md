# Product Requirements Document (PRD)
## MPLADS AI Sentinel — AI-Powered Anomaly, Fraud & Inefficiency Detection System

**Problem Statement ID:** 26102  
**Organization:** MoSPI (Ministry of Statistics and Programme Implementation)  
**Department:** Data Informatics & Innovation Division (DIID)  
**Theme:** Smart Automation  
**Category:** Software  

---

## 1. Problem Statement

### 1.1 Background

The Members of Parliament Local Area Development Scheme (MPLADS) is a Central Sector Scheme launched in 1993. Each MP is allocated ₹5 crore per annum (disbursed in two installments of ₹2.5 crore) to recommend developmental works for creating durable community assets. The scheme involves:

- **788 Members of Parliament** (543 Lok Sabha constituencies + 245 Rajya Sabha members + nominated MPs)
- **Thousands of works** recommended, sanctioned, and executed annually across 700+ districts
- **Multiple stakeholders**: MPs, District Authorities (DAs), Implementing Agencies (IAs), State Nodal Authorities, and MoSPI
- **Massive fund flow**: Over ₹3,940+ crore annual entitlement, with active managed outlays exceeding ₹4,400+ crore when accounting for cumulative/carried-forward balances and administrative allocations

Since April 2023, MPLADS transitioned to the **eSAKSHI portal** (mplads.mospi.gov.in) — a fully digital platform. However, this platform **tracks WHAT happened but cannot detect WHAT IS WRONG**.

### 1.2 Core Problem

Key gaps identified through CAG audits and 85 documented fraud/misuse reports:

| Gap | Impact |
|-----|--------|
| No anomaly detection | Suspicious patterns unnoticed until manual audits |
| No predictive analytics | Cannot predict fraud before disbursement |
| No image verification | Ghost assets (98.53% had no handover record) |
| No explainable AI | No audit-ready explanation for flagged works |
| Reactive monitoring | Issues found months/years after occurrence |

### 1.3 Documented Irregularities (from CAG Reports)

| Finding | Impact |
|---------|--------|
| ₹161 crore unsupported expenditure | Financial loss |
| 98.53% works with no handover record | Ghost assets |
| Inflated cost estimates (>2x market rate) | Overpayment |
| Duplicate works (same location, different IDs) | Fund duplication |
| Works on prohibited sites (religious, commercial) | Guideline violation |
| Vendor concentration (>50% works to one vendor) | Collusion risk |
| Abandoned/incomplete works (>2 years) | Asset loss |
| End-of-tenure spending rushes | Timely execution concern |

---

## 2. Proposed Solution

### 2.1 Product Name
**MPLADS AI Sentinel** — An AI-powered monitoring platform with role-based dashboards that detect anomalies, fraud, and inefficiencies in MPLADS implementation.

### 2.2 Vision
Transform MPLADS monitoring from **reactive tracking** to **proactive AI-powered detection** with explainable risk scoring and verification.

### 2.3 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                 IA AGENCY APP (Proposed Feature)                │
│  Photo upload + Geotagging + Milestone submission               │
│  Could plug into eSAKSHI portal (future)                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI VERIFICATION SERVER (Computer Vision)           │
│  De-Fake (fake image) + Geotag check + CLIP (image-work match) │
│  Stage payment verification (3+ milestones)                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              3-LAYER ML ANOMALY DETECTION ENGINE                │
│  Layer 1: Deterministic Rule Engine (12 Core / 30+ Full Rules)  │
│  Layer 2: Isolation Forest (Unsupervised Zero-Day Outliers)     │
│  Layer 3: XGBoost (Supervised CAG-Calibrated Risk Classifier)   │
│  Explainability: SHAP Waterfalls & Natural Language Insights    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              MULTI-TIER GOVERNANCE DASHBOARDS                   │
│  MP Dashboard │ DA+CAG Dashboard │ Ministry National Dashboard   │
│  (Smooth contextual view switching)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Target Users

| Dashboard | Users | Primary Question Answered |
|-----------|-------|--------------------------|
| **MP Dashboard** | Member of Parliament (LS & RS) | "What's happening with MY ₹5 crore annual allocation?" |
| **DA+CAG Dashboard** | District Authority + CAG Auditor | "Which projects show irregular expenditure or red flags in MY district?" |
| **Ministry Dashboard** | MoSPI & State Nodal Officials | "Where are the systemic leakages across states and departments?" |

### 2.5 Scope Taxonomy: Evaluated vs. Propose vs. Roadmap

| Scope | Components | Purpose |
|-------|------------|---------|
| **Core Evaluation MVP** | 3-Layer ML Detection Engine + SHAP Explainability + 3 Role-Based Dashboards | Live demonstratable AI audit engine with CAG-calibrated real dataset |
| **Proposed Subsystems** | Implementing Agency (IA) Mobile App + AI Photo Verification (De-Fake + CLIP) | Eliminates ghost assets at source before fund disbursement |
| **Production Roadmap** | Direct eSAKSHI API bridge + Sentinel-2 Satellite validation + Citizen Audit App | Enterprise national-scale deployment across all 788 MPs |

---

## 3. Feature Requirements

### 3.1 Core Detection & Explainability Capabilities

#### F1: 3-Layer Anomaly Detection Engine
- **Layer 1: Deterministic Rule Engine** — Instant enforcement of statutory limits (12 core priority rules from 30+ taxonomy; e.g., >2x cost estimate, unapproved categories, transaction splitting).
- **Layer 2: Isolation Forest (Unsupervised)** — Isolates multi-attribute zero-day anomalies and unexpected procedural deviations without requiring prior labels.
- **Layer 3: XGBoost Classifier (Supervised)** — Computes an authoritative composite Anomaly Risk Index (0–100) calibrated against historical CAG audit patterns.
- **Unified Risk Scoring** — Combines rule penalties, outlier distances, and supervised risk probabilities into a single defensible index.

#### F2: SHAP Explainability (Audit-Grade Transparency)
- **Per-Work Waterfall Attribution** — Graphically displays positive/negative contributions: *"Cost overrun (+42 pts), Vendor concentration (+31 pts), Sanction delay (+14 pts)"*.
- **Global Feature Importance** — Macro-level ranking of systemic risk drivers across constituencies.
- **Natural Language Audit Briefs** — Generates plain-English summary paragraphs for non-technical district officers and auditors.

#### F3: Role-Based Governance Dashboards
- **MP Dashboard**: Real-time entitlement utilization, pending sanctions, constituency map, and transparent status of citizen recommendations.
- **DA + CAG Dashboard**: District-wide anomaly rank list, vendor concentration graphs, transaction audit drill-downs, and instant flagged work dossiers.
- **Ministry National Dashboard**: Pan-India heatmaps, state-to-state performance benchmarks, and macro expenditure velocity charts.
- **Dynamic Role Switcher**: Instant transition between perspectives for comprehensive presentation.

#### F4: Geographic Visualization
- **Interactive India map** with anomaly heatmap
- **Click-to-drill-down** from state → district → constituency → work
- **Work pins** color-coded by risk level

#### F5: Alert System
- **12 detection rules** mapped to CAG findings
- **5 severity levels**: CRITICAL, HIGH, MEDIUM, LOW, NORMAL
- **Alert types**: Cost Overrun, Delay, Duplicate, Vendor Collusion, Geographic Violation, Category Violation

### 3.2 Proposed Features (IA Agency App)

#### F6: Photo Upload with Verification
- **Geotagging** — EXIF GPS coordinates vs work location
- **AI fake image detection** — De-Fake model (pre-trained)
- **CLIP image-work matching** — "Does this photo match the work description?"
- **Timeline verification** — EXIF date vs sanction date

#### F7: Milestone Submission
- **3-stage payment flow**: First Payment (25%) → Second Payment (50%) → Completion (25%)
- **AI verification at each stage** — photo must pass checks before payment recommended
- **Stricter completion verification** — minimum 3 photos, before/after comparison
- **Configurable stages** — can add more stages per work type

#### F8: eSAKSHI Integration (Future)
- **API-based integration** — AI verification layer plugs into existing eSAKSHI portal
- **Real-time verification** — IA uploads → AI checks → DA approves with confidence
- **Ghost asset prevention** — every work gets AI-verified certificate

### 3.3 Future Scope

1. Satellite verification (Sentinel-2 imagery)
2. Citizen ground-truthing mobile app
3. Federated learning across states
4. LLM-powered automated audit reports
5. Cross-scheme fraud detection (MPLADS + MGNREGA + PMAY)

---

## 4. Fraud Detection Rules (Mapped to CAG Findings)

> [!NOTE]
> The table below lists the **12 Core Priority Detection Rules** directly operationalized in the primary screening pipeline. For the complete statutory, financial, and procedural taxonomy of **30+ detailed rules** across 8 distinct categories, see [FRAUD_DETECTION_RULES.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/mplads/FRAUD_DETECTION_RULES.md).

| Rule ID | Rule | CAG Finding | Severity |
|---------|------|-------------|----------|
| COST-001 | cost_overrun_ratio > 0.20 | Inflated cost estimates | HIGH |
| COST-002 | cost_overrun_ratio > 1.00 | >2x market rate | CRITICAL |
| TIME-001 | sanction_delay_days > 45 | Late sanctioning | HIGH |
| TIME-002 | days_since_sanction > 365 AND incomplete | Abandoned works | HIGH |
| VEND-001 | vendor_concentration > 0.30 | Vendor collusion | HIGH |
| VEND-002 | vendor_concentration > 0.50 | Severe concentration | CRITICAL |
| DUP-001 | cosine_similarity > 0.85 | Duplicate works | HIGH |
| GEO-001 | work_state != mp_state | Geographic violation | CRITICAL |
| CAT-001 | work_category IN prohibited_list | Prohibited works | CRITICAL |
| UTIL-001 | mp_utilization_rate < 0.40 | Underutilization | MEDIUM |
| THRESH-001 | works_near_threshold > 5 | Transaction splitting | HIGH |
| TENURE-001 | tenure_phase == late AND high spending | End-of-tenure rush | MEDIUM |

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 15 + shadcn/ui + Tailwind CSS | Professional dashboard, SSR, free deploy |
| **Backend** | FastAPI (Python) | Best for ML integration, auto API docs |
| **Database** | SQLite (hackathon) → PostgreSQL (production) | Zero config, scalable |
| **ML Core** | XGBoost + Isolation Forest + SHAP | Proven, explainable, fast |
| **Fake Detection** | De-Fake (pre-trained) | AI-generated image detection |
| **Image Matching** | CLIP (openai/clip-vit-base) | Photo-description matching |
| **Maps** | React-Leaflet + OpenStreetMap | Free, no API key |
| **Charts** | Recharts | Standard dashboard charts |
| **Animations** | Framer Motion | Dashboard view switching |
| **Deploy** | Vercel (frontend) + Railway (backend) | Free tiers |

### 5.2 Feature Engineering (12-Dimensional Vector)

| # | Feature | Calculation | Why It Matters |
|---|---------|-------------|----------------|
| 1 | cost_overrun_ratio | (sanctioned - estimate) / estimate | #1 fraud predictor |
| 2 | vendor_concentration | vendor_works / total_district_works | Collusion signal |
| 3 | sanction_delay_days | sanction_date - recommendation_date | Process violation |
| 4 | work_category_risk | prohibited=1.0, sensitive=0.5, normal=0.1 | Guideline violation |
| 5 | tenure_phase | early/mid/late election cycle | Spending rush pattern |
| 6 | mp_utilization_rate | total_spent / total_allocated | Underutilization |
| 7 | amount_near_threshold | min_distance_to(₹50L, ₹1Cr, ₹5Cr) | Transaction splitting |
| 8 | district_anomaly_rate | historical_flagged / total_works | Systemic issues |
| 9 | days_since_sanction | today - sanction_date | Delayed works |
| 10 | works_same_vendor_30d | count(vendor_works in last 30 days) | Vendor concentration |
| 11 | geographic_match | work_state == mp_state | Geographic violation |
| 12 | completion_rate | completed / sanctioned for agency | Agency reliability |

---

## 6. Data Requirements

### 6.1 Data Sources

| Source | Data | Access | Volume |
|--------|------|--------|--------|
| data.gov.in | MPLADS works, sanctions, payments | REST API | 143,257 records |
| eSAKSHI Portal | Real-time work status | Dashboard scraping | 18th Lok Sabha |
| CAG Reports | Historical fraud findings | PDF extraction | ~500 labeled cases |
| report.md | 85 fraud/misuse reports | Already compiled | Documented patterns |

### 6.2 Data Schema

```
Key Fields:
- state, constituency, district (geographic)
- MP name, party, tenure (political)
- work description, category, amount (financial)
- vendor name, agency (entities)
- recommendation_date, sanction_date, completion_date (temporal)
- expenditure_amount, payment_status (financial)
- geo_coordinates, photographs (verification)
```

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **ML inference**: <1 second per request
- **API response**: <200ms average
- **Dashboard load**: <3 seconds

### 7.2 Scalability & Cost Efficiency
- **Cloud-Native Architecture**: Microservices with auto-scaling container workloads (FastAPI + Next.js).
- **Cost Efficiency**: Zero-cost evaluation prototype; estimated production runtime under ₹12,000–₹18,000/month on government cloud (MeghRaj / NIC Cloud) or equivalent tier.

### 7.3 Statutory & Policy Compliance
- **Digital Personal Data Protection (DPDP) Act, 2023**: Anonymization of citizen grievance records, strict RBAC (Role-Based Access Control) for MP and vendor PII.
- **RTI Act, 2005 Compliance**: Public access to sanctioned works, expenditures, and completion metrics while shielding active audit investigation logs.
- **MPLADS Guidelines 2023 Adherence**: Direct compliance with revised operational guidelines issued by MoSPI (effective April 2023).

### 7.4 Accessibility & Usability (GIGW / WCAG 2.1 AA)
- **Guidelines for Indian Government Websites (GIGW)** and **WCAG 2.1 AA** compliance (high-contrast ratios, screen reader support, keyboard navigable).
- **Bilingual Support**: Full Hindi and English localization with dynamic translation toggle.
- **Responsive Layout**: Seamless presentation on mobile, tablet, and command-center desktop displays.

---

## 8. Edge Case & Jurisdictional Handling

### 8.1 Data Quality & Missing Fields

| Edge Case | Handling Strategy |
|-----------|-------------------|
| Missing completion dates | Use "last updated" timestamp as conservative proxy; flag overdue milestone |
| Missing vendor names | Group as "Unspecified Vendor"; trigger audit warning if concentration >20% |
| Inconsistent entity names | Levenshtein distance + soundex alias clustering for vendor deduplication |
| Duplicate records | Deduplication key on (work_id, sanction_date, sanctioned_amount) |

### 8.2 Jurisdictional & Contextual Nuances

| Parameter | Regulatory Context | System Handling Rule |
|-----------|--------------------|----------------------|
| **Rajya Sabha (Elected)** | State-wide recommendation privilege | Allowed to recommend works in one or more districts across elected State (Rule 2.4). Geographic boundary check scoped to State, not Lok Sabha constituency. |
| **Nominated MPs (LS & RS)** | Pan-India jurisdiction | Permitted to recommend works anywhere in India (Rule 2.5). Nationwide geographic check enabled. |
| **Disaster / Calamity Works** | Natural disasters of severe nature | Section 5.1 allowance (up to ₹1 Cr outside state/constituency) flagged as compliant under Calamity Exemption code. |
| **Electoral Model Code of Conduct** | Election freeze periods | Automatic exclusion from sanction delay penalization during ECI Model Code of Conduct duration. |
| **End-of-Tenure Spending** | Last 6 months of MP tenure | Flagged as informational velocity anomaly, preventing artificial false-positive penalty while highlighting rush. |

### 8.3 Adversarial Resilience & Anti-Gaming Measures
- **Threshold Splitting Evasion**: Aggregation window (30-day sliding window per vendor/agency) to detect multiple contracts just below the ₹50 Lakh / ₹1 Crore technical sanction thresholds.
- **Shell Vendor Networks**: Graph analysis to identify common bank account hashes, shared phone numbers, or identical addresses across distinct registered vendor names.
- **Metadata Spoofing**: EXIF timestamp vs. upload timestamp delta verification, camera hardware hash check, and duplicate image hashing (pHash) against the national asset database.

---

## 9. Success Metrics

| Metric | Target | Measurement Methodology |
|--------|--------|-------------------------|
| **Anomaly Detection Rate** | >85% of CAG-flagged irregularities | Recall evaluated on historical CAG audit cases |
| **False Positive Rate** | <12% | Proportion of audited alerts flagged as non-issues by DAs |
| **Inference Latency** | <1.2 seconds | End-to-end time to process a 12-feature work profile |
| **Potential Public Savings** | >₹120 crore/year projected | Projected prevention of abandoned/inflated/duplicate works |

---

## 10. Phased Implementation & Rollout Roadmap

```
  ┌───────────────────────┐      ┌────────────────────────┐      ┌───────────────────────┐
  │   PHASE 1 (PILOT)     │ ───► │  PHASE 2 (FULL SUITE)  │ ───► │ PHASE 3 (INTEGRATION) │
  │ Rule Gatekeeper &     │      │ ML Anomaly Classifier  │      │ Direct eSAKSHI API &  │
  │ Data Ingestion Engine │      │ & SHAP Explainability  │      │ IA Photo Verification │
  └───────────────────────┘      └────────────────────────┘      └───────────────────────┘
```

### Phase 1: Ingestion & Rule-Based Gatekeeper
- Automated pipeline ingesting data.gov.in and eSAKSHI historical datasets.
- Deployment of the 12 Core High-Impact Statutory Rules (cost overruns, transaction splitting, unapproved categories).
- Role-based baseline dashboards for District Authorities and CAG auditors.

### Phase 2: ML Engine & Multi-Tier Governance Dashboards
- Calibration of the 12-dimensional feature extraction pipeline.
- Training and hyperparameter tuning of Isolation Forest (unsupervised) and XGBoost (supervised).
- Per-work SHAP waterfall explainability charts and natural language report generation.
- Interactive pan-India GIS heatmaps and cross-constituency comparative benchmarks.

### Phase 3: eSAKSHI Integration & Automated Auditing
- RESTful microservice integration directly embedding the AI Sentinel verification engine into the eSAKSHI workflow.
- Computer Vision milestone verification pipeline (CLIP description-matching and De-Fake photo authentication).
- Periodic automated executive audit summaries delivered to MoSPI leadership and State Nodal Authorities.

---

## 11. System Risks & Mitigation Strategies

| Operational Risk | Severity | Proactive Mitigation Strategy |
|------------------|----------|-------------------------------|
| False Positives alienating MPs | HIGH | Tiered confidence scores (Informational vs Actionable) + SHAP explainability showing clear metrics |
| Incomplete Historical Datasets | MEDIUM | Median imputation for non-critical features + explicit "Data Confidence Index" for each work |
| Data Drift over Time | MEDIUM | Scheduled model recalibration as quarterly CAG and state audit reports are published |
| Network / Server Latency | LOW | Edge caching of national heatmap aggregates; asynchronous batch processing for large district imports |

---

## 12. Future Scope

1. **eSAKSHI Integration** — AI verification layer plugs into existing portal
2. **IA Agency App** — Photo upload + geotagging + milestone submission
3. **Satellite Verification** — Sentinel-2 imagery for construction progress
4. **Citizen App** — Mobile app for ground-truthing works
5. **Federated Learning** — Privacy-preserving cross-state analysis
6. **LLM Reports** — Automated audit report generation

---

*Document Version: 2.0*  
*Last Updated: September 15, 2026*  
*Prepared for: Smart India Hackathon 2026 — Problem Statement 26102*
