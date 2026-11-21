/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — MODAL & INTERACTION CONTROLLER
   Difference Cursor · YouTube Chapter Player · SFIC PDF Previewer
   ════════════════════════════════════════════════════════════════ */

export class ModalController {
  constructor() {
    this._initCursor();
    this._initModals();
  }

  _initCursor() {
    const dot = document.getElementById("custom-cursor-dot");
    const ring = document.getElementById("custom-cursor-ring");
    if (!dot || !ring) return;

    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.body.classList.add("has-custom-cursor");

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        document.body.classList.remove("cursor-hidden");
        ringX = mouseX;
        ringY = mouseY;
      }
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      isVisible = false;
      document.body.classList.add("cursor-hidden");
    });

    document.addEventListener("mouseenter", () => {
      isVisible = true;
      document.body.classList.remove("cursor-hidden");
    });

    // Tactile click states
    window.addEventListener("mousedown", () => document.body.classList.add("cursor-active"), { passive: true });
    window.addEventListener("mouseup", () => document.body.classList.remove("cursor-active"), { passive: true });

    // Robust delegated hover detection that works reliably on all cards, links, buttons, and children
    document.addEventListener("mouseover", (e) => {
      const interactive = e.target.closest("a, button, input, .clickable, .glass-card, [role='button'], canvas, .tracker-dot");
      if (interactive) {
        document.body.classList.add("cursor-hover");
      }
    }, { passive: true });

    document.addEventListener("mouseout", (e) => {
      const nextTarget = e.relatedTarget;
      if (!nextTarget || !nextTarget.closest("a, button, input, .clickable, .glass-card, [role='button'], canvas, .tracker-dot")) {
        document.body.classList.remove("cursor-hover");
      }
    }, { passive: true });

    // Smooth physics loop for outer follower ring
    const loop = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.22;
        ringY += (mouseY - ringY) * 0.22;
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
