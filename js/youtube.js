import { escapeHTML, showToast } from "./utils.js";

export function renderYouTube(container) {
  container.innerHTML = `
    <div class="view-card">
      <h3>YouTube</h3>
      <p class="sub">Search YouTube from AURA and open videos in an embedded player. This version uses YouTube's public search URL so no secret API key is exposed.</p>

      <form id="ytForm" class="chat-composer">
        <input id="ytQuery" placeholder="Search videos — e.g. Python AI projects" />
        <button class="send-btn" type="submit"><i class="icon icon-search"></i></button>
      </form>

      <div id="ytResults" class="video-grid">
        <div class="video-card" style="grid-column:1/-1;padding:20px;cursor:default">
          <div>Try a search above. For full Data API results, add a backend proxy using your YouTube API key.</div>
        </div>
      </div>
      <div id="ytPlayer"></div>
    </div>
  `;

  document.getElementById("ytForm").addEventListener("submit", e => {
    e.preventDefault();
    const query = document.getElementById("ytQuery").value.trim();
    if (!query) return showToast("Enter a search.");
    const results = document.getElementById("ytResults");
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    results.innerHTML = `
      <div class="video-card" data-open="${url}" style="grid-column:1/-1">
        <div class="video-thumb"><i class="icon icon-youtube"></i></div>
        <div>Open YouTube search results for <strong>${escapeHTML(query)}</strong></div>
      </div>
      <div class="video-card" data-video="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}">
        <div class="video-thumb"><i class="icon icon-play"></i></div>
        <div>Play search results inside AURA</div>
      </div>
    `;

    results.querySelectorAll("[data-open]").forEach(card => {
      card.onclick = () => window.open(card.dataset.open, "_blank", "noopener,noreferrer");
    });

    results.querySelectorAll("[data-video]").forEach(card => {
      card.onclick = () => {
        document.getElementById("ytPlayer").innerHTML = `<iframe class="video-frame" src="${card.dataset.video}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      };
    });
  });
}
