// Custom pointer: an accent-outlined arrow with a soft glow trailing behind
// it, replacing the OS cursor on precise-pointer devices.
//
// The arrow tracks the pointer exactly — a cursor that lags its own input
// feels broken rather than stylish — while the glow lerps in behind it, so
// fast movement leaves a short comet tail and the pair settles concentric
// when the hand stops.
//
// This only ever engages for a fine pointer that also supports hover, so
// touch devices, pen input and anything driven by a keyboard keep the native
// behaviour untouched. The cursor is built in JS rather than living in
// index.html so an unsupported device never has the markup at all.

const GLOW_EASE = 0.22;   // glow catch-up per frame; lower = longer tail
const HOVER_SELECTOR = 'a, button, summary, [role="button"], [data-cursor="hover"]';
const TEXT_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

export function initCursor() {
  const fine = window.matchMedia("(pointer: fine) and (hover: hover)");
  if (!fine.matches) return;

  const root = document.createElement("div");
  root.className = "cursor";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="cursor-glow"></div>
    <svg class="cursor-arrow" width="22" height="24" viewBox="0 0 22 24">
      <path d="M2 1.6 L2 18.4 L6.6 14.2 L9.4 20.4 L12.5 19 L9.8 13 L16 12.6 Z" />
    </svg>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("has-custom-cursor");

  const arrow = root.querySelector(".cursor-arrow");
  const glow = root.querySelector(".cursor-glow");

  let x = -100, y = -100;   // true pointer position
  let gx = x, gy = y;       // glow position, chasing it
  let raf;

  function frame() {
    gx += (x - gx) * GLOW_EASE;
    gy += (y - gy) * GLOW_EASE;
    arrow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    raf = requestAnimationFrame(frame);
  }

  document.addEventListener("pointermove", (e) => {
    // Ignore synthesised moves from touch so a tap doesn't strand the arrow.
    if (e.pointerType !== "mouse") return;
    x = e.clientX;
    y = e.clientY;
    root.classList.add("is-visible");

    // Resolved per move rather than by binding listeners to every link,
    // because most of this page's interactive elements are rendered from
    // data after load and would need re-binding on every re-render.
    const el = e.target instanceof Element ? e.target : null;
    root.classList.toggle("is-hover", !!el?.closest(HOVER_SELECTOR));
    root.classList.toggle("is-text", !!el?.closest(TEXT_SELECTOR));
  }, { passive: true });

  // Leaving the window, or crossing into an iframe, stops pointermove — park
  // the cursor instead of leaving it frozen mid-page.
  document.addEventListener("pointerleave", () => root.classList.remove("is-visible"));
  window.addEventListener("blur", () => root.classList.remove("is-visible"));

  document.addEventListener("pointerdown", () => root.classList.add("is-down"));
  document.addEventListener("pointerup", () => root.classList.remove("is-down"));

  // Stand down if the pointer stops being a mouse (tablet switched to touch,
  // or a display change), rather than leaving a dead arrow on screen.
  fine.addEventListener?.("change", (e) => {
    if (e.matches) return;
    cancelAnimationFrame(raf);
    root.remove();
    document.documentElement.classList.remove("has-custom-cursor");
  });

  frame();
}
