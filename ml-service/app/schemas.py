"""Pydantic request/response schemas for ML service API."""

from pydantic import BaseModel
from datetime import datetime


class PredictionRequest(BaseModel):
    student_id: int


class BatchPredictionRequest(BaseModel):
    institution_id: int | None = None


class RiskPrediction(BaseModel):
    student_id: int
    risk_score: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    feature_importances: dict[str, float]
    model_type: str
    model_version: int


class PredictionResponse(BaseModel):
    predictions: list[RiskPrediction]
    model_type: str
    model_version: int


class TrainRequest(BaseModel):
    model_type: str = "random_forest"


class TrainResponse(BaseModel):
    model_type: str
    version: int
    metrics: dict
    feature_importances: dict[str, float]
    sample_count: int
    positive_count: int
    negative_count: int
    trained_at: str


class ModelVersionResponse(BaseModel):
    id: int
    model_type: str
    version: int
    file_key: str
    metrics: dict
    feature_importances: dict[str, float] | None = None
    trained_at: str | None = None


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
