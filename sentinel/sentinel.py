import time
import requests
import docker
import csv
import os
from datetime import datetime
from sklearn.ensemble import IsolationForest

# --- CONFIGURATION ---
TELEGRAM_BOT_TOKEN = "8279244361:AAFbe9DewVIRIhpMF0psT_e0sM-F9AbwqZU"
TELEGRAM_CHAT_ID = "1723374968"
PROMETHEUS_URL = "http://prometheus:9090"

# 🔑 AI CONFIG (OpenRouter)
OPENROUTER_API_KEY = "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"
MODEL_NAME = "google/gemini-2.0-flash-exp:free" # Or "deepseek/deepseek-r1:free"

# 🐳 DOCKER CONFIG
TARGET_CONTAINER = "node_exporter"  # Must match docker-compose name (underscores!)

# 💾 DATASET CONFIG
DATASET_FILE = "sentinel_dataset.csv"

# --- SETTINGS ---
TRAIN_DATA_POINTS = 20
CONTAMINATION_RATE = 'auto' 
NOISE_THRESHOLD = 15.0 

print(f"🧠 AIOps SENTINEL: INITIALIZING GOD MODE ({MODEL_NAME})...")

# 1. Initialize Docker
try:
    docker_client = docker.from_env()
    print("✅ Docker Socket Connected (Self-Healing Ready)")
except Exception as e:
    print(f"❌ Docker Error: {e}")
    docker_client = None

# 2. Initialize CSV
if not os.path.exists(DATASET_FILE):
    with open(DATASET_FILE, mode='w', newline='') as file:
        csv.writer(file).writerow(["timestamp", "cpu_load", "label"])

def send_telegram_alert(message):
    try:
        requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", 
                      json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}, timeout=5)
    except: pass

def get_ai_analysis(cpu_load):
    """Asks OpenRouter to explain the crash."""
    if "PASTE" in OPENROUTER_API_KEY: return "⚠️ AI Key missing."
    
    print(f"🤔 Asking {MODEL_NAME}...")
    headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}"}
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": f"Server CPU is {cpu_load:.1f}% (Normal 1%). Explain why and suggest 1 fix. Keep it under 20 words."}]
    }
    try:
        resp = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers, timeout=10)
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"⚠️ AI Error: {e}"

def remediate_anomaly(cpu_load):
    """Restarts the container."""
    if not docker_client: return "❌ Docker access denied."
    try:
        docker_client.containers.get(TARGET_CONTAINER).restart()
        return f"✅ SUCCESS: Restarted '{TARGET_CONTAINER}' to clear load."
    except Exception as e:
        return f"❌ HEALING FAILED: {e}"

def get_cpu_load():
    try:
        query = '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)'
        return float(requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query}, timeout=2).json()['data']['result'][0]['value'][1])
    except: return 0.0

# --- STARTUP ---
send_telegram_alert(f"✅ **God Mode Active**\nAI: {MODEL_NAME}\nHealing: On\nRecording: On")

# --- TRAINING ---
print("🎓 LEARNING BASELINE...")
training_data = []
for i in range(TRAIN_DATA_POINTS):
    load = get_cpu_load()
    training_data.append([load])
    print(f"📊 Gathering: {load:.2f}%")
    time.sleep(2)

print("🤖 TRAINING MODEL...")
model = IsolationForest(contamination=CONTAMINATION_RATE, random_state=42)
model.fit(training_data)
print("✅ SENTINEL WATCHING.")

# --- PROTECTION LOOP ---
while True:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    load = get_cpu_load()
    
    # 1. RECORD (Dataset)
    label = "1" if load > 50.0 else "0"
    with open(DATASET_FILE, mode='a', newline='') as file:
        csv.writer(file).writerow([timestamp, load, label])

    # 2. DETECT
    prediction = model.predict([[load]])[0]
    is_anomaly = (prediction == -1) and (load > NOISE_THRESHOLD)
    if load > 50.0: is_anomaly = True

    if is_anomaly:
        print(f"\n🚨 ANOMALY: {load:.2f}%")
        send_telegram_alert(f"🚨 **Anomaly Detected** (Load: {load:.2f}%)")
        
        # 3. ANALYZE (AI)
        insight = get_ai_analysis(load)
        send_telegram_alert(f"🧠 **AI Insight:**\n{insight}")
        
        # 4. HEAL (Docker)
        fix = remediate_anomaly(load)
        print(fix)
        send_telegram_alert(f"🩹 **Auto-Pilot:**\n{fix}")
        
        time.sleep(30)
    else:
        print(f"✅ [{timestamp}] Load: {load:.2f}% | Saved")
        
    time.sleep(2)
