"""Train dropout risk models: Random Forest, Gradient Boosting, XGBoost."""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import cross_val_predict, StratifiedKFold

from app.pipeline.preprocessor import FeaturePreprocessor, create_dropout_labels, NUMERIC_FEATURES, CATEGORICAL_FEATURES
from app.pipeline.evaluator import evaluate_model


MODEL_REGISTRY = {
    "random_forest": lambda: RandomForestClassifier(
        n_estimators=100, max_depth=8, min_samples_split=5,
        class_weight="balanced", random_state=42, n_jobs=-1,
    ),
    "gradient_boosting": lambda: GradientBoostingClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1,
        min_samples_split=5, random_state=42,
    ),
    "xgboost": lambda: XGBClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1,
        scale_pos_weight=3, eval_metric="logloss",
        random_state=42, use_label_encoder=False,
    ),
}


def train_model(
    X: np.ndarray,
    y: np.ndarray,
    model_type: str = "random_forest",
) -> tuple:
    """
    Train a model and return (trained_model, metrics_dict, feature_importances).
    Uses cross-validation for evaluation, then fits on full data.
    """
    if model_type not in MODEL_REGISTRY:
        raise ValueError(f"Unknown model type: {model_type}. Choose from {list(MODEL_REGISTRY.keys())}")

    model = MODEL_REGISTRY[model_type]()

    # Cross-validated predictions for evaluation
    cv = StratifiedKFold(n_splits=min(5, max(2, int(len(y) / 3))), shuffle=True, random_state=42)
    y_pred_cv = cross_val_predict(model, X, y, cv=cv, method="predict")
    try:
        y_proba_cv = cross_val_predict(model, X, y, cv=cv, method="predict_proba")[:, 1]
    except Exception:
        y_proba_cv = y_pred_cv.astype(float)

    metrics = evaluate_model(y, y_pred_cv, y_proba_cv)

    # Fit on full data for deployment
    model.fit(X, y)

    feature_names = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    importances = dict(zip(feature_names, model.feature_importances_.tolist()))

    return model, metrics, importances


def train_pipeline(df, model_type: str = "random_forest"):
    """Full pipeline: preprocess → label → train → return all artifacts."""
    preprocessor = FeaturePreprocessor()
    preprocessor.fit(df)
    X = preprocessor.transform(df)
    y = create_dropout_labels(df).values

    model, metrics, importances = train_model(X, y, model_type)

    return {
        "model": model,
        "preprocessor": preprocessor,
        "metrics": metrics,
        "feature_importances": importances,
        "model_type": model_type,
        "sample_count": len(df),
        "positive_count": int(y.sum()),
        "negative_count": int(len(y) - y.sum()),
    }
