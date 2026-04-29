import time
import requests
import docker
import os
import logging
import threading
from datetime import datetime, timezone
from typing import Any, Dict
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import numpy as np
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
TARGET_WORKLOAD = os.getenv("TARGET_WORKLOAD", "rentacar")

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
    "memory": 0.0,
    "health_score": 100,
    "is_anomaly": False,
    "current_diagnosis": "",
    "history": [],
    "simulated_attack": False,
    "simulated_target": "",
    "attack_type": "",
    "last_scale_time": 0.0
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

def get_ai_diagnostic(cpu_load, mem_load):
    if not client: return "⚠️ AI Client not initialized."
    target = system_state.get("simulated_target", "a critical container")
    prompt = (
        f"Alert: Server CPU is at {cpu_load}% and Memory is at {mem_load}%. The container '{target}' is currently experiencing abnormal traffic or failing health checks. "
        "1. Summarize likely cause in one sentence, mentioning the specific container and whether it looks like a memory leak or CPU spike. "
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
        res = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query}, timeout=5)
        data = res.json()['data']['result']
        if data: return float(data[0]['value'][1])
        return system_state.get("cpu", 0.0)
    except Exception:
        return system_state.get("cpu", 0.0)

def get_memory_load() -> float:
    try:
        query = '100 - ((node_memory_MemAvailable_bytes * 100) / node_memory_MemTotal_bytes)'
        res = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query}, timeout=5)
        data = res.json()['data']['result']
        if data: return float(data[0]['value'][1])
        return system_state.get("memory", 0.0)
    except Exception:
        return system_state.get("memory", 0.0)

def kill_attack_processes(target_container):
    try:
        target_container.exec_run("sh -c 'pkill -9 -f \"true\"'")
        target_container.exec_run("sh -c 'pkill -9 -f \"dd if=/dev/urandom\"'")
        target_container.exec_run("sh -c 'pkill -9 -f \"base64\"'")
        target_container.exec_run("sh -c 'pkill -9 -f \"while\"'")
        target_container.exec_run("sh -c 'pkill -9 -f \"sort\"'")
        target_container.exec_run("sh -c 'rm -f /dev/shm/leak_*'")
    except Exception as e:
        logger.warning(f"Failed to explicitly kill processes: {e}")

# 6. BACKGROUND MONITORING LOOP
def sentinel_monitor_loop():
    send_telegram(f"🛡️ <b>Sentinel API Online</b>\nEnvironment: Web\nModel: {MODEL_NAME}")
    
    TRAIN_POINTS = 15
    logger.info(f"🎓 Learning Baseline ({TRAIN_POINTS}s)...")
    
    # Pre-seed with normal variance (CPU and Memory) so the model doesn't overfit perfectly flat lines
    training_data = [[0.0, 30.0], [5.0, 35.0], [10.0, 40.0], [15.0, 45.0], [25.0, 50.0]]

    for i in range(TRAIN_POINTS):
        cpu = get_cpu_load()
        mem = get_memory_load()
        training_data.append([cpu, mem])
        system_state["cpu"] = float(f"{cpu:.2f}")
        system_state["memory"] = float(f"{mem:.2f}")
        time.sleep(1)

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(training_data)
    logger.info("✅ Model Trained. Sentinel Watching.")

    current_idle_time = 0
    cpu_history = []
    
    while True:
        # 1. FETCH DATA
        current_cpu = get_cpu_load()
        current_mem = get_memory_load()
        
        cpu_history.append(current_cpu)
        if len(cpu_history) > 15:
            cpu_history.pop(0)
        
        system_state["cpu"] = float(f"{current_cpu:.2f}")
        system_state["memory"] = float(f"{current_mem:.2f}")

        # 2. RUN AI ANOMALY DETECTION (Multivariate)
        # Pass both metrics into the trained model
        prediction = model.predict([[current_cpu, current_mem]])[0]
        
        # Logic: It's an anomaly if the model says -1 AND either load is over a sensible threshold, OR if there's a hardware spike
        is_anomaly = (prediction == -1 and (current_cpu > 25.0 or current_mem > 60.0)) or (current_cpu > 60.0 or current_mem > 75.0)

        # 3. CALCULATE WEIGHTED HEALTH SCORE
        # Average of CPU and Memory headroom
        base_health = ((100 - current_cpu) + (100 - current_mem)) / 2
        
        # Apply AI Penalty: If an anomaly is detected, slash the health by 40% 
        if is_anomaly:
            base_health = base_health * 0.6 
            
        system_state["health_score"] = max(0, int(base_health))

        # 4. HANDLE ALERTS (Only if state changed to 'Anomaly')
        if is_anomaly and not system_state["is_anomaly"]:
            logger.warning(f"🚨 ANOMALY DETECTED: CPU {current_cpu:.2f}% | MEM {current_mem:.2f}%")
            system_state["is_anomaly"] = True
            insight = get_ai_diagnostic(current_cpu, current_mem)
            system_state["current_diagnosis"] = insight
            
            # Escape HTML in insight just in case the AI messed up
            safe_insight = insight.replace("<", "&lt;").replace(">", "&gt;")
            safe_insight = safe_insight.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")
            safe_insight = safe_insight.replace("&lt;code&gt;", "<code>").replace("&lt;/code&gt;", "</code>")
            
            send_telegram(f"🚨 <b>MULTIVARIATE ANOMALY</b>\nCPU: <code>{current_cpu:.2f}%</code> | Mem: <code>{current_mem:.2f}%</code>\n\n🧠 <b>AI Diagnostic:</b>\n{safe_insight}")
            # We don't 'continue' here anymore, so the rest of the loop (Green Ops) can still check state
            
        # 4.5 AUTONOMOUS SELF-HEALING
        if system_state["is_anomaly"] and (current_cpu > 70.0 or current_mem > 70.0):
            logger.error("🔥 CRITICAL LIMIT REACHED! Initiating Autonomous Self-Healing.")
            send_telegram("🔥 <b>CRITICAL LIMIT BREACHED</b>\nExecuting autonomous self-healing protocol to prevent crash.")
            execute_fix("auto")
        
        # Reset anomaly flag if system stabilizes
        if not is_anomaly and system_state["is_anomaly"]:
            system_state["is_anomaly"] = False

        # 5. GREEN OPS (Energy Tracking) & PREDICTIVE SCALE-IN
        if not is_anomaly:
            active_replicas = 0
            if docker_client:
                for c in docker_client.containers.list():
                    if "_replica_" in c.name: active_replicas += 1 # type: ignore

            # Predictive Scale-In
            if active_replicas > 0 and len(cpu_history) >= 10:
                X = np.array(range(len(cpu_history))).reshape(-1, 1)
                y = np.array(cpu_history)
                lin_reg = LinearRegression()
                lin_reg.fit(X, y)
                
                # Predict 3 steps ahead (6 seconds)
                forecast = lin_reg.predict(np.array([[len(cpu_history) + 2]]))[0]
                slope = lin_reg.coef_[0]
                
                if slope < -1.0 and forecast < 5.0 and current_cpu < 25.0:
                    logger.info(f"📉 Predictive forecast shows CPU dropping to {forecast:.2f}%. Terminating replicas pre-emptively.")
                    
                    # We can reuse the execute_green_ops function logic inline here, or call the endpoint
                    try:
                        deleted = 0
                        for c in docker_client.containers.list(all=True):
                            if "_replica_" in c.name:
                                c.remove(force=True) # type: ignore
                                deleted += 1
                        
                        msg = f"[PREDICTIVE GREEN OPS] Forecasted idle state. Pre-emptively deleted {deleted} replicas."
                        system_state["history"].append({"time": datetime.now().strftime("%H:%M:%S"), "event": msg})
                        send_telegram(f"📉 <b>PREDICTIVE GREEN OPS</b>\nForecast: <code>{forecast:.2f}%</code> CPU.\nPre-emptively scaled down {deleted} replicas.")
                        
                        current_idle_time = 0
                        cpu_history.clear()
                    except Exception as e:
                        logger.error(f"Predictive Scale-In failed: {e}")

            # Standard Timeout-based Scale-In
            if current_cpu < 5.0:
                current_idle_time += 2 
                if current_idle_time >= 15: # 15 seconds
                    replicas_to_delete = []
                    if docker_client:
                        for c in docker_client.containers.list():
                            if "_replica_" in c.name: # type: ignore
                                replicas_to_delete.append(c)
                                
                    if replicas_to_delete:
                        for c in replicas_to_delete:
                            c.remove(force=True) # type: ignore
                        send_telegram(f"🌿 <b>GREEN OPS SCALE-IN</b>\nIdle for {current_idle_time}s.\nScaled down {len(replicas_to_delete)} unused replicas to save energy.")
                        system_state["history"].append({"time": datetime.now().strftime("%H:%M:%S"), "event": f"Green Ops: Deleted {len(replicas_to_delete)} unused replicas."})
                    else:
                        wasted_kwh = (50 * (current_idle_time / 3600)) / 1000
                        send_telegram(f"🌿 <b>GREEN OPS ALERT</b>\nIdle for {current_idle_time}s.\n⚡ Waste: <code>{wasted_kwh:.4f} kWh</code>\n☁️ Carbon: <code>{wasted_kwh * 400:.2f}g CO2</code>")
                    
                    current_idle_time = 0 
            else:
                current_idle_time = 0
        else:
            current_idle_time = 0

        time.sleep(2)

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

def format_uptime(c):
    if c.status != "running":
        return c.status.capitalize()
    try:
        started_at = c.attrs['State']['StartedAt']
        time_str = started_at.split('.')[0]
        started = datetime.strptime(time_str, '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        diff = int((now - started).total_seconds())
        if diff < 60: return f"Up {diff} seconds"
        elif diff < 3600: return f"Up {diff // 60} minutes"
        elif diff < 86400: return f"Up {diff // 3600} hours"
        else: return f"Up {diff // 86400} days"
    except Exception:
        return c.status.capitalize()

@app.get("/processes")
def list_processes():
    if not docker_client: return []
    allowed = [f'{TARGET_WORKLOAD}_backend', f'{TARGET_WORKLOAD}_frontend', 'prometheus', 'grafana', 'node_exporter', 'sentinel']
    containers = []
    
    try:
        for c in docker_client.containers.list(all=True):
            # Filtering logic to only show specific containers
            # Docker Compose often prefixes directory name e.g. "my_app-backend-1"
            base_name = c.name
            if (any(a in base_name for a in allowed) or "_replica_" in base_name) and not "minikube" in c.name: 
                containers.append({"id": c.short_id, "name": c.name, "status": format_uptime(c)})
    except Exception:
        pass
            
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

@app.get("/summarize_logs/{container_name}")
def summarize_container_logs(container_name: str):
    if not docker_client:
        return {"error": "Docker Client Offline"}
        
    try:
        container = docker_client.containers.get(container_name)
        logs = container.logs(tail=100).decode('utf-8')
        
        prompt = f"""You are Sentinel AI, an elite DevOps forensics engine.
Analyze the following recent Docker logs from the '{container_name}' container.
Provide a concise, highly professional operational summary (2-3 sentences max).
Focus strictly on current health, errors, or anomalies. Do not invent details.

LOGS:
{logs[-2000:]}"""

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=150,
        )
        summary = completion.choices[0].message.content
        return {"summary": summary}
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
    
    current_cpu = system_state["cpu"]
    current_mem = system_state["memory"]
    recent_logs = ""
    
    if req.container and docker_client and req.container != "Select a Container":
        try:
            container = docker_client.containers.get(req.container)
            recent_logs = container.logs(tail=20).decode('utf-8')
        except Exception:
            recent_logs = "Could not fetch logs for this container."

    is_anomaly = system_state["is_anomaly"]
    status_text = "CRITICAL ANOMALY DETECTED" if is_anomaly else "NORMAL NOMINAL PARAMETERS (If CPU/Memory are high but this is NORMAL, then the system was just remediated and the metrics are settling down)."
    
    system_prompt = (
        "You are OpsBot, an elite DevOps AI Assistant built into the Sentinel AIOps platform. "
        "Your job is to help the user diagnose and fix infrastructure problems. "
        f"CURRENT TELEMETRY SYSTEM STATE: {status_text}. Recent CPU is {current_cpu}%. Memory is {current_mem}%. "
        f"SELECTED CONTAINER: {req.container}. "
        f"RECENT LOGS FROM CONTAINER:\\n{recent_logs}\\n\\n"
        "Guidelines:\\n"
        "- Be concise but highly technical.\\n"
        "- If the logs show an error stack trace (like a Javascript Error or Python Exception), point it out specifically.\\n"
        "- If the SYSTEM STATE is NORMAL, do NOT panic about the CPU load. Acknowledge the system is stabilizing.\\n"
        "- Use Markdown formatting for your responses if necessary."
    )

    messages = [{"role": "system", "content": system_prompt}]
    for msg in req.history:
        messages.append(msg)
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
def simulate_attack(container: str = None, type: str = "cpu_spike"):
    if not container:
        container = f"{TARGET_WORKLOAD}_backend"
        
    system_state["simulated_attack"] = True
    system_state["simulated_target"] = container
    system_state["attack_type"] = type
    
    logger.critical(f"⚠️  SIMULATING: {type.upper()} ON {container} ⚠️")
    
    if docker_client:
        try:
            target = None
            for c in docker_client.containers.list():
                if container in c.name and "_replica_" not in c.name: # type: ignore
                    target = c
                    break
            
            if target:
                if type == "cpu_spike":
                    cores = max(1, int(os.cpu_count() * 0.75)) if os.cpu_count() else 1
                    cmd = ['sh', '-c', f'i=1; while [ $i -le {cores} ]; do while true; do true; done & i=$((i+1)); sleep 1; done']
                    target.exec_run(cmd, detach=True) # type: ignore
                elif type == "memory_leak":
                    cmd = ['sh', '-c', 'sort /dev/zero & sort /dev/zero & sort /dev/zero & sort /dev/zero & wait']
                    target.exec_run(cmd, detach=True) # type: ignore
                elif type == "ddos":
                    cores = max(1, int(os.cpu_count() * 0.85)) if os.cpu_count() else 1
                    cmd = ['sh', '-c', f'i=1; while [ $i -le {cores} ]; do while true; do true; done & i=$((i+1)); sleep 1; done & a=""; while true; do a="$a$(dd if=/dev/urandom bs=1M count=25 2>/dev/null | base64)"; sleep 1; done']
                    target.exec_run(cmd, detach=True) # type: ignore
        except Exception as e:
            logger.error(f"Failed to execute real attack on {container}: {e}")
            
    return {"message": f"Real {type} initiated on {system_state['simulated_target']}."}

def scale_out_container(base_container_name: str) -> str:
    if not docker_client: return "Docker client offline."
    try:
        target = None
        for c in docker_client.containers.list():
            if base_container_name in c.name and "_replica_" not in c.name: # type: ignore
                target = c
                break
                
        if not target:
            return f"Container '{base_container_name}' not found for scaling."
            
        image_name = target.image.tags[0] if target.image.tags else f"{TARGET_WORKLOAD}-backend"
        replica_name = f"{base_container_name}_replica_{int(time.time())}"
        
        # Get network of original container
        network_name = list(target.attrs['NetworkSettings']['Networks'].keys())[0]
        
        # We don't map ports to avoid conflicts on host. 
        # It's an internal replica.
        new_c = docker_client.containers.run(
            image=image_name,
            detach=True,
            name=replica_name,
            network=network_name,
            environment=target.attrs['Config']['Env']
        )
        return f"Auto-Scaled {base_container_name} (+1 Replica: {replica_name})"
    except Exception as e:
        logger.error(f"Scale out failed: {e}")
        return f"Auto-Scale Failed: {str(e)}"

@app.post("/remediate/green")
def execute_green_ops():
    if not docker_client: return {"error": "Docker offline"}
    
    deleted = 0
    try:
        for c in docker_client.containers.list(all=True):
            if "_replica_" in c.name:
                c.remove(force=True) # type: ignore
                deleted += 1
                
        msg = f"Green Ops: Terminated {deleted} idle replicas to save energy." if deleted > 0 else "Green Ops: System is already operating at minimum energy profile (0 replicas)."
        if deleted > 0:
            system_state["history"].append({"time": datetime.now().strftime("%H:%M:%S"), "event": msg})
        
        return {"status": "success", "message": msg, "deleted": deleted}
    except Exception as e:
        return {"error": str(e)}

@app.post("/remediate/{container_name}")
def execute_fix(container_name: str):
    
    if container_name == "auto":
        # AI Auto-detects the target based on the current context that was attacked
        container_name = system_state.get("simulated_target")
        if not container_name:
            container_name = f"{TARGET_WORKLOAD}_backend"
        
    atk = system_state.get("attack_type", "")
    is_scaling = False
    
    if atk == "cpu_spike":
        fix_desc = "Terminated cryptojacking process (SIGKILL) & restarted"
    elif atk == "memory_leak":
        fix_desc = "Flushed memory buffers and restarted worker processes"
    elif atk == "ddos":
        fix_desc = "High traffic detected! Provisioning new horizontal replica to handle load"
        is_scaling = True
    else:
        fix_desc = "Executed generic container restart"
        
    action_msg = f"AI Automated Fix: {fix_desc}"
    
    if container_name == "manual-override":
        target_name = system_state.get("simulated_target")
        if not target_name:
            target_name = f"{TARGET_WORKLOAD}_backend"
        action_msg = "Attack aborted manually. Original container restarted (Replicas left online)."
        if docker_client:
            try:
                for c in docker_client.containers.list():
                    if target_name in c.name and "_replica_" not in c.name: # type: ignore
                        kill_attack_processes(c)
                        c.restart() # type: ignore
            except Exception as e:
                logger.error(f"Cleanup failed: {e}")
    else:
        if is_scaling:
            current_time = time.time()
            if current_time - system_state.get("last_scale_time", 0.0) > 10:
                active_replicas = 0
                if docker_client:
                    for c in docker_client.containers.list():
                        if "_replica_" in c.name: active_replicas += 1 # type: ignore
                
                if active_replicas < 3:
                    scale_msg = scale_out_container(container_name)
                    system_state["last_scale_time"] = current_time
                    action_msg += f" | {scale_msg}"
                    
                    if active_replicas == 2:
                        action_msg += " | Max capacity reached. Load distributed."
                        if docker_client:
                            try:
                                for c in docker_client.containers.list():
                                    if container_name in c.name and "_replica_" not in c.name: # type: ignore
                                        kill_attack_processes(c)
                                        c.restart() # type: ignore
                            except Exception:
                                pass
                else:
                    action_msg = "AI Auto-Scale: Max replica cap (3) reached. Load distributed."
                    if docker_client:
                        try:
                            for c in docker_client.containers.list():
                                if container_name in c.name and "_replica_" not in c.name: # type: ignore
                                    kill_attack_processes(c)
                                    c.restart() # type: ignore
                        except Exception:
                            pass
            else:
                action_msg = "AI Auto-Scale: Cooldown active."
        else:
            if docker_client:
                try:
                    target = None
                    for c in docker_client.containers.list():
                        if container_name in c.name and "_replica_" not in c.name: # type: ignore
                            target = c
                            break
                            
                    if target:
                        kill_attack_processes(target)
                        target.restart() # type: ignore
                        action_msg += f" (Restarted {getattr(target, 'name', container_name)})"
                    else:
                        action_msg += f" (Container '{container_name}' not found)"
                except Exception as e:
                    logger.error(f"Docker restart failed: {e}")
                    action_msg += " (Docker restart failed)"

    # Only reset simulated_attack if the attack was actually stopped
    attack_stopped = True
    if is_scaling and container_name != "manual-override":
        if "Max capacity reached" not in action_msg and "Max replica cap (3)" not in action_msg:
            attack_stopped = False
            
    if attack_stopped:
        system_state["simulated_attack"] = False
        
    system_state["is_anomaly"] = False
    system_state["current_diagnosis"] = ""
    
    if "Cooldown active" not in action_msg and "Max replica cap" not in action_msg:
        system_state["history"].append({"time": datetime.now().strftime("%H:%M:%S"), "event": action_msg})
        return {"status": "success", "message": action_msg}
    else:
        return {"status": "cooldown", "message": action_msg}

@app.post("/container/{container_name}/{action}")
def manage_container(container_name: str, action: str):
    if not docker_client:
        return {"error": "Docker Client Offline"}
        
    try:
        target = None
        for c in docker_client.containers.list(all=True):
            if c.name == container_name:
                target = c
                break
        if not target:
            for c in docker_client.containers.list(all=True):
                if container_name in c.name and "_replica_" not in c.name: # type: ignore
                    target = c
                    break
                
        if target is not None:
            if action == "restart": target.restart() # type: ignore
            elif action == "stop": target.stop() # type: ignore
            elif action == "start": target.start() # type: ignore
            elif action == "delete": target.remove(force=True) # type: ignore
            else:
                return {"error": f"Unknown action: {action}"}
                
            return {"status": "success", "message": f"Successfully executed '{action}' on {getattr(target, 'name', container_name)}"}
        else:
            return {"error": f"Container {container_name} not found on host."}
            
    except Exception as e:
        return {"error": str(e)}
