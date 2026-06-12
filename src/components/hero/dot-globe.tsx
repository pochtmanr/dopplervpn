"use client";

import { useEffect, useRef } from "react";

/**
 * Hand-rolled "3D" dot globe on a plain 2D canvas — zero dependencies.
 * A fibonacci-distributed dot sphere rotates slowly; the 8 real Doppler
 * server locations glow in teal, with traveling connection arcs that all
 * route through the Warsaw hub (mirrors src/components/sections/servers.tsx).
 *
 * Perf contract: rAF starts via requestIdleCallback (never competes with LCP),
 * pauses when offscreen or the tab is hidden, renders a single static frame
 * under prefers-reduced-motion, and re-reads theme colors when next-themes
 * toggles the class on <html>.
 */

interface DotGlobeProps {
  className?: string;
  pointCount?: number;
  idleSpeed?: number; // radians/sec around the Y axis
  label?: string;
  /** Localized city names matching NODES order (Warsaw first) */
  nodeLabels?: string[];
}

// Real server locations (lat/lon). Warsaw is the hub — keep it first.
// English fallback labels; hero.tsx passes localized names from servers.locations.*.city
const NODES: ReadonlyArray<{ lat: number; lon: number; label: string }> = [
  { lat: 52.23, lon: 21.01, label: "Warsaw" }, // hub
  { lat: 52.37, lon: 4.9, label: "Amsterdam" },
  { lat: 59.33, lon: 18.07, label: "Stockholm" },
  { lat: 32.08, lon: 34.78, label: "Tel Aviv" },
  { lat: 41.59, lon: -93.62, label: "Des Moines" },
  { lat: 43.65, lon: -79.38, label: "Toronto" },
  { lat: 1.35, lon: 103.82, label: "Singapore" },
  { lat: -33.87, lon: 151.21, label: "Sydney" },
];

// Major cities shown as small neutral markers (servers stay teal); arcs travel
// from these "user" cities into the server network. English labels only.
const CITIES: ReadonlyArray<{ lat: number; lon: number; label: string }> = [
  { lat: 40.71, lon: -74.01, label: "New York" },
  { lat: 34.05, lon: -118.24, label: "Los Angeles" },
  { lat: 19.43, lon: -99.13, label: "Mexico City" },
  { lat: -23.55, lon: -46.63, label: "São Paulo" },
  { lat: -34.6, lon: -58.38, label: "Buenos Aires" },
  { lat: 51.5, lon: -0.12, label: "London" },
  { lat: 48.85, lon: 2.35, label: "Paris" },
  { lat: 40.42, lon: -3.7, label: "Madrid" },
  { lat: 30.04, lon: 31.24, label: "Cairo" },
  { lat: 6.52, lon: 3.38, label: "Lagos" },
  { lat: -26.2, lon: 28.05, label: "Johannesburg" },
  { lat: 25.2, lon: 55.27, label: "Dubai" },
  { lat: 41.01, lon: 28.98, label: "Istanbul" },
  { lat: 55.76, lon: 37.62, label: "Moscow" },
  { lat: 35.69, lon: 51.39, label: "Tehran" },
  { lat: 19.08, lon: 72.88, label: "Mumbai" },
  { lat: 39.9, lon: 116.4, label: "Beijing" },
  { lat: 22.32, lon: 114.17, label: "Hong Kong" },
  { lat: 35.68, lon: 139.69, label: "Tokyo" },
  { lat: 37.57, lon: 126.98, label: "Seoul" },
  { lat: -6.2, lon: 106.85, label: "Jakarta" },
];

// Positive tilt = north pole leans toward the viewer (Earth seen from above)
const TILT = 0.35;
const FOV = 3.5;
// Initial Y rotation chosen so the Americas face the viewer on load;
// front-center longitude = angle + 90°.
const START_ANGLE = Math.PI;

// Simplified continent outlines as (lon, lat) polygons — rasterized to a dot
// grid at init so the globe reads as an actual Earth, not an abstract sphere.
const CONTINENTS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  // North & Central America
  [[-166, 68], [-150, 71], [-135, 69], [-125, 71], [-110, 73], [-95, 72], [-80, 73], [-72, 62], [-60, 60], [-55, 52], [-65, 47], [-70, 44], [-75, 40], [-76, 35], [-81, 31], [-80, 26], [-88, 30], [-94, 29], [-97, 26], [-97, 22], [-90, 21], [-87, 22], [-83, 10], [-80, 9], [-85, 11], [-92, 15], [-97, 16], [-105, 20], [-110, 24], [-117, 33], [-122, 37], [-124, 43], [-124, 48], [-128, 51], [-133, 57], [-140, 60], [-150, 59], [-156, 57], [-165, 55], [-168, 60]],
  // Greenland
  [[-60, 76], [-50, 82], [-32, 84], [-20, 80], [-22, 70], [-42, 60], [-50, 62], [-55, 68]],
  // South America
  [[-78, 8], [-72, 12], [-62, 11], [-55, 6], [-50, 0], [-44, -3], [-35, -8], [-39, -16], [-42, -23], [-48, -27], [-53, -34], [-58, -39], [-63, -41], [-65, -47], [-69, -52], [-72, -55], [-75, -50], [-74, -44], [-72, -35], [-70, -25], [-70, -18], [-76, -14], [-81, -6], [-80, 1]],
  // Africa
  [[-17, 15], [-16, 20], [-12, 26], [-9, 31], [-6, 35], [0, 36], [10, 37], [19, 33], [29, 31], [33, 31], [35, 27], [37, 21], [40, 16], [43, 12], [48, 11], [51, 11], [47, 4], [41, -2], [40, -11], [36, -18], [34, -24], [28, -33], [22, -35], [17, -33], [14, -26], [12, -18], [12, -9], [9, -2], [8, 4], [2, 6], [-5, 5], [-9, 5], [-14, 8], [-17, 12]],
  // Eurasia (Europe + Asia mainland, India, SE Asia)
  [[-9, 37], [-9, 44], [-2, 48], [2, 51], [8, 54], [8, 57], [5, 59], [5, 62], [12, 66], [18, 70], [28, 71], [40, 66], [45, 68], [60, 70], [68, 73], [78, 73], [90, 76], [104, 78], [115, 77], [130, 72], [142, 72], [155, 70], [170, 67], [179, 66], [179, 62], [170, 60], [160, 61], [155, 57], [142, 54], [138, 47], [134, 43], [129, 42], [126, 38], [122, 31], [118, 25], [110, 20], [107, 16], [105, 9], [103, 2], [100, 5], [98, 10], [96, 16], [92, 21], [88, 22], [82, 16], [80, 13], [77, 8], [73, 16], [70, 21], [66, 25], [61, 25], [57, 26], [52, 28], [48, 30], [44, 32], [36, 36], [30, 37], [26, 39], [22, 38], [19, 42], [14, 45], [18, 40], [16, 38], [12, 42], [8, 44], [5, 43], [0, 40], [-2, 37], [-6, 36]],
  // Arabia
  [[36, 31], [47, 30], [51, 26], [56, 26], [59, 22], [55, 17], [49, 14], [44, 12], [42, 15], [38, 20], [35, 26]],
  // UK + Ireland
  [[-6, 50], [-1, 51], [0, 53], [-2, 56], [-4, 59], [-8, 57], [-10, 53], [-9, 51]],
  // Iceland
  [[-22, 64], [-15, 65], [-14, 66], [-19, 67], [-23, 66]],
  // Japan
  [[130, 32], [133, 34], [136, 35], [140, 36], [141, 40], [143, 43], [145, 45], [142, 44], [139, 38], [135, 34], [131, 31]],
  // Sumatra
  [[95, 5], [99, 3], [104, -3], [106, -6], [102, -5], [97, 1]],
  // Java
  [[105, -6], [110, -7], [114, -8], [112, -9], [106, -8]],
  // Borneo
  [[109, 2], [114, 4], [119, 1], [117, -3], [112, -3], [109, 0]],
  // New Guinea
  [[131, -1], [136, -2], [141, -3], [146, -6], [147, -9], [141, -8], [135, -4], [131, -2]],
  // Philippines
  [[120, 18], [122, 16], [124, 12], [123, 8], [119, 10], [120, 14]],
  // Australia
  [[113, -25], [114, -22], [119, -18], [124, -15], [129, -13], [133, -11], [136, -16], [140, -17], [142, -11], [145, -14], [149, -20], [153, -26], [152, -32], [148, -38], [141, -38], [136, -35], [130, -32], [125, -33], [118, -35], [114, -31]],
  // New Zealand
  [[166, -46], [170, -45], [172, -43], [174, -40], [176, -38], [178, -37], [174, -38], [172, -41], [167, -45]],
  // Madagascar
  [[44, -12], [48, -13], [50, -17], [48, -22], [45, -25], [43, -21], [44, -16]],
];

function isLand(lon: number, lat: number): boolean {
  for (const poly of CONTINENTS) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    if (inside) return true;
  }
  return false;
}

function latLonToVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
}

function hexToRgb(raw: string): [number, number, number] {
  const hex = raw.trim().replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return [0, 140, 140];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function DotGlobe({
  className = "",
  pointCount = 700,
  idleSpeed = 0.06,
  label,
  nodeLabels,
}: DotGlobeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Ref keeps the rAF effect independent of array identity (labels are static per mount)
  const nodeLabelsRef = useRef(nodeLabels);
  nodeLabelsRef.current = nodeLabels;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── Geometry (allocated once) ─────────────────────────────────── */
    // Equal-area lat/lon dot grid: land dots form the continents, a sparser
    // ocean grid keeps the sphere volume readable. pointCount picks density.
    const latStep = pointCount >= 600 ? 3.0 : 4.2;
    const landArr: number[] = [];
    const oceanArr: number[] = [];
    for (let lat = -60; lat <= 84; lat += latStep) {
      const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.04);
      const lonStep = latStep / cosLat;
      const oceanEvery = Math.round(3.2 / cosLat) || 1; // thin the ocean grid
      let col = 0;
      for (let lon = -180; lon < 180; lon += lonStep, col++) {
        const [x, y, z] = latLonToVec(lat, lon);
        if (isLand(lon, lat)) {
          landArr.push(x, y, z);
        } else if (col % oceanEvery === 0) {
          oceanArr.push(x, y, z);
        }
      }
    }
    const land = new Float32Array(landArr);
    const ocean = new Float32Array(oceanArr);
    const landN = land.length / 3;
    const oceanN = ocean.length / 3;
    const SERVER_COUNT = NODES.length;
    const allPlaces = [...NODES, ...CITIES];
    const nodes = allPlaces.map(({ lat, lon }) => latLonToVec(lat, lon));
    const labels = allPlaces.map((n, i) =>
      i < SERVER_COUNT ? nodeLabelsRef.current?.[i] ?? n.label : n.label
    );
    // Projected node positions, refreshed every frame for arc endpoints
    const nodeScreen = nodes.map(() => ({ x: 0, y: 0, z: 0, s: 1 }));
    const bodyFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
    const labelFont = `500 11px ${bodyFamily}`;
    const cityFont = `400 10px ${bodyFamily}`;

    /* ── Theme colors (re-read on theme switch) ────────────────────── */
    let dotRgb: [number, number, number] = [138, 138, 138];
    let nodeRgb: [number, number, number] = [0, 140, 140];
    let arcRgb: [number, number, number] = [0, 171, 171];
    const rgbaCache = new Map<string, string>();
    const rgba = (rgb: [number, number, number], a: number) => {
      const key = `${rgb[0]},${rgb[1]},${rgb[2]},${Math.round(a * 40)}`;
      let v = rgbaCache.get(key);
      if (!v) {
        v = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.round(a * 40) / 40})`;
        rgbaCache.set(key, v);
      }
      return v;
    };
    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      dotRgb = hexToRgb(styles.getPropertyValue("--color-text-tertiary") || "#8A8A8A");
      nodeRgb = hexToRgb(styles.getPropertyValue("--color-accent-teal") || "#008C8C");
      arcRgb = hexToRgb(styles.getPropertyValue("--color-accent-teal-light") || "#00ABAB");
      rgbaCache.clear();
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    /* ── Sizing ────────────────────────────────────────────────────── */
    let cssW = 0;
    let cssH = 0;
    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!running) drawFrame(0); // keep static frame crisp (reduced motion)
    });
    resizeObserver.observe(wrapper);

    /* ── Arcs ──────────────────────────────────────────────────────── */
    interface Arc { a: number; b: number; t: number; dur: number }
    const arcs: Arc[] = [];
    const spawnArc = (): Arc => {
      // Mostly user-city → server; occasionally server → Warsaw hub
      const toServer = Math.random() < 0.75;
      const a = toServer
        ? SERVER_COUNT + Math.floor(Math.random() * CITIES.length)
        : 1 + Math.floor(Math.random() * (SERVER_COUNT - 1));
      const b = toServer ? Math.floor(Math.random() * SERVER_COUNT) : 0;
      return {
        a,
        b,
        t: -Math.random() * 0.6, // negative = staggered start
        dur: 2.2 + Math.random() * 1.4,
      };
    };
    for (let i = 0; i < 4; i++) arcs.push(spawnArc());

    /* ── Pointer parallax (gentle, lerped) ─────────────────────────── */
    let targetTiltX = 0;
    let targetTiltY = 0;
    let curTiltX = 0;
    let curTiltY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      targetTiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.22;
      targetTiltX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.18;
    };
    const onPointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    /* ── Render ────────────────────────────────────────────────────── */
    let angle = START_ANGLE;

    const drawFrame = (dt: number) => {
      angle += idleSpeed * dt;
      curTiltX += (targetTiltX - curTiltX) * 0.04;
      curTiltY += (targetTiltY - curTiltY) * 0.04;

      const cx = cssW / 2;
      const cy = cssH / 2;
      const R = Math.min(cssW, cssH) * 0.42;
      const sinA = Math.sin(angle + curTiltY);
      const cosA = Math.cos(angle + curTiltY);
      const tilt = TILT + curTiltX;
      const sinT = Math.sin(tilt);
      const cosT = Math.cos(tilt);

      const project = (x: number, y: number, z: number) => {
        const rx = x * cosA + z * sinA;
        const rz = -x * sinA + z * cosA;
        const ry = y * cosT - rz * sinT;
        const rz2 = y * sinT + rz * cosT;
        const s = FOV / (FOV - rz2);
        return { x: cx + rx * R * s, y: cy - ry * R * s, z: rz2, s };
      };

      ctx.clearRect(0, 0, cssW, cssH);

      // Ocean dots — very faint, just enough to read the sphere's volume
      for (let i = 0; i < oceanN; i++) {
        const p = project(ocean[i * 3], ocean[i * 3 + 1], ocean[i * 3 + 2]);
        const front = Math.max(0, p.z);
        if (front < 0.02) continue;
        ctx.fillStyle = rgba(dotRgb, 0.04 + 0.1 * front);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.7 * p.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Land dots — the continents
      for (let i = 0; i < landN; i++) {
        const p = project(land[i * 3], land[i * 3 + 1], land[i * 3 + 2]);
        const front = Math.max(0, p.z);
        ctx.fillStyle = rgba(dotRgb, 0.06 + 0.6 * front);
        const r = (0.7 + 1.0 * front) * p.s;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Project nodes for this frame
      for (let i = 0; i < nodes.length; i++) {
        const [x, y, z] = nodes[i];
        const p = project(x, y, z);
        nodeScreen[i].x = p.x;
        nodeScreen[i].y = p.y;
        nodeScreen[i].z = p.z;
        nodeScreen[i].s = p.s;
      }

      // Arcs (skipped entirely under reduced motion — dt loop never runs)
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      for (const arc of arcs) {
        arc.t += dt / arc.dur;
        if (arc.t > 1.15) Object.assign(arc, spawnArc());
        const A = nodeScreen[arc.a];
        const B = nodeScreen[arc.b];
        // Both endpoints must be visible nodes — otherwise the line looks
        // like it floats off into nothing. Re-roll until a front pair lands.
        if (A.z < 0.02 || B.z < 0.02) {
          Object.assign(arc, spawnArc());
          continue;
        }
        if (arc.t < 0) continue;
        // Control point: 3D midpoint pushed outward so the arc hugs the sphere
        const mx = (nodes[arc.a][0] + nodes[arc.b][0]) / 2;
        const my = (nodes[arc.a][1] + nodes[arc.b][1]) / 2;
        const mz = (nodes[arc.a][2] + nodes[arc.b][2]) / 2;
        const mlen = Math.sqrt(mx * mx + my * my + mz * mz) || 1;
        const lift = 1.38;
        const C = project((mx / mlen) * lift, (my / mlen) * lift, (mz / mlen) * lift);
        const L =
          Math.hypot(C.x - A.x, C.y - A.y) + Math.hypot(B.x - C.x, B.y - C.y);
        const vis = Math.max(0, Math.min(A.z, B.z));
        // Full path — visible enough that the connection reads clearly
        ctx.strokeStyle = rgba(arcRgb, 0.22 + 0.2 * vis);
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.quadraticCurveTo(C.x, C.y, B.x, B.y);
        ctx.stroke();
        // Traveling pulse
        const head = Math.min(arc.t, 1);
        ctx.strokeStyle = rgba(arcRgb, 0.45 + 0.4 * vis);
        ctx.setLineDash([L * 0.16, L]);
        ctx.lineDashOffset = -(head * L * 1.16 - L * 0.16);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.quadraticCurveTo(C.x, C.y, B.x, B.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Place markers, drawn after dots. Servers: layered teal glow (no
      // shadowBlur — slow). Cities: small neutral dot.
      const now = angle / idleSpeed; // monotonic seconds proxy
      for (let i = 0; i < nodeScreen.length; i++) {
        const p = nodeScreen[i];
        if (p.z < -0.2) continue;
        const front = Math.max(0, p.z);
        if (i < SERVER_COUNT) {
          const pulse = 0.8 * Math.sin(now * 2 + i * 1.7);
          const core = (i === 0 ? 3.2 : 2.4) + pulse * 0.5;
          ctx.fillStyle = rgba(nodeRgb, 0.08 + 0.06 * front);
          ctx.beginPath();
          ctx.arc(p.x, p.y, core * 3.4 * p.s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgba(nodeRgb, 0.2 + 0.15 * front);
          ctx.beginPath();
          ctx.arc(p.x, p.y, core * 1.9 * p.s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgba(arcRgb, 0.55 + 0.45 * front);
          ctx.beginPath();
          ctx.arc(p.x, p.y, core * p.s, 0, Math.PI * 2);
          ctx.fill();
        } else if (front > 0.02) {
          ctx.fillStyle = rgba(dotRgb, 0.2 + 0.5 * front);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6 * p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels — anchored beside their marker, front hemisphere only.
      // Server labels show early; city labels only once well into view.
      ctx.textBaseline = "middle";
      for (let i = 0; i < nodeScreen.length; i++) {
        const p = nodeScreen[i];
        const isServer = i < SERVER_COUNT;
        if (p.z < (isServer ? 0.05 : 0.3)) continue;
        const front = Math.max(0, p.z);
        const onRight = p.x >= cx;
        ctx.font = isServer ? labelFont : cityFont;
        ctx.textAlign = onRight ? "left" : "right";
        ctx.fillStyle = rgba(dotRgb, isServer ? 0.35 + 0.6 * front : 0.12 + 0.38 * front);
        ctx.fillText(labels[i], p.x + (onRight ? 9 : -9), p.y);
      }
    };

    /* ── Loop lifecycle ────────────────────────────────────────────── */
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let running = false;
    let rafId = 0;
    let last = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    let started = false;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      drawFrame(dt);
      if (running) rafId = requestAnimationFrame(loop);
    };
    const syncLoop = () => {
      const shouldRun = started && visible && pageVisible && !reduceMotion.matches;
      if (shouldRun && !running) {
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncLoop();
    });
    io.observe(wrapper);
    const onVisibility = () => {
      pageVisible = !document.hidden;
      syncLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onMotionChange = () => {
      syncLoop();
      if (reduceMotion.matches) drawFrame(0);
    };
    reduceMotion.addEventListener("change", onMotionChange);

    // Defer the first frame past hydration/LCP work
    const start = () => {
      started = true;
      if (reduceMotion.matches) {
        drawFrame(0); // single static frame
      } else {
        wrapper.addEventListener("pointermove", onPointerMove);
        wrapper.addEventListener("pointerleave", onPointerLeave);
        syncLoop();
      }
    };
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    let idleId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (w.requestIdleCallback) {
      idleId = w.requestIdleCallback(start, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(start, 200);
    }

    return () => {
      running = false;
      started = false;
      cancelAnimationFrame(rafId);
      if (idleId && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
      io.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionChange);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [pointCount, idleSpeed]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <canvas ref={canvasRef} className="w-full h-full" aria-hidden="true" />
    </div>
  );
}
