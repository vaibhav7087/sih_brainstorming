# Implementation Plan
## PRAYAS — Environmental Intelligence Network
### SIH 2026 | Problem Statement 26178

---

## 1. Executive Summary

This document outlines the technical implementation plan for PRAYAS, an edge-AI-powered environmental monitoring network. The plan covers hardware assembly, AI model development, software architecture, and deployment strategy across a phased approach from prototype to national scale.

---

## 2. Team Roles (6 Members)

| Role | Responsibility | Key Deliverables |
|------|---------------|------------------|
| **Team Lead / Architect** | System design, integration, demo | Architecture docs, final demo |
| **Hardware Engineer** | Sensor nodes, PCB, enclosure, power | Working sensor nodes |
| **Edge AI Engineer** | TFLite models, anomaly detection | Quantized models, inference pipeline |
| **Backend Developer** | Cloud platform, APIs, database | ThingsBoard setup, MQTT broker |
| **Frontend Developer** | Dashboard, GIS maps, mobile app | Grafana dashboard, Flutter app |
| **Research & Documentation** | XAI, blockchain, papers, presentation | Research docs, PPT, pitch |

---

## 3. Technology Stack

### 3.1 Hardware Stack

| Component | Model | Quantity (Prototype) | Cost (INR) |
|-----------|-------|---------------------|------------|
| MCU | ESP32-S3-WROOM-1 (N16R8) | 5 | ₹3,750 |
| LoRa Module | SX1262 SPI (865–867 MHz India ISM)* | 5 | ₹3,000 |
| Temp/Humidity/Press | BME680 | 5 | ₹2,250 |
| Accelerometer | LIS3DH Triple-Axis | 5 | ₹600 |
| Soil Moisture | Capacitive Soil Probe v1.2 | 3 | ₹1,350 |
| PM2.5/PM10 | PMS5003 Laser Dust Sensor | 3 | ₹6,600 |
| Gas Sensors | MQ-135 + MQ-2 combo | 3 | ₹540 |
| Water Level | JSN-SR04T Waterproof Ultrasonic | 3 | ₹2,400 |
| Solar Panel | 5W / 6V Monocrystalline | 5 | ₹3,500 |
| Battery | LiFePO4 3.2V 3000mAh (Flame-safe) | 5 | ₹3,250 |
| Charge Controller | CN3722 MPPT Solar Charger | 5 | ₹1,000 |
| Enclosure | IP67 150×100×70mm Polycarbonate | 5 | ₹3,000 |
| Connectors | M12 4-pin IP67 Waterproof Glands | 10 | ₹1,800 |
| Antenna | SMA 865MHz Whip Antenna (3dBi) | 5 | ₹750 |
| PCB + Passives | 2-Layer Custom PCB + TVS Diodes | 5 | ₹1,500 |
| Gateway | Raspberry Pi 5 (8GB) + Power Supply | 1 | ₹9,500 |
| LoRa Concentrator | Waveshare SX1302 LoRaWAN Gateway HAT | 1 | ₹6,500 |
| **Total Prototype Hardware** | | | **₹51,340** |

*\*Note: Initial breadboard testing used SX1278 (433MHz) modules on bench; production deployment strictly uses legal SX1262 on 865–867 MHz India ISM band.*

### 3.2 Software Stack

| Layer | Technology | License |
|-------|------------|---------|
| Edge Firmware | ESP-IDF (C/C++) | Apache 2.0 |
| Edge AI Runtime | TensorFlow Lite Micro | Apache 2.0 |
| Model Training | PyTorch + ONNX | BSD/Apache 2.0 |
| FL Framework | Flower (flwr) | Apache 2.0 |
| MQTT Broker | EMQX | Apache 2.0 (CE) |
| IoT Platform | ThingsBoard CE | Apache 2.0 |
| Time-Series DB | TimescaleDB | Apache 2.0 |
| Spatial DB | PostGIS | GPL 2.0 |
| Dashboard | Grafana OSS | AGPL 3.0 |
| Maps | MapLibre GL JS | BSD 3 |
| Mobile App | Flutter | BSD 3 |
| XAI | SHAP | MIT |
| Blockchain | IOTA SDK | Apache 2.0 |
| Digital Twin | CesiumJS | Apache 2.0 |
| Containers | Docker + K3s | Apache 2.0 |
| CI/CD | GitHub Actions | Free tier |
| **Total Software Cost** | | **₹0 (all open-source)** |

---

## 4. Phased Implementation Plan

### Phase 1: Foundation (Week 1-2)

#### Week 1: Hardware Assembly + Software Setup

**Day 1-2: Hardware Procurement & Initial Assembly**
- [ ] Order all components from Amazon/Robu/EdgeSemaphore
- [ ] Set up ESP-IDF development environment
- [ ] Flash ESP32-S3 with test firmware
- [ ] Test BME680 I2C communication
- [ ] Test LIS3DH accelerometer readings
- [ ] Test PMS5003 UART communication
- [ ] Test LoRa SX1278 module communication

**Day 3-4: Sensor Node Assembly**
- [ ] Solder sensor PCB (ESP32 + BME680 + LIS3DH + LoRa)
- [ ] Connect PMS5003 via UART
- [ ] Connect MQ-135/MQ-2 via ADC
- [ ] Wire solar charge controller (CN3722)
- [ ] Assemble LiFePO4 battery pack
- [ ] Mount in IP67 enclosure
- [ ] Weatherproof all connectors

**Day 5-7: Software Infrastructure Setup**
- [ ] Set up EMQX MQTT broker on cloud VM
- [ ] Install ThingsBoard CE on Docker
- [ ] Configure TimescaleDB for time-series storage
- [ ] Set up Grafana with MapLibre plugin
- [ ] Create basic IoT dashboard template
- [ ] Set up GitHub repository with CI/CD

#### Week 2: Basic Sensor Node Firmware

**Day 8-10: ESP32 Firmware Development**
- [ ] Implement FreeRTOS task architecture:
  - `sensor_read` task (Core 0)
  - `inference` task (Core 1)
  - `lora_tx` task
  - `power_manager` task
  - `data_logger` task
- [ ] Implement I2C drivers for BME680, LIS3DH
- [ ] Implement UART driver for PMS5003
- [ ] Implement ADC driver for MQ sensors
- [ ] Implement GPIO power switching for analog sensors
- [ ] Implement deep sleep mode (10μA target)

**Day 11-14: Communication & Data Pipeline**
- [ ] Implement LoRa binary payload encoding (12-byte compact format)
- [ ] Implement MQTT publishing via gateway
- [ ] Create sensor data JSON schema
- [ ] Implement store-and-forward (7-day SPI flash buffer)
- [ ] Test end-to-end: Sensor → LoRa → Gateway → MQTT → ThingsBoard
- [ ] Validate data flow on Grafana dashboard

---

### Phase 2: AI Model Development (Week 3-4)

#### Week 3: Data Collection + Model Training

**Day 15-17: Data Collection**
- [ ] Deploy 3 sensor nodes in different locations
- [ ] Collect 72 hours of baseline data
- [ ] Download IMD historical rainfall data
- [ ] Download CPCB air quality historical data
- [ ] Download INDOFLOODS dataset for flood patterns
- [ ] Create synthetic anomaly data for training

**Day 18-21: Model Development**
- [ ] Implement data preprocessing pipeline:
  - Statistical features: mean, MAD, variance, peak
  - Frequency features: dominant frequency, spectral energy
  - Temporal features: rate of change, moving average
- [ ] Train autoencoder anomaly detector (6 inputs → 4 bottleneck → 6 outputs)
- [ ] Train MLP hazard classifier (supervised, 5 classes)
- [ ] Implement threshold heuristic rules (fast path)
- [ ] Implement hybrid decision: rules → autoencoder → MLP
- [ ] Validate accuracy >90% on test data

#### Week 4: Model Optimization + Deployment

**Day 22-24: Model Quantization**
- [ ] Export PyTorch model to ONNX
- [ ] Apply post-training quantization (INT8)
- [ ] Validate quantized model accuracy (<2% drop)
- [ ] Convert to TensorFlow Lite format
- [ ] Test on ESP32-S3 using TFLite Micro
- [ ] Benchmark inference latency (<1ms target)

**Day 25-28: Edge Deployment**
- [ ] Integrate TFLite Micro into ESP32 firmware
- [ ] Implement ring buffer for inference window
- [ ] Implement anomaly score calculation
- [ ] Implement alert threshold logic
- [ ] Test hybrid detection pipeline end-to-end
- [ ] Create model OTA update mechanism

---

### Phase 3: Dashboard & Alert System (Week 5-6)

#### Week 5: Web Dashboard

**Day 29-31: Dashboard Development**
- [ ] Set up Grafana with PostGIS data source
- [ ] Create sensor health monitoring panel
- [ ] Create real-time sensor readings panel
- [ ] Create GIS map layer with MapLibre
- [ ] Create risk heatmap visualization
- [ ] Create historical trend charts
- [ ] Create alert history panel

**Day 32-35: Alert Engine**
- [ ] Implement 4-tier alert classification
- [ ] Implement confidence scoring algorithm
- [ ] Implement auto-escalation logic (15/30/60 min)
- [ ] Implement SMS gateway integration
- [ ] Implement push notification (FCM)
- [ ] Implement WhatsApp bot (basic)
- [ ] Create alert acknowledgment workflow

#### Week 6: Mobile App

**Day 36-38: Flutter App Development**
- [ ] Set up Flutter project with Hive (offline storage)
- [ ] Implement sensor list view
- [ ] Implement real-time data display
- [ ] Implement alert notification view
- [ ] Implement GIS map view
- [ ] Implement offline mode (cached data)

**Day 39-42: Integration Testing**
- [ ] Test mobile push notifications
- [ ] Test offline data sync
- [ ] Test multi-language support (Hindi, English)
- [ ] End-to-end integration test
- [ ] Performance testing (latency, throughput)
- [ ] Security audit (TLS, encryption)

---

### Phase 4: Innovation Features (Week 7-8)

#### Week 7: XAI + Federated Learning

**Day 43-45: Explainable AI**
- [ ] Integrate SHAP into inference pipeline
- [ ] Implement SHAP waterfall visualization
- [ ] Create "Why this alert?" explanation panel
- [ ] Show top contributing features per alert
- [ ] Create feature importance dashboard
- [ ] Test XAI explanations on real alerts

**Day 46-49: Federated Learning**
- [ ] Set up Flower FL server on cloud
- [ ] Implement FL client on Raspberry Pi 5 Gateway (aggregating node telemetry)
- [ ] Implement FedAvg aggregation
- [ ] Test FL training across 3 nodes / gateways
- [ ] Validate privacy (no raw data shared)
- [ ] Create FL training progress dashboard

#### Week 8: Digital Twin + Blockchain

**Day 50-52: Digital Twin**
- [ ] Set up CesiumJS 3D globe
- [ ] Load sensor locations on 3D map
- [ ] Implement real-time sensor data overlay
- [ ] Create flood simulation visualization
- [ ] Create fire spread visualization
- [ ] Integrate with MQTT real-time feed

**Day 53-56: Blockchain Provenance**
- [ ] Set up IOTA Tangle testnet
- [ ] Implement sensor data anchoring (Merkle tree)
- [ ] Create data integrity verification endpoint
- [ ] Create "Verify Data" UI panel
- [ ] Test tamper detection
- [ ] Document blockchain architecture

---

### Phase 5: Demo Preparation (Week 9-10)

#### Week 9: Final Integration

**Day 57-59: System Integration**
- [ ] Full system integration test
- [ ] Load testing (100+ sensor readings)
- [ ] Failover testing (network outage simulation)
- [ ] Battery life validation
- [ ] Outdoor field test (24-hour)
- [ ] Fix critical bugs

**Day 60-63: Demo Environment**
- [ ] Set up demo station at venue
- [ ] Deploy 3 sensor nodes with different hazards
- [ ] Create live demo script
- [ ] Prepare backup video demo
- [ ] Create automated demo flow
- [ ] Test on venue network

#### Week 10: Presentation

**Day 64-66: Documentation**
- [ ] Write PRD document (final)
- [ ] Write implementation plan (final)
- [ ] Write explain.md (simple language)
- [ ] Create architecture diagrams
- [ ] Create cost analysis spreadsheet
- [ ] Create research references

**Day 67-70: Pitch Preparation**
- [ ] Create 7-slide presentation
- [ ] Practice 6-minute pitch
- [ ] Prepare Q&A answers (16 anticipated questions)
- [ ] Rehearse demo 10+ times
- [ ] Prepare backup plan for demo failure
- [ ] Final team coordination

---

## 5. Key Technical Decisions

### 5.1 Why ESP32-S3 over Raspberry Pi for Tier 1?

| Factor | ESP32-S3 | Raspberry Pi |
|--------|----------|-------------|
| Cost | ₹750 | ₹5,500 |
| Power (active) | 0.25W | 5-12W |
| Power (sleep) | 10μA (0.033mW) | None (always-on) |
| Battery autonomy | 14+ days | Hours |
| Operating temp | -40°C to 85°C | 0°C to 70°C |
| TFLite Micro | Native support | Full TFLite |
| Size | 20×50mm | 85×56mm |

**Decision**: ESP32-S3 for Tier 1 (cost, power, temperature). Raspberry Pi for Tier 2 gateways only.

### 5.2 Why LoRa over NB-IoT for Primary Communication?

| Factor | LoRa | NB-IoT |
|--------|------|--------|
| Module cost | ₹500 | ₹1,500 |
| Recurring cost | ₹0 | ₹200-500/month |
| Range | 2-15km | Carrier dependent |
| Power | Ultra-low | Low |
| Independence | Own gateway | Carrier dependency |
| Offline operation | Full support | Requires carrier |

**Decision**: LoRa primary (zero recurring cost, full control). 4G as gateway uplink only.

### 5.3 Why Hybrid Threshold + ML?

| Approach | Speed | Accuracy | Complexity |
|----------|-------|----------|------------|
| Threshold only | <0.1ms | 80-85% | Very Low |
| ML only | 1-5ms | 91-95% | Medium |
| Hybrid | <0.1ms (fast path) + 1ms (validation) | 93-97% | Medium |

**Decision**: Threshold as fast path (immediate response), ML as validation (reduces false positives). Best of both worlds.

---

## 6. Communication Protocol Design

### 6.1 LoRa Payload Structure (12 bytes)

```
Byte 0:     Node ID (8 bits)
Byte 1:     Boot counter (8 bits)
Byte 2-3:   Temperature × 100 (int16, big-endian)
Byte 4:     Humidity (uint8, 0-100%)
Byte 5-6:   Pressure - 300 (uint16, offset encoding)
Byte 7:     Soil moisture % (uint8)
Byte 8:     PM2.5 concentration (uint8, 0-250)
Byte 9:     Battery voltage × 50 (uint8)
Byte 10:    Anomaly score (uint8, 0-100)
Byte 11:    Alert flags (bit field: flood|fire|landslide|air_quality)
```

**TX Time**: ~200ms at SF10, 125kHz bandwidth

### 6.2 MQTT Topic Hierarchy

```
prayas/{region}/{district}/{node_id}/telemetry
prayas/{region}/{district}/{node_id}/alerts
prayas/{region}/{district}/{node_id}/status
prayas/{region}/{district}/aggregated
prayas/{region}/risk_map
prayas/global/dashboard
```

---

## 7. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Device | Secure boot, encrypted flash |
| Communication | TLS 1.3, AES-256 encryption |
| MQTT | Username/password + TLS |
| API | JWT tokens, rate limiting |
| Database | Encrypted at rest, row-level security |
| Dashboard | OAuth 2.0, RBAC |
| Data | DPDP Act compliant, India residency |
| Audit | Immutable log trail |

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Component | Framework | Coverage Target |
|-----------|-----------|----------------|
| ESP32 firmware | Unity (C) | 80% |
| AI models | pytest | 90% |
| Backend APIs | pytest | 85% |
| Dashboard | Jest | 75% |
| Mobile app | Flutter test | 70% |

### 8.2 Integration Tests

| Test | Method | Duration |
|------|--------|----------|
| Sensor → LoRa → Gateway | Hardware-in-loop | 24 hours |
| Full alert pipeline | Automated script | 2 hours |
| Offline resilience | Network disconnect | 72 hours |
| Battery life | Continuous monitoring | 14 days |

### 8.3 Performance Benchmarks

| Metric | Target | Method |
|--------|--------|--------|
| Edge inference latency | <1ms | Timer on ESP32 |
| Alert delivery (edge) | <100ms | LoRa RTT measurement |
| Alert delivery (cloud) | <5s | MQTT timestamp diff |
| Dashboard refresh | <2s | Grafana polling |
| False positive rate | <5% | 1000 simulated events |
| System uptime | 99.9% | 30-day monitoring |

---

## 9. Budget Summary (Hackathon)

| Category | Cost (INR) |
|----------|------------|
| Hardware components | ₹49,565 |
| Cloud VM (2 months) | ₹4,000 |
| Tools & Software | ₹0 (all open-source) |
| Travel & Logistics | ₹5,000 |
| Contingency (10%) | ₹5,857 |
| **Total** | **₹64,422** |

---

## 10. Risk Mitigation Plan

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Component delivery delay | High | High | Order immediately, use local alternatives |
| Sensor calibration issues | Medium | Medium | Use factory-calibrated sensors, manual calibration |
| LoRa range issues | Medium | Medium | Test at venue, use higher SF, 4G fallback |
| Model accuracy below target | Medium | High | Collect more data, use simpler thresholds |
| Demo failure at venue | Low | Critical | Prepare backup video, test 10+ times |
| WiFi bandwidth issues | Medium | Medium | Use mobile hotspot, local MQTT broker |
| Team member illness | Low | High | Cross-train all roles, document everything |

---

## 11. Deliverables Checklist

### Hackathon Submission
- [ ] Working sensor nodes (minimum 3)
- [ ] Working dashboard (Grafana)
- [ ] Working mobile app (Flutter)
- [ ] Working AI models (edge + cloud)
- [ ] Working alert system (SMS + push)
- [ ] Presentation (7 slides)
- [ ] Demo video (3 minutes)
- [ ] Source code (GitHub)
- [ ] Documentation (PRD, implementation plan, explain.md)
- [ ] Cost analysis

### Post-Hackathon (If Shortlisted)
- [ ] Deploy 15 nodes in pilot village
- [ ] 30-day continuous operation
- [ ] Integration with NDMA/SDMA
- [ ] Community training program
- [ ] Performance validation report

---

*Document Version: 1.0 | Date: September 2026 | PRAYAS Team*
