import time
import requests
import docker
import os
import logging
import threading
from datetime import datetime
from sklearn.ensemble import IsolationForest
from groq import Groq
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

# 1. LOAD ENVIRONMENT VARIABLES
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://localhost:9090") 
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# 2. SETUP LOGGING & FASTAPI
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SentinelAPI")

app = FastAPI(title="Sentinel Control Plane API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. INITIALIZE SERVICES
try:
    client = Groq(api_key=GROQ_API_KEY)
    logger.info("✅ Groq AI connected.")
except Exception as e:
    logger.error(f"⚠️ Groq Client Init Error: {e}")
    client = None

try:
    docker_client = docker.from_env()
    logger.info("✅ Docker Socket Connected.")
except Exception as e:
    logger.warning(f"⚠️ Docker Warning: {e}")
    docker_client = None

# 4. GLOBAL STATE (Feeds the Dashboard)
system_state = {
    "cpu": 0.0,
    "health_score": 100,
    "is_anomaly": False,
    "current_diagnosis": "",
    "history": [],
    "simulated_attack": False 
}

# 5. CORE FUNCTIONS
def send_telegram(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.error("❌ Telegram skipped: TELEGRAM_BOT_TOKEN or CHAT_ID is missing from environment!")
        return
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        res = requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}, timeout=5)
        
        if res.status_code != 200:
            logger.error(f"⚠️ Telegram API Rejected the Message: {res.text}")
        else:
            logger.info("✅ Telegram message successfully delivered.")
            
    except Exception as e:
        logger.error(f"🚨 Telegram Network Failed: {e}")

def get_ai_diagnostic(cpu_load):
    if not client: return "⚠️ AI Client not initialized."
    prompt = (
        f"Alert: Server CPU is at {cpu_load}%. "
        "1. Summarize likely cause in one sentence. "
        "2. Provide exactly 3 bash commands to fix. Format for Telegram Markdown."
    )
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME, messages=[{"role": "user", "content": prompt}], temperature=0.5, max_tokens=400
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"⚠️ Groq AI Error: {str(e)}"

def get_cpu_load():
    try:
        query = '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)'
        res = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query}, timeout=2)
        data = res.json()['data']['result']
        if data: return float(data[0]['value'][1])
        return 0.0
    except Exception:
        return 0.0

# 6. BACKGROUND MONITORING LOOP
def sentinel_monitor_loop():
    send_telegram(f"🛡️ **Sentinel API Online**\nEnvironment: Web\nModel: {MODEL_NAME}")
    
    TRAIN_POINTS = 10
    logger.info(f"🎓 Learning Baseline ({TRAIN_POINTS}s)...")
    training_data = []

    for i in range(TRAIN_POINTS):
        load = get_cpu_load()
        training_data.append([load])
        system_state["cpu"] = round(load, 2)
        time.sleep(1)

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(training_data)
    logger.info("✅ Model Trained. Sentinel Watching.")

    current_idle_time = 0
    while True:
        current_load = 99.9 if system_state["simulated_attack"] else get_cpu_load()
        system_state["cpu"] = round(current_load, 2)
        system_state["health_score"] = max(0, 100 - int(current_load))

        # ANOMALY DETECTION
        prediction = model.predict([[current_load]])[0]
        is_anomaly = (prediction == -1 and current_load > 15.0) or (current_load > 90.0)

        if is_anomaly and not system_state["is_anomaly"]:
            logger.warning(f"🚨 ANOMALY: {current_load:.2f}%")
            system_state["is_anomaly"] = True
            insight = get_ai_diagnostic(current_load)
            system_state["current_diagnosis"] = insight
            send_telegram(f"🚨 **SYSTEM ANOMALY**\nCPU Load: `{current_load:.2f}%`\n\n🧠 **AI Diagnostic:**\n{insight}")
            time.sleep(30)
            continue

        # GREEN OPS
        if current_load < 5.0 and not is_anomaly:
            current_idle_time += 5 
            if current_idle_time >= 300: # 5 mins
                wasted_kwh = (50 * (current_idle_time / 3600)) / 1000
                send_telegram(f"🌿 **GREEN OPS ALERT**\nIdle for {current_idle_time/60:.1f} mins.\n⚡ Waste: `{wasted_kwh:.4f} kWh`\n☁️ Carbon: `{wasted_kwh * 400:.2f}g CO2`")
                current_idle_time = 0 
        else:
            current_idle_time = 0

        time.sleep(5)

@app.on_event("startup")
async def startup_event():
    threading.Thread(target=sentinel_monitor_loop, daemon=True).start()

# 7. WEB ENDPOINTS
@app.get("/", response_class=HTMLResponse)
def serve_dashboard():
    """Serves the HTML UI."""
    try:
        with open("sentinel_enterprise.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        return "<h1>Dashboard HTML file not found in this folder!</h1>"

@app.get("/metrics")
def get_metrics():
    return system_state

@app.get("/processes")
def get_processes():
    if not docker_client: return [{"id": "-", "name": "Docker Offline", "status": "Error"}]
    return [{"id": c.short_id, "name": c.name, "status": c.status} for c in docker_client.containers.list()]

@app.post("/simulate_attack")
def simulate_attack():
    system_state["simulated_attack"] = True
    return {"message": "Attack simulated."}

@app.post("/remediate/{container_name}")
def execute_fix(container_name: str):
    action_msg = f"Simulated mock restart of {container_name}"
    
    # If it's a real container and not a manual UI override
    if container_name != "manual-override":
        if docker_client:
            try:
                docker_client.containers.get(container_name).restart()
                action_msg = f"Restarted container: {container_name}"
            except Exception as e:
                logger.error(f"Docker restart failed: {e}")
                action_msg = f"Docker error, but Sentinel is resetting state."
        else:
            action_msg = "Docker client offline; simulation reset only."

    # ALWAYS reset these flags to allow the next attack to trigger Telegram
    system_state["simulated_attack"] = False
    system_state["is_anomaly"] = False
    system_state["current_diagnosis"] = ""
    system_state["history"].append({"time": datetime.now().strftime("%H:%M:%S"), "event": action_msg})
    
    return {"status": "success", "message": action_msg}
