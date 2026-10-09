import os, re, sqlite3, hashlib, secrets, json, urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import httpx, jwt
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from openai import OpenAI

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env")
DB = BASE / "aura.db"
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-to-a-long-random-secret")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-6-luna")
client = OpenAI(api_key=OPENAI_KEY) if OPENAI_KEY else None

app = FastAPI(title="AURA FastAPI Backend", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      reminder_at TEXT,
      done INTEGER NOT NULL DEFAULT 0,
      reminded INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    conn.commit(); conn.close()

init_db()


def now_iso(): return datetime.now(timezone.utc).isoformat()

def hash_password(password: str, salt: Optional[str] = None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 210_000).hex()
    return f"{salt}${digest}"

def verify_password(password, stored):
    try:
        salt, digest = stored.split("$", 1)
        return secrets.compare_digest(hash_password(password, salt).split("$",1)[1], digest)
    except Exception: return False

def token_for(user):
    return jwt.encode({"sub": str(user["id"]), "email": user["email"], "exp": datetime.now(timezone.utc)+timedelta(days=7)}, JWT_SECRET, algorithm="HS256")

def current_user():
    """Return the shared local AURA workspace user; no login is required."""
    conn = db()
    user = conn.execute("SELECT id,name,email FROM users WHERE email=?", ("aura@local",)).fetchone()
    if not user:
        cur = conn.execute(
            "INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)",
            ("AURA User", "aura@local", hash_password(secrets.token_hex(24)), now_iso())
        )
        conn.commit()
        user = conn.execute("SELECT id,name,email FROM users WHERE id=?", (cur.lastrowid,)).fetchone()
    conn.close()
    return user


class AuthIn(BaseModel):
    name: str = "AURA User"
    email: str
    password: str = Field(min_length=6)

class TaskIn(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    reminder_at: Optional[str] = None

class TaskUpdate(BaseModel):
    done: Optional[bool] = None
    reminder_at: Optional[str] = None

class NoteIn(BaseModel): text: str = ""
class ChatIn(BaseModel):
    messages: list[dict]

class CommandIn(BaseModel): text: str

@app.get("/api/health")
def health(): return {"ok": True, "backend": "FastAPI"}

@app.get("/api/tasks")
def list_tasks(user=Depends(current_user)):
    conn=db(); rows=conn.execute("SELECT * FROM tasks WHERE user_id=? ORDER BY done, COALESCE(reminder_at, created_at), created_at DESC",(user["id"],)).fetchall(); conn.close()
    return [dict(r) for r in rows]

@app.post("/api/tasks")
def create_task(data: TaskIn, user=Depends(current_user)):
    created=now_iso(); reminder=data.reminder_at
    conn=db(); cur=conn.execute("INSERT INTO tasks(user_id,text,created_at,reminder_at) VALUES(?,?,?,?)",(user["id"],data.text.strip(),created,reminder)); conn.commit(); row=conn.execute("SELECT * FROM tasks WHERE id=?",(cur.lastrowid,)).fetchone(); conn.close(); return dict(row)

@app.patch("/api/tasks/{task_id}")
def update_task(task_id:int,data:TaskUpdate,user=Depends(current_user)):
    conn=db(); row=conn.execute("SELECT * FROM tasks WHERE id=? AND user_id=?",(task_id,user["id"])).fetchone()
    if not row: conn.close(); raise HTTPException(404,"Task not found")
    done=row["done"] if data.done is None else int(data.done); reminder=row["reminder_at"] if data.reminder_at is None else data.reminder_at
    conn.execute("UPDATE tasks SET done=?, reminder_at=? WHERE id=?",(done,reminder,task_id)); conn.commit(); row=conn.execute("SELECT * FROM tasks WHERE id=?",(task_id,)).fetchone(); conn.close(); return dict(row)

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id:int,user=Depends(current_user)):
    conn=db(); conn.execute("DELETE FROM tasks WHERE id=? AND user_id=?",(task_id,user["id"])); conn.commit(); conn.close(); return {"ok":True}

@app.get("/api/reminders/due")
def due_reminders(user=Depends(current_user)):
    now=now_iso(); conn=db(); rows=conn.execute("SELECT * FROM tasks WHERE user_id=? AND done=0 AND reminded=0 AND reminder_at IS NOT NULL AND reminder_at<=?",(user["id"],now)).fetchall()
    ids=[r["id"] for r in rows]
    if ids: conn.executemany("UPDATE tasks SET reminded=1 WHERE id=?",[(i,) for i in ids]); conn.commit()
    conn.close(); return [dict(r) for r in rows]

@app.get("/api/notes")
def get_notes(user=Depends(current_user)):
    conn=db(); row=conn.execute("SELECT text FROM notes WHERE user_id=?",(user["id"],)).fetchone(); conn.close(); return {"text":row["text"] if row else ""}

@app.put("/api/notes")
def put_notes(data:NoteIn,user=Depends(current_user)):
    conn=db(); conn.execute("INSERT INTO notes(user_id,text,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET text=excluded.text,updated_at=excluded.updated_at",(user["id"],data.text,now_iso())); conn.commit(); conn.close(); return {"ok":True}

@app.get("/api/weather")
async def weather(city: Optional[str]=None, lat: Optional[float]=None, lon: Optional[float]=None):
    async with httpx.AsyncClient(timeout=10) as h:
        if city:
            g=await h.get("https://geocoding-api.open-meteo.com/v1/search",params={"name":city,"count":1,"language":"en","format":"json"}); g.raise_for_status(); data=g.json()
            if not data.get("results"): raise HTTPException(404,"City not found")
            loc=data["results"][0]; lat,lon=loc["latitude"],loc["longitude"]; name=loc["name"]; country=loc.get("country_code","")
        elif lat is not None and lon is not None: name="Your location"; country=""
        else: raise HTTPException(400,"Provide city or coordinates")
        r=await h.get("https://api.open-meteo.com/v1/forecast",params={"latitude":lat,"longitude":lon,"current":"temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,surface_pressure,visibility","timezone":"auto"}); r.raise_for_status(); w=r.json()
    return {"location":{"name":name,"country":country,"latitude":lat,"longitude":lon,"timezone":w.get("timezone")},"current":w["current"]}

TOOLS={"youtube":"youtube","weather":"weather","tasks":"assistant","task":"assistant","chat":"chat","ai chat":"chat","voice":"voice","assistant":"assistant","maps":"maps","documents":"documents","docs":"documents","vision":"vision","camera":"vision","home":"chat"}

def parse_time(text):
    # supports ISO/date-time strings and common spoken clock times; returns local ISO-like string
    now=datetime.now().astimezone()
    m=re.search(r"(?:at|around|by)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", text, re.I)
    if not m: return None
    hour=int(m.group(1)); minute=int(m.group(2) or 0); ap=m.group(3)
    if ap:
        if ap.lower()=="pm" and hour<12: hour+=12
        if ap.lower()=="am" and hour==12: hour=0
    elif hour<7: hour+=12
    target=now.replace(hour=hour,minute=minute,second=0,microsecond=0)
    if target<=now: target += timedelta(days=1)
    return target.isoformat()

def local_command(text):
    t=text.strip(); l=t.lower()
    # YouTube: open/search and navigate directly to actual YouTube search page
    if "youtube" in l:
        m=re.search(r"(?:search|find|look up)\s+(?:for\s+)?(.+?)(?:\s+on\s+youtube|$)",t,re.I)
        if not m: m=re.search(r"youtube\s+(?:for|search for|search)\s+(.+)$",t,re.I)
        q=(m.group(1).strip() if m else "")
        return {"action":"youtube_search","query":q,"url":"https://www.youtube.com/results?search_query="+urllib.parse.quote_plus(q) if q else "https://www.youtube.com"}
    if any(x in l for x in ["weather","forecast"]):
        m=re.search(r"(?:weather|forecast)(?:\s+(?:in|for|at))?\s+([A-Za-z .'-]+)$",t,re.I)
        return {"action":"open_tool","tool":"weather","city":m.group(1).strip() if m else ""}
    if any(k in l for k in ["add a task","add task","create a task","remind me to","create reminder","add reminder"]):
        cleaned=re.sub(r"^(?:please\s+)?(?:add|create)\s+(?:a\s+)?(?:task|reminder)\s+(?:to\s+)?", "", t, flags=re.I)
        cleaned=re.sub(r"^remind me to\s+", "", cleaned, flags=re.I)
        reminder=parse_time(cleaned)
        cleaned=re.sub(r"\s+(?:at|around|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*$", "", cleaned, flags=re.I).strip()
        return {"action":"create_task","text":cleaned,"reminder_at":reminder}
    for alias,tool in sorted(TOOLS.items(), key=lambda x:-len(x[0])):
        if re.search(r"\bopen\s+(?:the\s+)?"+re.escape(alias)+r"\b",l): return {"action":"open_tool","tool":tool}
    return None

@app.post("/api/command")
def command(data:CommandIn,user=Depends(current_user)):
    parsed=local_command(data.text)
    if parsed:
        if parsed["action"]=="create_task":
            task=create_task(TaskIn(text=parsed["text"],reminder_at=parsed.get("reminder_at")),user)
            return {"action":"create_task","task":task}
        return parsed
    return {"action":"chat","text":data.text}

@app.post("/api/chat")
def chat(data:ChatIn,user=Depends(current_user)):
    if not client: raise HTTPException(503,"OPENAI_API_KEY is not configured on the FastAPI server")
    clean=[]
    for m in data.messages[-24:]:
        if m.get("role") in ("user","assistant") and isinstance(m.get("content"),str): clean.append({"role":m["role"],"content":m["content"]})
    try:
        response=client.responses.create(model=OPENAI_MODEL,input=clean,instructions="You are AURA, a capable helpful AI assistant. Answer naturally and accurately. If information may be current or changing, say when you are uncertain and use available tools when configured.")
        return {"content":response.output_text}
    except Exception as e: raise HTTPException(502,f"AI request failed: {e}")

@app.get("/")
def root(): return FileResponse(BASE/"index.html")

@app.get("/{path:path}")
def static_files(path:str):
    target=BASE/path
    if target.is_file(): return FileResponse(target)
    raise HTTPException(404,"Not found")
