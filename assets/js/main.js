import { NAV_LINKS, ABOUT } from "./data.js";
import { initTheme } from "./theme.js";
import { runPreloader } from "./preloader.js";
import { initParticles } from "./particles.js";
import { initAvatar } from "./avatar.js";
import { initJourney } from "./journey.js";
import { initProjects } from "./projects.js";
import { initSkills } from "./skills.js";
import { initChat } from "./chat.js";
import { initEmotions } from "./emotions.js";

// A self-correcting smooth scroll. Native CSS `scroll-behavior: smooth`
// computes its landing offset once, up front — if the page reflows mid-
// animation (e.g. a web font swapping in and changing heading heights, which
// happens in the first second or two after load), the browser keeps
// steering at a now-stale target and lands short. This re-reads the target's
// position every frame instead, so it always arrives exactly on target
// regardless of layout shifting underneath it.
function smoothScrollTo(target) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navH = document.getElementById("site-nav")?.offsetHeight || 0;
  // Every intermediate frame must jump instantly (behavior: "instant") —
  // window.scrollTo otherwise inherits CSS scroll-behavior, and if that ever
  // resolves to "smooth" each of these ~60/sec calls queues its own smooth
  // animation; the overlapping animations compound and run away well past
  // the target.
  if (reduceMotion) {
    const y = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
    return;
  }
  const duration = 600;
  const start = performance.now();
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function step(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    const currentY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + currentY - navH;
    const remaining = targetY - currentY;
    const nextY = currentY + remaining * ease(Math.min(1, t + 0.08));
    window.scrollTo({ top: nextY, left: 0, behavior: "instant" });
    if (t < 1) requestAnimationFrame(step);
    else window.scrollTo({ top: targetY, left: 0, behavior: "instant" });
  }
  requestAnimationFrame(step);
}

function renderNav() {
  const navLinks = document.querySelector(".nav-links");
  const mobileMenu = document.getElementById("mobile-menu");
  const linkHtml = NAV_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join("");
  if (navLinks) navLinks.innerHTML = linkHtml;
  if (mobileMenu) mobileMenu.innerHTML = linkHtml;

  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", `#${id}`);
      smoothScrollTo(target);
    });
  });

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("mobile-menu-open", open);
  });
  mobileMenu?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("mobile-menu-open");
    })
  );
}

function renderAbout() {
  const el = document.getElementById("about-copy");
  if (!el) return;
  el.innerHTML = ABOUT.paragraphs.map((p) => `<p>${p}</p>`).join("");
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => observer.observe(el));
}

// The social rail and résumé FAB are fixed at the left edge for the whole
// page; anywhere content also starts near that edge (every section, once
// centered container padding is accounted for) they'd sit on top of it. Only
// show them while the hero is in view.
function initSideRailVisibility() {
  const hero = document.getElementById("hero");
  const rail = document.querySelector(".social-rail");
  const fab = document.querySelector(".resume-fab");
  if (!hero || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        rail?.classList.toggle("hidden", !entry.isIntersecting);
        fab?.classList.toggle("hidden", !entry.isIntersecting);
      });
    },
    { threshold: 0.05 }
  );
  observer.observe(hero);
}

function initNavShadow() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.style.borderBottomColor = window.scrollY > 8 ? "var(--line)" : "transparent";
  });
}

async function boot() {
  initTheme();
  renderNav();
  renderAbout();
  initNavShadow();
  initSideRailVisibility();
  initParticles("particles-canvas");
  initJourney();
  initProjects();
  initSkills("skills-stage", "skills-legend");
  initChat();
  initEmotions();
  initReveal();
  initAvatar("avatar-mount");

  await runPreloader();
}

boot();
