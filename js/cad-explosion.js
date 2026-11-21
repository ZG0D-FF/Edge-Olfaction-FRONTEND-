/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — THREE.JS EXPLODED CAD STAGE
   Authentic Hardware GLBs · 3-Axis Mechanical Scroll Disassembly
   ════════════════════════════════════════════════════════════════ */

import { fetchWithCache } from "./assets-cache.js";
import { CONFIG } from "./config.js";

export class CadExplosionStage {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = options;
    this.scrollProgress = 0;
    this.targetProgress = 0;
    this.isRendering = false;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Interactive Mouse Orbit & Zoom State
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.manualRotation = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.targetZoom = 5.2;
    this.currentZoom = 5.2;
    this.onProgressChange = null;

    this.parts = {
      acrylicLid: null,
      mqArray: null,
      arduino: null,
      raspberryPi: null,
      enclosureBase: null,
      wires: null
    };

    this._initScene();
    this._initLighting();
    this._initProceduralEnclosure();
    this._bindEvents();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent so ambient video shines through

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    // Top-Isometric Camera Angle
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0.1, 0.85, 5.2);
    this.camera.lookAt(0.1, 0.05, 0);

    this.canvas.style.cursor = "grab";
    this.canvas.style.touchAction = "none";

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.assemblyGroup = new THREE.Group();
    this.scene.add(this.assemblyGroup);
    this._updateAssemblyLayout();
  }

  _updateAssemblyLayout() {
    if (window.innerWidth > 1100) {
      this.assemblyGroup.position.x = 0.40;
    } else {
      this.assemblyGroup.position.x = 0.0;
    }
  }

  _initLighting() {
    // Clean studio lighting — zero neon or saturated glows
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.0);
    keyLight.position.set(4, 8, 5);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xedf2f7, 1.2);
    fillLight.position.set(-4, 3, 3);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(0, -3, -4);
    this.scene.add(rimLight);
  }

  _initProceduralEnclosure() {
    // 1. Top Laser-Cut Chamfered Transparent Acrylic Chamber Lid
    const lidGeo = new THREE.BoxGeometry(1.65, 0.025, 1.25);
    const lidMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5f8ff,
      transmission: 0.96,
      opacity: 0.35,
      transparent: true,
      roughness: 0.04,
      ior: 1.48,
      metalness: 0.05,
      reflectivity: 0.9
    });
    this.parts.acrylicLid = new THREE.Mesh(lidGeo, lidMat);
    this.parts.acrylicLid.position.set(0, 0.38, 0);
    const lidEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(lidGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    this.parts.acrylicLid.add(lidEdges);
    this.assemblyGroup.add(this.parts.acrylicLid);

    // 2. Bottom CNC Matte Anodized Aluminum Chassis Base
    const baseGeo = new THREE.BoxGeometry(1.7, 0.035, 1.3);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x121215,
      roughness: 0.45,
      metalness: 0.7
    });
    this.parts.enclosureBase = new THREE.Mesh(baseGeo, baseMat);
    this.parts.enclosureBase.position.set(0, -0.38, 0);
    const baseEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(baseGeo),
      new THREE.LineBasicMaterial({ color: 0x4a4a58, transparent: true, opacity: 0.5 })
    );
    this.parts.enclosureBase.add(baseEdges);
    this.assemblyGroup.add(this.parts.enclosureBase);
  }

  async loadModels(onProgress) {
    const loader = new THREE.GLTFLoader();

    // Attach DRACOLoader for compressed glTF models
    if (typeof THREE.DRACOLoader !== "undefined") {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderConfig({ type: "js" });
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
      loader.setDRACOLoader(dracoLoader);
    }

    try {
      // 1. Load Arduino Uno R3 (Average-Poly, 66 KB)
      const arduinoBlob = await fetchWithCache(CONFIG.models3D.arduino, (p) => {
        if (onProgress) onProgress({ name: "Arduino Uno R3", ...p });
      });
      const arduinoUrl = URL.createObjectURL(arduinoBlob);
      const arduinoGltf = await this._loadGltfPromise(loader, arduinoUrl);
      this.parts.arduino = this._createNormalizedContainer(arduinoGltf.scene, 1.2);
      this.parts.arduino.position.set(-0.18, -0.08, 0);
      this.assemblyGroup.add(this.parts.arduino);

      // 2. Load Raspberry Pi 4B (Average-Poly PBR, 343 KB)
      const piBlob = await fetchWithCache(CONFIG.models3D.raspberryPi, (p) => {
        if (onProgress) onProgress({ name: "Raspberry Pi 4B", ...p });
      });
      const piUrl = URL.createObjectURL(piBlob);
      const piGltf = await this._loadGltfPromise(loader, piUrl);

      // Hide white 3D-printed enclosure bracket so ONLY the bare green Raspberry Pi 4B PCB is visible
      piGltf.scene.traverse((child) => {
        const n = (child.name || "").toLowerCase();
        if (n.includes("housing") || n.includes("body") || n.includes("shielding (2)") || n.startsWith("compound")) {
          child.visible = false;
        }
      });

      this.parts.raspberryPi = this._createNormalizedContainer(piGltf.scene, 1.2);
      this.parts.raspberryPi.position.set(0.18, -0.08, 0);
      this.assemblyGroup.add(this.parts.raspberryPi);

      // 3. Load MQ Sensor Breakout (Authentic KiCad PCB + 4 SnO2 Gas Canisters)
      const mqBlob = await fetchWithCache(CONFIG.models3D.mqSensor, (p) => {
        if (onProgress) onProgress({ name: "MQ Gas Sensor Array", ...p });
      });
      const mqUrl = URL.createObjectURL(mqBlob);
      const mqGltf = await this._loadGltfPromise(loader, mqUrl);
      this.parts.mqArray = this._createNormalizedContainer(mqGltf.scene, 1.25);

      // Mount the 4 Authentic Cylindrical MQ Gas Sensors directly onto the PCB footprints
      const sensorsConfig = [
        { label: "MQ-135", x: -0.32, z: -0.20 },
        { label: "MQ-3",   x:  0.32, z: -0.20 },
        { label: "MQ-4",   x: -0.32, z:  0.20 },
        { label: "MQ-2",   x:  0.32, z:  0.20 }
      ];

      sensorsConfig.forEach((cfg) => {
        const can = this._createMqSensorCanister(cfg.label);
        can.position.set(cfg.x, 0.02, cfg.z);
        this.parts.mqArray.add(can);
      });

      this.parts.mqArray.position.set(0, 0.18, 0.04);
      this.assemblyGroup.add(this.parts.mqArray);

    } catch (err) {
      console.warn("[CadExplosionStage] Model loading fallback", err);
    }
  }

  _createMqSensorCanister(label) {
    const canister = new THREE.Group();

    // 1. Bottom Dark Bakelite Collar Ring
    const collarGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.035, 32);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.8,
      metalness: 0.15
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = 0.018;
    canister.add(collar);

    // 2. Stainless Steel Cylinder Mesh Body
    const meshGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.10, 32);
    const meshMat = new THREE.MeshStandardMaterial({
      color: 0xd8dbe2,
      metalness: 0.92,
      roughness: 0.22
    });
    const meshCylinder = new THREE.Mesh(meshGeo, meshMat);
    meshCylinder.position.y = 0.085;
    canister.add(meshCylinder);

    // 3. Woven Wire Mesh Outer Screen (Fine wireframe overlay)
    const screenGeo = new THREE.CylinderGeometry(0.111, 0.111, 0.098, 24, 4, true);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x6e727e,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.y = 0.085;
    canister.add(screenMesh);

    // 4. Polished Metal Top Cap Rim
    const capGeo = new THREE.CylinderGeometry(0.112, 0.112, 0.015, 32);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xecf0f6,
      metalness: 0.95,
      roughness: 0.12
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.142;
    canister.add(cap);

    // 5. Internal Heating Element (Orange ceramic core under mesh)
    const coreGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.065, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xdd6b20,
      roughness: 0.6,
      metalness: 0.1
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.08;
    canister.add(core);

    // 6. Gold Terminal Pins (6-pin circular header underneath)
    const pinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.2
    });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(Math.cos(angle) * 0.07, -0.025, Math.sin(angle) * 0.07);
      canister.add(pin);
    }

    // 7. Sensor Model Label Tag Badge (MQ-135, MQ-3, etc.)
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#16161a";
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = "#4a4a58";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 128, 33);

    const labelTex = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(0.14, 0.035);
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0.018, 0.118);
    canister.add(labelMesh);

    return canister;
  }

  _createNormalizedContainer(object, targetDimension) {
    const container = new THREE.Group();
    container.add(object);

    // Compute bounding box across all children
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Uniformly scale object directly, keeping container at (1,1,1)
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = targetDimension / maxDim;
      object.scale.set(scale, scale, scale);
      object.position.sub(center.clone().multiplyScalar(scale));
    } else {
      object.position.sub(center);
    }

    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.side = THREE.DoubleSide;
        }
      }
    });

    return container;
  }

  _loadGltfPromise(loader, url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  setScrollProgress(progress) {
    this.targetProgress = Math.max(0, Math.min(1, progress));
  }

  _bindEvents() {
    window.addEventListener("resize", () => this._onResize());

    // Mouse Drag Orbit
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = "grab";
      }
    });

    window.addEventListener("mousemove", (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.isDragging) {
        const dx = e.clientX - this.prevMouse.x;
        const dy = e.clientY - this.prevMouse.y;
        this.manualRotation.targetY += dx * 0.007;
        this.manualRotation.targetX += dy * 0.007;
        this.manualRotation.targetX = Math.max(-0.65, Math.min(0.65, this.manualRotation.targetX));
        this.prevMouse = { x: e.clientX, y: e.clientY };
      }
    });

    // Touch Drag Orbit for Mobile / Trackpad
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener("touchend", () => {
      this.isDragging = false;
    });

    window.addEventListener("touchmove", (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - this.prevMouse.x;
        const dy = e.touches[0].clientY - this.prevMouse.y;
        this.manualRotation.targetY += dx * 0.007;
        this.manualRotation.targetX += dy * 0.007;
        this.manualRotation.targetX = Math.max(-0.65, Math.min(0.65, this.manualRotation.targetX));
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    // Wheel Zoom on Canvas
    this.canvas.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > 0) {
        this.targetZoom += e.deltaY * 0.0025;
        this.targetZoom = Math.max(2.4, Math.min(6.5, this.targetZoom));
      }
    }, { passive: true });
  }

  rotateLeft(step = 0.35) {
    this.manualRotation.targetY -= step;
  }

  rotateRight(step = 0.35) {
    this.manualRotation.targetY += step;
  }

  zoomIn(step = 0.45) {
    this.targetZoom = Math.max(2.4, this.targetZoom - step);
  }

  zoomOut(step = 0.45) {
    this.targetZoom = Math.min(6.5, this.targetZoom + step);
  }

  resetView() {
    this.manualRotation.targetX = 0;
    this.manualRotation.targetY = 0;
    this.targetZoom = 5.2;
  }

  _onResize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this._updateAssemblyLayout();
  }

  start() {
    if (this.isRendering) return;
    this.isRendering = true;
    this._renderLoop();
  }

  stop() {
    this.isRendering = false;
  }

  _renderLoop() {
    if (!this.isRendering) return;
    requestAnimationFrame(() => this._renderLoop());

    // Smooth scroll and drag interpolation
    this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.08;
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    this.manualRotation.x += (this.manualRotation.targetX - this.manualRotation.x) * 0.08;
    this.manualRotation.y += (this.manualRotation.targetY - this.manualRotation.y) * 0.08;
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.08;

    this.camera.position.z = this.currentZoom;

    if (this.onProgressChange) {
      this.onProgressChange(this.scrollProgress);
    }

    const p = this.scrollProgress;

    // ── 3-AXIS MECHANICAL EXPLOSION INTERPOLATION ──
    // 1. Acrylic Lid lifts upwards and floats
    if (this.parts.acrylicLid) {
      this.parts.acrylicLid.position.y = 0.38 + p * 1.05;
      this.parts.acrylicLid.rotation.x = p * 0.10;
    }

    // 2. MQ Sensor Array separates upward-forward
    if (this.parts.mqArray) {
      this.parts.mqArray.position.y = 0.18 + p * 0.65;
      this.parts.mqArray.position.z = 0.04 + p * 0.40;
      this.parts.mqArray.rotation.x = -p * 0.16;
    }

    // 3. Arduino Uno steps down and left
    if (this.parts.arduino) {
      this.parts.arduino.position.x = -0.18 - p * 0.50;
      this.parts.arduino.position.y = -0.08 - p * 0.30;
      this.parts.arduino.rotation.y = -p * 0.30;
    }

    // 4. Raspberry Pi 4B steps down and right
    if (this.parts.raspberryPi) {
      this.parts.raspberryPi.position.x = 0.18 + p * 0.50;
      this.parts.raspberryPi.position.y = -0.08 - p * 0.30;
      this.parts.raspberryPi.rotation.y = p * 0.30;
    }

    // 5. Enclosure Base drops down
    if (this.parts.enclosureBase) {
      this.parts.enclosureBase.position.y = -0.38 - p * 0.40;
    }

    // Gentle camera orbit + manual drag orbit + mouse parallax
    this.assemblyGroup.rotation.y = p * 0.75 + this.manualRotation.y + this.mouse.x * 0.05;
    this.assemblyGroup.rotation.x = -0.12 + this.manualRotation.x + this.mouse.y * 0.04;

    this.renderer.render(this.scene, this.camera);
  }
}
