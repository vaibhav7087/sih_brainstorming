# PRAYAS — District Command Center, Flood Propagation & Evacuation Architecture
## Technical Specification & Operational Protocols
### SIH 2026 | Problem Statement 26178 | Qualcomm Inc

---

## 1. Executive Summary

A critical failure in contemporary Indian disaster management is the **"Upstream-to-Downstream Information Void"**: while Central Water Commission (CWC) gauges and IMD Doppler radars capture precipitation and river swell upstream, there exists no automated, real-time pipeline that converts that telemetry into:
1. **Precise Downstream Arrival Times** ("When will the surge hit Village B?").
2. **Dynamic Inundation Surface Extent** ("How many square kilometers and which Gram Panchayats will be submerged?").
3. **Structured, Graduated Evacuation Protocols** ("Who evacuates, at what threshold, and via what route?").

This document formalizes the complete hydraulic, geospatial, and operational architecture addressing these gaps within PRAYAS.

---

## 2. Flood Wave Propagation Model (Village-to-Village ETA)

### 2.1 Theoretical Formulation: Kinematic Wave Routing

PRAYAS models the downstream progression of a flood crest as an open-channel kinematic wave. In natural river channels, mean water velocity $V$ is governed by **Manning’s equation**:

$$V = \frac{1}{n} R_h^{2/3} S_0^{1/2}$$

Where:
- $n$: Gauckler–Manning roughness coefficient ($s/m^{1/3}$)
- $R_h$: Hydraulic radius ($m$), given by $R_h = \frac{A}{P} \approx y$ (water depth) for wide natural channels ($W \gg y$)
- $S_0$: Energy slope $\approx$ riverbed longitudinal slope ($\frac{\Delta z}{\Delta x}$, dimensionless)

The propagation velocity of the flood wave front (celerity $c$) is the derivative of discharge $Q$ with respect to wetted cross-section $A$:

$$c = \frac{dQ}{dA} = m \cdot V \approx \frac{5}{3} V = \frac{5}{3} \left( \frac{1}{n} y^{2/3} S_0^{1/2} \right)$$

### 2.2 Segmental Transit Time & Arrival ETA

For a river subdivided into reaches between sensor nodes $k \in \{1, 2, \dots, N\}$, with reach length $\Delta x_k$, bed slope $S_{0,k}$, roughness $n_k$, and current upstream water stage $y_k$:

$$\Delta t_k = \frac{\Delta x_k}{c_k} = \frac{\Delta x_k}{\frac{5}{3} \cdot \frac{1}{n_k} y_k^{2/3} S_{0,k}^{1/2}}$$

The arrival time at downstream settlement $j$ following an upstream surge detected at timestamp $T_{breach}$ is:

$$\text{ETA}_j = T_{breach} + \sum_{k=\text{origin}}^{j-1} \Delta t_k$$

### 2.3 Indian River Calibration Parameters

| River Reach | Typical Bed Slope $S_0$ | Manning Roughness $n$ | Base Depth $y$ (m) | Wave Speed $c$ (m/s) | Speed (km/h) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Alaknanda (Joshimath → Pipalkoti)** | 0.0220 | 0.052 | 3.5 | 4.85 | 17.5 km/h |
| **Middle Ganga (Buxar → Patna)** | 0.0001 | 0.028 | 6.0 | 1.42 | 5.1 km/h |
| **Brahmaputra (Dibrugarh Reach)** | 0.00015 | 0.034 | 8.0 | 2.15 | 7.7 km/h |
| **Western Ghats (Idukki Riverine)** | 0.0120 | 0.042 | 2.8 | 3.65 | 13.1 km/h |

---

## 3. Dynamic DEM Inundation Area Estimation

Instead of crude concentric radial circles, PRAYAS utilizes **ISRO Cartosat-1 / SRTM 30m Digital Elevation Models (DEM)** combined with river stage readings to compute real-time spatial inundation extents:

```
Step 1: Ingest River Gauge Height H_gauge(t) at Node
   │
Step 2: Interpolate Water Surface Profile along River Reaches
   │    H_water(x,y) = H_gauge - S_0 * Dist(x,y)
   │
Step 3: Elevation Difference & Inundation Mask
   │    Delta_Z(x,y) = H_water(x,y) - DEM(x,y)
   │    Mask(x,y) = 1 IF (Delta_Z > 0 AND Connected to Stream) ELSE 0
   │
Step 4: Spatial Aggregation & Village Boundary Intersect
   │    Area_km2 = Sum(Mask_cells) * 900 m² / 10^6
   │    Identify Gram Panchayats with Centroids in Flooded Mask
```

### 3.1 Water Stage vs Inundation Footprint (Example Catchment)

| Water Level Stage | Status | Inundated Area ($km^2$) | Gram Panchayats Affected | Exposed Population | Critical Infrastructure Cut |
|:---:|:---:|:---:|:---:|:---:|:---|
| **7.00 m** | Normal Baseline | 1.8 | 0 (Riparian buffer) | 0 | None |
| **7.80 m** | Warning Mark | 4.2 | 1 (Low-lying fields) | 350 | Agricultural tracks |
| **8.50 m** | Danger Mark (+0.7m) | 12.4 | 3 Gram Panchayats | 3,840 | Rural Link Road 4 |
| **9.20 m** | Severe (+1.4m) | 24.6 | 6 Gram Panchayats | 8,920 | State Highway SH-12 |
| **10.00 m**| Extreme (+2.2m) | 48.2 | 14 Gram Panchayats | 22,400 | Substation + PHC |

---

## 4. Graduated Evacuation Level Protocol (L1–L5)

To prevent disaster response paralysis or alarm fatigue, PRAYAS automates a **5-tier graduated action matrix**:

```
[ L1: ADVISORY ] ──► [ L2: STANDBY ] ──► [ L3: PARTIAL EVAC ] ──► [ L4: FULL EVAC ] ──► [ L5: RESCUE ]
  Pre-position         Vulnerable         500m River Strip        Entire Footprint       Boats + Heli
```

| Level | Code | Trigger Parameters | Who Is Moved? | Automated Inter-Agency Actions |
|:---:|:---|:---|:---|:---|
| **L1** | **ADVISORY** | Upstream rain >65mm/h; Confidence 0.30–0.50 | No civilian movement | • Pre-position relief rations & generators<br>• Place SDRF / Home Guards on 2h standby<br>• Increase sensor node telemetry rate to 30s |
| **L2** | **STANDBY** | Gauge rising >3cm/min; Downstream ETA 6–12h | Vulnerable cohort (elderly, pregnant, hospitals, disabled) | • Automated WhatsApp dispatch to ASHA & Anganwadi workers<br>• Open designated cyclone/school shelters; verify backup power<br>• Localized test beep on village sirens |
| **L3** | **PARTIAL EVACUATION**| River stage within 0.5m of Danger Level; Downstream ETA 3–6h; Inundation >5 km² | Residents within 500m river strip (Zone A) | • Dispatch state transport bus fleet to staging points<br>• Sound 3-minute pulsating siren bursts<br>• Police barricade low-lying approach roads<br>• Issue first automated 30-min SITREP |
| **L4** | **FULL EVACUATION** | Gauge breaches Danger Level; Downstream ETA <3h; Inundation >10 km² | All citizens in inundation footprint | • Continuous high-low siren activation<br>• Broadcast emergency mass SMS in regional language<br>• Mandatory relocation to designated high-ground shelters<br>• SDRF motorized boats pre-positioned at ingress points |
| **L5** | **EMERGENCY RESCUE** | River stage >1.5m above Danger Level; rapid dyke breach / GLOF | Marooned & trapped individuals | • NDRF immediate deployment authorization<br>• GPS distress pings pushed to IAF / Coast Guard helicopters<br>• Emergency airdrop coordinate generation |

---

## 5. District Command Center Cockpit (UI/UX Specification)

A single-screen operational dashboard designed for the District Collector and District Emergency Operations Center (DEOC):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🏛️ DISTRICT COMMAND COCKPIT — Chamoli District, Uttarakhand                ● LIVE | 17-Sep-2026 03:45 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  STATUS: [🔴 LEVEL L3: PARTIAL EVACUATION]   |   River Stage: 8.25m (+1.45m in 2h)   |  Confidence: 94%│
├───────────────────────────────┬──────────────────────────────────────────┬─────────────────────────────┤
│  🌊 FLOOD WAVE TIMELINE TRACK │       🗺️ DYNAMIC DEM INUNDATION MAP       │ 👥 EVACUATION OPERATIONS    │
│  (Manning kinematic routing)  │  (MapLibre GL JS + Cartosat 30m DEM)     │                             │
│                               │                                          │ Total Population: 12,800    │
│  ▶ Joshimath (Source)         │   [ Stage Slider: +1.5m ──●─── +3.0m ]   │ Evacuated: 5,420 (42.3%)    │
│    Stage: 8.25m (Breached!)   │                                          │ Target Zone: 500m River Strip│
│    Rise: +7.2 cm/min          │  Current Submerged: 14.2 km²             │                             │
│                               │  Exposed Gram Panchayats: 3              │ 🏕️ RELIEF SHELTERS:         │
│  ▼ Reach 1 (8.5 km, Slope .02)│                                          │ • GP School 1: 500/500 FULL │
│    Pipalkoti Settlement       │  ┌────────────────────────────────────┐  │ • Panchayat Bhavan: 280/600 │
│    ETA: 01h 30m ⏱️ [COUNTDOWN]│  │ 🟦 Alaknanda River Centerline       │  │ • ITI College: 120/800 FREE │
│    Impact: 1,400 residents    │  │ 🟧 Inundation Footprint (14.2 km²) │  │ Total Bed Surplus: 1,000    │
│                               │  │ 🔴 Choke Point: NH-58 Bridge Low   │  │                             │
│  ▼ Reach 2 (16.0 km, Slope.01)│  │ 🟢 Active Safe Evac Route (West)   │  │ 🚌 FLEET MOBILIZATION:      │
│    Chamoli Town Center        │  └────────────────────────────────────┘  │ • State Buses: 14/18 Active │
│    ETA: 03h 05m ⏱️ [COUNTDOWN]│                                          │ • SDRF Boats: 6 Deployed    │
│    Impact: 4,800 residents    │  Impacted Settlements:                   │ • Ambulances: 4 on Standby  │
│                               │  1. Pipalkoti Ward 1-3 (Flooded ~05:15)  │                             │
│  ▼ Reach 3 (30.2 km, Slope.01)│  2. Lower Chamoli Basti (Flooded ~06:50) │ ⚠️ ACTIVE CHOKE POINTS:     │
│    Karnaprayag Confluence     │  3. Nandaprayag Lowlands (Flooded ~09:10)│ • NH-58 km 42: Rockfall     │
│    ETA: 05h 35m ⏱️ [COUNTDOWN]│                                          │ • Pipalkoti Culvert: High   │
├───────────────────────────────┴──────────────────────────────────────────┴─────────────────────────────┤
│  TACTICAL ACTION BAR:                                                                                  │
│  [↑ Upgrade to L4 Full Evac]   [📢 Broadcast Multilingual Siren+SMS]   [📄 Generate Instant SITREP]    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Automated Situation Report (SITREP) Generation

### 6.1 Cadence & Dispatch Pipeline
- **Frequency**: Every 30 minutes automatically during active L2–L5 incidents.
- **Channels**: WhatsApp Business API, Telegram DDMA channel, Bulk SMS, Web Dashboard PDF export.
- **Multilingual Pipeline**: Translated automatically into 22 Scheduled Indian Languages via AI4Bharat Indic-Trans2.

### 6.2 Standard SITREP Format

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 PRAYAS DISASTER INCIDENT SITREP #05
📍 District: Chamoli, Uttarakhand
🕐 Generated: 17-Sep-2026 03:45 AM IST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT ESCALATION: LEVEL L3 — PARTIAL EVACUATION
Trigger: Alaknanda Sensor Gauge #04 breached 8.25m (+1.45m in 2h)

🌊 DOWNSTREAM FLOOD WAVE ARRIVAL COUNTDOWN:
• Pipalkoti (8.5 km): ETA 1h 30m (Est Arrival: 05:15 AM)
• Chamoli Town (16.0 km): ETA 3h 05m (Est Arrival: 06:50 AM)
• Karnaprayag (30.2 km): ETA 5h 35m (Est Arrival: 09:20 AM)

📐 HYDRAULIC & INUNDATION EXTENT:
• Current Submerged Area: 14.2 km² (+3.8 km² since SITREP #04)
• Impacted Gram Panchayats: Pipalkoti, Lower Chamoli, Nandaprayag
• Total Population in Inundation Footprint: 12,800 citizens

👥 EVACUATION & RELIEF STATUS:
• Total Evacuated to Date: 5,420 / 12,800 (42.3%)
• Relief Shelters Active: 3 Open (1,000 spare beds available)
• Transport: 14 state transit buses active; 6 SDRF rescue boats deployed
• Bottleneck: NH-58 mile 42 partially blocked by landslide debris

📋 MANDATED NEXT ACTIONS:
1. Complete mandatory clearance of Pipalkoti riparian strip before 05:00 AM.
2. Divert all non-essential traffic off NH-58 onto Link Road B.
3. Sound second localized siren burst in Lower Chamoli at 04:15 AM.

Next Automated SITREP #06 will be issued at 04:15 AM IST.
PRAYAS Incident Command System | District Disaster Management Authority
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 7. Multi-Hazard Cascading Disaster Intelligence

PRAYAS correlates multi-sensor feeds to detect complex cascading failure mechanisms:

1. **Monsoon Rain → Slope Slip → Debris Dam → Outburst Flash Flood (GLOF)**:
   - High rainfall (>80mm/4h) + soil saturation (>50% VWC).
   - Accelerometer detects hillside slope slippage (1–5 Hz shockwave).
   - Downstream water level drops abruptly while upstream backs up (damming signature).
   - System raises an automatic Dam Breach / GLOF Alert with 2–4h downstream lead time before natural dam failure.
2. **Wildfire Burn Scar → Soil Hydrophobicity → Runoff Multiplier**:
   - Post-fire scorched earth loses vegetative infiltration capability (runoff coefficient jumps from 0.25 to 0.75).
   - PRAYAS applies a $3\times$ runoff multiplier to subsequent monsoon rains, dropping the flood threshold by 50%.
3. **Flood Inundation → Industrial Chemical Contamination**:
   - Concurrent inundation of chemical industrial zones triggers automated pH/TDS monitoring and downwind/downstream toxic plume projection.

---

*Document Reference: PRAYAS-DOC-01 | September 2026 | SIH 2026 Problem Statement 26178*
