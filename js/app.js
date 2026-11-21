/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — MAIN APPLICATION ORCHESTRATOR
   Lenis Smooth Scroll · Three.js CAD Bridge · Telemetry Charts
   ════════════════════════════════════════════════════════════════ */

import { CONFIG } from "./config.js";
import { CadExplosionStage } from "./cad-explosion.js";
import { TelemetryEngine } from "./telemetry-engine.js";
import { Scientific3DGraph } from "./scientific-3d-graph.js";
import { ModalController } from "./modal-controller.js";
import { WebGLViewportPool } from "./webgl-pool.js";

class ShowcaseApp {
  constructor() {
    this.lenis = null;
    this.cadStage = null;
    this.telemetry = null;
    this.scientific3d = null;
    this.modals = null;
    this.webglPool = null;

    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  async init() {
    this._initLenis();
    this.modals = new ModalController();
    this.webglPool = new WebGLViewportPool({ maxActive: 2 });

    await this._initCadStage();
    await this._initTelemetryEngine();
    this._initInteractiveWidgets();
    this._initDocumentAndVideoHooks();
    this._initScrollTracker();
  }

  _initLenis() {
    if (typeof Lenis !== "undefined") {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5
      });

      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  async _initCadStage() {
    const canvas = document.getElementById("three-cad-canvas");
    const container = document.getElementById("cad-stage-section");
    if (!canvas || !container) return;

    this.cadStage = new CadExplosionStage(canvas);

    // Register with WebGL Lifecycle Pool
    this.webglPool.registerSlot(container, {
      onActivate: () => this.cadStage.start(),
      onDeactivate: () => this.cadStage.stop()
    });

    // Loading indicator feedback
    const loaderBytes = document.getElementById("cad-loader-text");
    await this.cadStage.loadModels((p) => {
      if (loaderBytes) {
        loaderBytes.textContent = `${p.name} • ${p.percent}% ${p.cached ? "(0 ms Cache)" : ""}`;
      }
    });

    const loaderWrapper = document.getElementById("cad-loader-wrapper");
    if (loaderWrapper) loaderWrapper.style.opacity = "0";

    // ── INTERACTIVE 3D HUD CONTROLS WIRING ──
    const slider = document.getElementById("cad-explosion-slider");
    const statusBadge = document.getElementById("cad-status-badge");
    const btnRotLeft = document.getElementById("btn-cad-rotate-left");
    const btnRotRight = document.getElementById("btn-cad-rotate-right");
    const btnZoomIn = document.getElementById("btn-cad-zoom-in");
    const btnZoomOut = document.getElementById("btn-cad-zoom-out");
    const btnToggle = document.getElementById("btn-cad-toggle-explode");
    const btnReset = document.getElementById("btn-cad-reset-view");

    if (btnRotLeft) btnRotLeft.addEventListener("click", () => this.cadStage.rotateLeft());
    if (btnRotRight) btnRotRight.addEventListener("click", () => this.cadStage.rotateRight());
    if (btnZoomIn) btnZoomIn.addEventListener("click", () => this.cadStage.zoomIn());
    if (btnZoomOut) btnZoomOut.addEventListener("click", () => this.cadStage.zoomOut());
    if (btnReset) btnReset.addEventListener("click", () => this.cadStage.resetView());

    let isExploded = false;
    if (btnToggle) {
      btnToggle.addEventListener("click", () => {
        isExploded = !isExploded;
        this.cadStage.setScrollProgress(isExploded ? 1.0 : 0.0);
        if (slider) slider.value = isExploded ? 100 : 0;
        btnToggle.textContent = isExploded ? "📦 Assemble" : "💥 Explode";
      });
    }

    if (slider) {
      slider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.cadStage.setScrollProgress(val);
      });
    }

    // Dynamic progress feedback callback
    this.cadStage.onProgressChange = (p) => {
      const pct = Math.round(p * 100);
      if (slider && document.activeElement !== slider) {
        slider.value = pct;
      }
      if (statusBadge) {
        if (pct >= 95) {
          statusBadge.textContent = "100% FULLY EXPLODED ↓ SCROLL DOWN FOR HARDWARE STACK";
          statusBadge.style.color = "#4ade80";
          statusBadge.style.borderColor = "rgba(74, 222, 128, 0.4)";
        } else {
          statusBadge.textContent = `EXPLODING SILICON ARCHITECTURE (${pct}%) • SCROLL TO EXPAND`;
          statusBadge.style.color = "var(--text-secondary)";
          statusBadge.style.borderColor = "var(--border-medium)";
        }
      }
    };

    // Track scroll through the 380vh sticky stage
    window.addEventListener("scroll", () => {
      const rect = container.getBoundingClientRect();
      const totalDist = container.offsetHeight - window.innerHeight;
      if (totalDist > 0) {
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / totalDist));
        this.cadStage.setScrollProgress(progress);
      }
    });
  }

  async _initTelemetryEngine() {
    this.telemetry = new TelemetryEngine("./data/multi_session_telemetry.json");
    await this.telemetry.load();
    this._drawDwtWaveformChart();
  }

  _initInteractiveWidgets() {
    if (!this.telemetry || !this.telemetry.data) return;

    const timeseries = this.telemetry.data.timeseries || [];
    const provenance = this.telemetry.data.provenance || [];

    // 1. Initialize 3D Scientific WebGL Graph (Arrhenius Surface & State Space)
    const canvas3D = document.getElementById("webgl-3d-graph-canvas");
    const hudPointReadout = document.getElementById("hud-point-readout");
    const modeDesc = document.getElementById("mode-desc-text");

    if (canvas3D && typeof THREE !== "undefined") {
      this.scientific3d = new Scientific3DGraph(canvas3D, timeseries, {
        onPointHover: (data) => {
          if (!hudPointReadout) return;
          if (data) {
            hudPointReadout.textContent = `Timestamp: ${data.time} | T: ${data.temp}°C | RH: ${data.hum}% | k: ${data.k_decay}× | MQ-3: ${data.mq3_rs} kΩ`;
            hudPointReadout.style.color = "#38bdf8";
          } else {
            hudPointReadout.textContent = "Hover nodes to inspect raw telemetry coordinates";
            hudPointReadout.style.color = "#facc15";
          }
        }
      });

      this.webglPool.registerSlot(canvas3D, {
        onActivate: () => this.scientific3d.start(),
        onDeactivate: () => this.scientific3d.stop()
      });

      // Mode Switcher Buttons
      const btnSurface = document.getElementById("btn-mode-surface");
      const btnTraj = document.getElementById("btn-mode-trajectory");

      if (btnSurface && btnTraj) {
        btnSurface.addEventListener("click", () => {
          this.scientific3d.setMode("surface");
          btnSurface.style.background = "var(--text-primary)";
          btnSurface.style.color = "#000";
          btnTraj.style.background = "transparent";
          btnTraj.style.color = "var(--text-secondary)";
          if (modeDesc) {
            modeDesc.innerHTML = "Interactive 3D degradation velocity manifold \\(k = A \\exp(-E_a/RT) \\cdot f(\\text{RH})\\). Glowing nodes represent actual operating telemetry logged along the Khardaha transit route.";
            if (window.renderMathInElement) window.renderMathInElement(modeDesc);
          }
        });

        btnTraj.addEventListener("click", () => {
          this.scientific3d.setMode("trajectory");
          btnTraj.style.background = "var(--text-primary)";
          btnTraj.style.color = "#000";
          btnSurface.style.background = "transparent";
          btnSurface.style.color = "var(--text-secondary)";
          if (modeDesc) {
            modeDesc.innerHTML = "3D Chemisorption state-space trajectory \\([MQ_{135}, MQ_3, MQ_4]\\) tracking cargo spoilage evolution through the 7 biological degradation stages.";
            if (window.renderMathInElement) window.renderMathInElement(modeDesc);
          }
        });
      }

      const btnReset3D = document.getElementById("btn-reset-3d-graph");
      if (btnReset3D) {
        btnReset3D.addEventListener("click", () => this.scientific3d.resetView());
      }
    }

    // 2. Initialize 2D IEEE Telemetry Curves
    const canvas2D = document.getElementById("ieee-2d-chart-canvas");
    const ieeeHoverReadout = document.getElementById("ieee-hover-readout");
    if (canvas2D) {
      this.telemetry.drawIeee2DChart(canvas2D, timeseries, (d) => {
        if (!ieeeHoverReadout) return;
        if (d) {
          ieeeHoverReadout.textContent = `Time: ${d.time} · MQ-3: ${d.mq3_rs} kΩ · MQ-135: ${d.mq135_rs} kΩ · T: ${d.temp}°C · RH: ${d.hum}%`;
          ieeeHoverReadout.style.color = "#ffffff";
        } else {
          ieeeHoverReadout.textContent = "Scrub canvas for real-time sample crosshair";
          ieeeHoverReadout.style.color = "var(--text-secondary)";
        }
      });
    }

    // 3. Initialize CSV Telemetry Provenance Vault
    this._initProvenanceVault(provenance);
  }

  _initProvenanceVault(provenanceList) {
    const tabsBar = document.getElementById("provenance-tabs-bar");
    const titleEl = document.getElementById("meta-session-title");
    const countsEl = document.getElementById("meta-session-counts");
    const shaEl = document.getElementById("meta-session-sha256");
    const descEl = document.getElementById("meta-session-desc");
    const downloadBtn = document.getElementById("btn-download-active-csv");
    const table = document.getElementById("provenance-raw-table");

    if (!tabsBar || !provenanceList.length) return;

    tabsBar.innerHTML = "";

    const renderActiveSession = (session) => {
      if (titleEl) titleEl.textContent = session.title;
      if (countsEl) countsEl.textContent = `${session.lineCount.toLocaleString()} Records · ${(session.sizeBytes / 1024).toFixed(0)} KB`;
      if (shaEl) shaEl.textContent = session.sha256;
      if (descEl) descEl.textContent = session.desc;
      if (downloadBtn) {
        downloadBtn.href = session.downloadUrl;
        downloadBtn.setAttribute("download", session.filename);
        const spanText = downloadBtn.querySelector("span:last-child");
        if (spanText) spanText.textContent = `Download Raw CSV (${(session.sizeBytes / 1024).toFixed(0)} KB)`;
      }

      // Render Table Header & Rows
      if (table) {
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");
        if (thead && tbody) {
          thead.innerHTML = `<tr>${session.header.map(h => `<th style="padding: 0.45rem 0.6rem; border-bottom: 1px solid var(--border-medium); color: var(--text-tertiary); font-weight: 500; font-family: var(--font-mono); font-size: 0.72rem;">${h.trim()}</th>`).join("")}</tr>`;
          tbody.innerHTML = session.sampleRows.map((row, idx) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}; font-family: var(--font-mono); font-size: 0.72rem;">
              ${row.map(c => `<td style="padding: 0.4rem 0.6rem; color: rgba(255,255,255,0.85);">${c.trim()}</td>`).join("")}
            </tr>
          `).join("");
        }
      }
    };

    provenanceList.forEach((sess, idx) => {
      const tabBtn = document.createElement("button");
      tabBtn.type = "button";
      tabBtn.className = "mono-tag clickable";
      tabBtn.style.padding = "0.35rem 0.8rem";
      tabBtn.style.fontSize = "0.72rem";
      tabBtn.style.whiteSpace = "nowrap";
      tabBtn.style.cursor = "pointer";
      tabBtn.style.border = "1px solid var(--border-subtle)";
      tabBtn.textContent = sess.filename;

      if (idx === 0) {
        tabBtn.style.background = "var(--text-primary)";
        tabBtn.style.color = "#000000";
        tabBtn.style.borderColor = "var(--text-primary)";
        renderActiveSession(sess);
      } else {
        tabBtn.style.background = "rgba(255,255,255,0.04)";
        tabBtn.style.color = "var(--text-secondary)";
      }

      tabBtn.addEventListener("click", () => {
        tabsBar.querySelectorAll("button").forEach(b => {
          b.style.background = "rgba(255,255,255,0.04)";
          b.style.color = "var(--text-secondary)";
          b.style.borderColor = "var(--border-subtle)";
        });
        tabBtn.style.background = "var(--text-primary)";
        tabBtn.style.color = "#000000";
        tabBtn.style.borderColor = "var(--text-primary)";
        renderActiveSession(sess);
      });

      tabsBar.appendChild(tabBtn);
    });
  }

  _drawDwtWaveformChart() {
    const canvas = document.getElementById("dwt-chart-canvas");
    if (!canvas || !this.telemetry || !this.telemetry.data) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 280 * 2;
    ctx.scale(2, 2);

    const samples = this.telemetry.data.timeseries || [];
    if (!samples.length) return;

    const rawSignal = samples.map(s => s.mq3_raw);
    const denoised = this.telemetry.applyHaarDWT(rawSignal);

    const w = rect.width;
    const h = 280;
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const minVal = Math.min(...rawSignal) - 5;
    const maxVal = Math.max(...rawSignal) + 5;
    const stepX = w / (samples.length - 1);

    // 1. Draw Raw Signal (Subtle Gray)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    samples.forEach((s, i) => {
      const x = i * stepX;
      const y = h - ((s.mq3_raw - minVal) / (maxVal - minVal)) * (h - 80) - 40;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 2. Draw DWT Wavelet Filtered Signal (Crisp Emerald)
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    denoised.forEach((val, i) => {
      const x = i * stepX;
      const y = h - ((val - minVal) / (maxVal - minVal)) * (h - 80) - 40;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  _initDocumentAndVideoHooks() {
    // Video triggers
    document.querySelectorAll("[data-video-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-video-id");
        const title = btn.getAttribute("data-video-title");
        this.modals.openVideo(id, title);
      });
    });

    // PDF Preview triggers
    document.querySelectorAll("[data-pdf-path]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const path = btn.getAttribute("data-pdf-path");
        const title = btn.getAttribute("data-pdf-title");
        if (path.endsWith(".docx")) return; // Let default browser download handler manage docx
        e.preventDefault();
        this.modals.openPdf(path, title);
      });
    });
  }

  _initScrollTracker() {
    const dots = document.querySelectorAll(".tracker-dot");
    const sections = ["cad-stage-section", "zone-hardware", "zone-telemetry", "zone-dossier"];

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY + window.innerHeight / 2;
      sections.forEach((id, idx) => {
        const sec = document.getElementById(id);
        if (sec) {
          const top = sec.offsetTop;
          const height = sec.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            dots.forEach(d => d.classList.remove("active"));
            if (dots[idx]) dots[idx].classList.add("active");
          }
        }
      });
    });
  }
}

new ShowcaseApp();
