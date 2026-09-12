import { CHAT_KB, SITE } from "./data.js";

const TOPIC_BY_ID = Object.fromEntries(CHAT_KB.topics.map((t) => [t.id, t]));
const ALL_TOPIC_IDS = CHAT_KB.topics.map((t) => t.id);

function matchTopic(message) {
  const lower = message.toLowerCase();
  return CHAT_KB.topics.find((t) => t.patterns.some((re) => re.test(lower)));
}

function scrollToBottom(body) {
  body.scrollTop = body.scrollHeight;
}

function appendMessage(body, role, text) {
  const el = document.createElement("div");
  el.className = `chat-msg ${role}`;
  el.textContent = text;
  body.appendChild(el);
  scrollToBottom(body);
  return el;
}

function showTyping(body) {
  const el = document.createElement("div");
  el.className = "chat-typing";
  el.innerHTML = "<span></span><span></span><span></span>";
  body.appendChild(el);
  scrollToBottom(body);
  return el;
}

export function initChat() {
  const launcher = document.getElementById("chat-launcher");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-close");
  const body = document.getElementById("chat-body");
  const chipsEl = document.getElementById("chat-chips");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  if (!launcher || !panel) return;

  let opened = false;

  function renderChips(ids) {
    chipsEl.innerHTML = "";
    ids.forEach((id) => {
      const topic = TOPIC_BY_ID[id];
      const btn = document.createElement("button");
      btn.className = "chat-chip";
      btn.type = "button";
      btn.textContent = topic ? capitalize(id) : capitalize(id);
      btn.addEventListener("click", () => handleUserMessage(capitalize(id)));
      chipsEl.appendChild(btn);
    });
  }

  function capitalize(s) {
    return s.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function respond(topic) {
    const typingEl = showTyping(body);
    const delay = 380 + Math.random() * 320;
    setTimeout(() => {
      typingEl.remove();
      if (topic) {
        appendMessage(body, "bot", topic.answer);
        renderChips(topic.chips || ALL_TOPIC_IDS.slice(0, 3));
      } else {
        appendMessage(body, "bot", CHAT_KB.fallback);
        renderChips(ALL_TOPIC_IDS.slice(0, 4));
      }
    }, delay);
  }

  function handleUserMessage(text) {
    appendMessage(body, "user", text);
    chipsEl.innerHTML = "";
    const topic = matchTopic(text);
    respond(topic);
  }

  function openPanel() {
    opened = true;
    panel.classList.remove("hidden");
    launcher.classList.add("hidden");
    if (!body.dataset.greeted) {
      body.dataset.greeted = "1";
      appendMessage(body, "bot", CHAT_KB.greeting);
      renderChips(ALL_TOPIC_IDS.slice(0, 4));
    }
    input.focus();
  }
  function closePanel() {
    opened = false;
    panel.classList.add("hidden");
    launcher.classList.remove("hidden");
  }

  launcher.addEventListener("click", openPanel);
  closeBtn?.addEventListener("click", closePanel);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    handleUserMessage(text);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && opened) closePanel();
  });
}
