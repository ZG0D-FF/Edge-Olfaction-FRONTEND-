/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — SCIENTIFIC TELEMETRY & MATH ENGINE
   100% Empirically Aligned with Real CSV Data & IEEE Formulas
   ════════════════════════════════════════════════════════════════ */

export class TelemetryEngine {
  constructor(datasetUrl) {
    this.datasetUrl = datasetUrl;
    this.data = null;
    this.isLoaded = false;
  }

  async load() {
    try {
      const res = await fetch(this.datasetUrl);
      this.data = await res.json();
      this.isLoaded = true;
      return this.data;
    } catch (e) {
      console.warn("[TelemetryEngine] Dataset load error", e);
      return null;
    }
  }

  // 1. Calculate 4-Sensor VEI Spoilage Risk
  calcVEI(mq3, mq135, mq4, mq2) {
    const w_mq3 = 0.55;
    const w_135 = 0.30;
    const w_4 = 0.10;
    const w_2 = 0.05;

    const vei = (mq3 * w_mq3) + (mq135 * w_135) + (mq4 * w_4) + (mq2 * w_2);
    // Baseline mapping from calibration_logger.py
    const risk = Math.max(5.0, Math.min(99.9, ((vei - 180.0) / (350.0 - 180.0)) * 100));
    return {
      vei: Math.round(vei * 10) / 10,
      risk: Math.round(risk * 10) / 10,
      stage: this.getBiologicalStage(risk)
    };
  }

  // 2. 7-Stage Biological Taxonomy
  getBiologicalStage(riskPct) {
    if (riskPct < 15) return { stage: 1, name: "ORCHARD FRESH", desc: "Healthy cellular turgor, minimal ester/alcohol emission.", color: "#34d399" };
    if (riskPct < 30) return { stage: 2, name: "CLIMACTERIC ONSET", desc: "Ethylene spike initiated, early starch conversion.", color: "#6ee7b7" };
    if (riskPct < 50) return { stage: 3, name: "PEAK CONSUMPTION", desc: "Optimal sugar/acid balance, crisp cellular membrane.", color: "#facc15" };
    if (riskPct < 65) return { stage: 4, name: "SENESCENCE", desc: "Cellular wall breakdown, softening tissue structure.", color: "#fbbf24" };
    if (riskPct < 80) return { stage: 5, name: "SPOILING (FERMENTING)", desc: "Ethanol & aldehyde vapors detected by MQ-3.", color: "#fb923c" };
    if (riskPct < 90) return { stage: 6, name: "ADVANCED ROT", desc: "Secondary anaerobic decomposition, microbial growth.", color: "#f87171" };
    return { stage: 7, name: "NECROTIC COLLAPSE", desc: "Total tissue liquefaction, structural cargo loss.", color: "#ef4444" };
  }

  // 3. Arrhenius Reaction Kinetics & Shelf-Life Model
  calcArrheniusDecay(tempC, humPct, currentRiskPct) {
    const R = 8.314; // Universal gas constant J/(mol·K)
    const Ea = 50200; // Activation Energy J/mol for climacteric fruit respiration
    const T_kelvin = tempC + 273.15;
    const T_ref = 293.15; // 20°C Reference

    // Temperature acceleration factor
    const k_ratio = Math.exp((-Ea / R) * ((1 / T_kelvin) - (1 / T_ref)));

    // Humidity acceleration (exponential penalty above 80% RH)
    const hum_factor = humPct > 80 ? 1 + (humPct - 80) * 0.025 : 1.0;

    const netAcceleration = k_ratio * hum_factor;
    const healthFactor = Math.max(0, (100 - currentRiskPct) / 100);

    // 168-hour baseline shelf-life adjusted by non-linear degradation
    const hoursLeft = Math.max(1, Math.round((168 * Math.pow(healthFactor, 2)) / netAcceleration));

    return {
      k_ratio: Math.round(netAcceleration * 100) / 100,
      hoursLeft,
      daysLeft: Math.round((hoursLeft / 24) * 10) / 10
    };
  }

  // 4. Haar Wavelet (db1) Denoising Filter Simulation
  applyHaarDWT(signalArray) {
    if (!signalArray || signalArray.length < 2) return signalArray;

    const n = signalArray.length;
    const approx = [];
    const detail = [];

    // 1-Level Haar Decomposition
    for (let i = 0; i < n - 1; i += 2) {
      approx.push((signalArray[i] + signalArray[i + 1]) / Math.SQRT2);
      detail.push((signalArray[i] - signalArray[i + 1]) / Math.SQRT2);
    }

    // Universal Soft Thresholding (Donoho & Johnstone)
    const absDetail = detail.map(Math.abs).sort((a, b) => a - b);
    const medianAbs = absDetail[Math.floor(absDetail.length / 2)] || 0;
    const sigma = medianAbs / 0.6745;
    const uThresh = sigma * Math.sqrt(2 * Math.log(n));

    const threshDetail = detail.map(d => {
      if (Math.abs(d) <= uThresh) return 0;
      return d > 0 ? d - uThresh : d + uThresh;
    });

    // Reconstruction
    const denoised = [];
    for (let i = 0; i < approx.length; i++) {
      denoised.push((approx[i] + threshDetail[i]) / Math.SQRT2);
      denoised.push((approx[i] - threshDetail[i]) / Math.SQRT2);
    }

    return denoised;
  }

  // 5. High-Resolution 2D IEEE Telemetry Curves (Publication-Grade Multi-Subplot)
  drawIeee2DChart(canvas, timeseries, onHover) {
    if (!canvas || !timeseries || !timeseries.length) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height || 340;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);

    let hoverIdx = null;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      const padLeft = 48;
      const padRight = 44;
      const plotW = w - padLeft - padRight;
      
      const topH = h * 0.50;
      const topY = 24;
      
      const botH = h * 0.28;
      const botY = topY + topH + 32;

      // Subplot 1: Sensor Resistance Rs (kΩ)
      ctx.fillStyle = "rgba(10, 10, 14, 0.4)";
      ctx.fillRect(padLeft, topY, plotW, topH);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = topY + (topH / 4) * g;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();

        const rsVal = (3.5 - (3.0 / 4) * g).toFixed(1);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${rsVal} kΩ`, padLeft - 6, y + 3);
      }

      ctx.save();
      ctx.translate(14, topY + topH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sensor Rs (kΩ)", 0, 0);
      ctx.restore();

      const channels = [
        { key: "mq3_rs", color: "#f87171", label: "MQ-3 (Alc)" },
        { key: "mq135_rs", color: "#60a5fa", label: "MQ-135 (VOC)" },
        { key: "mq4_rs", color: "#34d399", label: "MQ-4 (CH4)" },
        { key: "mq2_rs", color: "#a78bfa", label: "MQ-2 (Smk)" }
      ];

      channels.forEach(ch => {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        timeseries.forEach((d, i) => {
          const x = padLeft + (i / (timeseries.length - 1)) * plotW;
          const val = Math.min(3.5, Math.max(0.5, d[ch.key] || 1.0));
          const y = topY + topH - ((val - 0.5) / 3.0) * topH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      // Subplot 2: Microclimate (Temp & Humidity)
      ctx.fillStyle = "rgba(10, 10, 14, 0.4)";
      ctx.fillRect(padLeft, botY, plotW, botH);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      for (let g = 0; g <= 2; g++) {
        const y = botY + (botH / 2) * g;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#fbbf24";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText("35°C", padLeft - 6, botY + 6);
      ctx.fillText("25°C", padLeft - 6, botY + botH);

      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "left";
      ctx.fillText("95%", padLeft + plotW + 6, botY + 6);
      ctx.fillText("70%", padLeft + plotW + 6, botY + botH);

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      timeseries.forEach((d, i) => {
        const x = padLeft + (i / (timeseries.length - 1)) * plotW;
        const val = Math.min(35, Math.max(25, d.temp || 28));
        const y = botY + botH - ((val - 25) / 10) * botH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      timeseries.forEach((d, i) => {
        const x = padLeft + (i / (timeseries.length - 1)) * plotW;
        const val = Math.min(95, Math.max(70, d.hum || 85));
        const y = botY + botH - ((val - 70) / 25) * botH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Interactive Crosshair Hover
      if (hoverIdx !== null && timeseries[hoverIdx]) {
        const d = timeseries[hoverIdx];
        const hx = padLeft + (hoverIdx / (timeseries.length - 1)) * plotW;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(hx, topY);
        ctx.lineTo(hx, botY + botH);
        ctx.stroke();
        ctx.setLineDash([]);

        channels.forEach(ch => {
          const val = Math.min(3.5, Math.max(0.5, d[ch.key] || 1.0));
          const hy = topY + topH - ((val - 0.5) / 3.0) * topH;
          ctx.fillStyle = ch.color;
          ctx.beginPath();
          ctx.arc(hx, hy, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        const tipW = 165;
        const tipH = 48;
        let tipX = hx + 10;
        if (tipX + tipW > w - 10) tipX = hx - tipW - 10;
        const tipY = topY + 10;

        ctx.fillStyle = "rgba(18, 18, 24, 0.94)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tipX, tipY, tipW, tipH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(d.time || "2026-09-02", tipX + 8, tipY + 14);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText(`MQ-3: ${d.mq3_rs} kΩ | MQ-135: ${d.mq135_rs}`, tipX + 8, tipY + 28);
        ctx.fillText(`T: ${d.temp}°C | RH: ${d.hum}% | k: ${d.k_decay}×`, tipX + 8, tipY + 41);
      }
    };

    render();

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const padLeft = 48;
      const padRight = 44;
      const plotW = rect.width - padLeft - padRight;

      if (mx >= padLeft && mx <= padLeft + plotW) {
        const ratio = (mx - padLeft) / plotW;
        hoverIdx = Math.round(ratio * (timeseries.length - 1));
        render();
        if (onHover) onHover(timeseries[hoverIdx]);
      } else {
        if (hoverIdx !== null) {
          hoverIdx = null;
          render();
          if (onHover) onHover(null);
        }
      }
    });

    canvas.addEventListener("mouseleave", () => {
      if (hoverIdx !== null) {
        hoverIdx = null;
        render();
        if (onHover) onHover(null);
      }
    });
  }
}
