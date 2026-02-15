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

# 📂 FILE PATHS
DATASET_FILE = "sentinel_dataset.csv"
INCIDENT_LOG = "incident_history.json"

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Sentinel")

print(f"🛡️ AIOps SENTINEL v3.0 [DIAGNOSTIC MODE]: STARTING...")

# 1. Initialize Docker (For log gathering only)
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

def log_incident(timestamp, load, ai_insight):
    """Saves the diagnostic details for project documentation/viva."""
    entry = {
        "timestamp": timestamp,
        "trigger_load": load,
        "status": "REPORTED_ONLY",
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

def get_ai_diagnostic(cpu_load):
    """Consults Gemini to provide root cause and bash commands."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://rentacar-sentinel",
        "Content-Type": "application/json"
    }
    
    # Updated Prompt for 'Diagnostic' Decision
    prompt = (
        f"Alert: Server CPU is at {cpu_load}%. "
        "1. Summarize the likely cause in one sentence. "
        "2. Provide exactly 3 specific bash commands for the user to troubleshoot or fix this. "
        "Be concise and format for Telegram Markdown."
    )
    
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}]
    }
    
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        return f"⚠️ AI Error {response.status_code}"
    except Exception as e:
        return f"⚠️ AI Connection Failed: {str(e)}"

def get_cpu_load():
    try:
        query = '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)'
        res = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query}, timeout=2)
        val = float(res.json()['data']['result'][0]['value'][1])
        return val
    except:
        return 0.0

# --- INITIAL TRAINING ---
TRAIN_POINTS = 20
logger.info(f"🎓 Learning Baseline ({TRAIN_POINTS} points)...")
training_data = []

for i in range(TRAIN_POINTS):
    load = get_cpu_load()
    training_data.append([load])
    time.sleep(1)

model = IsolationForest(contamination=0.05, random_state=42)
model.fit(training_data)
logger.info("✅ Model Trained. Sentinel Active.")
send_telegram("🛡️ **Sentinel v3.0 Online**\nMode: AI-Assisted Diagnostics\nPipeline: Active")

# --- MAIN LOOP ---
while True:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    current_load = get_cpu_load()
    
    # 1. Prediction using Isolation Forest
    prediction = model.predict([[current_load]])[0]
    is_anomaly = (prediction == -1) and (current_load > 15.0)
    
    # Fail-safe High Load trigger
    if current_load > 60.0: is_anomaly = True 

    if is_anomaly:
        logger.warning(f"🚨 ANOMALY: {current_load:.2f}%")
        
        # 2. Get AI Diagnostic Insight
        insight = get_ai_diagnostic(current_load)
        
        # 3. Formulate Message (NO AUTO-HEALING HERE)
        alert_msg = (
            f"🚨 **SYSTEM ANOMALY DETECTED**\n"
            f"Current CPU Load: `{current_load:.2f}%`\n\n"
            f"🧠 **AI Diagnostic Insight:**\n{insight}\n\n"
            f"📢 *Note: Auto-fix is disabled. Please run the suggested commands manually.*"
        )
        
        # 4. Report and Log
        send_telegram(alert_msg)
        log_incident(timestamp, current_load, insight)
        
        # Wait longer to avoid spamming alerts during an ongoing issue
        time.sleep(300) 
        
    time.sleep(5)