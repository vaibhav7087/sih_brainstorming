# COMPETITIVE EDGE RESEARCH: AI-Powered MPLADS Monitoring Platform
## Market Research & Competitive Intelligence | SIH 2026 PS 26102

---

## 1. RESEARCH LANDSCAPE: What Exists Today

### 1.1 Global State-of-the-Art in Government Fraud Detection

| System | Country | What It Does | Relevance to Us |
|--------|---------|--------------|-----------------|
| **Alice (CGU)** | Brazil | AI+RPA analyzing 191K acquisitions/year, 203 audits, EUR 4.15B contracts. Reduced audit time from 400→8 days. Uses NLP on Brazilian procurement data. | Closest analog. But no satellite verification, no network graph analysis, no explainability layer. |
| **ALICE + LLMs** | Brazil | Uses custom NLP for Portuguese procurement text. 40 predefined fraud typologies. | We can beat this with multilingual LLMs + Indian language support. |
| **DATACROS II** | EU | AI for detecting shell companies and bid rigging in procurement | We should integrate company verification + beneficial ownership. |
| **SNAP 2.0 (PSFA)** | UK | Azure-based entity resolution, knowledge graphs, ML risk scoring, generative AI for fraud detection across 3M+ UK companies | £3M/year budget. We're doing this at 1/100th the cost. Reference architecture. |
| **Red Flags Management** | Kazakhstan | 43 red flag indicators + LLM parsing of PDF specs. Detects overpricing ($5 reams sold at $500). Shell company detection. | Excellent reference. They use GPT-3.5 turbo. We can use open-source LLMs. |
| **FRA Accelerator (PSFA)** | UK | LLM-based fraud risk assessment generation. Uses GPT-5.2 + RAG over expert guides. | Good for automated risk report generation. |
| **Coima** | Argentina | Graph-based anti-corruption tool. Scrapes procurement → Neo4j → detectors → risk scores → AI-assisted investigation. Serial winners, bid rotation, contract splitting detection. | **DIRECTLY APPLICABLE** architecture. Open source. We should study this. |
| **Ledgerlight** | Canada | AI-assisted procurement oversight. Deterministic red flags + LLM narration. Grounding validation to prevent hallucination. Red-team testing suite. | Excellent approach to responsible AI in government audit. |
| **CAG AI Platform** | India | CAG building LLM for audit. Detecting cartels, bid rotation, vendor clustering. Dynamic competition-risk heatmaps. | **THIS IS OUR COMPETITOR** but they're building it for CAG, not MPLADS. We're complementary. |

### 1.2 Key Research Papers to Reference

| Paper | Key Finding | Our Application |
|-------|-------------|-----------------|
| **Santos et al. (2025)** - EPJ Data Science | Systematic mapping: 93 papers. ML best for collusion, statistical methods for favoritism. **Ensemble methods beat all others.** AUC ≈ 0.98. | Use ensemble methods (Random Forest + XGBoost) for our core models. |
| **Ndolo et al. (2025)** - Kenya | Hybrid ML: Logistic Regression + Random Forest + K-Means. Single-bid tenders are strongest predictor. XAI dashboards for audit justification. | Adapt their feature engineering for MPLADS work types. |
| **BridgeGap (2025)** - EU | All EU states now have ML-ready procurement data. But need beneficial ownership + political connections data for real detection. | We need to link MPLADS data with company PAN/Aadhaar data. |
| **PRO-Trust Pipeline (2026)** | Ethics-oriented pipeline for trustworthy AI fraud detection. Addresses opacity, transparency, explainability, oversight, control. | Follow their 5-principle framework for our platform. |
| **Benford's Law Studies** | First-two and first-three digit tests detect structuring around regulatory thresholds (₹10L, ₹50L, ₹200L). 20-50% success rate. | **APPLY TO MPLADS**: Detect transaction splitting near ₹50L threshold (receipt-only limit). |
| **Mexico PU Learning (2026)** - Nature | Positive-Unlabeled learning + network features. Network-derived features (coreness, eigenvector centrality) are MORE important than red flags. | Apply PU learning since we won't have labeled fraud data. Network features are gold. |
| **FedGraph-AGI (2026)** | Federated GNN + AGI reasoning for cross-border fraud. 92.3% accuracy. MoE for heterogeneous jurisdictions. | Federated learning for cross-state MPLADS analysis without sharing data. |

---

## 2. CUTTING-EDGE TECHNIQUES NOBODY HAS APPLIED TO MPLADS

### 2.1 Federated Learning for Cross-State Analysis ⭐ UNIQUE OPPORTUNITY

**What it is**: Train models across 28 states + 8 UTs without sharing sensitive data. Each state's data stays local; only model gradients are shared.

**Why it's novel for MPLADS**:
- NOBODY has applied federated learning to MPLADS
- India has 543 Lok Sabha constituencies across states with different data standards
- Privacy-preserving: Complies with India's DPDP Act 2023
- Can detect cross-state fraud patterns (same vendor operating across states)

**Implementation**:
```python
# Key libraries
import flwr as fl  # Flower federated learning framework
from pytorch_flower import FedAvg  # Federated Averaging

# Architecture: Each state = 1 federated client
# Central server aggregates gradients only
# Differential privacy (ε=1.0) for additional protection
```

**Reference**: FedGraph-AGI paper achieves 92.3% accuracy with ε=1.0 differential privacy.

### 2.2 Explainable AI (XAI) for Audit Trails ⭐ CRITICAL FOR JUDGES

**What it is**: SHAP/LIME explanations for every fraud alert, creating audit-ready documentation.

**Why judges will love it**:
- Every prediction comes with "WHY this was flagged"
- Global feature importance shows what the model learned
- Per-transaction explanations for individual cases
- Regulatory compliance (aligns with CAG standards)

**Implementation**:
```python
import shap
explainer = shap.TreeExplainer(xgboost_model)
shap_values = explainer.shap_values(X_test)

# Generate per-transaction explanation
# "This work was flagged because:
#  1. Cost deviation from similar works: +340% (SHAP: +0.23)
#  2. Same contractor won 47 consecutive works (SHAP: +0.18)
#  3. Work near ₹50L threshold (SHAP: +0.15)"
```

**Key paper finding**: XGBoost + TreeSHAP achieves Kendall's W = 0.9912 (near-perfect stability), making it suitable for regulatory documentation.

### 2.3 Computer Vision for Satellite Verification ⭐ VISUALLY IMPRESSIVE

**What it is**: Use Sentinel-2/Landsat satellite imagery to verify reported construction progress.

**Why it's a killer feature**:
- MPLADS works include physical infrastructure (roads, buildings, wells)
- Geo-tagged photos already mandatory (May 2026)
- Can detect: construction progress, land clearing, structure existence
- India already has ISRO Bhuvan (free), Sentinel-2 (free), Landsat (free)

**Implementation approach**:
```python
# Indices for construction detection
NDVI = (NIR - Red) / (NIR + Red)  # Vegetation removal → construction
BSI = ((SWIR1 + Red) - NIR) / ((SWIR1 + Red) + NIR)  # Bare soil → earthwork
NDBI = (SWIR1 - NIR) / (SWIR1 + NIR)  # Built-up → completion

# Siamese Neural Network for temporal change detection
# Compare: "Before MPLADS work" vs "After MPLADS work"
```

**Reference**: SatVerify (open-source), CoE-SURVEI (BARC collaboration), IIT Delhi's BhuPRAHARI for MGNREGS.

### 2.4 Graph Neural Networks for Vendor Collusion Detection ⭐ MOST NOVEL

**What it is**: Model vendor-contractor-constituency relationships as a graph. Detect collusion networks.

**Why it's cutting-edge**:
- The Nature (2026) Mexico paper shows network features are MORE important than red flags
- Eigenvector centrality of vendors in procurement network predicts fraud
- Can detect: bid rotation, shell companies, vendor clusters, repeated winners

**Graph schema for MPLADS**:
```
MP → recommends → Work → executed_by → Contractor → operates_in → Constituency
Work → sanctioned_by → District → belongs_to → State
Contractor → has_director → Person → also_directs → Other_Company
```

**Key algorithms**:
- Node2Vec for vendor embeddings
- GraphSAGE for inductive learning
- Community detection (Louvain) for vendor clusters

### 2.5 Benford's Law for Transaction Splitting Detection ⭐ SIMPLE BUT POWERFUL

**What it is**: Analyze digit distributions in MPLADS fund amounts to detect structuring.

**Why it matters for MPLADS**:
- ₹50L threshold: Below this, only receipt needed (easy to fabricate)
- ₹10L threshold: Only simple proof required
- Corrupt actors split transactions just below these thresholds
- Benford's Law reveals these patterns statistically

**Implementation**:
```python
# First-two-digit test on MPLADS fund amounts
from benford import benford_test

# Focus areas:
# - Digit pattern "50" (₹50L threshold)
# - Digit pattern "10" (₹10L threshold)
# - Digit pattern "200" (₹200L threshold)
# Chi-square test for conformity
```

### 2.6 LLM-Based Document Analysis ⭐ PRACTICAL HIGH-IMPACT

**What it is**: Use LLMs to analyze procurement documents, work descriptions, and correspondence.

**Applications for MPLADS**:
- Parse work descriptions for red flags (vague descriptions, unusual categories)
- Extract entities from documents (contractor names, amounts, dates)
- Compare work descriptions against completed work photos
- Generate risk reports in natural language
- Multi-language support (Hindi, regional languages)

**Approach**: Fine-tune open-source LLM (Mistral/Llama) on Indian government procurement data + RAG over MPLADS guidelines.

### 2.7 Digital Twin for Project Simulation ⭐ WOW FACTOR

**What it is**: Create virtual replicas of MPLADS projects to simulate outcomes.

**Applications**:
- Predict project completion time based on historical patterns
- Simulate fund utilization scenarios
- Model "what-if" analysis (if contractor delays, what's the cost?)
- Visual dashboards showing real-time project status

**Implementation**: Use Streamlit + Plotly for quick digital twin prototype.

---

## 3. OPEN SOURCE TOOLS TO USE

### 3.1 Core Detection Stack

| Tool | Version | Purpose | Why This One |
|------|---------|---------|-------------|
| **PyOD** | 3.6.5+ | Outlier/anomaly detection | 61 detectors, 46M+ downloads, JMLR published. ADEngine for auto model selection. |
| **NetworkX** | 3.3+ | Network/graph analysis | Industry standard for graph operations. |
| **Neo4j** | 5.x | Graph database | Store vendor-contractor networks. Cypher queries for pattern detection. |
| **SHAP** | 0.45+ | Model explainability | TreeSHAP for XGBoost (Kendall's W=0.9912). |
| **XGBoost** | 2.1+ | Supervised classification | Best performing on tabular fraud data. |
| **Scikit-learn** | 1.5+ | ML pipeline | Standard ML toolkit. |
| **PyTorch Geometric** | 2.5+ | Graph neural networks | For GNN-based collusion detection. |

### 3.2 Document & NLP Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **LangChain** | 0.3+ | LLM orchestration, RAG pipelines |
| **HuggingFace Transformers** | 4.44+ | Pre-trained models, fine-tuning |
| **Mistral-7B / Llama-3.1-8B** | Latest | Open-source LLMs for document analysis |
| **Sentence-Transformers** | 3.1+ | Text embeddings for similarity search |
| **spaCy** | 3.7+ | Indian language NER (Hindi, etc.) |
| **PDFPlumber / Camelot** | Latest | PDF table extraction from procurement docs |

### 3.3 Satellite & Geospatial Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Google Earth Engine Python API** | Latest | Access Sentinel-2, Landsat imagery |
| **Rasterio** | 1.3+ | Geospatial raster operations |
| **GeoPandas** | 0.14+ | Geospatial vector operations |
| **OpenCV** | 4.10+ | Image processing for construction detection |
| **Sentinelsat** | 1.2+ | Download Sentinel-2 data |

### 3.4 Visualization & Dashboard

| Tool | Purpose |
|------|---------|
| **Streamlit** | Rapid prototyping, ML dashboards |
| **Plotly/Dash** | Interactive charts, maps |
| **Folium** | Interactive maps for constituency visualization |
| **PyVis** | Interactive network graph visualization |
| **Grafana** | Real-time monitoring dashboards |

### 3.5 Infrastructure & MLOps

| Tool | Purpose |
|------|---------|
| **MLflow** | Experiment tracking, model versioning |
| **DVC** | Data version control |
| **Docker** | Containerization |
| **FastAPI** | Backend API |
| **PostgreSQL + PostGIS** | Database with geospatial support |

---

## 4. WHAT MAKES US UNIQUELY STAND OUT

### 4.1 Nobody Has Done X for MPLADS Before

1. **First Federated Learning system for cross-state MPLADS analysis**
   - No existing system analyzes patterns across 543 constituencies
   - Privacy-preserving by design (DPDP Act compliant)

2. **First Satellite Verification of MPLADS Works**
   - Mandatory geo-tagging started May 2026
   - Nobody is using satellite imagery to verify reported progress
   - Siamese neural networks for before/after comparison

3. **First Network Graph Analysis of MPLADS Vendor Ecosystem**
   - Detect vendor clusters, shell companies, repeated winners
   - Eigenvector centrality for fraud probability scoring
   - Community detection for collusion rings

4. **First XAI-Compliant Audit Trail for MPLADS**
   - Every alert has SHAP explanation
   - Audit-ready documentation generation
   - Aligns with CAG standards

5. **First Benford's Law Application to Indian Government Funds**
   - Detect transaction splitting near ₹50L/₹10L thresholds
   - Statistical rigor for audit evidence

### 4.2 Novel Combinations

| Combination | Why It's Novel |
|-------------|---------------|
| **Graph Neural Networks + XAI** | Nobody combines GNN explainability with fraud detection in government |
| **Satellite CV + Anomaly Detection** | Verify physical works AND detect financial anomalies simultaneously |
| **Benford's Law + LLM** | Statistical detection + natural language explanation |
| **Federated Learning + Cross-State Analysis** | First privacy-preserving cross-state fraud model in India |
| **PU Learning + Network Features** | Handle labeled fraud data scarcity (Mexico approach adapted for India) |

### 4.3 First to Apply (Specific Techniques)

- **First application of Graph Neural Networks to MPLADS**
- **First federated learning system for Indian government scheme monitoring**
- **First satellite-based verification of MPLADS physical works**
- **First SHAP-based explainable audit trail for government fund monitoring**
- **First Benford's Law analysis of MPLADS fund distribution patterns**
- **First LLM-powered document analysis for MPLADS work descriptions**

### 4.4 Innovation That Judges Haven't Seen

1. **Real-Time Competition-Risk Heatmaps** (inspired by CAG's vision but implemented)
2. **Vendor Network X-Ray**: Visual graph showing all relationships of a vendor
3. **Temporal Fraud Patterns**: Detect how fraud evolves over parliamentary terms
4. **Cross-Constituency Benchmarking**: Compare similar works across constituencies
5. **Automated Red Flag Reports**: LLM generates natural language risk assessments
6. **Satellite Progress Verification**: Independent verification independent of contractor claims

---

## 5. EXACT TOOLS, APIs & MODELS

### 5.1 Python Packages (Exact Versions)

```txt
# Core ML
xgboost>=2.1.0
scikit-learn>=1.5.0
pyod>=3.6.5
shap>=0.45.0
lightgbm>=4.3.0

# Graph & Network
networkx>=3.3
neo4j>=5.20.0
torch-geometric>=2.5.0
node2vec>=0.4.0

# NLP & LLM
langchain>=0.3.0
transformers>=4.44.0
sentence-transformers>=3.1.0
spacy>=3.7.0
mistral-inference>=0.1.0

# Geospatial
rasterio>=1.3.0
geopandas>=0.14.0
sentinelsat>=1.2.0
earthengine-api>=0.1.400
folium>=0.17.0

# Visualization
streamlit>=1.38.0
plotly>=5.24.0
pyvis>=0.3.0

# Backend & Infrastructure
fastapi>=0.115.0
mlflow>=2.16.0
dvc>=3.60.0
uvicorn>=0.30.0

# PDF & Document Processing
pdfplumber>=0.11.0
camelot-py>=0.11.0

# Statistical Analysis
scipy>=1.14.0
numpy>=1.26.0
pandas>=2.2.0

# Federated Learning
flwr>=1.12.0  # Flower FL framework
```

### 5.2 APIs We Can Integrate

| API | Purpose | Cost |
|-----|---------|------|
| **MPLADS eSAKSHI Portal** | Primary data source | Free (government portal) |
| **ISRO Bhuvan** | Satellite imagery | Free for Indian researchers |
| **Google Earth Engine** | Sentinel-2, Landsat | Free for research |
| **OpenCorporates API** | Company verification | Free tier available |
| **MCA21** | Director/company data | Free (government) |
| **India Data Portal** | Government spending data | Free |
| **CAG Reports API** | Audit findings | Public documents |
| **RBI Data** | Financial benchmarks | Free |

### 5.3 Pre-trained Models to Fine-tune

| Model | Source | Fine-tuning Purpose |
|-------|--------|---------------------|
| **Mistral-7B-Instruct** | HuggingFace | Document analysis, report generation |
| **indic-transformers** | AI4Bharat | Hindi/regional language understanding |
| **ResNet-50** | PyTorch | Satellite image classification |
| **Sentence-BERT** | HuggingFace | Text similarity for work descriptions |
| **Time-DeepSVDD** | PyOD | Time-series anomaly detection on fund flows |

### 5.4 Available Datasets

| Dataset | Source | Content |
|---------|--------|---------|
| **MPLADS Public Dashboard** | mplads.gov.in | Fund allocations, works, completion status |
| **MPLADS eSAKSHI Portal** | mplads.mospi.gov.in | Detailed work data, geo-tagged photos |
| **Open Tender EU** | opentender.eu | European procurement (for benchmarking) |
| **Operation Car Wash** | Kaggle | Procurement fraud labels (for PU learning research) |
| **ULB Credit Card Fraud** | Kaggle | Benchmark dataset for anomaly detection |
| **IEEE-CIS Fraud Detection** | Kaggle | Large-scale fraud dataset |
| **Sentinel-2 L2A** | Copernicus | Free satellite imagery |
| **MCA21** | mca.gov.in | Company director data |

---

## 6. UNSOLVED PROBLEMS IN THIS SPACE

### 6.1 What Research Says Is Still Hard

1. **Lack of Labeled Fraud Data**
   - Most procurement fraud is never detected
   - No ground truth for training supervised models
   - Solution: PU Learning (Positive-Unlabeled) from Mexico approach + semi-supervised learning

2. **Cross-Jurisdiction Data Fragmentation**
   - Each state has different data formats and standards
   - No unified identifier across systems
   - Solution: Entity resolution + federated learning

3. **Concept Drift in Fraud Patterns**
   - Fraudsters adapt to detection methods
   - Models degrade over time
   - Solution: Continuous learning + drift detection + adaptive thresholds

4. **Explainability vs Performance Trade-off**
   - Best models (deep learning) are least explainable
   - Auditors need explanations
   - Solution: XGBoost + SHAP (best balance)

5. **False Positive Burden**
   - Rule-based systems generate 90%+ false positives
   - Overwhelms investigators
   - Solution: ML-based risk scoring + tiered alerts

### 6.2 What Current Products Can't Do

| Gap | Current State | Our Opportunity |
|-----|--------------|-----------------|
| **No satellite verification** | All systems trust reported progress | We verify independently |
| **No cross-state analysis** | Each state monitors in isolation | Federated learning across states |
| **No network graph analysis** | Contract-level only | Vendor network X-ray |
| **No explainability** | Black-box alerts | SHAP explanations for every alert |
| **No Benford's Law** | Manual threshold checks | Automated digit analysis |
| **No LLM document analysis** | Manual document review | Automated risk report generation |
| **No temporal pattern detection** | Static analysis | Time-series fraud evolution |
| **No vendor clustering** | Individual vendor tracking | Community detection for collusion |

### 6.3 What Would Be Genuinely Novel Contribution

1. **Federated Multi-State MPLADS Intelligence**: First system to learn from ALL states simultaneously while preserving data sovereignty.

2. **Satellite-Verified Physical Audit**: Independent verification of infrastructure works using space technology - not dependent on anyone's claims.

3. **Graph-Based Vendor Ecosystem Analysis**: Mapping the entire vendor-contractor-MP network to detect structural fraud patterns invisible at the transaction level.

4. **Explainable Audit Trail with Benford's Law**: Combining statistical rigor (Benford) with ML power (XGBoost) and explainability (SHAP) for a complete audit-grade system.

5. **Real-Time Adaptive Threshold System**: Reinforcement learning to dynamically adjust fraud detection thresholds based on investigation outcomes.

---

## 7. IMPLEMENTATION PRIORITY MATRIX

### Phase 1: Core (SIH Prototype) - Week 1-2
- [ ] Data scraping from MPLADS portal
- [ ] Basic anomaly detection (PyOD IForest)
- [ ] XGBoost + SHAP for fraud scoring
- [ ] Streamlit dashboard
- [ ] Benford's Law analysis

### Phase 2: Advanced (Demo Day) - Week 3-4
- [ ] Network graph analysis (NetworkX + Neo4j)
- [ ] Vendor clustering and community detection
- [ ] LLM document analysis (Mistral-7B + RAG)
- [ ] Advanced visualization (PyVis for network graphs)

### Phase 3: Wow Factor (Judges) - Week 4-5
- [ ] Satellite imagery verification (Sentinel-2 + NDVI/BSI)
- [ ] Cross-state federated learning prototype
- [ ] Automated audit report generation
- [ ] Real-time monitoring dashboard

---

## 8. KEY COMPETITIVE ADVANTAGES SUMMARY

| # | Advantage | Why It Wins |
|---|-----------|-------------|
| 1 | **Satellite Verification** | Nobody else does this for MPLADS |
| 2 | **Graph Network Analysis** | Detects vendor collusion invisible to others |
| 3 | **Federated Learning** | First privacy-preserving cross-state system |
| 4 | **Explainable AI (SHAP)** | Audit-ready explanations for every alert |
| 5 | **Benford's Law** | Statistical rigor for transaction splitting |
| 6 | **LLM Document Analysis** | Automated report generation |
| 7 | **Real-time Heatmaps** | Visual competition-risk across India |
| 8 | **PU Learning** | Works without labeled fraud data |
| 9 | **Multi-technique Ensemble** | Combines 6+ techniques for robust detection |
| 10 | **Open Source** | Replicable, transparent, trustworthy |

---

## 9. REFERENCES & CITATIONS

1. Santos et al. (2025). "Detection of fraud in public procurement using data-driven methods: a systematic mapping study." EPJ Data Science.
2. Ndolo et al. (2025). "A Hybrid ML Model for Detecting Corruption in Kenya's Public Procurement." Machine Learning Reports.
3. BridgeGap Working Paper 25-01 (2025). "Fighting Corruption with AI: Suitable Public Procurement Data in the EU."
4. Sampaio et al. (2026). "PRO-Trust Pipeline for Ethical Fraud Detection in Public Procurement." Government Information Quarterly.
5. Wicaksono & Bakri (2025). "Digital Forensics: Applying Benford's Law to Indonesian Government." JRAC.
6. Falcón-Cortés et al. (2026). "Learning from sanctioned government suppliers: ML and network science." Nature Scientific Reports.
7. Xu et al. (2026). "Missingness-Aware Graph Learning for Collusion Detection in Public Procurement." IEEE Access.
8. FedGraph-AGI (2026). "Federated GNN + AGI Reasoning for Cross-Border Insider Threat Detection." arXiv.
9. Cifuentes-Perdomo et al. (2026). "Intelligent Fiscal Auditing: Network Analytics and Predictive Systems." Applied Sciences.
10. CAG India (2026). "CAG Develops AI Tool To Spot Fraud, Cartels In Government Contracts." PTI.

---

*Document Version: 2.0 | Market Research & Competitive Intelligence*  
*Last updated: September 2026*
