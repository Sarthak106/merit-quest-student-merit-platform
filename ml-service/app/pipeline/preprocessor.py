"""Feature preprocessing: scaling, encoding, imputation."""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer


NUMERIC_FEATURES = [
    "total_academic_records", "avg_percentage", "min_percentage", "max_percentage",
    "std_percentage", "distinct_subjects", "avg_attendance_pct", "min_attendance_pct",
    "attendance_record_count", "total_days_absent", "activity_count",
    "distinct_activity_types", "composite_score", "academic_z_score",
    "attendance_z_score", "activity_z_score", "certificate_z_score", "rank_school",
]

CATEGORICAL_FEATURES = ["grade", "gender", "board"]


def create_dropout_labels(df: pd.DataFrame) -> pd.Series:
    """
    Synthesise dropout risk labels from available data.
    A student is considered at-risk if they exhibit multiple warning signals:
    - Low attendance (<75%), low academic performance (<40%),
    - No extracurricular activities, high absence count.
    Returns a binary Series: 1 = at-risk, 0 = not at-risk.
    """
    risk_score = pd.Series(0.0, index=df.index)

    risk_score += (df["avg_attendance_pct"] < 75).astype(float) * 0.30
    risk_score += (df["avg_percentage"] < 40).astype(float) * 0.25
    risk_score += (df["activity_count"] == 0).astype(float) * 0.15
    risk_score += (df["total_days_absent"] > 20).astype(float) * 0.15
    risk_score += (df["min_percentage"] < 25).astype(float) * 0.15

    return (risk_score >= 0.45).astype(int)


class FeaturePreprocessor:
    """Fit/transform pipeline for numeric + categorical features."""

    def __init__(self):
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy="median")
        self.label_encoders: dict[str, LabelEncoder] = {}
        self._fitted = False

    def fit(self, df: pd.DataFrame) -> "FeaturePreprocessor":
        numeric_df = df[NUMERIC_FEATURES].copy()
        self.imputer.fit(numeric_df)
        scaled = self.imputer.transform(numeric_df)
        self.scaler.fit(scaled)

        for col in CATEGORICAL_FEATURES:
            le = LabelEncoder()
            le.fit(df[col].astype(str).fillna("UNKNOWN"))
            self.label_encoders[col] = le

        self._fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        numeric_df = df[NUMERIC_FEATURES].copy()
        imputed = self.imputer.transform(numeric_df)
        scaled = self.scaler.transform(imputed)

        cat_arrays = []
        for col in CATEGORICAL_FEATURES:
            le = self.label_encoders[col]
            values = df[col].astype(str).fillna("UNKNOWN")
            # Handle unseen labels gracefully
            encoded = np.array([
                le.transform([v])[0] if v in le.classes_ else -1
                for v in values
            ])
            cat_arrays.append(encoded.reshape(-1, 1))

        return np.hstack([scaled] + cat_arrays)

    def get_feature_names(self) -> list[str]:
        return NUMERIC_FEATURES + CATEGORICAL_FEATURES
