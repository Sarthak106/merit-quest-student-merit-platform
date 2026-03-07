"""Loads training data from PostgreSQL for model building."""

import pandas as pd
from sqlalchemy import create_engine, text
from app.config import get_settings


def get_engine():
    return create_engine(get_settings().database_url)


def load_student_features() -> pd.DataFrame:
    """
    Build a feature matrix by joining students, academic_records,
    attendance_records, activities, and merit_scores.
    Returns one row per student with engineered features.
    """
    engine = get_engine()

    query = text("""
        WITH student_academics AS (
            SELECT
                ar.student_id,
                COUNT(*) AS total_records,
                AVG(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS avg_percentage,
                MIN(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS min_percentage,
                MAX(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS max_percentage,
                STDDEV(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS std_percentage,
                COUNT(DISTINCT ar.subject) AS distinct_subjects
            FROM academic_records ar
            GROUP BY ar.student_id
        ),
        student_attendance AS (
            SELECT
                atr.student_id,
                AVG(atr.days_present::float / NULLIF(atr.total_days, 0) * 100) AS avg_attendance_pct,
                MIN(atr.days_present::float / NULLIF(atr.total_days, 0) * 100) AS min_attendance_pct,
                COUNT(*) AS attendance_records,
                SUM(atr.days_absent) AS total_days_absent
            FROM attendance_records atr
            GROUP BY atr.student_id
        ),
        student_activities AS (
            SELECT
                act.student_id,
                COUNT(*) AS activity_count,
                COUNT(DISTINCT act.category) AS distinct_activity_types
            FROM activities act
            GROUP BY act.student_id
        ),
        latest_merit AS (
            SELECT DISTINCT ON (ms.student_id)
                ms.student_id,
                ms.composite_score,
                ms.academic_z_score,
                ms.attendance_z_score,
                ms.activity_z_score,
                ms.certificate_z_score,
                ms.rank_school
            FROM merit_scores ms
            ORDER BY ms.student_id, ms.created_at DESC
        )
        SELECT
            s.id AS student_id,
            s.grade,
            s.gender,
            s.active,
            i.board,
            i.district,
            COALESCE(sa.total_records, 0) AS total_academic_records,
            COALESCE(sa.avg_percentage, 0) AS avg_percentage,
            COALESCE(sa.min_percentage, 0) AS min_percentage,
            COALESCE(sa.max_percentage, 0) AS max_percentage,
            COALESCE(sa.std_percentage, 0) AS std_percentage,
            COALESCE(sa.distinct_subjects, 0) AS distinct_subjects,
            COALESCE(sat.avg_attendance_pct, 0) AS avg_attendance_pct,
            COALESCE(sat.min_attendance_pct, 0) AS min_attendance_pct,
            COALESCE(sat.attendance_records, 0) AS attendance_record_count,
            COALESCE(sat.total_days_absent, 0) AS total_days_absent,
            COALESCE(sact.activity_count, 0) AS activity_count,
            COALESCE(sact.distinct_activity_types, 0) AS distinct_activity_types,
            COALESCE(lm.composite_score, 0) AS composite_score,
            COALESCE(lm.academic_z_score, 0) AS academic_z_score,
            COALESCE(lm.attendance_z_score, 0) AS attendance_z_score,
            COALESCE(lm.activity_z_score, 0) AS activity_z_score,
            COALESCE(lm.certificate_z_score, 0) AS certificate_z_score,
            COALESCE(lm.rank_school, 0) AS rank_school,
            s.verification_status
        FROM students s
        JOIN institutions i ON s.institution_id = i.id
        LEFT JOIN student_academics sa ON s.id = sa.student_id
        LEFT JOIN student_attendance sat ON s.id = sat.student_id
        LEFT JOIN student_activities sact ON s.id = sact.student_id
        LEFT JOIN latest_merit lm ON s.id = lm.student_id
        WHERE s.verification_status = 'APPROVED'
    """)

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)

    return df


def load_student_features_by_id(student_id: int) -> pd.DataFrame:
    """Load features for a single student (for prediction)."""
    engine = get_engine()

    query = text("""
        WITH student_academics AS (
            SELECT
                ar.student_id,
                COUNT(*) AS total_records,
                AVG(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS avg_percentage,
                MIN(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS min_percentage,
                MAX(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS max_percentage,
                STDDEV(ar.marks_obtained / NULLIF(ar.max_marks, 0) * 100) AS std_percentage,
                COUNT(DISTINCT ar.subject) AS distinct_subjects
            FROM academic_records ar
            WHERE ar.student_id = :sid
            GROUP BY ar.student_id
        ),
        student_attendance AS (
            SELECT
                atr.student_id,
                AVG(atr.days_present::float / NULLIF(atr.total_days, 0) * 100) AS avg_attendance_pct,
                MIN(atr.days_present::float / NULLIF(atr.total_days, 0) * 100) AS min_attendance_pct,
                COUNT(*) AS attendance_records,
                SUM(atr.days_absent) AS total_days_absent
            FROM attendance_records atr
            WHERE atr.student_id = :sid
            GROUP BY atr.student_id
        ),
        student_activities AS (
            SELECT
                act.student_id,
                COUNT(*) AS activity_count,
                COUNT(DISTINCT act.category) AS distinct_activity_types
            FROM activities act
            WHERE act.student_id = :sid
            GROUP BY act.student_id
        ),
        latest_merit AS (
            SELECT DISTINCT ON (ms.student_id)
                ms.student_id,
                ms.composite_score,
                ms.academic_z_score,
                ms.attendance_z_score,
                ms.activity_z_score,
                ms.certificate_z_score,
                ms.rank_school
            FROM merit_scores ms
            WHERE ms.student_id = :sid
            ORDER BY ms.student_id, ms.created_at DESC
        )
        SELECT
            s.id AS student_id,
            s.grade,
            s.gender,
            s.active,
            i.board,
            i.district,
            COALESCE(sa.total_records, 0) AS total_academic_records,
            COALESCE(sa.avg_percentage, 0) AS avg_percentage,
            COALESCE(sa.min_percentage, 0) AS min_percentage,
            COALESCE(sa.max_percentage, 0) AS max_percentage,
            COALESCE(sa.std_percentage, 0) AS std_percentage,
            COALESCE(sa.distinct_subjects, 0) AS distinct_subjects,
            COALESCE(sat.avg_attendance_pct, 0) AS avg_attendance_pct,
            COALESCE(sat.min_attendance_pct, 0) AS min_attendance_pct,
            COALESCE(sat.attendance_records, 0) AS attendance_record_count,
            COALESCE(sat.total_days_absent, 0) AS total_days_absent,
            COALESCE(sact.activity_count, 0) AS activity_count,
            COALESCE(sact.distinct_activity_types, 0) AS distinct_activity_types,
            COALESCE(lm.composite_score, 0) AS composite_score,
            COALESCE(lm.academic_z_score, 0) AS academic_z_score,
            COALESCE(lm.attendance_z_score, 0) AS attendance_z_score,
            COALESCE(lm.activity_z_score, 0) AS activity_z_score,
            COALESCE(lm.certificate_z_score, 0) AS certificate_z_score,
            COALESCE(lm.rank_school, 0) AS rank_school,
            s.verification_status
        FROM students s
        JOIN institutions i ON s.institution_id = i.id
        LEFT JOIN student_academics sa ON s.id = sa.student_id
        LEFT JOIN student_attendance sat ON s.id = sat.student_id
        LEFT JOIN student_activities sact ON s.id = sact.student_id
        LEFT JOIN latest_merit lm ON s.id = lm.student_id
        WHERE s.id = :sid
    """)

    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"sid": student_id})

    return df
