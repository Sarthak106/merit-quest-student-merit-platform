"""Model registry: version, persist to MinIO, track in PostgreSQL."""

import io
import json
import joblib
from datetime import datetime, timezone

from sqlalchemy import create_engine, text
from minio import Minio

from app.config import get_settings


def _get_minio_client() -> Minio:
    settings = get_settings()
    return Minio(
        settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure,
    )


def _ensure_bucket(client: Minio, bucket: str):
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)


def save_model_version(
    model,
    preprocessor,
    model_type: str,
    metrics: dict,
    feature_importances: dict,
) -> dict:
    """Serialize model + preprocessor to MinIO and register version in DB."""
    settings = get_settings()
    engine = create_engine(settings.database_url)
    client = _get_minio_client()
    _ensure_bucket(client, settings.minio_bucket)

    # Determine version
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT COALESCE(MAX(version), 0) + 1 FROM ml_model_versions WHERE model_type = :mt"),
            {"mt": model_type},
        )
        version = result.scalar()

    # Serialize model + preprocessor together
    buffer = io.BytesIO()
    joblib.dump({"model": model, "preprocessor": preprocessor}, buffer)
    buffer.seek(0)
    file_size = buffer.getbuffer().nbytes

    file_key = f"ml-models/{model_type}/v{version}.joblib"
    client.put_object(settings.minio_bucket, file_key, buffer, file_size, content_type="application/octet-stream")

    # Insert version record
    now = datetime.now(timezone.utc)
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO ml_model_versions (model_type, version, file_key, metrics, feature_importances, trained_at, created_at)
                VALUES (:mt, :v, :fk, :metrics, :fi, :ta, :ca)
            """),
            {
                "mt": model_type,
                "v": version,
                "fk": file_key,
                "metrics": json.dumps(metrics),
                "fi": json.dumps(feature_importances),
                "ta": now,
                "ca": now,
            },
        )

    return {
        "model_type": model_type,
        "version": version,
        "file_key": file_key,
        "metrics": metrics,
        "feature_importances": feature_importances,
        "trained_at": now.isoformat(),
    }


def load_model_version(model_type: str, version: int | None = None):
    """Load a model + preprocessor from MinIO. Defaults to latest version."""
    settings = get_settings()
    engine = create_engine(settings.database_url)
    client = _get_minio_client()

    with engine.connect() as conn:
        if version:
            result = conn.execute(
                text("SELECT file_key FROM ml_model_versions WHERE model_type = :mt AND version = :v"),
                {"mt": model_type, "v": version},
            )
        else:
            result = conn.execute(
                text("SELECT file_key FROM ml_model_versions WHERE model_type = :mt ORDER BY version DESC LIMIT 1"),
                {"mt": model_type},
            )
        row = result.fetchone()

    if not row:
        return None

    response = client.get_object(settings.minio_bucket, row[0])
    buffer = io.BytesIO(response.read())
    response.close()
    response.release_conn()

    return joblib.load(buffer)


def list_model_versions(model_type: str | None = None) -> list[dict]:
    """List all registered model versions."""
    settings = get_settings()
    engine = create_engine(settings.database_url)

    if model_type:
        query = text("""
            SELECT id, model_type, version, file_key, metrics, feature_importances, trained_at
            FROM ml_model_versions WHERE model_type = :mt ORDER BY version DESC
        """)
        params = {"mt": model_type}
    else:
        query = text("""
            SELECT id, model_type, version, file_key, metrics, feature_importances, trained_at
            FROM ml_model_versions ORDER BY model_type, version DESC
        """)
        params = {}

    with engine.connect() as conn:
        result = conn.execute(query, params)
        rows = result.fetchall()

    versions = []
    for row in rows:
        metrics_val = row[4]
        fi_val = row[5]
        versions.append({
            "id": row[0],
            "model_type": row[1],
            "version": row[2],
            "file_key": row[3],
            "metrics": json.loads(metrics_val) if isinstance(metrics_val, str) else metrics_val,
            "feature_importances": json.loads(fi_val) if isinstance(fi_val, str) else fi_val,
            "trained_at": row[6].isoformat() if row[6] else None,
        })

    return versions
