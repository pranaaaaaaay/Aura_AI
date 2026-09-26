import { escapeHTML, showToast } from "./utils.js";

export function renderDocuments(container) {
  container.innerHTML = `
    <div class="two-col">
      <div class="view-card">
        <h3>Document Analysis</h3>
        <p class="sub">Upload TXT or PDF files. Text files are read directly. PDF text extraction uses PDF.js in the browser.</p>

        <label class="dropzone" id="dropzone">
          <input id="documentInput" type="file" accept=".txt,.pdf,text/plain,application/pdf">
          <div>
            <i class="icon icon-file-up" style="font-size:38px;color:#68dcff"></i>
            <strong>Drop a document here</strong>
            <span>or click to browse • TXT / PDF</span>
          </div>
        </label>

        <div class="file-info" id="fileInfo">No document selected.</div>
        <div class="analysis-actions">
          <button class="primary-btn" id="analyzeBtn"><i class="icon icon-sparkles"></i> Analyze</button>
          <button class="outline-btn" id="clearDoc">Clear</button>
        </div>
      </div>

      <div class="view-card">
        <h3>Extracted content</h3>
        <p class="sub">The extracted text can be sent to your AI backend for summarization, Q&A or key-point extraction.</p>
        <div id="docResult" class="result-box">Upload a file to begin.</div>
      </div>
    </div>
  `;

  const input = document.getElementById("documentInput");
  const dropzone = document.getElementById("dropzone");
  let selectedFile = null;
  let extractedText = "";

  input.onchange = () => {
    selectedFile = input.files[0];
    updateFileInfo();
  };

  ["dragenter", "dragover"].forEach(event => dropzone.addEventListener(event, e => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach(event => dropzone.addEventListener(event, e => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  }));
  dropzone.addEventListener("drop", e => {
    selectedFile = e.dataTransfer.files[0];
    updateFileInfo();
  });

  document.getElementById("analyzeBtn").onclick = async () => {
    if (!selectedFile) return showToast("Choose a document first.");
    const result = document.getElementById("docResult");
    result.textContent = "Extracting document text…";

    try {
      extractedText = selectedFile.type === "application/pdf"
        ? await extractPDF(selectedFile)
        : await selectedFile.text();

      const preview = extractedText.slice(0, 7000);
      result.textContent = `Extracted ${extractedText.length.toLocaleString()} characters.\n\n${preview}${extractedText.length > 7000 ? "\n\n[Preview truncated]" : ""}`;
    } catch (error) {
      result.textContent = `Could not analyze this file: ${error.message}`;
    }
  };

  document.getElementById("clearDoc").onclick = () => {
    selectedFile = null;
    extractedText = "";
    input.value = "";
    document.getElementById("fileInfo").textContent = "No document selected.";
    document.getElementById("docResult").textContent = "Upload a file to begin.";
  };

  function updateFileInfo() {
    if (!selectedFile) return;
    document.getElementById("fileInfo").textContent =
      `${escapeHTML(selectedFile.name)} • ${(selectedFile.size / 1024).toFixed(1)} KB • ${selectedFile.type || "unknown type"}`;
  }
}

async function extractPDF(file) {
  const pdfjs = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += `\n--- Page ${pageNumber} ---\n`;
    text += content.items.map(item => item.str).join(" ");
  }

  return text.trim();
}
