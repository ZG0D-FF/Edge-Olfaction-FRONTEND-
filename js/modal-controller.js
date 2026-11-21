/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — MODAL & INTERACTION CONTROLLER
   Difference Cursor · YouTube Chapter Player · SFIC PDF Previewer
   ════════════════════════════════════════════════════════════════ */

export class ModalController {
  constructor() {
    this._initCursor();
    this._initModals();
    this._initFresnelAndScroll();
    this._initIcons();
  }

  _initCursor() {
    const dot = document.getElementById("custom-cursor-dot");
    const ring = document.getElementById("custom-cursor-ring");
    const label = document.getElementById("custom-cursor-label");
    if (!dot || !ring) return;

    // Detect actual touch interaction rather than coarse media queries that false-positive on Windows laptops
    window.addEventListener("touchstart", () => {
      document.body.classList.remove("has-custom-cursor");
      document.body.classList.add("is-touch-device");
    }, { once: true, passive: true });

    document.body.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isVisible = true;

    // Initial position centered on screen so it is immediately visible
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        document.body.classList.remove("cursor-hidden");
      }
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    document.addEventListener("mouseleave", (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        isVisible = false;
        document.body.classList.add("cursor-hidden");
      }
    });

    document.addEventListener("mouseenter", () => {
      isVisible = true;
      document.body.classList.remove("cursor-hidden");
    });

    // Tactile click states
    window.addEventListener("mousedown", () => document.body.classList.add("cursor-active"), { passive: true });
    window.addEventListener("mouseup", () => document.body.classList.remove("cursor-active"), { passive: true });

    // Dynamic contextual action label resolver (aligned via /grill-me)
    const resolveContextAction = (target) => {
      if (!target) return null;

      // 1. Explicit data attribute
      const explicit = target.closest("[data-cursor]");
      if (explicit) return explicit.getAttribute("data-cursor");

      // 2. PDF dossier cards
      const pdfCard = target.closest("[data-pdf-path], a[href*='.pdf']");
      if (pdfCard) return "PREVIEW ↗";

      // 3. YouTube walkthrough chapters
      const videoCard = target.closest("[data-video-id]");
      if (videoCard) return "PLAY ▶";

      // 4. 3D CAD stage
      const cadCanvas = target.closest("#cad-canvas");
      if (cadCanvas) return "ROTATE ↺";

      // 5. 3D WebGL state-space graph
      const graphCanvas = target.closest("#webgl-3d-graph-canvas");
      if (graphCanvas) return "ROTATE ↺";

      // 6. 2D Telemetry time series canvas
      const chartCanvas = target.closest("#ieee-2d-chart-canvas");
      if (chartCanvas) return "SCRUB ↔";

      // 7. External links
      const extLink = target.closest("a[target='_blank'], a[href^='http']");
      if (extLink) return "OPEN ↗";

      return null;
    };

    // Robust delegated hover detection
    document.addEventListener("mouseover", (e) => {
      const actionText = resolveContextAction(e.target);
      if (actionText && label) {
        label.textContent = actionText;
        document.body.classList.add("cursor-pill");
        document.body.classList.remove("cursor-hover");
      } else {
        const interactive = e.target.closest("a, button, input, .clickable, .glass-card, [role='button'], .tracker-dot");
        if (interactive) {
          if (label) label.textContent = "";
          document.body.classList.remove("cursor-pill");
          document.body.classList.add("cursor-hover");
        } else {
          if (label) label.textContent = "";
          document.body.classList.remove("cursor-pill", "cursor-hover");
        }
      }
    }, { passive: true });

    document.addEventListener("mouseout", (e) => {
      const nextTarget = e.relatedTarget;
      if (!nextTarget) {
        if (label) label.textContent = "";
        document.body.classList.remove("cursor-pill", "cursor-hover");
        return;
      }
      const actionText = resolveContextAction(nextTarget);
      if (actionText && label) {
        label.textContent = actionText;
        document.body.classList.add("cursor-pill");
        document.body.classList.remove("cursor-hover");
      } else if (nextTarget.closest("a, button, input, .clickable, .glass-card, [role='button'], .tracker-dot")) {
        if (label) label.textContent = "";
        document.body.classList.remove("cursor-pill");
        document.body.classList.add("cursor-hover");
      } else {
        if (label) label.textContent = "";
        document.body.classList.remove("cursor-pill", "cursor-hover");
      }
    }, { passive: true });

    // Snappy High-Frequency Spring Loop (lerp 0.24)
    const loop = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.24;
        ringY += (mouseY - ringY) * 0.24;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _initModals() {
    this.videoModal = document.getElementById("video-modal");
    this.videoFrame = document.getElementById("video-modal-iframe");
    this.videoTitle = document.getElementById("video-modal-title");

    this.pdfModal = document.getElementById("pdf-modal");
    this.pdfFrame = document.getElementById("pdf-modal-iframe");
    this.pdfTitle = document.getElementById("pdf-modal-title");
    this.pdfDownload = document.getElementById("pdf-modal-download");

    // Close buttons & Backdrop clicks
    document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach((btn) => {
      btn.addEventListener("click", () => this.closeAll());
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeAll();
    });
  }

  openVideo(youtubeId, title) {
    if (!this.videoModal || !this.videoFrame) return;
    this.videoTitle.textContent = title || "Demonstration Walkthrough";
    this.videoFrame.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
    this.videoModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  openPdf(filePath, title) {
    if (!this.pdfModal || !this.pdfFrame) return;
    this.pdfTitle.textContent = title || "Document Dossier";
    this.pdfFrame.src = filePath;
    if (this.pdfDownload) {
      this.pdfDownload.href = filePath;
    }
    this.pdfModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  _initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      });
    }
  }

  _initFresnelAndScroll() {
    // Roving Dual-Layer Fresnel edge reflection
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".glass-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    }, { passive: true });

    // Staggered scroll reveal
    const cards = document.querySelectorAll(".glass-card, .metric-tile");
    cards.forEach((el, index) => {
      el.classList.add("scroll-reveal");
      el.style.transitionDelay = `${(index % 4) * 0.08}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach((el) => observer.observe(el));
  }

  closeAll() {
    if (this.videoModal) {
      this.videoModal.classList.remove("active");
      if (this.videoFrame) this.videoFrame.src = "";
    }
    if (this.pdfModal) {
      this.pdfModal.classList.remove("active");
      if (this.pdfFrame) this.pdfFrame.src = "";
    }
    document.body.style.overflow = "";
  }
}
