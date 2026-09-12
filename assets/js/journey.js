import { JOURNEY } from "./data.js";

const VB_W = 560;
const VB_H = 300;
const PAD_L = 34;
const PAD_R = 24;
const PAD_T = 30;
const PAD_B = 40;

function xFor(i) {
  const usable = VB_W - PAD_L - PAD_R;
  return PAD_L + (usable / (JOURNEY.length - 1)) * i;
}
function yFor(loss) {
  // Higher loss near the top, lower loss near the bottom, so the curve
  // visibly *descends* left-to-right as training progresses — the whole
  // point of the metaphor.
  const usable = VB_H - PAD_T - PAD_B;
  return PAD_T + usable * (1 - loss);
}

let typeTimer = null;

function typeLog(text) {
  const el = document.getElementById("training-log");
  if (!el) return;
  clearTimeout(typeTimer);
  el.textContent = "";
  let i = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    el.textContent = text;
    return;
  }
  function step() {
    el.textContent = text.slice(0, i);
    i++;
    if (i <= text.length) {
      typeTimer = setTimeout(step, 12);
    }
  }
  step();
}

function renderCard(entry) {
  const card = document.getElementById("journey-card");
  if (!card) return;
  const kindLabel = entry.kind === "education" ? "EDUCATION" : "PROFESSIONAL EXPERIENCE";
  card.innerHTML = `
    <div class="kind-tag eyebrow" style="margin-bottom:0;">${kindLabel}</div>
    <h3>${entry.title}</h3>
    <div class="org">${entry.org}</div>
    <div class="when">${entry.place} · ${entry.when}</div>
    ${
      entry.bullets.length
        ? `<ul>${entry.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
        : ""
    }
  `;
}

function setActive(index) {
  document.querySelectorAll(".loss-dot").forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
  document.querySelectorAll(".loss-epoch-label").forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
  renderCard(JOURNEY[index]);
  typeLog(JOURNEY[index].log);
}

export function initJourney() {
  const g = document.getElementById("loss-chart-content");
  if (!g) return;

  const pathPts = JOURNEY.map((e, i) => `${xFor(i)},${yFor(e.loss)}`).join(" L ");
  const linePath = `M ${pathPts}`;
  const fillPath = `M ${xFor(0)},${VB_H - PAD_B} L ${pathPts} L ${xFor(JOURNEY.length - 1)},${VB_H - PAD_B} Z`;

  let svg = `<path class="loss-fill" d="${fillPath}"></path>`;
  svg += `<path class="loss-path" d="${linePath}"></path>`;

  JOURNEY.forEach((e, i) => {
    const x = xFor(i);
    const y = yFor(e.loss);
    svg += `<text class="loss-epoch-label" x="${x}" y="${VB_H - PAD_B + 22}" data-i="${i}">EPOCH ${e.epoch}</text>`;
    svg += `<circle class="loss-dot" data-i="${i}" cx="${x}" cy="${y}" r="6"></circle>`;
    svg += `<circle class="loss-dot-hit" data-i="${i}" cx="${x}" cy="${y}" r="18" tabindex="0" role="button" aria-label="${e.title} at ${e.org}"></circle>`;
  });

  g.innerHTML = svg;

  const hits = g.querySelectorAll(".loss-dot-hit");
  hits.forEach((hit) => {
    const i = Number(hit.dataset.i);
    hit.addEventListener("mouseenter", () => setActive(i));
    hit.addEventListener("click", () => setActive(i));
    hit.addEventListener("focus", () => setActive(i));
    hit.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = Math.min(JOURNEY.length - 1, i + 1);
        hits[next].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = Math.max(0, i - 1);
        hits[prev].focus();
      }
    });
  });

  let current = 0;
  setActive(current);

  // Auto-advance until the user interacts.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    let autoplay = true;
    const stopAutoplay = () => (autoplay = false);
    g.addEventListener("mouseenter", stopAutoplay, { once: true });
    g.addEventListener("focusin", stopAutoplay, { once: true });
    g.addEventListener("touchstart", stopAutoplay, { once: true });

    const interval = setInterval(() => {
      if (!autoplay) {
        clearInterval(interval);
        return;
      }
      current = (current + 1) % JOURNEY.length;
      setActive(current);
    }, 3200);
  }
}
