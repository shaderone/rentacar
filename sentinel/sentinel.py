import time
import requests
import docker
import os
import logging
from datetime import datetime
from sklearn.ensemble import IsolationForest
from groq import Groq

# --- CONFIGURATION (Loaded from .env) ---
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://prometheus:9090")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Sentinel")

print(f"🛡️ AIOps SENTINEL v3.3 [SECURE ENV MODE]: STARTING...")

# --- VALIDATION ---
if not GROQ_API_KEY:
    logger.error("❌ CRITICAL: GROQ_API_KEY is missing from environment!")
    exit(1)
if not TELEGRAM_BOT_TOKEN:
    logger.error("❌ CRITICAL: TELEGRAM_BOT_TOKEN is missing!")
    exit(1)

# Initialize Groq Client
try:
    client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    logger.error(f"⚠️ Groq Client Init Error: {e}")
    client = None

# Initialize Docker (Safe Mode)
try:
    docker_client = docker.from_env()
    logger.info("✅ Docker Socket Connected.")
except Exception as e:
    logger.warning(f"⚠️ Docker Warning: {e} (Running in Monitor-Only mode)")
    docker_client = None

def send_telegram(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logger.error(f"Telegram Failed: {e}")

def get_ai_diagnostic(cpu_load):
    if not client:
        return "⚠️ AI Client not initialized."

    prompt = (
        f"Alert: Server CPU is at {cpu_load}%. "
        "1. Summarize likely cause in one sentence. "
        "2. Provide exactly 3 bash commands to fix. "
        "Format for Telegram Markdown."
    )
    
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=400
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"⚠️ Groq AI Error: {str(e)}"

def get_cpu_load():
    try:
        query = '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)'
        res = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query}, timeout=2)
        data = res.json()['data']['result']
        if data:
            return float(data[0]['value'][1])
        return 0.0
    except Exception as e:
        return 0.0

# --- MAIN LOOP ---
send_telegram(f"🛡️ **Sentinel v3.3 Online**\nEnvironment: Secure\nModel: {MODEL_NAME}")

TRAIN_POINTS = 10
logger.info(f"🎓 Learning Baseline ({TRAIN_POINTS}s)...")
training_data = []

for i in range(TRAIN_POINTS):
    load = get_cpu_load()
    training_data.append([load])
    time.sleep(1)

model = IsolationForest(contamination=0.05, random_state=42)
model.fit(training_data)
logger.info("✅ Model Trained. Sentinel Watching.")

while True:
    current_load = get_cpu_load()
    prediction = model.predict([[current_load]])[0]
    is_anomaly = (prediction == -1 and current_load > 15.0) or (current_load > 90.0)

    if is_anomaly:
        logger.warning(f"🚨 ANOMALY: {current_load:.2f}%")
        insight = get_ai_diagnostic(current_load)
        
        msg = (
            f"🚨 **SYSTEM ANOMALY**\n"
            f"CPU Load: `{current_load:.2f}%`\n\n"
            f"🧠 **AI Diagnostic:**\n{insight}"
        )
        send_telegram(msg)
        time.sleep(300) 
        
    time.sleep(5)