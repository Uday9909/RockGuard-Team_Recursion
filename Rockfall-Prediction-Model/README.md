# Rockfall Prediction Backend

FastAPI + XGBoost backend for rockfall risk inference.

## Setup (uv)

```bash
cd Rockfall-Prediction-Model
uv venv
source .venv/bin/activate
uv pip install -r api/requirements.txt
```

## Train model

```bash
python api/train_model.py
```

This saves `api/model.pkl`.

## Run API

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /health`
- `POST /predict`
- `GET /simulate`
- `GET /history`

