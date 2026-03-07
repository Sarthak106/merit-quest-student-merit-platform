import csv
from collections import Counter

# Students
s = list(csv.DictReader(open('students.csv', encoding='utf-8')))
print('=== STUDENTS ===')
print('Total:', len(s))
genders = Counter(r['gender'] for r in s)
print('By gender:', dict(genders))
grades = Counter(r['grade'] for r in s)
print('By grade:', dict(sorted(grades.items())))
inst_dist = Counter(r['institution_id'] for r in s)
print('Students/inst min-max:', min(inst_dist.values()), '-', max(inst_dist.values()))
print('Enrollment samples:', [r['enrollment_number'] for r in s[:3]])
print()

# Academic records
a = list(csv.DictReader(open('academic_records.csv', encoding='utf-8')))
print('=== ACADEMIC RECORDS ===')
print('Total:', len(a))
subjects = set(r['subject'] for r in a)
print('Subjects:', subjects)
exams = set(r['exam_type'] for r in a)
print('Exam types:', exams)
years = Counter(r['academic_year'] for r in a)
print('By year:', dict(years))
top = [float(r['marks_obtained']) for r in a if int(r['student_id']) <= 50]
bot = [float(r['marks_obtained']) for r in a if int(r['student_id']) > 450]
print('Top (id 1-50) avg:', round(sum(top)/len(top), 1))
print('At-risk (id 451+) avg:', round(sum(bot)/len(bot), 1))
print()

# Attendance
att = list(csv.DictReader(open('attendance_records.csv', encoding='utf-8')))
print('=== ATTENDANCE ===')
print('Total:', len(att))
months = set(r['month'] for r in att)
print('Months:', len(months), months)
top_att = [int(r['days_present'])/int(r['total_days']) for r in att if int(r['student_id']) <= 50]
bot_att = [int(r['days_present'])/int(r['total_days']) for r in att if int(r['student_id']) > 450]
print('Top avg attendance:', round(sum(top_att)/len(top_att)*100, 1), '%')
print('At-risk avg attendance:', round(sum(bot_att)/len(bot_att)*100, 1), '%')
ok = all(int(r['days_present']) + int(r['days_absent']) == int(r['total_days']) for r in att)
print('days_present + days_absent == total_days:', ok)
print()

# Activities
act = list(csv.DictReader(open('activities.csv', encoding='utf-8')))
print('=== ACTIVITIES ===')
print('Total:', len(act))
cats = Counter(r['category'] for r in act)
print('By category:', dict(cats))
sids = set(int(r['student_id']) for r in act)
print('Unique students:', len(sids))
print('Max student_id:', max(sids))
has_bottom = any(sid > 350 for sid in sids)
print('Any student > 350 (should be False):', has_bottom)
print()

# Scholarships
sch = list(csv.DictReader(open('scholarships.csv', encoding='utf-8')))
print('=== SCHOLARSHIPS ===')
print('Total:', len(sch))
org = Counter(r['organization_type'] for r in sch)
print('By org type:', dict(org))
print('All INR:', all(r['currency'] == 'INR' for r in sch))
print('All ACTIVE:', all(r['status'] == 'ACTIVE' for r in sch))
amts = [int(r['amount']) for r in sch]
print('Amount range:', min(amts), '-', max(amts))
