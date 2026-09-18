# MPLADS Fraud Detection System - Data Pipeline & Integration Architecture

**Data Engineering & ETL Integration Architecture | SIH 2026 Problem Statement 26102**

---

## 1. Data Source Inventory

### 1.1 Primary Sources

| Source | Format | Access Method | Data Granularity | Update Frequency |
|--------|--------|---------------|------------------|------------------|
| **eSAKSHI Public Dashboard** | HTML/JSON (dashboard widgets) | Web scraping (Selenium/Playwright) | Work-level, MP-wise, District-wise | Real-time (dashboard updates) |
| **data.gov.in MPLADS Datasets** | CSV/JSON via API | REST API (`api.data.gov.in`) | Constituency/MP/Work/Vendor-level | Periodic (monthly/quarterly) |
| **eSAKSHI Portal (Authenticated)** | Web forms | Browser automation (login-based) | Granular: payments, geo-tagged photos, MPRs | Real-time |
| **CAG Audit Reports** | PDF | Manual download + PDF extraction | Audit findings, anomalies, recommendations | Per audit cycle |
| **PFMS (Public Financial Management System)** | XML/JSON via API | SFTP/API integration (authorized only) | Payment transactions, fund flow | Real-time |

### 1.2 Secondary/Contextual Sources

| Source | Purpose | Format |
|--------|---------|--------|
| **Census 2011 / NFHS-5** | Demographic context (population, SC/ST %) | CSV |
| **LGD (Local Government Directory)** | District/Block/Village codes for normalization | API/CSV |
| **India GIS Shapefiles** | Geographic boundaries for mapping | GeoJSON/Shapefile |
| **Open Budget / Budget at a Glance** | Allocations context | PDF/CSV |
| **GePNAC (Geo-tagged National Asset Portal)** | Asset verification via satellite | API |

---

## 2. Data Schemas (Reconstructed from Research)

### 2.1 eSAKSHI Dashboard Data Fields (Public)

From the eSAKSHI public dashboard, the following fields are visible:

```json
{
  "work_summary": {
    "mp_name": "string",
    "mp_type": "Lok Sabha | Rajya Sabha | Nominated",
    "constituency": "string",
    "state": "string",
    "nodal_district": "string",
    "implementing_district": "string",
    "house": "18th Lok Sabha | Rajya Sabha",
    "fy": "2023-24 | 2024-25 | ...",
    "entitlement": 5000000,
    "recommended_amount": 4800000,
    "sanctioned_amount": 4200000,
    "expenditure": 3500000,
    "works_recommended": 12,
    "works_sanctioned": 10,
    "works_completed": 7,
    "works_ongoing": 3,
    "unspent_balance": 700000,
    "scst_area_pct": 0.22
  }
}
```

### 2.2 data.gov.in MPLADS Dataset Schema (18th Lok Sabha)

From the dataful.in dataset documentation:

```json
{
  "vendor_expenditure": {
    "data_as_on": "date",
    "state": "string",
    "implementing_district_per_source": "string",
    "implementing_district_per_lgd": "string",
    "implementing_district_lgd_code": "integer",
    "loksabha_constituency": "string",
    "loksabha_MP_name": "string",
    "work": "string (115 distinct categories)",
    "implementing_agency_name": "string",
    "vendor_name": "string",
    "expenditure_date": "date",
    "payment_status": "string",
    "expenditure_amount": "float",
    "units": "string"
  }
}
```

### 2.3 Full Work Lifecycle Schema (from Guidelines + Portal)

```json
{
  "mplads_work": {
    "unique_work_number": "string (UUID)",
    "work_name": "string",
    "sector": "string (12 main sectors)",
    "sub_sector": "string",
    "is_permissible": "boolean",
    "estimated_cost": "decimal",
    "sanctioned_amount": "decimal",
    "scst_area_flag": "SC | ST | BOTH | OTHERS",
    
    "mp_details": {
      "mp_name": "string",
      "mp_type": "LS | RS | NOM",
      "constituency": "string",
      "state": "string",
      "nodal_district": "string"
    },
    
    "recommendation": {
      "date_recommended": "datetime",
      "entitlement_at_time": "decimal",
      "cumulative_recommendations": "decimal"
    },
    
    "sanction": {
      "date_sanctioned": "datetime",
      "sanctioning_authority": "string",
      "sanction_number": "string",
      "days_to_sanction": "integer (45-day SLA)"
    },
    
    "execution": {
      "implementing_agency": "string",
      "implementing_district": "string",
      "lgd_district_code": "integer",
      "work_status": "enum [Sanctioned, In Progress, Completed, Abandoned, Cancelled]",
      "start_date": "date",
      "expected_completion": "date",
      "actual_completion": "date",
      "geo_tagged_photos": ["url"],
      "mpr_status": "string"
    },
    
    "payments": [{
      "payment_id": "string",
      "vendor_name": "string",
      "amount": "decimal",
      "payment_date": "date",
      "payment_mode": "PFMS | Bank Transfer | NACH",
      "pfms_transaction_id": "string",
      "payment_status": "Pending | Processed | Rejected"
    }],
    
    "audit": {
      "utilization_certificate": "boolean",
      "audit_certificate": "boolean",
      "cag_flagged": "boolean",
      "cag_remarks": "string"
    }
  }
}
```

### 2.4 MPLADS Sector Taxonomy (12 Main Sectors)

| Code | Sector | Sub-sectors (examples) |
|------|--------|----------------------|
| 1 | Public & Community Buildings | Community halls, libraries, anganwadi |
| 2 | Public Conveniences, Safety & Security | CCTV, fire stations, police posts |
| 3 | Education | School buildings, labs, furniture |
| 4 | Public Health | PHCs, CHCs, medical equipment |
| 5 | Drinking Water & Sanitation | Borewells, toilets, water tanks |
| 6 | Irrigation, Drainage & Flood Control | Canals, check dams, drainage |
| 7 | Animal Husbandry, Dairy & Fisheries | Veterinary centres, fish ponds |
| 8 | Agriculture & Farmer Welfare | Godowns, soil testing labs |
| 9 | Energy Supply & Distribution | Solar panels, transformers, electrification |
| 10 | Railways, Roads, Bridges & Pathways | Roads, bridges, pathways |
| 11 | Environment, Wildlife & Forest | Plantation, park development |
| 12 | Public Recreational Facilities, Sports & Parks | Stadiums, parks, playgrounds |

---

## 3. Data Extraction Pipeline

### 3.1 Extraction Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA EXTRACTION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  eSAKSHI     │  │  data.gov.in │  │  CAG Reports │          │
│  │  Dashboard   │  │  API          │  │  (PDF)       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         ▼                  ▼                  ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Playwright   │  │ Python       │  │ PyPDF2/      │          │
│  │ Selenium     │  │ requests +   │  │ pdfplumber   │          │
│  │ Scraper      │  │ datagovindia │  │ Extractor    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────┬───────┘──────────────────┘                  │
│                    ▼                                             │
│         ┌──────────────────┐                                    │
│         │  Raw Data Lake   │                                    │
│         │  (Parquet/CSV)   │                                    │
│         └──────────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 eSAKSHI Dashboard Scraper

```python
# scripts/extractors/esakshi_scraper.py
"""
Scrapes the eSAKSHI public dashboard at mplads.mospi.gov.in/digigov/dashboard.html
The dashboard uses JavaScript widgets that load data via XHR/fetch.
Strategy: Intercept network requests to capture JSON payloads.
"""

import asyncio
from playwright.async_api import async_playwright
import pandas as pd
from pathlib import Path

ESAKSHI_DASHBOARD_URL = "https://www.mplads.mospi.gov.in/digigov/dashboard.html"

async def capture_dashboard_data():
    """Intercept XHR requests to capture underlying JSON data."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        captured_responses = []
        
        async def handle_response(response):
            url = response.url
            if any(kw in url for kw in ['api', 'data', 'json', 'getWork', 'getMP', 'getDistrict']):
                try:
                    body = await response.json()
                    captured_responses.append({"url": url, "data": body})
                except Exception:
                    pass
        
        page.on("response", handle_response)
        await page.goto(ESAKSHI_DASHBOARD_URL, wait_until="networkidle")
        
        # Interact with filters to trigger data loads
        # Click Lok Sabha / Rajya Sabha tabs
        # Select different FY dropdowns
        # Drill down state -> district -> constituency
        
        await browser.close()
        return captured_responses

def parse_dashboard_works(raw_data: list) -> pd.DataFrame:
    """Normalize intercepted JSON into flat DataFrame."""
    records = []
    for item in raw_data:
        # Extract work-level records from nested JSON
        # Adapt based on actual JSON structure observed
        pass
    return pd.DataFrame(records)
```

### 3.3 data.gov.in API Extractor

```python
# scripts/extractors/datagovindia_extractor.py
"""
Uses data.gov.in OGD Platform API.
Register for free API key at https://data.gov.in
"""
import requests
import pandas as pd
from typing import Optional

BASE_URL = "https://api.data.gov.in/resource"
API_KEY = "YOUR_API_KEY_HERE"  # Free registration

# Known MPLADS resource IDs (verify current IDs on data.gov.in)
RESOURCES = {
    "mplads_vendor_expenditure_18thLS": "RESOURCE_ID_1",
    "mplads_funds_14th_to_17th": "RESOURCE_ID_2",
    "mplads_works_sanctioned_15thLS": "RESOURCE_ID_3",
    "mplads_rs_sanctioned": "RESOURCE_ID_4",
}

def fetch_mplads_dataset(
    resource_key: str,
    filters: Optional[dict] = None,
    limit: int = 100,
    offset: int = 0
) -> pd.DataFrame:
    """Fetch paginated data from data.gov.in."""
    resource_id = RESOURCES[resource_key]
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
    }
    if filters:
        for k, v in filters.items():
            params[f"filters[{k}]"] = v
    
    resp = requests.get(f"{BASE_URL}/{resource_id}", params=params)
    resp.raise_for_status()
    
    data = resp.json()
    if "records" in data:
        return pd.DataFrame(data["records"])
    return pd.DataFrame(data.get("result", []))

def fetch_full_dataset(resource_key: str, filters: Optional[dict] = None) -> pd.DataFrame:
    """Paginate through entire dataset."""
    all_records = []
    offset = 0
    limit = 100
    
    while True:
        df = fetch_mplads_dataset(resource_key, filters, limit, offset)
        if df.empty:
            break
        all_records.append(df)
        offset += limit
    
    return pd.concat(all_records, ignore_index=True) if all_records else pd.DataFrame()

# Alternative: Use datagovindia Python library
# pip install datagovindia
import datagovindia
search_results = datagovindia.search("mplads")
full_data = datagovindia.get_data(RESOURCES["mplads_vendor_expenditure_18thLS"])
```

### 3.4 CAG Audit Report Extractor

```python
# scripts/extractors/cag_extractor.py
"""
Extract structured data from CAG audit reports (PDF).
Key reports:
- Report No. 31 of 2010 (Performance Audit of MPLADS)
- Periodic performance audits on MPLADS
"""
import pdfplumber
import re
from pathlib import Path

CAG_REPORTS = {
    "mplads_2010": "https://saiindia.gov.in/uploads/download_audit_report/2010/Union_Performance_Local_area_Development_Scheme_31_2010.pdf",
}

def extract_tables_from_cag(pdf_path: str) -> list[dict]:
    """Extract tabular data from CAG audit reports."""
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_tables = page.extract_tables()
            for table in page_tables:
                if table and len(table) > 1:
                    headers = table[0]
                    rows = table[1:]
                    for row in rows:
                        record = dict(zip(headers, row))
                        tables.append(record)
    return tables

def extract_anomaly_findings(pdf_path: str) -> list[dict]:
    """Extract specific anomaly/irregularity findings from CAG reports."""
    findings = []
    with pdfplumber.open(pdf_path) as pdf:
        full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    
    # Pattern: Find paragraphs describing irregularities
    patterns = [
        r"irregularit[yi].*?(?:Rs\.|₹)\s*([\d,\.]+)\s*(?:lakh|crore|Cr)",
        r"non-compliance.*?(?:Rs\.|₹)\s*([\d,\.]+)\s*(?:lakh|crore|Cr)",
        r"diversion.*?(?:Rs\.|₹)\s*([\d,\.]+)\s*(?:lakh|crore|Cr)",
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, full_text, re.IGNORECASE)
        for match in matches:
            context_start = max(0, match.start() - 200)
            context_end = min(len(full_text), match.end() + 200)
            findings.append({
                "text": full_text[context_start:context_end],
                "amount": match.group(1),
                "type": pattern.split(".*")[0].split("\\")[-1]
            })
    
    return findings
```

---

## 4. Data Preprocessing Pipeline

### 4.1 Processing Flow

```
Raw Data (Parquet/CSV)
    │
    ▼
┌─────────────────────────────────┐
│  STEP 1: INGESTION & VALIDATION │
│  - Schema enforcement           │
│  - Type coercion                │
│  - Duplicate detection          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STEP 2: CLEANING               │
│  - Missing value handling       │
│  - Name normalization (LGD)     │
│  - Date parsing (Indian formats)│
│  - Amount standardization       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STEP 3: ENRICHMENT             │
│  - Geographic code mapping      │
│  - Demographic data merge       │
│  - Sector/sub-sector tagging    │
│  - Tenure/FY derivation         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STEP 4: FEATURE ENGINEERING    │
│  - Anomaly indicators           │
│  - Rate-of-change metrics       │
│  - Compliance flags             │
│  - Temporal aggregations        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STEP 5: OUTPUT TO DATABASE     │
│  - Clean DataFrame → SQLite     │
│  - Feature store → Parquet      │
│  - Alert triggers → Queue       │
└─────────────────────────────────┘
```

### 4.2 Cleaning Rules for Indian Government Data

```python
# scripts/preprocessing/cleaner.py
import pandas as pd
import numpy as np
import re

class MPLADSCleaner:
    """Handles cleaning specific to MPLADS data quirks."""
    
    # Common name variants in Indian gov data
    DISTRICT_CORRECTIONS = {
        "Gurgaon": "Gurugram",
        "Bangalore": "Bengaluru",
        "Bombay": "Mumbai",
        "Madras": "Chennai",
        "Poona": "Pune",
        "Baroda": "Vadodara",
        "Cuttak": "Cuttack",
        "Tiruvallur": "Tiruvallur",
        # Add ~726 districts from LGD
    }
    
    AMOUNT_PATTERNS = [
        r"Rs\.?\s*([\d,\.]+)",         # Rs. 5,00,000
        r"([\d,\.]+)\s*Cr",             # 5.00 Cr
        r"([\d,\.]+)\s*lakh",           # 5.00 lakh
        r"([\d,\.]+)\s*crore",          # 5.00 crore
        r"₹\s*([\d,\.]+)",              # ₹5,00,000
    ]
    
    def clean_amount(self, value) -> float:
        """Parse Indian currency formats to float (in Rs)."""
        if pd.isna(value):
            return np.nan
        if isinstance(value, (int, float)):
            return float(value)
        
        text = str(value).strip().replace(",", "")
        
        # Handle Cr/crore
        cr_match = re.search(r"([\d\.]+)\s*(?:Cr|crore)", text, re.I)
        if cr_match:
            return float(cr_match.group(1)) * 1_00_00_000
        
        # Handle lakh
        lakh_match = re.search(r"([\d\.]+)\s*lakh", text, re.I)
        if lakh_match:
            return float(lakh_match.group(1)) * 1_00_000
        
        # Plain number
        num_match = re.search(r"([\d\.]+)", text)
        if num_match:
            return float(num_match.group(1))
        
        return np.nan
    
    def normalize_district(self, name: str) -> str:
        """Map to LGD-standard district name."""
        if pd.isna(name):
            return name
        clean = name.strip().title()
        return self.DISTRICT_CORRECTIONS.get(clean, clean)
    
    def parse_indian_date(self, value) -> pd.Timestamp:
        """Parse common Indian date formats."""
        if pd.isna(value):
            return pd.NaT
        formats = [
            "%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d",
            "%d-%b-%Y", "%d %B %Y", "%d.%m.%Y",
        ]
        for fmt in formats:
            try:
                return pd.to_datetime(value, format=fmt)
            except (ValueError, TypeError):
                continue
        return pd.to_datetime(value, errors="coerce")
    
    def derive_financial_year(self, date: pd.Timestamp) -> str:
        """Derive Indian financial year (April-March) from date."""
        if pd.isna(date):
            return None
        if date.month >= 4:
            return f"{date.year}-{str(date.year + 1)[-2:]}"
        else:
            return f"{date.year - 1}-{str(date.year)[-2:]}"
    
    def compute_compliance_flags(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add boolean flags for MPLADS compliance rules."""
        
        # 45-day sanction SLA
        if "date_recommended" in df.columns and "date_sanctioned" in df.columns:
            df["days_to_sanction"] = (
                pd.to_datetime(df["date_sanctioned"]) - 
                pd.to_datetime(df["date_recommended"])
            ).dt.days
            df["sanction_delayed"] = df["days_to_sanction"] > 45
        
        # SC/ST 15%/7.5% allocation rule
        if "scst_area_flag" in df.columns and "entitlement" in df.columns:
            scst_amount = df.groupby(["mp_name", "fy"])["sanctioned_amount"].transform(
                lambda x: x[df["scst_area_flag"].isin(["SC", "ST", "BOTH"])].sum()
            )
            df["scst_compliance"] = (scst_amount / df["entitlement"]) >= 0.225
        
        # Work completion within 1 year of sanction
        if "date_sanctioned" in df.columns and "actual_completion" in df.columns:
            df["completion_delay_days"] = (
                pd.to_datetime(df["actual_completion"]) - 
                pd.to_datetime(df["date_sanctioned"])
            ).dt.days
            df["overdue_work"] = df["completion_delay_days"] > 365
        
        # Expenditure exceeding sanctioned amount
        if "sanctioned_amount" in df.columns and "expenditure" in df.columns:
            df["overspend_flag"] = df["expenditure"] > df["sanctioned_amount"] * 1.1
        
        return df
```

### 4.3 Feature Engineering for Anomaly Detection

```python
# scripts/preprocessing/features.py
import pandas as pd
import numpy as np

class MPLADSFeatureEngineer:
    """Derive features for fraud/anomaly detection models."""
    
    def compute_mp_level_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Aggregate to MP level for cross-MP anomaly detection."""
        mp_agg = df.groupby(["mp_name", "mp_type", "state", "constituency", "fy"]).agg(
            total_entitlement=("entitlement", "first"),
            total_recommended=("recommended_amount", "sum"),
            total_sanctioned=("sanctioned_amount", "sum"),
            total_expenditure=("expenditure", "sum"),
            num_works_recommended=("unique_work_number", "count"),
            num_works_sanctioned=("unique_work_number", lambda x: (x.notna()).sum()),
            num_completed=("work_status", lambda x: (x == "Completed").sum()),
            num_ongoing=("work_status", lambda x: (x == "In Progress").sum()),
            avg_sancation_delay=("days_to_sanction", "mean"),
            max_sancation_delay=("days_to_sanction", "max"),
            pct_scst=("scst_area_flag", lambda x: x.isin(["SC", "ST", "BOTH"]).mean()),
            unique_agencies=("implementing_agency_name", "nunique"),
            unique_vendors=("vendor_name", "nunique"),
        ).reset_index()
        
        # Derived metrics
        mp_agg["utilization_rate"] = mp_agg["total_expenditure"] / mp_agg["total_entitlement"]
        mp_agg["completion_rate"] = mp_agg["num_completed"] / mp_agg["num_works_sanctioned"]
        mp_agg["avg_cost_per_work"] = mp_agg["total_sanctioned"] / mp_agg["num_works_sanctioned"]
        mp_agg["overspend_ratio"] = mp_agg["total_expenditure"] / mp_agg["total_sanctioned"]
        
        return mp_agg
    
    def compute_vendor_concentration(self, df: pd.DataFrame) -> pd.DataFrame:
        """Flag MP-vendor concentration anomalies."""
        vendor_agg = df.groupby(["mp_name", "vendor_name"]).agg(
            total_amount=("expenditure_amount", "sum"),
            num_payments=("payment_id", "count"),
            districts=("implementing_district", "nunique"),
        ).reset_index()
        
        # Compute vendor share per MP
        mp_totals = vendor_agg.groupby("mp_name")["total_amount"].transform("sum")
        vendor_agg["vendor_share_pct"] = vendor_agg["total_amount"] / mp_totals
        
        # Flag: >50% of MP's expenditure with single vendor
        vendor_agg["concentration_flag"] = vendor_agg["vendor_share_pct"] > 0.5
        
        # Flag: vendor active across >5 MP constituencies (potential ring)
        vendor_mp_count = df.groupby("vendor_name")["mp_name"].nunique().reset_index()
        vendor_mp_count.columns = ["vendor_name", "num_mps_served"]
        vendor_agg = vendor_agg.merge(vendor_mp_count, on="vendor_name", how="left")
        vendor_agg["multi_mp_flag"] = vendor_agg["num_mps_served"] > 5
        
        return vendor_agg
    
    def compute_temporal_anomalies(self, df: pd.DataFrame) -> pd.DataFrame:
        """Flag end-of-tenure rushes, unusual payment patterns."""
        df = df.sort_values(["mp_name", "expenditure_date"])
        
        # End-of-tenure rush: >30% expenditure in last quarter
        df["expenditure_date"] = pd.to_datetime(df["expenditure_date"])
        df["month"] = df["expenditure_date"].dt.month
        df["quarter"] = df["expenditure_date"].dt.quarter
        
        mp_quarter = df.groupby(["mp_name", "fy", "quarter"])["expenditure_amount"].sum().reset_index()
        mp_total = mp_quarter.groupby(["mp_name", "fy"])["expenditure_amount"].transform("sum")
        mp_quarter["quarterly_share"] = mp_quarter["expenditure_amount"] / mp_total
        mp_quarter["end_rush_flag"] = mp_quarter["quarterly_share"] > 0.3
        
        # Unusual weekend/holiday payments
        df["is_weekend"] = df["expenditure_date"].dt.dayofweek >= 5
        weekend_pct = df.groupby("mp_name")["is_weekend"].mean()
        # >20% weekend payments is suspicious
        
        return df, mp_quarter
    
    def compute_geographic_anomalies(self, df: pd.DataFrame, census_df: pd.DataFrame) -> pd.DataFrame:
        """Cross-reference with demographic data for contextual anomalies."""
        merged = df.merge(
            census_df[["district", "population", "sc_pct", "st_pct", "literacy_rate", "hdi"]],
            left_on="implementing_district",
            right_on="district",
            how="left"
        )
        
        # Per-capita expenditure anomalies
        merged["per_capita_expenditure"] = merged["total_expenditure"] / merged["population"]
        
        # SC/ST allocation vs actual population share
        merged["scst_allocation_gap"] = merged["pct_scst"] - (merged["sc_pct"] + merged["st_pct"])
        
        return merged
```

---

## 5. Data Storage Architecture

### 5.1 Recommended Stack (Hackathon-Optimized)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │              SQLite (Primary Store)              │            │
│  │  - All structured MPLADS data                   │            │
│  │  - Simple queries, dashboard reads              │            │
│  │  - Single file, portable, zero config           │            │
│  │  - ~50-200MB for hackathon dataset              │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │         Parquet Files (Feature Store)           │            │
│  │  - Pre-computed features for ML models          │            │
│  │  - Columnar = fast reads, small size            │            │
│  │  - Versioned by date of extraction              │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │         JSON Files (Config & Cache)             │            │
│  │  - Sector taxonomy mappings                     │            │
│  │  - District LGD code mappings                   │            │
│  │  - API response cache                           │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │         Redis (Optional - Alerts Queue)         │            │
│  │  - Real-time alert queue for dashboard          │            │
│  │  - Replaceable with in-memory dict for demo     │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 SQLite Schema

```sql
-- schema.sql

-- Master tables
CREATE TABLE IF NOT EXISTS mps (
    mp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mp_name TEXT NOT NULL,
    mp_type TEXT CHECK(mp_type IN ('Lok Sabha', 'Rajya Sabha', 'Nominated')),
    constituency TEXT,
    state TEXT,
    nodal_district TEXT,
    house TEXT,
    UNIQUE(mp_name, constituency, house)
);

CREATE TABLE IF NOT EXISTS districts (
    district_id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_name TEXT NOT NULL,
    lgd_code INTEGER UNIQUE,
    state TEXT,
    population INTEGER,
    sc_pct REAL,
    st_pct REAL,
    literacy_rate REAL
);

CREATE TABLE IF NOT EXISTS sectors (
    sector_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_code TEXT UNIQUE,
    sector_name TEXT NOT NULL,
    sub_sector TEXT
);

-- Transactional tables
CREATE TABLE IF NOT EXISTS works (
    work_id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_work_number TEXT UNIQUE,
    work_name TEXT,
    sector_id INTEGER REFERENCES sectors(sector_id),
    estimated_cost REAL,
    sanctioned_amount REAL,
    scst_area TEXT,
    mp_id INTEGER REFERENCES mps(mp_id),
    district_id INTEGER REFERENCES districts(district_id),
    date_recommended DATE,
    date_sanctioned DATE,
    days_to_sanction INTEGER,
    implementing_agency TEXT,
    work_status TEXT CHECK(work_status IN ('Recommended', 'Sanctioned', 'In Progress', 'Completed', 'Abandoned', 'Cancelled')),
    start_date DATE,
    expected_completion DATE,
    actual_completion DATE,
    fy TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER REFERENCES works(work_id),
    vendor_name TEXT,
    amount REAL,
    payment_date DATE,
    payment_mode TEXT,
    payment_status TEXT,
    pfms_txn_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenditures (
    expenditure_id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER REFERENCES works(work_id),
    mp_id INTEGER REFERENCES mps(mp_id),
    district_id INTEGER REFERENCES districts(district_id),
    expenditure_date DATE,
    amount REAL,
    vendor_name TEXT,
    implementing_agency TEXT,
    fy TEXT
);

-- Anomaly/Alert tables
CREATE TABLE IF NOT EXISTS anomalies (
    anomaly_id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER REFERENCES works(work_id),
    mp_id INTEGER REFERENCES mps(mp_id),
    anomaly_type TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    amount_involved REAL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'NEW',
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_flags (
    flag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER,
    flag_type TEXT,
    flag_detail TEXT,
    cag_reference TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_works_mp ON works(mp_id);
CREATE INDEX IF NOT EXISTS idx_works_district ON works(district_id);
CREATE INDEX IF NOT EXISTS idx_works_fy ON works(fy);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(work_status);
CREATE INDEX IF NOT EXISTS idx_payments_work ON payments(work_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_anomalies_type ON anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_expenditures_mp ON expenditures(mp_id);
```

### 5.3 Batch vs Real-time Processing Decision

| Data Type | Processing Mode | Rationale |
|-----------|----------------|-----------|
| eSAKSHI dashboard data | **Batch (daily)** | Dashboard updates in near-real-time, but daily sync sufficient for anomaly detection |
| data.gov.in datasets | **Batch (weekly)** | Published periodically; weekly refresh captures new data |
| CAG audit findings | **Batch (on publish)** | Rare events; manual trigger on new report |
| Payment transactions | **Near real-time (hourly)** | For live fraud alerts; poll eSAKSHI every hour |
| Alert generation | **Event-driven** | Triggered by rule engine or ML model on new data |

**Recommendation for hackathon: Pure batch processing with simulated real-time alerts.**

---

## 6. API Design

### 6.1 REST API Endpoints

```
Base URL: /api/v1
Content-Type: application/json
```

#### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Overall stats: total works, expenditure, completion rate |
| GET | `/dashboard/state/{state}` | State-level drill-down |
| GET | `/dashboard/district/{district}` | District-level drill-down |
| GET | `/dashboard/mp/{mp_id}` | MP-specific dashboard |
| GET | `/dashboard/trend?fy=&granularity=` | Time-series data (monthly/quarterly) |
| GET | `/dashboard/sector-distribution` | Sector-wise allocation breakdown |

#### Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/works` | List works with filters (mp, district, sector, status, fy) |
| GET | `/works/{work_id}` | Single work detail |
| GET | `/works/{work_id}/payments` | Payment history for a work |
| GET | `/payments` | All payments with filters |
| GET | `/mps` | List all MPs with summary stats |
| GET | `/mps/{mp_id}/performance` | MP performance metrics |

#### Anomaly/Alert Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/anomalies` | List detected anomalies (severity, type filters) |
| GET | `/anomalies/{anomaly_id}` | Anomaly detail |
| GET | `/alerts/active` | Active alerts for dashboard |
| POST | `/anomalies/{anomaly_id}/resolve` | Mark anomaly as reviewed |
| GET | `/anomalies/summary` | Anomaly counts by type/severity |

#### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/refresh` | Trigger data refresh (admin) |
| GET | `/metadata/sectors` | Sector taxonomy |
| GET | `/metadata/districts` | District list with LGD codes |

### 6.2 Sample API Request/Response

```json
// GET /api/v1/dashboard/summary
{
  "status": "success",
  "data": {
    "total_works_recommended": 143257,
    "total_works_sanctioned": 98500,
    "total_works_completed": 45200,
    "total_expenditure_cr": 3215.8,
    "overall_completion_rate": 0.459,
    "overall_utilization_rate": 0.782,
    "anomalies_detected": 1247,
    "critical_anomalies": 89,
    "data_as_on": "2026-09-13",
    "fy_covered": ["2023-24", "2024-25", "2025-26"]
  }
}

// GET /api/v1/anomalies?severity=CRITICAL&limit=10
{
  "status": "success",
  "data": {
    "anomalies": [
      {
        "anomaly_id": 89,
        "anomaly_type": "VENDOR_CONCENTRATION",
        "severity": "CRITICAL",
        "description": "MP X has 72% of total expenditure with single vendor Y across 3 districts",
        "amount_involved": 4500000,
        "mp_name": "...",
        "constituency": "...",
        "detected_at": "2026-09-12T14:30:00Z",
        "status": "NEW"
      }
    ],
    "total_count": 89,
    "page": 1,
    "has_more": true
  }
}

// GET /api/v1/works?district=Gurugram&status=In Progress&fy=2024-25
{
  "status": "success",
  "data": {
    "works": [
      {
        "work_id": 12345,
        "unique_work_number": "MPLADS-2024-GRG-001",
        "work_name": "Construction of Community Hall",
        "sector": "Public & Community Buildings",
        "sanctioned_amount": 2500000,
        "expenditure_to_date": 1800000,
        "mp_name": "...",
        "implementing_agency": "...",
        "days_since_sanction": 287,
        "compliance_flags": {
          "sanction_delayed": false,
          "overdue": false,
          "overspend": false
        }
      }
    ],
    "total_count": 156,
    "page": 1
  }
}
```

### 6.3 Alert System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  ALERT SYSTEM ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────────────────────┐       │
│  │  Data Ingest │───▶│  Rule Engine (Python)         │       │
│  │  (Batch/     │    │                              │       │
│  │   Hourly)    │    │  Rules:                      │       │
│  └──────────────┘    │  1. Sanction delay > 45 days  │       │
│                      │  2. Overspend > 10%           │       │
│                      │  3. Vendor concentration > 50%│       │
│                      │  4. Weekend payments > 20%    │       │
│                      │  5. End-of-tenure rush        │       │
│                      │  6. Duplicate vendor patterns  │       │
│                      │  7. CAG flag match            │       │
│                      └──────────┬───────────────────┘       │
│                                 │                            │
│                                 ▼                            │
│                      ┌──────────────────────┐               │
│                      │  Anomaly Scorer      │               │
│                      │  (ML Model / Rules)  │               │
│                      │  Score: 0-100        │               │
│                      └──────────┬───────────┘               │
│                                 │                            │
│                    ┌────────────┼────────────┐              │
│                    ▼            ▼            ▼              │
│              ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│              │ SQLite   │ │ Dashboard│ │ Email/   │        │
│              │ Anomaly  │ │ WebSocket│ │ Telegram │        │
│              │ Table    │ │ Push     │ │ (Optional)│        │
│              └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Rule Engine Implementation

```python
# scripts/alerts/rule_engine.py
from dataclasses import dataclass
from typing import Optional
import sqlite3

@dataclass
class AnomalyRule:
    rule_id: str
    name: str
    severity: str
    description_template: str
    
class MPLADSRuleEngine:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.rules = self._define_rules()
    
    def _define_rules(self) -> list[AnomalyRule]:
        return [
            AnomalyRule(
                rule_id="SANCTION_DELAY",
                name="Delayed Sanction",
                severity="MEDIUM",
                description="Work sanctioned {days} days after recommendation (SLA: 45 days)"
            ),
            AnomalyRule(
                rule_id="OVERSPEND",
                name="Expenditure Overrun",
                severity="HIGH",
                description="Expenditure Rs.{amount} exceeds sanctioned by {pct}%"
            ),
            AnomalyRule(
                rule_id="VENDOR_CONCENTRATION",
                name="Vendor Monopoly",
                severity="HIGH",
                description="Single vendor receives {share}% of MP's total expenditure"
            ),
            AnomalyRule(
                rule_id="WEEKEND_PAYMENTS",
                name="Unusual Payment Timing",
                severity="LOW",
                description="{pct}% of payments made on weekends"
            ),
            AnomalyRule(
                rule_id="END_TENURE_RUSH",
                name="End-of-Tenure Expenditure Rush",
                severity="MEDIUM",
                description="{share}% of expenditure in last quarter"
            ),
            AnomalyRule(
                rule_id="MULTI_MP_VENDOR",
                name="Vendor Active Across Multiple MPs",
                severity="CRITICAL",
                description="Vendor {vendor} serves {count} different MP constituencies"
            ),
            AnomalyRule(
                rule_id="SCST_NON_COMPLIANCE",
                name="SC/ST Allocation Non-Compliance",
                severity="HIGH",
                description="SC/ST allocation at {actual}% vs required 22.5%"
            ),
            AnomalyRule(
                rule_id="WORK_ABANDONED",
                name="Abandoned Work",
                severity="HIGH",
                description="Work abandoned after {days} days and Rs.{amount} expenditure"
            ),
        ]
    
    def run_rules(self) -> list[dict]:
        """Execute all rules against current data, return anomalies."""
        anomalies = []
        
        # Rule 1: Sanction delays
        query = """
            SELECT w.work_id, w.mp_id, w.days_to_sanction, m.mp_name
            FROM works w JOIN mps m ON w.mp_id = m.mp_id
            WHERE w.days_to_sanction > 45 AND w.work_status != 'Recommended'
        """
        for row in self.conn.execute(query):
            anomalies.append({
                "rule": "SANCTION_DELAY",
                "work_id": row[0],
                "mp_id": row[1],
                "severity": "MEDIUM",
                "description": f"Work sanctioned {row[2]} days after recommendation",
                "amount_involved": None
            })
        
        # Rule 2: Overspend
        query = """
            SELECT w.work_id, w.mp_id, w.sanctioned_amount, 
                   SUM(p.amount) as total_paid, m.mp_name
            FROM works w 
            JOIN payments p ON w.work_id = p.work_id
            JOIN mps m ON w.mp_id = m.mp_id
            GROUP BY w.work_id
            HAVING total_paid > w.sanctioned_amount * 1.1
        """
        for row in self.conn.execute(query):
            overrun_pct = ((row[3] - row[2]) / row[2]) * 100
            anomalies.append({
                "rule": "OVERSPEND",
                "work_id": row[0],
                "mp_id": row[1],
                "severity": "HIGH",
                "description": f"Expenditure exceeds sanctioned by {overrun_pct:.1f}%",
                "amount_involved": row[3] - row[2]
            })
        
        # ... additional rules follow same pattern
        
        self._store_anomalies(anomalies)
        return anomalies
    
    def _store_anomalies(self, anomalies: list[dict]):
        for a in anomalies:
            self.conn.execute("""
                INSERT INTO anomalies (work_id, mp_id, anomaly_type, severity, description, amount_involved)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (a.get("work_id"), a.get("mp_id"), a["rule"], a["severity"], 
                  a["description"], a.get("amount_involved")))
        self.conn.commit()
```

---

## 7. Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        END-TO-END DATA FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  EXTERNAL SOURCES                PROCESSING               OUTPUT        │
│  ───────────────                ──────────               ──────        │
│                                                                          │
│  ┌──────────┐                                                             │
│  │eSAKSHI   │──┐                                                          │
│  │Dashboard │  │                                                          │
│  └──────────┘  │    ┌────────────────────┐                               │
│                ├───▶│ EXTRACTORS          │                               │
│  ┌──────────┐  │    │ - Playwright scraper│    ┌──────────────────┐       │
│  │data.gov.in│──┤    │ - API client        │───▶│ RAW DATA LAKE    │       │
│  │API       │  │    │ - PDF extractor     │    │ (data/raw/)      │       │
│  └──────────┘  │    └────────────────────┘    │ - Parquet files   │       │
│                │                              │ - CSV backups     │       │
│  ┌──────────┐  │                              └────────┬─────────┘       │
│  │CAG Audit │──┘                                       │                 │
│  │Reports   │                                          ▼                 │
│  └──────────┘                              ┌──────────────────────┐       │
│                                            │ PREPROCESSING        │       │
│  ┌──────────┐                              │ - Cleaning           │       │
│  │Census/   │─────────────────────────────▶│ - Normalization      │       │
│  │Demograph.│                              │ - Feature Engineering│       │
│  └──────────┘                              └────────┬─────────────┘       │
│                                                     │                     │
│                                                     ▼                     │
│                                       ┌──────────────────────────┐       │
│                                       │ SQLITE DATABASE          │       │
│                                       │ - mps                    │       │
│                                       │ - works                  │       │
│                                       │ - payments               │       │
│                                       │ - expenditures           │       │
│                                       │ - anomalies              │       │
│                                       └───────┬──────────┬───────┘       │
│                                               │          │                │
│                                               ▼          ▼                │
│                                 ┌────────────────┐ ┌────────────────┐    │
│                                 │ RULE ENGINE    │ │ ML MODELS      │    │
│                                 │ - Compliance   │ │ - Isolation    │    │
│                                 │ - Thresholds   │ │   Forest       │    │
│                                 │ - Pattern match│ │ - Clustering   │    │
│                                 └───────┬────────┘ └──────┬─────────┘    │
│                                         │                  │              │
│                                         └────────┬─────────┘              │
│                                                  ▼                       │
│                                       ┌──────────────────┐               │
│                                       │ ANOMALY TABLE    │               │
│                                       │ (severity, type, │               │
│                                       │  description)    │               │
│                                       └────────┬─────────┘               │
│                                                  │                       │
│                                                  ▼                       │
│                              ┌─────────────────────────────────┐         │
│                              │ FASTAPI SERVER                  │         │
│                              │ - REST endpoints                │         │
│                              │ - WebSocket for live alerts     │         │
│                              └──────────┬──────────────────────┘         │
│                                         │                                │
│                                         ▼                                │
│                              ┌──────────────────────┐                   │
│                              │ STREAMLIT DASHBOARD  │                   │
│                              │ - Summary KPIs       │                   │
│                              │ - State/District map  │                   │
│                              │ - MP leaderboard     │                   │
│                              │ - Anomaly explorer   │                   │
│                              │ - Trend charts       │                   │
│                              └──────────────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Project Structure (Hackathon-Ready)

```
mplads-fraud-detection/
├── docs/
│   └── DATA_ARCHITECTURE.md          # This document
│
├── scripts/
│   ├── extractors/
│   │   ├── esakshi_scraper.py        # eSAKSHI dashboard scraper
│   │   ├── datagovindia_extractor.py # data.gov.in API client
│   │   └── cag_extractor.py          # CAG PDF parser
│   │
│   ├── preprocessing/
│   │   ├── cleaner.py                # Data cleaning rules
│   │   ├── features.py               # Feature engineering
│   │   └── loader.py                 # Load to SQLite
│   │
│   ├── alerts/
│   │   ├── rule_engine.py            # Rule-based anomaly detection
│   │   └── scoring.py                # Anomaly scoring
│   │
│   └── pipeline/
│       ├── run_daily.py              # Main batch pipeline
│       └── run_refresh.py            # Incremental refresh
│
├── api/
│   ├── main.py                       # FastAPI application
│   ├── routes/
│   │   ├── dashboard.py              # Dashboard endpoints
│   │   ├── works.py                  # Works CRUD
│   │   ├── anomalies.py              # Anomaly endpoints
│   │   └── metadata.py               # Reference data
│   └── models.py                     # Pydantic models
│
├── dashboard/
│   └── app.py                        # Streamlit dashboard
│
├── data/
│   ├── raw/                          # Raw extracted data
│   ├── processed/                    # Cleaned data
│   ├── features/                     # Feature store (Parquet)
│   └── mplads.db                     # SQLite database
│
├── config/
│   ├── sectors.json                  # Sector taxonomy
│   ├── districts.json                # LGD district codes
│   └── rules.json                    # Anomaly detection rules
│
├── tests/
│   ├── test_cleaner.py
│   ├── test_features.py
│   └── test_api.py
│
├── requirements.txt
├── README.md
└── .env.example                      # API keys template
```

---

## 9. Hackathon Implementation Priority

### Phase 1: Data Foundation (Day 1)
1. Set up SQLite database with schema
2. Download data.gov.in MPLADS datasets (CSV)
3. Run data.gov.in API extractor for full 18th LS data
4. Basic cleaning + loading to SQLite

### Phase 2: Feature Engineering (Day 1-2)
1. Compute MP-level aggregations
2. Compute vendor concentration metrics
3. Add compliance flags (45-day SLA, SC/ST rules)
4. Store features as Parquet

### Phase 3: Anomaly Detection (Day 2)
1. Implement rule engine with 8 core rules
2. Run rules against full dataset
3. Score and categorize anomalies
4. Populate anomaly table

### Phase 4: API + Dashboard (Day 2-3)
1. FastAPI endpoints for dashboard data
2. Streamlit dashboard with:
   - KPI summary cards
   - State/district choropleth map
   - MP leaderboard (highest anomaly scores)
   - Anomaly explorer with filters
   - Trend charts

### Phase 5: Polish (Day 3)
1. Add eSAKSHI scraper for latest data
2. WebSocket alerts (if time permits)
3. Demo preparation

---

## 10. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database** | SQLite | Zero config, portable, sufficient for hackathon scale (~200MB) |
| **API Framework** | FastAPI | Async, auto-docs, fast development |
| **Dashboard** | Streamlit | Rapid prototyping, built-in charts, minimal frontend code |
| **Data Format** | Parquet (features) + SQLite (queries) | Best of both: fast columnar reads + SQL flexibility |
| **Scraping** | Playwright | Handles JS-rendered eSAKSHI dashboard better than requests |
| **Processing** | Batch (daily) | Simpler to implement; real-time simulation possible |
| **Language** | Python | All libraries available, team can contribute |
| **Deployment** | Local + ngrok | Hackathon demo; no cloud cost |

---

*Document Version: 2.0 | Data Pipeline & Integration Architecture*  
*Last updated: September 2026*
