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
const title = document.getElementById("toolPageTitle");
const themeBtn = document.getElementById("themeBtn");
const clearBtn = document.getElementById("clearWorkspace");

const tools = {
  chat: { name: "AI Chat", render: renderChat },
  voice: { name: "Voice Assistant", render: renderVoice },
  vision: { name: "Camera & Vision", render: renderVision },
  youtube: { name: "YouTube", render: renderYouTube },
  weather: { name: "Weather", render: renderWeather },
  assistant: { name: "Personal Assistant", render: renderAssistant },
  maps: { name: "Maps", render: renderMaps },
  documents: { name: "Document Analysis", render: renderDocuments }
};

let currentTool = new URLSearchParams(window.location.search).get("tool") || "chat";
if (!tools[currentTool]) currentTool = "chat";

function setTheme(theme) {
  const light = theme === "light";
  document.body.classList.toggle("light", light);
  const icon = themeBtn?.querySelector(".icon");
  if (icon) icon.className = `icon ${light ? "icon-moon" : "icon-sun"}`;
  localStorage.setItem("aura-theme", light ? "light" : "dark");
}

function renderCurrentTool() {
  const config = tools[currentTool];
  title.textContent = config.name;
  document.title = `AURA — ${config.name}`;
  document.querySelectorAll("[data-tool]").forEach(button => {
    button.classList.toggle("active", button.dataset.tool === currentTool);
  });
  toolView.innerHTML = "";
  config.render(toolView);
}

function navigate(tool) {
  if (!tools[tool]) return;
  document.body.classList.add("page-transition");
  window.setTimeout(() => {
    window.location.href = `tool.html?tool=${encodeURIComponent(tool)}`;
  }, 180);
}

document.addEventListener("click", e => {
  const button = e.target.closest("[data-tool]");
  if (!button) return;
  e.preventDefault();
  navigate(button.dataset.tool);
});

themeBtn?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("light") ? "dark" : "light");
});

if (localStorage.getItem("aura-theme") === "light") setTheme("light");

clearBtn?.addEventListener("click", () => {
  if (currentTool === "chat") clearChat();
  else renderCurrentTool();
  showToast("Tool refreshed");
});

renderCurrentTool();
