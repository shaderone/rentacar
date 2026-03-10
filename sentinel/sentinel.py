import time
import requests
import docker
import os
import logging
import threading
from datetime import datetime
from typing import Any, Dict
from sklearn.ensemble import IsolationForest
from groq import Groq
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# env VARIABLES
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://localhost:9090") 
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# LOGGING & FASTAPI
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SentinelAPI")

app = FastAPI(title="Sentinel Control Plane API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# INITIALIZE SERVICES
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
system_state: Dict[str, Any] = {
    "cpu": 0.0,
    "health_score": 100,
    "is_anomaly": False,
    "current_diagnosis": "",
    "history": [],
    "simulated_attack": False,
    "simulated_target": ""
}

# 5. CORE FUNCTIONS
def send_telegram(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.error("❌ Telegram skipped: TELEGRAM_BOT_TOKEN or CHAT_ID is missing from environment!")
        return
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        res = requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}, timeout=5)
        
        if res.status_code != 200:
            logger.error(f"⚠️ Telegram API Rejected the Message: {res.text}")
        else:
            logger.info("✅ Telegram message successfully delivered.")
            
    except Exception as e:
        logger.error(f"🚨 Telegram Network Failed: {e}")

def get_ai_diagnostic(cpu_load):
    if not client: return "⚠️ AI Client not initialized."
    target = system_state.get("simulated_target", "a critical container")
    prompt = (
        f"Alert: Server CPU is at {cpu_load}%. The container '{target}' is currently experiencing abnormal traffic or failing health checks. "
        "1. Summarize likely cause in one sentence, mentioning the specific container. "
        "2. Provide exactly 3 bash commands to fix it. Format the response strictly using basic HTML (<b> for bold, <code> for commands). Do NOT use markdown."
    )
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME, messages=[{"role": "user", "content": prompt}], temperature=0.5, max_tokens=400
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"⚠️ Groq AI Error: {str(e)}"

def get_cpu_load() -> float:
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
    send_telegram(f"🛡️ <b>Sentinel API Online</b>\nEnvironment: Web\nModel: {MODEL_NAME}")
    
    TRAIN_POINTS = 10
    logger.info(f"🎓 Learning Baseline ({TRAIN_POINTS}s)...")
    training_data = []

    for i in range(TRAIN_POINTS):
        load = get_cpu_load()
        training_data.append([load])
        system_state["cpu"] = float(f"{load:.2f}")
        time.sleep(1)

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(training_data)
    logger.info("✅ Model Trained. Sentinel Watching.")

    current_idle_time = 0
    while True:
        # 1. FETCH DATA
        current_load = 99.9 if system_state["simulated_attack"] else get_cpu_load()
        system_state["cpu"] = float(f"{current_load:.2f}")

        # 2. RUN AI ANOMALY DETECTION
        # We calculate this first so we can use it for the health score
        prediction = model.predict([[current_load]])[0]
        # Logic: It's an anomaly if the model says -1 OR if it's a dangerous hardware spike (>90)
        is_anomaly = (prediction == -1 and current_load > 15.0) or (current_load > 90.0)

        # 3. CALCULATE WEIGHTED HEALTH SCORE
        # Start with simple headroom calculation
        base_health = 100 - current_load
        
        # Apply AI Penalty: If an anomaly is detected, we slash the health by 40% 
        # because the system is behaving unpredictably.
        if is_anomaly:
            base_health = base_health * 0.6 
            
        system_state["health_score"] = max(0, int(base_health))

        # 4. HANDLE ALERTS (Only if state changed to 'Anomaly')
        if is_anomaly and not system_state["is_anomaly"]:
            logger.warning(f"🚨 ANOMALY DETECTED: {current_load:.2f}%")
            system_state["is_anomaly"] = True
            insight = get_ai_diagnostic(current_load)
            system_state["current_diagnosis"] = insight
            
            # Escape HTML in insight just in case the AI messed up, then replace basic ones
            safe_insight = insight.replace("<", "&lt;").replace(">", "&gt;")
            safe_insight = safe_insight.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")
            safe_insight = safe_insight.replace("&lt;code&gt;", "<code>").replace("&lt;/code&gt;", "</code>")
            
            send_telegram(f"🚨 <b>SYSTEM ANOMALY</b>\nCPU Load: <code>{current_load:.2f}%</code>\n\n🧠 <b>AI Diagnostic:</b>\n{safe_insight}")
            # We don't 'continue' here anymore, so the rest of the loop (Green Ops) can still check state
        
        # Reset anomaly flag if system stabilizes
        if not is_anomaly:
            system_state["is_anomaly"] = False

        # 5. GREEN OPS (Energy Tracking)
        if current_load < 5.0 and not is_anomaly:
            current_idle_time += 5 
            if current_idle_time >= 300: # 5 mins
                wasted_kwh = (50 * (current_idle_time / 3600)) / 1000
                send_telegram(f"🌿 <b>GREEN OPS ALERT</b>\nIdle for {current_idle_time/60:.1f} mins.\n⚡ Waste: <code>{wasted_kwh:.4f} kWh</code>\n☁️ Carbon: <code>{wasted_kwh * 400:.2f}g CO2</code>")
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
    
    allowed = ['rentacar_backend', 'rentacar_frontend', 'prometheus', 'grafana', 'node_exporter', 'sentinel']
    containers = []
    
    for c in docker_client.containers.list(all=True):
        # Strictly check if any allowed name EXACTLY matches, or is the core part of the docker compose name
        # Docker Compose often prefixes directory name e.g. "rentacar-backend-1"
        if any(a in c.name for a in allowed) and not "kind" in c.name and not "minikube" in c.name: # basic extra filters just in case
            containers.append({"id": c.short_id, "name": c.name, "status": c.status})
            
    return containers

@app.get("/logs/{container_name}")
def get_container_logs(container_name: str):
    if not docker_client:
        return {"error": "Docker Client Offline"}
        
    try:
        # We try to get the container by name or ID
        container = docker_client.containers.get(container_name)
        # Fetch the last 50 lines of logs
        logs = container.logs(tail=50).decode('utf-8')
        return {"logs": logs}
    except Exception as e:
        return {"error": str(e)}

class ChatRequest(BaseModel):
    message: str
    container: str
    history: list

@app.post("/chat")
def chat_with_opsbot(req: ChatRequest):
    if not client:
        return {"error": "Groq Client Offline"}
    
    # 1. Fetch current context
    current_cpu = system_state["cpu"]
    recent_logs = ""
    
    if req.container and docker_client and req.container != "Select a Container":
        try:
            container = docker_client.containers.get(req.container)
            recent_logs = container.logs(tail=20).decode('utf-8')
        except Exception:
            recent_logs = "Could not fetch logs for this container."

    # 2. Build the System Prompt
    is_anomaly = system_state["is_anomaly"]
    status_text = "CRITICAL ANOMALY DETECTED" if is_anomaly else "NORMAL NOMINAL PARAMETERS (If CPU is high but this is NORMAL, then the system was just remediated and the CPU average is settling down)."
    
    system_prompt = (
        "You are OpsBot, an elite DevOps AI Assistant built into the Sentinel AIOps platform. "
        "Your job is to help the user diagnose and fix infrastructure problems. "
        f"CURRENT TELEMETRY SYSTEM STATE: {status_text}. Recent CPU Load Average is {current_cpu}%. "
        f"SELECTED CONTAINER: {req.container}. "
        f"RECENT LOGS FROM CONTAINER:\n{recent_logs}\n\n"
        "Guidelines:\n"
        "- Be concise but highly technical.\n"
        "- If the logs show an error stack trace (like a Javascript Error or Python Exception), point it out specifically.\n"
        "- If the SYSTEM STATE is NORMAL, do NOT panic about the CPU load. Acknowledge the system is stabilizing.\n"
        "- Use Markdown formatting for your responses if necessary."
    )

    # 3. Assemble full message history
    messages = [{"role": "system", "content": system_prompt}]
    
    # Append the past conversation history the client sent us
    for msg in req.history:
        # Assuming history format is {"role": "user/assistant", "content": "..."}
        messages.append(msg)
        
    # Append the NEW user message
    messages.append({"role": "user", "content": req.message})

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.3,
            max_tokens=600
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"error": f"LLM Error: {str(e)}"}

@app.post("/simulate_attack")
def simulate_attack(container: str = "rentacar_backend"):
    system_state["simulated_attack"] = True
    system_state["simulated_target"] = container
    return {"message": f"Attack simulated on {system_state['simulated_target']}."}

@app.post("/remediate/{container_name}")
def execute_fix(container_name: str):
    
    if container_name == "auto":
        # AI Auto-detects the target based on the current context that was attacked
        container_name = system_state.get("simulated_target", "rentacar_backend")
        
    action_msg = f"Simulated mock restart of {container_name}"
    
    # If it's a real container and not a manual UI override
    if container_name != "manual-override":
        if docker_client:
            try:
                # Find the container that matches the name (handling ID prefixes if needed)
                target = None
                for c in docker_client.containers.list():
                    if container_name in c.name: # type: ignore
                        target = c
                        break
                        
                if target:
                    target.restart() # type: ignore
                    action_msg = f"Restarted container: {getattr(target, 'name', container_name)}"
                else:
                    action_msg = f"Container '{container_name}' not found, simulation reset only."
            except Exception as e:
                logger.error(f"Docker restart failed: {e}")
                action_msg = f"Docker error, but Sentinel is resetting state."

    # ALWAYS reset these flags to allow the next attack to trigger Telegram
    system_state["simulated_attack"] = False
    system_state["is_anomaly"] = False
    system_state["current_diagnosis"] = ""
    system_state["history"].append({"time": datetime.now().strftime("%H:%M:%S"), "event": action_msg})
    
    return {"status": "success", "message": action_msg}

@app.post("/container/{container_name}/{action}")
def manage_container(container_name: str, action: str):
    if not docker_client:
        return {"error": "Docker Client Offline"}
        
    try:
        target = None
        for c in docker_client.containers.list(all=True):
            if container_name in c.name: # type: ignore
                target = c
                break
                
        if target is not None:
            if action == 'restart':
                target.restart() # type: ignore
            elif action == 'stop':
                target.stop() # type: ignore
            elif action == 'start':
                target.start() # type: ignore
            else:
                return {"error": f"Unknown action: {action}"}
                
            return {"status": "success", "message": f"Successfully executed '{action}' on {getattr(target, 'name', container_name)}"}
        else:
            return {"error": f"Container {container_name} not found on host."}
            
    except Exception as e:
        return {"error": str(e)}
