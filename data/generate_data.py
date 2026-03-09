"""
Merit Quest — Synthetic Data Generator
Generates 7 CSV files with authentic Indian data for the Merit Quest platform.
All names, places, schools, and details are India-specific.
"""

import csv
import random
import os
from datetime import date, timedelta

random.seed(42)  # Reproducible

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── Indian Name Pools ───────────────────────────────────────────────────────

MALE_NAMES = [
    "Aarav", "Aditya", "Akash", "Aman", "Amit", "Ankit", "Arjun", "Arnav",
    "Aryan", "Atharv", "Chirag", "Deepak", "Dev", "Dhruv", "Gaurav", "Harsh",
    "Ishaan", "Jayesh", "Kabir", "Karan", "Krishna", "Kunal", "Lakshya",
    "Manav", "Mohan", "Neeraj", "Nikhil", "Parth", "Piyush", "Pranav",
    "Raj", "Rahul", "Ravi", "Reyansh", "Rohan", "Rushil", "Sahil", "Sai",
    "Shaurya", "Siddharth", "Suresh", "Varun", "Vedant", "Vihaan", "Vikram",
    "Vivaan", "Yash", "Ayaan", "Advait", "Rudra", "Omkar", "Tanmay", "Mihir",
    "Darsh", "Ritvik", "Aniket", "Samar", "Tejas", "Aayush", "Soham",
    "Abhinav", "Ansh", "Hardik", "Mayank", "Nakul", "Prateek", "Raghav",
    "Shivansh", "Utkarsh", "Jay", "Kartik", "Ojas", "Rehan", "Tarun",
    "Ujjwal", "Vinay", "Zayan", "Hrithik", "Krish"
]

FEMALE_NAMES = [
    "Aadhya", "Aanya", "Aarohi", "Aditi", "Amaira", "Ananya", "Anika",
    "Anjali", "Anvi", "Avni", "Bhavya", "Diya", "Divya", "Isha", "Jiya",
    "Kavya", "Khushi", "Kiara", "Kriti", "Lakshmi", "Mahi", "Mansi", "Meera",
    "Myra", "Nandini", "Navya", "Neha", "Nisha", "Pallavi", "Pari", "Pooja",
    "Priya", "Radhika", "Ridhi", "Riya", "Saanvi", "Sakshi", "Samaira",
    "Sanya", "Shreya", "Simran", "Sneha", "Suhana", "Swati", "Tanvi", "Tara",
    "Trisha", "Vaishali", "Zara", "Ritika", "Gauri", "Vanya", "Shanaya",
    "Pihu", "Mishti", "Aarna", "Mehr", "Charvi", "Jasmine", "Lavanya",
    "Mahika", "Nitya", "Ojaswi", "Paridhi", "Saisha", "Sia", "Tanya",
    "Urvi", "Vedika", "Yashvi", "Anushka", "Chhavi", "Deepika", "Eva",
    "Falguni", "Garima", "Himani", "Ira", "Jhanvi", "Kashvi"
]

LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Joshi", "Nair",
    "Pillai", "Rao", "Verma", "Iyer", "Deshmukh", "Bhat", "Mishra", "Chauhan",
    "Tiwari", "Yadav", "Pandey", "Dubey", "Mandal", "Das", "Sen", "Mukherjee",
    "Banerjee", "Chatterjee", "Ghosh", "Bose", "Kapoor", "Malhotra", "Khanna",
    "Mehra", "Kohli", "Thakur", "Saxena", "Agarwal", "Sinha", "Menon",
    "Hegde", "Kulkarni", "Naik", "Patil", "Shukla", "Trivedi", "Bhatt",
    "Deshpande", "Chowdhury", "Rathore", "Srivastava", "Rajagopal"
]

GUARDIAN_MALE_NAMES = [
    "Rajesh", "Sunil", "Anil", "Sanjay", "Vijay", "Manoj", "Ramesh", "Dinesh",
    "Ashok", "Pramod", "Vinod", "Satish", "Rakesh", "Naresh", "Suresh",
    "Mukesh", "Girish", "Harish", "Umesh", "Mahesh", "Ganesh", "Pradeep",
    "Sandeep", "Kuldeep", "Jagdish", "Devendra", "Rajendra", "Narendra",
    "Surendra", "Virendra", "Ajay", "Rajan", "Mohan", "Gopal", "Shyam",
    "Balram", "Omprakash", "Ravishankar", "Yogesh", "Kamlesh"
]

GUARDIAN_FEMALE_NAMES = [
    "Sunita", "Anita", "Kavita", "Savita", "Mamta", "Seema", "Reema",
    "Geeta", "Sita", "Neeta", "Pushpa", "Rekha", "Lata", "Meena", "Veena",
    "Shobha", "Usha", "Asha", "Nirmala", "Kamla", "Saroj", "Santosh",
    "Poonam", "Renu", "Suman", "Kiran", "Jyoti", "Rani", "Padma", "Lakshmi"
]

# ─── Geography ────────────────────────────────────────────────────────────────

STATES_DATA = {
    "Delhi": {
        "code": "DL",
        "districts": {
            "Central Delhi": {"code": "CD", "city": "New Delhi", "pins": ["110001", "110002", "110003", "110005", "110006"]},
            "South Delhi": {"code": "SD", "city": "Hauz Khas", "pins": ["110016", "110017", "110024", "110049", "110029"]},
            "East Delhi": {"code": "ED", "city": "Preet Vihar", "pins": ["110092", "110091", "110051", "110096"]},
            "West Delhi": {"code": "WD", "city": "Janakpuri", "pins": ["110058", "110059", "110063", "110041"]},
        }
    },
    "Maharashtra": {
        "code": "MH",
        "districts": {
            "Mumbai Suburban": {"code": "MS", "city": "Andheri", "pins": ["400053", "400058", "400069", "400072"]},
            "Mumbai City": {"code": "MC", "city": "Fort", "pins": ["400001", "400002", "400020", "400034"]},
            "Pune": {"code": "PU", "city": "Kothrud", "pins": ["411029", "411038", "411004", "411030"]},
            "Nagpur": {"code": "NG", "city": "Civil Lines", "pins": ["440001", "440010", "440012", "440018"]},
        }
    },
    "Karnataka": {
        "code": "KA",
        "districts": {
            "Bengaluru Urban": {"code": "BU", "city": "Bengaluru", "pins": ["560001", "560004", "560011", "560025", "560034"]},
            "Mysuru": {"code": "MY", "city": "Mysuru", "pins": ["570001", "570004", "570010", "570015"]},
            "Dharwad": {"code": "DW", "city": "Hubballi", "pins": ["580001", "580020", "580024", "580029"]},
        }
    },
    "Tamil Nadu": {
        "code": "TN",
        "districts": {
            "Chennai": {"code": "CH", "city": "Chennai", "pins": ["600001", "600010", "600017", "600020", "600028"]},
            "Coimbatore": {"code": "CB", "city": "Coimbatore", "pins": ["641001", "641002", "641011", "641014"]},
            "Madurai": {"code": "MD", "city": "Madurai", "pins": ["625001", "625002", "625009", "625014"]},
        }
    },
    "Uttar Pradesh": {
        "code": "UP",
        "districts": {
            "Lucknow": {"code": "LK", "city": "Lucknow", "pins": ["226001", "226003", "226010", "226012", "226018"]},
            "Noida": {"code": "NO", "city": "Noida", "pins": ["201301", "201303", "201304", "201306"]},
            "Varanasi": {"code": "VN", "city": "Varanasi", "pins": ["221001", "221002", "221005", "221010"]},
            "Agra": {"code": "AG", "city": "Agra", "pins": ["282001", "282002", "282005", "282007"]},
        }
    },
}

# ─── Schools Definition (45 schools) ─────────────────────────────────────────

SCHOOLS_RAW = [
    # Delhi - Central Delhi
    ("Delhi Public School Central", "DL", "CD", "CBSE", "Central Delhi", "Delhi", "Mathura Road, New Delhi"),
    ("Convent of Jesus and Mary", "DL", "CD", "ICSE", "Central Delhi", "Delhi", "Bangla Sahib Marg, New Delhi"),
    ("Modern School Barakhamba", "DL", "CD", "CBSE", "Central Delhi", "Delhi", "Barakhamba Road, New Delhi"),
    # Delhi - South Delhi
    ("The Mother's International School", "DL", "SD", "CBSE", "South Delhi", "Delhi", "Sri Aurobindo Marg, Hauz Khas"),
    ("Sanskriti School", "DL", "SD", "CBSE", "South Delhi", "Delhi", "Dr S Radhakrishnan Marg, Chanakyapuri"),
    ("Sardar Patel Vidyalaya", "DL", "SD", "CBSE", "South Delhi", "Delhi", "Lodi Estate, New Delhi"),
    # Delhi - East Delhi
    ("Bal Bharati Public School Lajpat Nagar", "DL", "ED", "CBSE", "East Delhi", "Delhi", "1 Institutional Area, Lajpat Nagar"),
    ("Ryan International Preet Vihar", "DL", "ED", "ICSE", "East Delhi", "Delhi", "D Block, Preet Vihar"),
    # Delhi - West Delhi
    ("Montfort School Ashok Vihar", "DL", "WD", "ICSE", "West Delhi", "Delhi", "B-3 Ashok Vihar Phase II"),
    ("Air Force Bal Bharati School", "DL", "WD", "CBSE", "West Delhi", "Delhi", "Lodhi Road, New Delhi"),
    # Maharashtra - Mumbai Suburban
    ("St Xavier's High School Andheri", "MH", "MS", "ICSE", "Mumbai Suburban", "Maharashtra", "SV Road, Andheri West"),
    ("Jamnabai Narsee School", "MH", "MS", "ICSE", "Mumbai Suburban", "Maharashtra", "Vile Parle West, Mumbai"),
    ("DAV Public School Andheri", "MH", "MS", "CBSE", "Mumbai Suburban", "Maharashtra", "Andheri East, Mumbai"),
    # Maharashtra - Mumbai City
    ("Cathedral and John Connon School", "MH", "MC", "ICSE", "Mumbai City", "Maharashtra", "6 Purshottamdas Thakurdas Marg, Fort"),
    ("St Mary's School ICSE Mumbai", "MH", "MC", "ICSE", "Mumbai City", "Maharashtra", "Mazagaon, Mumbai"),
    # Maharashtra - Pune
    ("Symbiosis School Kothrud", "MH", "PU", "CBSE", "Pune", "Maharashtra", "Senapati Bapat Road, Kothrud"),
    ("Loyola High School Pune", "MH", "PU", "STATE_BOARD", "Pune", "Maharashtra", "Pashan Road, Pune"),
    ("DPS Pune", "MH", "PU", "CBSE", "Pune", "Maharashtra", "Nyati County, Undri, Pune"),
    # Maharashtra - Nagpur
    ("Centre Point School Nagpur", "MH", "NG", "CBSE", "Nagpur", "Maharashtra", "Residency Road, Civil Lines, Nagpur"),
    ("St Joseph's Convent Nagpur", "MH", "NG", "ICSE", "Nagpur", "Maharashtra", "Wardha Road, Nagpur"),
    # Karnataka - Bengaluru Urban
    ("Bishop Cotton Boys School", "KA", "BU", "ICSE", "Bengaluru Urban", "Karnataka", "St Mark's Road, Bengaluru"),
    ("Kendriya Vidyalaya Bengaluru", "KA", "BU", "CBSE", "Bengaluru Urban", "Karnataka", "ASC Centre, Bengaluru"),
    ("National Public School Rajajinagar", "KA", "BU", "CBSE", "Bengaluru Urban", "Karnataka", "Rajajinagar, Bengaluru"),
    ("Delhi Public School Bengaluru East", "KA", "BU", "CBSE", "Bengaluru Urban", "Karnataka", "Sulikunte, Sarjapur Road"),
    # Karnataka - Mysuru
    ("Maharani's Science College School", "KA", "MY", "STATE_BOARD", "Mysuru", "Karnataka", "Vani Vilas Road, Mysuru"),
    ("DPS Mysore", "KA", "MY", "CBSE", "Mysuru", "Karnataka", "Bogadi Road, Mysuru"),
    # Karnataka - Dharwad
    ("KLE School Hubballi", "KA", "DW", "STATE_BOARD", "Dharwad", "Karnataka", "Vidyanagar, Hubballi"),
    ("Jawahar Navodaya Vidyalaya Dharwad", "KA", "DW", "CBSE", "Dharwad", "Karnataka", "Alnavar Road, Dharwad"),
    # Tamil Nadu - Chennai
    ("Don Bosco Matriculation Higher Secondary", "TN", "CH", "STATE_BOARD", "Chennai", "Tamil Nadu", "17 Broadway, Chennai"),
    ("DAV Boys Senior Secondary School Chennai", "TN", "CH", "CBSE", "Chennai", "Tamil Nadu", "Gopalapuram, Chennai"),
    ("Padma Seshadri Bala Bhavan", "TN", "CH", "CBSE", "Chennai", "Tamil Nadu", "T. Nagar, Chennai"),
    ("Chettinad Vidyashram", "TN", "CH", "CBSE", "Chennai", "Tamil Nadu", "Rajah Annamalai Puram, Chennai"),
    # Tamil Nadu - Coimbatore
    ("PSG Public School Coimbatore", "TN", "CB", "CBSE", "Coimbatore", "Tamil Nadu", "Peelamedu, Coimbatore"),
    ("Stanes Anglo-Indian Higher Secondary", "TN", "CB", "ICSE", "Coimbatore", "Tamil Nadu", "Race Course Road, Coimbatore"),
    # Tamil Nadu - Madurai
    ("TVS Academy Madurai", "TN", "MD", "CBSE", "Madurai", "Tamil Nadu", "Thirumangalam Road, Madurai"),
    ("Thiagarajar Model Higher Secondary", "TN", "MD", "STATE_BOARD", "Madurai", "Tamil Nadu", "Teppakulam, Madurai"),
    # UP - Lucknow
    ("La Martiniere College Lucknow", "UP", "LK", "ICSE", "Lucknow", "Uttar Pradesh", "1 La Martiniere Road, Lucknow"),
    ("City Montessori School Gomti Nagar", "UP", "LK", "CBSE", "Lucknow", "Uttar Pradesh", "Gomti Nagar, Lucknow"),
    ("Lucknow Public School", "UP", "LK", "CBSE", "Lucknow", "Uttar Pradesh", "Sector H, LDA Colony, Lucknow"),
    # UP - Noida
    ("DPS Noida", "UP", "NO", "CBSE", "Noida", "Uttar Pradesh", "Sector 30, Noida"),
    ("Amity International School Noida", "UP", "NO", "CBSE", "Noida", "Uttar Pradesh", "Sector 44, Noida"),
    # UP - Varanasi
    ("Sunbeam School Varanasi", "UP", "VN", "CBSE", "Varanasi", "Uttar Pradesh", "Bhagwanpur, Varanasi"),
    ("DPS Varanasi", "UP", "VN", "CBSE", "Varanasi", "Uttar Pradesh", "Babatpur, Varanasi"),
    # UP - Agra
    ("St Peter's College Agra", "UP", "AG", "ICSE", "Agra", "Uttar Pradesh", "Wazirpura Road, Agra"),
    ("Delhi Public School Agra", "UP", "AG", "CBSE", "Agra", "Uttar Pradesh", "NH-2 Bypass, Agra"),
]

# ─── 1. INSTITUTIONS ─────────────────────────────────────────────────────────

def generate_institutions():
    rows = []
    used_phones = set()
    school_num = {}  # (state_code, dist_code) -> counter

    for name, st_code, dist_code, board, district, state, addr_base in SCHOOLS_RAW:
        key = (st_code, dist_code)
        school_num[key] = school_num.get(key, 0) + 1
        code = f"{st_code}-{dist_code}-{school_num[key]:03d}"

        # Address with PIN
        pins = STATES_DATA[state]["districts"][district]["pins"]
        pin = random.choice(pins)
        address = f"{addr_base} - {pin}, {state}"

        # Unique email from school name
        email_slug = name.lower().replace(" ", "").replace("'", "").replace(".", "").replace(",", "")[:25]
        email = f"admin@{email_slug}.meritquest.test"

        # Unique phone
        while True:
            phone = f"+91 {random.choice(['9','8','7'])}{random.randint(100000000, 999999999)}"
            if phone not in used_phones:
                used_phones.add(phone)
                break

        rows.append({
            "name": name,
            "code": code,
            "type": "SCHOOL",
            "board": board,
            "district": district,
            "state": state,
            "address": address,
            "contact_email": email,
            "contact_phone": phone,
        })

    write_csv(os.path.join(OUT_DIR, "institutions.csv"), rows)
    print(f"  institutions.csv — {len(rows)} rows")
    return rows


# ─── 2. USERS ────────────────────────────────────────────────────────────────

def generate_users(institutions):
    rows = []
    used_emails = set()
    used_phones = set()
    uid = 0

    def unique_phone():
        while True:
            p = f"+91 {random.choice(['9','8','7'])}{random.randint(100000000, 999999999)}"
            if p not in used_phones:
                used_phones.add(p)
                return p

    def unique_email(base):
        e = base
        if e in used_emails:
            i = 2
            while f"{base.split('@')[0]}{i}@{base.split('@')[1]}" in used_emails:
                i += 1
            e = f"{base.split('@')[0]}{i}@{base.split('@')[1]}"
        used_emails.add(e)
        return e

    # SCHOOL_ADMINs — 1 per institution
    for i, inst in enumerate(institutions, 1):
        fn = random.choice(GUARDIAN_MALE_NAMES + GUARDIAN_FEMALE_NAMES)
        ln = random.choice(LAST_NAMES)
        rows.append({
            "email": unique_email(f"school.admin.{i}@meritquest.test"),
            "first_name": fn,
            "last_name": ln,
            "role": "SCHOOL_ADMIN",
            "status": "ACTIVE",
            "institution_id": i,
            "phone": unique_phone(),
        })

    # DATA_VERIFIERs — 1 per state
    state_inst_map = {"Delhi": 1, "Maharashtra": 11, "Karnataka": 21, "Tamil Nadu": 29, "Uttar Pradesh": 37}
    for state, inst_id in state_inst_map.items():
        fn = random.choice(GUARDIAN_MALE_NAMES)
        ln = random.choice(LAST_NAMES)
        slug = state.lower().replace(" ", "")
        rows.append({
            "email": unique_email(f"verifier.{slug}@meritquest.test"),
            "first_name": fn,
            "last_name": ln,
            "role": "DATA_VERIFIER",
            "status": "ACTIVE",
            "institution_id": inst_id,
            "phone": unique_phone(),
        })

    # NGO_REPs — 2 per state (10 total)
    ngo_orgs = [
        ("tatatrust", 1), ("prathamdelhi", 5),
        ("teachforindia.mh", 11), ("akanksha.mumbai", 15),
        ("azimpremji.ka", 21), ("headstreams.ka", 25),
        ("crf.tn", 29), ("mssrf.tn", 33),
        ("roomtoread.up", 37), ("educate.girls.up", 42),
    ]
    for org_slug, inst_id in ngo_orgs:
        fn = random.choice(GUARDIAN_MALE_NAMES + GUARDIAN_FEMALE_NAMES)
        ln = random.choice(LAST_NAMES)
        rows.append({
            "email": unique_email(f"ngo.{org_slug}@meritquest.test"),
            "first_name": fn,
            "last_name": ln,
            "role": "NGO_REP",
            "status": "ACTIVE",
            "institution_id": inst_id,
            "phone": unique_phone(),
        })

    # GOV_AUTHORITYs — 1 per state
    for state, inst_id in state_inst_map.items():
        fn = random.choice(GUARDIAN_MALE_NAMES)
        ln = random.choice(LAST_NAMES)
        slug = state.lower().replace(" ", "")
        rows.append({
            "email": unique_email(f"gov.{slug}@meritquest.test"),
            "first_name": fn,
            "last_name": ln,
            "role": "GOV_AUTHORITY",
            "status": "ACTIVE",
            "institution_id": inst_id,
            "phone": unique_phone(),
        })

    # STUDENT users — 60 (linked to first 60 students later)
    for i in range(1, 61):
        gender = random.choice(["M", "F"])
        fn = random.choice(MALE_NAMES if gender == "M" else FEMALE_NAMES)
        ln = random.choice(LAST_NAMES)
        rows.append({
            "email": unique_email(f"student.{fn.lower()}.{ln.lower()}@meritquest.test"),
            "first_name": fn,
            "last_name": ln,
            "role": "STUDENT",
            "status": "ACTIVE",
            "institution_id": random.randint(1, 45),
            "phone": unique_phone(),
        })

    # PARENT users — 40 (linked to students' guardians)
    for i in range(1, 41):
        gender = random.choice(["M", "F"])
        fn = random.choice(GUARDIAN_MALE_NAMES if gender == "M" else GUARDIAN_FEMALE_NAMES)
        ln = random.choice(LAST_NAMES)
        rows.append({
            "email": unique_email(f"parent.{fn.lower()}.{ln.lower()}@meritquest.test"),
            "first_name": fn,
            "last_name": ln,
            "role": "PARENT",
            "status": "ACTIVE",
            "institution_id": random.randint(1, 45),
            "phone": unique_phone(),
        })

    write_csv(os.path.join(OUT_DIR, "users.csv"), rows)
    print(f"  users.csv — {len(rows)} rows")
    return rows


# ─── 3. STUDENTS ──────────────────────────────────────────────────────────────

def generate_students(institutions):
    rows = []
    used_enrollment = set()
    used_guardian_phones = set()
    used_guardian_emails = set()
    student_id = 0

    grades = ["6", "7", "8", "9", "10", "11", "12"]
    sections = ["A", "B", "C", "D"]

    for inst_idx, inst in enumerate(institutions):
        inst_id = inst_idx + 1
        code = inst["code"]
        state = inst["state"]
        district = inst["district"]
        city = STATES_DATA[state]["districts"][district]["city"]
        pins = STATES_DATA[state]["districts"][district]["pins"]

        # 11-12 students per institution to reach ~500
        num_students = random.choice([11, 11, 11, 12, 12])

        for seq in range(1, num_students + 1):
            student_id += 1
            enrollment = f"{code}/2024/{seq:04d}"
            assert enrollment not in used_enrollment
            used_enrollment.add(enrollment)

            # Gender: 49% M, 49% F, 2% OTHER
            r = random.random()
            if r < 0.49:
                gender = "MALE"
                fn = random.choice(MALE_NAMES)
            elif r < 0.98:
                gender = "FEMALE"
                fn = random.choice(FEMALE_NAMES)
            else:
                gender = "OTHER"
                fn = random.choice(MALE_NAMES + FEMALE_NAMES)

            ln = random.choice(LAST_NAMES)

            # DOB: 2008-2013
            start_d = date(2008, 1, 1)
            end_d = date(2013, 12, 31)
            dob = start_d + timedelta(days=random.randint(0, (end_d - start_d).days))

            grade = random.choice(grades)
            section = random.choice(sections)

            # Guardian
            g_fn = random.choice(GUARDIAN_MALE_NAMES + GUARDIAN_FEMALE_NAMES)
            guardian_name = f"{g_fn} {ln}"

            while True:
                gp = f"+91 {random.choice(['9','8','7'])}{random.randint(100000000, 999999999)}"
                if gp not in used_guardian_phones:
                    used_guardian_phones.add(gp)
                    break

            ge_base = f"{g_fn.lower()}.{ln.lower()}@gmail.com"
            ge = ge_base
            counter = 2
            while ge in used_guardian_emails:
                ge = f"{g_fn.lower()}.{ln.lower()}{counter}@gmail.com"
                counter += 1
            used_guardian_emails.add(ge)

            # Address
            house = random.randint(1, 500)
            area = random.choice([
                "Sector " + str(random.randint(1, 60)),
                "Block " + random.choice("ABCDEFGH"),
                "Ward " + str(random.randint(1, 30)),
                "Colony No " + str(random.randint(1, 20)),
                "Nagar",
                "Vihar",
            ])
            pin = random.choice(pins)
            address = f"{house}, {area}, {city} - {pin}, {state}"

            rows.append({
                "enrollment_number": enrollment,
                "first_name": fn,
                "last_name": ln,
                "date_of_birth": dob.isoformat(),
                "gender": gender,
                "grade": grade,
                "section": section,
                "guardian_name": guardian_name,
                "guardian_phone": gp,
                "guardian_email": ge,
                "address": address,
                "institution_id": inst_id,
            })

    write_csv(os.path.join(OUT_DIR, "students.csv"), rows)
    print(f"  students.csv — {len(rows)} rows")
    return rows


# ─── 4. ACADEMIC RECORDS ─────────────────────────────────────────────────────

def generate_academic_records(students):
    rows = []
    subjects = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Computer Science", "Physical Education"]
    exam_types = ["UNIT_TEST_1", "UNIT_TEST_2", "MID_TERM", "FINAL"]
    used_combos = set()

    total_students = len(students)
    for sid_idx, student in enumerate(students):
        sid = sid_idx + 1
        inst_id = student["institution_id"]

        # Determine performance tier
        pct = sid / total_students
        if pct <= 0.10:
            mean_marks, std = 92, 5
        elif pct <= 0.40:
            mean_marks, std = 76, 7
        elif pct <= 0.70:
            mean_marks, std = 60, 9
        elif pct <= 0.90:
            mean_marks, std = 42, 7
        else:
            mean_marks, std = 27, 8

        # Each student gets 7 subjects across multiple exams and years
        selected_subjects = subjects[:]
        academic_years = ["2024-2025"]
        if random.random() < 0.5:
            academic_years.append("2023-2024")

        for subj in selected_subjects:
            # Give each student 2-3 exams per subject per year
            num_exams = random.choice([2, 2, 3])
            chosen_exams = random.sample(exam_types, min(num_exams, len(exam_types)))

            for ay in academic_years:
                for exam in chosen_exams:
                    combo = (sid, subj, exam, ay)
                    if combo in used_combos:
                        continue
                    used_combos.add(combo)

                marks = round(max(0, min(100, random.gauss(mean_marks, std))), 2)

                if marks >= 90:
                    grade = "A+"
                elif marks >= 80:
                    grade = "A"
                elif marks >= 70:
                    grade = "B+"
                elif marks >= 60:
                    grade = "B"
                elif marks >= 50:
                    grade = "C+"
                elif marks >= 40:
                    grade = "C"
                else:
                    grade = "D"

                semester = "Semester 1" if exam in ("UNIT_TEST_1", "MID_TERM") else "Semester 2"

                rows.append({
                    "student_id": sid,
                    "subject": subj,
                    "exam_type": exam,
                    "marks_obtained": marks,
                    "max_marks": 100.00,
                    "grade": grade,
                    "academic_year": ay,
                    "semester": semester,
                    "institution_id": inst_id,
                })

    write_csv(os.path.join(OUT_DIR, "academic_records.csv"), rows)
    print(f"  academic_records.csv — {len(rows)} rows")
    return rows


# ─── 5. ATTENDANCE RECORDS ───────────────────────────────────────────────────

def generate_attendance(students):
    rows = []
    months_data = [
        ("April", 22), ("May", 23), ("June", 20), ("July", 24),
        ("August", 22), ("September", 24), ("October", 21), ("November", 22),
        ("December", 20), ("January", 24), ("February", 20), ("March", 22),
    ]
    used_combos = set()
    total_students = len(students)

    for sid_idx, student in enumerate(students):
        sid = sid_idx + 1
        inst_id = student["institution_id"]

        pct = sid / total_students
        if pct <= 0.10:
            att_range = (0.95, 1.00)
        elif pct <= 0.40:
            att_range = (0.88, 0.95)
        elif pct <= 0.70:
            att_range = (0.75, 0.87)
        elif pct <= 0.90:
            att_range = (0.60, 0.74)
        else:
            att_range = (0.30, 0.59)

        # Each student gets 10 months
        selected_months = random.sample(months_data, 10)
        for month_idx, (month, total_days) in enumerate(selected_months):
            combo = (sid, month, "2024-2025")
            if combo in used_combos:
                continue
            used_combos.add(combo)

            low, high = att_range
            # At-risk students: declining attendance
            if pct > 0.90:
                # Reduce attendance as months progress
                decline = month_idx * 0.03
                low = max(0.10, low - decline)
                high = max(0.15, high - decline)

            att_pct = random.uniform(low, high)
            days_present = max(0, min(total_days, round(total_days * att_pct)))
            days_absent = total_days - days_present

            rows.append({
                "student_id": sid,
                "month": month,
                "academic_year": "2024-2025",
                "total_days": total_days,
                "days_present": days_present,
                "days_absent": days_absent,
                "institution_id": inst_id,
            })

    write_csv(os.path.join(OUT_DIR, "attendance_records.csv"), rows)
    print(f"  attendance_records.csv — {len(rows)} rows")
    return rows


# ─── 6. ACTIVITIES ───────────────────────────────────────────────────────────

def generate_activities(students):
    rows = []
    used_combos = set()

    activity_pool = [
        ("Inter-School Cricket Tournament", "SPORTS"),
        ("State-Level Science Olympiad", "ACADEMICS"),
        ("Annual Art Exhibition", "ARTS"),
        ("NCC Camp", "LEADERSHIP"),
        ("Community Cleanliness Drive", "COMMUNITY_SERVICE"),
        ("National Mathematics Olympiad", "ACADEMICS"),
        ("School Debate Competition", "ACADEMICS"),
        ("District Yoga Championship", "SPORTS"),
        ("Cultural Dance Festival", "ARTS"),
        ("Code-a-thon 2025", "ACADEMICS"),
        ("Kho-Kho District Championship", "SPORTS"),
        ("Hindi Kavita Recitation", "ARTS"),
        ("Scout and Guide Camp", "LEADERSHIP"),
        ("Inter-House Basketball Tournament", "SPORTS"),
        ("Annual Science Fair", "ACADEMICS"),
        ("Republic Day March Past", "LEADERSHIP"),
        ("Spelling Bee Competition", "ACADEMICS"),
        ("Model United Nations", "LEADERSHIP"),
        ("Rangoli Competition", "ARTS"),
        ("School Band Performance", "ARTS"),
        ("Inter-School Football League", "SPORTS"),
        ("District Chess Championship", "SPORTS"),
        ("Kabaddi State Tournament", "SPORTS"),
        ("Badminton Inter-School Meet", "SPORTS"),
        ("Classical Music Recital", "ARTS"),
        ("Street Play on Social Awareness", "COMMUNITY_SERVICE"),
        ("Blood Donation Camp Volunteer", "COMMUNITY_SERVICE"),
        ("Tree Plantation Drive", "COMMUNITY_SERVICE"),
        ("Traffic Awareness Campaign", "COMMUNITY_SERVICE"),
        ("Robotics Workshop", "ACADEMICS"),
        ("Astronomy Night Observation", "ACADEMICS"),
        ("Essay Writing Contest Hindi", "ARTS"),
        ("Essay Writing Contest English", "ARTS"),
        ("Poster Making Competition", "ARTS"),
        ("Photography Contest", "ARTS"),
        ("School Captain Election", "LEADERSHIP"),
        ("Peer Tutoring Program", "LEADERSHIP"),
        ("Independence Day Cultural Program", "ARTS"),
        ("Annual Sports Day 100m Sprint", "SPORTS"),
        ("Annual Sports Day Long Jump", "SPORTS"),
        ("District Swimming Meet", "SPORTS"),
        ("State Volleyball Championship", "SPORTS"),
        ("Carrom Tournament", "SPORTS"),
        ("Table Tennis Inter-House", "SPORTS"),
        ("Science Model Exhibition", "ACADEMICS"),
        ("Quiz Bowl Regional Finals", "ACADEMICS"),
        ("Vedic Mathematics Competition", "ACADEMICS"),
        ("Sanskrit Shloka Recitation", "ARTS"),
        ("Handwriting Competition", "ARTS"),
        ("Cooking Without Fire Contest", "OTHER"),
    ]

    achievements_top = ["Gold Medal", "First Place", "State Finalist", "Best Player", "Best Speaker", "Certificate of Merit"]
    achievements_good = ["Silver Medal", "Second Place", "Certificate of Merit", "Special Mention", "Participant"]
    achievements_avg = ["Bronze Medal", "Third Place", "Participant", "Certificate of Merit"]

    descriptions = {
        "SPORTS": [
            "Represented school in district-level sports competition",
            "Participated in inter-school athletic meet",
            "Competed in state-level tournament with distinction",
            "Part of school team for annual sports event",
            "Trained and competed in zonal championship",
        ],
        "ARTS": [
            "Showcased creative talent at annual cultural festival",
            "Performed in front of distinguished guests at school event",
            "Displayed artwork at district-level art exhibition",
            "Participated in cultural exchange program",
            "Presented creative work at inter-school competition",
        ],
        "ACADEMICS": [
            "Competed in regional academic olympiad",
            "Represented school in national-level quiz competition",
            "Participated in science and technology exhibition",
            "Presented research project at district science fair",
            "Selected for state-level academic challenge",
        ],
        "COMMUNITY_SERVICE": [
            "Volunteered for community development initiative",
            "Led a team of students in social awareness campaign",
            "Organized and participated in neighborhood improvement drive",
            "Contributed to school's community outreach program",
            "Helped coordinate awareness drive in local community",
        ],
        "LEADERSHIP": [
            "Demonstrated leadership in school governance activities",
            "Led fellow students in organizational responsibilities",
            "Served as student leader for school program",
            "Coordinated peers in extracurricular leadership role",
            "Managed logistics and team coordination for school event",
        ],
        "OTHER": [
            "Participated in unique inter-school event",
            "Contributed to special school program initiative",
        ],
    }

    total_students = len(students)

    for sid_idx in range(total_students):
        sid = sid_idx + 1
        inst_id = students[sid_idx]["institution_id"]

        pct = sid / total_students
        if pct <= 0.10:
            num_activities = random.choice([2, 3, 3])
            ach_pool = achievements_top
        elif pct <= 0.40:
            num_activities = random.choice([1, 2, 2])
            ach_pool = achievements_good
        elif pct <= 0.60:
            num_activities = random.choice([0, 1, 1])
            ach_pool = achievements_avg
        elif pct <= 0.85:
            num_activities = random.choice([0, 0, 1])
            ach_pool = achievements_avg
        else:
            num_activities = 0
            ach_pool = achievements_avg

        if num_activities == 0:
            continue

        for _ in range(num_activities):
            for attempt in range(20):
                title, category = random.choice(activity_pool)
                event_date = date(2024, 4, 1) + timedelta(days=random.randint(0, 364))
                combo = (sid, title, event_date.isoformat())
                if combo not in used_combos:
                    used_combos.add(combo)
                    break
            else:
                continue

            desc = random.choice(descriptions[category])
            achievement = random.choice(ach_pool)

            rows.append({
                "student_id": sid,
                "title": title,
                "category": category,
                "description": desc,
                "achievement": achievement,
                "event_date": event_date.isoformat(),
                "institution_id": inst_id,
            })

    write_csv(os.path.join(OUT_DIR, "activities.csv"), rows)
    print(f"  activities.csv — {len(rows)} rows")
    return rows


# ─── 7. SCHOLARSHIPS ─────────────────────────────────────────────────────────

def generate_scholarships():
    rows = [
        {"title": "PM Vidya Lakshmi Scholarship", "organization_name": "PM Office, Govt. of India", "organization_type": "GOVERNMENT", "amount": 15000, "currency": "INR", "total_slots": 500, "application_deadline": "2025-09-30", "status": "ACTIVE"},
        {"title": "Tata Trust Merit Award", "organization_name": "Tata Trusts", "organization_type": "NGO", "amount": 40000, "currency": "INR", "total_slots": 100, "application_deadline": "2025-10-15", "status": "ACTIVE"},
        {"title": "HDFC Parivartan Scholarship", "organization_name": "HDFC Bank", "organization_type": "PRIVATE", "amount": 75000, "currency": "INR", "total_slots": 30, "application_deadline": "2025-11-01", "status": "ACTIVE"},
        {"title": "Reliance Foundation Scholarship", "organization_name": "Reliance Foundation", "organization_type": "PRIVATE", "amount": 100000, "currency": "INR", "total_slots": 25, "application_deadline": "2025-10-31", "status": "ACTIVE"},
        {"title": "Azim Premji Foundation Education Grant", "organization_name": "Azim Premji Foundation", "organization_type": "NGO", "amount": 50000, "currency": "INR", "total_slots": 200, "application_deadline": "2025-11-15", "status": "ACTIVE"},
        {"title": "State Merit Scholarship Delhi", "organization_name": "Govt. of NCT Delhi", "organization_type": "GOVERNMENT", "amount": 10000, "currency": "INR", "total_slots": 300, "application_deadline": "2025-09-15", "status": "ACTIVE"},
        {"title": "Narotam Sekhsaria Foundation Scholarship", "organization_name": "Narotam Sekhsaria Foundation", "organization_type": "NGO", "amount": 25000, "currency": "INR", "total_slots": 80, "application_deadline": "2025-12-01", "status": "ACTIVE"},
        {"title": "ONGC Scholarship for Meritorious Students", "organization_name": "ONGC", "organization_type": "PRIVATE", "amount": 48000, "currency": "INR", "total_slots": 50, "application_deadline": "2025-10-20", "status": "ACTIVE"},
        {"title": "Sitaram Jindal Foundation Scholarship", "organization_name": "Sitaram Jindal Foundation", "organization_type": "NGO", "amount": 18000, "currency": "INR", "total_slots": 150, "application_deadline": "2025-11-30", "status": "ACTIVE"},
        {"title": "Central Sector Scheme of Scholarships", "organization_name": "MHRD, Govt. of India", "organization_type": "GOVERNMENT", "amount": 20000, "currency": "INR", "total_slots": 400, "application_deadline": "2025-12-15", "status": "ACTIVE"},
        {"title": "Infosys Prize Student Award", "organization_name": "Infosys Foundation", "organization_type": "PRIVATE", "amount": 60000, "currency": "INR", "total_slots": 40, "application_deadline": "2025-10-01", "status": "ACTIVE"},
        {"title": "Wipro Earthian Scholarship", "organization_name": "Wipro Foundation", "organization_type": "PRIVATE", "amount": 35000, "currency": "INR", "total_slots": 45, "application_deadline": "2025-11-10", "status": "ACTIVE"},
        {"title": "L&T Build India Scholarship", "organization_name": "Larsen & Toubro", "organization_type": "PRIVATE", "amount": 80000, "currency": "INR", "total_slots": 20, "application_deadline": "2025-12-20", "status": "ACTIVE"},
        {"title": "Mahindra All India Talent Scholarship", "organization_name": "Mahindra Group", "organization_type": "PRIVATE", "amount": 55000, "currency": "INR", "total_slots": 35, "application_deadline": "2025-10-10", "status": "ACTIVE"},
        {"title": "Kotak Kanya Scholarship", "organization_name": "Kotak Mahindra Bank", "organization_type": "PRIVATE", "amount": 30000, "currency": "INR", "total_slots": 60, "application_deadline": "2025-11-25", "status": "ACTIVE"},
    ]
    write_csv(os.path.join(OUT_DIR, "scholarships.csv"), rows)
    print(f"  scholarships.csv — {len(rows)} rows")
    return rows


# ─── Helpers ──────────────────────────────────────────────────────────────────

def write_csv(path, rows):
    if not rows:
        return
    fieldnames = list(rows[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Generating Merit Quest synthetic data...\n")

    institutions = generate_institutions()
    users = generate_users(institutions)
    students = generate_students(institutions)
    academic_records = generate_academic_records(students)
    attendance = generate_attendance(students)
    activities = generate_activities(students)
    scholarships = generate_scholarships()

    total = len(institutions) + len(users) + len(students) + len(academic_records) + len(attendance) + len(activities) + len(scholarships)
    print(f"\nDone! Total records: {total}")
    print(f"Files saved in: {OUT_DIR}")
