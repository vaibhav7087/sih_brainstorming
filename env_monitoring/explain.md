# PRAYAS — Explained in Plain Language
## Environmental Intelligence & Early Warning Network for India
### SIH 2026 | Problem Statement 26178

---

## What Is the Problem?

Every monsoon and summer, India faces devastating environmental disasters:
- **Flash Floods** in Uttarakhand, Assam, Bihar, and Kerala sweep away entire villages.
- **Forest Fires** in Himachal, Uttarakhand, and Odisha burn thousands of hectares.
- **Toxic Smog & Air Pollution** across North India causes 1.7 million premature deaths each year.
- **Landslides** in hilly regions cut off roads and bury settlements.

### Why Do People Still Die?
India actually has some of the world's best satellites (ISRO) and weather radars (IMD). But when disaster strikes:
1. **The information gets trapped at the top.** State headquarters might know a cloudburst happened upstream, but that message takes 2–4 hours to travel down government hierarchies. By then, the water has already hit the village.
2. **Power and mobile towers fail during disasters.** As soon as heavy rain or winds start, cell towers lose power and fiber cables snap. Cloud-based apps stop working precisely when lives are on the line.
3. **Systems are single-purpose silos.** Flood sensors don't talk to fire sensors, and fire sensors don't know about rain or landslides.
4. **Alerts are vague and terrifying.** Instead of telling people *how much time they have* or *where to walk*, sirens blare with no clear instructions, or an English SMS arrives that rural elders cannot read.

---

## What Is PRAYAS?

**PRAYAS** (Proactive Risk Assessment and Yielding Adaptive Solutions) is a network of small, solar-powered, intelligent sensor boxes mounted in villages, along riverbanks, in forests, and near industrial areas.

Think of it like an **autonomous immune system for the district**:
- Each box has its own **micro-AI brain** (ESP32-S3). It doesn't need the internet or 4G to detect danger.
- The boxes talk to each other using **LoRa radio waves** (which travel 2–15 kilometers through fog, rain, and trees without cellular towers).
- When a box upstream detects rising water or smoke, it alerts downstream villages **in less than 1 second** and calculates **exactly when the flood will arrive, what area will drown, and what level of evacuation is required**.

---

## The 6 Game-Changing Features (What We Added)

### 1. 🌊 The Flood Wave Arrival Clock (Village-to-Village ETA)
*Judges will ask: "If your sensor upstream detects water, how does the next village know when it arrives?"*

We built an automated **water speed calculator** using hydraulic science (Manning's equation):
- A sensor at **Village A (Joshimath)** detects a sudden river surge of 8cm/minute.
- The system checks the river slope and riverbed roughness from topographic maps.
- It calculates water velocity and instantly puts an exact timer on the district dashboard and sends it to downstream villages:
  - **Village B (Pipalkoti - 8 km away)**: *"Flood arrival in 1 hour 45 minutes."*
  - **Village C (Chamoli Town - 16 km away)**: *"Flood arrival in 3 hours 20 minutes."*
  - **Village D (Karnaprayag - 30 km away)**: *"Flood arrival in 5 hours 50 minutes."*

People don't panic. They look at the clock and evacuate with their cattle and belongings calmly.

---

### 2. 📐 "How Much Land Will Drown?" (Dynamic Inundation Area)
*Judges will ask: "Does your system know which houses are actually in danger?"*

Yes. PRAYAS combines real-time water level sensor data with open-source Indian elevation maps (ISRO Cartosat / SRTM 30m Digital Elevation Models):
- For every 50 cm rise in river level, the system simulates where water will spill out:
  - **At 8.0 meters** (Warning mark): **4 km²** flooded — only open farmland submerged.
  - **At 8.5 meters**: **12 km²** flooded — 3 villages in danger (Zone A).
  - **At 9.2 meters** (Danger mark breached): **28 km²** flooded — 7 villages submerged.
- Authorities know **exact village names, road blockages, and high-ground shelters** before the first droplet touches the street.

---

### 3. 🚨 The 5-Level Evacuation Protocol (L1 to L5)
Instead of shouting "evacuate everyone" (which causes stampedes and is ignored when it's a false alarm), PRAYAS follows a military-grade graduated protocol:

| Level | Designation | When It Triggers | Who Moves? | What Happens Automatically? |
|:---:|:---|:---|:---|:---|
| **L1** | **Advisory** | Upstream cloudburst detected; flood confidence 35% | Nobody | Relief supplies pre-positioned; NDRF alerted on standby. |
| **L2** | **Standby** | Surge confirmed; Downstream arrival ETA 6–12 hours | Vulnerable people (pregnant women, elderly, hospital patients) | ASHA workers get WhatsApp lists; school shelters opened with food & beds. |
| **L3** | **Partial Evacuation** | River rising rapidly; Downstream arrival ETA 3–6 hours | Residents living within 500 meters of riverbank | State transport buses dispatched; siren sounds short bursts; low-lying houses evacuated. |
| **L4** | **Full Evacuation** | River breaches danger mark; arrival ETA <3 hours | All residents in the flood footprint | Continuous siren; police barricade flood roads; complete village moved to high ground. |
| **L5** | **Emergency Rescue** | Dam breach / catastrophic flash flood; water in homes | Trapped & marooned citizens | NDRF boats dispatched; GPS distress coordinates sent to rescue helicopters. |

---

### 4. 🏛️ District Command Center Single-Screen Cockpit
The District Collector doesn't want to click through 10 menus during a midnight crisis. The PRAYAS District Dashboard provides a single real-time screen:
- **Left Panel**: Upstream river sensors & Flood Wave Arrival Countdown.
- **Center Panel**: Live 3D elevation map showing water spilling into specific streets in red and blue.
- **Right Panel**: Evacuation Progress (e.g., *"Pipalkoti: 4,200 of 6,100 citizens evacuated (68%) | Shelter 2 has 400 empty beds left"*).

---

### 5. ⚡ Chain-Reaction Hazard Detection (Cascading Disasters)
Real disasters don't happen one at a time:
- **Rain → Landslide → Lake Burst**: Heavy rain saturates a hillside → landslide crashes into a valley → debris dams the river creating an artificial lake → 3 hours later the natural dam bursts (GLOF), sending a deadly 10-meter wave downstream.
- PRAYAS detects this exact pattern: when rainfall is high, an accelerometer detects hillside slide, and a downstream water sensor suddenly drops (water blocked), the AI recognizes a **river damming event** and alerts downstream towns hours before the breach.
- **Forest Fire → Monsoon Flash Flood**: Burned soil turns into hydrophobic ceramic that cannot absorb water. When rain hits burned slopes weeks later, flash flood risk triples. PRAYAS automatically adjusts soil absorption factors.

---

### 6. 📱 Auto-Generated 30-Minute SITREPs (Situation Reports)
Every 30 minutes during an active disaster, PRAYAS auto-generates a clean, military-style Situation Report formatted for WhatsApp and SMS:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 PRAYAS SITUATION REPORT (SITREP) #04
📍 District: Chamoli, Uttarakhand | 03:30 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATUS: LEVEL L3 — PARTIAL EVACUATION
Trigger: Alaknanda Gauge breached 8.2m (+1.4m in 2 hours)

🌊 FLOOD WAVE TIMELINE:
• Joshimath (Source): Breached Danger Mark
• Pipalkoti: ETA 1h 45m (ARRIVING ~05:15 AM)
• Chamoli Town: ETA 3h 20m (ARRIVING ~06:50 AM)

📐 INUNDATION FORECAST:
• Extent: 14.2 km² submerged | 3 Gram Panchayats impacted

👥 EVACUATION PROGRESS:
• Evacuated: 3,840 / 7,200 residents (53%)
• Relief Camps: School #1 (Full), Panchayat Bhavan (240 beds free)
• Choke Point: NH-58 bridge water level clearance only 0.8m

NEXT SITREP IN 30 MINUTES (04:00 AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## How Many Boxes in a Village?

An average Indian Gram Panchayat covers **1.5 to 2.5 square kilometers**.
- Each sensor node has an environmental sensing radius of **150–250 meters**.
- Its LoRa radio can transmit **2 to 3 kilometers** across rural terrain.
- **Therefore, exactly 6 sensor boxes protect 1 complete village:**
  1. **Node 1 (Upstream River Entry)**: Ultrasonic water level + rain gauge.
  2. **Node 2 (Downstream Bridge)**: River gauge at choke point.
  3. **Node 3 (Gram Panchayat / School)**: Air quality (PM2.5/PM10) + weather station + siren relay.
  4. **Node 4 (Low-Lying Residential Hamlet)**: Soil saturation + flood warning.
  5. **Node 5 (Forest / Scrub Edge)**: Optical smoke + temperature spike detector.
  6. **Node 6 (Steep Slope / Embankment)**: Accelerometer vibration for landslides.
- **1 Central Gateway (Raspberry Pi 5)** on the Panchayat Bhavan rooftop gathers data from all 6 nodes and connects to the district headquarters.

---

## Clear & Honest Cost Numbers

| Item | What It Includes | Cost (INR) |
|---|---|:---:|
| **Raw Components (BOM)** | ESP32-S3, LoRa SX1262, PMS5003 AQI, ultrasonic water sensor, BME680, soil probe, solar panel, LiFePO4 battery | **₹8,300** |
| **Fully Assembled Node** | IP67 weatherproof box, conformal moisture coating, steel pole mount, calibrated & tested | **₹10,000** |
| **1 Village Deployment (GP)** | **6 Sensor Nodes** (₹60,000) + **1 Intelligent Gateway RPi 5** (₹25,000) + installation accessories (₹3,000) | **₹88,000** |
| **District Pilot (8–10 Villages)** | **50 Nodes + 3 Gateways** across high-risk flood/landslide corridors | **₹5.75 Lakh** |
| **Full District (100 Villages)** | **600 Nodes + 50 Gateways** protecting 5–10 lakh citizens | **₹72.5 Lakh** |

**Comparison**: A single government Continuous Ambient Air Quality Station (CAAQMS) costs **₹50 to ₹80 Lakh** and only measures air in one spot. For that same price, PRAYAS covers an entire district against floods, fires, landslides, and air pollution.

---

## Why PRAYAS Wins at SIH 2026

1. **True Offline Resilience**: When floodwaters rip down cell towers, our LoRa radio network keeps chirping, sounding village sirens, and calculating arrival times.
2. **Speaks 22 Indian Languages**: Using AI4Bharat models, warning voice calls and SMS are sent in Punjabi, Bengali, Assamese, Odia, Hindi, Tamil, Telugu, and more.
3. **Solves the "Missing Pipeline"**: Every competitor shows dots on a map. PRAYAS is the only system that tells the District Collector: *"Water will reach the next village in 1 hour 45 minutes; evacuate Level 3 now."*
4. **Huge Return on Investment**: India loses ₹30,000+ Crore to floods annually. Deploying PRAYAS nationwide costs ₹108 Crore — delivering an extraordinary **55:1 to 82:1 Benefit-Cost Ratio**.

---
*Document Version: 2.0 | September 2026 | PRAYAS Project*
