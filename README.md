# AURA AI — FastAPI Edition

AURA is now a frontend + Python FastAPI application. FastAPI owns authentication, persistent tasks/reminders, notes, live weather proxying, voice-command interpretation, and AI chat. The browser handles UI, microphone speech recognition, YouTube navigation, and reminder notifications.

## 1. Install Python
Use Python 3.11+.

## 2. Open a terminal in this folder

```powershell
cd path\to\AURA_AI_Frontend_v2\aura
```

## 3. Create a virtual environment (recommended)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run the server directly with `.venv\Scripts\python.exe` after installation.

## 4. Install backend packages

```powershell
pip install -r requirements.txt
```

## 5. Create the environment file

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Open `.env` and set:

```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_MODEL=gpt-6-luna
```

The OpenAI key stays on the Python server. Never put it inside `public`/frontend JavaScript or commit `.env` to Git.

## 6. Start AURA

```powershell
python -m uvicorn backend:app --host 127.0.0.1 --port 8000 --reload
```

Open:

`http://127.0.0.1:8000`

The FastAPI server serves the frontend and the `/api/*` endpoints from the same origin, so no frontend proxy configuration is needed.

## Features

- Signup/login with SQLite + JWT sessions.
- Tasks stored per account, with creation timestamp and optional reminder time.
- Browser notifications + alarm sound for due reminders while the AURA app is open.
- Notes stored in the backend database.
- Live weather via Open-Meteo, with geocoding and browser location support. No weather key is exposed.
- YouTube search opens the real YouTube search page directly.
- Voice commands are sent to FastAPI and executed by the browser. Examples:
  - `Open YouTube and search for Python tutorials`
  - `Open Weather in Pune`
  - `Open Tasks and add a task finish my project at 6 PM`
  - `Open AI Chat`
- AI Chat uses OpenAI's Responses API through FastAPI. The API key never reaches the browser.

## Reminder limitation
A browser notification/alarm requires the AURA page to be open (or a future Web Push/service-worker deployment). The FastAPI database still stores reminder times even when the browser is closed.

## Production deployment
For a real public deployment, use HTTPS, a strong secret, a production database, restrictive CORS, secure cookies or another hardened auth setup, and a real Web Push/notification service for reminders. Do not use the development server/reload mode in production.
