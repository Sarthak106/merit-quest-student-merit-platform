"""FastAPI ML microservice: dropout risk prediction + model management."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    PredictionRequest, BatchPredictionRequest, PredictionResponse,
    RiskPrediction, TrainRequest, TrainResponse,
    ModelVersionResponse, HealthResponse,
)
from app.pipeline.data_loader import load_student_features, load_student_features_by_id
from app.pipeline.trainer import train_pipeline
from app.pipeline.registry import save_model_version, load_model_version, list_model_versions
from app.pipeline.preprocessor import create_dropout_labels

logger = logging.getLogger("ml-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ML Service starting up")
    yield
    logger.info("ML Service shutting down")


app = FastAPI(
    title="MeritQuest ML Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _compute_risk_level(score: float) -> str:
    if score >= 0.8:
        return "CRITICAL"
    if score >= 0.6:
        return "HIGH"
    if score >= 0.4:
        return "MEDIUM"
    return "LOW"


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="UP", service="ml-service", version="1.0.0")


@app.post("/predict/dropout-risk", response_model=PredictionResponse)
async def predict_dropout_risk(request: Request):
    """Predict dropout risk for a single student."""
    import json
    body = await request.body()
    try:
        data = json.loads(body) if body else {}
    except Exception:
        data = {}
    student_id = data.get("student_id") or data.get("studentId")
    if not student_id:
        raise HTTPException(status_code=400, detail="student_id is required")

    artifacts = load_model_version("random_forest")
    if not artifacts:
        raise HTTPException(status_code=404, detail="No trained model found. Train a model first.")

    model = artifacts["model"]
    preprocessor = artifacts["preprocessor"]

    df = load_student_features_by_id(int(student_id))
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found or has no data")

    X = preprocessor.transform(df)
    probas = model.predict_proba(X)[:, 1]

    feature_names = preprocessor.get_feature_names()
    importances = dict(zip(feature_names, model.feature_importances_.tolist()))

    # Get model version
    versions = list_model_versions("random_forest")
    model_version = versions[0]["version"] if versions else 0

    predictions = []
    for i, row in df.iterrows():
        score = float(probas[0] if len(probas) == 1 else probas[list(df.index).index(i)])
        predictions.append(RiskPrediction(
            student_id=int(row["student_id"]),
            risk_score=round(score, 4),
            risk_level=_compute_risk_level(score),
            feature_importances=importances,
            model_type="random_forest",
            model_version=model_version,
        ))

    return PredictionResponse(
        predictions=predictions,
        model_type="random_forest",
        model_version=model_version,
    )


@app.post("/predict/dropout-risk/batch", response_model=PredictionResponse)
async def predict_dropout_risk_batch(request: Request):
    """Predict dropout risk for all students (optionally filtered by institution)."""
    import json
    body = await request.body()
    try:
        data = json.loads(body) if body else {}
    except Exception:
        data = {}
    institution_id = data.get("institution_id") or data.get("institutionId")

    artifacts = load_model_version("random_forest")
    if not artifacts:
        raise HTTPException(status_code=404, detail="No trained model found. Train a model first.")

    model = artifacts["model"]
    preprocessor = artifacts["preprocessor"]

    df = load_student_features()
    if institution_id:
        df = df[df["institution_id"] == int(institution_id)]

    if df.empty:
        raise HTTPException(status_code=404, detail="No student data found")

    X = preprocessor.transform(df)
    probas = model.predict_proba(X)[:, 1]

    feature_names = preprocessor.get_feature_names()
    importances = dict(zip(feature_names, model.feature_importances_.tolist()))

    versions = list_model_versions("random_forest")
    model_version = versions[0]["version"] if versions else 0

    predictions = []
    for idx, (i, row) in enumerate(df.iterrows()):
        score = float(probas[idx])
        predictions.append(RiskPrediction(
            student_id=int(row["student_id"]),
            risk_score=round(score, 4),
            risk_level=_compute_risk_level(score),
            feature_importances=importances,
            model_type="random_forest",
            model_version=model_version,
        ))

    return PredictionResponse(
        predictions=predictions,
        model_type="random_forest",
        model_version=model_version,
    )


@app.post("/train", response_model=TrainResponse)
async def train_model(request: Request):
    """Trigger model training pipeline."""
    import json
    body = await request.body()
    try:
        data = json.loads(body) if body else {}
    except Exception:
        data = {}
    model_type = data.get("model_type") or data.get("modelType") or "random_forest"
    
    df = load_student_features()
    if df.empty or len(df) < 5:
        raise HTTPException(status_code=400, detail="Insufficient training data. Need at least 5 students with records.")

    result = train_pipeline(df, model_type)

    version_info = save_model_version(
        model=result["model"],
        preprocessor=result["preprocessor"],
        model_type=result["model_type"],
        metrics=result["metrics"],
        feature_importances=result["feature_importances"],
    )

    return TrainResponse(
        model_type=version_info["model_type"],
        version=version_info["version"],
        metrics=version_info["metrics"],
        feature_importances=version_info["feature_importances"],
        sample_count=result["sample_count"],
        positive_count=result["positive_count"],
        negative_count=result["negative_count"],
        trained_at=version_info["trained_at"],
    )


@app.get("/models", response_model=list[ModelVersionResponse])
async def get_models(model_type: str | None = None):
    """List all model versions."""
    versions = list_model_versions(model_type)
    return [ModelVersionResponse(**v) for v in versions]


@app.get("/models/{model_type}/{version}", response_model=ModelVersionResponse)
async def get_model_version(model_type: str, version: int):
    """Get details of a specific model version."""
    versions = list_model_versions(model_type)
    for v in versions:
        if v["version"] == version:
            return ModelVersionResponse(**v)
    raise HTTPException(status_code=404, detail=f"Model version {model_type} v{version} not found")
