import * as THREE from 'three';
import { decodeTopo, latLonToVec3, type TopoFeature } from './geo';
import { CURVES, THEMES, type GlobeTheme, type ThemeName, type VizMode } from './themes';
import type { GlobeCountry } from './types';
import topoData from './world-topo.json';

interface GlobeCallbacks {
  onHover: (country: GlobeCountry | null, clientX: number, clientY: number) => void;
  onSelect: (country: GlobeCountry) => void;
  onDeselect: () => void;
}

/**
 * Framework-agnostic Three.js globe. Ported from the MVP's DCLogic component so
 * the visual design is preserved exactly; React only drives it via setters.
 */
export class GlobeEngine {
  private readonly el: HTMLElement;
  private readonly cb: GlobeCallbacks;

  private countries: GlobeCountry[] = [];
  private byIso: Record<string, GlobeCountry> = {};
  private features: TopoFeature[] = [];
  private maxU = 1;

  private year = 2026;
  private themeName: ThemeName = 'Mission Control';
  private viz: VizMode = 'dots';
  private autoRotate = true;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private outer!: THREE.Group;
  private inner!: THREE.Group;
  private globe!: THREE.Mesh;
  private globeMat!: THREE.MeshPhongMaterial;
  private dots!: THREE.InstancedMesh;
  private halos!: THREE.InstancedMesh;
  private bars!: THREE.InstancedMesh;
  private dotMat!: THREE.MeshBasicMaterial;
  private haloMat!: THREE.MeshBasicMaterial;
  private barMat!: THREE.MeshBasicMaterial;
  private hl!: THREE.Mesh;
  private tex?: THREE.CanvasTexture;
  private texCanvas?: HTMLCanvasElement;

  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private raf = 0;
  private lastPointer = Date.now();
  private drag: { x: number; y: number; moved: number } | null = null;
  private anim: { t0: number; dur: number; fromY: number; toY: number; fromX: number; toX: number } | null =
    null;
  private hoverIdx: number | null = null;
  private disposed = false;

  constructor(el: HTMLElement, callbacks: GlobeCallbacks) {
    this.el = el;
    this.cb = callbacks;
  }

  private theme(): GlobeTheme {
    return THEMES[this.themeName];
  }

  private yearFactor(c: GlobeCountry, year: number): number {
    return CURVES[c.curve][year - 2023];
  }

  private usageAt(c: GlobeCountry, year: number): number {
    return c.usage * this.yearFactor(c, year);
  }

  // ---- Public API -----------------------------------------------------------

  init(): void {
    this.features = decodeTopo(topoData as never);
    this.setupScene();
    this.startLoop();
  }

  setData(countries: GlobeCountry[]): void {
    this.countries = countries;
    this.byIso = {};
    countries.forEach((c) => (this.byIso[c.iso3] = c));
    this.maxU = Math.max(1, ...countries.map((c) => c.usage));
    if (this.dots) {
      this.rebuildInstancedMeshes();
      this.updateInstances();
      this.redrawTexture();
    }
  }

  setYear(year: number): void {
    this.year = year;
    if (!this.dots) return;
    this.updateInstances();
    if (this.viz === 'heat') this.redrawTexture();
  }

  setTheme(name: ThemeName): void {
    this.themeName = name;
    this.applyTheme();
  }

  setViz(viz: VizMode): void {
    this.viz = viz;
    this.applyViz();
  }

  setAutoRotate(on: boolean): void {
    this.autoRotate = on;
  }

  focusCountry(iso3: string): void {
    const c = this.byIso[iso3];
    if (c) this.rotateTo(c);
  }

  resize(): void {
    if (!this.renderer) return;
    const w = this.el.clientWidth;
    const h = this.el.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }

  // ---- Scene setup ----------------------------------------------------------

  private setupScene(): void {
    const w = this.el.clientWidth;
    const h = this.el.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    this.camera.position.z = 3.1;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.el.appendChild(this.renderer.domElement);

    this.outer = new THREE.Group();
    this.inner = new THREE.Group();
    this.outer.add(this.inner);
    this.scene.add(this.outer);
    this.outer.rotation.x = 0.28;
    this.inner.rotation.y = 2.2;

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 2, 4);
    this.scene.add(dir);

    this.globeMat = new THREE.MeshPhongMaterial({ color: 0x101a2a, shininess: 4 });
    this.globe = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), this.globeMat);
    this.inner.add(this.globe);

    const accCol = new THREE.Color(this.theme().acc);
    this.dotMat = new THREE.MeshBasicMaterial({ color: accCol });
    this.haloMat = new THREE.MeshBasicMaterial({
      color: accCol,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.barMat = new THREE.MeshBasicMaterial({ color: accCol });

    this.hl = new THREE.Mesh(
      new THREE.RingGeometry(0.028, 0.036, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      })
    );
    this.hl.visible = false;
    this.inner.add(this.hl);

    this.rebuildInstancedMeshes();
    this.applyTheme();
    this.applyViz();
    this.bindPointer();
  }

  private rebuildInstancedMeshes(): void {
    [this.dots, this.halos, this.bars].forEach((m) => {
      if (m) {
        this.inner.remove(m);
        m.geometry.dispose();
      }
    });
    const count = Math.max(1, this.countries.length);
    const dotGeo = new THREE.SphereGeometry(0.011, 10, 10);
    this.dots = new THREE.InstancedMesh(dotGeo, this.dotMat, count);
    this.halos = new THREE.InstancedMesh(dotGeo.clone(), this.haloMat, count);
    this.bars = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 6), this.barMat, count);
    this.inner.add(this.dots);
    this.inner.add(this.halos);
    this.inner.add(this.bars);
    this.applyViz();
  }

  private startLoop(): void {
    const loop = (): void => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      if (this.anim) {
        const a = this.anim;
        const p = Math.min(1, (Date.now() - a.t0) / a.dur);
        const e2 = 1 - Math.pow(1 - p, 3);
        this.inner.rotation.y = a.fromY + (a.toY - a.fromY) * e2;
        this.outer.rotation.x = a.fromX + (a.toX - a.fromX) * e2;
        if (p >= 1) this.anim = null;
      } else if (this.autoRotate && Date.now() - this.lastPointer > 2500) {
        this.inner.rotation.y += 0.0012;
      }
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  // ---- Rendering ------------------------------------------------------------

  private updateInstances(): void {
    if (!this.countries.length) return;
    const heat = this.viz === 'heat';
    this.haloMat.opacity = 0.22;
    const M = new THREE.Matrix4();
    const Q = new THREE.Quaternion();
    const S = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    this.countries.forEach((c, i) => {
      const u = this.usageAt(c, this.year);
      const rel = Math.sqrt(u / this.maxU);
      const s = (0.55 + 3.1 * rel) * (heat ? 0.5 : 1);
      const pos = latLonToVec3(c.lat, c.lon, 1.012);
      Q.identity();
      S.set(s, s, s);
      M.compose(pos, Q, S);
      this.dots.setMatrixAt(i, M);
      const hs = s * 2.1;
      S.set(hs, hs, hs);
      M.compose(pos, Q, S);
      this.halos.setMatrixAt(i, M);
      const h = 0.03 + 0.55 * rel;
      const n = pos.clone().normalize();
      Q.setFromUnitVectors(up, n);
      S.set(0.0065, h, 0.0065);
      M.compose(n.clone().multiplyScalar(1.0 + h / 2), Q, S);
      this.bars.setMatrixAt(i, M);
    });
    this.dots.instanceMatrix.needsUpdate = true;
    this.halos.instanceMatrix.needsUpdate = true;
    this.bars.instanceMatrix.needsUpdate = true;
  }

  private applyTheme(): void {
    const t = this.theme();
    Object.entries(t.cssVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    if (this.dotMat) {
      const acc = new THREE.Color(t.acc);
      this.dotMat.color.set(acc);
      this.haloMat.color.set(acc);
      this.barMat.color.set(acc);
      (this.hl.material as THREE.MeshBasicMaterial).color.set(new THREE.Color(t.hi));
      this.redrawTexture();
    }
  }

  private applyViz(): void {
    if (!this.dots) return;
    this.dots.visible = this.viz !== 'bars';
    this.halos.visible = this.viz === 'dots';
    this.bars.visible = this.viz === 'bars';
    this.updateInstances();
    this.redrawTexture();
  }

  private redrawTexture(): void {
    if (!this.features.length) return;
    const t = this.theme();
    const heat = this.viz === 'heat';
    const W = 2048;
    const H = 1024;
    this.texCanvas ??= document.createElement('canvas');
    const cv = this.texCanvas;
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = t.ocean;
    ctx.fillRect(0, 0, W, H);
    const land = new THREE.Color(t.land);
    const acc = new THREE.Color(t.acc);
    const tmp = new THREE.Color();
    const px = (lon: number): number => ((lon + 180) / 360) * W;
    const py = (lat: number): number => ((90 - lat) / 180) * H;
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = t.border;
    this.features.forEach((f) => {
      let fill = t.land;
      if (heat && f.iso3 && this.byIso[f.iso3]) {
        const c = this.byIso[f.iso3];
        const v = Math.min(1, (c.aui * this.yearFactor(c, this.year)) / 2.5);
        tmp.copy(land).lerp(acc, Math.pow(v, 0.6));
        fill = '#' + tmp.getHexString();
      }
      ctx.fillStyle = fill;
      f.polys.forEach((rings) => {
        [0, -360, 360].forEach((off) => {
          ctx.beginPath();
          let drew = false;
          rings.forEach((ring) => {
            let prev: number | null = null;
            let shift = 0;
            ring.forEach((p, i) => {
              let lon = p[0] + shift;
              if (prev != null && Math.abs(lon - prev) > 180) {
                shift += lon > prev ? -360 : 360;
                lon = p[0] + shift;
              }
              const X = px(lon + off);
              const Y = py(p[1]);
              if (i === 0) ctx.moveTo(X, Y);
              else ctx.lineTo(X, Y);
              prev = lon;
              drew = true;
            });
            ctx.closePath();
          });
          if (drew) {
            ctx.fill();
            ctx.stroke();
          }
        });
      });
    });
    if (!this.tex) {
      this.tex = new THREE.CanvasTexture(cv);
      this.tex.colorSpace = THREE.SRGBColorSpace;
      this.tex.anisotropy = 4;
      this.globeMat.map = this.tex;
      this.globeMat.color.set(0xffffff);
      this.globeMat.needsUpdate = true;
    } else {
      this.tex.needsUpdate = true;
    }
  }

  // ---- Interaction ----------------------------------------------------------

  private bindPointer(): void {
    const el = this.el;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      this.drag = { x: e.clientX, y: e.clientY, moved: 0 };
      this.lastPointer = Date.now();
      el.style.cursor = 'grabbing';
    });
    el.addEventListener('pointermove', (e) => {
      this.lastPointer = Date.now();
      if (this.drag) {
        const dx = e.clientX - this.drag.x;
        const dy = e.clientY - this.drag.y;
        this.drag.x = e.clientX;
        this.drag.y = e.clientY;
        this.drag.moved += Math.abs(dx) + Math.abs(dy);
        this.inner.rotation.y += dx * 0.005;
        this.outer.rotation.x = Math.max(-1.2, Math.min(1.2, this.outer.rotation.x + dy * 0.004));
        this.anim = null;
        this.setHover(null, e);
      } else {
        this.setHover(this.pick(e), e);
      }
    });
    el.addEventListener('pointerup', (e) => {
      el.style.cursor = 'grab';
      const wasDrag = this.drag && this.drag.moved > 7;
      this.drag = null;
      if (wasDrag) return;
      const hit = this.pick(e);
      if (hit) {
        this.cb.onSelect(hit);
        this.rotateTo(hit);
      } else {
        this.cb.onDeselect();
      }
    });
    el.addEventListener('pointerleave', () => {
      this.drag = null;
      this.setHover(null, null);
      el.style.cursor = 'grab';
    });
  }

  private pick(e: PointerEvent): GlobeCountry | null {
    if (!this.dots) return null;
    const r = this.el.getBoundingClientRect();
    this.ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    this.ray.setFromCamera(this.ndc, this.camera);
    const target = this.viz === 'bars' ? this.bars : this.dots;
    const hits = this.ray.intersectObject(target);
    if (!hits.length) return null;
    const gHits = this.ray.intersectObject(this.globe);
    if (gHits.length && gHits[0].distance < hits[0].distance - 0.02) return null;
    const id = hits[0].instanceId;
    return id != null ? (this.countries[id] ?? null) : null;
  }

  private setHover(c: GlobeCountry | null, e: PointerEvent | null): void {
    const id = c ? c.idx : null;
    this.cb.onHover(c, e?.clientX ?? 0, e?.clientY ?? 0);
    if (id !== this.hoverIdx) {
      this.hoverIdx = id;
      this.hl.visible = id != null;
      if (c) {
        const p = latLonToVec3(c.lat, c.lon, 1.035);
        this.hl.position.copy(p);
        this.hl.lookAt(p.clone().multiplyScalar(2));
      }
    }
  }

  private rotateTo(c: GlobeCountry): void {
    const v = latLonToVec3(c.lat, c.lon, 1);
    let toY = Math.atan2(-v.x, v.z);
    const z1 = Math.hypot(v.x, v.z);
    const toX = Math.atan2(v.y, z1);
    const cur = this.inner.rotation.y;
    while (toY - cur > Math.PI) toY -= 2 * Math.PI;
    while (toY - cur < -Math.PI) toY += 2 * Math.PI;
    this.anim = {
      t0: Date.now(),
      dur: 900,
      fromY: cur,
      toY,
      fromX: this.outer.rotation.x,
      toX,
    };
    this.lastPointer = Date.now() + 2000;
  }
}
