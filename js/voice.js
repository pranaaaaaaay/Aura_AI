import { showToast } from "./utils.js";

let recognition;
let listening = false;

export function renderVoice(container) {
  container.innerHTML = `
    <div class="two-col">
      <div class="view-card">
        <h3>Voice Assistant</h3>
        <p class="sub">Talk to AURA using your browser microphone. This uses the Web Speech API and requires microphone permission.</p>

        <div style="display:grid;place-items:center;min-height:270px">
          <button id="voiceOrb" class="ai-core" style="border:0;background:transparent;cursor:pointer" aria-label="Start voice assistant">
            <div class="core-glow"></div>
            <div class="robot-face">
              <span class="eye left-eye"></span>
              <span class="eye right-eye"></span>
              <div class="robot-mouth"></div>
            </div>
            <div class="core-label">TAP TO SPEAK</div>
          </button>
        </div>

        <div id="voiceStatus" class="result-box">Press the AURA orb and speak.</div>
      </div>

      <div class="view-card">
        <h3>Voice output</h3>
        <p class="sub">AURA can read responses aloud using the browser's speech synthesis.</p>
        <textarea id="voiceText" class="form-input" style="height:140px;padding:14px;resize:vertical" placeholder="Type something for AURA to speak..."></textarea>
        <div class="control-row" style="margin-top:12px">
          <button class="primary-btn" id="speakBtn"><i class="icon icon-volume-2"></i> Speak</button>
          <button class="outline-btn" id="stopSpeakBtn">Stop</button>
        </div>
        <div class="result-box">
          <strong>Browser support</strong><br>
          Speech recognition is strongest in Chromium-based browsers. Speech synthesis works in most modern browsers.
        </div>
      </div>
    </div>
  `;

  const status = document.getElementById("voiceStatus");
  const orb = document.getElementById("voiceOrb");

  orb.addEventListener("click", () => {
    if (listening) {
      recognition?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      showToast("Speech recognition is not available in this browser.");
      return;
    }

    recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    listening = true;
    status.textContent = "Listening… speak now.";
    orb.style.transform = "scale(1.06)";

    recognition.onresult = event => {
      const transcript = [...event.results].map(r => r[0].transcript).join("");
      status.textContent = transcript;
      document.getElementById("voiceText").value = transcript;
    };

    recognition.onerror = event => {
      status.textContent = `Voice error: ${event.error}`;
    };

    recognition.onend = () => {
      listening = false;
      orb.style.transform = "";
      if (status.textContent === "Listening… speak now.") status.textContent = "No speech captured.";
    };

    recognition.start();
  });

  document.getElementById("speakBtn").addEventListener("click", () => {
    const text = document.getElementById("voiceText").value.trim();
    if (!text) return showToast("Enter text first.");
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  });

  document.getElementById("stopSpeakBtn").addEventListener("click", () => speechSynthesis.cancel());
}
