'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HERO INTRO — « GLOBETROTTER »
 * Intro de 5 s : le globe apparaît (0–1 s), l'avion fait le tour de la Terre (1–4 s),
 * puis termine son passage derrière elle ; le globe continue ensuite de tourner sans fin.
 * Deux canvas : le fond (étoiles, Terre) sous le texte du hero, l'avion et sa trajectoire au-dessus.
 * three.js ≥ r155 (colorSpace, éclairage physique).
 */

const DEG = Math.PI / 180;
const TILT = 23.4 * DEG;
const R_ORBIT = 1.45;
const K = 0.55 / 40.3; // avion de 40 m → 0,55 rayon terrestre (échelle stylisée pour la lisibilité)
const OMEGA = 100 * DEG;
const PHI0 = -128 * DEG;
const CUE = { orbit: 1, transition: 4, total: 5 };
const SPIN0 = -118 * DEG;
const SPIN_RATE = 0.055;
const LIGHT = Math.PI; // intensités « legacy » → éclairage physique

const LAYOUTS = {
  desktop: { cx: 0.585, cy: 0.5, dist: [4.5, 4.28] },
  mobile: { cx: 0.5, cy: 0.4, dist: [8.5, 8.15] },
};

const ease = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};
const ramp = (T: number, a: number, b: number, fn: (t: number) => number) => fn(Math.min(1, Math.max(0, (T - a) / (b - a))));

const EARTH_VERTEX = /* glsl */ `
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }`;
const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D specMap; uniform sampler2D normalMap;
  uniform vec3 lightDirection; uniform float nightIntensity; uniform float bumpStrength; uniform float uFade;
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(lightDirection);
    vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), normal));
    vec3 bitangent = cross(normal, tangent);
    vec3 bump = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
    normal = normalize(normal + (tangent * bump.x + bitangent * bump.y) * bumpStrength);
    float lit = smoothstep(-0.30, 0.26, dot(normal, light));
    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb;
    float cityMask = smoothstep(0.08, 0.38, max(max(night.r, night.g), night.b));
    vec3 cities = night * cityMask * nightIntensity * (1.0 - lit);
    vec3 color = mix(vec3(0.012, 0.022, 0.045), day * 1.22, lit) + cities;
    float ocean = texture2D(specMap, vUv).r;
    float specular = pow(max(dot(normal, normalize(light + vViewDir)), 0.0), 38.0);
    color += vec3(0.30, 0.42, 0.55) * specular * ocean * lit * 0.85;
    float fresnel = pow(1.0 - max(dot(normal, vViewDir), 0.0), 3.0);
    color += vec3(0.16, 0.38, 0.68) * fresnel * (0.22 + 0.78 * lit);
    gl_FragColor = vec4(mix(vec3(0.0196, 0.0275, 0.051), color, uFade), 1.0);
  }`;
const ATMO_VERTEX = /* glsl */ `
  varying vec3 vNormal; varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }`;
const ATMO_FRAGMENT = /* glsl */ `
  uniform vec3 lightDirection; uniform float uFade; varying vec3 vNormal; varying vec3 vViewDir;
  void main() {
    vec3 normal = normalize(vNormal);
    float rim = pow(1.0 - abs(dot(normal, vViewDir)), 2.6);
    float lit = smoothstep(-0.55, 0.45, dot(normal, normalize(lightDirection)));
    float alpha = rim * (0.10 + 0.90 * lit) * uFade;
    vec3 color = mix(vec3(0.10, 0.22, 0.45), vec3(0.34, 0.62, 1.0), lit);
    gl_FragColor = vec4(color * alpha, alpha);
  }`;

function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cssFont(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

/* ─────────── Livrée « GLOBETROTTER » ─────────── */
function paintLivery(target?: THREE.CanvasTexture) {
  const display = cssFont('--font-display', '"Space Grotesk", sans-serif');
  const mono = cssFont('--font-mono', '"JetBrains Mono", monospace');
  // Toile dépliée : x = longueur (51 px/m), y = pourtour (81 px/m). y = 512 → flanc tribord.
  const side = document.createElement('canvas');
  side.width = 2048; side.height = 1024;
  const c = side.getContext('2d') as any;
  c.fillStyle = '#f3f5f8'; c.fillRect(0, 0, 2048, 1024);
  const belly = c.createLinearGradient(0, 640, 0, 730);
  belly.addColorStop(0, 'rgba(200,207,218,0)'); belly.addColorStop(1, '#c6cdd8');
  c.fillStyle = belly; c.fillRect(0, 640, 2048, 300);
  const line = (y: number, h: number, col: string) => {
    const g = c.createLinearGradient(160, 0, 1950, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.1, col); g.addColorStop(0.92, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(160, y, 1790, h);
  };
  line(528, 10, '#3DE0FF'); line(544, 5, '#FF7A45');
  c.fillStyle = '#1b2230';
  for (let x = 420; x < 1770; x += 26) {
    if (Math.abs(x - 1090) < 34) continue;
    c.beginPath(); c.roundRect(x, 306, 11, 20, 5); c.fill();
  }
  c.strokeStyle = 'rgba(40,50,66,0.5)'; c.lineWidth = 2;
  [[1815, 290], [300, 290], [1090, 290]].forEach(([x, y]) => { c.beginPath(); c.roundRect(x - 13, y, 26, 150, 8); c.stroke(); });
  c.fillStyle = '#10151f';
  c.beginPath(); c.moveTo(1936, 302); c.lineTo(1990, 300); c.lineTo(2006, 332); c.lineTo(1940, 334); c.closePath(); c.fill();
  c.save(); c.translate(1085, 498); c.scale(1, 81 / 51);
  c.fillStyle = '#0E1420'; c.font = `700 142px ${display}`; c.textAlign = 'center';
  if ('letterSpacing' in c) c.letterSpacing = '4px';
  c.fillText('GLOBETROTTER', 0, 0); c.restore();
  c.save(); c.translate(330, 520); c.scale(1, 81 / 51);
  c.fillStyle = '#2a3342'; c.font = `500 22px ${mono}`; c.textAlign = 'center';
  c.fillText('F-GT94', 0, 0); c.restore();

  const tex = (target ? target.image : document.createElement('canvas')) as HTMLCanvasElement;
  tex.width = 1024; tex.height = 2048;
  const t = tex.getContext('2d')!;
  t.setTransform(0, -1, 1, 0, 0, 2048);
  t.drawImage(side, 0, 0);
  if (target) { target.needsUpdate = true; return target; }
  const texture = new THREE.CanvasTexture(tex);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function paintFinMark() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d')!;
  c.scale(16, 16);
  c.strokeStyle = '#3DE0FF'; c.fillStyle = '#3DE0FF';
  const stroke = (fn: () => void, w: number, a: number) => { c.globalAlpha = a; c.lineWidth = w; c.beginPath(); fn(); c.stroke(); };
  stroke(() => c.arc(16, 16, 12.5, 0, Math.PI * 2), 1.4, 0.85);
  stroke(() => c.ellipse(16, 16, 5.2, 12.5, 0, 0, Math.PI * 2), 1.1, 0.7);
  stroke(() => { c.moveTo(3.5, 16); c.lineTo(28.5, 16); }, 1.1, 0.7);
  stroke(() => { c.moveTo(5.6, 9.8); c.lineTo(26.4, 9.8); c.moveTo(5.6, 22.2); c.lineTo(26.4, 22.2); }, 0.9, 0.45);
  c.globalAlpha = 0.3; c.beginPath(); c.arc(19.4, 11.6, 2.4, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1; c.beginPath(); c.arc(19.4, 11.6, 1.25, 0, Math.PI * 2); c.fill();
  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function glowTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,0.5)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}

/* ─────────── Avion (mètres ; nez +X, haut +Y, tribord +Z) ─────────── */
function buildPlane(livery: THREE.Texture, finMark: THREE.Texture, glow: THREE.Texture, envMap: THREE.Texture) {
  const g = new THREE.Group();
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 90; i++) {
    const y = -20 + (40.3 * i) / 90;
    let r = 2.0;
    if (y < -8) { const s = (y + 20) / 12; r = 0.35 + 1.65 * Math.pow(Math.sin((s * Math.PI) / 2), 1.3); }
    if (y > 14) { const s = (20.3 - y) / 6.3; r = 2.0 * Math.pow(Math.max(0, s), 0.5) * (0.96 + 0.04 * s); }
    prof.push(new THREE.Vector2(Math.max(r, 0.001), y));
  }
  const fus = new THREE.LatheGeometry(prof, 72, Math.PI, Math.PI * 2);
  fus.rotateZ(-Math.PI / 2);
  const pos = fus.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    if (x < -8) pos.setY(i, pos.getY(i) + Math.pow((-8 - x) / 12, 1.8) * 1.3);
  }
  fus.computeVertexNormals();
  const std = (o: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ envMap, envMapIntensity: 0.7, side: THREE.DoubleSide, ...o });
  g.add(new THREE.Mesh(fus, std({ map: livery, roughness: 0.3, metalness: 0.1 })));

  const surface = (pts: number[][], thick: number) => {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.35, bevelSize: thick * 0.3, bevelSegments: 2 });
    geo.translate(0, 0, -thick / 2);
    return geo;
  };
  const alu = std({ color: 0xc9ced6, roughness: 0.38, metalness: 0.6 });
  const white = std({ color: 0xeef1f5, roughness: 0.32, metalness: 0.15 });
  const navy = std({ color: 0x0e1420, roughness: 0.35, metalness: 0.25 });

  const wingGeo = surface([[3.2, 0], [-7.2, 17], [-9.2, 17.2], [-5.4, 0]], 0.32);
  wingGeo.rotateX(Math.PI / 2);
  [1, -1].forEach((s) => {
    const w = new THREE.Mesh(wingGeo, alu);
    w.scale.z = s; w.position.set(0, -1.05, 0); w.rotation.x = -s * 5 * DEG; g.add(w);
    const wl = new THREE.Mesh(surface([[-7.4, 0], [-9.4, 2.2], [-10.2, 2.2], [-9.3, 0]], 0.18), navy);
    wl.position.set(0, -1.05 + 17.1 * Math.sin(5 * DEG), s * 17.1); wl.scale.z = s; g.add(wl);
  });
  const stabGeo = surface([[-14.6, 0], [-19.2, 6.8], [-20.4, 6.9], [-18.6, 0]], 0.2);
  stabGeo.rotateX(Math.PI / 2);
  [1, -1].forEach((s) => {
    const m = new THREE.Mesh(stabGeo, white);
    m.scale.z = s; m.position.set(0, 0.5, 0); m.rotation.x = -s * 6 * DEG; g.add(m);
  });
  g.add(new THREE.Mesh(surface([[-12.5, 1.2], [-18.6, 9.6], [-21.1, 9.7], [-20.3, 1.2]], 0.34), navy));
  const markGeo = new THREE.PlaneGeometry(5.4, 5.4);
  const markMat = new THREE.MeshStandardMaterial({ map: finMark, transparent: true, roughness: 0.4, emissive: 0x3de0ff, emissiveMap: finMark, emissiveIntensity: 0.25 });
  [1, -1].forEach((s) => {
    const m = new THREE.Mesh(markGeo, markMat);
    m.position.set(-18.1, 5.2, s * 0.27); if (s < 0) m.rotation.y = Math.PI; g.add(m);
  });

  const nacGeo = new THREE.CylinderGeometry(1.05, 0.82, 4.8, 40, 1, true); nacGeo.rotateZ(Math.PI / 2);
  const lipGeo = new THREE.TorusGeometry(1.0, 0.12, 12, 40); lipGeo.rotateY(Math.PI / 2);
  const fanGeo = new THREE.CircleGeometry(0.98, 40); fanGeo.rotateY(Math.PI / 2);
  const coneGeo = new THREE.ConeGeometry(0.5, 1.2, 24); coneGeo.rotateZ(-Math.PI / 2);
  const dark = std({ color: 0x1a1f28, roughness: 0.6, metalness: 0.4 });
  const nacMat = std({ color: 0xdfe3ea, roughness: 0.28, metalness: 0.4 });
  [6.2, -6.2].forEach((z) => {
    const e = new THREE.Group();
    e.add(new THREE.Mesh(nacGeo, nacMat));
    const lip = new THREE.Mesh(lipGeo, alu); lip.position.x = 2.4; e.add(lip);
    const fan = new THREE.Mesh(fanGeo, dark); fan.position.x = 2.1; e.add(fan);
    const cone = new THREE.Mesh(coneGeo, dark); cone.position.x = -2.8; e.add(cone);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.3, 0.35), white); pylon.position.set(-0.4, 1.0, 0); e.add(pylon);
    e.position.set(0.6, -2.55, z); g.add(e);
  });

  const light = (color: number, x: number, y: number, z: number, size: number) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.set(x, y, z); sp.scale.setScalar(size); g.add(sp); return sp;
  };
  const nav = {
    port: light(0xff3b30, -9.0, -0.4, -17.4, 1.8),
    starboard: light(0x34e5a0, -9.0, -0.4, 17.4, 1.8),
    strobeL: light(0xffffff, -9.3, -0.4, -17.5, 3.2),
    strobeR: light(0xffffff, -9.3, -0.4, 17.5, 3.2),
  };
  g.scale.setScalar(K);
  return { group: g, nav };
}

/* ─────────── Scène ─────────── */
function createIntro(back: HTMLDivElement, front: HTMLDivElement, lowQuality: boolean) {
  const disposables: { dispose: () => void }[] = [];
  const makeRenderer = (alpha: boolean, host: HTMLDivElement) => {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowQuality ? 1.5 : 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.1;
    r.setClearColor(alpha ? 0x000000 : 0x05070d, alpha ? 0 : 1);
    Object.assign(r.domElement.style, { width: '100%', height: '100%', display: 'block' });
    host.appendChild(r.domElement);
    return r;
  };
  const renderer = makeRenderer(false, back);
  const topRenderer = makeRenderer(true, front);

  const scene = new THREE.Scene();
  const top = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.05, 120);
  const SUN = new THREE.Vector3(-0.85, 0.26, 0.42).normalize();
  let layout = LAYOUTS.desktop;

  // Reflets doux pour l'avion
  const pmrem = new THREE.PMREMGenerator(topRenderer);
  const envGeo = new THREE.SphereGeometry(10, 48, 24);
  const cols: number[] = [];
  const pv = envGeo.attributes.position, nrm = new THREE.Vector3();
  for (let i = 0; i < pv.count; i++) {
    nrm.set(pv.getX(i), pv.getY(i), pv.getZ(i)).normalize();
    const sky = Math.max(0, nrm.y) * 0.35, sun = Math.pow(Math.max(0, nrm.dot(SUN)), 10) * 3.5, eg = Math.max(0, -nrm.y) * 0.12;
    cols.push(0.02 + sky * 0.55 + sun + eg * 0.3, 0.03 + sky * 0.7 + sun * 0.95 + eg * 0.5, 0.05 + sky + sun * 0.85 + eg);
  }
  envGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(envGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const envMap = pmrem.fromScene(envScene, 0.02).texture;
  disposables.push(pmrem, envGeo, envMap);

  // Étoiles
  const rnd = mulberry(94);
  const count = lowQuality ? 600 : 1400;
  const sp = new Float32Array(count * 3), ss = new Float32Array(count), so = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 30 + rnd() * 40, th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
    sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); sp[i * 3 + 2] = r * Math.cos(ph);
    const b = Math.pow(rnd(), 3.2); ss[i] = 0.8 + b * 2.2; so[i] = 0.14 + b * 0.6;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sg.setAttribute('aSize', new THREE.BufferAttribute(ss, 1));
  sg.setAttribute('aOpacity', new THREE.BufferAttribute(so, 1));
  const starMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uFade: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float aSize; attribute float aOpacity; uniform float uPixelRatio; varying float vOpacity;
      void main(){ vOpacity = aOpacity; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * uPixelRatio; }`,
    fragmentShader: `uniform float uFade; varying float vOpacity; void main(){ float d = length(gl_PointCoord - vec2(0.5)); if (d > 0.5) discard;
      gl_FragColor = vec4(vec3(0.85,0.90,1.0), vOpacity * uFade * smoothstep(0.5,0.05,d)); }`,
  });
  const stars = new THREE.Points(sg, starMat);
  scene.add(stars);
  disposables.push(sg, starMat);

  // Terre
  const globe = new THREE.Group(); scene.add(globe);
  const tilt = new THREE.Group(); tilt.rotation.z = TILT; globe.add(tilt);
  const atmoGeo = new THREE.SphereGeometry(1.028, 96, 48);
  const atmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMO_VERTEX, fragmentShader: ATMO_FRAGMENT, uniforms: { lightDirection: { value: SUN }, uFade: { value: 0 } },
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
  });
  globe.add(new THREE.Mesh(atmoGeo, atmoMat));
  disposables.push(atmoGeo, atmoMat);
  let earth: THREE.Mesh | null = null;
  let clouds: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null = null;
  let earthMat: THREE.ShaderMaterial | null = null;

  // Orbite
  const n = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), -16 * DEG).applyAxisAngle(new THREE.Vector3(1, 0, 0), -12 * DEG).normalize();
  const e1 = new THREE.Vector3(0, 0, 1).addScaledVector(n, -n.z).normalize();
  const e2 = new THREE.Vector3().crossVectors(n, e1);
  const U = (phi: number, out: THREE.Vector3) => out.copy(e1).multiplyScalar(Math.cos(phi)).addScaledVector(e2, Math.sin(phi));

  // Trajectoire lumineuse
  const SEG = 900;
  const rp = new Float32Array(SEG * 6), rt = new Float32Array(SEG * 6), rphi = new Float32Array(SEG * 2), rside = new Float32Array(SEG * 2);
  const u0 = new THREE.Vector3(), t0 = new THREE.Vector3();
  for (let i = 0; i < SEG; i++) {
    const phi = (i / SEG) * Math.PI * 2;
    U(phi, u0); t0.crossVectors(n, u0);
    for (let k = 0; k < 2; k++) {
      const j = i * 2 + k;
      rp.set([u0.x * R_ORBIT, u0.y * R_ORBIT, u0.z * R_ORBIT], j * 3);
      rt.set([t0.x, t0.y, t0.z], j * 3);
      rphi[j] = phi; rside[j] = k === 0 ? 1 : -1;
    }
  }
  const ridx: number[] = [];
  for (let i = 0; i < SEG; i++) { const a = i * 2, b = ((i + 1) % SEG) * 2; ridx.push(a, a + 1, b, a + 1, b + 1, b); }
  const rg = new THREE.BufferGeometry();
  rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  rg.setAttribute('aTangent', new THREE.BufferAttribute(rt, 3));
  rg.setAttribute('aPhi', new THREE.BufferAttribute(rphi, 1));
  rg.setAttribute('aSide', new THREE.BufferAttribute(rside, 1));
  rg.setIndex(ridx);
  const trailMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uHead: { value: 0 }, uLen: { value: 0 }, uGlow: { value: 1 }, uBase: { value: 0.24 }, uWidth: { value: 0.022 } },
    vertexShader: `attribute vec3 aTangent; attribute float aPhi; attribute float aSide; uniform float uWidth;
      varying float vPhi; varying float vSide;
      void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vec3 toCam = normalize(cameraPosition - wp.xyz);
        wp.xyz += normalize(cross(aTangent, toCam)) * uWidth * aSide; vPhi = aPhi; vSide = aSide;
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform float uHead; uniform float uLen; uniform float uGlow; uniform float uBase; varying float vPhi; varying float vSide;
      void main(){
        float d = mod(uHead - vPhi, 6.2831853);
        float drawn = step(d, uLen) * (1.0 - smoothstep(max(uLen - 0.35, 0.0), uLen, d));
        float head = exp(-d / 1.1) * uGlow;
        float edge = exp(-vSide * vSide * 7.0);
        float a = drawn * (uBase + (1.0 - uBase) * head) * smoothstep(0.0, 0.04, d) * edge;
        vec3 col = mix(vec3(0.24, 0.88, 1.0), vec3(0.88, 0.98, 1.0), head * edge);
        gl_FragColor = vec4(col * a * 1.6, a);
      }`,
  });
  top.add(new THREE.Mesh(rg, trailMat));
  disposables.push(rg, trailMat);
  // Occulteur invisible : la Terre masque l'avion quand il passe derrière
  const occGeo = new THREE.SphereGeometry(1, 96, 48);
  const occluder = new THREE.Mesh(occGeo, new THREE.MeshBasicMaterial({ colorWrite: false }));
  occluder.renderOrder = -1;
  top.add(occluder);
  disposables.push(occGeo, occluder.material as THREE.Material);

  // Lumières de l'avion
  const sunLight = new THREE.DirectionalLight(0xfff4e6, 2.3 * LIGHT);
  sunLight.position.copy(SUN).multiplyScalar(10);
  const fill = new THREE.DirectionalLight(0xa9bddc, 0.55 * LIGHT);
  const rim = new THREE.DirectionalLight(0x3de0ff, 0.25 * LIGHT);
  rim.position.set(0.6, 0.3, -1);
  top.add(sunLight, fill, rim, new THREE.AmbientLight(0x1c2536, 0.5 * LIGHT));

  const livery = paintLivery();
  const plane = buildPlane(livery, paintFinMark(), glowTexture(), envMap);
  top.add(plane.group);

  // Textures (mêmes fichiers que Globe3D)
  const loader = new THREE.TextureLoader();
  const load = (u: string) => new Promise<THREE.Texture>((res, rej) => loader.load(u, (t) => { t.anisotropy = 8; res(t); }, undefined, rej));
  const suffix = lowQuality ? '1k' : '2k';
  const ready = Promise.all([
    load(`/textures/earth-day-${suffix}.webp`), load(`/textures/earth-night-${suffix}.webp`),
    load('/textures/earth-spec-1k.webp'), load('/textures/earth-normal-1k.webp'), load('/textures/earth-clouds-1k.webp'),
  ]).then(([day, night, spec, normal, cloud]) => {
    disposables.push(day, night, spec, normal, cloud);
    earthMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERTEX, fragmentShader: EARTH_FRAGMENT,
      uniforms: { dayMap: { value: day }, nightMap: { value: night }, specMap: { value: spec }, normalMap: { value: normal },
        lightDirection: { value: SUN }, nightIntensity: { value: 0.62 }, bumpStrength: { value: 0.55 }, uFade: { value: 0 } },
    });
    const seg = lowQuality ? 72 : 144;
    earth = new THREE.Mesh(new THREE.SphereGeometry(1, seg, seg / 2), earthMat);
    tilt.add(earth);
    cloud.colorSpace = THREE.SRGBColorSpace;
    clouds = new THREE.Mesh(new THREE.SphereGeometry(1.006, 96, 48), new THREE.MeshBasicMaterial({
      map: cloud, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    }));
    tilt.add(clouds);
    disposables.push(earth.geometry, earthMat, clouds.geometry, clouds.material);
  });
  document.fonts?.ready.then(() => paintLivery(livery));

  const P = new THREE.Vector3(), Uv = new THREE.Vector3(), V = new THREE.Vector3(), basis = new THREE.Matrix4();

  function planePhi(T: number) {
    const t1 = CUE.transition - 0.4;
    if (T < t1) return PHI0 + OMEGA * (T - CUE.orbit);
    const dur = CUE.total - t1, u = Math.min(1, (T - t1) / dur);
    return PHI0 + OMEGA * (t1 - CUE.orbit) + ((OMEGA * dur) / 3) * (1 - Math.pow(1 - u, 3));
  }

  function resize(w: number, h: number) {
    if (!w || !h) return;
    layout = w >= 1024 ? LAYOUTS.desktop : LAYOUTS.mobile;
    renderer.setSize(w, h, false);
    topRenderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.setViewOffset(w, h, -(layout.cx - 0.5) * w, -(layout.cy - 0.5) * h, w, h);
    camera.updateProjectionMatrix();
  }

  /** T en secondes depuis le début de l'intro ; au-delà de 5 s, seul le globe continue. */
  function render(T: number) {
    const Ti = Math.min(T, CUE.total);
    const fade = ramp(Ti, 0, CUE.orbit, ease.out);
    if (earthMat) earthMat.uniforms.uFade.value = fade;
    if (clouds) clouds.material.opacity = 0.26 * fade;
    atmoMat.uniforms.uFade.value = fade;
    starMat.uniforms.uFade.value = ramp(Ti, 0, CUE.orbit + 0.5, ease.inOut);
    const scale = 0.94 + 0.06 * ramp(Ti, 0, CUE.orbit + 0.6, ease.out);
    globe.scale.setScalar(scale);
    occluder.scale.setScalar(scale);
    const spin = SPIN0 + SPIN_RATE * T;
    if (earth) earth.rotation.y = spin;
    if (clouds) clouds.rotation.y = spin + 0.012 * T;

    const dist = layout.dist[0] + (layout.dist[1] - layout.dist[0]) * ease.inOut(Ti / CUE.total);
    const el = 7 * DEG;
    camera.position.set(0, dist * Math.sin(el), dist * Math.cos(el));
    camera.lookAt(0, 0, 0);
    stars.rotation.y = T * 0.004;

    const phi = planePhi(Ti);
    U(phi, Uv); V.crossVectors(n, Uv);
    P.copy(Uv).multiplyScalar(R_ORBIT);
    basis.makeBasis(V, n, Uv);
    plane.group.quaternion.setFromRotationMatrix(basis);
    plane.group.rotateX(0.36 + 0.02 * Math.sin((Math.PI * 2 * Ti) / 2.5));
    plane.group.rotateZ(0.015 * Math.sin((Math.PI * 2 * Ti) / 5));
    plane.group.position.copy(P);
    plane.group.visible = Ti >= CUE.orbit - 0.15 && T < CUE.total + 0.5;
    fill.position.copy(camera.position);

    const pulse = (period: number, width: number, offset = 0) => (((T + offset) % period) / period < width ? 1 : 0);
    plane.nav.port.material.opacity = 0.7; plane.nav.starboard.material.opacity = 0.7;
    const strobe = Math.max(pulse(1, 0.05, 0.3), pulse(1, 0.05, 0.18));
    plane.nav.strobeL.material.opacity = strobe; plane.nav.strobeR.material.opacity = strobe;

    trailMat.uniforms.uHead.value = (((phi - 0.22) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    trailMat.uniforms.uLen.value = Math.max(0, phi - 0.22 - PHI0);
    trailMat.uniforms.uGlow.value = 1 - ramp(Ti, CUE.transition - 0.2, CUE.total, ease.inOut);

    renderer.render(scene, camera);
    topRenderer.render(top, camera);
  }

  function dispose() {
    disposables.forEach((d) => d.dispose());
    plane.group.traverse((o: any) => { o.geometry?.dispose?.(); o.material?.map?.dispose?.(); o.material?.dispose?.(); });
    [renderer, topRenderer].forEach((r) => { r.dispose(); r.forceContextLoss(); r.domElement.remove(); });
  }

  return { render, resize, dispose, ready };
}

function webglUsable() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!ctx) return false;
    const info = ctx.getExtension('WEBGL_debug_renderer_info');
    if (info) {
      const r = String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '').toLowerCase();
      if (r.includes('swiftshader') || r.includes('llvmpipe')) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/* ─────────── Composant ─────────── */
export default function HeroIntro({ onReady }: { onReady?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  // Lue via une référence : en dépendance de l'effet, une fonction redéfinie
  // par le parent recréerait toute la scène à chaque rendu.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const root = rootRef.current, back = backRef.current, front = frontRef.current;
    if (!root || !back || !front) return;
    if (!webglUsable()) return; // l'image de repli reste affichée

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowQuality = window.matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 4) < 4;
    const intro = createIntro(back, front, lowQuality);
    let started = false;

    const ro = new ResizeObserver(() => {
      intro.resize(root.clientWidth, root.clientHeight);
      // En mode « animations réduites », aucune boucle ne tourne : sans ce
      // rendu, l'image figée resterait étirée après un redimensionnement.
      if (reduced && started) intro.render(CUE.total);
    });
    ro.observe(root);
    intro.resize(root.clientWidth, root.clientHeight);

    // Temps accumulé : l'intro reprend là où elle s'est arrêtée après une pause.
    let T = reduced ? CUE.total : 0;
    let last = 0, frame = 0, running = false, visible = true, inView = true;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (!reduced) T += dt;
      intro.render(T);
    };
    const sync = () => {
      const should = started && visible && inView && !reduced;
      if (should && !running) { running = true; last = 0; frame = requestAnimationFrame(tick); }
      if (!should && running) { running = false; cancelAnimationFrame(frame); }
    };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); });
    io.observe(root);
    const onVis = () => { visible = document.visibilityState === 'visible'; sync(); };
    document.addEventListener('visibilitychange', onVis);

    intro.ready.then(() => {
      started = true;
      onReadyRef.current?.();
      if (reduced) intro.render(CUE.total); else sync();
    }).catch((err) => console.error('[HeroIntro] textures', err));

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      intro.dispose();
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Fond : étoiles et Terre, sous le contenu du hero */}
      <div ref={backRef} className="absolute inset-0 -z-10" />
      {/* Avant : l'avion passe devant le titre */}
      <div ref={frontRef} className="absolute inset-0 z-10" />
    </div>
  );
}
