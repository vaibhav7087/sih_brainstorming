# ML/AI Anomaly Detection Architecture for MPLADS
## Advanced ML Research & Multi-Modal Pipeline Specification

> [!NOTE]
> **Research & Advanced Roadmap Specification**: This document outlines the comprehensive multi-modal ML/AI research framework and long-term production roadmap (spanning Graph Neural Networks, LSTM forecasting, and deep Computer Vision). For the canonical PPT evaluation and deployment architecture, consult [FINAL_ARCHITECTURE.md](FINAL_ARCHITECTURE.md) and [prd.md](prd.md), which define the core **3-Layer Defense Model** (Deterministic Rules + Isolation Forest + XGBoost + SHAP Explainability).

---

## 1. SYSTEM OVERVIEW

### 1.1 Architecture Summary
A multi-layered ML/AI pipeline that ingests MPLADS data from eSAKSHI portal, applies ensemble anomaly detection across five detection modules, and produces a unified risk score at work/vendor/MP/district granularity.

### 1.2 Detection Modules (5 Parallel Pipelines)
```
┌─────────────────────────────────────────────────────────────────────┐
│                    MPLADS DATA INGESTION LAYER                      │
│  (eSAKSHI API → PostgreSQL → Feature Engineering Pipeline)         │
└──────────────┬──────────────┬──────────────┬──────────────┬─────────┘
               │              │              │              │
    ┌──────────▼──────┐ ┌────▼────────┐ ┌───▼──────────┐ ┌─▼──────────┐ ┌─────────────┐
    │  STATISTICAL    │ │ TIME SERIES │ │    GRAPH     │ │    NLP     │ │  COMPUTER   │
    │  ANOMALY        │ │ ANOMALY     │ │    FRAUD     │ │ DOCUMENT   │ │  VISION     │
    │  DETECTION      │ │ DETECTION   │ │  DETECTION   │ │ ANALYSIS   │ │ SITE PHOTO  │
    │                 │ │             │ │              │ │            │ │ VERIFICATION│
    │ • Isolation     │ │ • LSTM      │ │ • GCN        │ │ • BERT     │ │ • YOLOv8    │
    │   Forest        │ │ • Prophet   │ │ • GAT        │ │ • T5       │ │ • ResNet    │
    │ • Z-Score       │ │ • ARIMA     │ │ • Node2Vec   │ │ • SpaCy    │ │ • CLIP      │
    │ • DBSCAN        │ │             │ │              │ │            │ │             │
    └──────────┬──────┘ └────┬────────┘ └───┬──────────┘ └─┬──────────┘ └──────┬──────┘
               │              │              │              │                    │
    ┌──────────▼──────────────▼──────────────▼──────────────▼────────────────────▼──────┐
    │                         RISK SCORING ENGINE                                       │
    │  (Ensemble Weighting → Multi-layer Scores → Confidence Thresholds → Alerts)      │
    └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MODULE 1: STATISTICAL ANOMALY DETECTION

### 2.1 Algorithms

| Algorithm | Library | Use Case | Hackathon Feasibility |
|-----------|---------|----------|----------------------|
| **Isolation Forest** | `sklearn.ensemble.IsolationForest` | Multivariate outlier detection on expenditure features | HIGH - instant fit/predict |
| **Local Outlier Factor (LOF)** | `sklearn.neighbors.LocalOutlierFactor` | Density-based anomaly in vendor spending clusters | HIGH |
| **DBSCAN** | `sklearn.cluster.DBSCAN` | Spatial clustering of geographic spending patterns | HIGH |
| **Z-Score / Modified Z-Score** | `scipy.stats.zscore` | Univariate outlier on sanction amounts | HIGH |
| **Mahalanobis Distance** | `scipy.spatial.distance.mahalanobis` | Multivariate distance from normal spending profile | HIGH |

### 2.2 Feature Vector for Statistical Detection

```python
# Per-work feature vector (12 features)
statistical_features = {
    # Financial
    "sanction_amount": float,           # ₹ sanctioned
    "expenditure_amount": float,         # ₹ actually spent
    "cost_overrun_ratio": float,         # (expenditure - sanction) / sanction
    "unit_cost_deviation": float,        # deviation from category median unit cost
    
    # Temporal
    "recommendation_to_sanction_days": int,  # MP recommendation → DC sanction
    "sanction_to_completion_days": int,       # Sanction → work completion
    "expenditure_to_uc_days": int,            # Expenditure → Utilization Certificate
    
    # Categorical
    "work_category_code": int,           # Encoded work type (1-33 categories)
    "is_repair_work": bool,              # Repair vs new construction
    
    # Aggregate
    "works_in_same_constituency_30d": int,   # Volume of works in 30-day window
    "avg_vendor_concentration": float,        # HHI index of vendor distribution
    "geographic_cluster_id": int              # DBSCAN cluster of location
}
```

### 2.3 Isolation Forest Configuration (Primary Detector)

```python
from sklearn.ensemble import IsolationForest

iso_forest = IsolationForest(
    n_estimators=200,           # 200 trees (default 100, slightly more for stability)
    max_samples='auto',         # subsample size
    contamination=0.05,         # expect ~5% anomaly rate (tune based on CAG findings)
    max_features=1.0,           # all features per tree
    bootstrap=False,
    random_state=42,
    n_jobs=-1
)

# Training: Fit on CLEAN historical data (works verified by CAG as legitimate)
# Inference: score_samples() returns anomaly score; lower = more anomalous
anomaly_scores = iso_forest.score_samples(X_test)
anomaly_labels = iso_forest.predict(X_test)  # -1 = anomaly, 1 = normal
```

### 2.4 DBSCAN for Geographic Clustering

```python
from sklearn.cluster import DBSCAN

# Cluster works by lat/lon to find spatially co-located works
# (detects: same location with different work IDs = potential duplicate)
dbscan = DBSCAN(
    eps=0.01,           # ~1km radius in decimal degrees
    min_samples=3,      # minimum works to form a cluster
    metric='haversine'  # geographic distance
)

# Works in same cluster with same category = DUPLICATE WORK ALERT
```

---

## 3. MODULE 2: TIME SERIES ANOMALY DETECTION

### 3.1 Algorithms

| Algorithm | Library | Use Case | Hackathon Feasibility |
|-----------|---------|----------|----------------------|
| **LSTM Autoencoder** | `PyTorch / TensorFlow` | Reconstruct normal spending sequences; high reconstruction error = anomaly | MEDIUM (pre-trained weights available) |
| **Facebook Prophet** | `prophet` | Seasonal trend decomposition on monthly spending per MP | HIGH - excellent for hackathon |
| **ARIMA/SARIMA** | `statsmodels` | Short-term expenditure forecasting anomaly | HIGH |
| **CS-LSTM** | Custom PyTorch | Contextual + Seasonal dual-branch (ICLR 2026 SOTA) | LOW - skip for hackathon |

### 3.2 LSTM Autoencoder Architecture

```
Input: 6-month sliding window × 8 time-series features
        ┌─────────────────────────────────────────────┐
        │              ENCODER                        │
        │  Input(8) → LSTM(64) → LSTM(32) → Dense(16)│
        │              ↓ latent vector z               │
        │              DECODER                        │
        │  Dense(16) → LSTM(32) → LSTM(64) → Dense(8)│
        └─────────────────────────────────────────────┘

Loss: MSE(input, reconstruction)
Anomaly Threshold: μ + 3σ of training reconstruction errors
```

```python
import torch
import torch.nn as nn

class LSTMAutoencoder(nn.Module):
    def __init__(self, n_features=8, hidden_dim=64, latent_dim=16):
        super().__init__()
        # Encoder
        self.encoder = nn.LSTM(n_features, hidden_dim, batch_first=True)
        self.enc_fc = nn.Linear(hidden_dim, latent_dim)
        # Decoder
        self.dec_fc = nn.Linear(latent_dim, hidden_dim)
        self.decoder = nn.LSTM(n_features, hidden_dim, batch_first=True)
        self.output = nn.Linear(hidden_dim, n_features)
    
    def forward(self, x):
        # x shape: (batch, seq_len=6, n_features=8)
        _, (h, _) = self.encoder(x)
        z = self.enc_fc(h.squeeze(0))
        z_dec = self.dec_fc(z).unsqueeze(1).repeat(1, x.size(1), 1)
        dec_out, _ = self.decoder(z_dec)
        return self.output(dec_out)
    
    def anomaly_score(self, x):
        recon = self.forward(x)
        return torch.mean((x - recon) ** 2, dim=(1, 2))
```

### 3.3 Time-Series Features (8 features per timestep)

```python
ts_features_per_month = {
    "total_sanctioned_amount": float,    # Monthly sanction sum
    "total_expenditure": float,          # Monthly expenditure sum
    "num_works_sanctioned": int,         # Count of new sanctions
    "num_works_completed": int,          # Count of completions
    "avg_completion_time_days": float,   # Mean time to complete
    "vendor_repeat_ratio": float,        # Fraction of works with repeat vendors
    "cost_overrun_count": int,           # Works exceeding sanctioned amount
    "uc_pending_count": int              # Works without utilization certificates
}
```

### 3.4 Prophet Configuration (Quick Win)

```python
from prophet import Prophet

# Per-MP monthly expenditure time series
model = Prophet(
    yearly_seasonality=True,      # MPLADS has fiscal year patterns
    weekly_seasonality=False,
    daily_seasonality=False,
    changepoint_prior_scale=0.05,  # conservative trend changes
    interval_width=0.95            # 95% prediction interval
)

# Anomaly = points outside prediction interval
forecast = model.predict(df)
df['anomaly'] = (df['y'] > forecast['yhat_upper']) | (df['y'] < forecast['yhat_lower'])
```

---

## 4. MODULE 3: GRAPH-BASED FRAUD DETECTION

### 4.1 Algorithm Selection

| Algorithm | Library | Use Case | Hackathon Feasibility |
|-----------|---------|----------|----------------------|
| **Graph Attention Network (GAT)** | `PyTorch Geometric` | Learn vendor-MP-constituency relationships with attention weights | MEDIUM |
| **Graph Convolutional Network (GCN)** | `PyTorch Geometric` | Node classification for fraud probability | MEDIUM |
| **Node2Vec** | `node2vec` / `gensim` | Learn vendor embeddings from relationship graph | HIGH |
| **Louvain Community Detection** | `community` (python-louvain) | Find tightly-knit vendor communities (collusion rings) | HIGH |

### 4.2 Graph Schema

```
HETEROGENEOUS GRAPH:
─────────────────────────────────────────────

Node Types:
  • MP (543 nodes) — attributes: party, state, tenure, total_allocation
  • WORK (50K+ nodes) — attributes: category, amount, status, dates
  • VENDOR (20K+ nodes) — attributes: type, registration_date, total_contracts
  • CONSTITUENCY (543 nodes) — attributes: state, district, population
  • DISTRICT (768 nodes) — attributes: state, development_index

Edge Types:
  • MP ──recommends──▶ WORK
  • WORK ──awarded_to──▶ VENDOR
  • WORK ──located_in──▶ CONSTITUENCY
  • CONSTITUENCY ──part_of──▶ DISTRICT
  • VENDOR ──shares_address_with──▶ VENDOR  (potential shell company)
  • VENDOR ──has_director_overlap──▶ VENDOR  (potential collusion)
  • MP ──same_party_as──▶ MP  (network propagation of fraud signals)
```

### 4.3 GAT Model Architecture

```python
import torch
from torch_geometric.nn import GATConv, global_mean_pool

class FraudGAT(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels=64, heads=4, num_classes=2):
        super().__init__()
        # 2-layer GAT
        self.conv1 = GATConv(in_channels, hidden_channels, heads=heads, 
                              concat=False, dropout=0.3)
        self.conv2 = GATConv(hidden_channels, hidden_channels, heads=1,
                              concat=False, dropout=0.3)
        # Node classifier
        self.classifier = torch.nn.Linear(hidden_channels, num_classes)
    
    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index).relu()
        return self.classifier(x)

# Node features: 15-dim (degree, pagerank, work_count, avg_amount, etc.)
# Edge features: relationship_type (one-hot encoded)
# Output: P(fraud) per node
```

### 4.4 Vendor Collusion Detection Features

```python
vendor_graph_features = {
    "degree_centrality": float,          # Number of connected works
    "pagerank_score": float,             # Importance in vendor network
    "betweenness_centrality": float,     # Bridge between communities
    "clustering_coefficient": float,     # Local clustering (shell company indicator)
    "shared_address_vendors": int,       # Vendors at same registered address
    "same_phone_vendors": int,           # Vendors sharing phone numbers
    "consecutive_psns": int,             # Consecutive procurement serial numbers
    "works_with_same_mp": int,           # Concentration of works with one MP
    "avg_time_between_awards": float,    # Suspiciously fast award cycles
    "total_value_all_contracts": float,  # Total contract value
}
```

### 4.5 Node2Vec for Vendor Embeddings (Quick Win)

```python
from node2vec import Node2Vec

# Pre-compute vendor embeddings
node2vec = Node2Vec(G, dimensions=64, walk_length=30, num_walks=200, 
                     workers=4, p=1, q=0.5)  # q<1 = BFS-like (explores local structure)
model = node2vec.fit(window=10, min_count=1, batch_words=4)

# Vendor embedding captures structural role in fraud network
# Use as input features for downstream anomaly detection
vendor_embeddings = {vendor: model.wv[vendor] for vendor in vendor_nodes}
```

---

## 5. MODULE 4: NLP DOCUMENT ANALYSIS

### 5.1 Algorithm Selection

| Algorithm | Library | Use Case | Hackathon Feasibility |
|-----------|---------|----------|----------------------|
| **Legal-BERT / Indian Legal BERT** | `HuggingFace transformers` | Understand contract terms, extract cost breakdowns | MEDIUM (pre-trained) |
| **T5-small** | `HuggingFace transformers` | Summarize work descriptions, detect vague/boilerplate language | HIGH |
| **Named Entity Recognition (NER)** | `spaCy / HuggingFace` | Extract monetary amounts, dates, vendor names from documents | HIGH |
| **TF-IDF + cosine similarity** | `sklearn` | Detect duplicate work descriptions | HIGH |
| **LLM-based comparison** | `OpenAI API / local LLM` | Compare sanctioned scope vs reported completion | MEDIUM |

### 5.2 NLP Pipeline Architecture

```
Documents (eSAKSHI):
  • Work Sanction Orders
  • Cost Estimates / Detailed Project Reports
  • Completion Certificates
  • Utilization Certificates
  • Vendor Invoices

        ┌────────────────────────────────────────────────────────────┐
        │                  NLP PROCESSING PIPELINE                   │
        ├────────────────────────────────────────────────────────────┤
        │                                                            │
        │  1. OCR (if scanned)  ──▶  Tesseract / Google Vision API  │
        │                                                            │
        │  2. Text Extraction   ──▶  PyPDF2 / pdfplumber            │
        │                                                            │
        │  3. Entity Extraction ──▶  SpaCy NER (₹ amounts, dates,   │
        │                           vendor names, locations)         │
        │                                                            │
        │  4. Semantic Analysis ──▶  Sentence-BERT embeddings       │
        │     • Work description similarity between works            │
        │     • Contract terms vs standard templates                 │
        │     • Cost estimate reasonableness                         │
        │                                                            │
        │  5. Anomaly Flags:                                        │
        │     • Vague work descriptions (< 3 unique keywords)       │
        │     • Cost estimate > 3σ from category median              │
        │     • Duplicate descriptions (cosine > 0.92)              │
        │     • Missing mandatory sections in DPR                    │
        └────────────────────────────────────────────────────────────┘
```

### 5.3 Document Anomaly Detection Features

```python
nlp_features = {
    # Cost estimate analysis
    "cost_estimate_vs_sanction_ratio": float,    # DPR cost vs sanctioned
    "unit_price_vs_market_avg": float,           # Deviation from market rates
    "has_detailed_breakdown": bool,              # Is cost itemized?
    
    # Work description analysis
    "description_length_chars": int,             # Short = suspicious
    "description_uniqueness_score": float,       # TF-IDF based
    "is_boilerplate": bool,                      # Matches template language
    "num_unique_keywords": int,                  # Vocabulary richness
    
    # Document completeness
    "has_dpr": bool,
    "has_estimated_cost": bool,
    "has_completion_certificate": bool,
    "has_uc": bool,
    "has_photographs": bool,
    "num_pages": int,                            # Suspiciously thin docs
    
    # Semantic similarity
    "similarity_to_other_works": float,          # Max cosine similarity
    "similarity_to_template": float              # Distance from standard template
}
```

### 5.4 Sentence-BERT Duplicate Detection

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')  # 384-dim, fast

# Encode all work descriptions
descriptions = [work.description for work in all_works]
embeddings = model.encode(descriptions)

# Find near-duplicate works (potential ghost/duplicate works)
sim_matrix = cosine_similarity(embeddings)
# Flag pairs with similarity > 0.92 as potential duplicates
```

---

## 6. MODULE 5: COMPUTER VISION SITE PHOTO VERIFICATION

### 6.1 Algorithm Selection

| Algorithm | Library | Use Case | Hackathon Feasibility |
|-----------|---------|----------|----------------------|
| **YOLOv8** | `ultralytics` | Detect construction objects, equipment, progress stage | HIGH (pre-trained) |
| **ResNet-50** | `torchvision` | Classify work completion status from site photos | HIGH (transfer learning) |
| **CLIP** | `openai-clip` | Zero-shot verification: "Is this a construction site?" | HIGH |
| **SIAMESE Network** | Custom PyTorch | Compare before/after photos for same work | MEDIUM |
| **EXIF Analysis** | `Pillow / exifread` | Extract GPS, timestamp metadata from photos | HIGH |

### 6.2 CV Pipeline Architecture

```
Site Photos (uploaded via eSAKSHI mobile app)
        │
        ├──▶ 1. EXIF Metadata Extraction
        │      • GPS coordinates → match work location
        │      • Timestamp → verify date claims
        │      • Device info → detect stock photos
        │
        ├──▶ 2. Image Authenticity Check
        │      • Screen capture detection (YOLOv8)
        │      • Copy-paste artifact detection
        │      • Resolution anomaly (< 100KB = suspect)
        │
        ├──▶ 3. Construction Stage Classification
        │      • ResNet-50 fine-tuned on 5 stages:
        │        [No Work, Foundation, Structure, Finishing, Complete]
        │      • Compare claimed progress vs detected progress
        │
        ├──▶ 4. Object Detection
        │      • YOLOv8 detecting: workers, equipment, materials
        │      • Worker count vs claimed workforce
        │      • Equipment presence vs equipment list in DPR
        │
        └──▶ 5. Duplicate Photo Detection
               • Perceptual hashing (pHash)
               • Same photo used for multiple works = ALERT
```

### 6.3 YOLOv8 Site Verification

```python
from ultralytics import YOLO

# Load pre-trained YOLOv8
model = YOLO('yolov8n.pt')  # nano model for speed

# Fine-tune on construction site dataset (can use open datasets)
# OR use zero-shot CLIP for construction verification

# Detection categories relevant to MPLADS works:
categories = [
    "worker", "hard_hat", "safety_vest",          # Safety compliance
    "excavator", "cement_mixer", "crane",          # Equipment verification
    "bricks", "cement_bags", "steel_bars",         # Material verification
    "road_surface", "building_structure", "pipe",   # Work type verification
    "water_tank", "solar_panel", "computer_lab"    # Specific MPLADS work types
]

results = model.predict(source=site_photo_path, conf=0.5)
detected_objects = [r.boxes.cls for r in results]
```

### 6.4 Photo Fraud Detection Features

```python
cv_features = {
    # EXIF analysis
    "has_exif_data": bool,
    "gps_matches_work_location": bool,        # ±500m tolerance
    "timestamp_matches_claimed_date": bool,    # ±7 days tolerance
    "is_screen_capture": bool,                 # Detected screen photo
    "image_file_size_kb": float,               # Tiny = suspect
    
    # Content analysis
    "construction_stage_detected": str,        # [none, foundation, structure, finishing, complete]
    "stage_matches_claimed": bool,             # Cross-check with reported progress
    "worker_count_detected": int,              # YOLO count
    "equipment_detected": list,                # Equipment types found
    "has_materials_visible": bool,
    
    # Duplicate detection
    "perceptual_hash": str,                    # pHash for near-duplicate detection
    "same_photo_other_works": bool,            # Alert if reused
    "photo_diversity_score": float             # How many unique photos per work
}
```

---

## 7. RISK SCORING ENGINE

### 7.1 Multi-Layer Scoring Architecture

```
Layer 1: WORK-LEVEL SCORE (0-100)
├── Statistical anomaly score     (weight: 0.25)
├── Time-series anomaly score     (weight: 0.20)
├── NLP document anomaly score    (weight: 0.25)
├── CV site verification score    (weight: 0.20)
└── Graph anomaly score           (weight: 0.10)

Layer 2: VENDOR-LEVEL SCORE (0-100)
├── Average work scores for vendor           (weight: 0.30)
├── Vendor graph centrality anomaly          (weight: 0.25)
├── Vendor address/phone overlap count       (weight: 0.20)
├── Vendor work completion rate              (weight: 0.15)
└── Vendor cost deviation from market        (weight: 0.10)

Layer 3: MP-LEVEL SCORE (0-100)
├── Average work scores in constituency      (weight: 0.30)
├── Work category distribution anomaly      (weight: 0.20)
├── Vendor concentration (HHI)               (weight: 0.20)
├── Temporal spending pattern anomaly        (weight: 0.15)
└── Fund utilization efficiency              (weight: 0.15)

Layer 4: DISTRICT-LEVEL SCORE (0-100)
├── Aggregate MP scores in district          (weight: 0.40)
├── Inter-MP vendor sharing anomaly          (weight: 0.25)
├── Geographic spending density anomaly      (weight: 0.20)
└── Category-wise deviation from state avg   (weight: 0.15)
```

### 7.2 Confidence Thresholds & Alert Levels

```python
ALERT_THRESHOLDS = {
    "CRITICAL": {"min_score": 80, "action": "Immediate CAG referral, freeze funds"},
    "HIGH":     {"min_score": 60, "action": "District Collector review within 7 days"},
    "MEDIUM":   {"min_score": 40, "action": "Nodal Officer flagged for quarterly audit"},
    "LOW":      {"min_score": 20, "action": "Added to watchlist, no immediate action"},
    "NORMAL":   {"min_score": 0,  "action": "No action required"}
}

# Confidence is separate from score
# A work can have score=65 but confidence=0.4 (uncertain)
# Require confidence > 0.7 for HIGH+ alerts to reduce false positives
CONFIDENCE_THRESHOLD = 0.70
```

### 7.3 Ensemble Weighting Formula

```python
def compute_risk_score(anomaly_signals: dict) -> tuple[float, float]:
    """
    Returns (risk_score, confidence)
    """
    # Weighted average of normalized scores
    weights = {
        'statistical': 0.25,
        'timeseries': 0.20,
        'nlp': 0.25,
        'cv': 0.20,
        'graph': 0.10
    }
    
    score = sum(weights[k] * anomaly_signals[k]['score'] for k in weights)
    
    # Confidence = agreement between detectors
    # If 4/5 modules flag anomaly → high confidence
    num_flagged = sum(1 for k in anomaly_signals if anomaly_signals[k]['flagged'])
    confidence = num_flagged / len(weights)
    
    return min(score, 100), confidence
```

---

## 8. TRAINING DATA STRATEGY

### 8.1 Fraud Patterns from CAG Reports (Labeled Data Sources)

| Fraud Pattern | Source | Label |
|---------------|--------|-------|
| Fund utilization without documents | CAG Report 1993-2000 | Documented irregularity |
| Inflated cost estimates (>2x market rate) | CAG audit findings | Cost anomaly |
| Duplicate works (same location, different IDs) | CAG sample audit | Duplicate work |
| Works on inadmissible sites (religious, private) | CAG flagged | Inadmissible work |
| Vendor concentration (>50% works to one vendor) | Procurement data analysis | Vendor collusion |
| Fund diversion to non-MPLADS projects | CAG findings | Fund diversion |
| Works without MP recommendation | CAG findings | Procedural violation |
| Abandoned/incomplete works (>2 years) | eSAKSHI status data | Abandoned work |
| Irregular clubbing with other schemes | CAG audit | Scheme violation |
| Suspected misappropriation (₹118+ lakhs) | CAG Report | Confirmed fraud |

### 8.2 Semi-Supervised Learning Strategy

```
┌───────────────────────────────────────────────────────────────┐
│                    DATA STRATEGY                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  LABELED DATA (~200-500 works):                              │
│  • CAG-identified irregular works (positive class)           │
│  • CAG-verified legitimate works (negative class)            │
│  • Use for supervised fine-tuning of GNN, LSTM-AE           │
│                                                               │
│  UNLABELED DATA (~50,000+ works):                            │
│  • All works from eSAKSHI portal                             │
│  • Use for unsupervised methods:                             │
│    - Isolation Forest (no labels needed)                     │
│    - Autoencoder reconstruction error                        │
│    - DBSCAN clustering                                       │
│    - Node2Vec embeddings                                     │
│                                                               │
│  SYNTHETIC DATA GENERATION:                                  │
│  • Use SMOTE-NC for tabular fraud patterns                   │
│  • Use CTGAN (Conditional Tabular GAN) for realistic fraud   │
│    scenarios with mixed feature types                         │
│  • Inject controlled anomalies into clean time series        │
│                                                               │
│  FEW-SHOT LEARNING:                                          │
│  • Pre-trained Legal-BERT for document analysis              │
│  • Pre-trained YOLOv8 for construction site detection         │
│  • Fine-tune with 50-100 labeled examples                    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 8.3 Synthetic Data Generation

```python
from sdv.single_table import CTGAN

# Generate synthetic fraud patterns based on CAG findings
synthetic_config = {
    'cost_overrun': {'ratio': (1.5, 3.0), 'probability': 0.15},
    'delayed_completion': {'days': (365, 730), 'probability': 0.20},
    'vendor_concentration': {'ratio': (0.6, 0.95), 'probability': 0.10},
    'duplicate_work': {'similarity': (0.85, 0.99), 'probability': 0.05},
    'ghost_work': {'document_count': (0, 1), 'probability': 0.08}
}

# CTGAN learns joint distribution and generates realistic synthetic rows
ctgan = CTGAN(
    epochs=300,
    batch_size=500,
    verbose=True
)
ctgan.fit(real_data)
synthetic_fraud_data = ctgan.sample(num_rows=5000)
```

---

## 9. HACKATHON IMPLEMENTATION PLAN (48 Hours)

### 9.1 Tech Stack (Prefer Python Ecosystem)

```
BACKEND:     FastAPI + Python 3.10+
DATABASE:    PostgreSQL (or SQLite for demo)
ML FRAMEWORKS: scikit-learn, PyTorch, HuggingFace Transformers
CV:          Ultralytics YOLOv8, OpenCV
NLP:         spaCy, sentence-transformers, HuggingFace
GRAPH:       NetworkX (simple), PyG (advanced)
VISUALIZATION: Streamlit / Gradio for dashboard
DEPLOYMENT:  Docker (if time permits)
```

### 9.2 Sprint Plan

| Hour | Task | Deliverable |
|------|------|-------------|
| 0-6 | Data prep, feature engineering, DB setup | Clean dataset ready |
| 6-12 | Module 1 (Statistical) + Module 2 (Time Series) | IsolationForest + LSTM-AE working |
| 12-18 | Module 3 (Graph) | Vendor network graph + GAT/Node2Vec |
| 18-24 | Module 4 (NLP) + Module 5 (CV) | Document analysis + photo verification |
| 24-30 | Risk scoring engine integration | Unified scoring pipeline |
| 30-36 | Streamlit dashboard | Interactive anomaly explorer |
| 36-42 | Demo data generation, edge cases, polish | Demo-ready system |
| 42-48 | Final testing, presentation prep | SIH submission ready |

### 9.3 Minimum Viable Demo

For hackathon demo, prioritize these modules (highest impact, lowest effort):

1. **Isolation Forest** on tabular data (works instantly, strong demo)
2. **Facebook Prophet** for time-series (2 lines of code, great visuals)
3. **NetworkX** graph visualization (vendor collusion is visually compelling)
4. **Sentence-BERT** duplicate detection (easy to show before/after)
5. **YOLOv8** for site photo check (impressive demo)

Skip for hackathon (use post-hackathon):
- Full GAT training (use Node2Vec instead)
- Custom LSTM training (use pre-trained autoencoder)
- OCR pipeline (assume clean PDFs)

---

## 10. KEY ALGORITHM DECISIONS SUMMARY

| Fraud Type | Primary Algorithm | Secondary Algorithm | Confidence Method |
|------------|-------------------|---------------------|-------------------|
| Cost overrun | Isolation Forest | Z-Score | Statistical significance |
| Delayed projects | LSTM Autoencoder | Prophet | Reconstruction error threshold |
| Duplicate works | Sentence-BERT cosine similarity | DBSCAN | Similarity score > 0.92 |
| Vendor collusion | Node2Vec + Louvain | GAT | Community density metric |
| Ghost works | YOLOv8 + CV analysis | Document completeness | Multi-module agreement |
| Fund diversion | Time-series Prophet | Statistical patterns | Prediction interval violation |
| Inflated estimates | NLP cost extraction | Statistical comparison | Market price deviation |
| Photo fraud | YOLOv8 + EXIF analysis | pHash duplicates | EXIF metadata mismatch |

---

## 11. MODEL EVALUATION STRATEGY

```python
# Metrics for each module
EVALUATION_METRICS = {
    'supervised': ['precision', 'recall', 'f1_score', 'roc_auc'],
    'unsupervised': ['precision_at_k', 'recall_at_k', 'anomaly_detection_rate'],
    'ranking': ['ndcg', 'map'],  # Are high-risk works ranked higher?
    'system': ['false_positive_rate', 'alert_accuracy', 'detection_latency']
}

# Since labeled data is scarce, focus on:
# 1. Precision@50 (of top 50 flagged works, how many are truly anomalous?)
# 2. Anomaly detection rate against CAG-identified cases
# 3. False positive rate (must be < 10% for usability)
```

---

## 12. REFERENCES

1. Li et al. (2025) - "Unsupervised Outlier Detection in Audit Analytics Using USA Spending Data" - arXiv:2509.19366
2. Herreros-Martínez et al. (2024) - "Applied ML to Anomaly Detection in Enterprise Purchase Processes" - arXiv:2405.14754
3. Bai & Qiu (2023) - "Automatic Procurement Fraud Detection with ML" - arXiv:2304.10105
4. Zhang et al. (2026) - "Contextual and Seasonal LSTMs for Time Series Anomaly Detection" - ICLR 2026
5. Vossler et al. (2025) - "Using Anomaly Scores from Unlabeled Data to Improve Risk Estimation" - IRS
6. Song et al. (2025) - "Anomaly Detection of Government Data Based on Multi-Scale Structure Reconstruction" - IEEE ICIMCT
7. GNN Fraud Detection Survey - ACM Computing Surveys, 2025
8. CAG Reports on MPLADS (1993-2000, 2023-2025)
9. MPLADS eSAKSHI Portal - mplads.mospi.gov.in
10. Yang et al. (2023) - "Computer Vision for Construction Progress Monitoring" - arXiv:2305.15097
