/* ════════════════════════════════════════════════════════════════
   EDGE-OLFACTION SHOWCASE — 3D SCIENTIFIC TELEMETRY GRAPH
   Interactive 3D Arrhenius Manifold & Multi-Sensor State Space
   100% Empirically Aligned with Real CSV Data & IEEE Manuscript
   ════════════════════════════════════════════════════════════════ */

export class Scientific3DGraph {
  constructor(canvasElement, timeseriesData, options = {}) {
    this.canvas = canvasElement;
    this.data = timeseriesData || [];
    this.options = options;
    this.mode = "surface"; // "surface" | "trajectory"
    this.isRendering = false;

    // View & Orbit
    this.orbit = {
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      rotX: 0.45,
      rotY: -0.65,
      targetRotX: 0.45,
      targetRotY: -0.65,
      zoom: 3.8,
      targetZoom: 3.8
    };

    this.activePoint = null;
    this.onPointHover = options.onPointHover || null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);

    this.surfaceGroup = new THREE.Group();
    this.trajectoryGroup = new THREE.Group();

    this._initScene();
    this._buildArrheniusSurface();
    this._buildTrajectorySpace();
    this._bindEvents();

    this.setMode("surface");
  }

  _initScene() {
    const width = this.canvas.clientWidth || 600;
    const height = this.canvas.clientHeight || 340;

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 0, this.orbit.zoom);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Studio Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0x60a5fa, 1.8);
    dir1.position.set(3, 5, 4);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xf59e0b, 1.4);
    dir2.position.set(-3, -2, -3);
    this.scene.add(dir2);

    this.graphRoot = new THREE.Group();
    this.graphRoot.add(this.surfaceGroup);
    this.graphRoot.add(this.trajectoryGroup);
    this.scene.add(this.graphRoot);
  }

  // ── MODE 1: 3D ARRHENIUS DEGRADATION KINETICS SURFACE ──
  _buildArrheniusSurface() {
    this.surfaceScatterMeshes = [];

    // Parametric surface: X: Temp (20°C to 42°C), Z: RH (40% to 95%), Y: k rate
    const tempSteps = 24;
    const humSteps = 24;
    const tMin = 20, tMax = 42;
    const hMin = 40, hMax = 95;

    const R = 8.314;
    const Ea = 50200;
    const T_ref = 293.15;

    const geom = new THREE.PlaneGeometry(2.4, 2.4, tempSteps, humSteps);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    const colors = [];

    let maxY = 0;
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) + 1.2) / 2.4; // 0 to 1
      const v = (pos.getZ(i) + 1.2) / 2.4; // 0 to 1

      const tC = tMin + u * (tMax - tMin);
      const hPct = hMin + v * (hMax - hMin);

      const Tk = tC + 273.15;
      const kTemp = Math.exp((-Ea / R) * ((1 / Tk) - (1 / T_ref)));
      const humFactor = hPct > 80 ? 1 + (hPct - 80) * 0.025 : 1.0;
      const k = kTemp * humFactor;

      const yVal = (k - 0.9) * 0.38; // Normalized height
      pos.setY(i, yVal);
      if (yVal > maxY) maxY = yVal;

      // Color mapping: Cyan (low k) -> Amber (moderate) -> Crimson (high decay rate)
      const normK = Math.min(1, Math.max(0, (k - 1.0) / 2.5));
      const col = new THREE.Color().setHSL(0.55 - normK * 0.55, 0.9, 0.5);
      colors.push(col.r, col.g, col.b);
    }

    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    // Semi-transparent surface
    const surfMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide
    });
    const surfMesh = new THREE.Mesh(geom, surfMat);
    this.surfaceGroup.add(surfMesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const wireMesh = new THREE.Mesh(geom, wireMat);
    this.surfaceGroup.add(wireMesh);

    // Coordinate Bounding Grid
    const grid = new THREE.GridHelper(2.4, 8, 0x3b82f6, 0x1f2937);
    grid.position.y = -0.05;
    this.surfaceGroup.add(grid);

    // Real CSV Operating Scatter Points
    const sphereGeo = new THREE.SphereGeometry(0.024, 16, 16);
    this.data.forEach((d) => {
      const u = (d.temp - tMin) / (tMax - tMin);
      const v = (d.hum - hMin) / (hMax - hMin);

      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
        const x = -1.2 + u * 2.4;
        const z = -1.2 + v * 2.4;
        const y = (d.k_decay - 0.9) * 0.38 + 0.015;

        const dotMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xd97706,
          emissiveIntensity: 0.8,
          roughness: 0.2
        });
        const dot = new THREE.Mesh(sphereGeo, dotMat);
        dot.position.set(x, y, z);
        dot.userData = d;

        this.surfaceGroup.add(dot);
        this.surfaceScatterMeshes.push(dot);
      }
    });
  }

  // ── MODE 2: 3D MULTI-SENSOR CHEMISORPTION STATE-SPACE ──
  _buildTrajectorySpace() {
    this.trajectoryPoints = [];

    // Bounding Box Frame
    const boxGeo = new THREE.BoxGeometry(2.0, 1.8, 2.0);
    const boxEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeo),
      new THREE.LineBasicMaterial({ color: 0x374151, transparent: true, opacity: 0.5 })
    );
    this.trajectoryGroup.add(boxEdges);

    // Reference Grid Floor
    const grid = new THREE.GridHelper(2.0, 6, 0x6366f1, 0x1e293b);
    grid.position.y = -0.9;
    this.trajectoryGroup.add(grid);

    // Map time-series points to 3D trajectory:
    // X = MQ-135 (VOC/NH3), Y = MQ-3 (Ethanol), Z = MQ-4 (Methane)
    const points = [];
    const sphereGeo = new THREE.SphereGeometry(0.022, 12, 12);

    this.data.forEach((d) => {
      // Scale raw readings to [-0.9, 0.9]
      const x = ((d.mq135_raw - 60) / (320 - 60)) * 1.8 - 0.9;
      const y = ((d.mq3_raw - 120) / (550 - 120)) * 1.6 - 0.8;
      const z = ((d.mq4_raw - 150) / (450 - 150)) * 1.8 - 0.9;

      const vec = new THREE.Vector3(x, y, z);
      points.push(vec);

      // Color based on VEI / Spoilage stage
      let colHex = 0x34d399; // Stage 1-2 Fresh
      if (d.vei > 220) colHex = 0xfacc15; // Stage 3 Peak
      if (d.vei > 260) colHex = 0xfb923c; // Stage 5 Spoil
      if (d.vei > 300) colHex = 0xef4444; // Stage 6-7 Critical

      const mat = new THREE.MeshStandardMaterial({
        color: colHex,
        emissive: colHex,
        emissiveIntensity: 0.6
      });
      const dot = new THREE.Mesh(sphereGeo, mat);
      dot.position.copy(vec);
      dot.userData = d;

      this.trajectoryGroup.add(dot);
      this.trajectoryPoints.push(dot);
    });

    if (points.length > 2) {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.008, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      this.trajectoryGroup.add(tube);
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === "surface") {
      this.surfaceGroup.visible = true;
      this.trajectoryGroup.visible = false;
    } else {
      this.surfaceGroup.visible = false;
      this.trajectoryGroup.visible = true;
    }
  }

  _bindEvents() {
    window.addEventListener("resize", () => this._onResize());

    this.canvas.addEventListener("mousedown", (e) => {
      this.orbit.isDragging = true;
      this.orbit.prevMouse = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
      this.orbit.isDragging = false;
      this.canvas.style.cursor = "grab";
    });

    window.addEventListener("mousemove", (e) => {
      if (this.orbit.isDragging) {
        const dx = e.clientX - this.orbit.prevMouse.x;
        const dy = e.clientY - this.orbit.prevMouse.y;
        this.orbit.targetRotY += dx * 0.008;
        this.orbit.targetRotX += dy * 0.008;
        this.orbit.targetRotX = Math.max(-1.1, Math.min(1.1, this.orbit.targetRotX));
        this.orbit.prevMouse = { x: e.clientX, y: e.clientY };
      }

      // Raycasting for scatter nodes
      const rect = this.canvas.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this._checkIntersection();
      }
    });

    this.canvas.addEventListener("wheel", (e) => {
      this.orbit.targetZoom += e.deltaY * 0.002;
      this.orbit.targetZoom = Math.max(2.2, Math.min(6.5, this.orbit.targetZoom));
    }, { passive: true });
  }

  _checkIntersection() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = this.mode === "surface" ? this.surfaceScatterMeshes : this.trajectoryPoints;
    const intersects = this.raycaster.intersectObjects(targets);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit !== this.activePoint) {
        if (this.activePoint) this.activePoint.scale.set(1, 1, 1);
        this.activePoint = hit;
        this.activePoint.scale.set(1.8, 1.8, 1.8);
        if (this.onPointHover) {
          this.onPointHover(hit.userData);
        }
      }
    } else {
      if (this.activePoint) {
        this.activePoint.scale.set(1, 1, 1);
        this.activePoint = null;
        if (this.onPointHover) {
          this.onPointHover(null);
        }
      }
    }
  }

  resetView() {
    this.orbit.targetRotX = 0.45;
    this.orbit.targetRotY = -0.65;
    this.orbit.targetZoom = 3.8;
  }

  _onResize() {
    const width = this.canvas.clientWidth || 600;
    const height = this.canvas.clientHeight || 340;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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

    // Interpolate orbit
    this.orbit.rotX += (this.orbit.targetRotX - this.orbit.rotX) * 0.1;
    this.orbit.rotY += (this.orbit.targetRotY - this.orbit.rotY) * 0.1;
    this.orbit.zoom += (this.orbit.targetZoom - this.orbit.zoom) * 0.1;

    this.camera.position.z = this.orbit.zoom;
    this.graphRoot.rotation.x = this.orbit.rotX;
    this.graphRoot.rotation.y = this.orbit.rotY;

    this.renderer.render(this.scene, this.camera);
  }
}
