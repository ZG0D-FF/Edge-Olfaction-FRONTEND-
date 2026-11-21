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

    document.body.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // Hover triggers
    const hoverTargets = document.querySelectorAll("a, button, input, .clickable, .glass-card");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
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
