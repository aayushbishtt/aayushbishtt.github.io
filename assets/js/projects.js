import { PROJECTS } from "./data.js";

const ICONS = {
  graph: "fa-diagram-project",
  scissors: "fa-scissors",
  lock: "fa-lock",
  brain: "fa-brain",
  heartbeat: "fa-heart-pulse",
  radiation: "fa-radiation",
};

const GRID_SIZE = 5;
const KERNEL = 3;

function buildInputGrid() {
  const cells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      cells.push({ r, c, val: 1 + Math.floor(Math.random() * 9) });
    }
  }
  return cells;
}

function renderProjectCard(project) {
  const card = document.getElementById("project-card");
  if (!card) return;
  card.innerHTML = `
    <div class="project-icon"><i class="fas ${ICONS[project.icon] || "fa-code"}"></i></div>
    <div>
      <div class="project-body-top">
        <div>
          <div class="project-context">${project.context}</div>
          <h3>${project.title}</h3>
        </div>
        ${project.badge ? `<span class="project-badge">${project.badge}</span>` : ""}
      </div>
      <p>${project.description}</p>
      <div class="project-tags">${project.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <a class="project-repo-link" href="${project.repo}" target="_blank" rel="noopener">
        View on GitHub <i class="fas fa-arrow-up-right-from-square" style="font-size:11px;"></i>
      </a>
    </div>
  `;
}

export function initProjects() {
  const gridEl = document.getElementById("conv-grid");
  const outputEl = document.getElementById("conv-output");
  const replayBtn = document.getElementById("conv-replay-btn");
  if (!gridEl || !outputEl) return;

  const cells = buildInputGrid();
  gridEl.innerHTML = cells
    .map((c) => `<div class="conv-cell" data-r="${c.r}" data-c="${c.c}">${c.val}</div>`)
    .join("");
  const cellEls = gridEl.querySelectorAll(".conv-cell");

  outputEl.innerHTML = PROJECTS.map(
    (p, i) => `
    <button class="conv-output-cell" role="tab" data-index="${i}" aria-selected="false" aria-label="${p.title}">
      ${p.id}
    </button>`
  ).join("");
  const outputCells = outputEl.querySelectorAll(".conv-output-cell");

  function highlightKernel(row, col) {
    cellEls.forEach((cell) => {
      const r = Number(cell.dataset.r);
      const c = Number(cell.dataset.c);
      const inKernel = r >= row && r < row + KERNEL && c >= col && c < col + KERNEL;
      cell.classList.toggle("kernel", inKernel);
    });
  }

  function selectProject(index) {
    const project = PROJECTS[index];
    outputCells.forEach((cell, i) => {
      cell.classList.toggle("active", i === index);
      cell.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    highlightKernel(project.pos[0], project.pos[1]);
    renderProjectCard(project);
  }

  outputCells.forEach((cell) => {
    const i = Number(cell.dataset.index);
    cell.addEventListener("mouseenter", () => selectProject(i));
    cell.addEventListener("click", () => selectProject(i));
    cell.addEventListener("focus", () => selectProject(i));
  });

  selectProject(0);

  replayBtn?.addEventListener("click", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    let i = 0;
    replayBtn.disabled = true;
    const step = () => {
      highlightKernel(PROJECTS[i].pos[0], PROJECTS[i].pos[1]);
      i++;
      if (i < PROJECTS.length) {
        setTimeout(step, 260);
      } else {
        replayBtn.disabled = false;
        const activeIndex = [...outputCells].findIndex((c) => c.classList.contains("active"));
        selectProject(activeIndex >= 0 ? activeIndex : 0);
      }
    };
    step();
  });
}
