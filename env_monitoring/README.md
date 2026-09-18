# PRAYAS — Environmental Intelligence Network
## Smart India Hackathon (SIH) 2026 | Problem Statement 26178 | Qualcomm Inc

> **PRAYAS** (*Proactive Risk Assessment and Yielding Adaptive Solutions*) is a distributed, edge-AI-powered environmental monitoring and multi-hazard early warning network designed to protect vulnerable Indian communities from floods, forest fires, air pollution, landslides, and industrial chemical leaks.

---

## 🌟 Key Innovations & Competitive Differentiators

1. **🌊 Upstream-to-Downstream Flood Wave Tracker (Village-to-Village ETA)**:
   - Uses Manning’s open-channel hydraulic equation ($V = \frac{1}{n} R_h^{2/3} S_0^{1/2}$) and kinematic wave celerity ($c \approx \frac{5}{3}V$) over topological river graphs to calculate exact downstream arrival times (e.g. *Joshimath surge → Pipalkoti ETA: 1h 30m*).
2. **📐 Dynamic DEM Inundation Footprint Estimation**:
   - Integrates Cartosat-1 / SRTM 30m Digital Elevation Models to dynamically compute inundated surface area ($km^2$) and list impacted Gram Panchayats for each +0.5m river stage increase.
3. **🚨 Graduated Evacuation Protocol (L1–L5)**:
   - Replaces ambiguous binary evacuation calls with an automated 5-tier standard: **L1 Advisory**, **L2 Standby**, **L3 Partial Evacuation**, **L4 Full Evacuation**, and **L5 Emergency Rescue** with pre-authorized agency actions.
4. **🏛️ District Command Center Single-Screen Cockpit**:
   - High-density operational dashboard for District Collectors combining live river gauges, arrival countdowns, 3D inundation overlays, and evacuation progress.
5. **📱 Automated 30-Minute Incident Situation Reports (SITREP)**:
   - Auto-generated, standardized disaster updates dispatched via WhatsApp and SMS to administrators, emergency services, and ground personnel.
6. **⚡ Multi-Hazard Cascading Disaster Correlation**:
   - Predictive modeling of compounding events (Rainfall → Landslide → River Damming/GLOF, Wildfire Burn Scar → $3\times$ Runoff Flash Flood).
7. **🇮🇳 22 Scheduled Indian Languages**:
   - Multilingual voice calls, SMS, and app notifications via AI4Bharat Indic-Trans2 models.
8. **🔋 Extreme Offline Resilience**:
   - Operates completely offline during mobile/power blackout via 865–867 MHz LoRa mesh radio with 14+ day solar-buffered battery autonomy.

---

## 📊 Standardized Financial & Deployment Model

| Metric | Specification | Cost (INR) |
|---|---|:---:|
| **Base Node BOM** | ESP32-S3, SX1262 LoRa, BME680, PMS5003 AQI, Ultrasonic Water, Soil probe, Solar panel, LiFePO4 battery | **₹8,300** |
| **Field-Ready Assembled Node** | IP67 weatherproof enclosure, conformal coating, mounting bracket, calibrated | **₹10,000** |
| **Standard Village Pilot (1 GP)** | **6 Sensor Nodes** (₹60,000) + **1 Intelligent RPi 5 Gateway** (₹25,000) + accessories (₹3,000) | **₹88,000** |
| **District Pilot (8–10 GPs)** | **50 Nodes + 3 Gateways** covering high-risk flood/landslide corridors | **₹5.75 Lakh** |
| **Full District (100 GPs)** | **600 Nodes + 50 Gateways** protecting 5–10 lakh citizens | **₹72.5 Lakh** |

### Village Coverage Formula
- **Average Gram Panchayat Area**: 1.5 – 2.5 $km^2$.
- **Sensing Radius**: 150–250 meters per node (chemical / particulate diffusion).
- **Communication Range**: 2–3 kilometers (rural foliage) / 10–15 km (line-of-sight).
- **Standard Node Allocation**: Exactly **6 nodes per village** strategically placed across upstream entry, bridge choke point, school/shelter, low-lying hamlet, forest edge, and steep slope embankment.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       THREE-TIER EDGE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  TIER 1: SENSOR NODES (6 per village | ESP32-S3 @ 240MHz)               │
│  ├─ TFLite Micro Anomaly Detection (<60KB) + Rule Trees (<0.1ms)        │
│  ├─ Multi-Sensor: Water, Rain, AQI (PM2.5/10), BME680, Soil, Tilt       │
│  ├─ SX1262 LoRa (865–867 MHz India ISM Band)                            │
│  └─ 3.2V 3000mAh LiFePO4 + 5W Solar (14+ day autonomy)                  │
│                                                                         │
│  TIER 2: INTELLIGENT GATEWAYS (1 per village | Raspberry Pi 5 8GB)      │
│  ├─ Regional Multi-Sensor Fusion & Kinematic Flood Routing              │
│  ├─ SHAP Feature Explanations (XAI) + Flower Federated Learning         │
│  └─ 4G/LTE Cat-4 + LoRaWAN Gateway HAT + 72-Hour Offline Cache          │
│                                                                         │
│  TIER 3: DISTRICT COMMAND COCKPIT & CLOUD                               │
│  ├─ EMQX 5.0 MQTT Broker + TimescaleDB + PostGIS Spatial Engine         │
│  ├─ DEM Stepped Inundation Modeling + L1–L5 Evacuation Engine           │
│  └─ MapLibre GL JS Real-Time Cockpit + 30-Min Automated SITREP Engine   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Documentation Directory Index

| Document | Description |
|---|---|
| **[prd.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/prd.md)** | Canonical Product Requirements Document with full functional, non-functional, cost, and sizing specifications. |
| **[explain.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/explain.md)** | Non-technical executive explainer presenting the problem, solution, 6 new features, and cost justification in plain language. |
| **[ALGORITHM_DESIGN.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/ALGORITHM_DESIGN.md)** | Technical specification of AI/ML algorithms, Manning flood wave celerity formulas, DEM flood fill, L1–L5 decision engine, and quantization footprints. |
| **[AGENT4_DASHBOARD_VISUALIZATION_ALERT_SYSTEM.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/AGENT4_DASHBOARD_VISUALIZATION_ALERT_SYSTEM.md)** | UI/UX dashboard architecture, District Command Center Cockpit, GIS layers, and Automated SITREP generation formats. |
| **[COMPETITIVE_ANALYSIS.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/COMPETITIVE_ANALYSIS.md)** | Deep comparative analysis benchmarking PRAYAS against PeachBot, Vassar Labs, EarthSense, VanRakshak, IMD, and NDMA SACHET. |
| **[implementation_plan.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/implementation_plan.md)** | Phased 10-week execution roadmap, team deliverables, prototype BOM, and deployment tasks. |
| **[docs/01_district_command_and_flood_propagation.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/docs/01_district_command_and_flood_propagation.md)** | Detailed engineering reference for flood wave propagation, DEM inundation calculations, and L1–L5 evacuation workflows. |
| **[docs/03_network_architecture.md](file:///c:/Users/Vaibhav/projects/hackathon_projects/sih_2026_bs/env_monitoring/docs/03_network_architecture.md)** | Complete LPWAN protocol comparison, India 865–867 MHz frequency plan, packet formatting, and mesh topology. |

---

*PRAYAS Environmental Intelligence Network | SIH 2026*
