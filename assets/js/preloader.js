// Preloader — animates a small feedforward net "training" to 100%, then
// fades out and unlocks scroll. Plays once per browser session.

import { cssVar } from "./theme.js";

const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SESSION_KEY = "ab-portfolio-preloaded";

const LAYER_SIZES = [4, 5, 4, 1];
const DURATION_MS = REDUCE_MOTION ? 300 : 2200;

// A node is drawn as a disc of radius ~9 wrapped in a glow of twice that.
// Spreading the layers across the full canvas width put the first and last
// layers' centres exactly on x=0 and x=w, so both were drawn half outside
// the canvas and clipped. Insetting by the glow radius keeps every node
// whole.
const PAD_X = 22;
const PAD_Y = 16;

function buildLayout(w, h) {
  const innerW = w - PAD_X * 2;
  const innerH = h - PAD_Y * 2;
  return LAYER_SIZES.map((count, li) => {
    const x = PAD_X + (innerW / (LAYER_SIZES.length - 1)) * li;
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const y = PAD_Y + (innerH / (count + 1)) * (i + 1);
      nodes.push({ x, y, value: Math.random() });
    }
    return nodes;
  });
}

// Canvas pixels are device pixels; CSS pixels are not. Without this the net
// renders soft and blurry on any HiDPI display.
function scaleForDpr(canvas, ctx) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // The width/height attributes are the design size, not a promise that the
  // viewport can fit them. On a 360px phone the authored 360px canvas runs
  // edge to edge; only body { overflow-x: hidden } was hiding the spill.
  const aspect = canvas.height / canvas.width;
  const cssW = Math.max(200, Math.min(canvas.width, window.innerWidth - 48));
  const cssH = Math.round(cssW * aspect);
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w: cssW, h: cssH };
}

function rgbaFromHex(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return `rgba(74, 222, 159, ${alpha})`;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => parseInt(v, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawFrame(ctx, w, h, layers, t) {
  ctx.clearRect(0, 0, w, h);
  const accent = cssVar("--accent", "#4ade9f");
  const nodeFill = cssVar("--bg-solid", "#14110f");

  // Edges
  for (let li = 0; li < layers.length - 1; li++) {
    const from = layers[li];
    const to = layers[li + 1];
    for (const a of from) {
      for (const b of to) {
        const pulse = (Math.sin(t * 3 + a.x * 0.05 + a.y * 0.05) + 1) / 2;
        ctx.strokeStyle = rgbaFromHex(accent, 0.06 + pulse * 0.16);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Nodes
  for (const layer of layers) {
    for (const n of layer) {
      const glow = (Math.sin(t * 4 + n.x + n.y) + 1) / 2;
      const r = 7 + glow * 2;
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2);
      grad.addColorStop(0, rgbaFromHex(accent, 0.9));
      grad.addColorStop(1, rgbaFromHex(accent, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = nodeFill;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

export function runPreloader() {
  const el = document.getElementById("preloader");
  const canvas = document.getElementById("preloader-canvas");
  const pctEl = document.getElementById("preloader-pct");
  const statusEl = document.getElementById("preloader-status");

  if (!el || !canvas) return Promise.resolve();

  // Skip the full animation on repeat visits within the same session.
  const alreadyShown = sessionStorage.getItem(SESSION_KEY);

  return new Promise((resolve) => {
    const finish = () => {
      el.classList.add("done");
      document.body.style.overflow = "";
      sessionStorage.setItem(SESSION_KEY, "1");
      setTimeout(resolve, 650);
    };

    document.body.style.overflow = "hidden";

    if (alreadyShown || REDUCE_MOTION) {
      // Nothing is drawn on this path, so the canvas would otherwise hold
      // open a blank 360x220 box above the readout.
      canvas.style.display = "none";
      pctEl.textContent = "100";
      statusEl.textContent = "Ready.";
      setTimeout(finish, alreadyShown ? 120 : DURATION_MS);
      return;
    }

    const ctx = canvas.getContext("2d");
    const { w, h } = scaleForDpr(canvas, ctx);
    const layers = buildLayout(w, h);

    const statuses = [
      "Initializing weights…",
      "Forward pass…",
      "Backpropagating gradients…",
      "Updating parameters…",
      "Converging…",
    ];

    const start = performance.now();
    let raf;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const pct = Math.round(progress * 100);
      pctEl.textContent = pct;

      const loss = (1 - progress) * (1 - progress) * 0.42 + 0.0008;
      const statusIdx = Math.min(statuses.length - 1, Math.floor(progress * statuses.length));
      statusEl.textContent =
        progress < 1
          ? `${statuses[statusIdx]} loss: ${loss.toFixed(4)}`
          : "Ready.";

      drawFrame(ctx, w, h, layers, elapsed / 500);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
        setTimeout(finish, 350);
      }
    }
    raf = requestAnimationFrame(tick);
  });
}
