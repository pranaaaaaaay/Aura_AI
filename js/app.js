import { clearChat } from "./chat.js";
import { showToast } from "./utils.js";

const themeBtn = document.getElementById("themeBtn");
const clearWorkspace = document.getElementById("clearWorkspace");

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

function navigateToTool(tool) {
  if (!toolNames[tool]) return;
  document.body.classList.add("page-transition");
  window.setTimeout(() => {
    window.location.href = `tool.html?tool=${encodeURIComponent(tool)}`;
  }, 180);
}

document.addEventListener("click", e => {
  const toolButton = e.target.closest("[data-tool]");
  if (toolButton) {
    e.preventDefault();
    navigateToTool(toolButton.dataset.tool);
    return;
  }

  const scrollButton = e.target.closest("[data-scroll]");
  if (scrollButton) {
    const target = document.querySelector(scrollButton.dataset.scroll);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});

document.getElementById("openAssistantBtn")?.addEventListener("click", () => navigateToTool("voice"));

function setTheme(theme) {
  const light = theme === "light";
  document.body.classList.toggle("light", light);
  const icon = themeBtn?.querySelector(".icon");
  if (icon) icon.className = `icon ${light ? "icon-moon" : "icon-sun"}`;
  localStorage.setItem("aura-theme", light ? "light" : "dark");
}

themeBtn?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("light") ? "dark" : "light");
});

if (localStorage.getItem("aura-theme") === "light") setTheme("light");

if (clearWorkspace) {
  clearWorkspace.addEventListener("click", () => {
    clearChat?.();
    showToast("Workspace refreshed");
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("revealed");
  });
}, { threshold: .08 });

document.querySelectorAll(".section-heading, .tool-card, .flow-card").forEach(el => {
  el.dataset.reveal = "";
  observer.observe(el);
});

function syncNavbarHeight() {
  const topbar = document.querySelector(".topbar");
  if (topbar) document.documentElement.style.setProperty("--aura-nav-height", `${topbar.offsetHeight}px`);
}
syncNavbarHeight();
window.addEventListener("resize", syncNavbarHeight);
