import time
import requests
import docker
import csv
import json
import os
import logging
from datetime import datetime
from sklearn.ensemble import IsolationForest

# --- CONFIGURATION ---
TELEGRAM_BOT_TOKEN = "8279244361:AAFbe9DewVIRIhpMF0psT_e0sM-F9AbwqZU"
TELEGRAM_CHAT_ID = "1723374968"
PROMETHEUS_URL = "http://prometheus:9090"

# 🔑 AI CONFIG (OpenRouter)
OPENROUTER_API_KEY = "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"
MODEL_NAME = "google/gemini-2.0-flash-exp:free" 

# 🐳 DOCKER CONFIG
TARGET_CONTAINER = "node_exporter" 

# 📂 FILE PATHS
DATASET_FILE = "sentinel_dataset.csv"
INCIDENT_LOG = "incident_history.json"

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Sentinel")

print(f"🛡️ AIOps SENTINEL v2.0: STARTING...")

# 1. Initialize Docker
try:
    docker_client = docker.from_env()
    logger.info("✅ Docker Socket Connected.")
except Exception as e:
    logger.error(f"❌ Docker Error: {e}")
    docker_client = None

# 2. Initialize CSV Header
if not os.path.exists(DATASET_FILE):
    with open(DATASET_FILE, mode='w', newline='') as file:
        csv.writer(file).writerow(["timestamp", "cpu_load", "label"])

def log_incident(timestamp, load, action, ai_insight):
    """Documentation: Saves the fix details to a JSON file for the Viva report."""
    entry = {
        "timestamp": timestamp,
        "trigger_load": load,
        "action_taken": action,
        "ai_analysis": ai_insight
    }
    
    data = []
    if os.path.exists(INCIDENT_LOG):
        try:
            with open(INCIDENT_LOG, 'r') as f:
                data = json.load(f)
        except: pass 
    
    data.append(entry)
    
    with open(INCIDENT_LOG, 'w') as f:
        json.dump(data, f, indent=4)

def send_telegram(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logger.error(f"Telegram Failed: {e}")

def get_ai_analysis(cpu_load):
    """Resilient AI Analysis that won't crash the script."""
    if "PASTE" in OPENROUTER_API_KEY: return "⚠️ AI Key Config Missing."
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://rentacar-sentinel", # OpenRouter often requires this
        "Content-Type": "application/json"
    }
    prompt = f"Server CPU is at {cpu_load}%. This is an anomaly. Diagnose potential causes and recommend a fix. Keep it under 20 words."
    
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}]
    }
    
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content']
            else:
                return "⚠️ AI Response Empty (Provider Busy)"
        else:
            return f"⚠️ AI Error {response.status_code}"
    except Exception as e:
        return f"⚠️ AI Connection Failed: {str(e)}"

def remediate_anomaly(cpu_load):
    """Self-Healing: Restarts container and returns report."""
    if not docker_client: return "❌ Docker Client Unavailable"
    
    try:
        container = docker_client.containers.get(TARGET_CONTAINER)
        container.restart()
        return f"✅ SUCCESS: Restarted '{TARGET_CONTAINER}'."
    except Exception as e:
        return f"❌ HEALING FAILED: {str(e)}"

def get_cpu_load():
    try:
        query = '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)'
        res = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query}, timeout=2)
        val = float(res.json()['data']['result'][0]['value'][1])
        return val
    except:
        return 0.0

# --- MAIN LOOP ---
TRAIN_POINTS = 20
logger.info(f"🎓 Learning Baseline ({TRAIN_POINTS} points)...")
training_data = []

# Initial Training Phase
for i in range(TRAIN_POINTS):
    load = get_cpu_load()
    training_data.append([load])
    time.sleep(1)

model = IsolationForest(contamination=0.05, random_state=42)
model.fit(training_data)
logger.info("✅ Model Trained. Sentinel Active.")
send_telegram("🛡️ **Sentinel v2.0 Online**\nAIOps Pipeline: Active")

while True:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    current_load = get_cpu_load()
    
    # 1. DATA RECORDING
    label = 1 if current_load > 50.0 else 0
    with open(DATASET_FILE, mode='a', newline='') as file:
        csv.writer(file).writerow([timestamp, current_load, label])

    # 2. ANOMALY DETECTION
    # Predict returns -1 for outlier
    prediction = model.predict([[current_load]])[0]
    
    # Logic: Must be statistically weird (-1) AND historically high (>15%)
    is_anomaly = (prediction == -1) and (current_load > 15.0)
    
    # Fail-safe: Always trigger if over 60%
    if current_load > 60.0: is_anomaly = True 

    if is_anomaly:
        logger.warning(f"🚨 ANOMALY: {current_load:.2f}%")
        
        # 3. AI INSIGHTS
        insight = get_ai_analysis(current_load)
        
        # 4. SELF-HEALING ACTION
        fix_report = remediate_anomaly(current_load)
        
        # 5. NOTIFICATION & DOCUMENTATION
        alert_msg = (
            f"🚨 **ANOMALY DETECTED**\n"
            f"Cpu Load: {current_load:.2f}%\n\n"
            f"🧠 **AI Insight:**\n{insight}\n\n"
            f"🛠️ **Self-Healing Action:**\n{fix_report}"
        )
        send_telegram(alert_msg)
        log_incident(timestamp, current_load, fix_report, insight)
        
        # Pause to let system stabilize
        time.sleep(30)
        
    time.sleep(3)