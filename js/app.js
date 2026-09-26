import { renderChat, clearChat } from "./chat.js";
import { renderVoice } from "./voice.js";
import { renderVision } from "./vision.js";
import { renderYouTube } from "./youtube.js";
import { renderWeather } from "./weather.js";
import { renderAssistant } from "./assistant.js";
import { renderMaps } from "./maps.js";
import { renderDocuments } from "./documents.js";
import { showToast } from "./utils.js";

const toolView = document.getElementById("toolView");
const workspaceTitle = document.getElementById("workspaceTitle");
const themeBtn = document.getElementById("themeBtn");
const clearWorkspace = document.getElementById("clearWorkspace");

function syncNavbarHeight() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  document.documentElement.style.setProperty("--aura-nav-height", `${topbar.offsetHeight}px`);
}

syncNavbarHeight();
if (window.ResizeObserver) {
  const topbar = document.querySelector(".topbar");
  if (topbar) new ResizeObserver(syncNavbarHeight).observe(topbar);
}
window.addEventListener("resize", syncNavbarHeight);

const toolNames = {
  chat: "AI Chat",
  voice: "Voice Assistant",
  vision: "Camera & Vision",
  youtube: "YouTube",
  weather: "Weather",
  assistant: "Personal Assistant",
  maps: "Maps",
  documents: "Document Analysis"
};

const renderers = {
  chat: renderChat,
  voice: renderVoice,
  vision: renderVision,
  youtube: renderYouTube,
  weather: renderWeather,
  assistant: renderAssistant,
  maps: renderMaps,
  documents: renderDocuments
};

let currentTool = "chat";

export function openTool(tool) {
  if (!renderers[tool]) return;
  currentTool = tool;
  workspaceTitle.textContent = toolNames[tool];

  document.querySelectorAll("[data-tool]").forEach(btn => {
    if (btn.classList.contains("rail-btn") || btn.classList.contains("home-tool-btn")) {
      btn.classList.toggle("active", btn.dataset.tool === tool);
    }
  });

  toolView.innerHTML = "";
  renderers[tool](toolView);
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", e => {
  const toolButton = e.target.closest("[data-tool]");
  if (toolButton) {
    openTool(toolButton.dataset.tool);
    return;
  }

  const scrollButton = e.target.closest("[data-scroll]");
  if (scrollButton) {
    document.querySelector(scrollButton.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
  }
});

clearWorkspace.addEventListener("click", () => {
  if (currentTool === "chat") clearChat();
  else openTool(currentTool);
  showToast("Workspace refreshed");
});

document.getElementById("openAssistantBtn").addEventListener("click", () => openTool("voice"));

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const icon = themeBtn.querySelector(".icon");
  icon.className = `icon ${document.body.classList.contains("light") ? "icon-moon" : "icon-sun"}`;
  localStorage.setItem("aura-theme", document.body.classList.contains("light") ? "light" : "dark");
});

if (localStorage.getItem("aura-theme") === "light") {
  document.body.classList.add("light");
  themeBtn.querySelector(".icon").className = "icon icon-moon";
}

document.querySelectorAll(".tool-card").forEach((card, i) => {
  card.style.animationDelay = `${i * 50}ms`;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("revealed");
  });
}, { threshold: .08 });

document.querySelectorAll(".section-heading, .tool-card, .flow-card").forEach(el => {
  el.dataset.reveal = "";
  observer.observe(el);
});

openTool("chat");
