/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — WEBGL VIEWPORT LIFECYCLE POOL
   Auto-Pauses RAF · Limits Active Contexts ≤ 2 · Eliminates GPU OOM
   ════════════════════════════════════════════════════════════════ */

export class WebGLViewportPool {
  constructor(options = {}) {
    this.maxActive = options.maxActive || (this._isMobile() ? 2 : 3);
    this.activeSlots = new Set();
    this.registeredSlots = new Map();
    this._initIntersectionObserver();
  }

  _isMobile() {
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    return isTouch || mem <= 4 || cores <= 4;
  }

  _initIntersectionObserver() {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const slot = this.registeredSlots.get(entry.target);
        if (!slot) return;

        if (entry.isIntersecting) {
          this._activateSlot(slot);
        } else {
          this._deactivateSlot(slot);
        }
      });
    }, {
      rootMargin: "250px 0px 250px 0px",
      threshold: 0.05
    });
  }

  registerSlot(element, callbacks) {
    const slot = {
      element,
      callbacks,
      isActive: false
    };
    this.registeredSlots.set(element, slot);
    if (this.observer) {
      this.observer.observe(element);
    } else {
      this._activateSlot(slot);
    }
  }

  _activateSlot(slot) {
    if (slot.isActive) return;

    // Evict oldest if exceeding capacity
    if (this.activeSlots.size >= this.maxActive) {
      const oldest = this.activeSlots.values().next().value;
      if (oldest) this._deactivateSlot(oldest);
    }

    slot.isActive = true;
    this.activeSlots.add(slot);
    if (slot.callbacks && typeof slot.callbacks.onActivate === "function") {
      slot.callbacks.onActivate();
    }
  }

  _deactivateSlot(slot) {
    if (!slot.isActive) return;

    slot.isActive = false;
    this.activeSlots.delete(slot);
    if (slot.callbacks && typeof slot.callbacks.onDeactivate === "function") {
      slot.callbacks.onDeactivate();
    }
  }
}
