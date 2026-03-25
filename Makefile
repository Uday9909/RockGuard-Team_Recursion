SHELL := /bin/bash

.PHONY: train api dashboard dev

train:
	cd Rockfall-Prediction-Model && python3 api/train_model.py

api:
	cd Rockfall-Prediction-Model && uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

dashboard:
	cd terrain-alert-ai && npm run dev -- --host 0.0.0.0 --port 5173

dev:
	( cd Rockfall-Prediction-Model && uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 ) & \
	( cd terrain-alert-ai && npm run dev -- --host 0.0.0.0 --port 5173 ) & \
	wait

