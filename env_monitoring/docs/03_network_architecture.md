# Agent 3: Communication Protocols & Network Architecture

## Environmental Monitoring Network - Complete Communication Architecture

**Problem Statement 26178**: Resilient, AI-powered environmental monitoring for floods, forest fires, pollution events in India

---

## 1. Executive Summary

This document defines the complete communication and networking architecture for a distributed environmental sensor network spanning India's diverse geography—from Himalayan flood zones to coastal pollution monitoring stations. The architecture prioritizes **resilience** (operation during infrastructure failure), **scalability** (millions of sensors), and **cost-effectiveness** (10-year operational lifecycle).

**Key Design Decisions:**
- **Hybrid LPWAN**: LoRaWAN (rural/remote) + NB-IoT (urban) + Satellite (extreme remote)
- **Hierarchical Mesh Topology**: Self-healing clusters → regional gateways → cloud
- **Edge-First Processing**: Local alerting, data aggregation, store-and-forward
- **MQTT-Centric Cloud Integration**: Via EMQX 5.0 Broker with Redis Streams / TimescaleDB pipeline

---

## 2. IoT Communication Protocol Selection

### 2.1 Protocol Comparison Matrix

| Protocol | Range | Data Rate | Power | Cost/Sensor | Best For India Context |
|----------|-------|-----------|-------|-------------|----------------------|
| **LoRaWAN** | 2-15 km | 0.3-50 kbps | Ultra-low (5-10yr battery) | ₹500-2000 (gateway capex) | Rural flood monitoring, forest fire sensors, remote river gauges |
| **NB-IoT** | 1-10 km (carrier-dependent) | 50-200 kbps | Low (2-5yr battery) | ₹50-150/month SIM | Urban air quality, city flood sensors, industrial pollution |
| **Zigbee** | 10-100 m | 250 kbps | Very low | ₹200-500 | Dense sensor clusters (smart campus, factory) |
| **Wi-Fi** | 50-100 m | 150+ Mbps | High (mains power) | ₹1000-3000 | High-bandwidth urban stations (video, LIDAR) |
| **5G/LTE** | 1-5 km | 10-1000 Mbps | High | ₹200-500/month | Real-time video, high-res imaging, emergency comms |
| **Satellite (LEO)** | Global | 1-10 Mbps | Medium | ₹500-2000/transfer | Extreme remote (Ladakh, Arunachal, Andaman) |
| **Meshtastic LoRa Mesh** | 1-5 km (hop) | 0.3-50 kbps | Ultra-low | ₹200-800 | Disaster-resilient peer-to-peer, off-grid emergency |

### 2.2 Protocol Recommendations by Scenario

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROTOCOL SELECTION DECISION TREE                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Is cellular coverage available?                                        │
│  ├── YES ──► Is sensor mobile or battery-powered?                       │
│  │           ├── Mobile/Battery ──► NB-IoT (stationary)                 │
│  │           │                     LTE-M (mobile vehicles)              │
│  │           └── Mains-powered ──► 5G (high-bandwidth)                  │
│  │                               Wi-Fi (indoor/urban)                   │
│  └── NO ───► Is there line-of-sight to gateway?                         │
│              ├── YES ──► LoRaWAN (direct to gateway)                    │
│              └── NO ───► Is multi-hop feasible?                         │
│                          ├── YES ──► Meshtastic LoRa Mesh               │
│                          └── NO ───► Satellite (Iridium/Starlink)       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 India-Specific Protocol Strategy

**Tier 1 - Urban/Metro Areas (Delhi, Mumbai, Chennai, Kolkata):**
- Primary: NB-IoT via Jio/Airtel (verified coverage)
- Secondary: 5G for high-bandwidth stations
- Edge: LoRaWAN for private campus networks

**Tier 2 - Semi-Urban/Tier-2 Cities:**
- Primary: LoRaWAN (city-owned private network)
- Secondary: NB-IoT (where carrier coverage verified)
- Key: Drive-test coverage before deployment (don't trust carrier maps)

**Tier 3 - Rural/Remote Areas:**
- Primary: LoRaWAN with solar-powered gateways
- Secondary: Meshtastic mesh for disaster-prone zones
- Emergency: Satellite (Iridium SBD) for critical alerts

**Tier 4 - Extreme Remote (Ladakh, Arunachal Pradesh, Andaman & Nicobar):**
- Primary: Satellite IoT (Iridium, Swarm/Starlink)
- Secondary: LoRaWAN mesh with long-range antennas
- Store-and-forward: Local data buffering until satellite pass

### 2.4 LoRaWAN Configuration for India

**Frequency Plan:** India 865-867 MHz (1% duty cycle)
- Sub-band 865.0625 MHz: Channel 1
- Sub-band 865.4025 MHz: Channel 2  
- Sub-band 865.9850 MHz: Channel 3

**Class Selection:**
- **Class A** (default): Battery-powered sensors, 15-min reporting
- **Class B**: Time-critical alerts, synchronized receive windows
- **Class C**: Mains-powered gateways, continuous receive

**Spreading Factor Optimization:**
| SF | Data Rate | Range (Urban) | Range (Rural) | Use Case |
|----|-----------|---------------|---------------|----------|
| SF7 | 5.5 kbps | 2-3 km | 5-8 km | High-frequency, nearby sensors |
| SF9 | 1.8 kbps | 3-5 km | 8-12 km | Medium frequency, mid-range |
| SF12 | 250 bps | 5-7 km | 12-15 km | Low-frequency, extreme range |

---

## 3. Network Topology

### 3.1 Hybrid Hierarchical Topology

```
                    ┌─────────────────────────────────────┐
                    │         CLOUD / DATA CENTER          │
                    │   (AWS Mumbai / Azure India / GCP)   │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────┴──────────────────────┐
                    │     REGIONAL MQTT BROKER CLUSTER     │
                    │   (North / South / East / West)      │
                    └──────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    ┌─────┴─────┐            ┌─────┴─────┐            ┌─────┴─────┐
    │  REGIONAL │            │  REGIONAL │            │  REGIONAL │
    │  GATEWAY  │            │  GATEWAY  │            │  GATEWAY  │
    │  (North)  │            │  (South)  │            │  (East)   │
    └─────┬─────┘            └─────┬─────┘            └─────┬─────┘
          │                        │                        │
    ┌─────┴─────┐            ┌─────┴─────┐            ┌─────┴─────┐
    │  CLUSTER  │            │  CLUSTER  │            │  CLUSTER  │
    │   HEAD    │◄──────────►│   HEAD    │◄──────────►│   HEAD    │
    └─────┬─────┘            └─────┬─────┘            └─────┬─────┘
          │                        │                        │
    ┌─────┴─────┐            ┌─────┴─────┐            ┌─────┴─────┐
    │  SENSOR   │            │  SENSOR   │            │  SENSOR   │
    │   NODES   │            │   NODES   │            │   NODES   │
    │  (LoRa)   │            │  (NB-IoT) │            │  (Mesh)   │
    └───────────┘            └───────────┘            └───────────┘
```

### 3.2 Topology by Environment

**Flood Monitoring (River Basins):**
```
[Water Level Sensor] ──LoRa──► [River Bank Gateway] ──4G──► [District HQ] ──► Cloud
        │                              │
[Soil Moisture] ──LoRa──►      [Rain Gauge] ──LoRa──►
        │                              │
[Camera] ──5G/WiFi──►           [Flow Meter] ──LoRa──►
```

**Forest Fire Detection:**
```
[Smoke/Temp Sensor Cluster] ──LoRa Mesh──► [Hilltop Gateway] ──Satellite──► Cloud
         │                                          │
[Camera (IR)] ──5G──►                      [Weather Station] ──LoRa──►
         │                                          │
[Fire Weather Index] ──LoRa──►             [Acoustic Sensor] ──LoRa──►
```

**Urban Air Quality:**
```
[PM2.5/PM10 Sensor] ──NB-IoT──► [Cell Tower] ──► Cloud
         │
[NO2/SO2 Sensor] ──NB-IoT──►
         │
[Ozone Monitor] ──NB-IoT──►
         │
[Video Camera] ──5G──►
```

### 3.3 Self-Healing Mesh Architecture

Based on research from SmartFieldMesh and EdgeRescue frameworks:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELF-HEALING MESH PROTOCOL                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. HEALTH MONITORING (Every 30 seconds)                         │
│     - Heartbeat messages between neighbors                       │
│     - Link quality (RSSI, SNR) tracking                          │
│     - Battery level monitoring                                   │
│     - Anomaly detection via lightweight 1D-CNN on edge           │
│                                                                   │
│  2. FAULT DETECTION                                              │
│     - Node failure: 3 missed heartbeats                          │
│     - Link degradation: RSSI < -120 dBm                          │
│     - Energy critical: Battery < 10%                             │
│                                                                   │
│  3. SELF-HEALING ACTIONS                                         │
│     - Automatic route recomputation (AODV/OLSR hybrid)           │
│     - Neighbor trust scoring (historical reliability)            │
│     - Energy-aware routing (preserve low-battery nodes)          │
│     - Cluster head re-election on failure                        │
│                                                                   │
│  4. RECOVERY METRICS                                             │
│     - Mean Recovery Time: < 5 seconds                            │
│     - Packet Delivery Ratio: > 95% during failure                │
│     - Network connectivity maintenance: > 83%                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Gateway Design

### 4.1 Multi-Protocol Gateway Architecture

Based on MIGS (Modular IoT Gateway System) and SMMEG-IoT research:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENTAL MONITORING GATEWAY                  │
│                     (Raspberry Pi CM4 / industrial SoC)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    NORTHBOUND INTERFACE                      │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │ MQTT     │  │ HTTPS    │  │ WebSocket│  │ gRPC     │   │     │
│  │  │ Client   │  │ Client   │  │ Client   │  │ Client   │   │     │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │     │
│  │       └──────────────┼──────────────┼──────────────┘         │     │
│  │                      ▼              ▼                        │     │
│  │              ┌──────────────────────────┐                    │     │
│  │              │   DATA NORMALIZATION     │                    │     │
│  │              │   (JSON/CBOR/Protobuf)   │                    │     │
│  │              └──────────────────────────┘                    │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    EDGE PROCESSING LAYER                     │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │ Data     │  │ Alert    │  │ ML       │  │ Data     │   │     │
│  │  │ Aggreg.  │  │ Engine   │  │ Inference│  │ Compress │   │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    SOUTHBOUND INTERFACE                      │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │ LoRaWAN  │  │ NB-IoT   │  │ Zigbee   │  │ Wi-Fi    │   │     │
│  │  │ Concentr.│  │ Module   │  │ Module   │  │ Module   │   │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │     │
│  │  │ BLE      │  │ RS-485   │  │ Ethernet │                  │     │
│  │  │ Module   │  │ Modbus   │  │ (Backhaul)│                  │     │
│  │  └──────────┘  └──────────┘  └──────────┘                  │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    LOCAL STORAGE & BUFFER                     │     │
│  │  ┌──────────────────────────────────────────────────────┐   │     │
│  │  │  SQLite / Redis  │  Store-and-Forward  │  72hr Buffer│   │     │
│  │  └──────────────────────────────────────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Gateway Specifications

**Type A: Regional Gateway (High-Capacity)**
- Hardware: Industrial ARM SoC (RK3588) or x86 mini-PC
- Protocols: LoRaWAN (8-channel), NB-IoT, 4G/5G, Wi-Fi, Ethernet
- Processing: Edge ML inference (TensorFlow Lite)
- Storage: 256GB NVMe (72-hour buffer)
- Power: 12V DC, 15W typical, solar-compatible
- Price: ₹25,000-50,000

**Type B: Cluster Head Gateway (Medium-Capacity)**
- Hardware: Raspberry Pi CM4 or equivalent
- Protocols: LoRaWAN (4-channel), Wi-Fi, Ethernet
- Processing: Data aggregation, simple alerting
- Storage: 64GB SD (48-hour buffer)
- Power: 5V DC, 5W typical, solar-compatible
- Price: ₹5,000-10,000

**Type C: Field Gateway (Basic)**
- Hardware: ESP32 + LoRa module
- Protocols: LoRa (mesh), Wi-Fi
- Processing: Basic forwarding, local alerting
- Storage: 8MB flash (24-hour buffer)
- Power: 3.7V Li-ion, 0.5W typical
- Price: ₹1,000-2,000

### 4.3 Containerized Gateway Software

```yaml
# gateway/docker-compose.yml
version: '3.8'
services:
  # Protocol handlers (southbound)
  lorawan-handler:
    image: chirpstack/chirpstack:4
    ports:
      - "8080:8080"
    volumes:
      - ./config/chirpstack:/etc/chirpstack
    restart: unless-stopped
    
  nbiot-bridge:
    image: eclipse-mosquitto:2
    volumes:
      - ./config/mosquitto.conf:/mosquitto/config/mosquitto.conf
    restart: unless-stopped

  # Edge processing
  data-processor:
    build: ./services/data-processor
    environment:
      - MQTT_BROKER=mqtt://localhost:1883
      - INFLUXDB_URL=http://influxdb:8086
    restart: unless-stopped

  # Alert engine
  alert-engine:
    build: ./services/alert-engine
    environment:
      - RULES_PATH=/etc/alert-rules
      - SMS_GATEWAY=${SMS_GATEWAY_URL}
    restart: unless-stopped

  # Local storage
  influxdb:
    image: influxdb:2.7
    volumes:
      - influxdb-data:/var/lib/influxdb2
    restart: unless-stopped

  # MQTT broker (local)
  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./config/mosquitto-local.conf:/mosquitto/config/mosquitto.conf
    restart: unless-stopped

  # Cloud bridge
  cloud-bridge:
    build: ./services/cloud-bridge
    environment:
      - CLOUD_MQTT=${CLOUD_MQTT_URL}
      - DEVICE_CERT=/etc/certs/device.pem
      - DEVICE_KEY=/etc/certs/device.key
    restart: unless-stopped

volumes:
  influxdb-data:
```

### 4.4 Store-and-Forward Mechanism

```
┌─────────────────────────────────────────────────────────────────┐
│              STORE-AND-FORWARD DATA FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Normal Operation:                                               │
│  Sensor → Gateway → MQTT → Cloud (latency: < 500ms)              │
│                                                                   │
│  Network Degraded:                                               │
│  Sensor → Gateway → [Local Buffer] → Retry every 30s            │
│                                                                   │
│  Network Down:                                                   │
│  Sensor → Gateway → [SQLite Buffer] → Queue up to 72hr          │
│                                                                   │
│  Network Restored:                                               │
│  Gateway → [Priority Queue] → Cloud                              │
│    1. Critical alerts (immediate)                                 │
│    2. Aggregated hourly summaries                                │
│    3. Raw telemetry data (lowest priority)                        │
│                                                                   │
│  Buffer Capacity:                                                │
│  - 100 sensors × 1 reading/min × 72 hours                       │
│  = 432,000 readings × 100 bytes = ~43 MB                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Transmission Strategy

### 5.1 Message Priority Levels

```python
# Message priority definitions
PRIORITY_LEVELS = {
    "CRITICAL": {
        "level": 0,
        "transmission": "IMMEDIATE",
        "retry": "every 5s until delivered",
        "examples": [
            "Flood threshold breach",
            "Forest fire detection",
            "Toxic gas release",
            "Sensor critical failure",
            "Infrastructure damage"
        ]
    },
    "HIGH": {
        "level": 1,
        "transmission": "within 30 seconds",
        "retry": "every 30s, 3 attempts",
        "examples": [
            "Water level rising rapidly",
            "AQI exceeding safe limits",
            "Abnormal sensor readings",
            "Gateway connectivity loss"
        ]
    },
    "NORMAL": {
        "level": 2,
        "transmission": "within 5 minutes",
        "retry": "batched, hourly sync",
        "examples": [
            "Regular sensor readings",
            "Environmental conditions",
            "System health reports",
            "Calibration data"
        ]
    },
    "LOW": {
        "level": 3,
        "transmission": "when bandwidth available",
        "retry": "daily batch sync",
        "examples": [
            "Historical data sync",
            "Firmware version reports",
            "Diagnostic logs",
            "Battery status updates"
        ]
    }
}
```

### 5.2 Data Compression Techniques

**For LoRaWAN (51-242 byte payload limit):**

```c
// Compact binary encoding for environmental data
typedef struct __attribute__((packed)) {
    uint16_t sensor_id;        // 2 bytes - sensor identifier
    uint8_t  type;             // 1 byte  - sensor type (0-255)
    uint32_t timestamp;        // 4 bytes - Unix timestamp (seconds)
    int16_t  values[4];        // 8 bytes - up to 4 sensor values (×0.01)
    uint8_t  flags;            // 1 byte  - status flags
    uint8_t  checksum;         // 1 byte  - XOR checksum
} __attribute__((packed)) sensor_packet_t;  // Total: 17 bytes

// Delta encoding for sequential readings
typedef struct __attribute__((packed)) {
    uint16_t sensor_id;        // 2 bytes
    int8_t   delta_time;       // 1 byte  - seconds since last (0-255)
    int8_t   delta_values[4];  // 4 bytes - change from last reading
    uint8_t  flags;            // 1 byte
} __attribute__((packed)) delta_packet_t;  // Total: 8 bytes
```

**Compression Ratios:**
| Method | Original Size | Compressed Size | Ratio |
|--------|---------------|-----------------|-------|
| JSON telemetry | 200 bytes | N/A | 1x |
| CBOR binary | 200 bytes | 80 bytes | 2.5x |
| Custom struct | 200 bytes | 17 bytes | 11.8x |
| Delta encoding | 200 bytes | 8 bytes | 25x |

### 5.3 MQTT Topic Structure

```
envmon/
├── {region}/                           # india/north, india/south, etc.
│   ├── {district}/                     # uttarakhand/dehradun
│   │   ├── {station_id}/              # station-001
│   │   │   ├── telemetry              # Regular readings (QoS 1)
│   │   │   ├── alerts                 # Critical alerts (QoS 2, retained)
│   │   │   ├── status                 # Device health (QoS 0)
│   │   │   └── config                 # Configuration updates (QoS 2)
│   │   └── ...
│   └── ...
├── system/
│   ├── gateway/{gateway_id}/status    # Gateway health
│   ├── firmware/{device_type}/ota     # Firmware updates
│   └── commands/{station_id}          # Cloud-to-device commands
└── aggregation/
    ├── hourly/{district}/{type}       # Hourly aggregated data
    └── daily/{region}/{type}          # Daily summaries
```

### 5.4 Reporting Schedules

| Sensor Type | Normal Interval | Alert Mode | Data Size |
|-------------|-----------------|------------|-----------|
| Water Level | 15 minutes | Every 30 seconds | 17 bytes |
| Rain Gauge | 5 minutes | Every minute | 12 bytes |
| Soil Moisture | 30 minutes | Every 5 minutes | 15 bytes |
| Air Quality (PM2.5) | 5 minutes | Every minute | 20 bytes |
| Temperature/Humidity | 15 minutes | Every 5 minutes | 12 bytes |
| Camera (Fire Detection) | On-event | Continuous streaming | 100KB-1MB |
| Acoustic (Fire Crackling) | On-event | 30-second clips | 50KB |

---

## 6. Network Resilience

### 6.1 Redundancy Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-LAYER REDUNDANCY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  LAYER 1: Sensor Level                                           │
│  - Dual-radio sensors (LoRa + NB-IoT fallback)                   │
│  - Local SD card buffering (7 days raw data)                     │
│  - Watchdog timer with auto-reset                                │
│                                                                   │
│  LAYER 2: Gateway Level                                          │
│  - Mesh connectivity between gateways                            │
│  - Automatic failover to neighboring gateway                     │
│  - 72-hour local data buffer                                     │
│                                                                   │
│  LAYER 3: Network Level                                          │
│  - Multiple backhaul paths (4G + satellite + LoRa mesh)          │
│  - Automatic path selection based on latency/throughput          │
│  - Bonded connectivity (multi-SIM, multi-carrier)                │
│                                                                   │
│  LAYER 4: Cloud Level                                            │
│  - Multi-region deployment (Mumbai + Chennai + Delhi)            │
│  - Active-active MQTT broker clusters                            │
│  - Cross-region data replication                                 │
│                                                                   │
│  LAYER 5: Emergency Level                                        │
│  - Satellite backup for critical alerts                          │
│  - Meshtastic mesh for off-grid emergency communication          │
│  - SMS fallback for life-safety alerts                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Offline Operation Capabilities

```
┌─────────────────────────────────────────────────────────────────┐
│              OFFLINE OPERATION MODES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  MODE 1: Degraded Connectivity (Intermittent)                    │
│  - Gateway continues collecting data locally                     │
│  - Prioritized queue: CRITICAL → HIGH → NORMAL → LOW             │
│  - Batch upload when connectivity available                      │
│  - Local ML inference continues for alerting                     │
│                                                                   │
│  MODE 2: Complete Network Isolation                              │
│  - Full local operation for up to 72 hours                       │
│  - Local alerting via sirens, LED indicators                     │
│  - Mesh network maintains inter-sensor communication             │
│  - Satellite uplink for critical alerts only                     │
│                                                                   │
│  MODE 3: Disaster Recovery                                       │
│  - Sensor nodes operate autonomously                             │
│  - Meshtastic mesh forms ad-hoc network                          │
│  - Data stored locally with CRC verification                     │
│  - Manual data retrieval if needed                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  DEVICE LEVEL                                                    │
│  ├── Hardware Security Module (HSM/TPM) on gateways             │
│  ├── Unique device certificates (X.509)                          │
│  ├── Secure boot chain verification                              │
│  ├── Encrypted local storage (LUKS/dm-crypt)                     │
│  └── Tamper detection with data wipe capability                  │
│                                                                   │
│  COMMUNICATION LEVEL                                              │
│  ├── LoRaWAN: AES-128 (network + application layer)             │
│  ├── NB-IoT: Carrier-grade encryption (SIM-based)               │
│  ├── MQTT: TLS 1.3 with mutual authentication (mTLS)            │
│  ├── API: OAuth 2.0 + JWT tokens                                 │
│  └── Satellite: End-to-end encryption (AES-256)                  │
│                                                                   │
│  CLOUD LEVEL                                                      │
│  ├── Zero-trust architecture                                     │
│  ├── Device identity verification (every connection)             │
│  ├── Topic-level ACL (Access Control Lists)                      │
│  ├── Data encryption at rest (AES-256)                           │
│  ├── Audit logging (immutable)                                   │
│  └── Regular security penetration testing                        │
│                                                                   │
│  DATA INTEGRITY                                                   │
│  ├── CRC32 checksums on all sensor packets                       │
│  ├── HMAC signatures for critical alerts                         │
│  ├── Blockchain anchoring for legal defensibility                │
│  └── Tamper-evident audit trails                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Cloud Integration

### 7.1 MQTT Broker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MQTT BROKER DEPLOYMENT                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │               EMQX CLUSTER (3 nodes)                     │     │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐          │     │
│  │  │  Node 1  │◄──►│  Node 2  │◄──►│  Node 3  │          │     │
│  │  │ (Mumbai) │    │(Chennai) │    │ (Delhi)  │          │     │
│  │  └──────────┘    └──────────┘    └──────────┘          │     │
│  │         │               │               │                │     │
│  │         └───────────────┼───────────────┘                │     │
│  │                         ▼                                │     │
│  │              ┌──────────────────┐                        │     │
│  │              │  LOAD BALANCER   │                        │     │
│  │              │  (Session Affin.)│                        │     │
│  │              └──────────────────┘                        │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  CAPABILITIES:                                                   │
│  ├── 10M+ concurrent connections                                 │
│  ├── Message throughput: 100K+ msg/sec per node                  │
│  ├── QoS 0/1/2 support                                          │
│  ├── Retained messages & Last Will Testament                     │
│  ├── Shared subscriptions for load distribution                  │
│  ├── Message expiry intervals                                    │
│  ├── Session persistence                                         │
│  └── WebSocket support for dashboards                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    END-TO-END DATA PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │ Sensors │───►│ Gateway │───►│ MQTT    │───►│ Kafka   │     │
│  │ (LoRa/  │    │ (Edge)  │    │ Broker  │    │ Buffer  │     │
│  │ NB-IoT) │    │         │    │ (EMQX)  │    │         │     │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘     │
│                                                      │           │
│         ┌────────────────────────────────────────────┤           │
│         │                    │                        │           │
│         ▼                    ▼                        ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐     │
│  │ Real-time   │    │ Alert       │    │ Time-series     │     │
│  │ Stream      │    │ Processor   │    │ Storage         │     │
│  │ Processing  │    │ (Flink)     │    │ (InfluxDB)      │     │
│  │ (Flink)     │    │             │    │                 │     │
│  └──────┬──────┘    └──────┬──────┘    └────────┬────────┘     │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐     │
│  │ Real-time   │    │ SMS/Push    │    │ Historical      │     │
│  │ Dashboard   │    │ Alerts      │    │ Analytics       │     │
│  │ (Grafana)   │    │ (Twilio)    │    │ (PostgreSQL)    │     │
│  └─────────────┘    └─────────────┘    └─────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 REST API Design

```yaml
# OpenAPI 3.0 Specification (Key Endpoints)
openapi: 3.0.0
info:
  title: Environmental Monitoring API
  version: 1.0.0

paths:
  /api/v1/stations:
    get:
      summary: List all monitoring stations
      parameters:
        - name: region
          in: query
          schema: { type: string }
        - name: status
          in: query
          schema: { type: string, enum: [active, inactive, alert] }
      responses:
        '200':
          description: Station list

  /api/v1/stations/{station_id}/telemetry:
    get:
      summary: Get telemetry data for a station
      parameters:
        - name: station_id
          in: path
          required: true
          schema: { type: string }
        - name: from
          in: query
          schema: { type: string, format: date-time }
        - name: to
          in: query
          schema: { type: string, format: date-time }
        - name: interval
          in: query
          schema: { type: string, enum: [raw, 5min, 1hour, 1day] }

  /api/v1/alerts:
    get:
      summary: Get active alerts
      parameters:
        - name: severity
          in: query
          schema: { type: string, enum: [critical, high, medium, low] }
        - name: type
          in: query
          schema: { type: string, enum: [flood, fire, pollution, earthquake] }

  /api/v1/alerts/{alert_id}/acknowledge:
    post:
      summary: Acknowledge an alert

  /api/v1/stations/{station_id}/config:
    put:
      summary: Update station configuration

  /api/v1/health:
    get:
      summary: System health check
```

### 7.4 Database Selection

**Primary Time-Series Database: InfluxDB 3.0**
- Rationale: Purpose-built for high-velocity IoT telemetry, unlimited cardinality, SQL support
- Deployment: InfluxDB Cloud (serverless) on AWS Mumbai region
- Retention: Raw data 30 days → 5-min aggregates 1 year → daily aggregates indefinite

**Operational Database: PostgreSQL (TimescaleDB)**
- Rationale: Device registry, user management, alert history, complex joins
- Deployment: AWS RDS PostgreSQL Multi-AZ
- Use: Relational data, ACID transactions, regulatory compliance

**Cache Layer: Redis**
- Rationale: Real-time dashboard, session management, rate limiting
- Deployment: Amazon ElastiCache Redis Cluster
- Use: Recent telemetry cache, user sessions, pub/sub for real-time updates

**Data Lake: Apache Parquet on S3**
- Rationale: Long-term archival, ML training data, regulatory compliance
- Deployment: AWS S3 with S3 Intelligent-Tiering
- Use: Historical analysis, model training, data sharing with government agencies

### 7.5 Time-Series Data Tiering Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│              DATA RETENTION & TIERING POLICY                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TIER 1: HOT (Real-time)                                        │
│  ├── Storage: InfluxDB (memory-optimized)                        │
│  ├── Retention: 24 hours                                         │
│  ├── Query latency: < 100ms                                      │
│  └── Use: Real-time dashboards, active alerting                  │
│                                                                   │
│  TIER 2: WARM (Recent)                                          │
│  ├── Storage: InfluxDB (disk-optimized) + TimescaleDB            │
│  ├── Retention: 30 days (raw), 1 year (5-min aggregates)        │
│  ├── Query latency: < 1 second                                   │
│  └── Use: Operational analytics, trend analysis                  │
│                                                                   │
│  TIER 3: COLD (Historical)                                      │
│  ├── Storage: TimescaleDB (compressed) + Parquet on S3           │
│  ├── Retention: Indefinite (daily/hourly aggregates)             │
│  ├── Query latency: < 10 seconds                                 │
│  └── Use: ML training, regulatory reports, research              │
│                                                                   │
│  CONTINUOUS AGGREGATES:                                          │
│  - Raw → 5-minute averages (continuous)                          │
│  - 5-minute → 1-hour averages (hourly)                           │
│  - 1-hour → 1-day averages (daily)                               │
│  - Automatic downsampling with 90% storage reduction             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Integration with Government Systems

### 8.1 Indian Government Data Sources

| Agency | Data Available | API Access | Integration Method |
|--------|---------------|------------|-------------------|
| **IMD** (India Meteorological Dept) | Weather forecasts, rainfall data, temperature | REST API (mausam.imd.gov.in) | HTTP polling every 15 min |
| **CWC** (Central Water Commission) | River water levels, flood forecasts | API + manual | MQTT bridge + webhook |
| **NRSC/ISRO** (National Remote Sensing) | Satellite imagery, flood maps (NDEM) | VEDAS API (vedas.sac.gov.in) | REST API + GeoJSON |
| **MOSDAC** (ISRO) | INSAT-3D weather data, GSMaP rainfall | HDF5/NetCDF download | Scheduled ingestion pipeline |
| **NDMA** (National Disaster Management) | Alert dissemination, coordination | API integration | WebSocket + REST |
| **CPCB** (Central Pollution Control Board) | Air quality index, pollution data | REST API | HTTP polling |
| **State DMS** (Disaster Management) | State-level coordination | API/Manual | Integration gateway |

### 8.2 Government Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              GOVERNMENT DATA INTEGRATION LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INBOUND DATA (Government → Our System):                        │
│                                                                   │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────┐            │
│  │ IMD API │───►│ Weather     │───►│ Correlation  │            │
│  │ (Rain,  │    │ Data Parser │    │ Engine       │            │
│  │ Temp)   │    └─────────────┘    └──────┬───────┘            │
│  └─────────┘                              │                     │
│  ┌─────────┐    ┌─────────────┐           │                     │
│  │ ISRO    │───►│ Satellite   │───────────┤                     │
│  │ VEDAS   │    │ Imagery Proc│           │                     │
│  └─────────┘    └─────────────┘           │                     │
│  ┌─────────┐    ┌─────────────┐           ▼                     │
│  │ CWC     │───►│ River Level │───►┌──────────────┐            │
│  │ API     │    │ Aggregator  │    │ AI/ML        │            │
│  └─────────┘    └─────────────┘    │ Prediction   │            │
│                                     │ Engine       │            │
│                                     └──────┬───────┘            │
│                                            │                     │
│  OUTBOUND DATA (Our System → Government): │                     │
│                                            ▼                     │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────┐            │
│  │ NDMA    │◄───│ Alert       │◄───│ Alert        │            │
│  │ Alert   │    │ Dispatcher  │    │ Generator    │            │
│  │ Gateway │    └─────────────┘    └──────────────┘            │
│  └─────────┘                                                   │
│  ┌─────────┐    ┌─────────────┐                                │
│  │ State   │◄───│ Dashboard   │  (Real-time situational       │
│  │ DMS     │    │ API         │   awareness portal)           │
│  │ Portal  │    └─────────────┘                                │
│  └─────────┘                                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Open Data Standards Compliance

- **OGC SensorThings API**: Standardized sensor data model
- **SensorML**: Sensor metadata description
- **WaterML 2.0**: Hydrological data exchange (CWC compatibility)
- **GeoJSON/TopoJSON**: Geospatial data interchange
- **NetCDF/CF-Convention**: Climate data format (ISRO/IMD compatibility)
- **EDXL-CAP**: Common Alerting Protocol (NDMA compatibility)

### 8.4 Data Sharing Protocols

```python
# Government data sharing configuration
GOVERNMENT_INTEGRATIONS = {
    "imd": {
        "endpoint": "https://mausam.imd.gov.in/api/v1",
        "auth": "api_key",
        "poll_interval": "15min",
        "data_format": "JSON",
        "rate_limit": "1000 req/hour"
    },
    "isro_vedas": {
        "endpoint": "https://vedas.sac.gov.in/api",
        "auth": "oauth2",
        "poll_interval": "1hour",
        "data_format": "GeoJSON",
        "rate_limit": "500 req/hour"
    },
    "ndma": {
        "endpoint": "https://ndma.gov.in/api/alerts",
        "auth": "mutual_tls",
        "push_enabled": True,
        "data_format": "EDXL-CAP",
        "priority": "critical_only"
    },
    "cwc": {
        "endpoint": "https://cwc.gov.in/api/rivers",
        "auth": "api_key",
        "poll_interval": "5min",
        "data_format": "JSON",
        "rate_limit": "2000 req/hour"
    }
}
```

---

## 9. Network Performance Requirements

### 9.1 Latency Requirements

| Operation | Maximum Latency | Priority |
|-----------|-----------------|----------|
| Critical alert (flood/fire) | < 5 seconds | Life-safety |
| Sensor reading → Dashboard | < 30 seconds | Operational |
| Batch data sync | < 5 minutes | Analytics |
| Firmware update | < 1 hour | Maintenance |
| Historical query | < 10 seconds | Research |

### 9.2 Reliability Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Network uptime | 99.9% (8.7hr downtime/year) | Monthly SLA |
| Message delivery | > 99.5% | Per gateway |
| Critical alert delivery | 100% | End-to-end |
| Data integrity | 100% (CRC verified) | Per packet |
| Mean time to recovery | < 5 minutes | Per incident |

### 9.3 Scalability Targets

| Metric | Phase 1 (2026) | Phase 2 (2027) | Phase 3 (2028) |
|--------|----------------|----------------|----------------|
| Total sensors | 10,000 | 100,000 | 1,000,000 |
| Gateways | 200 | 2,000 | 20,000 |
| Data points/day | 10M | 100M | 1B |
| Concurrent connections | 5,000 | 50,000 | 500,000 |
| Alert processing | 1,000/hr | 10,000/hr | 100,000/hr |

---

## 10. Cost Analysis

### 10.1 Per-Sensor Connectivity Costs (10-year lifecycle)

| Protocol | Hardware | Monthly Cost | 10-Year Total |
|----------|----------|--------------|---------------|
| LoRaWAN | ₹1,500 | ₹0 (private) | ₹1,500 + gateway share |
| NB-IoT | ₹800 | ₹100 | ₹12,800 |
| Satellite | ₹3,000 | ₹500 | ₹63,000 |
| Zigbee | ₹500 | ₹0 | ₹500 + coordinator |

### 10.2 Gateway Infrastructure Costs

| Type | Unit Cost | Coverage | Sensors/Gateway | Cost/Sensor |
|------|-----------|----------|-----------------|-------------|
| Regional (Type A) | ₹40,000 | 15 km | 500 | ₹80 |
| Cluster (Type B) | ₹8,000 | 5 km | 100 | ₹80 |
| Field (Type C) | ₹1,500 | 2 km | 20 | ₹75 |

### 10.3 Cloud Infrastructure Costs (Monthly)

| Component | Phase 1 | Phase 2 | Phase 3 |
|-----------|---------|---------|---------|
| MQTT Broker (EMQX) | ₹5,000 | ₹25,000 | ₹100,000 |
| InfluxDB Cloud | ₹10,000 | ₹50,000 | ₹200,000 |
| PostgreSQL (RDS) | ₹3,000 | ₹15,000 | ₹50,000 |
| Kafka (MSK) | ₹5,000 | ₹25,000 | ₹100,000 |
| Compute (EKS) | ₹10,000 | ₹50,000 | ₹200,000 |
| Storage (S3) | ₹2,000 | ₹10,000 | ₹50,000 |
| **Total** | **₹35,000** | **₹175,000** | **₹700,000** |

---

## 11. Implementation Roadmap

### Phase 1: Pilot (Months 1-6)
- Deploy 100 sensors in 2 districts (1 flood-prone, 1 urban)
- 10 gateways (LoRaWAN + NB-IoT hybrid)
- Cloud infrastructure setup
- IMD/CWC API integration
- Basic alerting system

### Phase 2: Regional Expansion (Months 7-18)
- Scale to 10,000 sensors across 5 states
- 200 gateways deployed
- Advanced ML alerting
- NDMA integration
- Mobile app for field workers

### Phase 3: National Scale (Months 19-36)
- 100,000+ sensors nationwide
- 2,000+ gateways
- Satellite integration for remote areas
- Full government API integration
- Predictive analytics platform

---

## 12. Key Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary LPWAN | LoRaWAN (rural) + NB-IoT (urban) | Coverage, cost, battery life balance |
| Mesh Protocol | Meshtastic LoRa | Open-source, resilient, off-grid capable |
| MQTT Broker | EMQX | 10M+ connections, clustering, SQL support |
| Time-Series DB | InfluxDB 3.0 (hot) + TimescaleDB (warm) | Purpose-built + SQL compatibility |
| Message Buffer | Apache Kafka | Absorb spikes, decouple services |
| Edge Processing | TensorFlow Lite on gateway | Local ML inference, low latency |
| Security | mTLS + AES-128/256 | Zero-trust, government compliance |
| Satellite | Iridium SBD (critical) + Starlink (bulk) | Global coverage, varying bandwidth |

---

*Document Version: 1.0*
*Author: Agent 3 - Communication Protocols & Network Architecture*
*Date: September 2026*
