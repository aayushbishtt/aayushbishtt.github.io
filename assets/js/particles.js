import { cssVar, onThemeChange } from "./theme.js";

// Constellation background canvas, fixed behind the whole page.

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

  // Re-read once per theme change rather than once per particle per frame —
  // getComputedStyle forces a style recalculation and this runs inside an
  // O(n^2) neighbour loop.
  let accent = cssVar("--accent", "#4ade9f");
  let link = cssVar("--muted", "#b8ac9c");
  const accentAlpha = (a) => toRgba(accent, a);
  const linkAlpha = (a) => toRgba(link, a);

  onThemeChange(() => {
    accent = cssVar("--accent", "#4ade9f");
    link = cssVar("--muted", "#b8ac9c");
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

    const count = Math.round((w * h) / 18000);
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = accentAlpha(0.5);
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    const maxDist = 130;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.strokeStyle = linkAlpha(0.18 * (1 - dist / maxDist));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = accentAlpha(0.6);
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    drawStatic();
  } else {
    frame();
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) frame();
      else cancelAnimationFrame(raf);
    });
  }
}
