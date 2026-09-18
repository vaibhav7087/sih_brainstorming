# MPLADS AI Fraud Detection Rules & Pattern Recognition Framework

## Problem Statement 26102 | Statutory, Audit & Machine-Enforceable Fraud Rules Corpus

---

## 1. RULE-BASED DETECTION PATTERNS (Hard Rules)

### 1.1 Cost Deviation Detection

| Rule ID | Rule Name | Condition | Threshold | Severity | CAG Reference |
|---------|-----------|-----------|-----------|----------|---------------|
| COST-001 | Estimate Inflation | `(Sanctioned_Amount - Engineer_Estimate) / Engineer_Estimate > threshold` | >20% over estimate | HIGH | CAG 2010: Inflated cost estimates documented |
| COST-002 | Cost Per Unit Anomaly | `Actual_Cost_Per_Unit > District_Average * 1.5` | 50% above district average | HIGH | - |
| COST-003 | Progressive Cost Escalation | `Final_Payment > Sanctioned_Amount` | Any overrun | CRITICAL | CAG: Cost overruns exceeding sanctioned amounts |
| COST-004 | Round Number Inflation | `Sanctioned_Amount % 100000 == 0 AND description contains vague items` | Pattern match | MEDIUM | - |
| COST-005 | Estimate-Sanction Mismatch | `|MP_Recommended_Amount - Sanctioned_Amount| > 25% of MP_Amount` | >25% deviation | MEDIUM | MPLADS 3.8: MP consent needed if estimate exceeds recommendation |

**Implementation Logic:**
```
RULE COST-001:
  IF (sanctioned_amount - engineer_estimate) / engineer_estimate > 0.20
  THEN flag = "HIGH"
  ADD to alert_queue with evidence: [engineer_estimate, sanctioned_amount, % deviation]
  TRIGGER: Manual review by District Authority
```

### 1.2 Time Delay Detection

| Rule ID | Rule Name | Condition | Threshold | Severity | Guidelines Reference |
|---------|-----------|-----------|-----------|----------|---------------------|
| TIME-001 | Sanction Delay | `Sanction_Date - Recommendation_Date > 45 days` | >45 days | HIGH | Para 3.2.4: 45-day sanction limit |
| TIME-002 | Completion Delay | `Current_Date - Sanction_Date > 365 days AND status != "Completed"` | >365 days | HIGH | Para 3.2.12: Generally not exceed 1 year |
| TIME-003 | Ex-MP Work Delay | `Current_Date - MP_Demitting_Date > 545 days AND status != "Completed"` | >18 months post-demitting | CRITICAL | Para 10.6.1: 18-month completion mandate |
| TIME-004 | No Payment After Sanction | `Sanction_Date > 90 days ago AND Payment_Amount == 0` | >90 days no payment | MEDIUM | Ministry monitoring: 3-month payment threshold |
| TIME-005 | Abandoned Work Detection | `Last_Progress_Update > 180 days AND status == "In Progress"` | >6 months no update | HIGH | CAG: Abandoned/suspended works |
| TIME-006 | End-of-Tenure Rush | `Recommendation_Date within 60 days of election AND total_recommendations > 40% of annual entitlement` | Pattern match | MEDIUM | CAG: End-of-tenure spending spikes |

**Implementation Logic:**
```
RULE TIME-001:
  IF (sanction_date - recommendation_date) > 45
  THEN flag = "HIGH"
  ADD to alert_queue with evidence: [recommendation_date, sanction_date, delay_days]
  ESCALATE to State Nodal Authority

RULE TIME-006:
  IF recommendation_date BETWEEN (election_date - 60 days) AND election_date
     AND count(recommendations in this period) > 0.40 * annual_entitlement
  THEN flag = "MEDIUM"
  PATTERN: End-of-tenure spending rush
```

### 1.3 Duplicate Detection

| Rule ID | Rule Name | Condition | Threshold | Severity | CAG Reference |
|---------|-----------|-----------|-----------|----------|---------------|
| DUP-001 | Exact Name Duplicate | `Levenshtein(work_name_A, work_name_B) < 3 AND location_A == location_B` | Fuzzy match | HIGH | CAG: Duplicate works |
| DUP-002 | Same Location Same Category | `location_A == location_B AND category_A == category_B AND year_A != year_B` | Exact match | HIGH | - |
| DUP-003 | Similar Description Duplicate | `TF-IDF_Similarity(work_description_A, work_description_B) > 0.85` | >85% similarity | MEDIUM | - |
| DUP-004 | Split Work Detection | `work_A + work_B == logical_work AND vendor_A == vendor_B AND date_proximity < 30 days` | Pattern match | HIGH | CAG: Split purchases to avoid scrutiny |
| DUP-005 | Beneficiary Duplicate | `beneficiary_name_A == beneficiary_name_B AND work_type_A == work_type_B` | Exact match | HIGH | CAG: Ghost beneficiaries |

**Implementation Logic:**
```
RULE DUP-001:
  FOR each work_pair (A, B) WHERE A.location == B.location:
    similarity = levenshtein(work_name_A, work_name_B) / max(len_A, len_B)
    IF similarity > 0.85 THEN
      flag = "HIGH"
      evidence = [work_name_A, work_name_B, location, similarity_score]
      ADD to duplicate_cluster
```

### 1.4 Vendor Concentration Analysis

| Rule ID | Rule Name | Condition | Threshold | Severity | Red Flag Reference |
|---------|-----------|-----------|-----------|----------|-------------------|
| VEND-001 | Single Vendor Dominance | `vendor_works / total_works_in_district > threshold` | >30% of district works | HIGH | FBI: Same vendor repeatedly winning |
| VEND-002 | Repeat Winner Pattern | `vendor_wins / vendor_bids > 0.7 AND vendor_bids > 5` | >70% win rate | HIGH | - |
| VEND-003 | Vendor-MP Link | `vendor_owner family == MP family OR shared address` | Direct link | CRITICAL | CAG: Vendor collusion |
| VEND-004 | Vendor Rotation | `Vendor_A wins Q1, Vendor_B wins Q2, Vendor_A wins Q3` | Rotation pattern | HIGH | OECD: Bid rotation |
| VEND-005 | Shell Company Indicator | `vendor_age < 2 years AND vendor_works > 10 AND capital < ₹5 lakh` | Pattern match | HIGH | - |
| VEND-006 | Geographic Vendor Anomaly | `vendor_registered_address far_from work_location > 100km` | >100km distance | MEDIUM | - |

**Implementation Logic:**
```
RULE VEND-001:
  FOR each district, fiscal_year:
    vendor_works_count = COUNT(DISTINCT works WHERE vendor = X)
    total_works = COUNT(DISTINCT works WHERE district = Y)
    concentration = vendor_works_count / total_works
    IF concentration > 0.30 THEN
      flag = "HIGH"
      evidence = [vendor_name, concentration, total_works]
```

### 1.5 Geographic Anomaly Detection

| Rule ID | Rule Name | Condition | Threshold | Severity | Guidelines Reference |
|---------|-----------|-----------|-----------|----------|---------------------|
| GEO-001 | Outside Constituency | `work_location NOT IN mp_constituency AND mp_type == "Lok Sabha"` | Any occurrence | CRITICAL | Lok Sabha: Constituency only |
| GEO-002 | Outside State (RS MP) | `work_state != mp_state AND mp_type == "Rajya Sabha"` | Any occurrence | CRITICAL | Rajya Sabha: Within state |
| GEO-003 | Excess Outside Allocation | `sum(outside_works) > 500000 AND mp_type != "Nominated"` | >₹50 lakh/year | HIGH | Para 3.1.2.1: ₹50 lakh ceiling |
| GEO-004 | Distance Anomaly | `distance(mp_office, work_location) > 50km AND no justification` | >50km | MEDIUM | - |
| GEO-005 | SC/ST Allocation Violation | `sc_st_works / total_works < 0.15 AND sc_population > 0` | <15% for SC areas | HIGH | Para: 15% SC, 7.5% ST allocation |

**Implementation Logic:**
```
RULE GEO-001:
  IF mp_type == "Lok Sabha" AND work_location NOT IN constituency_boundary:
    flag = "CRITICAL"
    evidence = [mp_name, work_location, constituency, gps_coordinates]
    BLOCK: Fund release until resolved
```

### 1.6 Category Violation Detection

| Rule ID | Rule Name | Condition | Source | Severity | Guidelines Reference |
|---------|-----------|-----------|--------|----------|---------------------|
| CAT-001 | Prohibited Work Type | `work_category IN prohibited_list` | MPLADS Annexure-II | CRITICAL | Prohibited works list |
| CAT-002 | Maintenance Work Disguised | `work_name CONTAINS ["repair", "maintenance", "renovation"] AND amount > 50 lakh` | Text analysis | HIGH | Maintenance prohibited (except ₹50L repair) |
| CAT-003 | Commercial Use | `beneficiary_type == "commercial" OR work_benefits == "private"` | Beneficiary analysis | CRITICAL | Commercial/private prohibited |
| CAT-004 | Religious Work | `work_location_type == "religious" OR work_name CONTAINS ["temple", "mosque", "church", "gurudwara"]` | Location/text | CRITICAL | Religious works prohibited |
| CAT-005 | Individual Benefit | `work_beneficiary_count == 1 AND work_type != "SC/ST welfare"` | Beneficiary count | HIGH | Individual assets prohibited |
| CAT-006 | Welcome Gate | `work_name CONTAINS ["gate", "dwar", "welcome", "pravesh"]` | Text match | CRITICAL | Swagat Dwars prohibited |

**Implementation Logic:**
```
RULE CAT-001:
  prohibited_keywords = ["office building", "residential", "commercial", 
                         "religious", "welcome gate", "swagat dwar",
                         "individual benefit", "grant", "loan"]
  IF ANY keyword IN work_description OR work_category:
    flag = "CRITICAL"
    evidence = [matched_keyword, work_description, work_category]
    REJECT: Do not sanction
```

---

## 2. ML-BASED PATTERN RECOGNITION

### 2.1 Unusual Spending Clusters

**Feature Engineering:**
```python
features = {
    "spending_velocity": "works_per_month / avg_works_per_month",
    "amount_concentration": "max(single_work_amount) / total_spending",
    "temporal_clustering": "std(dates_of_recommendations) / mean_interval",
    "category_entropy": "-sum(p_category * log(p_category))",
    "geographic_spread": "std(work_distances_from_constituency)"
}
```

**Anomaly Detection Model:**
- Algorithm: Isolation Forest + Local Outlier Factor (LOF)
- Training data: Historical MPLADS data from e-SAKSHI portal
- Output: Anomaly score (0-1) for each work/MP/district

**Detection Targets:**
| Pattern | Indicator | ML Approach |
|---------|-----------|-------------|
| Spending spike | 3x average in single month | Time series anomaly |
| Category shift | Sudden change in work types | Distribution shift |
| Geographic clustering | All works in one small area | Spatial clustering |
| Amount clustering | Many works at ₹49.9 lakh (just below threshold) | Benford's Law analysis |

### 2.2 Seasonal Fraud Patterns

**End-of-Tenure Rush Detection:**
```python
def detect_tenure_rush(mp_works, election_date):
    pre_election_60_days = mp_works[mp_works.date > election_date - 60days]
    pre_election_180_days = mp_works[mp_works.date > election_date - 180days]
    
    rush_ratio = len(pre_election_60_days) / len(pre_election_180_days)
    amount_ratio = pre_election_60_days.amount.sum() / mp_works.annual_entitlement
    
    if rush_ratio > 0.6 and amount_ratio > 0.5:
        return "HIGH_RISK_TENURE_RUSH"
```

**Financial Year-End Pattern:**
```python
def detect_fy_end_rush(works):
    march_works = works[works.month == 3]
    avg_monthly = works.groupby('month').size().mean()
    
    if len(march_works) > 2.5 * avg_monthly:
        return "FY_END_SPENDING_RUSH"
```

### 2.3 Network Analysis for Collusion

**Graph Construction:**
- Nodes: MPs, District Officials, Vendors, Implementing Agencies
- Edges: Work relationships, financial flows, shared addresses

**Network Metrics:**
| Metric | Threshold | Fraud Indicator |
|--------|-----------|-----------------|
| Vendor clustering coefficient | >0.7 | Collusion ring |
| MP-Vendor bipartite density | >0.5 | Favoritism |
| Official-Vendor shared connections | >3 | Kickback network |
| Transaction cycle detection | Circular flows | Money laundering |

**Community Detection:**
- Algorithm: Louvain Modularity
- Target: Identify tightly-knit groups of repeat transactors
- Alert: When community contains MP + Vendor + Official with high internal density

### 2.4 Behavioral Patterns of Repeat Offenders

**MP Behavioral Profile:**
```python
mp_features = {
    "avg_cost_deviation": "mean((sanctioned - estimate) / estimate)",
    "vendor_reuse_rate": "unique_vendors / total_works",
    "completion_rate": "completed_works / total_works",
    "delay_frequency": "delayed_works / total_works",
    "outside_work_ratio": "outside_constituency_works / total_works",
    "sc_st_compliance": "sc_st_works / mandated_sc_st_amount"
}
```

**Risk Scoring Model:**
- Algorithm: Gradient Boosted Trees (XGBoost)
- Target variable: CAG-flagged works (labeled historical data)
- Output: Fraud probability (0-1) per MP/work

**Repeat Offender Indicators:**
| Pattern | Weight | Evidence |
|---------|--------|----------|
| 3+ works with same vendor in same year | 0.8 | Vendor concentration |
| 2+ cost overruns >30% | 0.7 | Cost manipulation |
| Works marked complete but no payment | 0.9 | Ghost completion |
| Works in non-constituency areas | 0.6 | Geographic violation |

---

## 3. SPECIFIC MPLADS VIOLATION TYPES

### 3.1 Per MPLADS 2023 Guidelines: Eligible vs Ineligible Works

**Automated Eligibility Checker:**
```
INPUT: work_description, work_category, beneficiary_type, location

RULES:
  IF work_category IN eligible_categories:
    eligible = True
  IF work_description MATCHES prohibited_patterns:
    eligible = False
  IF beneficiary_type == "individual" AND work_type != "SC/ST":
    eligible = False
  IF location_type == "religious":
    eligible = False
  
  RETURN eligibility_decision WITH reason
```

**Eligible Categories (12 sectors):**
1. Public and community buildings
2. Public conveniences, safety and security
3. Education
4. Public health
5. Drinking water and sanitation
6. Irrigation, drainage and flood control
7. Animal husbandry, dairy and fisheries
8. Agriculture and farmer welfare
9. Energy supply and distribution
10. Railways, roads, bridges and pathways
11. Environment, wildlife, forest and natural resources
12. Public recreational facilities, sports and parks

**Prohibited Works (13 categories):**
1. Operation and maintenance
2. Residential buildings (govt/PSU)
3. Commercial and private establishments
4. Naming assets after persons
5. Grants and loans
6. Contribution to relief funds
7. Land acquisition
8. Reimbursement for completed works
9. CSR fund pooling
10. Religious works/premises
11. Welcome gates (Swagat Dwars)
12. Works in unauthorized colonies
13. Recurring expenditure

### 3.2 Fund Utilization Timeline Violations

| Violation Type | Timeline | Detection Rule |
|---------------|----------|----------------|
| Late Sanction | >45 days from recommendation | TIME-001 |
| Late Completion | >12 months from sanction | TIME-002 |
| Late Ex-MP Completion | >18 months from demitting | TIME-003 |
| No Payment Post-Sanction | >90 days no payment | TIME-004 |
| Unused Allocation | <50% utilization by FY end | New Rule |

**Fund Flow Anomaly:**
```
RULE FUND-001:
  IF funds_released > 0 AND expenditure_reported == 0 AND days_since_release > 90:
    flag = "FUND_DIVERSION_RISK"
    evidence = [release_date, amount, no_expenditure_reported]
```

### 3.3 Asset Creation vs Maintenance Works

**Asset Lifecycle Validation:**
```python
def validate_asset_lifecycle(work):
    if work.type == "maintenance":
        if work.amount > 5000000:  # ₹50 lakh
            return "VIOLATION: Maintenance exceeds ₹50L limit"
        if work.existing_asset_id is None:
            return "VIOLATION: No existing asset found for maintenance"
    
    if work.type == "creation":
        if work.completion_certificate is None:
            return "WARNING: No completion certificate"
        if work.user_agency is None:
            return "WARNING: No user agency assigned"
    
    return "COMPLIANT"
```

### 3.4 Natural Calamity Fund Misuse

**Calamity Fund Validation:**
```
RULE CALAMITY-001:
  IF work.category == "natural_calamity":
    IF no_gazette_notification_for_calamity:
      flag = "CRITICAL"
      evidence = [work_location, claimed_calamity, notification_status]
    
    IF amount > 1000000 AND calamity_type != "severe":
      flag = "HIGH"
      evidence = [amount, calamity_type, guideline_limit]
    
    IF work_location NOT IN affected_area:
      flag = "CRITICAL"
      evidence = [work_location, affected_area_boundary]
```

---

## 4. FALSE POSITIVE MANAGEMENT

### 4.1 False Positive Reduction Strategies

**Strategy 1: Contextual Filtering**
```python
def filter_false_positives(alert):
    # Allow legitimate exceptions
    if alert.type == "DELAY" and alert.reason == "COVID":
        return "SUPPRESS"  # COVID suspension period
    
    if alert.type == "OUTSIDE_CONSTITUENCY" and alert.amount < 500000:
        return "SUPPRESS"  # Within ₹50L limit
    
    if alert.type == "VENDOR_CONCENTRATION" and alert.district_rural == True:
        return "LOW_PRIORITY"  # Rural areas may have fewer vendors
    
    return "REVIEW"
```

**Strategy 2: Threshold Calibration**
| Alert Type | Initial Threshold | Adjusted Threshold | Rationale |
|------------|------------------|-------------------|-----------|
| Cost deviation | >20% | >25% for small works | Small works have higher variance |
| Time delay | >45 days | >60 days for hilly terrain | Terrain justification |
| Vendor concentration | >30% | >40% for tribal areas | Limited vendor pool |

**Strategy 3: Multi-Signal Correlation**
```python
def correlated_alert_check(work_id):
    alerts = get_alerts(work_id)
    
    # Single alerts may be false positives
    if len(alerts) == 1:
        confidence = 0.4
    # Multiple correlated alerts increase confidence
    elif len(alerts) >= 3:
        confidence = 0.9
    
    # Specific combinations are strong indicators
    if "COST_INFLATION" in alerts and "VENDOR_REPEAT" in alerts:
        confidence = 0.95
    
    return confidence
```

### 4.2 Human-in-the-Loop Verification

**Verification Workflow:**
```
Layer 1: AI Auto-Classification
  ├── LOW confidence → Auto-suppress with logging
  ├── MEDIUM confidence → Queue for junior officer review
  └── HIGH confidence → Queue for senior officer review

Layer 2: Officer Review
  ├── Approve alert → Forward to investigation
  ├── Reject alert → Mark as false positive with reason
  └── Modify alert → Adjust severity/threshold

Layer 3: Audit Trail
  └── All decisions logged with officer ID, timestamp, reasoning
```

**Review Dashboard Metrics:**
| Metric | Target | Current |
|--------|--------|---------|
| False positive rate | <15% | - |
| Review turnaround | <48 hours | - |
| Officer agreement rate | >80% | - |
| Escalation rate | <10% | - |

### 4.3 Feedback Mechanism for Rule Refinement

**Continuous Learning Loop:**
```
1. Collect officer decisions (approve/reject alerts)
2. Retrain ML models quarterly with new labels
3. Adjust rule thresholds based on false positive rates
4. Add new rules from CAG findings and officer suggestions
5. Remove rules that generate >90% false positives
```

**Rule Performance Dashboard:**
```python
rule_metrics = {
    "alert_volume": "count of alerts per rule",
    "true_positive_rate": "confirmed_fraud / total_alerts",
    "false_positive_rate": "rejected_alerts / total_alerts",
    "detection_latency": "days_from_occurrence_to_alert",
    "financial_impact": "amount_fraud_prevented"
}
```

**Quarterly Review Process:**
1. Analyze rule performance metrics
2. Identify rules with >50% false positive rate
3. Adjust thresholds based on district-specific patterns
4. Add new rules from recent CAG findings
5. Retrain ML models with latest labeled data

---

## 5. ALERT SEVERITY MATRIX

| Severity | Response Time | Action Required | Escalation |
|----------|---------------|-----------------|------------|
| CRITICAL | <24 hours | Block fund release, immediate investigation | District Magistrate + CNA |
| HIGH | <72 hours | Hold payment, detailed review | District Authority |
| MEDIUM | <7 days | Monitor closely, request explanation | Implementing Agency |
| LOW | <30 days | Log and track, no immediate action | Dashboard only |

---

## 6. INTEGRATION WITH e-SAKSHI PORTAL

**Data Sources Required:**
1. Work recommendation data (MP, date, amount, description)
2. Sanction data (DA, date, sanctioned amount, timeline)
3. Implementation data (IA, progress updates, completion status)
4. Payment data (releases, expenditures, utilization certificates)
5. Vendor data (registration, PAN, address, work history)
6. Geographic data (constituency boundaries, GPS coordinates)

**Real-Time Monitoring:**
```
Stream Processing:
  e-SAKSHI API → Kafka → Flink → Rule Engine → Alert Dashboard
  
Batch Processing:
  Daily data dump → Spark → ML Models → Risk Scores → Investigation Queue
```

---

## 7. MAPPING TO CAG DOCUMENTED VIOLATIONS

| CAG Finding | Detection Rule | Confidence |
|-------------|----------------|------------|
| ₹161 crore unsupported expenditure | FUND-001, New: DOCUMENT_MISSING | HIGH |
| Inflated cost estimates | COST-001, COST-002 | HIGH |
| Works for commercial/private purpose | CAT-003 | CRITICAL |
| Religious place spending (₹74.12L) | CAT-004 | CRITICAL |
| Duplicate works | DUP-001, DUP-002 | HIGH |
| Abandoned/suspended works | TIME-005 | HIGH |
| Fund diversion | FUND-001, GEO-001 | HIGH |
| Vendor collusion | VEND-001, VEND-003, NETWORK | HIGH |
| End-of-tenure spending rush | TIME-006, SEASONAL | MEDIUM |
| Incomplete works marked complete | New: COMPLETION_VERIFY | HIGH |
| Unspent balances not distributed | New: RS_BALANCE_CHECK | MEDIUM |

---

## 8. RULE IMPLEMENTATION & DEPLOYMENT TIERS

### Tier 1: Core Priority Gatekeeper (12 High-Impact Rules)
*Directly operationalized in the primary screening pipeline and evaluation prototype:*
- **Cost & Scope**: COST-001 (Overrun >20%), COST-002 (Severe Inflation >100%)
- **Temporal**: TIME-001 (Sanction Delay >45d), TIME-002 (Abandoned Works >365d)
- **Procurement**: VEND-001 (District Vendor Concentration >30%), VEND-002 (Monopolization >50%)
- **Duplication & Geography**: DUP-001 (Semantic Description Overlap >0.85), GEO-001 (Boundary Violation)
- **Policy Compliance**: CAT-001 (Prohibited Category), UTIL-001 (Chronic Underutilization <40%)
- **Strategic Gaming**: THRESH-001 (Transaction Splitting <₹50L), TENURE-001 (End-of-Tenure Spending Rush)

### Tier 2: Enhanced Procurement & Behavioral Rules
*Applied in deep-dive audit sweeps and automated periodic reports:*
- **Cost**: COST-003 (Frequent Cost Revisions), COST-004 (High Per-Unit Cost), COST-005 (Below Market Estimate)
- **Temporal**: TIME-003 (Stalled Construction), TIME-004 (Batch Sanctions), TIME-005 (Backdated Approvals)
- **Procurement**: VEND-003 (Newly Registered Vendor), VEND-004 (Rotating Bidders), VEND-005 (Shared Entity Identifiers)
- **Duplication**: DUP-002 (Temporal Proximity Duplication), DUP-003 (Cross-District Project Re-submission)

### Tier 3: Advanced Network & Cross-Scheme Analysis
*Enterprise integration with state procurement platforms and CAG audit infrastructure:*
- Multi-party collusion graphs (connecting MP recommendation, IA selection, and vendor ownership)
- Cross-scheme duplicate detection (matching MPLADS assets against MGNREGA / PMGSY works)
- Automated extraction and continuous rule synthesis from newly published CAG performance audits

---

*Document Version: 2.0 | Last Updated: September 2026*  
*MPLADS AI Sentinel — Audit & Rule Engine Specification*
