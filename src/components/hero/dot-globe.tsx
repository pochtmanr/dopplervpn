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
  { lat: 59.33, lon: 18.07, label: "Stockholm" },
  { lat: 55.76, lon: 37.62, label: "Moscow" },
  { lat: 41.59, lon: -93.62, label: "Des Moines" },
  { lat: 43.65, lon: -79.38, label: "Toronto" },
  { lat: 22.32, lon: 114.17, label: "Hong Kong" },
  { lat: 35.68, lon: 139.69, label: "Tokyo" },
  { lat: 25.2, lon: 55.27, label: "Dubai" },
];

// Major cities shown as small neutral markers (servers stay teal); arcs travel
// from these "user" cities into the server network. English labels only.
const CITIES: ReadonlyArray<{ lat: number; lon: number; label: string }> = [
  { lat: 40.71, lon: -74.01, label: "New York" },
  { lat: 34.05, lon: -118.24, label: "Los Angeles" },
  { lat: 19.43, lon: -99.13, label: "Mexico City" },
  { lat: 4.71, lon: -74.07, label: "Bogotá" },
  { lat: -12.05, lon: -77.04, label: "Lima" },
  { lat: -23.55, lon: -46.63, label: "São Paulo" },
  { lat: -33.45, lon: -70.67, label: "Santiago" },
  { lat: -34.6, lon: -58.38, label: "Buenos Aires" },
  { lat: 51.5, lon: -0.12, label: "London" },
  { lat: 48.85, lon: 2.35, label: "Paris" },
  { lat: 40.42, lon: -3.7, label: "Madrid" },
  { lat: 33.57, lon: -7.59, label: "Casablanca" },
  { lat: 30.04, lon: 31.24, label: "Cairo" },
  { lat: 6.52, lon: 3.38, label: "Lagos" },
  { lat: -1.29, lon: 36.82, label: "Nairobi" },
  { lat: -26.2, lon: 28.05, label: "Johannesburg" },
  { lat: 25.2, lon: 55.27, label: "Dubai" },
  { lat: 41.01, lon: 28.98, label: "Istanbul" },
  { lat: 55.76, lon: 37.62, label: "Moscow" },
  { lat: 35.69, lon: 51.39, label: "Tehran" },
  { lat: 41.3, lon: 69.24, label: "Tashkent" },
  { lat: 43.24, lon: 76.89, label: "Almaty" },
  { lat: 28.61, lon: 77.21, label: "Delhi" },
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
  // North & Central America (Hudson Bay / Great Lakes carved via SEAS below)
  [[-166, 66], [-160, 70.5], [-156, 71.3], [-148, 70.4], [-141, 69.6], [-135, 69.3], [-128, 70], [-122, 69.5], [-115, 69], [-108, 68.3], [-101, 68.5], [-95, 71.5], [-90, 69], [-85, 66], [-78, 62.5], [-73, 62.5], [-69.5, 59], [-65, 60], [-58, 55], [-56, 52], [-60, 47.5], [-64, 45.5], [-60, 46], [-66, 44], [-70, 42.5], [-70, 41.5], [-74, 40.5], [-75.5, 38], [-76, 35], [-78.5, 33.8], [-81, 31.5], [-80.2, 27], [-80, 25.2], [-81.5, 25.5], [-82.5, 28], [-84, 30], [-86, 30.3], [-89.5, 29.2], [-93.5, 29.7], [-97, 27.5], [-97.5, 24], [-97, 21.5], [-94, 18.2], [-91, 18.8], [-90.5, 21], [-87, 21.5], [-88, 17.5], [-86.5, 16], [-83.5, 15.2], [-83.5, 11], [-81, 8.5], [-78, 9.2], [-80, 7.5], [-83, 9.5], [-85, 11], [-88, 13], [-92, 15], [-95, 16], [-100, 17], [-105, 19.5], [-106.5, 23.5], [-109.5, 23], [-112.5, 27], [-114.5, 30], [-117.2, 32.7], [-120.5, 34.5], [-122, 37], [-124, 40], [-124, 43.5], [-124.5, 47.5], [-127, 50], [-130, 52.5], [-133.5, 55], [-137, 58.5], [-141, 60], [-146, 61], [-150, 61], [-152, 58.5], [-156, 57], [-160, 55.5], [-164, 54.7], [-160, 58], [-162, 59.5], [-165, 60.5], [-163, 63], [-167, 65.4]],
  // Baffin Island
  [[-86, 71], [-82, 73.5], [-76, 72.5], [-69, 70.5], [-64, 66.8], [-67, 63], [-72, 63.5], [-77, 65.5], [-83, 67.5]],
  // Greenland
  [[-60, 76], [-50, 82], [-32, 84], [-20, 80], [-22, 70], [-42, 60], [-50, 62], [-55, 68]],
  // Cuba
  [[-84.8, 21.9], [-81, 23.2], [-77, 20.8], [-74.2, 20.3], [-78, 20.5], [-82.5, 21.5]],
  // South America
  [[-77, 8], [-75.5, 10.8], [-71.5, 12.3], [-68, 11.5], [-63, 10.7], [-60, 8.5], [-55, 6], [-52, 4.5], [-50, 0], [-48, -1], [-44, -2.8], [-39.5, -3], [-35.2, -5.5], [-35, -9], [-37.5, -12], [-39, -15], [-39.5, -18], [-41, -22], [-44, -23.2], [-47, -24.5], [-48.5, -28], [-52, -32], [-55.5, -34.8], [-57.5, -38], [-62, -39], [-64.5, -42.5], [-66, -45], [-68.5, -50], [-69, -52], [-71.5, -53.8], [-74, -52], [-75.5, -49], [-74.5, -45], [-74, -41], [-73.5, -37.5], [-71.5, -33], [-71, -30], [-70.3, -25], [-70.3, -18.3], [-72, -17], [-75, -15], [-77, -12], [-79, -8], [-81, -6], [-81.3, -4.5], [-80.5, -2.5], [-80.8, -1], [-80, 0.5], [-77.5, 3.5], [-77.8, 6.5]],
  // Africa
  [[-17.3, 14.7], [-16.5, 19.5], [-13, 27], [-9.5, 31.5], [-5.9, 35.8], [-2, 35.2], [3, 36.8], [9.8, 37.3], [11, 33.8], [15.2, 32.3], [20, 30.8], [25, 31.5], [29.5, 31], [32.3, 31.2], [34.2, 27.8], [35.5, 24], [37.2, 21], [39.5, 15.5], [43.2, 11.5], [47, 11.2], [51.2, 11.8], [51, 10.4], [46, 2], [41, -1.9], [39.2, -6.5], [40.5, -10.5], [36.8, -17.5], [35, -19.8], [32.8, -25.8], [28, -32.8], [22, -34.5], [18.4, -34.3], [16.5, -29], [14.5, -22.5], [12, -18], [13.2, -11], [12, -5], [8.8, -0.7], [9.7, 4], [3, 6.3], [-2, 5], [-7.5, 4.3], [-11, 6.7], [-15, 10.8]],
  // Eurasia (Europe + Asia mainland, India, Indochina; Baltic/Black/Caspian carved via SEAS)
  [[-9, 37], [-9, 43], [-2, 43.5], [-1, 46], [-4.5, 48.5], [0, 49.5], [2, 51], [4.5, 52.5], [8, 54], [8, 56], [10.5, 57.5], [6, 58], [5, 59], [5, 62], [10, 64], [13, 66.5], [16, 68.5], [20, 70], [26, 71], [31, 70], [33, 69], [37, 66.5], [37, 64.5], [40, 64.5], [44, 67], [48, 68], [54, 68.5], [60, 69], [66, 69], [68, 72], [74, 72], [80, 73], [90, 75], [98, 76], [104, 77.5], [110, 74], [115, 73.5], [122, 73], [128, 72.5], [136, 71.5], [143, 72], [150, 70], [160, 69.5], [170, 67], [179, 66], [179, 64.5], [174, 62], [166, 62], [163, 60], [163, 56.5], [160, 53], [156, 51], [155.5, 55], [156.5, 58.5], [152, 59.5], [146, 59], [141, 57], [140, 53.5], [140, 49], [136, 45.5], [132, 43], [130, 42.5], [129.5, 39], [129, 35.5], [126.5, 34.3], [126, 36.5], [125, 38], [124.5, 40], [122, 40.5], [121, 39], [118, 39], [118, 38], [122, 37.5], [120, 35], [121, 32], [122, 30], [120, 27.5], [118, 24.5], [114, 22.3], [110, 21], [108, 21.5], [106, 20], [106, 18.5], [108, 16], [109, 12.5], [108, 11], [106.5, 10], [104.5, 10], [102, 12], [100, 13.5], [100.5, 9], [102, 6], [103.5, 1.5], [101, 3], [99, 6.5], [98, 10], [97.5, 15], [94, 16], [92.5, 20], [91.5, 22.5], [89, 21.8], [87, 21], [84, 18.5], [80.5, 15.5], [80, 13], [79.8, 10], [77.5, 8.1], [76, 10], [74, 13], [73, 17], [72.7, 19.2], [72, 21], [68.5, 23.5], [67.5, 24.8], [64, 25.2], [60, 25.3], [57, 25.8], [56.5, 27], [53, 26.7], [51.5, 27.8], [49.5, 29.5], [48, 30], [44, 32], [39, 32.5], [34.5, 31.3], [35, 33], [36, 35.8], [33, 36.2], [30, 36.3], [27, 36.8], [26.3, 38.5], [26.3, 40], [24, 40.3], [23.5, 38], [22, 36.6], [21.2, 38.3], [19.5, 40.5], [18, 42.5], [15.5, 43.8], [13.8, 45.6], [13.5, 43.8], [15.8, 41.9], [18.4, 40.3], [16.8, 40.3], [16, 37.9], [15, 40], [14.5, 40.6], [12.5, 41.5], [10.5, 42.9], [9, 44.3], [6.5, 43.3], [4, 43.4], [3.2, 42], [2, 41.3], [-0.3, 39.4], [-2.1, 36.8], [-5.4, 36], [-7, 37]],
  // Arabia
  [[34.8, 28], [35, 29.5], [38, 30.5], [44, 31.2], [47, 30], [48, 29.5], [50, 26.5], [51.5, 24.5], [54, 24.3], [56.3, 26.2], [58.5, 23.5], [59.8, 22.3], [57.5, 19], [55, 17], [52.2, 15.6], [48.7, 14], [45, 12.8], [43.3, 12.7], [42.7, 15], [41, 17], [39, 20.8], [37, 24]],
  // Sri Lanka
  [[79.8, 9.5], [81.8, 7.5], [80.6, 5.9], [79.7, 8]],
  // Taiwan
  [[120, 25.2], [122, 25.2], [121, 21.9], [120.1, 23.5]],
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

// Inland seas / large bays carved out of the continent fill — the polygons
// above would otherwise render these as solid land.
const SEAS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  // Hudson Bay (incl. James Bay)
  [[-94.5, 57], [-93, 61.5], [-87, 64], [-81, 63], [-77.5, 58.5], [-79.5, 53], [-82, 51.5], [-84.5, 54.5], [-89, 55.5]],
  // Great Lakes
  [[-92, 46.5], [-89, 48.5], [-84.5, 46.8], [-81, 45.5], [-76.5, 44], [-79, 43], [-83, 41.7], [-87, 41.7], [-88, 44], [-91, 46]],
  // Baltic Sea + Gulf of Bothnia
  [[13, 54.8], [17, 54.6], [21, 55.5], [24, 57.5], [26.5, 59.2], [30, 59.5], [30, 60.5], [25.5, 60.2], [23, 62], [25.5, 65.5], [22, 65.8], [19.5, 63], [18, 60.5], [16, 57], [12.8, 55.8]],
  // Black Sea
  [[28, 41.4], [28.5, 44.5], [33, 45.8], [36.5, 45.2], [39.5, 46.8], [41.5, 42.8], [37, 41.2], [31.5, 41.2]],
  // Caspian Sea
  [[47.5, 44], [49.5, 46.5], [52.5, 46.8], [54, 43], [54, 40], [53, 37.2], [50.5, 36.9], [49, 38.5], [48, 42]],
];

function inPolygon(lon: number, lat: number, poly: ReadonlyArray<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function isLand(lon: number, lat: number): boolean {
  let land = false;
  for (const poly of CONTINENTS) {
    if (inPolygon(lon, lat, poly)) {
      land = true;
      break;
    }
  }
  if (!land) return false;
  for (const sea of SEAS) {
    if (inPolygon(lon, lat, sea)) return false;
  }
  return true;
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
