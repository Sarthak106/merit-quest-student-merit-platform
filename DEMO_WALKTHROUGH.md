# Merit Quest — Complete Demo Walkthrough

> A full-stack student merit evaluation platform with **7 user roles**, **AI-powered insights**, **ML dropout prediction**, and **real-time analytics**.

| Service | URL |
|---------|-----|
| **Frontend (React)** | http://localhost:3000 |
| **Backend API (Spring Boot)** | http://localhost:8080 |
| **ML Service (FastAPI)** | http://localhost:5000 |
| **MinIO Console** | http://localhost:9001 |

---

## 🚀 Startup Guide

Follow these steps **in order** to start the entire platform without errors. Each service depends on the previous one being healthy before it can function.

### Step 1 — Start Infrastructure (Docker)

Start PostgreSQL, Redis, and MinIO containers first. Everything else depends on these.

```bash
docker compose up -d postgres redis minio
```

| Container | Port | Purpose | Health Check |
|-----------|------|---------|--------------|
| `mq-postgres` | `5434` → 5432 | PostgreSQL 16 database (`meritquest`) | `pg_isready -U meritquest` |
| `mq-redis` | `6380` → 6379 | Redis 7 cache & session store | `redis-cli ping` |
| `mq-minio` | `9000` (API), `9001` (Console) | MinIO object storage (certificates, uploads) | `mc ready local` |

**Wait ~10 seconds** for all three to become healthy, then verify:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

All three containers should show `(healthy)` in the Status column.

### Step 2 — Start Backend (Spring Boot)

The backend runs Flyway migrations on startup (V1–V9), creates all tables, seeds demo data, and exposes the REST API.

```bash
cd backend
.\gradlew.bat bootRun
```

**Wait for:** `Started MeritQuestApplication in X seconds` in the console.  
**Verify:** Open http://localhost:8080/api/health or check that the console shows no errors.

> **What happens on first run:** Flyway runs 9 migrations that create the schema and seed 173 users, 45 institutions, 510 students, 1,100+ merit scores, and merit configuration. This takes ~30 seconds on first boot.

### Step 3 — Start Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

**Wait for:** `Local: http://localhost:3000/` in the console.  
**Verify:** Open http://localhost:3000 — you should see the premium 3D landing page with scroll animations.

### Step 4 — Start ML Service (FastAPI) — Optional

The ML service powers dropout prediction, model training, and AI-driven alerts. The platform works without it, but ML features will show as unavailable.

```bash
cd ml-service
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

**Wait for:** `Uvicorn running on http://0.0.0.0:5000` in the console.  
**Verify:** Open http://localhost:5000/docs — you should see the FastAPI Swagger UI.

### Startup Order Summary

```
Docker (postgres, redis, minio)
        ↓
   Backend (port 8080)     ←  needs postgres + redis + minio
        ↓
   Frontend (port 3000)    ←  needs backend API
        ↓
   ML Service (port 5000)  ←  needs postgres (optional)
```

---

## 🔑 Demo Login Credentials

All demo accounts share the password **`Demo@1234`**.

| # | Role | Email | Name | Scope |
|---|------|-------|------|-------|
| 1 | **STUDENT** | `demo.student@meritquest.dev` | Aarav Sharma | Own data only (Delhi Public School Central) |
| 2 | **PARENT** | `demo.parent@meritquest.dev` | Rajesh Sharma | Child's data (linked to Aarav Sharma) |
| 3 | **SCHOOL_ADMIN** | `demo.schooladmin@meritquest.dev` | Priya Mehta | Institution-scoped (Delhi Public School Central) |
| 4 | **DATA_VERIFIER** | `demo.verifier@meritquest.dev` | Vikram Patel | Cross-institution verification |
| 5 | **NGO_REP** | `demo.ngorep@meritquest.dev` | Ananya Desai | Cross-institution scholarships |
| 6 | **GOV_AUTHORITY** | `demo.govauthority@meritquest.dev` | Sanjay Gupta | Regional oversight (all institutions) |
| 7 | **SYSTEM_ADMIN** | `demo.sysadmin@meritquest.dev` | Ayush Mishra | Full platform access |

> **Also available:** Admin account — `admin@meritquest.dev` / `Admin@123` (SYSTEM_ADMIN)  
> **165 generated test users** (students, parents, school admins, verifiers) — all use password `Test@1234` with `@meritquest.test` emails

### How to Login

1. Open http://localhost:3000 → Click **Login** (or go to `/login`)
2. Enter the **Email** and **Password** from the table above
3. Click **Sign In**
4. You'll be redirected to a **role-specific Dashboard** with personalized stats, charts, and AI insights

---

## 📘 Role 1: STUDENT — Aarav Sharma

**Login:** `demo.student@meritquest.dev` / `Demo@1234`

> The student role provides a personal academic portal — view your grades, track merit score progression, browse and apply for scholarships, and receive AI-powered alerts about your academic journey.

### Sidebar Menu

| # | Page | Route | What It Shows |
|---|------|-------|---------------|
| 1 | Dashboard | `/dashboard` | Personal stat cards (GPA, attendance %, merit rank, scholarship count), mini charts, and AI-generated insights |
| 2 | My Performance | `/performance` | Subject-wise radar chart, bar chart of marks, grade trend line across semesters, attendance stats |
| 3 | Merit Score | `/merit` | Your position in the merit ranking list, historical score trend, merit lists filtered by academic year |
| 4 | Scholarships | `/scholarships` | All available scholarships with name, amount, deadline, and organization. Click any to view details |
| 5 | My Applications | `/my-applications` | Your submitted scholarship applications with real-time status (PENDING / APPROVED / REJECTED) |
| 6 | Alerts | `/alerts` | AI-generated notifications about attendance drops, grade changes, merit updates, and scholarship deadlines |

### Actions You Can Perform

| Action | Where | How |
|--------|-------|-----|
| View your academic performance | My Performance | Charts load automatically showing your subject scores, trends, and radar analysis |
| Check merit ranking | Merit Score | Browse the full merit list — your name is highlighted, scores are ranked by composite merit |
| Apply for a scholarship | Scholarships → click any → **Apply** | View scholarship details (eligibility, amount, slots) and click the Apply button |
| Track application status | My Applications | See all your submitted applications with live status updates |
| Withdraw a pending application | My Applications → click **Withdraw** | Only available while status is PENDING |
| View personal alerts | Alerts | See AI-driven dropout risk warnings, attendance alerts, and scholarly recommendations |

### What the Dashboard Shows

The student dashboard displays **4 stat cards** at the top:
- **GPA** — Your current grade point average
- **Attendance** — Your attendance percentage
- **Merit Rank** — Your position among all ranked students
- **Top Score** — The highest composite merit score on the platform

Below the cards: a **bar chart** (grade distribution), a **pie chart** (top performers), an **area chart** (monthly trend), and an **AI Insights** panel with personalized recommendations.

### ✅ CAN Do
- [x] View own performance data (grades, attendance, subject analysis)
- [x] View merit lists and own merit score history
- [x] Browse all available scholarships
- [x] Apply to eligible scholarships
- [x] Withdraw pending scholarship applications
- [x] View personal AI-generated alerts

### ❌ CANNOT Do
- [ ] View other students' data
- [ ] Manage students, bulk upload, or certificates
- [ ] Create or edit scholarships
- [ ] Approve/reject scholarship applications
- [ ] Access verification queue or audit logs
- [ ] Access admin panels (users, institutions, ML models)
- [ ] Trigger merit calculations
- [ ] View institution-wide analytics

---

## 📗 Role 2: PARENT — Rajesh Sharma

**Login:** `demo.parent@meritquest.dev` / `Demo@1234`

> The parent role is a read-only monitoring portal — track your child's academic performance, view their merit ranking, browse scholarship opportunities for them, and receive alerts about their progress.

### Sidebar Menu

| # | Page | Route | What It Shows |
|---|------|-------|---------------|
| 1 | Dashboard | `/dashboard` | Child-focused stat cards (child's GPA, attendance, merit rank), AI insights tailored for parents |
| 2 | Child Performance | `/performance` | Child's subject-wise marks, attendance trends, and performance comparison charts |
| 3 | Merit Score | `/merit` | Child's position in merit rankings and score progression over time |
| 4 | Scholarships | `/scholarships` | All available scholarships — browse eligibility criteria and deadlines to advise your child |
| 5 | Alerts | `/alerts` | Notifications about child's attendance drops, grade improvements, and scholarship matches |

### Actions You Can Perform

| Action | Where | How |
|--------|-------|-----|
| Monitor child's grades | Child Performance | View subject-wise bar charts, radar analysis, and semester trend lines |
| Check child's merit rank | Merit Score | Browse the merit list — child's name highlighted with rank and composite score |
| Browse scholarships | Scholarships | View all available scholarships to advise child on which to apply for |
| View child's alerts | Alerts | See AI-generated warnings about attendance dips, failing grades, or positive milestones |

### What the Dashboard Shows

The parent dashboard shows **4 stat cards** reflecting the child's academic standing — GPA, attendance %, merit rank, and top score. The AI Insights panel provides parent-specific recommendations like "Your child's math score improved by 15%" or "Attendance is below threshold — consider follow-up."

### ✅ CAN Do
- [x] View child's performance and analytics
- [x] View merit lists and child's score history
- [x] Browse scholarships (view only)
- [x] View child-related alerts

### ❌ CANNOT Do
- [ ] Apply for scholarships (only the student can)
- [ ] Manage students, upload data, or certificates
- [ ] Create or manage scholarships
- [ ] Access verification queue or audit logs
- [ ] Access admin panels
- [ ] Trigger merit calculations

---

## 📙 Role 3: SCHOOL_ADMIN — Priya Mehta

**Login:** `demo.schooladmin@meritquest.dev` / `Demo@1234`

> The school admin role is the primary data management hub — full CRUD on students, bulk CSV uploads, merit calculation triggers, rich analytics, certificate management, and alert monitoring for your institution.

### Sidebar Menu

| # | Page | Route | What It Shows |
|---|------|-------|---------------|
| 1 | Dashboard | `/dashboard` | Institution-level stats (total students, avg GPA, attendance %, verification status), grade distribution chart, top performers pie, AI insights |
| 2 | Students | `/students` | Searchable, sortable table of all students in your institution with add/edit/view/delete actions |
| 3 | Bulk Upload | `/upload` | CSV upload interface with drag-and-drop, upload history table, and processing status tracker |
| 4 | Merit Lists | `/merit` | Merit score rankings with filter by academic year. **Trigger merit calculation** button to recalculate scores |
| 5 | Analytics | `/analytics` | Full analytics dashboard — overview stat cards, grade distribution bar chart, attendance trends area chart, top performers table, subject performance, score histogram, and AI insights |
| 6 | Certificates | `/certificates` | Upload, view, download, and delete student certificates (stored in MinIO) |
| 7 | Alerts | `/alerts` | View all institution alerts, acknowledge them, and generate new alerts for specific students |

### Actions You Can Perform

| Action | Where | How |
|--------|-------|-----|
| Add a new student | Students → **+ Add Student** | Fill out the form with personal details, academic info, and submit |
| View student detail | Students → click **👁 Eye icon** | Opens `/students/:id` with full profile: personal info, performance stats, merit trend chart, subject radar, AI analysis, admin notes, downloadable report, merit history |
| Edit a student record | Students → click **Edit** | Modify any student field and save |
| Delete a student | Students → click **Delete** | Permanently removes the student record |
| Bulk upload student data | Bulk Upload → drag CSV or click upload | Upload a CSV file; track processing progress in the upload history table |
| Calculate merit scores | Merit Lists → **Calculate Merit Scores** | Triggers async merit calculation for all approved students; scores appear after processing |
| View analytics | Analytics | All charts load automatically with institution-scoped data. Select academic year from dropdown |
| Upload a certificate | Certificates → **Upload Certificate** | Select student, attach file, upload to MinIO storage |
| Download a certificate | Certificates → click **Download** | Downloads the certificate file from MinIO |
| Generate an alert | Alerts → **Generate Alert** | Create a custom alert for a specific student (visible to student and their parent) |
| Acknowledge an alert | Alerts → click **Acknowledge** | Mark an alert as acknowledged/handled |

### What the Analytics Page Shows

The analytics dashboard (`/analytics`) provides 7 visualization sections:
1. **Overview Cards** — Total students, highest composite score, completed merit batches, total batches (animated CountUp numbers)
2. **Grade Distribution** — Bar chart showing how many students fall in each grade bracket (A+, A, B+, B, etc.)
3. **Attendance Trends** — Gradient area chart showing monthly attendance averages across the academic year
4. **Top Performers** — Table listing the highest-scoring students with their composite merit scores
5. **Subject Performance** — Analysis of average scores by subject
6. **Score Histogram** — Distribution of composite merit scores across all students
7. **AI Insights Panel** — AI-generated analysis summarizing top merit scores, batch completion status, and recommendations

### ✅ CAN Do
- [x] View and manage all students in the institution (CRUD)
- [x] View detailed student profiles with AI analysis
- [x] Bulk upload student data via CSV
- [x] View institution analytics (grades, attendance, performance, subjects)
- [x] Trigger merit score calculations
- [x] Upload, view, and manage certificates
- [x] View and acknowledge institution alerts
- [x] Generate alerts for students

### ❌ CANNOT Do
- [ ] Manage users or institutions (admin-only)
- [ ] Create or manage scholarships
- [ ] Decide on scholarship applications
- [ ] Access audit logs
- [ ] Train ML models
- [ ] Compare institutions (system-wide analytics)
- [ ] Update merit configuration weights
- [ ] Decide on verification items (only verifiers can)

---

## 📕 Role 4: DATA_VERIFIER — Vikram Patel

**Login:** `demo.verifier@meritquest.dev` / `Demo@1234`

> The data verifier role ensures data integrity — review pending student data submissions from schools, approve or reject them, and audit the platform's action trail. This is a cross-institution role with no institution binding.

### Sidebar Menu

| # | Page | Route | What It Shows |
|---|------|-------|---------------|
| 1 | Dashboard | `/dashboard` | Verification workload stats (pending count, completed count, verification rate %), AI insights about backlogs |
| 2 | Verification Queue | `/verification` | Queue of all pending data submissions from schools — filterable by status (PENDING / APPROVED / REJECTED) |
| 3 | Merit Lists | `/merit` | Read-only view of merit rankings by academic year |
| 4 | Audit Log | `/audit-log` | Platform-wide action log — who did what, when, with filter by action type, user, and date range |

### Actions You Can Perform

| Action | Where | How |
|--------|-------|-----|
| Review a pending submission | Verification Queue → click any item | View the full record details submitted by a school admin |
| Approve a submission | Verification Queue → click **Approve** | Marks the data as verified and available for merit calculations |
| Reject a submission | Verification Queue → click **Reject** | Marks the data as rejected with notes; school admin can see the rejection |
| Add verification notes | Verification Queue → notes field | Add comments explaining your approval/rejection decision |
| Browse merit lists | Merit Lists | View-only access to merit rankings by academic year |
| Review audit trail | Audit Log → filter options | Search and filter all platform actions by user, action type, or date range |

### What the Dashboard Shows

The verifier dashboard shows **4 stat cards** focused on verification workload — pending verifications count, completed verifications, verification pass rate, and total submissions. The AI Insights panel highlights verification backlogs and data quality trends.

### ✅ CAN Do
- [x] View verification queue across all institutions
- [x] Approve or reject verification items
- [x] Add verification notes/comments
- [x] View merit lists (read-only)
- [x] View platform audit logs

### ❌ CANNOT Do
- [ ] Manage students (CRUD operations)
- [ ] Upload data or certificates
- [ ] Create or manage scholarships
- [ ] Apply for scholarships
- [ ] Trigger merit calculations
- [ ] Manage users or institutions
- [ ] View or manage alerts
- [ ] Access ML model management

---

## 📓 Role 5: NGO_REP — Ananya Desai

**Login:** `demo.ngorep@meritquest.dev` / `Demo@1234`

> The NGO representative role manages the full scholarship lifecycle — create scholarship programs, review and decide on student applications, and use analytics to identify deserving students across all institutions.

### Sidebar Menu

| # | Page | Route | What It Shows |
|---|------|-------|---------------|
| 1 | Dashboard | `/dashboard` | Scholarship-focused stats (active scholarships, total applicants, approval rate), AI insights about scholarship impact |
| 2 | Scholarships | `/scholarships` | Your created scholarships + option to create new ones. Full lifecycle management |
| 3 | Applicants | `/applicants` | All applications received for your scholarships with applicant details and approve/reject actions |
| 4 | Analytics | `/analytics` | Student analytics — grade distribution, top performers, score histogram — for identifying scholarship candidates |
| 5 | Merit Lists | `/merit` | Merit rankings across all institutions — use to assess student eligibility |

### Actions You Can Perform

| Action | Where | How |
|--------|-------|-----|
| Create a scholarship | Scholarships → **Create Scholarship** | Fill title, description, organization, amount, currency, slots, eligibility criteria, and deadline at `/scholarships/create` |
| Edit a scholarship | Scholarships → click scholarship → **Edit** | Modify any field of your existing scholarship at `/scholarships/:id/edit` |
| Close a scholarship | Scholarships → click **Close** | Stops accepting new applications for that scholarship |
| Review applications | Applicants | See all applicants with their name, merit score, grades, and current status |
| Approve an application | Applicants → click **Approve** | Awards the scholarship to this student |
| Reject an application | Applicants → click **Reject** | Rejects the application with optional reason |
| Identify candidates via analytics | Analytics | Use grade distribution and top performers charts to find deserving students |
| Check merit rankings | Merit Lists | Browse rankings to verify student eligibility before creating targeted scholarships |

### What the Dashboard Shows

The NGO dashboard shows **4 stat cards** — active scholarships, total applicants across all your programs, approval rate %, and top scholarship score. AI Insights analyze scholarship reach and suggest underserved demographics.

### ✅ CAN Do
- [x] Create new scholarships
- [x] Edit and close own scholarships
- [x] View all scholarship applications
- [x] Approve or reject applications
- [x] View student analytics (grades, scores, top performers)
- [x] View merit lists for eligibility assessment

### ❌ CANNOT Do
- [ ] Manage student records
- [ ] Upload data or certificates
- [ ] Apply for scholarships
- [ ] Access verification queue
- [ ] Trigger merit calculations
- [ ] Manage users or institutions
- [ ] View audit logs
- [ ] Train ML models or manage system settings

---

## 📒 Role 6: GOV_AUTHORITY — Sanjay Gupta

**Login:** `demo.govauthority@meritquest.dev` / `Demo@1234`

> The government authority role provides regional oversight — cross-institution analytics with exclusive Institution Comparison charts, regional merit rankings, scholarship program oversight, and full audit trail access for accountability.

### Sidebar Menu

| # | Page | Route | What It Shows |
|---|------|-------|---------------|
| 1 | Dashboard | `/dashboard` | Regional stats (total institutions, students across region, avg merit scores, scholarship coverage), AI equity insights |
| 2 | Regional Analytics | `/analytics` | Full analytics + **Institution Comparison chart** (exclusive to GOV_AUTHORITY & SYSTEM_ADMIN) |
| 3 | Merit Rankings | `/merit` | Cross-institution merit lists, trigger calculations, view merit config weights |
| 4 | Scholarships | `/scholarships` | Browse all scholarships, create government-backed scholarships, review applications |
| 5 | Audit Logs | `/audit-log` | Complete platform audit trail — track all administrative actions for accountability |

### Actions You Can Perform

| Action | Where | How |
|--------|-------|-----|
| View cross-institution analytics | Regional Analytics | See grade distribution, attendance trends, top performers, and score histogram across ALL institutions |
| Compare institutions | Regional Analytics → **Institution Comparison** | Exclusive benchmark chart comparing performance metrics across multiple institutions |
| View merit rankings | Merit Rankings | Browse regional merit lists; filter by academic year and institution |
| Trigger merit calculation | Merit Rankings → **Calculate Merit Scores** | Start async merit score recalculation across all institutions |
| View merit configuration | Merit Rankings → **Merit Config** section | See the weight distribution (academics 40%, attendance 20%, activities 20%, etc.) |
| Create a government scholarship | Scholarships → **Create Scholarship** | Create policy-level scholarship programs with eligibility criteria |
| Review applications | Scholarships → click any → **Applications** | View and decide on student applications (approve/reject) |
| Audit platform activity | Audit Logs | Filter by user, action type, date range — track every action on the platform |

### What the Analytics Page Shows (Enhanced)

The government analytics view includes everything the school admin sees **plus** the exclusive **Institution Comparison** section:
1. **Overview Cards** — Platform-wide totals (students, top merit score, completed/total batches)
2. **Grade Distribution** — Aggregated across all institutions
3. **Attendance Trends** — Regional monthly attendance averaged across all schools
4. **Top Performers** — Best students across the entire region
5. **Institution Comparison** ⭐ — Side-by-side benchmark chart comparing average scores, attendance, and merit across institutions (exclusive to GOV_AUTHORITY and SYSTEM_ADMIN)
6. **Score Histogram** — Distribution of all merit scores region-wide
7. **AI Insights** — Equity analysis, performance gap identification, and policy recommendations

### ✅ CAN Do
- [x] View cross-institution analytics with Institution Comparison (exclusive)
- [x] View regional merit rankings
- [x] Trigger merit calculations
- [x] View merit configuration weights
- [x] Create and manage government scholarships
- [x] Approve/reject scholarship applications
- [x] View complete audit logs
- [x] View platform-wide overview statistics

### ❌ CANNOT Do
- [ ] Manage individual student records
- [ ] Upload data or certificates
- [ ] Manage users or change user roles
- [ ] Manage institutions (create/edit/delete)
- [ ] Train ML models
- [ ] Update merit configuration weights (only SYSTEM_ADMIN)
- [ ] View/manage alerts

---

## 📔 Role 7: SYSTEM_ADMIN — Ayush Mishra

**Login:** `demo.sysadmin@meritquest.dev` / `Demo@1234`

> The system admin has **unrestricted access** to the entire platform — user and institution management, full analytics with institution comparison, merit configuration editing, scholarship management, ML model training, complete audit trail, and all student management capabilities.

### Sidebar Menu

| # | Page | Route | What It Shows |
|---|------|-------|---------------|
| 1 | Dashboard | `/dashboard` | Platform-wide stats (total users, institutions, students, merit batches), AI insights, system health |
| 2 | Users | `/admin/users` | All 173 users in sortable/searchable table with role and status management |
| 3 | Institutions | `/admin/institutions` | All 45 institutions with create, edit, and deactivate actions |
| 4 | Analytics | `/analytics` | Full analytics suite + Institution Comparison (exclusive) |
| 5 | Merit Lists | `/merit` | Full merit management — view, trigger calculation, view and **edit** merit configuration weights |
| 6 | Scholarships | `/scholarships` | All scholarships — create, edit, close, approve/reject applications |
| 7 | Audit Logs | `/audit-log` | Complete platform audit trail with full filtering |
| 8 | ML Models | `/admin/ml-models` | ML service health, model versions, accuracy metrics, and **Train New Model** action |

### Actions You Can Perform

| Action | Where | How |
|--------|-------|-----|
| Manage user roles | Users → click any user → role dropdown | Change a user's role (STUDENT, PARENT, SCHOOL_ADMIN, DATA_VERIFIER, NGO_REP, GOV_AUTHORITY, SYSTEM_ADMIN) |
| Activate/deactivate users | Users → status toggle | Switch user status between ACTIVE / INACTIVE / PENDING |
| Filter users | Users → filter bar | Filter by role, status, or institution |
| Create an institution | Institutions → **Create Institution** | Fill name, code, type (School/College/University), board, district, state, contact info |
| Edit an institution | Institutions → click **Edit** | Modify any institution field |
| Deactivate an institution | Institutions → **Deactivate** | Soft delete — institution becomes inactive |
| View full analytics | Analytics | All 7 chart sections including exclusive Institution Comparison |
| Trigger merit calculation | Merit Lists → **Calculate Merit Scores** | Async calculation across all institutions; cache automatically evicts on completion |
| Edit merit config weights | Merit Lists → **Merit Config** → **Edit** | Change weight percentages for academics (40%), attendance (20%), activities (20%), etc. |
| Create a scholarship | Scholarships → **Create Scholarship** | Full scholarship creation form |
| Approve/reject applications | Scholarships → applications list | Decide on any scholarship application platform-wide |
| View audit trail | Audit Logs | See every action with full filter and search |
| Check ML service health | ML Models → health indicator | Green = connected, Red = ML service down |
| Train a new ML model | ML Models → **Train New Model** | Triggers model training (Random Forest / Gradient Boosting / XGBoost) via the ML microservice |
| View model details | ML Models → click any model | See accuracy metrics, feature importances, and version history |

### What the Dashboard Shows

The system admin dashboard shows **4 stat cards** — Total Users, Total Institutions, Total Students, and Merit Batches (completed/total). Charts include grade distribution, top performers pie, monthly trends, and the AI Insights panel with platform-wide health analysis and anomaly detection.

### ✅ CAN Do (Everything)
- [x] Manage all users (roles, status)
- [x] Manage all institutions (CRUD)
- [x] View all analytics + Institution Comparison (exclusive)
- [x] Manage merit lists, trigger calculations, edit configuration weights
- [x] Create and manage all scholarships
- [x] Approve/reject all scholarship applications
- [x] View verification queue
- [x] View complete audit logs
- [x] Train and manage ML models
- [x] View ML service health
- [x] Manage all students + view detailed profiles
- [x] Bulk upload data
- [x] Manage certificates
- [x] Analytics cache automatically evicts after merit calculation

### ❌ CANNOT Do
- [ ] Nothing is restricted — SYSTEM_ADMIN has full platform access

---

## 📊 Quick Reference: Permission Matrix

| Feature | STUDENT | PARENT | SCHOOL_ADMIN | DATA_VERIFIER | NGO_REP | GOV_AUTHORITY | SYSTEM_ADMIN |
|---------|:-------:|:------:|:------------:|:-------------:|:-------:|:-------------:|:------------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Own Performance** | ✅ | ✅ | — | — | — | — | — |
| **Student Management** | — | — | ✅ | — | — | — | ✅ |
| **Student Detail View** | — | — | ✅ | — | — | — | ✅ |
| **Bulk Upload** | — | — | ✅ | — | — | — | ✅ |
| **Certificates** | — | — | ✅ | — | — | — | ✅ |
| **Merit Lists (view)** | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Merit Calculation** | — | — | ✅ | — | — | ✅ | ✅ |
| **Merit Config (view)** | — | — | — | — | — | ✅ | ✅ |
| **Merit Config (edit)** | — | — | — | — | — | — | ✅ |
| **Browse Scholarships** | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| **Apply for Scholarship** | ✅ | — | — | — | — | — | — |
| **Create Scholarship** | — | — | — | — | ✅ | ✅ | ✅ |
| **Decide Applications** | — | — | — | — | ✅ | ✅ | ✅ |
| **Verification Queue** | — | — | ✅ | ✅ | — | — | ✅ |
| **Verify/Decide Items** | — | — | — | ✅ | — | — | ✅ |
| **Analytics** | — | — | ✅ | — | ✅ | ✅ | ✅ |
| **Institution Comparison** | — | — | — | — | — | ✅ | ✅ |
| **Audit Logs** | — | — | — | ✅ | — | ✅ | ✅ |
| **User Management** | — | — | — | — | — | — | ✅ |
| **Institution Mgmt** | — | — | — | — | — | — | ✅ |
| **ML Models** | — | — | — | — | — | — | ✅ |
| **Alerts** | ✅ | ✅ | ✅ | — | — | — | ✅ |

---

## 🔄 Cross-Role Interaction Scenarios

These scenarios demonstrate how actions by one role propagate through the platform to other roles.

### Scenario 1: Scholarship Lifecycle
1. **NGO_REP** → Scholarships → **Create Scholarship** → Fill details and save
2. **STUDENT** → Scholarships → See the new scholarship appear → Click it → **Apply**
3. **NGO_REP** → Applicants → See the new application → **Approve** it
4. **STUDENT** → My Applications → See status changed to **APPROVED**

### Scenario 2: Data Verification Flow
1. **SCHOOL_ADMIN** → Bulk Upload → Upload a student CSV file
2. **DATA_VERIFIER** → Verification Queue → See new pending items from the upload → **Approve** or **Reject** each
3. **SCHOOL_ADMIN** → Students → See verified records now available for merit calculations

### Scenario 3: Merit Calculation Pipeline
1. **SCHOOL_ADMIN** → Merit Lists → Click **Calculate Merit Scores** → Wait for async processing
2. **STUDENT** → Merit Score → See updated rankings with new composite scores
3. **GOV_AUTHORITY** → Merit Rankings → See updated regional rankings across all institutions
4. **GOV_AUTHORITY** → Regional Analytics → Charts refresh with latest data (cache auto-evicts)

### Scenario 4: Admin Oversight
1. **SYSTEM_ADMIN** → Users → Change a user's role (e.g., promote to SCHOOL_ADMIN)
2. **GOV_AUTHORITY** → Audit Logs → See the role-change entry in the audit trail
3. **SYSTEM_ADMIN** → Analytics → View **Institution Comparison** benchmark chart

### Scenario 5: Alert Monitoring
1. **SCHOOL_ADMIN** → Alerts → **Generate Alert** for a specific student
2. **STUDENT** → Alerts → See the new alert notification
3. **PARENT** → Alerts → See the same alert about their child

### Scenario 6: ML Model Training
1. **SYSTEM_ADMIN** → ML Models → Check service health (green = connected)
2. **SYSTEM_ADMIN** → ML Models → Click **Train New Model** → Select algorithm → Start training
3. **SYSTEM_ADMIN** → ML Models → View the new model version with accuracy metrics

---

## 🔗 Where Changes Become Visible

| Action Performed | By Role | Visible To | Where to Check |
|-----------------|---------|------------|----------------|
| New student created | SCHOOL_ADMIN | SYSTEM_ADMIN, other admins | `/students` page |
| Student record edited | SCHOOL_ADMIN | All roles viewing that student | `/students/:id` detail |
| Bulk data uploaded | SCHOOL_ADMIN | DATA_VERIFIER | `/verification` queue |
| Record verified/rejected | DATA_VERIFIER | SCHOOL_ADMIN, SYSTEM_ADMIN | `/verification` |
| Merit scores calculated | SCHOOL_ADMIN / GOV | ALL roles | `/merit` rankings |
| Scholarship created | NGO_REP | STUDENT, PARENT, all roles | `/scholarships` |
| Applied for scholarship | STUDENT | NGO_REP | `/applicants` |
| Application approved | NGO_REP | STUDENT | `/my-applications` |
| User role changed | SYSTEM_ADMIN | That user (after re-login) | Sidebar menu changes |
| User deactivated | SYSTEM_ADMIN | That user | Cannot login |
| Institution created | SYSTEM_ADMIN | All roles | Dropdowns & filters |
| Alert generated | SCHOOL_ADMIN | STUDENT, PARENT | `/alerts` page |
| ML model trained | SYSTEM_ADMIN | SYSTEM_ADMIN | `/admin/ml-models` |
| Any action | Any role | GOV, SYSADMIN, VERIFIER | `/audit-log` |

---

## ⚙️ Technical Notes

- **Authentication** — JWT-based (access token: 15 min, refresh token: 7 days). Stored in `localStorage` under key `mq-auth`. Auto-refresh on expiry.
- **Session Persistence** — Closing the browser keeps you logged in. Click **Logout** in the sidebar to clear tokens.
- **Role Enforcement** — Both frontend (React route guards) and backend (Spring Security `@PreAuthorize`) enforce access. Unauthorized API calls return `403 Forbidden`.
- **Caching** — Redis caches analytics data (overview: 30 min, trends: 1 hr). Cache auto-evicts when merit calculations complete.
- **Database** — PostgreSQL 16 with Flyway migrations (V1–V9). Seeded with 173 users, 45 institutions, 510 students, 1,100+ merit scores.
- **File Storage** — MinIO handles certificate uploads and bulk CSV files. Console available at http://localhost:9001 (user: `minioadmin`, pass: `minioadmin123`).
- **ML Service** — FastAPI microservice supporting Random Forest, Gradient Boosting, and XGBoost models for dropout prediction and risk alerts.
