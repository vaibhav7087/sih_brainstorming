# Agent 2: Multi-Hazard Detection Algorithms & AI Models
## SIH 2026 — Problem Statement 26178

---

## 1. Executive Summary

This document specifies the complete AI/ML algorithm stack for detecting floods, forest fires, pollution events, landslides, and industrial hazards across India's environmental monitoring network. The architecture uses a **hybrid threshold + ML** approach optimized for **edge deployment** on resource-constrained IoT devices.

---

## 2. System-Wide Design Principles

### 2.1 Hybrid Detection Pipeline
```
Raw Sensor Data
    ↓
[Stage 1: Threshold Filter] ──→ Immediate Alerts (< 100ms latency)
    ↓
[Stage 2: ML Inference] ──→ Contextual Detection (< 5s latency)
    ↓
[Stage 3: Fusion Engine] ──→ Multi-hazard Correlation (< 30s latency)
    ↓
[Stage 4: Prediction] ──→ Early Warning (< 5min horizon)
```

### 2.2 Model Deployment Tiers

| Tier | Target | Model Size | Inference Time | Examples |
|------|--------|------------|----------------|----------|
| T1 — Edge | ESP32/RPi | < 500KB | < 100ms | Threshold rules, quantized TFLite |
| T2 — Gateway | Edge server (ARM/x86) | < 50MB | < 2s | Lightweight CNNs, GRUs |
| T3 — Cloud | GPU cluster | Unlimited | < 30s | Full ensembles, forecasting |

### 2.3 Confidence Scoring Framework
All alerts carry a confidence score ∈ [0, 1]:

| Score Range | Alert Level | Action | Notification Channels |
|:---:|:---:|:---|:---|
| 0.00 — 0.29 | INFO | Routine telemetry logging; baseline tracking | Database log only |
| 0.30 — 0.59 | WATCH | Elevated parameter; increase node sampling to 10s | Operator dashboard badge |
| 0.60 — 0.84 | WARNING | Multi-sensor confirmed anomaly | DDMA Dashboard + SMS to Patwari |
| 0.85 — 1.00 | EMERGENCY | Severe danger threshold breached | Instant Siren + Mass SMS + Push |

---

## 3. Flood Detection Algorithms

### 3.1 Sensor Inputs

| Sensor | Metric | Sampling Rate | Unit |
|--------|--------|---------------|------|
| Water level gauge | Height | 1 Hz | cm |
| Rain gauge (tipping bucket) | Accumulation | 0.1 Hz (10s avg) | mm/hr |
| Soil moisture probe | Volumetric water content | 0.017 Hz (1min) | % |
| River flow meter | Discharge | 0.1 Hz | m³/s |
| Weather station | Wind speed, barometric pressure | 0.1 Hz | m/s, hPa |

### 3.2 Threshold-Based Detection (T1 Edge)

```python
# Flood Threshold Configuration
FLOOD_THRESHOLDS = {
    "water_level_rise_rate": {
        "warning": 2.0,      # cm/min
        "critical": 5.0,     # cm/min
        "flash_flood": 10.0  # cm/min
    },
    "rainfall_intensity": {
        "heavy": 64.5,       # mm/hr (IMD classification)
        "very_heavy": 124.5, # mm/hr
        "exceptional": 244.5 # mm/hr
    },
    "water_level_absolute": {
        "danger_mark": 0,    # Relative to danger mark (cm)
        "severe": 100        # cm above danger mark
    },
    "soil_moisture": {
        "saturated": 45.0,   # % VWC — field-specific
        "critical": 55.0     # % VWC
    }
}

# Flash Flood Signature: rapid rise + high rainfall + saturated soil
def flash_flood_check(water_rise_rate, rainfall, soil_moisture):
    score = 0.0
    if water_rise_rate > FLOOD_THRESHOLDS["water_level_rise_rate"]["flash_flood"]:
        score += 0.5
    elif water_rise_rate > FLOOD_THRESHOLDS["water_level_rise_rate"]["critical"]:
        score += 0.3
    if rainfall > FLOOD_THRESHOLDS["rainfall_intensity"]["very_heavy"]:
        score += 0.3
    elif rainfall > FLOOD_THRESHOLDS["rainfall_intensity"]["heavy"]:
        score += 0.15
    if soil_moisture > FLOOD_THRESHOLDS["soil_moisture"]["critical"]:
        score += 0.2
    elif soil_moisture > FLOOD_THRESHOLDS["soil_moisture"]["saturated"]:
        score += 0.1
    return min(score, 1.0)
```

### 3.3 Time-Series Prediction Model (T2/T3)

**Architecture: Dual-Branch Temporal Fusion Network**

```
Branch A (Water Level):
  Input: water_level[t-60:t]  (60 steps, 1Hz = 60 values)
  → Conv1D(32, kernel=5) → BatchNorm → ReLU
  → Conv1D(64, kernel=5) → BatchNorm → ReLU
  → GRU(128, return_sequences=True)
  → GRU(64)

Branch B (Rainfall + Soil):
  Input: concat(rainfall[t-60:t], soil_moisture[t-60:t])
  → Conv1D(16, kernel=5) → BatchNorm → ReLU
  → GRU(64, return_sequences=True)
  → GRU(32)

Fusion:
  Concat(branch_a, branch_b) → Dense(64, ReLU) → Dropout(0.3)
  → Dense(32, ReLU)
  → Dense(3)  # [no_flood, flood_in_1h, flood_in_3h]
  → Softmax
```

**Training Strategy:**
- Dataset: CWC (Central Water Commission) historical data + IMD rainfall archives
- Sequence length: 60 minutes lookback
- Prediction horizons: 1h, 3h, 6h
- Loss: Weighted cross-entropy (class weights: flood events 5:1 against non-flood)
- Optimizer: AdamW, lr=1e-3, weight_decay=1e-4
- Augmentation: Time warping, sensor dropout (random 10% of timesteps), Gaussian noise injection

**Validation:**
- Time-series split (no random shuffling) — 70/15/15 train/val/test
- Metrics: Precision, Recall, F1, Lead Time (time between alert and event)
- Target: Recall > 0.92, Lead Time > 30 minutes for flood_in_1h

### 3.4 Historical Pattern Matching

```python
# Seasonal baseline model (monsoon-aware)
class SeasonalFloodBaseline:
    """
    India's floods are highly seasonal (June-September monsoon).
    This model maintains per-station seasonal baselines.
    """
    def __init__(self):
        # 12 monthly baselines, each storing mean + std for each sensor
        self.baselines = {}  # {station_id: {month: {sensor: (mean, std)}}}

    def update_baseline(self, station_id, month, sensor_name, value):
        # Exponential moving average update
        alpha = 0.05
        mean, std = self.baselines[station_id][month][sensor_name]
        new_mean = alpha * value + (1 - alpha) * mean
        new_std = alpha * abs(value - mean) + (1 - alpha) * std
        self.baselines[station_id][month][sensor_name] = (new_mean, new_std)

    def z_score(self, station_id, month, sensor_name, current_value):
        mean, std = self.baselines[station_id][month][sensor_name]
        if std == 0:
            return 0
        return (current_value - mean) / std

    def is_anomalous(self, station_id, month, sensor_name, current_value, threshold=3.0):
        return abs(self.z_score(station_id, month, sensor_name, current_value)) > threshold
```

### 3.5 Flood Wave Propagation Timeline (Village-to-Village ETA Model)

To convert upstream river surges into localized downstream warning times, PRAYAS implements a 1D kinematic flood wave routing model based on open-channel hydraulics:

#### Theoretical Foundation: Manning's Equation & Kinematic Wave Celerity

The cross-sectional average velocity $V$ in an open channel is given by Manning's equation:
$$V = \frac{1}{n} R_h^{2/3} S_0^{1/2}$$

Where:
- $n$: Manning's roughness coefficient ($s/m^{1/3}$)
- $R_h$: Hydraulic radius ($m$), defined as $R_h = \frac{A}{P} \approx y$ (flow depth) for wide natural channels
- $S_0$: Bed slope (dimensionless, derived from DEM elevation drop $\frac{\Delta z}{\Delta x}$)

The flood wave celerity (speed of the disturbance front $c$) exceeds the mean water velocity:
$$c = \frac{dQ}{dA} = m \cdot V \approx \frac{5}{3} V$$

For a river reach of length $\Delta x_k$ with known slope $S_{0,k}$ and current depth $y_k$, the propagation transit time is:
$$\Delta t_k = \frac{\Delta x_k}{c_k} = \frac{\Delta x_k}{\frac{5}{3} \cdot \frac{1}{n_k} y_k^{2/3} S_{0,k}^{1/2}}$$

#### Indian River Channel Roughness Calibration ($n$)

| River Basin / Terrain | Reach Description | Calibrated $n$ | Typical Slope $S_0$ |
|---|---|:---:|:---:|
| Upper Ganga / Alaknanda (Uttarakhand) | Steep mountain torrent, boulders, cobbles | 0.045 – 0.060 | 0.015 – 0.035 |
| Middle Ganga (UP / Bihar) | Wide alluvial plain, meandering sand bed | 0.025 – 0.032 | 0.00008 – 0.00015 |
| Brahmaputra (Assam Valley) | Highly braided, unstable sandbars, silt | 0.030 – 0.038 | 0.00010 – 0.00020 |
| Western Ghats (Kerala / Karnataka) | Rocky bed, dense bank vegetation | 0.038 – 0.050 | 0.005 – 0.015 |

#### Implementation Algorithm: `FloodWavePropagator`

```python
import math
from typing import Dict, List, Tuple

class RiverReach:
    """Represents a river reach segment between two sensor nodes."""
    def __init__(self, reach_id: str, upstream_node: str, downstream_node: str,
                 length_meters: float, bed_slope: float, manning_n: float):
        self.reach_id = reach_id
        self.upstream_node = upstream_node
        self.downstream_node = downstream_node
        self.length_meters = length_meters
        self.bed_slope = max(bed_slope, 0.00005)
        self.manning_n = manning_n

    def compute_wave_celerity(self, water_depth_meters: float) -> float:
        """Compute flood wave front speed in m/s using kinematic wave approximation."""
        y = max(water_depth_meters, 0.2)
        # Mean velocity V = (1/n) * y^(2/3) * S^(1/2)
        velocity = (1.0 / self.manning_n) * (y ** (2.0 / 3.0)) * math.sqrt(self.bed_slope)
        # Wave celerity c = 5/3 * V
        celerity = (5.0 / 3.0) * velocity
        return max(celerity, 0.5)  # minimum 0.5 m/s (1.8 km/h)

    def travel_time_seconds(self, water_depth_meters: float) -> float:
        celerity = self.compute_wave_celerity(water_depth_meters)
        return self.length_meters / celerity


class FloodWaveTracker:
    """Computes downstream village arrival ETAs across a chain of river nodes."""
    def __init__(self):
        self.reaches: List[RiverReach] = []

    def add_reach(self, reach: RiverReach):
        self.reaches.append(reach)

    def calculate_downstream_timeline(self, origin_node: str, origin_depth: float,
                                    current_time_epoch: float) -> List[Dict]:
        """
        Returns arrival ETAs for all downstream settlements.
        Example Output:
        [
          {"village": "Pipalkoti", "distance_km": 8.5, "eta_seconds": 6300, "eta_formatted": "1h 45m"},
          {"village": "Chamoli Town", "distance_km": 16.0, "eta_seconds": 12000, "eta_formatted": "3h 20m"}
        ]
        """
        timeline = []
        cumulative_time = 0.0
        cumulative_dist = 0.0

        for reach in self.reaches:
            leg_time = reach.travel_time_seconds(origin_depth)
            cumulative_time += leg_time
            cumulative_dist += reach.length_meters / 1000.0

            hours = int(cumulative_time // 3600)
            minutes = int((cumulative_time % 3600) // 60)

            timeline.append({
                "downstream_node": reach.downstream_node,
                "distance_km": round(cumulative_dist, 1),
                "eta_seconds": int(cumulative_time),
                "eta_arrival_timestamp": current_time_epoch + cumulative_time,
                "eta_formatted": f"{hours}h {minutes}m"
            })
        return timeline
```

---

### 3.6 Dynamic Inundation Area Estimation (DEM-Based Stepped Flood Fill)

Rather than static radial buffer rings, PRAYAS computes dynamic inundation footprints using SRTM / Cartosat 30m Digital Elevation Models (DEM):

```
┌────────────────────────────────────────────────────────────────────────┐
│               DEM-BASED STEPPED INUNDATION ALGORITHM                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Input: 30m Elevation Grid Z(x,y) + Gauge Water Elevation H_gauge     │
│                                                                        │
│   1. Compute Projected Water Surface Elevation:                        │
│      H_water(x,y) = H_gauge - S_river * distance_along_stream(x,y)     │
│                                                                        │
│   2. Potential Inundation Mask:                                        │
│      M_candidate(x,y) = 1  IF  Z(x,y) <= H_water(x,y)  ELSE 0          │
│                                                                        │
│   3. 8-Connected Hydraulic Flood Fill:                                 │
│      Seed flood at stream centerline; traverse connected neighbors.    │
│      Discards depressed pits that have no surface connection to river. │
│                                                                        │
│   4. Metric Computation:                                               │
│      Inundated Area A = N_cells * (30m * 30m) / 10^6  [km²]            │
│      Overlay Village Coordinates -> Identify impacted Gram Panchayats  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Inundation Projection Table by Water Level

```python
class DEMInundationEstimator:
    """Estimates flooded surface area and impacted villages for given water heights."""
    def __init__(self, baseline_gauge_height: float, danger_gauge_height: float,
                 village_inventory: List[Dict]):
        self.baseline_height = baseline_gauge_height
        self.danger_height = danger_gauge_height
        self.villages = village_inventory  # [{"name": "GP_1", "elevation": 452.0, "pop": 2400}]

    def estimate_impact(self, current_water_height: float) -> Dict:
        delta_above_baseline = max(0.0, current_water_height - self.baseline_height)
        
        # Empirical hydraulic expansion curve for typical alluvial valleys: Area = k * (delta_h)^1.6
        expansion_coefficient = 3.8  # km² per meter rise
        inundated_km2 = round(expansion_coefficient * (delta_above_baseline ** 1.55), 2)
        
        impacted_villages = []
        total_exposed_population = 0

        for v in self.villages:
            # If river stage exceeds village elevation threshold
            if current_water_height >= v["elevation_threshold"]:
                impacted_villages.append(v["name"])
                total_exposed_population += v["population"]

        return {
            "current_stage_m": current_water_height,
            "above_danger_mark_m": round(max(0.0, current_water_height - self.danger_height), 2),
            "inundated_area_km2": inundated_km2,
            "impacted_villages_count": len(impacted_villages),
            "impacted_village_names": impacted_villages,
            "population_exposed": total_exposed_population
        }
```

---

### 3.7 Graduated Evacuation Level Protocol (L1–L5) Decision Engine

To eliminate ambiguous "evacuate vs do not evacuate" dilemmas, PRAYAS enforces an automated 5-level operational standard for disaster management:

```python
from enum import Enum

class EvacuationLevel(Enum):
    L1_ADVISORY = "L1_ADVISORY"                   # Confidence 0.30–0.50 | Upstream surge
    L2_STANDBY = "L2_STANDBY"                     # ETA 6–12h | Move vulnerable citizens
    L3_PARTIAL_EVACUATION = "L3_PARTIAL"          # ETA 3–6h  | Evacuate 500m river strip
    L4_FULL_EVACUATION = "L4_FULL"                # ETA <3h   | Evacuate entire flood footprint
    L5_EMERGENCY_RESCUE = "L5_EMERGENCY_RESCUE"   # Active breach | Air & boat rescue

def evaluate_evacuation_level(water_rise_rate_cm_min: float,
                              stage_above_danger_m: float,
                              downstream_eta_hours: float,
                              inundated_area_km2: float,
                              confidence: float) -> Dict:
    """
    Deterministic rule engine mapping hydrological telemetry to operational evacuation tiers.
    """
    if stage_above_danger_m > 1.5 or water_rise_rate_cm_min > 12.0:
        level = EvacuationLevel.L5_EMERGENCY_RESCUE
        actions = ["Deploy NDRF boat teams", "Sound continuous air raid siren", "GPS coordinates to IAF helicopters"]
    elif stage_above_danger_m >= 0.0 or downstream_eta_hours <= 3.0:
        level = EvacuationLevel.L4_FULL_EVACUATION
        actions = ["Full mandatory evacuation of inundation zone", "Barricade access roads", "Open all community shelters"]
    elif downstream_eta_hours <= 6.0 or inundated_area_km2 > 5.0 or water_rise_rate_cm_min > 4.0:
        level = EvacuationLevel.L3_PARTIAL_EVACUATION
        actions = ["Evacuate houses within 500m of river", "Mobilize state transit buses", "Activate village siren bursts"]
    elif downstream_eta_hours <= 12.0 or confidence >= 0.60:
        level = EvacuationLevel.L2_STANDBY
        actions = ["SMS ASHA workers", "Pre-position elderly & patients in shelters", "Inspect backup generators"]
    else:
        level = EvacuationLevel.L1_ADVISORY
        actions = ["Pre-position relief rations", "Place SDRF personnel on 2-hour standby", "Monitor telemetry stream"]

    return {
        "evacuation_level": level.value,
        "primary_trigger": f"Stage: +{stage_above_danger_m:.2f}m | ETA: {downstream_eta_hours:.1f}h | Area: {inundated_area_km2:.1f}km²",
        "authorized_actions": actions
    }
```

---

## 4. Forest Fire Detection Algorithms

### 4.1 Sensor Inputs

| Sensor | Metric | Sampling Rate | Unit |
|--------|--------|---------------|------|
| IR camera / Optical camera | Pixel data (RGB + IR) | 0.1 Hz (10s frames) | — |
| Temperature sensor | Ambient temp | 0.1 Hz | °C |
| Humidity sensor | Relative humidity | 0.1 Hz | % |
| Gas sensor (CO, CO2, NOx) | Concentration | 0.05 Hz (20s) | ppm |
| Anemometer | Wind speed/direction | 0.1 Hz | m/s, deg |

### 4.2 Smoke Detection via Vision (T2/T3)

**Architecture: Lightweight Fire-Smoke Detector**

Based on MobileNetV3-Small backbone for edge deployment:

```
Input: 224x224x3 (RGB) or 224x224x2 (RGB+IR)

Backbone: MobileNetV3-Small (pretrained on ImageNet)
  → Feature extraction layers (stop at layer 10/15)

Detection Head:
  → AdaptiveAvgPool2d(7)
  → Flatten
  → Linear(576, 256) → ReLU → Dropout(0.4)
  → Linear(256, 4)  # [clear, smoke, fire, false_alarm]
  → Sigmoid (multi-label)

Total params: ~2.0M
Model size (INT8 quantized): ~2.1MB
Inference (RPi 4): ~200ms per frame
```

**Training Strategy:**
- Datasets: Modular Fire Dataset (MFD), Fire Detection Image Dataset, custom Indian forest captures
- Heavy augmentation: RandomHorizontalFlip, ColorJitter (brightness=0.4, contrast=0.4), RandomResizedCrop, RandomRotation(15°)
- Hard negative mining: Include images of clouds, fog, dust, steam as "false_alarm" class
- Loss: Binary Cross-Entropy (multi-label)
- Target: mAP > 0.85, False Positive Rate < 5%

### 4.3 Temperature Anomaly Detection (T1 Edge)

```python
# Fire temperature signature detection
FIRE_THRESHOLDS = {
    "temp_spike_rate": 2.0,       # °C/min — sudden rise
    "temp_absolute": 45.0,        # °C — ambient threshold
    "temp_differential": 8.0,     # °C — difference from nearby stations
    "humidity_drop_rate": 5.0,    # %/min — rapid humidity decrease
    "humidity_absolute": 20.0,    # % — critically low
    "co_ppm": 50.0,              # ppm — carbon monoxide spike
    "co2_spike": 200.0           # ppm above baseline
}

def fire_signature_score(temp_readings, humidity_readings, gas_readings, timestamps):
    """
    Multi-parameter fire signature scoring using sliding window.
    temp_readings, humidity_readings: last N readings
    gas_readings: dict with 'co', 'co2' keys
    """
    score = 0.0

    # Temperature analysis (last 10 readings)
    if len(temp_readings) >= 2:
        temp_rate = (temp_readings[-1] - temp_readings[0]) / (timestamps[-1] - timestamps[0])
        if temp_rate > FIRE_THRESHOLDS["temp_spike_rate"]:
            score += 0.35
        if temp_readings[-1] > FIRE_THRESHOLDS["temp_absolute"]:
            score += 0.25

    # Humidity analysis
    if len(humidity_readings) >= 2:
        hum_rate = (humidity_readings[0] - humidity_readings[-1]) / (timestamps[-1] - timestamps[0])
        if hum_rate > FIRE_THRESHOLDS["humidity_drop_rate"]:
            score += 0.2
        if humidity_readings[-1] < FIRE_THRESHOLDS["humidity_absolute"]:
            score += 0.1

    # Gas analysis
    if gas_readings.get("co", 0) > FIRE_THRESHOLDS["co_ppm"]:
        score += 0.15
    if gas_readings.get("co2_spike", 0) > FIRE_THRESHOLDS["co2_spike"]:
        score += 0.1

    return min(score, 1.0)
```

### 4.4 Fire Spread Prediction Model (T3 Cloud)

**Architecture: Physics-Informed Neural Network (PINN)**

```
Inputs:
  - Fire perimeter polygon (current state)
  - Wind speed + direction grid (time-varying)
  - Topography (elevation slope, aspect) — DEM raster
  - Fuel type map (forest type, vegetation density)
  - Moisture content estimate
  - Temperature, humidity

Network:
  Encoder: MLP(64, 128, 128) with ReLU
  Temporal: LSTM(128, hidden=128, layers=2)
  Decoder: MLP(128, 64, output_size=N_vertices*2)

Output: Predicted fire perimeter at t+1h, t+6h, t+24h
Loss: Chamfer distance between predicted and actual fire perimeter vertices

Physics Constraints (added to loss):
  - Fire spreads uphill faster than downhill (slope penalty)
  - Wind alignment penalty
  - Non-negative spread constraint
```

**Validation:**
- Metric: Free-Burning Distance Error (FDE) at 1h, 6h, 24h horizons
- Target: FDE < 500m at 1h, < 2km at 6h

### 4.5 Multi-Sensor Correlation for False Positive Reduction

```python
class ForestFireCorrelator:
    """
    Correlates vision, temperature, humidity, and gas readings
    to reduce false positives from a single anomalous sensor.
    """
    SENSOR_WEIGHTS = {
        "vision_smoke": 0.30,
        "vision_fire": 0.35,
        "temp_anomaly": 0.15,
        "humidity_drop": 0.10,
        "gas_spike": 0.10
    }

    # Minimum sensors that must agree for confirmation
    MIN_CONFIRMING_SENSORS = 2

    def correlate(self, sensor_scores: dict) -> float:
        """
        sensor_scores: {sensor_name: score ∈ [0,1]}
        Returns combined confidence score.
        """
        active_sensors = [k for k, v in sensor_scores.items() if v > 0.3]

        if len(active_sensors) < self.MIN_CONFIRMING_SENSORS:
            return 0.0  # Insufficient confirmation

        weighted_score = sum(
            self.SENSOR_WEIGHTS.get(k, 0.05) * v
            for k, v in sensor_scores.items()
        )

        # Bonus for multi-sensor agreement
        agreement_bonus = min(len(active_sensors) - 1, 3) * 0.05
        return min(weighted_score + agreement_bonus, 1.0)
```

---

## 5. Air Quality Monitoring Algorithms

### 5.1 Sensor Inputs

| Sensor | Metric | Unit |
|--------|--------|------|
| PM2.5 sensor (laser scattering) | Mass concentration | µg/m³ |
| PM10 sensor | Mass concentration | µg/m³ |
| NO2 sensor (electrochemical) | Concentration | ppb |
| SO2 sensor | Concentration | ppb |
| CO sensor | Concentration | ppm |
| O3 sensor | Concentration | ppb |
| CO2 sensor | Concentration | ppm |
| VOC sensor (MOX) | Total VOC | ppb |

### 5.2 AQI Calculation Algorithm

India's National Air Quality Index (NAQI) follows CPCB standards:

```python
import numpy as np

# CPCB Sub-indices breakpoints (Indian AQI scale)
AQI_BREAKPOINTS = {
    "PM2.5_24hr": [
        (0, 30, 0, 50),       # Good
        (31, 60, 51, 100),    # Satisfactory
        (61, 90, 101, 200),   # Moderately Polluted
        (91, 120, 201, 300),  # Poor
        (121, 250, 301, 400), # Very Poor
        (251, 500, 401, 500), # Severe
    ],
    "PM10_24hr": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 530, 401, 500),
    ],
    "NO2_24hr": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 180, 101, 200),
        (181, 280, 201, 300),
        (281, 400, 301, 400),
        (401, 530, 401, 500),
    ]
    # ... similar for SO2, CO, O3
}

def compute_sub_index(pollutant, concentration_24hr):
    breakpoints = AQI_BREAKPOINTS[pollutant]
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= concentration_24hr <= c_high:
            return ((i_high - i_low) / (c_high - c_low)) * (concentration_24hr - c_low) + i_low
    return 500  # Beyond scale

def compute_aqi(readings: dict) -> dict:
    """
    readings: {pollutant: concentration_24hr_average}
    Returns: {aqi: int, category: str, dominant_pollutant: str, sub_indices: dict}
    """
    sub_indices = {}
    for pollutant, conc in readings.items():
        if pollutant in AQI_BREAKPOINTS:
            sub_indices[pollutant] = compute_sub_index(pollutant, conc)

    aqi = max(sub_indices.values()) if sub_indices else 0
    dominant = max(sub_indices, key=sub_indices.get) if sub_indices else "PM2.5"

    category = "Good"
    for name, low, high in [
        ("Good", 0, 50), ("Satisfactory", 51, 100), ("Moderately Polluted", 101, 200),
        ("Poor", 201, 300), ("Very Poor", 301, 400), ("Severe", 401, 500)
    ]:
        if low <= aqi <= high:
            category = name
            break

    return {"aqi": round(aqi), "category": category, "dominant_pollutant": dominant, "sub_indices": sub_indices}
```

### 5.3 Pollution Source Identification

**Architecture: Directional Plume Analysis + ML Classification**

```
Inputs per station:
  - PM2.5, PM10, NO2, SO2, CO, O3 time series (last 24h)
  - Wind speed + direction (co-located met sensor)
  - 24h pollutant ratios (e.g., PM2.5/PM10, NO2/SO2)

Feature Engineering:
  - Wind-rose aligned concentration histograms
  - Pollutant ratio vectors (source signatures):
    • Vehicle exhaust: high NO2/CO, PM2.5/PM10 > 0.6
    • Industrial: high SO2, PM10/PM2.5 > 0.4
    • Construction/Dust: PM10 >> PM2.5, PM2.5/PM10 < 0.3
    • Biomass burning: high CO, PM2.5/PM10 > 0.7, K+ signature
    • Crop residue: seasonal, wind-aligned plume, K+ and OC

Classification Model:
  - Input: pollutant ratios + wind direction + time-of-day + season
  - Model: XGBoost (T2) or Quantized Neural Net (T1)
  - Output: probability distribution over source types
  - Training: Labeled source attribution data from CPCB + emission inventories
```

### 5.4 AQI Forecasting Model (T3)

**Architecture: Spatio-Temporal Graph Convolutional Network (ST-GCN)**

```
Graph Construction:
  - Nodes: Monitoring stations
  - Edges: Spatial proximity (< 50km) + wind connectivity
  - Node features: [PM2.5, PM10, NO2, SO2, CO, O3, temp, humidity, wind_x, wind_y]
  - Edge features: [distance, wind_alignment_score]

Model:
  - Spatial: Graph Attention Network (GAT) — 2 layers, 8 heads
  - Temporal: GRU — 2 layers, hidden=128
  - Output: AQI at t+1h, t+6h, t+24h per station
  - Training: Historical CPCB + SAFAR data (2018-2025)
```

### 5.5 Industrial Emission Spike Detection

```python
class IndustrialSpikeDetector:
    """
    Detects sudden emission spikes from industrial sources.
    Uses CUSUM (Cumulative Sum) control chart for rapid detection.
    """
    def __init__(self, baseline_window=28, threshold=4.0, drift=1.0):
        self.baseline_window = baseline_window  # days
        self.threshold = threshold  # decision threshold
        self.drift = drift  # allowed drift before detection
        self.pos_cusum = 0
        self.neg_cusum = 0

    def update(self, value, baseline_mean, baseline_std):
        if baseline_std == 0:
            return False, 0

        standardized = (value - baseline_mean) / baseline_std
        self.pos_cusum = max(0, self.pos_cusum + standardized - self.drift)
        self.neg_cusum = max(0, self.neg_cusum - standardized - self.drift)

        spike_detected = self.pos_cusum > self.threshold or self.neg_cusum > self.threshold
        return spike_detected, max(self.pos_cusum, self.neg_cusum)

    def reset(self):
        self.pos_cusum = 0
        self.neg_cusum = 0
```

---

## 6. Landslide Early Warning Algorithms

### 6.1 Sensor Inputs

| Sensor | Metric | Sampling Rate | Unit |
|--------|--------|---------------|------|
| Accelerometer / Geophone | Vibration | 100 Hz (critical), 1 Hz (normal) | g, mm/s |
| Soil moisture probe (deep) | VWC at depth | 0.017 Hz | % |
| Tensiometer | Soil pore water pressure | 0.017 Hz | kPa |
| Rain gauge (on-site) | Accumulation | 1 Hz | mm/hr |
| Tiltmeter | Ground tilt | 0.1 Hz | degrees |
| GPS/GNSS | Ground displacement | 0.003 Hz (5min) | mm |

### 6.2 Threshold-Based Detection (T1)

```python
LANDSLIDE_THRESHOLDS = {
    "rainfall_accumulation": {
        "24hr_warning": 100.0,   # mm — IMD heavy rain threshold
        "24hr_critical": 150.0,  # mm — trigger for saturated slopes
        "48hr_warning": 200.0,   # mm — antecedent rainfall matters
        "72hr_warning": 300.0,   # mm — prolonged saturation
    },
    "rainfall_intensity": {
        "1hr_warning": 30.0,     # mm/hr
        "1hr_critical": 50.0     # mm/hr
    },
    "soil_moisture_depth": {
        "surface_saturated": 45.0,   # % — shallow slides
        "deep_saturated": 40.0,      # % — deep seated
    },
    "vibration_rms": {
        "microseismic": 0.001,   # g — precursor tremors
        "warning": 0.01,         # g — active movement
        "critical": 0.05         # g — imminent failure
    },
    "tilt_rate": {
        "warning": 0.5,          # deg/day
        "critical": 2.0          # deg/day
    },
    "displacement_rate": {
        "warning": 5.0,          # mm/day
        "critical": 20.0         # mm/day — accelerating creep
    }
}

def landslide_risk_score(rain_24h, rain_48h, rain_72h, rain_1hr,
                          soil_moisture, vibration_rms, tilt_rate,
                          displacement_rate):
    """
    Composite landslide risk score from multiple parameters.
    """
    score = 0.0

    # Rainfall contribution (40% weight)
    rain_score = 0.0
    if rain_72h > LANDSLIDE_THRESHOLDS["rainfall_accumulation"]["72hr_warning"]:
        rain_score += 0.3
    if rain_48h > LANDSLIDE_THRESHOLDS["rainfall_accumulation"]["48hr_warning"]:
        rain_score += 0.3
    if rain_24h > LANDSLIDE_THRESHOLDS["rainfall_accumulation"]["24hr_critical"]:
        rain_score += 0.25
    if rain_1hr > LANDSLIDE_THRESHOLDS["rainfall_intensity"]["1hr_critical"]:
        rain_score += 0.15
    score += min(rain_score, 1.0) * 0.40

    # Soil moisture contribution (25% weight)
    if soil_moisture > LANDSLIDE_THRESHOLDS["soil_moisture_depth"]["deep_saturated"]:
        score += 0.25
    elif soil_moisture > LANDSLIDE_THRESHOLDS["soil_moisture_depth"]["surface_saturated"]:
        score += 0.15

    # Vibration contribution (20% weight)
    if vibration_rms > LANDSLIDE_THRESHOLDS["vibration_rms"]["critical"]:
        score += 0.20
    elif vibration_rms > LANDSLIDE_THRESHOLDS["vibration_rms"]["warning"]:
        score += 0.12
    elif vibration_rms > LANDSLIDE_THRESHOLDS["vibration_rms"]["microseismic"]:
        score += 0.05

    # Tilt + displacement contribution (15% weight)
    ground_movement = 0.0
    if tilt_rate > LANDSLIDE_THRESHOLDS["tilt_rate"]["critical"]:
        ground_movement += 0.5
    elif tilt_rate > LANDSLIDE_THRESHOLDS["tilt_rate"]["warning"]:
        ground_movement += 0.3
    if displacement_rate > LANDSLIDE_THRESHOLDS["displacement_rate"]["critical"]:
        ground_movement += 0.5
    elif displacement_rate > LANDSLIDE_THRESHOLDS["displacement_rate"]["warning"]:
        ground_movement += 0.3
    score += min(ground_movement, 1.0) * 0.15

    return min(score, 1.0)
```

### 6.3 Vibration Pattern Analysis

```python
class SeismicPatternAnalyzer:
    """
    Analyzes vibration patterns to distinguish landslide precursors
    from background noise (traffic, construction, earthquakes).
    """
    def __init__(self, sampling_rate=100):
        self.fs = sampling_rate
        self.window_size = 512  # ~5 seconds at 100Hz

    def extract_features(self, vibration_signal):
        """Extract spectral and temporal features from vibration window."""
        features = {}

        # Time domain
        features["rms"] = np.sqrt(np.mean(vibration_signal ** 2))
        features["peak"] = np.max(np.abs(vibration_signal))
        features["crest_factor"] = features["peak"] / features["rms"] if features["rms"] > 0 else 0
        features["kurtosis"] = float(np.mean((vibration_signal - np.mean(vibration_signal))**4) /
                                      (np.std(vibration_signal)**4 + 1e-10))

        # Frequency domain
        fft_vals = np.fft.rfft(vibration_signal)
        fft_mag = np.abs(fft_vals)
        freqs = np.fft.rfftfreq(len(vibration_signal), 1/self.fs)

        # Band energy ratios (landslide signatures: 1-20 Hz)
        bands = {
            "low": (1, 5),      # Deep movement
            "mid": (5, 15),     # Shallow failure
            "high": (15, 50),   # Surface cracking
        }
        total_energy = np.sum(fft_mag ** 2) + 1e-10
        for name, (f_low, f_high) in bands.items():
            mask = (freqs >= f_low) & (freqs < f_high)
            features[f"energy_{name}"] = np.sum(fft_mag[mask] ** 2) / total_energy

        features["dominant_freq"] = freqs[np.argmax(fft_mag[1:]) + 1]

        return features

    def classify_signal(self, features):
        """
        Rule-based + ML hybrid classification.
        Landslide signature: rising RMS + low-freq dominance + increasing kurtosis.
        """
        score = 0.0

        # Rising energy in low-frequency band (precursor)
        if features["energy_low"] > 0.4:
            score += 0.3

        # High kurtosis indicates impulsive events (cracking)
        if features["kurtosis"] > 5.0:
            score += 0.2

        # Increasing crest factor suggests progressive failure
        if features["crest_factor"] > 3.0:
            score += 0.15

        # Dominant frequency in landslide range
        if 1.0 <= features["dominant_freq"] <= 15.0:
            score += 0.15

        return min(score, 1.0)
```

### 6.4 Slope Stability ML Model (T2/T3)

**Architecture: 1D-CNN + LSTM for time-series classification**

```
Input: Multi-channel time series (last 24h)
  - vibration_rms (1Hz)
  - soil_moisture_surface (0.017Hz → resampled to 1Hz)
  - soil_moisture_deep (0.017Hz → resampled)
  - rainfall (1Hz)
  - tilt_x, tilt_y (0.1Hz → resampled)
  - displacement (resampled)
  Shape: (batch, 86400, 6)  # 24h * 3600s, 6 channels

Model:
  Conv1D(32, kernel=32, stride=4) → BN → ReLU
  Conv1D(64, kernel=16, stride=2) → BN → ReLU
  LSTM(128, layers=2, dropout=0.3)
  Attention pooling
  Dense(64, ReLU) → Dropout(0.3)
  Dense(3)  # [stable, warning, critical]
  Softmax

Training:
  - Dataset: Ongoing landslide monitoring + historical GSI (Geological Survey of India) data
  - Heavy class imbalance → SMOTE + focal loss (gamma=2)
  - Target: Recall > 0.90 for critical class, lead time > 6 hours
```

---

## 7. Industrial Safety Monitoring Algorithms

### 7.1 Gas Detection & Chemical Leak Detection

```python
GAS_THRESHOLDS = {
    # (TWA_8hr, STEL_15min, IDLH) in ppm
    "H2S":       (10, 15, 100),
    "NH3":       (25, 35, 300),
    "Cl2":       (0.5, 1, 10),
    "SO2":       (2, 5, 100),
    "CO":        (25, 100, 1200),
    "NO2":       (1, 5, 20),
    "HCN":       (10, 15, 50),
    "COCl2":     (0.1, 0.2, 2),
    "CH4":       (0, 0, 5000),  # LEL = 50000 ppm (5%)
}

class GasLeakDetector:
    def __init__(self):
        self.baseline_concentrations = {}  # {gas: rolling_mean}
        self.rolling_window = []

    def detect_spike(self, gas_name, current_conc, dt):
        """Rate-of-rise detection for gas leaks."""
        if gas_name not in self.baseline_concentrations:
            self.baseline_concentrations[gas_name] = current_conc
            return False, 0

        baseline = self.baseline_concentrations[gas_name]
        rate_of_rise = (current_conc - baseline) / dt  # ppm/min

        # Update baseline slowly (normal ambient changes)
        alpha = 0.001
        self.baseline_concentrations[gas_name] = alpha * current_conc + (1 - alpha) * baseline

        # Spike detection
        thresholds = GAS_THRESHOLDS.get(gas_name, (100, 200, 1000))
        twa, stel, idlh = thresholds

        score = 0.0
        if current_conc > idlh:
            score = 1.0  # Immediately dangerous
        elif current_conc > stel:
            score = 0.8
        elif current_conc > twa:
            score = 0.5
        elif rate_of_rise > 5.0:  # ppm/min — rising concentration
            score = 0.4  # Potential leak even below threshold

        return score > 0, score
```

### 7.2 Multi-Parameter Industrial Correlation

```python
class IndustrialSafetyCorrelator:
    """
    Correlates multiple parameters to detect complex industrial incidents:
    - Chemical leak: gas spike + temp change + pressure drop
    - Fire: temp spike + smoke + gas (CO) + pressure change
    - Explosion risk: gas accumulation + temp + no ventilation
    """
    INCIDENT_SIGNATURES = {
        "chemical_leak": {
            "required": ["gas_spike", "pressure_drop"],
            "optional": ["temp_change"],
            "min_required": 2
        },
        "industrial_fire": {
            "required": ["temp_spike"],
            "optional": ["smoke", "co_spike", "pressure_change"],
            "min_required": 2
        },
        "gas_accumulation": {
            "required": ["gas_rising", "low_ventilation"],
            "optional": ["temp_rising"],
            "min_required": 2
        },
        "pressure_vessel_failure": {
            "required": ["pressure_anomaly", "temp_anomaly"],
            "optional": ["vibration"],
            "min_required": 2
        }
    }

    def detect_incident(self, observations: dict) -> dict:
        """
        observations: {parameter_name: bool (anomaly detected)}
        Returns: {incident_type: probability}
        """
        results = {}
        for incident_type, signature in self.INCIDENT_SIGNATURES.items():
            required_met = sum(1 for p in signature["required"] if observations.get(p, False))
            optional_met = sum(1 for p in signature["optional"] if observations.get(p, False))

            if required_met >= min(signature["min_required"], len(signature["required"])):
                confidence = (required_met / len(signature["required"])) * 0.7 + \
                            (optional_met / max(len(signature["optional"]), 1)) * 0.3
                results[incident_type] = min(confidence, 1.0)

        return results
```

---

## 8. Unified Anomaly Detection Framework

### 8.1 Statistical Methods (T1 Edge)

```python
class AdaptiveAnomalyDetector:
    """
    Per-sensor adaptive anomaly detection using statistical methods.
    Runs on edge devices with minimal compute.
    """
    def __init__(self, window_size=100, z_threshold=3.0, method="ewma"):
        self.window_size = window_size
        self.z_threshold = z_threshold
        self.method = method
        self.buffer = []
        self.ewma_mean = None
        self.ewma_var = None

    def update(self, value):
        self.buffer.append(value)
        if len(self.buffer) > self.window_size:
            self.buffer.pop(0)

        if self.method == "ewma":
            alpha = 0.1
            if self.ewma_mean is None:
                self.ewma_mean = value
                self.ewma_var = 0
            else:
                self.ewma_mean = alpha * value + (1 - alpha) * self.ewma_mean
                self.ewma_var = alpha * (value - self.ewma_mean)**2 + (1 - alpha) * self.ewma_var

            std = max(np.sqrt(self.ewma_var), 1e-10)
            z_score = abs(value - self.ewma_mean) / std
            return z_score > self.z_threshold, z_score

        else:  # rolling window
            if len(self.buffer) < 10:
                return False, 0
            mean = np.mean(self.buffer)
            std = max(np.std(self.buffer), 1e-10)
            z_score = abs(value - mean) / std
            return z_score > self.z_threshold, z_score

    def iqr_anomaly(self, value):
        """IQR-based anomaly detection."""
        if len(self.buffer) < 20:
            return False, 0
        q1, q3 = np.percentile(self.buffer, [25, 75])
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        is_anomaly = value < lower or value > upper
        distance = max(lower - value, value - upper, 0)
        return is_anomaly, distance / (iqr + 1e-10)
```

### 8.2 Isolation Forest (T2 Gateway)

```
Model: IsolationForest (scikit-learn)
  - n_estimators: 200
  - contamination: 0.01 (expected anomaly rate)
  - max_features: 0.8

Input Features (per station, 10-min window):
  [sensor_1_mean, sensor_1_std, sensor_1_max, sensor_1_min,
   sensor_2_mean, sensor_2_std, ...,
   rate_of_change_sensor_1, rate_of_change_sensor_2,
   cross_sensor_correlation_1_2, ...]

Training: Sliding window of 30 days of normal data per station
Inference: Real-time, anomaly score ∈ [-1, 1] (higher = more anomalous)
```

### 8.3 Autoencoder for Pattern Recognition (T2/T3)

```python
"""
Autoencoder for multi-sensor anomaly detection.
Learns normal operating patterns; anomalies = high reconstruction error.
"""
import torch
import torch.nn as nn

class SensorAutoencoder(nn.Module):
    def __init__(self, input_dim, encoding_dim=32):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, encoding_dim),
            nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.Linear(encoding_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Linear(128, input_dim)
        )

    def forward(self, x):
        z = self.encoder(x)
        x_hat = self.decoder(z)
        return x_hat

    def anomaly_score(self, x, threshold_percentile=95):
        """Reconstruction error as anomaly score."""
        with torch.no_grad():
            x_hat = self.forward(x)
            recon_error = torch.mean((x - x_hat) ** 2, dim=1)
            threshold = torch.quantile(recon_error, threshold_percentile / 100)
            is_anomaly = recon_error > threshold
            return is_anomaly, recon_error, threshold
```

### 8.4 Sliding Window Analysis

```python
class SlidingWindowAnalyzer:
    """
    Generic sliding window analysis for temporal patterns.
    Supports multiple aggregation strategies.
    """
    def __init__(self, window_size, step_size=1):
        self.window_size = window_size
        self.step_size = step_size
        self.buffer = []

    def add(self, value):
        self.buffer.append(value)
        if len(self.buffer) > self.window_size:
            self.buffer.pop(0)

    def get_window(self):
        return list(self.buffer)

    def analyze(self):
        if len(self.buffer) < self.window_size:
            return None

        arr = np.array(self.buffer)
        return {
            "mean": float(np.mean(arr)),
            "std": float(np.std(arr)),
            "min": float(np.min(arr)),
            "max": float(np.max(arr)),
            "trend": float(np.polyfit(range(len(arr)), arr, 1)[0]),  # Linear slope
            "rate_of_change": float(arr[-1] - arr[0]) / self.window_size,
            "percentile_95": float(np.percentile(arr, 95)),
            "percentile_5": float(np.percentile(arr, 5)),
            "zero_crossing_rate": float(np.sum(np.diff(np.sign(arr - np.mean(arr))) != 0)) / len(arr)
        }
```

---

## 9. Model Training & Update Infrastructure

### 9.1 Transfer Learning Strategy

```
Pre-training (Cloud):
  1. Large-scale general models on public datasets:
     - Vision models: ImageNet → fine-tune on fire/smoke data
     - Time-series models: Pre-trained on NASA POWER (weather) → fine-tune on local sensor data
     - Anomaly detection: Pre-trained on general sensor data → fine-tune per-region

  2. Foundation model approach:
     - Single multi-task model trained on all hazard types
     - Shared backbone with task-specific heads
     - Benefits from cross-hazard feature learning

Fine-tuning (Per-region):
  1. Collect 30 days of local baseline data
  2. Fine-tune last 2 layers of pre-trained model
  3. Recalibrate thresholds per-station (seasonal adjustment)
  4. Validate on local held-out data
```

### 9.2 Over-the-Air (OTA) Update Mechanism

```
Update Pipeline:
  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Cloud Model  │────→│ Edge Gateway  │────→│ Edge Devices │
  │ Repository   │     │ (Model Cache) │     │ (TFLite/ONNX)│
  └─────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
    Version 1.2.3       Delta update          Apply + verify
    Changelog:          Only weights           Fallback to
    - New threshold     changed: ~10KB         previous version
    - Retrained on      Full model: ~5MB       on failure
      monsoon 2025

Update Protocol:
  1. Model registry (MLflow) → versioned models with metadata
  2. Delta compression (weight diff) → minimize OTA bandwidth
  3. A/B deployment: new model runs in shadow mode for 24h
  4. If shadow accuracy > baseline: promote to production
  5. Automatic rollback if error rate increases > 5%
```

### 9.3 Continuous Learning Pipeline

```
Data Flow:
  Sensors → Edge (raw) → Gateway (preprocessed) → Cloud (stored)
                                                     ↓
  Cloud Training Pipeline (weekly):
    1. Ingest new labeled data (operator feedback + auto-labeling)
    2. Retrain models with expanding dataset
    3. Evaluate on held-out test set
    4. If improvement > 2% F1: trigger OTA update
    5. Log model metrics to dashboard

Auto-labeling:
  - High-confidence threshold detections → auto-labeled
  - Low-confidence → queued for human review
  - Operator confirms/rejects alerts → feedback loop
```

---

## 10. Validation Framework

### 10.1 Per-Hazard Validation Metrics

| Hazard | Primary Metric | Target | Secondary Metric |
|--------|---------------|--------|-----------------|
| Flood | Recall @ lead_time=30min | > 0.92 | False Alarm Rate < 8% |
| Forest Fire | mAP@0.5 | > 0.85 | False Positive Rate < 5% |
| AQI | MAE (AQI units) | < 15 | R² > 0.85 |
| Landslide | Recall (critical class) | > 0.90 | Lead time > 6h |
| Industrial Gas | Detection rate | > 0.95 | False Alarm Rate < 3% |
| Anomaly Detection | AUROC | > 0.92 | Precision@1%FPR > 0.8 |

### 10.2 Cross-Validation Strategy

```python
"""
Time-series aware cross-validation for all models.
NO random shuffling — temporal ordering preserved.
"""
from sklearn.model_selection import TimeSeriesSplit

def time_series_cv(X, y, n_splits=5):
    tscv = TimeSeriesSplit(n_splits=n_splits)
    scores = []
    for train_idx, val_idx in tscv.split(X):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
        # Train, evaluate, store scores
        # ...
        scores.append({"precision": p, "recall": r, "f1": f})
    return scores

"""
Spatial cross-validation: Leave-one-station-out.
Ensures model generalizes to unseen geographic locations.
"""
def spatial_cv(stations_data, station_ids):
    unique_stations = np.unique(station_ids)
    scores = []
    for left_out in unique_stations:
        train_mask = station_ids != left_out
        test_mask = station_ids == left_out
        # Train on all stations except left_out
        # Evaluate on left_out station
        # ...
    return scores
```

### 10.3 Stress Testing

| Test Scenario | Description | Expected Behavior |
|---------------|-------------|-------------------|
| Sensor failure | One sensor goes offline | Graceful degradation, alert confidence drops but doesn't vanish |
| Data gap | 1-6 hours of missing data | Imputation + model operates on available sensors |
| Extreme event | Beyond training range | High uncertainty flag, conservative alert |
| Drift detection | Slow sensor calibration drift | Monthly recalibration triggers retraining |
| Simultaneous hazards | Flood + landslide co-occurring | Both detected independently, correlation engine links them |

---

## 11. Resource Requirements

### 11.1 Edge Device (T1) Requirements

| Component | Requirement |
|-----------|-------------|
| MCU | ESP32-S3 or STM32H7 (dual-core, 240MHz+) |
| RAM | 512KB minimum |
| Flash | 2MB for model + rules |
| Model | Quantized INT8 TFLite (< 500KB) |
| Power | Solar + battery, < 1W average |

### 11.2 Gateway (T2) Requirements

| Component | Requirement |
|-----------|-------------|
| Hardware | Raspberry Pi 5 (8GB RAM, Broadcom BCM2712 Quad-Core Cortex-A76 @ 2.4GHz) |
| RAM | 8GB LPDDR4X |
| Storage | 64GB High-Endurance MicroSD / NVMe SSD |
| Accelerator (Optional) | Coral USB TPU (4 TOPS) |
| Model | ONNX / TFLite FP16 (< 50MB) |
| Inference | < 150ms on RPi 5 CPU (< 30ms with Coral TPU) |

### 11.3 Cloud (T3) Requirements

| Component | Requirement |
|-----------|-------------|
| GPU | NVIDIA T4 or A10G (for training + batch inference) |
| Training | PyTorch 2.2, MLflow tracking |
| Inference | TorchServe or Triton Inference Server |
| Storage | S3-compatible object storage + TimescaleDB (PostgreSQL 16) |

---

## 12. Algorithm Summary Matrix

| Hazard | T1 (Edge ESP32) | T2 (Gateway RPi 5) | T3 (District / Cloud) | Lead Time |
|--------|----------------|-------------------|----------------------|-----------|
| **Flood** | Threshold + Rise Rate + Local Siren | Manning Wave Celerity + GRU Temporal | DEM Stepped Inundation + L1-L5 Evacuation | 1h – 8h advance |
| **Forest Fire** | BME680 Rate-of-Rise + Smoke Analog | MobileNetV3 Vision + Wind Vector | PINN Fire Propagation Simulation | 15min – 12h |
| **Air Quality** | Continuous CPCB AQI + CUSUM Spike | XGBoost Source Fingerprinting | ST-GCN Regional Plume Dispersion | 1h – 24h |
| **Landslide** | Tilt Angle + LIS3DH Vibration RMS | 1D-CNN + Antecedent Rainfall Saturation | Infinite Slope Stability Geotechnical | 2h – 12h |
| **Industrial** | Gas IDLH Thresholds + Rate-of-Rise | Gaussian Plume Downwind Dispersion | ALOHA Gas Cloud Transport Model | Instant (<1min) |
| **Multi-Hazard**| Dual-sensor confirmation | Cross-correlation engine (3600s window) | Bayesian Network Cascade Model | Event-driven |

---

## 13. Multi-Hazard Cascade Correlation Engine

Real-world environmental disasters routinely trigger catastrophic secondary failures. PRAYAS explicitly tracks and models four specific hazard cascades:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DISASTER CASCADE TRIGGER MATRIX                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Heavy Monsoon Rain] ──► [Saturated Hillside] ──► [Slope Landslide]   │
│                                                            │           │
│                                                            ▼           │
│  [Sudden River Surge] ◄── [Dam Burst / GLOF] ◄── [Valley River Block]  │
│                                                                        │
│  [Wildfire Burn Scar] ──► [Soil Hydrophobicity] ──► [3x Flash Runoff]  │
│                                                                        │
│  [Factory Flash Flood] ──► [Chemical Containment] ──► [River Poison]   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Rainfall → Landslide → River Damming → Flash Flood**:
   - *Precursor*: >100mm rain in 6h + high soil moisture (>50% VWC).
   - *Trigger*: Accelerometer detects high-energy low-frequency vibration (1–5 Hz) indicating slope failure.
   - *Cascade Signature*: Downstream water level abruptly *drops* while upstream water backs up (debris dam formation).
   - *Action*: Alert downstream settlements of imminent breakout flood wave with 2–4 hour lead time.
2. **Wildfire Burn Scar → Hydrophobic Flash Flood**:
   - Burned organic matter leaves waxy hydrophobic coating on soil. Runoff coefficient $C$ surges from 0.25 to 0.75 ($3\times$ increase).
   - The system automatically modifies runoff curves in post-burn catchment zones, lowering flood warning thresholds by 50% for 90 days.
3. **Flood / Storm Inundation → Industrial Chemical Release**:
   - When water level gauges near industrial estates exceed high-water marks concurrent with pH/TDS sensor spikes, system flags hazardous chemical dispersal along the downstream drainage corridor.

---

## 14. Model Quantization & Edge Memory Footprints

| Model Name | Target Hardware | Input Dimensions | Uncompressed (FP32) | Quantized (INT8) | Inference Latency |
|---|---|---|:---:|:---:|:---:|
| **Edge Anomaly Autoencoder** | ESP32-S3 | 8 sensor features | 240 KB | **58 KB** | 0.8 ms |
| **Flash Flood Heuristic Tree**| ESP32-S3 | 4 temporal features | 12 KB | **3.5 KB** | < 0.1 ms |
| **MobileNetV3 Fire/Smoke** | RPi 5 (Coral TPU)| 224×224×3 RGB | 8.4 MB | **2.1 MB** | 22 ms |
| **Temporal Flood GRU** | RPi 5 CPU | 60×4 timeseries | 1.8 MB | **480 KB** | 14 ms |
| **Landslide 1D-CNN+LSTM** | RPi 5 CPU | 1000×6 vibration | 3.2 MB | **820 KB** | 28 ms |
| **AQI Source Classifier** | RPi 5 CPU | 12 pollutant features | 420 KB | **110 KB** | 3.5 ms |

*All T1 models fit comfortably inside the ESP32-S3's 512KB SRAM and 8MB PSRAM.*

---

## 15. Training Dataset Sources & Benchmark Archives

| Hazard Domain | Primary Dataset Archive | Source Agency | Data Modality | Volume / Period |
|---|---|---|---|:---:|
| **River Floods** | CWC Daily River Stages & Discharges | Central Water Commission | Water level, discharge (cumecs) | 10 yrs (2014–2024) |
| **Flash Floods** | INDOFLOODS Historical Flood Inventory | IIT Gandhinagar / IMD | Gridded precipitation, flood extents | 1998–2023 |
| **Extreme Rainfall**| High-Resolution Gridded Daily Rainfall | IMD Pune (0.25° × 0.25°) | Daily & sub-daily rainfall (mm) | 1901–2024 |
| **Wildfires** | NASA FIRMS VIIRS & MODIS Hotspots | NASA / ISRO NRSC | Thermal anomalies, FRP (MW) | 2018–2025 |
| **Air Quality** | CPCB Central Control Room for AQM | CPCB / OpenAQ | PM2.5, PM10, SO2, NO2, CO, O3 | 500+ Indian stations |
| **Topography** | Cartosat-1 / SRTM 30m DEM | ISRO Bhuvan / USGS | Digital Elevation Grids (GeoTIFF) | All-India coverage |
| **Landslides** | National Landslide Susceptibility Map | Geological Survey of India (GSI) | Slope, lithology, landslide inventory | 65,000+ mapped points |

---

*Document Version: 2.0 (Harmonized Architecture & Advanced Modules)*
*Agent 2 — Multi-Hazard Detection Algorithms & AI Models*
*SIH 2026 Problem Statement 26178 | Qualcomm Inc*
