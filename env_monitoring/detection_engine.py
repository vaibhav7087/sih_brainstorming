"""
Multi-Hazard Detection Engine
SIH 2026 — Problem Statement 26178
Agent 2: Core Algorithm Implementations
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
import time


# =============================================================================
# CONSTANTS & CONFIGURATION
# =============================================================================

class AlertLevel(Enum):
    INFO = "info"
    WATCH = "watch"
    WARNING = "warning"
    EMERGENCY = "emergency"


@dataclass
class Alert:
    hazard_type: str
    level: AlertLevel
    confidence: float
    timestamp: float
    station_id: str
    message: str
    details: Dict = field(default_factory=dict)


# =============================================================================
# FLOOD DETECTION
# =============================================================================

FLOOD_THRESHOLDS = {
    "water_level_rise_rate": {"warning": 2.0, "critical": 5.0, "flash_flood": 10.0},
    "rainfall_intensity": {"heavy": 64.5, "very_heavy": 124.5, "exceptional": 244.5},
    "water_level_absolute": {"danger_mark": 0, "severe": 100},
    "soil_moisture": {"saturated": 45.0, "critical": 55.0},
}


class FloodDetector:
    """Multi-parameter flood detection with confidence scoring."""

    def __init__(self):
        self.history = {"water_level": [], "rainfall": [], "soil_moisture": [], "timestamps": []}
        self.max_history = 3600  # 1 hour at 1Hz

    def update(self, water_level: float, rainfall: float, soil_moisture: float,
               timestamp: float = None) -> Optional[Alert]:
        if timestamp is None:
            timestamp = time.time()

        self.history["water_level"].append(water_level)
        self.history["rainfall"].append(rainfall)
        self.history["soil_moisture"].append(soil_moisture)
        self.history["timestamps"].append(timestamp)

        # Trim history
        for key in self.history:
            if len(self.history[key]) > self.max_history:
                self.history[key] = self.history[key][-self.max_history:]

        if len(self.history["timestamps"]) < 10:
            return None

        score = self._compute_score()
        return self._evaluate(score, timestamp)

    def _compute_score(self) -> float:
        score = 0.0
        ts = self.history["timestamps"]
        dt = ts[-1] - ts[0]
        if dt == 0:
            return 0.0

        # Water level rise rate (cm/min)
        wl = self.history["water_level"]
        rise_rate = (wl[-1] - wl[0]) / (dt / 60.0)
        if rise_rate > FLOOD_THRESHOLDS["water_level_rise_rate"]["flash_flood"]:
            score += 0.5
        elif rise_rate > FLOOD_THRESHOLDS["water_level_rise_rate"]["critical"]:
            score += 0.3
        elif rise_rate > FLOOD_THRESHOLDS["water_level_rise_rate"]["warning"]:
            score += 0.15

        # Rainfall intensity (mm/hr average)
        rf = self.history["rainfall"]
        avg_rainfall = np.mean(rf[-60:]) if len(rf) >= 60 else np.mean(rf)
        if avg_rainfall > FLOOD_THRESHOLDS["rainfall_intensity"]["very_heavy"]:
            score += 0.3
        elif avg_rainfall > FLOOD_THRESHOLDS["rainfall_intensity"]["heavy"]:
            score += 0.15

        # Soil moisture
        sm = self.history["soil_moisture"]
        if sm[-1] > FLOOD_THRESHOLDS["soil_moisture"]["critical"]:
            score += 0.2
        elif sm[-1] > FLOOD_THRESHOLDS["soil_moisture"]["saturated"]:
            score += 0.1

        return min(score, 1.0)

    def _evaluate(self, score: float, timestamp: float) -> Optional[Alert]:
        if score < 0.3:
            return None
        if score >= 0.85:
            level = AlertLevel.EMERGENCY
        elif score >= 0.6:
            level = AlertLevel.WARNING
        elif score >= 0.3:
            level = AlertLevel.WATCH
        else:
            return None

        return Alert(
            hazard_type="flood",
            level=level,
            confidence=score,
            timestamp=timestamp,
            station_id="",
            message=f"Flood detection: confidence={score:.2f}, level={level.value}",
        )


# =============================================================================
# FOREST FIRE DETECTION
# =============================================================================

FIRE_THRESHOLDS = {
    "temp_spike_rate": 2.0,
    "temp_absolute": 45.0,
    "humidity_drop_rate": 5.0,
    "humidity_absolute": 20.0,
    "co_ppm": 50.0,
    "co2_spike": 200.0,
}

SENSOR_WEIGHTS = {
    "vision_smoke": 0.30,
    "vision_fire": 0.35,
    "temp_anomaly": 0.15,
    "humidity_drop": 0.10,
    "gas_spike": 0.10,
}

MIN_CONFIRMING_SENSORS = 2


class ForestFireDetector:
    """Multi-sensor forest fire detection with false positive reduction."""

    def __init__(self):
        self.temp_history = []
        self.humidity_history = []
        self.timestamps = []
        self.max_history = 600  # 10 min at 1Hz

    def update(self, temperature: float, humidity: float, co_ppm: float = 0,
               co2_ppm: float = 0, timestamp: float = None) -> Optional[Alert]:
        if timestamp is None:
            timestamp = time.time()

        self.temp_history.append(temperature)
        self.humidity_history.append(humidity)
        self.timestamps.append(timestamp)

        if len(self.timestamps) > self.max_history:
            self.temp_history = self.temp_history[-self.max_history:]
            self.humidity_history = self.humidity_history[-self.max_history:]
            self.timestamps = self.timestamps[-self.max_history:]

        sensor_scores = self._compute_sensor_scores(temperature, humidity, co_ppm, co2_ppm)
        confidence = self._correlate(sensor_scores)
        return self._evaluate(confidence, timestamp, sensor_scores)

    def _compute_sensor_scores(self, temp, humidity, co_ppm, co2_ppm) -> Dict[str, float]:
        scores = {}

        # Temperature analysis
        if len(self.temp_history) >= 2:
            dt = self.timestamps[-1] - self.timestamps[-2]
            if dt > 0:
                temp_rate = (self.temp_history[-1] - self.temp_history[-2]) / (dt / 60.0)
                temp_score = 0.0
                if temp_rate > FIRE_THRESHOLDS["temp_spike_rate"]:
                    temp_score += 0.6
                if temp > FIRE_THRESHOLDS["temp_absolute"]:
                    temp_score += 0.4
                scores["temp_anomaly"] = min(temp_score, 1.0)

        # Humidity analysis
        if len(self.humidity_history) >= 2:
            dt = self.timestamps[-1] - self.timestamps[-2]
            if dt > 0:
                hum_rate = (self.humidity_history[-2] - self.humidity_history[-1]) / (dt / 60.0)
                hum_score = 0.0
                if hum_rate > FIRE_THRESHOLDS["humidity_drop_rate"]:
                    hum_score += 0.6
                if humidity < FIRE_THRESHOLDS["humidity_absolute"]:
                    hum_score += 0.4
                scores["humidity_drop"] = min(hum_score, 1.0)

        # Gas analysis
        gas_score = 0.0
        if co_ppm > FIRE_THRESHOLDS["co_ppm"]:
            gas_score += 0.5
        if co2_ppm > FIRE_THRESHOLDS["co2_spike"]:
            gas_score += 0.5
        if gas_score > 0:
            scores["gas_spike"] = min(gas_score, 1.0)

        return scores

    def _correlate(self, sensor_scores: Dict[str, float]) -> float:
        active_sensors = [k for k, v in sensor_scores.items() if v > 0.3]
        if len(active_sensors) < MIN_CONFIRMING_SENSORS:
            return 0.0

        weighted = sum(SENSOR_WEIGHTS.get(k, 0.05) * v for k, v in sensor_scores.items())
        agreement_bonus = min(len(active_sensors) - 1, 3) * 0.05
        return min(weighted + agreement_bonus, 1.0)

    def _evaluate(self, confidence: float, timestamp: float,
                  sensor_scores: Dict[str, float]) -> Optional[Alert]:
        if confidence < 0.3:
            return None
        if confidence >= 0.85:
            level = AlertLevel.EMERGENCY
        elif confidence >= 0.6:
            level = AlertLevel.WARNING
        else:
            level = AlertLevel.WATCH

        return Alert(
            hazard_type="forest_fire",
            level=level,
            confidence=confidence,
            timestamp=timestamp,
            station_id="",
            message=f"Forest fire detection: confidence={confidence:.2f}, active_sensors={list(sensor_scores.keys())}",
            details={"sensor_scores": sensor_scores},
        )


# =============================================================================
# AIR QUALITY INDEX
# =============================================================================

AQI_BREAKPOINTS = {
    "PM2.5_24hr": [
        (0, 30, 0, 50), (31, 60, 51, 100), (61, 90, 101, 200),
        (91, 120, 201, 300), (121, 250, 301, 400), (251, 500, 401, 500),
    ],
    "PM10_24hr": [
        (0, 50, 0, 50), (51, 100, 51, 100), (101, 250, 101, 200),
        (251, 350, 201, 300), (351, 430, 301, 400), (431, 530, 401, 500),
    ],
    "NO2_24hr": [
        (0, 40, 0, 50), (41, 80, 51, 100), (81, 180, 101, 200),
        (181, 280, 201, 300), (281, 400, 301, 400), (401, 530, 401, 500),
    ],
    "SO2_24hr": [
        (0, 40, 0, 50), (41, 80, 51, 100), (81, 380, 101, 200),
        (381, 800, 201, 300), (801, 1600, 301, 400), (1601, 2100, 401, 500),
    ],
    "CO_8hr": [
        (0, 1, 0, 50), (1.1, 2, 51, 100), (2.1, 10, 101, 200),
        (10.1, 17, 201, 300), (17.1, 34, 301, 400), (34.1, 50, 401, 500),
    ],
    "O3_8hr": [
        (0, 50, 0, 50), (51, 100, 51, 100), (101, 168, 101, 200),
        (169, 208, 201, 300), (209, 748, 301, 400), (749, 999, 401, 500),
    ],
}


def compute_sub_index(pollutant: str, concentration: float) -> float:
    breakpoints = AQI_BREAKPOINTS.get(pollutant, [])
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= concentration <= c_high:
            return ((i_high - i_low) / (c_high - c_low)) * (concentration - c_low) + i_low
    return 500.0


def compute_aqi(readings: Dict[str, float]) -> Dict:
    sub_indices = {}
    for pollutant, conc in readings.items():
        key = f"{pollutant}_24hr" if f"{pollutant}_24hr" in AQI_BREAKPOINTS else pollutant
        if key in AQI_BREAKPOINTS:
            sub_indices[pollutant] = compute_sub_index(key, conc)

    aqi = max(sub_indices.values()) if sub_indices else 0
    dominant = max(sub_indices, key=sub_indices.get) if sub_indices else "PM2.5"

    categories = [
        ("Good", 0, 50), ("Satisfactory", 51, 100), ("Moderately Polluted", 101, 200),
        ("Poor", 201, 300), ("Very Poor", 301, 400), ("Severe", 401, 500),
    ]
    category = "Good"
    for name, low, high in categories:
        if low <= aqi <= high:
            category = name
            break

    return {"aqi": round(aqi), "category": category, "dominant_pollutant": dominant,
            "sub_indices": sub_indices}


# =============================================================================
# LANDSLIDE DETECTION
# =============================================================================

LANDSLIDE_THRESHOLDS = {
    "rainfall_accumulation": {
        "24hr_warning": 100.0, "24hr_critical": 150.0,
        "48hr_warning": 200.0, "72hr_warning": 300.0,
    },
    "rainfall_intensity": {"1hr_warning": 30.0, "1hr_critical": 50.0},
    "soil_moisture_depth": {"surface_saturated": 45.0, "deep_saturated": 40.0},
    "vibration_rms": {"microseismic": 0.001, "warning": 0.01, "critical": 0.05},
    "tilt_rate": {"warning": 0.5, "critical": 2.0},
    "displacement_rate": {"warning": 5.0, "critical": 20.0},
}


class LandslideDetector:
    """Multi-parameter landslide risk assessment."""

    def __init__(self):
        self.rain_buffer = []
        self.vibration_buffer = []

    def update(self, rain_24h: float, rain_48h: float, rain_72h: float, rain_1hr: float,
               soil_moisture: float, vibration_rms: float, tilt_rate: float,
               displacement_rate: float, timestamp: float = None) -> Optional[Alert]:
        if timestamp is None:
            timestamp = time.time()

        score = self._compute_score(rain_24h, rain_48h, rain_72h, rain_1hr,
                                    soil_moisture, vibration_rms, tilt_rate, displacement_rate)
        return self._evaluate(score, timestamp)

    def _compute_score(self, rain_24h, rain_48h, rain_72h, rain_1hr,
                       soil_moisture, vibration_rms, tilt_rate, displacement_rate) -> float:
        score = 0.0

        # Rainfall (40%)
        rain_score = 0.0
        t = LANDSLIDE_THRESHOLDS["rainfall_accumulation"]
        if rain_72h > t["72hr_warning"]:
            rain_score += 0.3
        if rain_48h > t["48hr_warning"]:
            rain_score += 0.3
        if rain_24h > t["24hr_critical"]:
            rain_score += 0.25
        if rain_1hr > LANDSLIDE_THRESHOLDS["rainfall_intensity"]["1hr_critical"]:
            rain_score += 0.15
        score += min(rain_score, 1.0) * 0.40

        # Soil moisture (25%)
        if soil_moisture > LANDSLIDE_THRESHOLDS["soil_moisture_depth"]["deep_saturated"]:
            score += 0.25
        elif soil_moisture > LANDSLIDE_THRESHOLDS["soil_moisture_depth"]["surface_saturated"]:
            score += 0.15

        # Vibration (20%)
        if vibration_rms > LANDSLIDE_THRESHOLDS["vibration_rms"]["critical"]:
            score += 0.20
        elif vibration_rms > LANDSLIDE_THRESHOLDS["vibration_rms"]["warning"]:
            score += 0.12
        elif vibration_rms > LANDSLIDE_THRESHOLDS["vibration_rms"]["microseismic"]:
            score += 0.05

        # Tilt + displacement (15%)
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

    def _evaluate(self, score: float, timestamp: float) -> Optional[Alert]:
        if score < 0.3:
            return None
        if score >= 0.85:
            level = AlertLevel.EMERGENCY
        elif score >= 0.6:
            level = AlertLevel.WARNING
        else:
            level = AlertLevel.WATCH

        return Alert(
            hazard_type="landslide",
            level=level,
            confidence=score,
            timestamp=timestamp,
            station_id="",
            message=f"Landslide risk: confidence={score:.2f}, level={level.value}",
        )


# =============================================================================
# INDUSTRIAL SAFETY
# =============================================================================

GAS_THRESHOLDS = {
    "H2S": (10, 15, 100), "NH3": (25, 35, 300), "Cl2": (0.5, 1, 10),
    "SO2": (2, 5, 100), "CO": (25, 100, 1200), "NO2": (1, 5, 20),
}

INCIDENT_SIGNATURES = {
    "chemical_leak": {"required": ["gas_spike", "pressure_drop"], "optional": ["temp_change"], "min_required": 2},
    "industrial_fire": {"required": ["temp_spike"], "optional": ["smoke", "co_spike", "pressure_change"], "min_required": 2},
    "gas_accumulation": {"required": ["gas_rising", "low_ventilation"], "optional": ["temp_rising"], "min_required": 2},
    "pressure_vessel_failure": {"required": ["pressure_anomaly", "temp_anomaly"], "optional": ["vibration"], "min_required": 2},
}


class IndustrialSafetyDetector:
    """Gas leak detection and multi-parameter incident correlation."""

    def __init__(self):
        self.baselines = {}

    def detect_gas_spike(self, gas_name: str, current_conc: float,
                         dt: float = 1.0) -> Tuple[bool, float]:
        if gas_name not in self.baselines:
            self.baselines[gas_name] = current_conc
            return False, 0.0

        baseline = self.baselines[gas_name]
        rate_of_rise = (current_conc - baseline) / dt

        alpha = 0.001
        self.baselines[gas_name] = alpha * current_conc + (1 - alpha) * baseline

        thresholds = GAS_THRESHOLDS.get(gas_name, (100, 200, 1000))
        twa, stel, idlh = thresholds

        score = 0.0
        if current_conc > idlh:
            score = 1.0
        elif current_conc > stel:
            score = 0.8
        elif current_conc > twa:
            score = 0.5
        elif rate_of_rise > 5.0:
            score = 0.4

        return score > 0, score

    def detect_incident(self, observations: Dict[str, bool]) -> Dict[str, float]:
        results = {}
        for incident_type, signature in INCIDENT_SIGNATURES.items():
            required_met = sum(1 for p in signature["required"] if observations.get(p, False))
            optional_met = sum(1 for p in signature["optional"] if observations.get(p, False))

            if required_met >= min(signature["min_required"], len(signature["required"])):
                confidence = (required_met / len(signature["required"])) * 0.7 + \
                            (optional_met / max(len(signature["optional"]), 1)) * 0.3
                results[incident_type] = min(confidence, 1.0)

        return results


# =============================================================================
# ANOMALY DETECTION
# =============================================================================

class AdaptiveAnomalyDetector:
    """Per-sensor adaptive anomaly detection (EWMA + IQR methods)."""

    def __init__(self, window_size: int = 100, z_threshold: float = 3.0):
        self.window_size = window_size
        self.z_threshold = z_threshold
        self.buffer = []
        self.ewma_mean = None
        self.ewma_var = None

    def update(self, value: float) -> Tuple[bool, float]:
        self.buffer.append(value)
        if len(self.buffer) > self.window_size:
            self.buffer.pop(0)

        # EWMA
        alpha = 0.1
        if self.ewma_mean is None:
            self.ewma_mean = value
            self.ewma_var = 0
        else:
            self.ewma_mean = alpha * value + (1 - alpha) * self.ewma_mean
            self.ewma_var = alpha * (value - self.ewma_mean) ** 2 + (1 - alpha) * self.ewma_var

        std = max(np.sqrt(self.ewma_var), 1e-10)
        z_score = abs(value - self.ewma_mean) / std
        return z_score > self.z_threshold, z_score

    def iqr_check(self, value: float) -> Tuple[bool, float]:
        if len(self.buffer) < 20:
            return False, 0.0
        q1, q3 = np.percentile(self.buffer, [25, 75])
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        is_anomaly = value < lower or value > upper
        distance = max(lower - value, value - upper, 0)
        return is_anomaly, distance / (iqr + 1e-10)


class SlidingWindowAnalyzer:
    """Generic sliding window temporal analysis."""

    def __init__(self, window_size: int):
        self.window_size = window_size
        self.buffer = []

    def add(self, value: float):
        self.buffer.append(value)
        if len(self.buffer) > self.window_size:
            self.buffer.pop(0)

    def analyze(self) -> Optional[Dict]:
        if len(self.buffer) < self.window_size:
            return None
        arr = np.array(self.buffer)
        return {
            "mean": float(np.mean(arr)),
            "std": float(np.std(arr)),
            "min": float(np.min(arr)),
            "max": float(np.max(arr)),
            "trend": float(np.polyfit(range(len(arr)), arr, 1)[0]),
            "rate_of_change": float(arr[-1] - arr[0]) / self.window_size,
            "percentile_95": float(np.percentile(arr, 95)),
            "percentile_5": float(np.percentile(arr, 5)),
        }


# =============================================================================
# CUSUM CHANGE DETECTION
# =============================================================================

class CUSUMDetector:
    """Cumulative Sum control chart for spike/change detection."""

    def __init__(self, threshold: float = 4.0, drift: float = 1.0):
        self.threshold = threshold
        self.drift = drift
        self.pos_cusum = 0.0
        self.neg_cusum = 0.0

    def update(self, value: float, baseline_mean: float, baseline_std: float) -> Tuple[bool, float]:
        if baseline_std == 0:
            return False, 0.0

        standardized = (value - baseline_mean) / baseline_std
        self.pos_cusum = max(0, self.pos_cusum + standardized - self.drift)
        self.neg_cusum = max(0, self.neg_cusum - standardized - self.drift)

        detected = self.pos_cusum > self.threshold or self.neg_cusum > self.threshold
        return detected, max(self.pos_cusum, self.neg_cusum)

    def reset(self):
        self.pos_cusum = 0.0
        self.neg_cusum = 0.0


# =============================================================================
# MULTI-HAZARD FUSION ENGINE
# =============================================================================

class MultiHazardFusionEngine:
    """
    Correlates alerts from multiple hazard detectors to identify
    cascading/multi-hazard events.
    """

    MULTI_HAZARD_PATTERNS = {
        "flood_landslide": {
            "hazards": ["flood", "landslide"],
            "time_window": 3600,  # 1 hour
            "confidence_boost": 0.15,
        },
        "drought_fire": {
            "hazards": ["drought", "forest_fire"],
            "time_window": 86400,  # 24 hours
            "confidence_boost": 0.10,
        },
        "industrial_flood": {
            "hazards": ["industrial", "flood"],
            "time_window": 7200,  # 2 hours
            "confidence_boost": 0.20,
        },
    }

    def __init__(self):
        self.recent_alerts: List[Alert] = []
        self.time_window = 3600

    def add_alert(self, alert: Alert):
        self.recent_alerts.append(alert)
        cutoff = alert.timestamp - self.time_window
        self.recent_alerts = [a for a in self.recent_alerts if a.timestamp > cutoff]

    def check_multi_hazard(self) -> List[Dict]:
        results = []
        hazard_types = {a.hazard_type for a in self.recent_alerts}

        for pattern_name, pattern in self.MULTI_HAZARD_PATTERNS.items():
            if all(h in hazard_types for h in pattern["hazards"]):
                relevant = [a for a in self.recent_alerts if a.hazard_type in pattern["hazards"]]
                max_conf = max(a.confidence for a in relevant)
                boosted = min(max_conf + pattern["confidence_boost"], 1.0)

                results.append({
                    "pattern": pattern_name,
                    "confidence": boosted,
                    "alerts": [a.message for a in relevant],
                    "recommendation": f"Multi-hazard event detected: {pattern_name}. "
                                      "Activate combined response protocol.",
                })

        return results


# =============================================================================
# DEMO / TEST
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("Multi-Hazard Detection Engine — Demo")
    print("=" * 60)

    # Flood detection demo
    print("\n--- Flood Detection ---")
    fd = FloodDetector()
    for i in range(30):
        alert = fd.update(
            water_level=100 + i * 2,
            rainfall=50 + i * 3,
            soil_moisture=40 + i * 0.5,
            timestamp=time.time() + i,
        )
        if alert:
            print(f"  [{alert.level.value.upper()}] {alert.message}")

    # Forest fire demo
    print("\n--- Forest Fire Detection ---")
    ffd = ForestFireDetector()
    for i in range(20):
        alert = ffd.update(
            temperature=30 + i * 1.5,
            humidity=60 - i * 2,
            co_ppm=10 + i * 5,
            co2_ppm=100 + i * 20,
            timestamp=time.time() + i,
        )
        if alert:
            print(f"  [{alert.level.value.upper()}] {alert.message}")

    # AQI demo
    print("\n--- Air Quality Index ---")
    readings = {"PM2.5": 85, "PM10": 120, "NO2": 45, "SO2": 15, "CO": 2.5, "O3": 90}
    result = compute_aqi(readings)
    print(f"  AQI: {result['aqi']} ({result['category']})")
    print(f"  Dominant pollutant: {result['dominant_pollutant']}")

    # Landslide demo
    print("\n--- Landslide Detection ---")
    ld = LandslideDetector()
    alert = ld.update(
        rain_24h=160, rain_48h=220, rain_72h=310, rain_1hr=55,
        soil_moisture=48, vibration_rms=0.015, tilt_rate=1.2,
        displacement_rate=8.0,
    )
    if alert:
        print(f"  [{alert.level.value.upper()}] {alert.message}")

    # Anomaly detection demo
    print("\n--- Anomaly Detection ---")
    ad = AdaptiveAnomalyDetector()
    np.random.seed(42)
    for i in range(100):
        val = 50 + np.random.normal(0, 2)
        ad.update(val)
    # Inject anomaly
    is_anomaly, z = ad.update(85.0)
    print(f"  Anomaly detected: {is_anomaly}, z-score: {z:.2f}")

    print("\n" + "=" * 60)
    print("Demo complete.")
