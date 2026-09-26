# AURA — All-in-One AI Assistant Frontend

A futuristic, responsive frontend prototype inspired by the AURA poster.

## Included features

1. Voice Assistant — browser Speech Recognition + Speech Synthesis
2. Camera & Vision — camera permission, capture, preview, vision-backend-ready
3. AI Chat — frontend demo with a clear place to connect a backend LLM
4. YouTube — YouTube search + embedded search playback
5. Weather — OpenWeatherMap API integration
6. Personal Assistant — local tasks + notes with localStorage
7. Maps — Google Maps/OpenStreetMap search links
8. Document Analysis — TXT + PDF extraction using PDF.js

## File structure

```text
AURA_AI_Frontend/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── utils.js
    ├── chat.js
    ├── voice.js
    ├── vision.js
    ├── youtube.js
    ├── weather.js
    ├── assistant.js
    ├── maps.js
    └── documents.js
```

## Run it

Because JavaScript modules and browser APIs work better through a local server, do not open `index.html` with `file://`.

### VS Code
Install the **Live Server** extension and click **Go Live**.

### Python
From this folder run:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## Weather API

Open `js/weather.js`.

Replace:

```js
const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";
```

with your key.

For a real production app, do NOT put private API keys in frontend JavaScript. Use a backend endpoint.

## Real AI chat / vision

This project intentionally does not place an OpenAI/Gemini secret key in the browser.

Recommended production architecture:

```text
AURA Frontend
      |
      v
Your Backend / FastAPI
      |
      +---- LLM API
      +---- Vision API
      +---- Weather API
      +---- YouTube API
      +---- Maps API
```

For your MCA project, this separation is useful because the frontend demonstrates the complete user experience while the backend can become the AI decision engine later.

## Important browser permissions

- Microphone: required for Voice Assistant.
- Camera: required for Vision.
- Geolocation: optional for location-based weather.
- PDF extraction: runs in the browser with PDF.js.

## Design direction

The UI follows the uploaded AURA poster's visual language:
- dark futuristic blue background
- cyan / violet glow
- central AI core
- modular tool cards
- responsive mobile layout
- animated orbital rings
- glassmorphism panels
- high-tech dashboard workspace

## UI update
The homepage now includes a **Quick Access** AURA tool panel with all 8 requested tools directly on the first screen. The panel is desktop-friendly and changes into a responsive 4-column/2-column tool launcher on smaller screens. AURA uses a distinctive **Audiowide + Orbitron** wordmark style for a futuristic high-tech identity.
