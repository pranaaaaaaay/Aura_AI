import { showToast } from "./utils.js";

export function renderMaps(container) {
  container.innerHTML = `
    <div class="view-card">
      <h3>Places & Maps</h3>
      <p class="sub">Search for a place and open it in OpenStreetMap or Google Maps. This frontend does not require a maps API key.</p>

      <form id="mapForm" class="chat-composer">
        <input id="mapQuery" value="DY Patil University Talegaon" placeholder="Search a place..." />
        <button class="send-btn" type="submit"><i class="icon icon-search"></i></button>
      </form>

      <div id="mapResult" style="margin-top:15px">
        <div class="result-box">Search to load a map.</div>
      </div>
    </div>
  `;

  document.getElementById("mapForm").onsubmit = async e => {
    e.preventDefault();
    const query = document.getElementById("mapQuery").value.trim();
    if (!query) return showToast("Enter a place.");

    const encoded = encodeURIComponent(query);
    const result = document.getElementById("mapResult");

    result.innerHTML = `
      <iframe class="map-frame"
        src="https://www.openstreetmap.org/export/embed.html?bbox=73.70%2C18.65%2C73.90%2C18.85&layer=mapnik"
        title="Map"></iframe>
      <div class="map-links">
        <a class="outline-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encoded}">
          <i class="icon icon-map-pin"></i> Google Maps
        </a>
        <a class="outline-btn" target="_blank" rel="noopener" href="https://www.openstreetmap.org/search?query=${encoded}">
          <i class="icon icon-map"></i> OpenStreetMap
        </a>
      </div>
    `;
  };
}
