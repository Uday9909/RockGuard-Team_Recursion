# 🪨 Rock Guard

> **AI-Based Rockfall Prediction & Alert System for Open-Pit Mines**

[![Smart India Hackathon 2025](https://img.shields.io/badge/SIH%202025-Top%2025%20of%20800%20Teams-blue?style=flat-square)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/PS%20ID-SIH25071-orange?style=flat-square)]()
[![Theme](https://img.shields.io/badge/Theme-Disaster%20Management-red?style=flat-square)]()
[![Team](https://img.shields.io/badge/Team-Recursion-purple?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## The Problem

India mines nearly **1 billion tonnes of coal annually** from open-pit mines. Rockfalls are the single greatest safety hazard in surface mining — responsible for nearly **38% of open-pit mine fatalities**.

The core challenge is **predictability**. Rockfalls happen fast, often without visible warning. Traditional monitoring systems like Slope Stability Radar (SSR) are reactive — they detect a slope that is *already* failing. Worse, they cost upwards of **₹2,00,00,000 per unit**, placing them beyond the reach of most small and medium mines in India.

This creates a dangerous gap: thousands of mines operating with little to no real-time geotechnical monitoring.

**Rock Guard was built to close that gap.**

---

## Our Solution

Rock Guard is a full-stack, AI-powered early warning system that predicts rockfall risk *before* it becomes visible — combining affordable IoT sensor hardware with an interpretable machine learning model and a real-time web dashboard.

```
IoT Sensors (ESP32 + LoRa)
        │
        ▼
Cloud Backend (FastAPI)
        │
        ▼
AI Prediction Engine (Logistic Regression)
        │
        ├──► React Dashboard → Mine Manager (Visual Alerts)
        └──► SMS / Push Notifications → Field Workers
```

The system is designed around three principles:

1. **Predict, don't react** — identify risk hours before physical signs appear
2. **Glass Box, not Black Box** — every alert shows *why* the AI flagged it
3. **Affordable at scale** — ₹15,000 total cost vs ₹2,00,00,000 for radar

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Primary Model | Logistic Regression |
| Recall (Rockfall Detection) | 86.3% |
| F1-Score | 0.82 |
| Precision | 0.76 |
| Training Dataset | 100,000 samples |
| Input Features | 20+ geological, environmental & sensor variables |
| System Cost | ~₹15,000 (vs ₹2,00,00,000 for radar) |
| Cost Reduction | ~1,300× cheaper than traditional systems |
| SIH 2025 Result | Top 25 of 800 teams |

---

## Why Logistic Regression?

We rigorously evaluated four models — Logistic Regression, Random Forest, LightGBM, and XGBoost — against our 100,000-sample dataset.

| Model | Recall (Safety Score) |
|---|---|
| Random Forest | 89.6% |
| LightGBM | 88.6% |
| **Logistic Regression** | **88.5%** |
| XGBoost | 86.8% |

We chose Logistic Regression for three reasons:

- **Interpretability** — its coefficients map directly to feature importance, enabling the Glass Box panel. A mine supervisor can see *which sensor reading* drove the alert.
- **Competitive recall** — within 1.1% of Random Forest at a fraction of the complexity.
- **Production reliability** — no hyperparameter tuning drift, consistent inference latency, and trivially serialisable.

In safety-critical systems, a model you can explain is more trustworthy than a model that is marginally more accurate but opaque.

---

## The Glass Box Principle

Most AI systems in industrial safety are black boxes — they produce a warning number but give no reasoning.

Rock Guard is different. Every prediction includes:

- The **top 3 sensor readings** that most influenced the result
- Their **impact level** (high / medium / low)
- A **plain-language recommendation** for the mine manager
- A **full historical log** of all prior predictions

If a rockfall does occur, the system functions as a **flight recorder** — every data point leading up to the incident is preserved and visualised, transforming each event into a learning opportunity for continuous improvement.

---

## Leaky Feature Removal

A critical part of building a trustworthy model is removing features that would inflate evaluation metrics but fail in production.

We explicitly excluded three columns from training:

| Column | Reason |
|---|---|
| `Occurred` | The target variable — using it as a feature would be circular |
| `Susceptibility_Score` | Pre-calculated using outcome data — only exists *after* a rockfall |
| `Impact_Level` | Describes post-event severity — not knowable before the event |

This ensures the model only learns from information that would genuinely be available at prediction time.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MINE SITE (Field)                        │
│                                                                 │
│   ESP32 Microcontroller                                         │
│   ├── MPU-6050 Tiltmeter / Accelerometer                       │
│   ├── Rain Gauge (Rainfall_mm)                                  │
│   └── Vibration Sensor                                          │
│              │                                                  │
│              │ LoRa (865–867 MHz, up to 15–20 km range)        │
│              ▼                                                  │
│       LoRaWAN Gateway (pit rim)                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │ 4G / Cellular / Ethernet
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUD BACKEND (FastAPI)                     │
│                                                                 │
│   POST /predict     ← Sensor data in                           │
│   GET  /simulate    ← Mock data for demo/dev                   │
│   GET  /history     ← Last 20 predictions                      │
│   GET  /health      ← System status                            │
│                                                                 │
│   ┌──────────────────────────────────────────────────────┐     │
│   │  Logistic Regression Model (model.pkl)               │     │
│   │  ├── One-hot encoding (Rock_Type, Season, etc.)      │     │
│   │  ├── SMOTE-balanced training data                    │     │
│   │  └── Top-3 coefficient extraction (Glass Box)        │     │
│   └──────────────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐   ┌─────────────────────┐
│  React Dashboard │   │  SMS / Push Alert   │
│  (Mine Manager)  │   │  (Field Workers)    │
│                  │   │                     │
│  • Risk Gauge    │   │  Local language     │
│  • Glass Box     │   │  Survival tips      │
│  • Alert Feed    │   │  (Gemini API)       │
│  • Sensor Grid   │   │                     │
└──────────────────┘   └─────────────────────┘
```

---

## Repository Structure

```
RockGuard-Team_Recursion/
│
├── Rockfall-Prediction-Model/          # Python ML backend
│   ├── api/
│   │   ├── main.py                     # FastAPI application
│   │   ├── train_model.py              # Model training script
│   │   ├── model.pkl                   # Trained model (git-ignored)
│   │   ├── model_columns.pkl           # Feature column list (git-ignored)
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── data/
│   │   └── Rockfall.csv                # Training dataset (~9MB)
│   ├── model.ipynb                     # Main training + evaluation notebook
│   ├── eda2.ipynb                      # Exploratory data analysis
│   ├── pyproject.toml
│   └── README.md
│
├── terrain-alert-ai/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Project intro + CTA
│   │   │   └── Index.tsx               # Main dashboard
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── RiskGauge.tsx       # Animated risk score gauge
│   │   │   │   ├── TopFactorsChart.tsx # Glass Box bar chart
│   │   │   │   └── PredictionFeed.tsx  # Alert history timeline
│   │   │   └── ui/                     # shadcn-ui components
│   │   ├── services/
│   │   │   └── api.ts                  # Typed API client
│   │   └── App.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── docker-compose.yml                  # One-command full deployment
├── Makefile                            # Dev workflow shortcuts
├── .gitignore
└── README.md                           # This file
```

---

## Tech Stack

**Machine Learning**
- Python 3.11+
- Scikit-learn (Logistic Regression, preprocessing)
- XGBoost (comparison model)
- imbalanced-learn (SMOTE)
- Pandas, NumPy
- Joblib (model serialisation)
- Matplotlib, Seaborn (EDA visualisation)

**Backend API**
- FastAPI
- Uvicorn
- Pydantic (request/response validation)

**Frontend Dashboard**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn-ui
- Recharts (data visualisation)
- TanStack Query (data fetching + polling)
- Lucide React (icons)

**Infrastructure**
- Docker + docker-compose
- LoRaWAN (ESP32 + SX1276, 865–867 MHz India band)
- Solar-powered IoT nodes (~₹7,500 per node)

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- `uv` (recommended) or `pip`

### Option 1 — Run with Make (recommended)

```bash
# Clone the repo
git clone https://github.com/Uday9909/RockGuard-Team_Recursion.git
cd RockGuard-Team_Recursion

# Step 1: Train the model
make train

# Step 2: Start both servers
make dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

### Option 2 — Run manually

**Backend (Terminal 1)**

```bash
cd Rockfall-Prediction-Model/api
pip install -r requirements.txt
python train_model.py        # Trains model, saves model.pkl
uvicorn main:app --reload --port 8000
```

**Frontend (Terminal 2)**

```bash
cd terrain-alert-ai
npm install
cp .env.example .env
npm run dev
```

---

### Option 3 — Docker (one command)

```bash
docker-compose up --build
```

- API: [http://localhost:8000](http://localhost:8000)
- Dashboard: [http://localhost:5173](http://localhost:5173)

---

## API Reference

Base URL: `http://localhost:8000`

### `GET /health`
Returns system and model status.

```json
{
  "status": "ok",
  "model": "Logistic Regression",
  "version": "1.0",
  "project": "Rock Guard"
}
```

---

### `POST /predict`
Accepts sensor readings and returns a risk prediction.

**Request body:**
```json
{
  "Slope_deg": 35.2,
  "Elevation_m": 420.0,
  "Rainfall_mm": 85.5,
  "Prior_Events": 2,
  "Distance_to_fault_km": 1.2,
  "Fracture_Density": 0.74,
  "Rock_Hardness": 6,
  "Temperature_C": 28.0,
  "Humidity_percent": 72.0,
  "Season": "Monsoon",
  "Rock_Type": "Granite"
}
```

**Response:**
```json
{
  "risk_score": 0.73,
  "risk_level": "HIGH",
  "top_factors": [
    { "feature": "Rainfall_mm", "value": 85.5, "impact": "high" },
    { "feature": "Prior_Events", "value": 2, "impact": "high" },
    { "feature": "Slope_deg", "value": 35.2, "impact": "medium" }
  ],
  "recommendation": "Restrict access to this zone. Evacuate personnel immediately and notify mine management.",
  "timestamp": "2025-01-15T10:30:00Z",
  "model_used": "Logistic Regression"
}
```

Risk levels: `score < 0.35` → LOW | `0.35–0.65` → MEDIUM | `> 0.65` → HIGH

---

### `GET /simulate`
Generates a realistic random sensor reading and returns its prediction. Used by the dashboard's live polling every 30 seconds.

```json
{
  "sensor_data": { "Slope_deg": 42.1, "Rainfall_mm": 110.3, "..." },
  "prediction": { "risk_score": 0.81, "risk_level": "HIGH", "..." }
}
```

---

### `GET /history`
Returns the last 20 predictions stored in memory.

---

## Dashboard Features

| Panel | Description |
|---|---|
| **Risk Gauge** | Animated circular gauge showing current risk score (0–100%), colour-coded green/amber/red |
| **Glass Box Panel** | Horizontal bar chart of the top 3 sensor readings that drove the current prediction |
| **Sensor Grid** | Live cards for all active sensor readings; key sensors (rainfall, slope, fracture density) shown prominently |
| **Alert History Feed** | Scrollable timeline of the last 20 predictions with colour-coded risk badges |
| **Emergency Banner** | Full-width high-visibility alert bar for HIGH risk events |
| **Offline Fallback** | If the API is unreachable, the dashboard shows a "Demo Mode" banner with static mock data — the UI never breaks |

The dashboard polls `GET /simulate` every **30 seconds** automatically.

---

## IoT Hardware (Field Deployment)

| Component | Model | Est. Cost (INR) |
|---|---|---|
| Microcontroller + LoRa | Heltec WiFi LoRa 32 (V3) | ₹1,800 |
| Tiltmeter / Accelerometer | MPU-6050 (6-DoF MEMS) | ₹310 |
| Battery | 18650 Li-ion 3000mAh | ₹355 |
| Solar Panel | 2W 6V ETFE coated | ₹1,850 |
| Charging Circuit | TP4056 with protection | ₹135 |
| Antenna | 868MHz LoRa IPEX | ₹180 |
| Enclosure + Mounting | IP67 rated | ₹1,325 |
| Assembly + Contingency | — | ₹1,560 |
| **Total per node** | | **~₹7,500** |

A full deployment of 200 nodes covering an entire mine costs approximately **₹15,00,000** — compared to **₹2,00,00,000+** for a single Slope Stability Radar unit.

LoRaWAN range: up to **15–20 km** in open terrain. A single gateway placed on the pit rim can cover an entire active mining area.

---

## Model Training Details

### Dataset
- **Source:** `Rockfall.csv` — 100,000 labelled samples
- **Target:** `Occurred` (binary: 1 = rockfall, 0 = no rockfall)

### Features Used (20+)

| Category | Features |
|---|---|
| Geological & Positional | `Slope_deg`, `Elevation_m`, `Aspect_deg`, `Distance_to_fault_km`, `Rock_Type`, `Soil_Type`, `Lithology`, `Rock_Hardness`, `Fracture_Density` |
| Environmental & Weather | `Rainfall_mm`, `Snow_mm`, `Temperature_C`, `Wind_speed_kmh`, `Humidity_percent`, `Vegetation`, `Land_Cover`, `NDVI` |
| Event-Specific | `Prior_Events`, `Rock_Size_cm`, `Rock_Volume_m3`, `Rock_Velocity_mps` |
| Temporal | `Month`, `Day`, `Season` |

### Features Deliberately Excluded

| Feature | Reason |
|---|---|
| `Occurred` | Target variable |
| `Susceptibility_Score` | Leaky — computed from outcome data |
| `Impact_Level` | Leaky — only known after a rockfall |

### Training Pipeline

```
Raw CSV
  └─► Drop leaky columns
        └─► One-hot encode categoricals (Rock_Type, Season, etc.)
              └─► Train/test split (80/20)
                    └─► SMOTE (balance classes)
                          └─► Logistic Regression (fit)
                                └─► Evaluate (F1, Recall, Precision)
                                      └─► Save model.pkl + model_columns.pkl
```

To retrain from scratch:

```bash
cd Rockfall-Prediction-Model/api
python train_model.py
```

---

## Project Background

Rock Guard was built by **Team Recursion** for **Smart India Hackathon 2025** (SIH25071), under the theme of Disaster Management.

The project addresses a real and persistent problem in Indian mining: a systemic gap between advanced geotechnical knowledge and on-the-ground implementation, largely driven by cost barriers and reactive safety culture.

We finished in the **Top 25 out of 800 teams** at our internal hackathon selection round.

### The Cost Comparison

```
Traditional Slope Stability Radar:   ₹ 2,00,00,000  (single unit, single location)
Rock Guard (200-node IoT network):   ₹    15,00,000  (full mine coverage)

Cost reduction: ~1,300×
```

### Why This Matters

The 2016 Rajmahal mine disaster in Jharkhand claimed 23 lives when an overburden dump collapsed. Warning signs — visible cracks, ground fissures — had been present for months but were not acted upon. There was no real-time monitoring, no automated alert, no data trail.

Rock Guard is designed so that scenario doesn't repeat.

---

## Team Recursion

Built with ❤️ at MIT ADT University, Pune.

| Role | Area |
|---|---|
| ML & Data Science | Model training, EDA, feature engineering |
| Backend | FastAPI, model serving, data pipeline |
| Frontend | React dashboard, real-time UI |
| IoT & Hardware | ESP32, LoRa, sensor integration design |
| Research & Documentation | Geotechnical analysis, cost modelling |

---

## Roadmap

- [ ] Connect real ESP32 hardware nodes to the API
- [ ] Integrate Gemini API for localised survival tips in Hindi/regional languages
- [ ] Add SMS/push notification delivery via Twilio or Firebase
- [ ] PostgreSQL / TimescaleDB for persistent prediction history
- [ ] Automated model retraining pipeline (feedback loop)
- [ ] DGMS TARP (Trigger Action Response Plan) integration
- [ ] Mobile app for field workers

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- **DGMS (Directorate General of Mines Safety)** — for the regulatory framework and technical circulars on slope monitoring
- **CSIR-CIMFR** — for published research on slope failure in Indian open-pit mines
- **Smart India Hackathon 2025** — for the problem statement and platform

---

*"The goal is not to respond faster after a rockfall. The goal is to make sure it never happens."*