import { cssVar, onThemeChange } from "./theme.js";

// Constellation background canvas, fixed behind the whole page.
//
// Tuned to match the reference site's field rather than a generic particle
// demo: nodes are large enough to read as nodes, a fifth of them are "hubs"
// drawn at double size and full opacity, and links fade out over a generous
// 200px radius at an alpha that is actually visible against the page. The
// field wraps at the edges (rather than bouncing) so it never settles into a
// visible rectangle, and it parts around the cursor.

const LINK_DIST = 200;    // px at which two nodes stop being linked
const LINK_ALPHA = 0.7;   // alpha of a zero-length link, fading to 0 at LINK_DIST
const NODE_ALPHA = 0.78;
const HUB_ALPHA = 1;
const REPEL_DIST = 180;
const REPEL_FORCE = 4;

function toRgba(color, alpha) {
  const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.trim());
  if (hex) {
    const [r, g, b] = [hex[1], hex[2], hex[3]].map((v) => parseInt(v, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(74, 222, 159, ${alpha})`;
}

export function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, dpr;
  let points = [];
  let raf;
  let running = true;
  // Off-screen until the pointer actually moves, so nothing is repelled on load.
  let mouse = { x: -9999, y: -9999 };

  // Re-read once per theme change rather than once per particle per frame —
  // getComputedStyle forces a style recalculation and this runs inside an
  // O(n^2) neighbour loop.
  let accent = cssVar("--accent", "#4ade9f");
  const accentAlpha = (a) => toRgba(accent, a);

  onThemeChange(() => {
    accent = cssVar("--accent", "#4ade9f");
    if (reduceMotion) drawStatic();
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density matched to the reference (~120 nodes on a laptop viewport), but
    // clamped so a phone does not get a sparse field and an ultrawide does not
    // pay for a quadratic neighbour loop over 300 nodes.
    const count = Math.min(Math.max(Math.round((w * h) / 11000), 45), 150);
    points = Array.from({ length: count }, () => {
      const isHub = Math.random() > 0.8;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        // Stored as radii; the reference's 3-6 / 7-12 are diameters.
        r: isHub ? 3.5 + Math.random() * 2.5 : 1.5 + Math.random() * 1.5,
        isHub,
      };
    });
  }

  function drawNodes() {
    ctx.fillStyle = accentAlpha(NODE_ALPHA);
    for (const p of points) {
      if (p.isHub) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = accentAlpha(HUB_ALPHA);
    for (const p of points) {
      if (!p.isHub) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLinks() {
    ctx.lineWidth = 1.2;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const sq = dx * dx + dy * dy;
        if (sq >= LINK_DIST * LINK_DIST) continue;
        const dist = Math.sqrt(sq);
        ctx.strokeStyle = accentAlpha(LINK_ALPHA * (1 - dist / LINK_DIST));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    drawLinks();
    drawNodes();
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const p of points) {
      // Nudge away from the cursor, strongest at the centre of the radius.
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < REPEL_DIST && d > 0.001) {
        const push = (REPEL_FORCE * (1 - d / REPEL_DIST)) / d;
        p.x += dx * push;
        p.y += dy * push;
      }

      p.x += p.vx;
      p.y += p.vy;
      // Wrap rather than bounce: bouncing makes the viewport edges legible as
      // a box the field is trapped inside.
      if (p.x < 0) p.x = w;
      else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      else if (p.y > h) p.y = 0;
    }

    drawLinks();
    drawNodes();

    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    drawStatic();
  } else {
    window.addEventListener("pointermove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
    document.addEventListener("pointerleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    frame();
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) frame();
      else cancelAnimationFrame(raf);
    });
  }
}
