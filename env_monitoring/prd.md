# Product Requirements Document (PRD)
## PRAYAS — Environmental Intelligence Network
### SIH 2026 | Problem Statement 26178 | Qualcomm Inc

---

## 1. Problem Statement

India faces escalating environmental disasters — floods affecting 40 million people annually, forest fires destroying 3,000+ hectares yearly, air pollution causing 1.7 million premature deaths, and landslides displacing thousands. Current monitoring systems are centralized, cloud-dependent, and fail precisely when disasters strike (network outages, power failures). There is no automated pipeline converting upstream rainfall data into downstream village-level alerts. 66% of flood-exposed populations have no early warning coverage.

**The core problem**: India has excellent data collection (50 radars, satellites, 1,008+ weather stations) but no system to convert this data into actionable, localized, timely alerts for communities and authorities.

---

## 2. Solution Overview

**PRAYAS** (Proactive Risk Assessment and Yielding Adaptive Solutions) is a distributed, edge-AI-powered environmental monitoring network that provides real-time detection, localized intelligence, and actionable alerts for floods, forest fires, pollution events, landslides, and industrial hazards.

### Key Differentiators (What Makes Us Win)

| Feature | Existing Systems | PRAYAS |
|---------|-----------------|--------|
| Multi-hazard coverage | Single-hazard focus | 5 hazards unified (Flood, Fire, AQI, Landslide, Industrial) |
| Upstream-to-Downstream Pipeline | Non-existent; siloed telemetry | Automated Flood Wave Propagation ETA (Manning's Equation) |
| Spatial Extent Forecasting | Static buffer circles | Dynamic DEM Inundation Mapping (SRTM 30m stepped fill) |
| Evacuation Management | Binary / vague advisories | Graduated L1–L5 Action Protocol with auto agency triggers |
| District Decision Support | Disjointed spreadsheets / calls | District Command Center 1-Screen Cockpit + Auto SITREPs |
| Data processing | Cloud-dependent | Edge-first, offline-capable via LoRa mesh |
| Model training | Centralized data | Federated learning at Tier 2 Gateways (privacy-preserving) |
| Decision transparency | Black-box | Real-time XAI explanations (SHAP at Tier 2, Rule Trees at Tier 1) |
| Data integrity | Trust-based | Blockchain-verified provenance (IOTA Tangle) |
| Regional adaptation | Retrain from scratch | Transfer learning across ecological zones |
| Language support | English / Hindi only | 22 Scheduled Indian Languages (AI4Bharat / Bhashini) |

---

## 3. Target Users & User Stories

### Primary Users
1. **District Disaster Management Authority (DDMA / District Collector)** — Situational awareness, alert authorization, L1–L5 evacuation coordination, resource mobilization.
2. **State Disaster Response Force (SDRF) / NDRF** — Tactical deployment planning, boat/rescue dispatch, staging area allocation.
3. **Village Revenue Officers (Patwari / Gram Sevak)** — Ground-level alert verification, shelter operations, local siren activation.

### Secondary Users
4. **Citizens in hazard-prone areas** — Hyperlocal multilingual SMS/app notifications, evacuation route guidance.
5. **Industrial Safety Officers** — Fenceline emissions monitoring, toxic gas threshold alerts.
6. **Forest Department Officials** — Wildfire ignition alerts, smoke plume tracking, patrol routing.
7. **Pollution Control Boards (CPCB/SPCB)** — Air/water quality compliance monitoring, tamper-proof evidentiary logs.

### User Stories
- **As a District Collector**, when upstream sensors detect cloudburst rainfall (>100mm/hr), I want an automated flood propagation timeline showing arrival ETAs for downstream villages (e.g., Joshimath → Pipalkoti: 1h 45m) and inundation area estimates, so that I can declare an L3 Partial Evacuation before water reaches settlements.
- **As a Village Gram Sevak**, when local river levels breach the warning mark during power/cellular blackout, I want the node's local LoRa radio to trigger the village siren and send offline SMS advisories in the local regional language, so that residents can move to the designated cyclone/flood shelter.
- **As an SDRF Incident Commander**, I want auto-generated 30-minute SITREPs (Situation Reports) pushed to my mobile terminal detailing evacuated population percentage, shelter bed occupancy, and blocked bridge choke points, so that rescue teams are directed to high-risk zones without communication friction.

---

## 4. Functional Requirements

### 4.1 Distributed Smart Sensor Nodes (Tier 1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Water level monitoring (ultrasonic JSN-SR04T / radar, ±1cm accuracy) | P0 |
| FR-02 | Rainfall measurement (optical/tipping bucket, 0–500 mm/hr) | P0 |
| FR-03 | Temperature, humidity, pressure (BME680, ±0.1°C, ±1%RH, ±0.12hPa) | P0 |
| FR-04 | Air quality PM2.5/PM10 (laser scattering PMS5003, 0–500 μg/m³) | P0 |
| FR-05 | Gas leakage detection (MQ-135 NH3/CO2 + MQ-2 flammable gas) | P1 |
| FR-06 | Soil moisture (capacitive TEROS 10, 0–100% VWC) | P0 |
| FR-07 | Vibration/tilt monitoring (LIS3DH triple-axis accelerometer for slope slippage) | P1 |
| FR-08 | Solar-powered with LiFePO4 battery (3.2V 3000mAh, 14+ day autonomy without sun) | P0 |
| FR-09 | IP67 rated weatherproof enclosure, -20°C to 60°C operating range | P0 |
| FR-10 | LoRaWAN 865–867 MHz radio transmission with Class A/C operational modes | P0 |

### 4.2 On-Device AI Analytics & Early Warning

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | Real-time anomaly detection at edge (<1ms latency on ESP32-S3) | P0 |
| FR-12 | Flood risk identification (water level rise rate + rainfall + soil moisture saturation) | P0 |
| FR-13 | Forest fire detection (temperature spike + humidity plummet + CO/smoke correlation) | P0 |
| FR-14 | Continuous Indian CPCB AQI calculation & abrupt pollution shift detection | P0 |
| FR-15 | Landslide precursor detection (accelerometer micro-vibrations + cumulative antecedent rain) | P1 |
| FR-16 | Standardized 4-tier alert severity (Emergency ≥0.85, Warning ≥0.60, Watch ≥0.30, Info 0.0–0.30) | P0 |
| FR-17 | Multi-sensor cross-confirmation (minimum 2 confirming telemetry channels for high confidence) | P0 |
| FR-18 | Zero-connectivity offline operation with 72-hour on-node circular data buffer | P0 |

### 4.3 Flood Wave Propagation & Spatial Intelligence (New High-Impact Modules)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-48 | **Flood Wave Propagation Timeline**: Automated village-to-village flood wave arrival ETA using Manning’s equation on topological river graph ($V = \frac{1}{n} R^{2/3} S^{1/2}$, $c \approx \frac{5}{3}V$) | P0 |
| FR-49 | **Dynamic Inundation Area Estimation**: Stepped flood-fill modeling based on SRTM 30m DEM elevation grid, calculating inundated km² and intersecting village exposure for each +0.5m water rise | P0 |
| FR-50 | **Graduated Evacuation Management (L1–L5)**: Structured evacuation framework (L1 Advisory, L2 Standby, L3 Partial Evacuation, L4 Full Evacuation, L5 Emergency Rescue) with automated agency triggers | P0 |
| FR-51 | **District Command Center View**: Unified 1-screen disaster cockpit integrating live river telemetry, propagation ETAs, inundation forecast, and evacuation progress | P0 |
| FR-52 | **Multi-Hazard Cascade Correlation**: Predictive chaining of cascading events (Rainfall → Landslide → River Damming/GLOF, Wildfire Burn Scar → Hydrophobic Flash Flood) | P1 |
| FR-53 | **Automated Situation Report (SITREP) Engine**: Auto-generating standardized incident updates every 30 mins during active hazards for DDMA/WhatsApp/SMS dispatch | P1 |

### 4.4 Regional Risk Mapping & Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-27 | Geospatial visualization with interactive GIS maps using MapLibre GL JS | P0 |
| FR-28 | Dynamic risk heatmap overlays & telemetry trend graphing | P0 |
| FR-29 | Population exposure & demographic vulnerability analytics | P1 |
| FR-30 | Dynamic evacuation route planning with road flood-depth & bridge constraints | P1 |
| FR-31 | Shelter capacity tracking & real-time bed availability monitoring | P1 |

### 4.5 Community & Authority Notification

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-32 | SMS alerts via bulk CDAC / Telecom gateway for zero-app rural reach | P0 |
| FR-33 | WhatsApp Bot integration for interactive situation queries and citizen geotagged reports | P1 |
| FR-34 | Multilingual notification generation across 22 Scheduled Indian Languages via AI4Bharat | P0 |
| FR-35 | Village audio siren relay & outdoor LED display board triggering over LoRa | P1 |
| FR-36 | Mobile App (Flutter cross-platform) with offline cached safety protocols | P1 |

### 4.6 Advanced Intelligence & Governance

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-37 | Federated Learning (Flower) at Tier 2 Gateways for distributed model fine-tuning | P1 |
| FR-38 | Explainable AI (SHAP at Tier 2/3, Decision-Tree Rules at Tier 1) | P1 |
| FR-39 | Tamper-proof telemetry and alert hashing via IOTA Tangle DAG | P2 |
| FR-40 | Digital Twin 3D flood simulation via CesiumJS | P2 |

---

## 5. Node Coverage & Deployment Sizing Formulas

### 5.1 Sensing vs. Communication Radius

| Metric | Radius / Range | Physical Basis |
|---|---|---|
| **Air Quality & Gas Diffusion Radius** | **150–250 m** | Atmospheric dispersion of particulates & gases in open terrain |
| **Water Level & Stream Sensing** | **Point source** (bridges, riverbanks, nullahs) | Ultrasonic / radar gauge perpendicular to water surface |
| **Soil & Landslide Sensing** | **50–100 m** slope radius | Terrestrial geophone / capacitive soil moisture probes |
| **LoRa Communication Range (Node → Gateway)** | **2–3 km** (dense rural foliage) / **10–15 km** (line-of-sight elevated) | 865–867 MHz India ISM Band at SF9–SF12 |

### 5.2 Standard Village Sizing Model
- **Average Indian Gram Panchayat Area**: 1.5 to 2.5 km² (typical population 1,500–3,500).
- **Standard Allocation**: **6 Sensor Nodes per Village**
  - **Node 1**: Upstream river entry point / primary nullah (Water level + Rain gauge + Soil moisture)
  - **Node 2**: Downstream bridge / critical drainage choke point (Water level)
  - **Node 3**: Gram Panchayat Bhavan / Primary School / Relief Shelter (BME680 Weather + PMS5003 AQI)
  - **Node 4**: Low-lying residential cluster / agricultural boundary (Soil moisture + Gas)
  - **Node 5**: Forest boundary / scrubland perimeter (Smoke + Temperature rate-of-rise)
  - **Node 6**: Steep slope / embankment zone (Accelerometer vibration + Soil saturation)
- **1 Intelligent Gateway (Raspberry Pi 5 + LoRa Concentrator)**: Centrally mounted on Gram Panchayat rooftop or cellular tower, providing 100% radio coverage across the entire 2.0 km² village perimeter.

---

## 6. System Architecture & Tiered Execution

### 6.1 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       THREE-TIER EDGE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  TIER 1: MICRO SENSOR NODES (6 per village | 600 per district)          │
│  ├─ MCU: ESP32-S3-WROOM-1 (N16R8) + Dual-Core 240MHz + 512KB SRAM       │
│  ├─ Radio: SX1262 LoRa (865–867 MHz India ISM Band)                     │
│  ├─ Power: 3.2V 3000mAh LiFePO4 Battery + 5W Solar Panel (CN3722 MPPT)  │
│  ├─ Intelligence: Transparent Rule Trees + TFLite Micro Anomaly (<60KB) │
│  ├─ Enclosure: IP67 Weatherproof Polycarbonate with M12 Connectors      │
│  └─ Cost: ₹8,300 Base BOM | ₹10,000 Fully Cased & Assembled             │
│                                                                         │
│  TIER 2: INTELLIGENT GATEWAYS (1 per village | 50-100 per district)     │
│  ├─ Compute: Raspberry Pi 5 (8GB RAM) + LoRa Concentrator HAT           │
│  ├─ Radio: LoRa Gateway + 4G/LTE Cat-4 Dongle + Ethernet + WiFi Mesh    │
│  ├─ Intelligence: Regional Fusion Engine, Manning Wave ETA, SHAP XAI,   │
│  │   Flower Federated Learning Client, 72-Hour Local SQLite Cache       │
│  └─ Cost: ₹25,000 per Gateway setup                                     │
│                                                                         │
│  TIER 3: DISTRICT COMMAND CENTER & CLOUD (1 per district / State Cloud) │
│  ├─ Cloud / Local Server: EMQX MQTT Broker + TimescaleDB + PostGIS      │
│  ├─ Intelligence: Dynamic DEM Inundation Fill, L1–L5 Evacuation Engine, │
│  │   Multi-Hazard Cascade Predictor, AI4Bharat 22-Language Generator    │
│  └─ Dashboard: Next.js + MapLibre GL JS Real-Time Incident Cockpit      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Partitioning of Advanced AI / ML Capabilities

> [!IMPORTANT]
> **Edge vs Gateway Realities**:
> - **SHAP Explanations**: Run exclusively at **Tier 2 (Gateway)** and **Tier 3 (Cloud)**. ESP32-S3 does not have the Python runtime or RAM for KernelSHAP/TreeSHAP; edge nodes provide exact feature contribution vectors from deterministic rule evaluation.
> - **Federated Learning (Flower)**: Runs at **Tier 2 (Gateway RPi 5)**. Gateways aggregate local node telemetry, compute local gradient updates on temporal GRU models, and synchronize model weights with the District/State Hub.

---

## 7. Decision Framework: Alert & Evacuation Protocols

### 7.1 Multi-Hazard Detection Alert Levels

| Alert Level | Confidence Score | Detection Criteria | Notification Channel | Auto Action |
|:---:|:---:|:---|:---|:---|
| **INFO** | 0.00 – 0.29 | Baseline fluctuations within 1.5$\sigma$ | Logged to database | Routine telemetry cycle |
| **WATCH** | 0.30 – 0.59 | Sustained rise in single parameter > warning threshold | Dashboard badge update | Increase sampling to 10s |
| **WARNING** | 0.60 – 0.84 | Multi-sensor correlation confirmed (e.g. rain + water rise) | DDMA Dashboard + SMS to Patwari | Pre-activate emergency ops |
| **EMERGENCY**| 0.85 – 1.00 | Danger mark breached OR flash flood signature confirmed | Mass SMS + LoRa Siren + Push | Trigger L3/L4 Evacuation |

### 7.2 Operational Graduated Evacuation Protocol (L1–L5)

| Level | Designation | Hazard Trigger Condition | Affected Cohort | Automated System Action |
|:---:|:---|:---|:---|:---|
| **L1** | **Advisory** | High rainfall predicted upstream; Confidence 0.30–0.50 | None (monitoring) | Pre-position emergency food/medical supplies; notify NDRF standby |
| **L2** | **Standby** | Upstream surge confirmed; Downstream arrival ETA 6–12h | Vulnerable citizens (elderly, pregnant, hospitals, schools) | SMS alert to ASHA workers; prepare village school shelters; test sirens |
| **L3** | **Partial Evacuation** | River rising >5cm/min; Downstream ETA 3–6h; Inundation est. <10 km² | Low-lying riparian zones (<500m from bank) | Dispatch state transit buses; evacuate Zone A; sound periodic siren |
| **L4** | **Full Evacuation** | Water breaching Danger Level; ETA <3h; Inundation est. >10 km² | Entire flood-plain village population | Continuous siren; block road access into zone; mobilize SDRF boats |
| **L5** | **Emergency Rescue** | Unprecedented breach / embankment failure; active inundation | Trapped / marooned individuals | NDRF helicopter deployment, satellite distress pinging, life raft rescue |

---

## 8. Cost Model & Scalability

### 8.1 Per-Node BOM Cost Breakdown

| Component | Specification | Unit Cost (INR) |
|---|---|:---:|
| Core MCU Board | ESP32-S3-WROOM-1 (N16R8, 16MB Flash, 8MB PSRAM) | ₹750 |
| Long-Range Radio | SX1262 LoRa Transceiver (865–867 MHz India ISM) + SMA Antenna | ₹600 |
| Environmental Sensor | BME680 (Temperature, Humidity, Pressure, Gas Resistance) | ₹450 |
| Particulate Sensor | PMS5003 Optical Laser Dust Sensor (PM1.0, PM2.5, PM10) | ₹2,200 |
| Water Level Sensor | JSN-SR04T Sealed Waterproof Ultrasonic Sensor (20–600cm) | ₹800 |
| Soil & Seismic Sensors | Capacitive Soil Moisture Probe (v1.2) + LIS3DH Accelerometer | ₹450 |
| Hazardous Gas Sensors | MQ-135 + MQ-2 Calibrated Analog Sensor Modules | ₹250 |
| Solar Power Harvest | 5W 6V Monocrystalline Panel + CN3722 MPPT Solar Charger | ₹1,100 |
| Energy Storage | 3.2V 3000mAh LiFePO4 Cell (2000+ cycles, flame-safe) | ₹650 |
| Waterproof Housing | IP67 UV-Resistant Polycarbonate Box (150×100×70mm) + M12 glands | ₹600 |
| Carrier PCB & Passives | 2-layer custom PCB, TVS surge diodes, buck regulator | ₹450 |
| **Total Base BOM** | Raw component procurement | **₹8,300** |
| Assembly & Calibration | Mounting hardware bracket, conformal coating, testing | **₹1,700** |
| **Total Assembled Node**| **Fully finished, field-ready sensor unit** | **₹10,000** |

### 8.2 Deployment Scale Economics

| Deployment Scale | Nodes | Gateways | Hardware Capex | Annual Ops (10%) | Target Population Protected | Cost / Person / Year |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Village Pilot (1 GP)** | 6 | 1 | **₹88,000** | ₹8,800 | 2,500 | ₹3.52 |
| **Multi-Village Cluster (10 GPs)** | 60 | 10 | **₹8.8 Lakh** | ₹88,000 | 25,000 | ₹3.52 |
| **District Pilot (8–10 High-Risk GPs)**| 50 | 3 | **₹5.75 Lakh** | ₹57,500 | 25,000 | ₹2.30 |
| **Full District (100 GPs)** | 600 | 50 | **₹72.5 Lakh** | ₹7.25 Lakh | 5,00,000 – 10,00,000 | ₹0.72 – ₹1.45 |
| **State Level (10 Flood Districts)** | 6,000 | 500 | **₹7.25 Crore**| ₹72.5 Lakh | 75,00,000 | ₹0.96 |
| **National Scale (150 Vulnerable Dists)**| 90,000 | 7,500 | **₹108 Crore** | ₹10.8 Crore | 10+ Crore | **₹1.08 / person** |

*Note: Village Pilot Capex = 6 nodes @ ₹10,000 (₹60,000) + 1 RPi 5 Gateway @ ₹25,000 + ₹3,000 mounting pole accessories = **₹88,000**.*

### 8.3 Return on Investment (ROI) & Socio-Economic Impact
- **Disaster Loss Reduction**: Floods cost India ₹30,000–₹50,000 Crore annually in crop, livestock, and infrastructure destruction. Deploying PRAYAS at national scale (₹108 Crore capex) yields an estimated **Benefit-Cost Ratio (BCR) of 55:1 to 82:1**.
- **Lives Saved**: An estimated 5,000–10,000 direct lives saved annually from flash floods and landslides through >2-hour advance village warnings, with up to 50,000+ quality-adjusted life years preserved via chronic toxic exposure mitigation.

---

## 9. Assumptions, Constraints & Out of Scope

### 9.1 Assumptions
1. Gram Panchayat buildings or mobile tower structures will provide line-of-sight elevation for gateway mounting.
2. Sunlight availability of at least 3 hours every 7 days (sufficient for MPPT recharge of 3000mAh LiFePO4 battery).
3. Free public access to SRTM 30m / Cartosat-1 DEM elevation models and OpenStreetMap river geometries.

### 9.2 Technical Constraints
1. **LoRa Duty Cycle**: Must strictly respect India WPC regulations (865–867 MHz band, <1% duty cycle, max 14 dBm ERP).
2. **Payload Size**: Sensor payload compressed into 12-byte binary frames to maintain SF9 packet airtime under 70ms.
3. **Bandwidth Limitations**: Video surveillance or LiDAR point clouds are not transmitted over LoRa; only extracted parametric numerical features.

### 9.3 Out of Scope (V1.0)
- Deep subterranean seismic monitoring (earthquake hypocenter detection is handled by National Seismological Network).
- Autonomous drone fleet dispatch (V2.5 roadmap item).
- Individual structural health monitoring of skyscrapers/bridges (outside environmental hazard perimeter).

---

## 10. Regulatory & Standards Compliance
- **Telecommunications**: WPC (Wireless Planning & Coordination) license-exempt compliance for 865–867 MHz.
- **Environmental Guidelines**: Central Water Commission (CWC) river level danger marking standards; Central Pollution Control Board (CPCB) NAAQS 2009 standards for AQI calculation.
- **Data Protection**: Digital Personal Data Protection (DPDP) Act 2023 compliance — zero PII collected on edge nodes; localized Indian cloud data residency.
- **Alert Protocols**: ITU-T X.1303 Common Alerting Protocol (CAP) v1.2 compliance for automated inter-operability with NDMA SACHET.

---

*Document Version: 2.0 (Harmonized Architecture & Advanced Modules) | SIH 2026 | PRAYAS Team*
