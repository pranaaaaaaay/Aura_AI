import { escapeHTML, showToast } from "./utils.js";

let tasks = JSON.parse(localStorage.getItem("auraTasks") || "[]");

export function renderAssistant(container) {
  container.innerHTML = `
    <div class="two-col">
      <div class="view-card">
        <h3>Personal Assistant</h3>
        <p class="sub">A lightweight local task and notes system. Data is stored in this browser.</p>
        <form id="taskForm" class="chat-composer">
          <input id="taskInput" placeholder="Add a task or reminder..." />
          <button class="send-btn" type="submit"><i class="icon icon-plus"></i></button>
        </form>
        <div class="task-list" id="taskList"></div>
      </div>

      <div class="view-card">
        <h3>Quick Notes</h3>
        <p class="sub">Write notes and keep them in localStorage.</p>
        <textarea id="notes" class="form-input" style="width:100%;height:320px;padding:14px;resize:vertical" placeholder="Your notes..."></textarea>
        <div class="control-row" style="margin-top:10px">
          <button class="primary-btn" id="saveNotes">Save notes</button>
          <button class="outline-btn" id="clearNotes">Clear</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("taskForm").onsubmit = e => {
    e.preventDefault();
    const input = document.getElementById("taskInput");
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ id: Date.now(), text, done: false });
    input.value = "";
    saveTasks();
    drawTasks();
  };

  document.getElementById("saveNotes").onclick = () => {
    localStorage.setItem("auraNotes", document.getElementById("notes").value);
    showToast("Notes saved locally.");
  };

  document.getElementById("clearNotes").onclick = () => {
    document.getElementById("notes").value = "";
    localStorage.removeItem("auraNotes");
  };

  document.getElementById("notes").value = localStorage.getItem("auraNotes") || "";
  drawTasks();
}

function drawTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;
  list.innerHTML = tasks.length ? tasks.map(task => `
    <div class="task-item ${task.done ? "done" : ""}">
      <input type="checkbox" ${task.done ? "checked" : ""} data-id="${task.id}">
      <span>${escapeHTML(task.text)}</span>
      <button data-delete="${task.id}" title="Delete"><i class="icon icon-trash-2"></i></button>
    </div>
  `).join("") : `<div class="result-box">No tasks yet.</div>`;

  list.querySelectorAll("input[type=checkbox]").forEach(box => {
    box.onchange = () => {
      const task = tasks.find(t => t.id == box.dataset.id);
      task.done = box.checked;
      saveTasks();
      drawTasks();
    };
  });

  list.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => {
      tasks = tasks.filter(t => t.id != btn.dataset.delete);
      saveTasks();
      drawTasks();
    };
  });
}

function saveTasks() {
  localStorage.setItem("auraTasks", JSON.stringify(tasks));
}
