"""Model evaluation metrics: precision, recall, F1, AUC-ROC."""

import numpy as np
from sklearn.metrics import (
    precision_score, recall_score, f1_score, accuracy_score, roc_auc_score,
    confusion_matrix,
)


def evaluate_model(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: np.ndarray | None = None,
) -> dict:
    """Calculate comprehensive classification metrics."""
    metrics = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
    }

    if y_proba is not None and len(np.unique(y_true)) > 1:
        try:
            metrics["auc_roc"] = round(float(roc_auc_score(y_true, y_proba)), 4)
        except ValueError:
            metrics["auc_roc"] = None
    else:
        metrics["auc_roc"] = None

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    metrics["confusion_matrix"] = {
        "true_negative": int(cm[0][0]),
        "false_positive": int(cm[0][1]),
        "false_negative": int(cm[1][0]),
        "true_positive": int(cm[1][1]),
    }

    metrics["total_samples"] = int(len(y_true))
    metrics["positive_samples"] = int(np.sum(y_true == 1))
    metrics["negative_samples"] = int(np.sum(y_true == 0))

    return metrics
