"""FastAPI bridge for rockfall risk prediction."""

from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from random import choice, randint, uniform
from typing import Any, Final

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from imblearn.pipeline import Pipeline
from xgboost import XGBClassifier

try:
    from api.train_model import MODEL_PATH, train_model
except ModuleNotFoundError:
    from train_model import MODEL_PATH, train_model

FEATURE_COLUMNS: Final[list[str]] = [
    "Slope_deg",
    "Elevation_m",
    "Rainfall_mm",
    "Prior_Events",
    "Distance_to_fault_km",
    "Fracture_Density",
    "Rock_Hardness",
    "Temperature_C",
    "Humidity_percent",
    "Wind_speed_kmh",
    "Month",
    "Season",
]
STATIC_FEATURES: Final[dict[str, Any]] = {
    "Latitude": 26.2,
    "Longitude": 82.8,
    "Aspect_deg": 135.0,
    "Rock_Type": "Limestone",
    "Soil_Type": "Clay",
    "Lithology": "Sedimentary",
    "Vegetation": "Moderate",
    "Land_Cover": "Forest",
    "NDVI": 0.45,
    "Snow_mm": 0.0,
    "Day": 15,
    "Rock_Size_cm": 85.0,
    "Rock_Volume_m3": 2.8,
    "Rock_Velocity_mps": 11.0,
}
MODEL_VERSION: Final[str] = "1.0"


class SensorInput(BaseModel):
    """Incoming sensor payload."""

    Slope_deg: float = Field(ge=0, le=90)
    Elevation_m: float = Field(ge=0, le=9000)
    Rainfall_mm: float = Field(ge=0, le=400)
    Prior_Events: int = Field(ge=0, le=100)
    Distance_to_fault_km: float = Field(ge=0, le=50)
    Fracture_Density: float = Field(ge=0, le=1.5)
    Rock_Hardness: int = Field(ge=1, le=10)
    Temperature_C: float = Field(ge=-30, le=60)
    Humidity_percent: float = Field(ge=0, le=100)
    Wind_speed_kmh: float = Field(ge=0, le=200)
    Month: int = Field(ge=1, le=12)
    Season: str


class TopFactor(BaseModel):
    """Feature attribution detail."""

    feature: str
    value: float | int | str
    impact: str


class PredictionResponse(BaseModel):
    """Prediction response contract."""

    risk_score: float
    risk_level: str
    top_factors: list[TopFactor]
    recommendation: str
    timestamp: str


class SimulationResponse(PredictionResponse):
    """Simulation response with generated sensor snapshot."""

    sensor_values: SensorInput


def classify_risk(score: float) -> str:
    """Map score to risk category."""
    if score < 0.3:
        return "LOW"
    if score <= 0.6:
        return "MEDIUM"
    return "HIGH"


def recommendation_for(level: str) -> str:
    """Generate guidance from risk level."""
    if level == "LOW":
        return "Continue routine monitoring."
    if level == "MEDIUM":
        return "Increase patrols and prepare mitigation teams."
    return "Restrict access to Zone B. Monitor continuously."


def score_to_impact(score: float) -> str:
    """Convert normalized importance to qualitative impact."""
    if score >= 0.66:
        return "high"
    if score >= 0.33:
        return "medium"
    return "low"


def extract_feature_names(model: Pipeline) -> list[str]:
    """Get transformed feature names from preprocessor."""
    preprocessor = model.named_steps["preprocessor"]
    return list(preprocessor.get_feature_names_out())


def top_factors_for(model: Pipeline, sensor: SensorInput) -> list[TopFactor]:
    """Return top 3 contributing input factors based on global model importances."""
    classifier = model.named_steps["classifier"]
    if not isinstance(classifier, XGBClassifier):
        raise TypeError("Model classifier must be XGBClassifier.")
    importances = classifier.feature_importances_
    feature_names = extract_feature_names(model)

    sensor_dict = sensor.model_dump()
    known_columns = list({*FEATURE_COLUMNS, *STATIC_FEATURES.keys()})
    aggregated: dict[str, float] = {}

    for transformed_name, importance in zip(feature_names, importances):
        feature_name = transformed_name
        if transformed_name.startswith("num__"):
            feature_name = transformed_name.removeprefix("num__")
        elif transformed_name.startswith("cat__"):
            encoded_name = transformed_name.removeprefix("cat__")
            matches = [
                candidate
                for candidate in known_columns
                if encoded_name == candidate or encoded_name.startswith(f"{candidate}_")
            ]
            feature_name = max(matches, key=len) if matches else encoded_name

        aggregated[feature_name] = aggregated.get(feature_name, 0.0) + float(importance)

    paired = sorted(
        ((name, score) for name, score in aggregated.items() if name in sensor_dict),
        key=lambda item: item[1],
        reverse=True,
    )
    selected: list[TopFactor] = []

    for feature_name, score in paired:
        selected.append(
            TopFactor(
                feature=feature_name,
                value=sensor_dict[feature_name],
                impact=score_to_impact(score),
            )
        )
        if len(selected) == 3:
            break

    while len(selected) < 3:
        fallback = FEATURE_COLUMNS[len(selected)]
        selected.append(TopFactor(feature=fallback, value=sensor_dict[fallback], impact="medium"))

    return selected


def ensure_model() -> Pipeline:
    """Load model from disk or train one if missing."""
    model_file = Path(MODEL_PATH)
    if not model_file.exists():
        train_model()
    model = joblib.load(model_file)
    if not isinstance(model, Pipeline):
        raise TypeError("Loaded model is not a scikit-learn Pipeline")
    return model


def build_record(model: Pipeline, sensor: SensorInput) -> PredictionResponse:
    """Generate prediction response from incoming sensor data."""
    payload = {**STATIC_FEATURES, **sensor.model_dump()}
    frame = pd.DataFrame([payload])
    probability = float(model.predict_proba(frame)[0][1])
    rounded_score = round(probability, 2)
    risk_level = classify_risk(rounded_score)
    return PredictionResponse(
        risk_score=rounded_score,
        risk_level=risk_level,
        top_factors=top_factors_for(model, sensor),
        recommendation=recommendation_for(risk_level),
        timestamp=datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z"),
    )


def generate_sensor_reading() -> SensorInput:
    """Generate realistic random sensor values for demo mode."""
    month = randint(1, 12)
    if month in {6, 7, 8, 9}:
        season = "Monsoon"
    elif month in {3, 4, 5}:
        season = "Summer"
    elif month in {10, 11}:
        season = "Post-Monsoon"
    else:
        season = choice(["Winter", "Dry"])

    return SensorInput(
        Slope_deg=round(uniform(12.0, 48.0), 1),
        Elevation_m=round(uniform(180.0, 1250.0), 1),
        Rainfall_mm=round(uniform(0.0, 160.0), 1),
        Prior_Events=randint(0, 7),
        Distance_to_fault_km=round(uniform(0.2, 8.0), 2),
        Fracture_Density=round(uniform(0.2, 1.1), 2),
        Rock_Hardness=randint(3, 9),
        Temperature_C=round(uniform(8.0, 40.0), 1),
        Humidity_percent=round(uniform(25.0, 95.0), 1),
        Wind_speed_kmh=round(uniform(2.0, 45.0), 1),
        Month=month,
        Season=season,
    )


app = FastAPI(title="Rockfall Risk API", version=MODEL_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model: Pipeline = ensure_model()
_history: deque[PredictionResponse] = deque(maxlen=20)


@app.get("/health")
def health() -> dict[str, str]:
    """Service health check."""
    return {"status": "ok", "model": "XGBoost", "version": MODEL_VERSION}


@app.post("/predict", response_model=PredictionResponse)
def predict(sensor: SensorInput) -> PredictionResponse:
    """Run model inference for sensor payload."""
    result = build_record(_model, sensor)
    _history.appendleft(result)
    return result


@app.get("/simulate", response_model=SimulationResponse)
def simulate() -> SimulationResponse:
    """Generate synthetic sensor reading and prediction."""
    sensor = generate_sensor_reading()
    result = build_record(_model, sensor)
    _history.appendleft(result)
    return SimulationResponse(**result.model_dump(), sensor_values=sensor)


@app.get("/history", response_model=list[PredictionResponse])
def history() -> list[PredictionResponse]:
    """Return latest in-memory prediction records."""
    return list(_history)
