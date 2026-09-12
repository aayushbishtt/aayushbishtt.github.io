// Dark/light theme switching.
//
// The initial theme is resolved by an inline script in index.html so it is
// applied before first paint. This module only owns the toggle button and
// the follow-the-system behaviour after load.
//
// Canvas-based visuals (the hero particle field, the preloader net) read
// their colours from CSS custom properties at draw time rather than being
// told about the change, so they pick up the new palette on their next
// frame. Anything that paints once rather than continuously subscribes to
// `onThemeChange` and repaints itself.

const STORAGE_KEY = "ab-theme";
const listeners = new Set();

export function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Reads a CSS custom property off the root element. Canvas has no access to
// the cascade, so every canvas colour is pulled through here — that is what
// keeps the particle field in step with the theme instead of hard-coding a
// second copy of the palette in JavaScript.
export function cssVar(name, fallback = "") {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function apply(theme, persist) {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* private browsing — the toggle still works for this page view */
    }
  }
  listeners.forEach((fn) => fn(theme));
}

export function initTheme(buttonId = "theme-toggle") {
  const btn = document.getElementById(buttonId);

  btn?.addEventListener("click", () => {
    apply(currentTheme() === "light" ? "dark" : "light", true);
  });

  // Only follow the OS while the visitor has not expressed a preference of
  // their own — an explicit choice should outlive a system theme schedule.
  let hasExplicitChoice = false;
  try {
    hasExplicitChoice = !!localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
  if (!hasExplicitChoice) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener?.("change", (e) => apply(e.matches ? "light" : "dark", false));
  }
}
