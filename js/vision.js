import { showToast } from "./utils.js";

let stream;

export function renderVision(container) {
  container.innerHTML = `
    <div class="two-col">
      <div class="view-card">
        <h3>Camera & Vision</h3>
        <p class="sub">Use your device camera, capture a frame, and prepare it for an AI vision backend.</p>

        <div class="camera-stage" id="cameraStage">
          <video id="cameraVideo" autoplay playsinline muted></video>
          <canvas id="cameraCanvas" hidden></canvas>
          <img id="visionPreview" class="vision-preview" alt="Captured frame">
          <div class="camera-placeholder" id="cameraPlaceholder">
            <div><i class="icon icon-camera" style="font-size:40px"></i><br>Camera is off</div>
          </div>
          <div class="scan-lines"></div>
        </div>

        <div class="control-row" style="margin-top:12px">
          <button class="primary-btn" id="startCamera"><i class="icon icon-camera"></i> Start camera</button>
          <button class="outline-btn" id="captureFrame"><i class="icon icon-scan"></i> Capture</button>
          <button class="outline-btn" id="stopCamera">Stop</button>
        </div>
      </div>

      <div class="view-card">
        <h3>Vision result</h3>
        <p class="sub">The frontend captures the image. To get real object/image understanding, send the captured image to your backend vision endpoint.</p>
        <div id="visionResult" class="result-box">No image captured yet.</div>
        <div class="control-row" style="margin-top:12px">
          <button class="outline-btn" id="demoVision">Run demo analysis</button>
          <button class="outline-btn" id="downloadFrame">Save captured image</button>
        </div>
      </div>
    </div>
  `;

  const video = document.getElementById("cameraVideo");
  const stage = document.getElementById("cameraStage");
  const placeholder = document.getElementById("cameraPlaceholder");
  const canvas = document.getElementById("cameraCanvas");
  const preview = document.getElementById("visionPreview");
  const result = document.getElementById("visionResult");

  document.getElementById("startCamera").onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      video.srcObject = stream;
      placeholder.style.display = "none";
      stage.classList.add("active");
      showToast("Camera started");
    } catch (error) {
      showToast("Camera permission was blocked.");
      result.textContent = error.message;
    }
  };

  document.getElementById("captureFrame").onclick = () => {
    if (!stream) return showToast("Start the camera first.");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    preview.src = canvas.toDataURL("image/jpeg", .88);
    preview.style.display = "block";
    result.textContent = "Frame captured. Ready for AI vision analysis.";
  };

  document.getElementById("stopCamera").onclick = stopCamera;

  document.getElementById("demoVision").onclick = () => {
    result.textContent = "Demo result: Image received successfully. Connect this captured frame to a multimodal model to identify objects, read text, describe scenes, or answer visual questions.";
  };

  document.getElementById("downloadFrame").onclick = () => {
    if (!canvas.width) return showToast("Capture a frame first.");
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "aura-captured-image.png";
    a.click();
  };
}

function stopCamera() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  document.getElementById("cameraStage")?.classList.remove("active");
}
