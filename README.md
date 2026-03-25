# Rockfall Risk Prediction & Terrain Alert AI

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![XGBoost](https://img.shields.io/badge/Model-XGBoost-orange)

Unified AI safety system for open-pit mining that predicts rockfall risk and streams explainable alerts to a live dashboard.

## Architecture

- `Rockfall-Prediction-Model/`: ML training notebooks + FastAPI inference service
- `terrain-alert-ai/`: React + TypeScript dashboard with live polling
- Flow: sensor payload -> FastAPI/XGBoost -> risk score + top factors -> dashboard

## Key Metrics

- Model: XGBoost
- F1: 0.82
- Recall: 0.89
- Training scale: 100K samples

## Setup

### 1) Backend

```bash
cd Rockfall-Prediction-Model
uv venv
source .venv/bin/activate
uv pip install -r api/requirements.txt
```

### 2) Frontend

```bash
cd terrain-alert-ai
npm install
cp .env.example .env
```

## Run both together

From repo root:

```bash
make train
make dev
```

Then open `http://localhost:5173`.

## Docker compose

```bash
docker compose up --build
```

- API: `http://localhost:8000`
- Dashboard: `http://localhost:5173`

