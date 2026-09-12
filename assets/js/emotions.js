// GoEmotions live demo — multi-label emotion classification, run entirely in
// the visitor's browser.
//
// The model (MiniLMv2 fine-tuned on GoEmotions, int8-quantised to ONNX) is
// served from this repo rather than from a CDN or an inference API, so the
// demo has no backend, no API key and no cold start. The cost is a ~32MB
// one-time download, which is why nothing is fetched until the visitor
// actually presses Analyse.

const MODEL_DIR = "assets/model/";
const MODEL_ID = "go-emotions";
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1";

// GoEmotions is a multi-label task: each of the 28 emotions is scored
// independently with a sigmoid, and the scores are not expected to sum to 1.
// The pipeline picks sigmoid over softmax off `problem_type` in the model's
// config.json — if that field is ever lost the scores silently become a
// softmax distribution and mixed sentiment collapses onto one winner.
const TOP_K = 6;
const SCORE_FLOOR = 0.02;

const EMOTION_COLORS = {
  admiration: "#f97316", amusement: "#fbbf24", anger: "#ef4444",
  annoyance: "#f87171", approval: "#34d399", caring: "#f472b6",
  confusion: "#e879f9", curiosity: "#38bdf8", desire: "#fb7185",
  disappointment: "#f87171", disapproval: "#fb923c", disgust: "#84cc16",
  embarrassment: "#d946ef", excitement: "#a78bfa", fear: "#c084fc",
  gratitude: "#2dd4bf", grief: "#64748b", joy: "#facc15",
  love: "#ec4899", nervousness: "#a3a3a3", neutral: "#94a3b8",
  optimism: "#fbbf24", pride: "#f59e0b", realization: "#22d3ee",
  relief: "#4ade80", remorse: "#94a3b8", sadness: "#60a5fa",
  surprise: "#fb923c",
};

const EXAMPLES = [
  "I absolutely love what you built here!",
  "I hate when things break at the worst possible time.",
  "Not sure how I feel about this change.",
  "I can't believe I got the offer. This is incredible!",
];

let classifierPromise = null;

function setStatus(state, text) {
  const wrap = document.getElementById("emo-status");
  const label = document.getElementById("emo-status-text");
  if (!wrap || !label) return;
  wrap.className = `emo-model-status ${state}`;
  label.textContent = text;
}

function renderProgress(pct, note) {
  const results = document.getElementById("emo-results");
  if (!results) return;
  results.innerHTML = `
    <p class="emo-progress-label">Loading model — ${Math.round(pct)}%</p>
    <div class="emo-progress-track"><div class="emo-progress-fill" style="width:${pct}%"></div></div>
    <p class="emo-progress-note">${note}</p>`;
}

async function getClassifier() {
  if (classifierPromise) return classifierPromise;

  classifierPromise = (async () => {
    const { pipeline, env } = await import(/* @vite-ignore */ TRANSFORMERS_URL);

    // Point the library at this repo's copy of the weights instead of the
    // Hugging Face Hub, and stop it falling back to a remote fetch — a silent
    // CDN fallback would make a broken local path look like it works in dev
    // and then leak a third-party request in production.
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.localModelPath = MODEL_DIR;

    // Track download progress across every file the pipeline pulls, so the
    // bar reflects total bytes rather than jumping per file.
    const bytes = new Map();
    const onProgress = (p) => {
      if (p.status !== "progress" && p.status !== "download") return;
      if (typeof p.loaded === "number" && typeof p.total === "number" && p.total > 0) {
        bytes.set(p.file, { loaded: p.loaded, total: p.total });
      }
      let loaded = 0;
      let total = 0;
      for (const v of bytes.values()) {
        loaded += v.loaded;
        total += v.total;
      }
      if (total > 0) {
        const pct = Math.min(99, (loaded / total) * 100);
        renderProgress(pct, `${(loaded / 1048576).toFixed(1)} MB of ${(total / 1048576).toFixed(1)} MB — cached after this`);
      }
    };

    setStatus("loading", "Downloading model weights…");
    renderProgress(0, "First run only — the browser caches the weights afterwards");

    // dtype "q8" resolves to onnx/model_quantized.onnx, which is the layout
    // the weights are committed under. Passing model_file_name as well would
    // append the suffix twice and look for model_quantized_quantized.onnx.
    const classifier = await pipeline("text-classification", MODEL_ID, {
      dtype: "q8",
      progress_callback: onProgress,
    });

    setStatus("ready", "Model ready — running locally on your device");
    return classifier;
  })();

  // A failed load must not poison every later attempt; clear the cached
  // promise so pressing Analyse again genuinely retries.
  classifierPromise.catch(() => {
    classifierPromise = null;
  });

  return classifierPromise;
}

function renderResults(scored) {
  const results = document.getElementById("emo-results");
  if (!results) return;

  if (!scored.length) {
    results.innerHTML = `<p class="emo-placeholder">No emotion scored above ${Math.round(SCORE_FLOOR * 100)}% — try a sentence with more feeling in it.</p>`;
    return;
  }

  results.innerHTML = scored
    .map((r, i) => {
      const color = EMOTION_COLORS[r.label] || "var(--accent)";
      const pct = Math.round(r.score * 100);
      return `
        <div class="emo-bar-row" style="animation-delay:${i * 0.07}s">
          <span class="emo-label">${r.label.replace(/_/g, " ")}</span>
          <div class="emo-bar-track">
            <div class="emo-bar-fill" style="background:${color};box-shadow:0 0 8px ${color}80"></div>
          </div>
          <span class="emo-pct" style="color:${color}">${pct}%</span>
        </div>`;
    })
    .join("");

  // Width is applied on the next frame so the bars animate from zero rather
  // than appearing already filled.
  requestAnimationFrame(() => {
    results.querySelectorAll(".emo-bar-fill").forEach((el, i) => {
      el.style.width = `${Math.round(scored[i].score * 100)}%`;
    });
  });
}

export function initEmotions() {
  const input = document.getElementById("emo-input");
  const runBtn = document.getElementById("emo-run");
  const countEl = document.getElementById("emo-count");
  const examplesEl = document.getElementById("emo-examples");
  const results = document.getElementById("emo-results");
  if (!input || !runBtn || !results) return;

  let busy = false;

  const syncButton = () => {
    runBtn.disabled = busy || !input.value.trim();
  };

  input.addEventListener("input", () => {
    if (countEl) countEl.textContent = input.value.length;
    syncButton();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      run();
    }
  });

  EXAMPLES.forEach((text) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "emo-example-chip";
    chip.textContent = `"${text.slice(0, 34)}${text.length > 34 ? "…" : ""}"`;
    chip.addEventListener("click", () => {
      input.value = text;
      if (countEl) countEl.textContent = text.length;
      syncButton();
      run();
    });
    examplesEl?.appendChild(chip);
  });

  async function run() {
    const text = input.value.trim();
    if (!text || busy) return;

    busy = true;
    syncButton();
    runBtn.innerHTML = '<span class="emo-spinner"></span>';

    try {
      const classifier = await getClassifier();
      results.innerHTML = '<p class="emo-progress-label">Running inference…</p>';

      // top_k: null returns a score for every label, which is what a
      // multi-label head needs — the default of 1 returns only the single
      // highest-scoring emotion.
      const raw = await classifier(text, { top_k: null });
      const all = Array.isArray(raw[0]) ? raw[0] : raw;

      const scored = all
        .filter((r) => r.score >= SCORE_FLOOR)
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K);

      renderResults(scored);
    } catch (err) {
      console.error("[go-emotions]", err);
      setStatus("error", "Could not load the model");
      results.innerHTML = '<p class="emo-error">Could not load the model in this browser. It needs WebAssembly and about 32&nbsp;MB of free cache — try again, or open the site in a desktop browser.</p>';
    } finally {
      busy = false;
      runBtn.textContent = "Analyse";
      syncButton();
    }
  }

  runBtn.addEventListener("click", run);
  syncButton();
}
