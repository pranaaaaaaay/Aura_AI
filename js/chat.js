import { escapeHTML, formatTime, showToast } from "./utils.js";

let messages = [
  {
    role: "ai",
    text: "Hello! I'm AURA. Ask me something, or try one of the tools around me.",
    time: formatTime()
  }
];

export function renderChat(container) {
  container.innerHTML = `
    <div class="view-card chat-layout">
      <div class="chat-messages" id="chatMessages"></div>
      <form class="chat-composer" id="chatForm">
        <button type="button" class="icon-btn" id="chatVoiceBtn" title="Use voice">
          <i class="icon icon-mic"></i>
        </button>
        <input id="chatInput" autocomplete="off" placeholder="Ask AURA anything..." />
        <button class="send-btn" type="submit" aria-label="Send"><i class="icon icon-send"></i></button>
      </form>
    </div>
  `;

  drawMessages();

  document.getElementById("chatForm").addEventListener("submit", async e => {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;

    messages.push({ role: "user", text, time: formatTime() });
    input.value = "";
    drawMessages();

    await fakeAIResponse(text);
  });

  document.getElementById("chatVoiceBtn").addEventListener("click", () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      showToast("Speech recognition is not supported in this browser.");
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.start();
    showToast("Listening...");
    recognition.onresult = event => {
      document.getElementById("chatInput").value = event.results[0][0].transcript;
    };
  });
}

function drawMessages() {
  const box = document.getElementById("chatMessages");
  if (!box) return;
  box.innerHTML = messages.map(msg => `
    <div class="message ${msg.role}">
      ${escapeHTML(msg.text)}
      <div style="font-size:9px;opacity:.45;margin-top:5px">${msg.time}</div>
    </div>
  `).join("");
  box.scrollTop = box.scrollHeight;
}

async function fakeAIResponse(prompt) {
  const lower = prompt.toLowerCase();
  let answer;

  if (lower.includes("weather")) {
    answer = "You can use AURA's Weather tool to fetch live conditions. Add your weather API key in js/weather.js.";
  } else if (lower.includes("youtube") || lower.includes("video")) {
    answer = "Open the YouTube tool and search for a topic. The frontend can generate YouTube search links and play selected videos.";
  } else if (lower.includes("camera") || lower.includes("image")) {
    answer = "Open Vision to use your browser camera. A real AI vision model can be connected later through your backend.";
  } else if (lower.includes("document") || lower.includes("pdf")) {
    answer = "Open Document Analysis to load a TXT or PDF. The browser can extract text locally before you connect a real LLM summarizer.";
  } else {
    answer = `I received: "${prompt}". This demo keeps the AI layer frontend-safe. Connect your own backend /api/chat to turn this into a real LLM assistant.`;
  }

  await new Promise(resolve => setTimeout(resolve, 550));
  messages.push({ role: "ai", text: answer, time: formatTime() });
  drawMessages();
}

export function clearChat() {
  messages = [{
    role: "ai",
    text: "Workspace cleared. What would you like to do?",
    time: formatTime()
  }];
  drawMessages();
}
