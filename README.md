# 🛡️ Sentinel AIOps: Autonomous DevSecOps Governance

**Sentinel** is an enterprise-grade AIOps platform designed to bridge the gap between development and operations. It implements a full **DevSecOps Lifecycle**—integrating automated testing, security vulnerability scanning, and AI-driven infrastructure self-healing.



## 🚀 Core Features

### 1. DevSecOps Pipeline Gatekeeper
* **Automated Unit Testing:** Integrated `Jest` suite for critical service verification (e.g., Authentication logic).
* **Security Scanning:** Integrated **Trivy** vulnerability scanning for container images to detect CVEs before production.
* **Deployment Governance:** A "Locked-Gate" mechanism that prevents deployment if tests or security scans fail.

### 2. AIOps Monitoring & Anomaly Detection
* **Intelligent Observability:** Real-time hardware telemetry via **Prometheus** and **Node Exporter**.
* **Unsupervised ML:** Uses **Isolation Forest** algorithms to detect system anomalies without manual threshold setting.
* **AI Diagnosis:** Leverages **Llama-3 (Groq)** to generate instant root-cause analysis and remediation bash commands.

### 3. Self-Healing Infrastructure
* **Automated Remediation:** Direct integration with the **Docker Engine API** to restart failing workloads.
* **Live Notifications:** Real-time alerting via **Telegram Bot** for critical anomalies and "Green Ops" sustainability reports.

---

## 🛠️ Technical Stack

| Category | Tools |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Chart.js |
| **Backend** | FastAPI (Python), Node.js (Express) |
| **AI/ML** | Scikit-learn (Isolation Forest), Llama-3 (Groq) |
| **Infrastructure** | Docker, Docker Compose, Prometheus, Node Exporter |
| **Security/Test** | Trivy, Jest (Auth Testing) |
| **Communication**| Telegram Bot API |

---

## 📂 Project Structure

```text
├── sentinel/                # Python AIOps Core (The "Brain")
│   ├── sentinel.py          # FastAPI Backend & ML Logic
│   ├── sentinel_enterprise.html # DevSecOps Dashboard UI
│   └── .env                 # API Keys (Groq, Telegram)
├── rentacar-backend/        # Node.js API Service (The "Workload")
│   ├── server.js            # Express Business Logic
│   └── tests/               # Jest Unit Tests (Auth_Test.js)
├── rentacar-frontend/       # Vite React Frontend (The "User Interface")
└── docker-compose.yml       # Full Stack Orchestration
```

## 🚦 Getting Started

### Prerequisites
* **Docker & Docker Compose** installed.
* **Groq API Key** (for AI-powered Diagnosis).
* **Telegram Bot Token & Chat ID** (for Real-time Alerts).

## 📦 Installation & Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/sentinel-aiops.git
   cd sentinel-aiops
   ```

2. **Configure environment variables:**
   Create a `.env` file inside the `sentinel/` directory:
   ```env
   GROQ_API_KEY=your_key_here
   TELEGRAM_BOT_TOKEN=your_token_here
   TELEGRAM_CHAT_ID=your_id_here
   ```

3. **Build and start the platform:**
   ```bash
   docker compose up -d --build
   ```

4. **Access the dashboard:**
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

# 🧠 System Architecture

Sentinel operates as a closed-loop autonomous system designed for high-availability environments:

1. **Observability**
   - Prometheus scrapes real-time hardware and container metrics.

2. **Detection**
   - An Isolation Forest machine learning model identifies statistical deviations from the learned baseline.

3. **Diagnosis**
   - Groq AI (Llama-3) analyzes anomaly context and suggests remediation bash commands.

4. **Action**
   - A human-in-the-loop triggers the **"Execute AI Fix"** button.
   - The system communicates with the Docker Engine API to restart the affected service.

---

# 🌿 Green Ops & Sustainability

Sentinel includes a custom **Green Ops Monitor**.

If system load remains under **5% for more than 5 minutes**, Sentinel will:

1. Calculate wasted energy in **kWh**.
2. Estimate the carbon footprint in **gCO₂**.
3. Send a sustainability report to the administrator via Telegram.

This encourages:

- Resource decommissioning  
- Infrastructure rightsizing  
- Energy-efficient operations  

---

# 🛡️ Security Policy

Sentinel enforces a strict **Shift-Left Security** strategy.

Every code commit must pass through the **DevSecOps Pipeline Guard**:

1. **Unit Testing**
   - Mandatory execution of the Jest test suite (e.g., `Auth_Test.js`).

2. **Vulnerability Scanning**
   - Automated Trivy scan of the container image.

3. **Gatekeeping**
   - Deployment to production is programmatically locked unless:
     - All tests pass.
     - Security scans return a **"Passed"** status.


