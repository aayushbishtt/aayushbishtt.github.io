// Physics-driven skill bubbles using Matter.js (loaded globally as
// `window.Matter` via a classic <script> tag — it has no ESM build on
// cdnjs). Falls back to a static wrapped chip grid if Matter didn't load,
// or if the visitor prefers reduced motion.

import { SKILLS, SKILL_CATEGORIES } from "./data.js";

function renderStaticFallback(stage) {
  stage.classList.add("skills-static");
  stage.innerHTML = SKILLS.map((s) => {
    const color = SKILL_CATEGORIES[s.category]?.color || "#e6edf5";
    return `<span class="tag" style="border-color:${color}55;color:${color};">${s.name}</span>`;
  }).join("");
}

function renderLegend(legendEl) {
  if (!legendEl) return;
  legendEl.innerHTML = Object.values(SKILL_CATEGORIES)
    .map(
      (c) => `<span class="skills-legend-item"><span class="skills-legend-dot" style="background:${c.color};"></span>${c.label}</span>`
    )
    .join("");
}

export function initSkills(stageId, legendId) {
  const stage = document.getElementById(stageId);
  const legendEl = document.getElementById(legendId);
  if (!stage) return;
  renderLegend(legendEl);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const Matter = window.Matter;

  if (reduceMotion || !Matter) {
    renderStaticFallback(stage);
    return;
  }

  const { Engine, World, Bodies, Body, Events } = Matter;

  const width = stage.clientWidth;
  const height = stage.clientHeight;

  const engine = Engine.create();
  engine.gravity.y = 0.5;
  const world = engine.world;

  // Floor + side walls only — deliberately no ceiling. Bubbles spawn just
  // above the visible area and fall in under gravity; a ceiling there would
  // just catch them at spawn and pin them out of view.
  const wallOpts = { isStatic: true, render: { visible: false } };
  World.add(world, [
    Bodies.rectangle(width / 2, height + 20, width * 2, 40, wallOpts),
    Bodies.rectangle(-20, height / 2, 40, height * 4, wallOpts),
    Bodies.rectangle(width + 20, height / 2, 40, height * 4, wallOpts),
  ]);

  const bubbleData = SKILLS.map((s, i) => {
    const radius = Math.max(34, Math.min(64, 24 + s.name.length * 3));
    const x = 40 + Math.random() * (width - 80);
    // Spawn already within (or just barely above) the stage so bubbles are
    // visible immediately — the simulation only advances while this section
    // is on-screen, so a large drop from far above can take a long time to
    // resolve if the visitor scrolls past quickly.
    const y = -20 - Math.random() * 140;
    const body = Bodies.circle(x, y, radius, {
      restitution: 0.5,
      friction: 0.15,
      frictionAir: 0.02,
    });
    World.add(world, body);
    return { skill: s, body, radius };
  });

  stage.innerHTML = "";
  const els = bubbleData.map(({ skill, radius }) => {
    const el = document.createElement("div");
    el.className = "skill-bubble";
    el.textContent = skill.name;
    const color = SKILL_CATEGORIES[skill.category]?.color || "#e6edf5";
    el.style.width = `${radius * 2}px`;
    el.style.height = `${radius * 2}px`;
    el.style.background = color;
    el.style.fontSize = radius < 40 ? "10px" : "12px";
    stage.appendChild(el);
    return el;
  });

  // Mouse repulsion
  const mouse = { x: -9999, y: -9999, active: false };
  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  stage.addEventListener("mouseleave", () => (mouse.active = false));
  stage.addEventListener(
    "touchmove",
    (e) => {
      const rect = stage.getBoundingClientRect();
      const t = e.touches[0];
      if (!t) return;
      mouse.x = t.clientX - rect.left;
      mouse.y = t.clientY - rect.top;
      mouse.active = true;
    },
    { passive: true }
  );

  Events.on(engine, "beforeUpdate", () => {
    if (!mouse.active) return;
    for (const { body } of bubbleData) {
      const dx = body.position.x - mouse.x;
      const dy = body.position.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const influence = 130;
      if (dist < influence) {
        const force = ((influence - dist) / influence) * 0.02;
        Body.applyForce(body, body.position, {
          x: (dx / dist) * force,
          y: (dy / dist) * force,
        });
      }
    }
  });

  let running = false;
  let lastTime = performance.now();

  function tick(now) {
    if (!running) return;
    const delta = Math.min(16.667, now - lastTime);
    lastTime = now;
    Engine.update(engine, delta);
    bubbleData.forEach(({ body }, i) => {
      const el = els[i];
      el.style.transform = `translate(${body.position.x - body.circleRadius}px, ${
        body.position.y - body.circleRadius
      }px) rotate(${body.angle}rad)`;
    });
    requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
  }

  // Pause only when the tab itself is hidden, not per-section visibility —
  // an IntersectionObserver-driven pause can stop the loop mid-scroll (e.g.
  // during a fast programmatic scroll the ratio can flicker across the
  // threshold) and, since nothing else prompts a restart once the section is
  // already resting in view, leave the whole simulation stuck frozen.
  start();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener("resize", () => {
    // Keep bubbles within bounds on resize by clamping stray positions.
    const w = stage.clientWidth;
    bubbleData.forEach(({ body }) => {
      if (body.position.x > w) Body.setPosition(body, { x: w - 40, y: body.position.y });
    });
  });
}
