"""Train and persist the rockfall XGBoost classifier."""

from __future__ import annotations

from pathlib import Path
from typing import Final

import joblib
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier

DROP_COLUMNS: Final[list[str]] = ["Occurred", "Susceptibility_Score", "Impact_Level"]
TARGET_COLUMN: Final[str] = "Occurred"
CATEGORICAL_COLUMNS: Final[list[str]] = ["Rock_Type", "Soil_Type", "Lithology", "Vegetation", "Land_Cover", "Season"]
MODEL_PATH: Final[Path] = Path(__file__).resolve().parent / "model.pkl"
DATA_CANDIDATES: Final[list[Path]] = [
    Path(__file__).resolve().parent / "data" / "Rockfall.csv",
    Path(__file__).resolve().parent.parent / "data" / "Rockfall.csv",
]


def load_dataset(path: Path) -> pd.DataFrame:
    """Load dataset from CSV."""
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}")
    return pd.read_csv(path)


def resolve_data_path() -> Path:
    """Resolve Rockfall.csv path across local/dev/container layouts."""
    for candidate in DATA_CANDIDATES:
        if candidate.exists():
            return candidate
    checked = ", ".join(str(path) for path in DATA_CANDIDATES)
    raise FileNotFoundError(f"Rockfall.csv not found. Checked: {checked}")


def build_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Split source dataframe into features and target."""
    features = df.drop(columns=DROP_COLUMNS)
    target = df[TARGET_COLUMN]
    return features, target


def build_pipeline(categorical: list[str], numerical: list[str]) -> Pipeline:
    """Create preprocessing + XGBoost training pipeline."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
            ("num", "passthrough", numerical),
        ]
    )

    classifier = XGBClassifier(
        n_estimators=250,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("smote", SMOTE(random_state=42)),
            ("classifier", classifier),
        ]
    )


def print_metrics(y_true: pd.Series, y_pred: pd.Series) -> None:
    """Print training metrics."""
    accuracy = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1: {f1:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")


def train_model() -> Path:
    """Train model from dataset and save as pickle."""
    dataframe = load_dataset(resolve_data_path())
    features, target = build_features(dataframe)

    categorical = [col for col in CATEGORICAL_COLUMNS if col in features.columns]
    numerical = [col for col in features.columns if col not in categorical]

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=0.2,
        stratify=target,
        random_state=42,
    )

    pipeline = build_pipeline(categorical, numerical)
    pipeline.fit(x_train, y_train)

    y_pred = pipeline.predict(x_test)
    print_metrics(y_test, y_pred)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")
    return MODEL_PATH


if __name__ == "__main__":
    train_model()
