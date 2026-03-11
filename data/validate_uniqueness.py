import csv, os
from collections import Counter

data_dir = os.path.dirname(os.path.abspath(__file__))

checks = {
    'institutions.csv': ['name', 'code', 'contact_email'],
    'users.csv': ['email'],
    'students.csv': ['enrollment_number'],
    'academic_records.csv': ['student_id'],       # not unique per row, but check combos
    'attendance_records.csv': ['student_id'],      # not unique per row, but check combos
    'activities.csv': ['student_id'],              # not unique per row
    'scholarships.csv': ['title'],
}

# Composite uniqueness checks (column combos that should be unique)
composite_checks = {
    'academic_records.csv': [('student_id', 'subject', 'exam_type', 'academic_year', 'semester')],
    'attendance_records.csv': [('student_id', 'month', 'academic_year')],
    'activities.csv': [('student_id', 'title', 'event_date')],
}

all_ok = True
for fname, cols in checks.items():
    fpath = os.path.join(data_dir, fname)
    if not os.path.exists(fpath):
        print(f'MISSING: {fname}')
        all_ok = False
        continue
    with open(fpath, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    total = len(rows)
    print(f'\n=== {fname} ({total} rows) ===')
    for col in cols:
        vals = [r[col] for r in rows]
        unique = len(set(vals))
        dupes = total - unique
        if dupes == 0:
            print(f'  {col}: ALL UNIQUE ({unique})')
        else:
            # For foreign-key columns like student_id, duplicates are expected
            if col in ('student_id',):
                print(f'  {col}: {unique} unique values (expected: multiple rows per student)')
            else:
                all_ok = False
                print(f'  {col}: DUPLICATES FOUND! {unique} unique out of {total} ({dupes} dupes)')
                c = Counter(vals)
                for v, cnt in c.most_common(5):
                    if cnt > 1:
                        print(f'    "{v}" appears {cnt} times')

    # Composite uniqueness checks
    if fname in composite_checks:
        for combo in composite_checks[fname]:
            keys = [tuple(r[c] for c in combo) for r in rows]
            unique = len(set(keys))
            dupes = total - unique
            combo_name = ' + '.join(combo)
            if dupes == 0:
                print(f'  COMPOSITE [{combo_name}]: ALL UNIQUE ({unique})')
            else:
                all_ok = False
                print(f'  COMPOSITE [{combo_name}]: DUPLICATES! {unique} unique out of {total} ({dupes} dupes)')
                c = Counter(keys)
                for v, cnt in c.most_common(3):
                    if cnt > 1:
                        print(f'    {v} appears {cnt} times')

print('\n' + ('=' * 50))
if all_ok:
    print('RESULT: ALL DATASETS PASS - No duplicates found!')
else:
    print('RESULT: ISSUES FOUND - See above for details.')
