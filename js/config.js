/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — SYSTEM CONFIGURATION & VERIFIED SPECS
   100% Empirically Aligned with Project Codebase & IEEE Manuscript
   ════════════════════════════════════════════════════════════════ */

export const CONFIG = {
  project: {
    title: "Edge-Olfaction",
    subtitle: "Real-Time Agricultural Quality Assessment via Hybrid Kinetic Analytics and Edge Computing",
    institution: "University of Engineering & Management (UEM), Kolkata",
    department: "Department of Electronics & Communication Engineering (ECE)",
    location: "Khardaha Regional Transit Corridor, West Bengal, India",
    supervisor: {
      name: "Prof. Rimi Sengupta",
      role: "Assistant Professor & Faculty Project Supervisor",
      email: "rimi.sengupta17@gmail.com",
      orcid: "https://orcid.org/0000-0001-7639-581X"
    },
    authors: [
      { name: "Dibyajyotee Ghosh", role: "Edge AI & Lead Systems Architect" },
      { name: "Sharmik Sen", role: "Hardware & Sensor Calibration Lead" }
    ],
    github: "https://github.com/ZG0D-FF/Edge-Olfaction",
    frontendPlaceholder: "#"
  },

  hardware: {
    tier1: {
      title: "Tier 1: Deterministic Acquisition MCU",
      device: "Arduino Uno R3 (ATmega328P)",
      adc: "10-Bit Successive Approximation (SAR) ADC",
      resolution: "4.88 mV per LSB (Vref = 5.0V, 1024 steps)",
      samplingRate: "1 Hz to 0.67 Hz deterministic polling",
      bus: "Hardware UART (9600 Baud, 8-N-1)",
      logicLevel: "1 kΩ / 2 kΩ Resistor Divider Shifter (5V → 3.3V)"
    },
    tier2: {
      title: "Tier 2: Edge Analytics Node",
      device: "Raspberry Pi 4 Model B (Quad-Core Cortex-A72 @ 1.5GHz)",
      os: "Headless Linux with Persistent WPA-PSK Network Autonomy",
      pipeline: "Haar Wavelet DWT + EMA (α=0.15–0.2) + Arrhenius Kinetics",
      latency: "< 300 ms Local Spoilage Stage Inference",
      storage: "Thread-Safe Local CSV Black-Box (Zero Cloud Dependency)"
    },
    sensors: [
      { id: "mq135", name: "MQ-135", target: "Broad VOCs, NH3, CO2, Early Fungal Marker", weight: 0.30 },
      { id: "mq3", name: "MQ-3", target: "Ethanol & Alcohol Vapors (Fermentation Marker)", weight: 0.55 },
      { id: "mq4", name: "MQ-4", target: "Methane CH4 (Late Anaerobic Biomass Rot)", weight: 0.10 },
      { id: "mq2", name: "MQ-2", target: "Combustibles / Cross-Sensitivity Control Baseline", weight: 0.05 },
      { id: "dht", name: "Dual DHT11", target: "Internal Cargo vs External Ambient Climate (T/RH)", weight: 0.00 },
      { id: "piezo", name: "Piezoelectric Disc", target: "Transit Rumble vs Pest Micro-Acoustics (ZCR Analysis)", weight: 0.00 }
    ]
  },

  youtubeChapters: [
    { id: "bvh3YAOhDsY", chapter: "01", title: "System Overview & Physical Setup", desc: "End-to-end hardware architecture, edge-cloud decoupling, and Khardaha field deployment rationale." },
    { id: "dL_wJjh1M5o", chapter: "02", title: "Dual-Processor Hardware Bridge", desc: "UART framing from Arduino Uno 10-bit SAR ADC to Raspberry Pi 4B compute node with level shifting." },
    { id: "_tGki7RjPMc", chapter: "03", title: "Sensor Array & Acoustic Discrimination", desc: "4-channel SnO2 MQ chemisorption behavior alongside piezoelectric ZCR rumble-vs-pest filtering." },
    { id: "KCXEhn_c-vE", chapter: "04", title: "Predictive Arrhenius Decay Models", desc: "Mathematical implementation of non-linear kinetics and dynamic thermal/humidity cross-sensitivity." },
    { id: "3HB6LGiXlrQ", chapter: "05", title: "Terminal CLI & Real-Time Telemetry", desc: "Live terminal HUD v8.0, 15-minute R0 clean-air baseline calibration, and automated watchdog alerts." }
  ],

  sficDossier: [
    { title: "Technical Lab Report", file: "./SFIC/prototype.pdf", size: "1.8 MB", type: "PDF", desc: "Complete laboratory investigation, sensor schematics, signal equations, and telemetry curves." },
    { title: "Project Proposal & Pitch", file: "./SFIC/project_proposal.pdf", size: "1.7 MB", type: "PDF", desc: "Detailed regional deployment logistics, Khardaha market trials, and socio-economic impact metrics." },
    { title: "Innovator CV & Credentials", file: "./SFIC/innovators_cv.pdf", size: "101 KB", type: "PDF", desc: "Academic and technical background of the student engineering team at UEM Kolkata." },
    { title: "IEEE Manuscript Draft", file: "./SFIC/EDGE_OLFACTION_paper.docx", size: "6.0 MB", type: "DOCX", desc: "27-reference IEEE A4 format manuscript titled 'Edge-Olfaction: Real-Time Agricultural Quality Assessment'." }
  ],

  models3D: {
    arduino: "./models/arduino_uno_authentic.glb",
    raspberryPi: "./models/raspberry_pi_clean.glb",
    mqSensor: "./models/mq_sensor.glb"
  }
};
