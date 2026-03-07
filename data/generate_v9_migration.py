#!/usr/bin/env python3
"""Generate V9 Flyway migration SQL from CSV data files."""

import csv
import os

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT = os.path.join(DATA_DIR, '..', 'backend', 'src', 'main', 'resources', 'db', 'migration', 'V9__seed_synthetic_data.sql')

ADMIN_HASH = "$2b$12$w2onbXUhHDjen/E7GsuWyeTrGsuu4YFh0JhZ/vR74jsXGoOx4AklW"  # Admin@123
USER_HASH  = "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoqkMYKOb3tECLbuGHPHiFm12kf5GNiC"  # Test@1234

def escape(val):
    if val is None or val == '':
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

def read_csv(name):
    rows = []
    with open(os.path.join(DATA_DIR, name), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def main():
    lines = []
    lines.append("-- V9__seed_synthetic_data.sql")
    lines.append("-- Auto-generated from CSV data files. Seeds all synthetic data.")
    lines.append("")
    
    # 1) Delete existing data respecting FK order
    lines.append("-- Clear existing data")
    tables_to_clear = [
        'scholarship_applications', 'scholarships',
        'alerts', 'ml_model_versions',
        'merit_scores', 'merit_calculation_batches', 'merit_config',
        'audit_logs', 'verification_queue',
        'certificates', 'activities', 'attendance_records', 'academic_records',
        'bulk_uploads', 'students', 'users', 'institutions'
    ]
    for t in tables_to_clear:
        lines.append(f"DELETE FROM {t};")
    lines.append("")

    # 2) Reset sequences
    lines.append("-- Reset sequences")
    seq_map = {
        'institutions': 'institutions_id_seq',
        'users': 'users_id_seq',
        'students': 'students_id_seq',
        'academic_records': 'academic_records_id_seq',
        'attendance_records': 'attendance_records_id_seq',
        'activities': 'activities_id_seq',
        'certificates': 'certificates_id_seq',
        'bulk_uploads': 'bulk_uploads_id_seq',
        'verification_queue': 'verification_queue_id_seq',
        'audit_logs': 'audit_logs_id_seq',
        'scholarships': 'scholarships_id_seq',
        'scholarship_applications': 'scholarship_applications_id_seq',
        'merit_config': 'merit_config_id_seq',
        'merit_calculation_batches': 'merit_calculation_batches_id_seq',
        'merit_scores': 'merit_scores_id_seq',
        'ml_model_versions': 'ml_model_versions_id_seq',
        'alerts': 'alerts_id_seq',
    }
    for seq in seq_map.values():
        lines.append(f"ALTER SEQUENCE {seq} RESTART WITH 1;")
    lines.append("")

    # 3) Institutions
    institutions = read_csv('institutions.csv')
    lines.append(f"-- Institutions ({len(institutions)} rows)")
    lines.append("INSERT INTO institutions (name, code, type, board, district, state, address, contact_email, contact_phone) VALUES")
    inst_rows = []
    for i in institutions:
        inst_rows.append(f"({escape(i['name'])}, {escape(i['code'])}, {escape(i['type'])}, {escape(i['board'])}, {escape(i['district'])}, {escape(i['state'])}, {escape(i['address'])}, {escape(i['contact_email'])}, {escape(i['contact_phone'])})")
    lines.append(",\n".join(inst_rows) + ";")
    lines.append("")

    # 4) Admin user first
    lines.append("-- System admin user (Admin@123)")
    lines.append(f"INSERT INTO users (email, password_hash, first_name, last_name, role, status, institution_id, phone) VALUES")
    lines.append(f"({escape('admin@meritquest.dev')}, {escape(ADMIN_HASH)}, {escape('System')}, {escape('Admin')}, 'SYSTEM_ADMIN', 'ACTIVE', 1, NULL);")
    lines.append("")

    # 5) Users from CSV
    users = read_csv('users.csv')
    lines.append(f"-- Users ({len(users)} rows, password: Test@1234)")
    lines.append("INSERT INTO users (email, password_hash, first_name, last_name, role, status, institution_id, phone) VALUES")
    u_rows = []
    for u in users:
        inst_id = u.get('institution_id', '')
        inst_val = inst_id if inst_id else 'NULL'
        u_rows.append(f"({escape(u['email'])}, {escape(USER_HASH)}, {escape(u['first_name'])}, {escape(u['last_name'])}, {escape(u['role'])}, {escape(u['status'])}, {inst_val}, {escape(u['phone'])})")
    lines.append(",\n".join(u_rows) + ";")
    lines.append("")

    # 6) Students
    students = read_csv('students.csv')
    lines.append(f"-- Students ({len(students)} rows)")
    # Batch in groups of 100 for performance
    batch_size = 100
    for batch_start in range(0, len(students), batch_size):
        batch = students[batch_start:batch_start+batch_size]
        lines.append("INSERT INTO students (enrollment_number, first_name, last_name, date_of_birth, gender, grade, section, guardian_name, guardian_phone, guardian_email, address, institution_id) VALUES")
        s_rows = []
        for s in batch:
            s_rows.append(f"({escape(s['enrollment_number'])}, {escape(s['first_name'])}, {escape(s['last_name'])}, {escape(s['date_of_birth'])}, {escape(s['gender'])}, {escape(s['grade'])}, {escape(s['section'])}, {escape(s['guardian_name'])}, {escape(s['guardian_phone'])}, {escape(s['guardian_email'])}, {escape(s['address'])}, {s['institution_id']})")
        lines.append(",\n".join(s_rows) + ";")
    lines.append("")

    # 7) Academic records
    records = read_csv('academic_records.csv')
    lines.append(f"-- Academic records ({len(records)} rows)")
    for batch_start in range(0, len(records), batch_size):
        batch = records[batch_start:batch_start+batch_size]
        lines.append("INSERT INTO academic_records (student_id, subject, exam_type, marks_obtained, max_marks, grade, academic_year, semester, institution_id) VALUES")
        r_rows = []
        for r in batch:
            r_rows.append(f"({r['student_id']}, {escape(r['subject'])}, {escape(r['exam_type'])}, {r['marks_obtained']}, {r['max_marks']}, {escape(r['grade'])}, {escape(r['academic_year'])}, {escape(r['semester'])}, {r['institution_id']})")
        lines.append(",\n".join(r_rows) + ";")
    lines.append("")

    # 8) Attendance records
    att = read_csv('attendance_records.csv')
    lines.append(f"-- Attendance records ({len(att)} rows)")
    for batch_start in range(0, len(att), batch_size):
        batch = att[batch_start:batch_start+batch_size]
        lines.append("INSERT INTO attendance_records (student_id, month, academic_year, total_days, days_present, days_absent, institution_id) VALUES")
        a_rows = []
        for a in batch:
            a_rows.append(f"({a['student_id']}, {escape(a['month'])}, {escape(a['academic_year'])}, {a['total_days']}, {a['days_present']}, {a['days_absent']}, {a['institution_id']})")
        lines.append(",\n".join(a_rows) + ";")
    lines.append("")

    # 9) Activities
    acts = read_csv('activities.csv')
    lines.append(f"-- Activities ({len(acts)} rows)")
    for batch_start in range(0, len(acts), batch_size):
        batch = acts[batch_start:batch_start+batch_size]
        lines.append("INSERT INTO activities (student_id, title, category, description, achievement, event_date, institution_id) VALUES")
        act_rows = []
        for a in batch:
            act_rows.append(f"({a['student_id']}, {escape(a['title'])}, {escape(a['category'])}, {escape(a['description'])}, {escape(a['achievement'])}, {escape(a['event_date'])}, {a['institution_id']})")
        lines.append(",\n".join(act_rows) + ";")
    lines.append("")

    # 10) Scholarships (posted_by = 1 = admin)
    schol = read_csv('scholarships.csv')
    lines.append(f"-- Scholarships ({len(schol)} rows)")
    lines.append("INSERT INTO scholarships (title, organization_name, organization_type, amount, currency, total_slots, application_deadline, status, posted_by) VALUES")
    sc_rows = []
    for s in schol:
        sc_rows.append(f"({escape(s['title'])}, {escape(s['organization_name'])}, {escape(s['organization_type'])}, {s['amount']}, {escape(s['currency'])}, {s['total_slots']}, {escape(s['application_deadline'])}, {escape(s['status'])}, 1)")
    lines.append(",\n".join(sc_rows) + ";")
    lines.append("")

    # Write output
    sql = "\n".join(lines)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"Generated V9 migration: {OUTPUT}")
    print(f"  Institutions: {len(institutions)}")
    print(f"  Users: {len(users)} + 1 admin = {len(users)+1}")
    print(f"  Students: {len(students)}")
    print(f"  Academic records: {len(records)}")
    print(f"  Attendance records: {len(att)}")
    print(f"  Activities: {len(acts)}")
    print(f"  Scholarships: {len(schol)}")

if __name__ == '__main__':
    main()
