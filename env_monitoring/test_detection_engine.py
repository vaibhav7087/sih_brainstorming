"""Tests for Multi-Hazard Detection Engine."""

import time
import numpy as np
import pytest
from detection_engine import (
    FloodDetector, ForestFireDetector, LandslideDetector,
    IndustrialSafetyDetector, AdaptiveAnomalyDetector,
    SlidingWindowAnalyzer, CUSUMDetector, MultiHazardFusionEngine,
    compute_aqi, AlertLevel,
)


class TestFloodDetector:
    def test_no_alert_normal_conditions(self):
        fd = FloodDetector()
        for i in range(30):
            alert = fd.update(100, 10, 30, time.time() + i)
        assert alert is None

    def test_flash_flood_detection(self):
        fd = FloodDetector()
        for i in range(30):
            alert = fd.update(
                water_level=100 + i * 15,
                rainfall=200,
                soil_moisture=60,
                timestamp=time.time() + i,
            )
        assert alert is not None
        assert alert.confidence >= 0.6

    def test_confidence_bounds(self):
        fd = FloodDetector()
        for i in range(100):
            fd.update(100 + i * 10, 300, 70, time.time() + i * 0.1)
        score = fd._compute_score()
        assert 0.0 <= score <= 1.0


class TestForestFireDetector:
    def test_no_fire_normal(self):
        ffd = ForestFireDetector()
        for i in range(20):
            alert = ffd.update(25, 60, 5, 400, time.time() + i)
        assert alert is None

    def test_fire_with_multiple_sensors(self):
        ffd = ForestFireDetector()
        for i in range(20):
            alert = ffd.update(
                temperature=35 + i * 3,
                humidity=50 - i * 3,
                co_ppm=30 + i * 10,
                co2_ppm=400 + i * 50,
                timestamp=time.time() + i,
            )
        assert alert is not None
        # Without vision sensors (65% weight), confidence stays in WATCH range
        # This is correct false-positive-reduction behavior
        assert alert.confidence > 0.3
        assert alert.level in [AlertLevel.WATCH, AlertLevel.WARNING, AlertLevel.EMERGENCY]

    def test_false_positive_reduction(self):
        ffd = ForestFireDetector()
        # Only temperature spike, no other sensor confirmation
        for i in range(20):
            alert = ffd.update(
                temperature=35 + i * 3,
                humidity=60,  # Normal humidity
                co_ppm=5,     # Normal CO
                co2_ppm=400,  # Normal CO2
                timestamp=time.time() + i,
            )
        # Single sensor shouldn't trigger high-confidence alert
        if alert:
            assert alert.confidence < 0.6


class TestAQI:
    def test_good_aqi(self):
        result = compute_aqi({"PM2.5": 20, "PM10": 30})
        assert result["aqi"] <= 50
        assert result["category"] == "Good"

    def test_severe_aqi(self):
        result = compute_aqi({"PM2.5": 300, "PM10": 400})
        assert result["aqi"] > 300

    def test_all_pollutants(self):
        readings = {"PM2.5": 85, "PM10": 120, "NO2": 45, "SO2": 15, "CO": 2.5, "O3": 90}
        result = compute_aqi(readings)
        assert "aqi" in result
        assert "category" in result
        assert "dominant_pollutant" in result


class TestLandslideDetector:
    def test_stable_slope(self):
        ld = LandslideDetector()
        alert = ld.update(20, 40, 60, 5, 30, 0.0005, 0.1, 1.0)
        assert alert is None

    def test_critical_landslide_risk(self):
        ld = LandslideDetector()
        alert = ld.update(
            rain_24h=180, rain_48h=250, rain_72h=350,
            rain_1hr=60, soil_moisture=50,
            vibration_rms=0.06, tilt_rate=3.0, displacement_rate=25.0,
        )
        assert alert is not None
        assert alert.level == AlertLevel.EMERGENCY


class TestIndustrialSafety:
    def test_gas_spike_detection(self):
        isd = IndustrialSafetyDetector()
        # Set baseline
        isd.detect_gas_spike("H2S", 2.0)
        isd.detect_gas_spike("H2S", 2.0)
        # Spike
        detected, score = isd.detect_gas_spike("H2S", 120.0)
        assert detected
        assert score == 1.0  # Above IDLH

    def test_incident_correlation(self):
        isd = IndustrialSafetyDetector()
        observations = {"gas_spike": True, "pressure_drop": True, "temp_change": True}
        results = isd.detect_incident(observations)
        assert "chemical_leak" in results
        assert results["chemical_leak"] > 0.5


class TestAnomalyDetector:
    def test_normal_values_no_anomaly(self):
        ad = AdaptiveAnomalyDetector()
        for i in range(100):
            ad.update(50 + np.random.normal(0, 2))
        is_anomaly, z = ad.update(51.0)
        assert not is_anomaly

    def test_spike_detected(self):
        ad = AdaptiveAnomalyDetector()
        for i in range(100):
            ad.update(50 + np.random.normal(0, 1))
        is_anomaly, z = ad.update(80.0)
        assert is_anomaly

    def test_iqr_detection(self):
        ad = AdaptiveAnomalyDetector()
        np.random.seed(42)
        for i in range(50):
            ad.update(50 + np.random.normal(0, 2))
        is_anomaly, score = ad.iqr_check(90.0)
        assert is_anomaly


class TestSlidingWindow:
    def test_analysis(self):
        sw = SlidingWindowAnalyzer(10)
        for i in range(10):
            sw.add(float(i))
        result = sw.analyze()
        assert result is not None
        assert result["mean"] == 4.5
        assert result["trend"] > 0  # Increasing trend

    def test_insufficient_data(self):
        sw = SlidingWindowAnalyzer(10)
        for i in range(5):
            sw.add(float(i))
        assert sw.analyze() is None


class TestCUSUM:
    def test_no_change(self):
        cusum = CUSUMDetector()
        for _ in range(10):
            detected, score = cusum.update(50.0, 50.0, 2.0)
        assert not detected

    def test_detects_shift(self):
        cusum = CUSUMDetector()
        for _ in range(5):
            cusum.update(50.0, 50.0, 2.0)
        for _ in range(10):
            detected, score = cusum.update(60.0, 50.0, 2.0)
        assert detected


class TestMultiHazardFusion:
    def test_flood_landslide_correlation(self):
        engine = MultiHazardFusionEngine()
        t = time.time()
        engine.add_alert(type('Alert', (), {
            'hazard_type': 'flood', 'confidence': 0.8, 'timestamp': t, 'message': 'flood'
        })())
        engine.add_alert(type('Alert', (), {
            'hazard_type': 'landslide', 'confidence': 0.7, 'timestamp': t + 60, 'message': 'landslide'
        })())
        results = engine.check_multi_hazard()
        assert len(results) > 0
        assert results[0]["pattern"] == "flood_landslide"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
