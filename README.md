# Adaptive Hybrid Edge-Olfaction System 🧠💨
**IEEE-Aligned Predictive Spoilage Detection via Multi-Channel VOC Calibration**

## Overview
This repository contains the edge-computing framework for an "Electronic Nose" designed for real-time perishable goods monitoring. The system acquires data from a 4-channel MQ sensor array, converts raw ADC values to calibrated **Rs (Resistance)** values, and processes them through an IEEE-aligned signal pipeline:

- **R₀ Baseline Capture**: 15-minute heater stabilization → 2-minute clean-air baseline via Robust Standardization (IQR filtering)
- **Discrete Wavelet Transform (DWT)**: Haar wavelet denoising on 10-second chunks (PyWavelets)
- **Kalman/EMA Filtering**: α=0.2 exponential smoothing on rolling 50-sample robust medians
- **4-Sensor VEI Risk**: `(MQ3×0.55) + (MQ135×0.30) + (MQ4×0.10) + (MQ2×0.05)`

## Hardware Architecture
* **Edge Node:** Raspberry Pi 4B (Python threading, DWT math, CSV logging)
* **ADC Bridge:** Arduino Uno / Atmega328P (10-bit SAR, 1Hz UART)
* **Sensor Array:** MQ-135 (VOC/CO₂), MQ-3 (Ethanol), MQ-4 (Methane), MQ-2 (Smoke), DHT11 (Temp/Humidity), HC-SR04 (Cargo), Piezo (Vibration)

## Software Stack
* **Calibration Logger:** `src/calibration_logger.py` — Interactive 2-view terminal dashboard with IEEE filtering pipeline
* **Live Dashboard:** `EDGE_upgraded.html` — Cloudflare Worker-connected real-time telemetry UI
* **Data Parsing:** PySerial (9600 baud, lock-based threading)

## Execution
```bash
python src/calibration_logger.py
