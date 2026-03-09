# Merit Quest — Demo Accounts & Role Walkthrough

> **App URL:** http://localhost:3000  
> **Backend API:** http://localhost:8080  
> **All demo accounts use password:** `Demo@1234`

---

## Demo Login Credentials

| # | Role | Email | Name | Institution | Password |
|---|------|-------|------|-------------|----------|
| 1 | **STUDENT** | `demo.student@meritquest.dev` | Aarav Sharma | Delhi Public School Central | `Demo@1234` |
| 2 | **PARENT** | `demo.parent@meritquest.dev` | Rajesh Sharma | Delhi Public School Central | `Demo@1234` |
| 3 | **SCHOOL_ADMIN** | `demo.schooladmin@meritquest.dev` | Priya Mehta | Delhi Public School Central | `Demo@1234` |
| 4 | **DATA_VERIFIER** | `demo.verifier@meritquest.dev` | Vikram Patel | — (cross-institution) | `Demo@1234` |
| 5 | **NGO_REP** | `demo.ngorep@meritquest.dev` | Ananya Desai | — (cross-institution) | `Demo@1234` |
| 6 | **GOV_AUTHORITY** | `demo.govauthority@meritquest.dev` | Sanjay Gupta | — (cross-institution) | `Demo@1234` |
| 7 | **SYSTEM_ADMIN** | `demo.sysadmin@meritquest.dev` | Neha Kumar | Delhi Public School Central | `Demo@1234` |

> **Also available:** Original admin account — `admin@meritquest.dev` / `Admin@123`  
> **165 generated users** (school admins, verifiers, students, parents, etc.) all use password: `Test@1234`

---

## How to Login

1. Open **http://localhost:3000** in your browser
2. Click **Login** (or navigate to `/login`)
3. Enter the **Email** and **Password** from the table above
4. Click **Sign In**
5. You'll be redirected to the **Dashboard** tailored for that role

---

## Role 1: STUDENT — Aarav Sharma

**Login:** `demo.student@meritquest.dev` / `Demo@1234`

### Sidebar Menu
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Personal stats, AI insights, quick actions |
| My Performance | `/performance` | Academic charts, subject analysis, grade trends |
| Merit Score | `/merit` | View merit lists and personal score history |
| Scholarships | `/scholarships` | Browse all available scholarships |
| My Applications | `/my-applications` | Track scholarship applications & status |
| Alerts | `/alerts` | AI-generated academic alerts & notifications |

### Walkthrough Steps

1. **Dashboard** — View your personalized stat cards (GPA, attendance, merit rank). See AI-generated insights like "Your attendance is above 90%" or "Consider applying for scholarships."

2. **My Performance** (`/performance`) — View:
   - Academic performance charts (subject-wise bar chart)
   - Grade trend lines over semesters
   - Attendance statistics
   - Subject-wise radar chart comparison

3. **Merit Score** (`/merit`) — View:
   - Current merit ranking among all students
   - Historical merit score trend chart
   - Merit list by academic year

4. **Scholarships** (`/scholarships`) — Browse available scholarships:
   - View scholarship names, amounts, deadlines, organization
   - Click any scholarship to see full details
   - Click **Apply** button on eligible scholarships

5. **My Applications** (`/my-applications`) — Track:
   - All scholarship applications you've submitted
   - Application status (PENDING / APPROVED / REJECTED)
   - Withdraw an application if still pending

6. **Alerts** (`/alerts`) — View AI-generated alerts about:
   - Attendance drops
   - Grade changes
   - Merit score updates
   - Scholarship deadlines

### CAN Do
- [x] View own performance data and analytics
- [x] View merit lists and own merit score history
- [x] Browse all scholarships
- [x] Apply to eligible scholarships
- [x] Withdraw pending scholarship applications
- [x] View personal alerts

### CANNOT Do
- [ ] View other students' data
- [ ] Manage students, bulk upload, or certificates
- [ ] Create or edit scholarships
- [ ] Approve/reject scholarship applications
- [ ] Access verification queue or audit logs
- [ ] Access admin panels (users, institutions, ML models)
- [ ] Trigger merit calculations
- [ ] View institution-wide analytics

---

## Role 2: PARENT — Rajesh Sharma

**Login:** `demo.parent@meritquest.dev` / `Demo@1234`

### Sidebar Menu
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Child monitoring overview, AI insights |
| Child Performance | `/performance` | Track child's academic progress |
| Merit Score | `/merit` | View child's merit ranking |
| Scholarships | `/scholarships` | Browse scholarship opportunities |
| Alerts | `/alerts` | Receive alerts about child's progress |

### Walkthrough Steps

1. **Dashboard** — View child-focused stat cards (child's GPA, attendance rate, merit rank). AI insights tailored for parents: "Your child's math score improved by 15%" etc.

2. **Child Performance** (`/performance`) — Monitor:
   - Child's subject-wise marks and grades
   - Attendance trends
   - Performance comparison charts

3. **Merit Score** (`/merit`) — View:
   - Child's position in merit rankings
   - Score history over time

4. **Scholarships** (`/scholarships`) — Browse available scholarships to advise your child. View eligibility criteria and deadlines.

5. **Alerts** (`/alerts`) — Receive notifications about:
   - Child's attendance drops or improvements
   - Grade changes and academic milestones
   - Available scholarships matching child's profile

### CAN Do
- [x] View child's performance and analytics
- [x] View merit lists and child's score history
- [x] Browse scholarships
- [x] View child-related alerts

### CANNOT Do
- [ ] Apply for scholarships (only the student can)
- [ ] Manage students, upload data, or certificates
- [ ] Create or manage scholarships
- [ ] Access verification queue or audit logs
- [ ] Access admin panels
- [ ] Trigger merit calculations

---

## Role 3: SCHOOL_ADMIN — Priya Mehta

**Login:** `demo.schooladmin@meritquest.dev` / `Demo@1234`

### Sidebar Menu
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Institution overview, charts, AI insights |
| Students | `/students` | Full student management CRUD |
| Bulk Upload | `/upload` | CSV bulk upload for student data |
| Merit Lists | `/merit` | View & trigger merit calculations |
| Analytics | `/analytics` | Rich analytics with charts & graphs |
| Certificates | `/certificates` | Manage student certificates |
| Alerts | `/alerts` | Institution-wide alert monitoring |

### Walkthrough Steps

1. **Dashboard** — View institution-level stat cards (total students, average GPA, overall attendance, verification status). Mini charts showing grade distribution, top performers pie chart, and AI insights panel.

2. **Students** (`/students`) — Full student management:
   - View all students in a searchable, sortable table
   - Click **+ Add Student** to create new student records
   - Click the **Eye icon** (👁) to view detailed student profile at `/students/:id`
   - **Student Detail page**: View comprehensive profile with:
     - Personal info card
     - Performance summary with CountUp stats
     - Merit score trend chart (AreaChart)
     - Subject radar & bar charts
     - AI analysis panel
     - Admin notes (editable textarea)
     - Download student report as .txt
     - Merit history table
   - Edit student information
   - Delete student records

3. **Bulk Upload** (`/upload`) — Upload CSV files:
   - Upload student data in bulk (CSV format)
   - View upload history and status
   - Track processing progress of uploads

4. **Merit Lists** (`/merit`) — View and manage merit:
   - View merit rankings
   - Trigger merit score calculation for the institution

5. **Analytics** (`/analytics`) — Rich analytics dashboard:
   - Overview stat cards with animated CountUp numbers
   - Grade distribution bar chart
   - Attendance trends (gradient AreaChart)
   - Top performers table
   - Subject performance analysis
   - Score histogram
   - AI Analytics Insights panel with real-time analysis

6. **Certificates** (`/certificates`) — Manage certificates:
   - Upload certificates for students
   - View certificates by student
   - Download or delete certificates

7. **Alerts** (`/alerts`) — Monitor institutional alerts:
   - View all alerts for the institution
   - Acknowledge alerts
   - Generate alerts for specific students

### CAN Do
- [x] View and manage all students in their institution
- [x] Create, update, and delete student records
- [x] View detailed student profiles with AI analysis
- [x] Bulk upload student data via CSV
- [x] View institution analytics (grades, attendance, performance)
- [x] Trigger merit score calculations
- [x] View verification queue
- [x] Upload and manage certificates
- [x] View and acknowledge institution alerts
- [x] Generate alerts for students

### CANNOT Do
- [ ] Manage users or institutions (admin-only)
- [ ] Create or manage scholarships
- [ ] Decide on scholarship applications
- [ ] Access audit logs
- [ ] Train ML models
- [ ] Compare institutions (system-wide analytics)
- [ ] Update merit configuration weights
- [ ] Decide on verification items (only verifiers can)

---

## Role 4: DATA_VERIFIER — Vikram Patel

**Login:** `demo.verifier@meritquest.dev` / `Demo@1234`

### Sidebar Menu
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Verification workload overview, AI insights |
| Verification Queue | `/verification` | Review & verify student records |
| Merit Lists | `/merit` | View merit lists (read-only) |
| Audit Log | `/audit-log` | Review platform audit trail |

### Walkthrough Steps

1. **Dashboard** — View verifier-specific stat cards (pending verifications, completed verifications, verification rate). AI insights about verification backlogs.

2. **Verification Queue** (`/verification`) — Core workflow:
   - View all pending verification requests in a queue
   - Filter by status: PENDING, APPROVED, REJECTED
   - Click on any item to view detailed record
   - **Approve** or **Reject** student data submissions
   - Add verification notes/comments

3. **Merit Lists** (`/merit`) — View merit rankings:
   - Browse merit lists by academic year
   - View student scores (read-only)
   - Cannot trigger recalculations

4. **Audit Log** (`/audit-log`) — Review audit trail:
   - View platform-wide action logs
   - Filter by action type, user, date range
   - Track who did what and when

### CAN Do
- [x] View verification queue (all institutions)
- [x] Approve or reject verification items
- [x] View merit lists (read-only)
- [x] View audit logs
- [x] View analytics overview and grade distribution

### CANNOT Do
- [ ] Manage students (CRUD operations)
- [ ] Upload data or certificates
- [ ] Create or manage scholarships
- [ ] Apply for scholarships
- [ ] Trigger merit calculations
- [ ] Manage users or institutions
- [ ] View or manage alerts
- [ ] Access ML model management

---

## Role 5: NGO_REP — Ananya Desai

**Login:** `demo.ngorep@meritquest.dev` / `Demo@1234`

### Sidebar Menu
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Scholarship overview, AI insights |
| Scholarships | `/scholarships` | Create & manage scholarships |
| Applicants | `/applicants` | Review scholarship applications |
| Analytics | `/analytics` | View student analytics for targeting |
| Merit Lists | `/merit` | View merit lists for eligibility |

### Walkthrough Steps

1. **Dashboard** — View NGO-specific stat cards (active scholarships, total applicants, approval rate). AI insights about scholarship impact and reach.

2. **Scholarships** (`/scholarships`) — Full scholarship lifecycle:
   - Click **Create Scholarship** to create a new one at `/scholarships/create`:
     - Set title, description, organization details
     - Define amount, currency, total slots
     - Set eligibility criteria and deadline
   - View **My Scholarships** (ones you created)
   - Edit existing scholarships at `/scholarships/:id/edit`
   - Close a scholarship to stop accepting applications

3. **Applicants** (`/applicants`) — Review & decide:
   - View all applications for your scholarships
   - See applicant details (name, merit score, grades)
   - **Approve** or **Reject** individual applications
   - View eligible students who haven't applied yet

4. **Analytics** (`/analytics`) — View analytics:
   - Grade distribution of students
   - Top performers (for scholarship targeting)
   - Score histogram
   - Overview stats

5. **Merit Lists** (`/merit`) — View merit rankings to identify deserving students.

### CAN Do
- [x] Create new scholarships
- [x] Edit own scholarships
- [x] Close own scholarships
- [x] View all scholarship applications
- [x] Approve or reject scholarship applications
- [x] View eligible students for scholarships
- [x] View student analytics (grades, scores, top performers)
- [x] View merit lists

### CANNOT Do
- [ ] Manage student records
- [ ] Upload data or certificates
- [ ] Apply for scholarships
- [ ] Access verification queue
- [ ] Trigger merit calculations
- [ ] Manage users or institutions
- [ ] View audit logs
- [ ] Train ML models or manage system settings

---

## Role 6: GOV_AUTHORITY — Sanjay Gupta

**Login:** `demo.govauthority@meritquest.dev` / `Demo@1234`

### Sidebar Menu
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Regional oversight, AI insights |
| Regional Analytics | `/analytics` | Cross-institution analytics |
| Merit Rankings | `/merit` | State/region merit lists |
| Scholarships | `/scholarships` | Oversee scholarship programs |
| Audit Logs | `/audit-log` | Platform accountability trail |

### Walkthrough Steps

1. **Dashboard** — View government-level stat cards (total institutions, total students across region, average merit scores, scholarship coverage). AI insights about educational equity and regional performance gaps.

2. **Regional Analytics** (`/analytics`) — Comprehensive cross-institution analytics:
   - Overview stat cards with animated numbers
   - Grade distribution across all institutions
   - Attendance trends analysis
   - Top performers across the region
   - **Institution Comparison chart** (exclusive to GOV_AUTHORITY + SYSTEM_ADMIN)
   - Score histogram
   - AI Analytics Insights panel with equity gap analysis

3. **Merit Rankings** (`/merit`) — Regional merit oversight:
   - View merit lists across all institutions
   - Trigger merit calculations
   - View merit configuration (weights for academics, attendance, activities)

4. **Scholarships** (`/scholarships`) — Oversee scholarships:
   - Browse all available scholarships
   - Create government scholarships
   - Review and decide on applications
   - View eligible students

5. **Audit Logs** (`/audit-log`) — Accountability & oversight:
   - View complete platform audit trail
   - Track all administrative actions
   - Filter by user, action type, date

### CAN Do
- [x] View cross-institution analytics (Institution Comparison)
- [x] View regional merit rankings
- [x] Trigger merit calculations
- [x] View merit configuration
- [x] Create and manage government scholarships
- [x] Approve/reject scholarship applications
- [x] View all audit logs
- [x] View platform-wide overview statistics

### CANNOT Do
- [ ] Manage individual student records
- [ ] Upload data or certificates
- [ ] Manage users or change user roles
- [ ] Manage institutions (create/edit/delete)
- [ ] Train ML models
- [ ] Update merit configuration weights (only SYSTEM_ADMIN)
- [ ] Evict analytics cache
- [ ] View/manage alerts

---

## Role 7: SYSTEM_ADMIN — Neha Kumar

**Login:** `demo.sysadmin@meritquest.dev` / `Demo@1234`

### Sidebar Menu
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Full platform overview, AI insights |
| Users | `/admin/users` | User management (roles, status) |
| Institutions | `/admin/institutions` | Institution CRUD management |
| Analytics | `/analytics` | All analytics + institution comparison |
| Merit Lists | `/merit` | Full merit management + config |
| Scholarships | `/scholarships` | All scholarship management |
| Audit Logs | `/audit-log` | Complete audit trail |
| ML Models | `/admin/ml-models` | ML model training & health |

### Walkthrough Steps

1. **Dashboard** — Full platform stat cards (total users, total institutions, total students, system health). AI insights about platform-wide metrics, anomalies, and recommendations.

2. **Users** (`/admin/users`) — User management:
   - View all 173 users in sortable/searchable table
   - **Update user roles** — Change any user's role (dropdown)
   - **Update user status** — Activate/deactivate accounts (ACTIVE/INACTIVE/PENDING)
   - Filter users by role, status, institution

3. **Institutions** (`/admin/institutions`) — Institution management:
   - View all 45 institutions
   - **Create new institution** — fill name, code, type, board, district, state, contact info
   - **Edit institution** details
   - **Deactivate institution** (soft delete)

4. **Analytics** (`/analytics`) — Full analytics suite:
   - All charts and graphs (grade distribution, attendance trends, top performers)
   - **Institution Comparison** — multi-institution benchmark chart (exclusive)
   - Score histogram
   - AI Analytics Insights
   - **Cache eviction** — Clear analytics cache via API

5. **Merit Lists** (`/merit`) — Full merit management:
   - View all merit lists
   - Trigger merit calculations
   - View merit configuration
   - **Update merit configuration** — Change weights for academics (40%), attendance (20%), activities (20%), etc.

6. **Scholarships** (`/scholarships`) — Full scholarship management:
   - Create, edit, close scholarships
   - View all applications across all scholarships
   - Approve/reject applications

7. **Audit Logs** (`/audit-log`) — Complete audit access:
   - View every action taken on the platform
   - Full filtering and search

8. **ML Models** (`/admin/ml-models`) — Machine Learning management:
   - View ML service health status
   - List trained model versions
   - **Train new ML model** — Trigger model training
   - View model details and accuracy metrics

### CAN Do (Everything)
- [x] Manage all users (roles, status)
- [x] Manage all institutions (CRUD)
- [x] View all analytics + institution comparison (exclusive)
- [x] Manage merit lists, trigger calculations, update configuration
- [x] Create and manage all scholarships
- [x] Approve/reject all scholarship applications
- [x] View verification queue
- [x] View all audit logs
- [x] Train and manage ML models
- [x] View ML service health
- [x] Manage all students + view detailed profiles
- [x] Bulk upload data
- [x] Manage certificates
- [x] Evict analytics cache

### CANNOT Do
- [ ] Nothing is restricted — SYSTEM_ADMIN has full platform access

---

## Quick Reference: Permission Matrix

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

## Realtime Updates — Where to See Changes

When one role performs an action, other roles can see the update by refreshing their page:

| Action Performed | By Role | Visible To | Where to Check |
|-----------------|---------|------------|----------------|
| New student created | SCHOOL_ADMIN | SYSTEM_ADMIN, other SCHOOL_ADMINs | `/students` page |
| Student record edited | SCHOOL_ADMIN | All roles viewing that student | `/students/:id` detail |
| Bulk data uploaded | SCHOOL_ADMIN | DATA_VERIFIER → items appear in queue | `/verification` |
| Record verified/rejected | DATA_VERIFIER | SCHOOL_ADMIN, SYSTEM_ADMIN | `/verification` |
| Merit score calculated | SCHOOL_ADMIN / GOV | ALL roles → scores update | `/merit` |
| Scholarship created | NGO_REP | STUDENT, PARENT, all roles | `/scholarships` |
| Applied for scholarship | STUDENT | NGO_REP → sees in applicants | `/applicants` |
| Application approved | NGO_REP | STUDENT → status changes | `/my-applications` |
| User role changed | SYSTEM_ADMIN | That user → different sidebar/menu | After re-login |
| User deactivated | SYSTEM_ADMIN | That user → cannot login | Login page |
| Institution created | SYSTEM_ADMIN | All roles | Visible in dropdowns |
| Alert generated | SCHOOL_ADMIN | STUDENT, PARENT | `/alerts` page |
| ML model trained | SYSTEM_ADMIN | SYSTEM_ADMIN | `/admin/ml-models` |
| Audit action logged | Any action | GOV_AUTHORITY, SYSTEM_ADMIN, DATA_VERIFIER | `/audit-log` |

### Cross-Role Testing Scenarios

**Scenario 1: Scholarship Lifecycle**
1. Login as **NGO_REP** (`demo.ngorep@meritquest.dev`) → Go to `/scholarships` → Create a new scholarship
2. Login as **STUDENT** (`demo.student@meritquest.dev`) → Go to `/scholarships` → See the new scholarship → Apply
3. Login as **NGO_REP** again → Go to `/applicants` → See the application → Approve it
4. Login as **STUDENT** → Go to `/my-applications` → See status changed to APPROVED

**Scenario 2: Data Verification Flow**
1. Login as **SCHOOL_ADMIN** (`demo.schooladmin@meritquest.dev`) → Go to `/upload` → Upload a CSV
2. Login as **DATA_VERIFIER** (`demo.verifier@meritquest.dev`) → Go to `/verification` → See new pending items → Approve/Reject
3. Login as **SCHOOL_ADMIN** → Go to `/verification` → See the decision

**Scenario 3: Merit Calculation**
1. Login as **SCHOOL_ADMIN** → Go to `/merit` → Click "Calculate Merit Scores"
2. Login as **STUDENT** → Go to `/merit` → See updated merit rankings
3. Login as **GOV_AUTHORITY** (`demo.govauthority@meritquest.dev`) → Go to `/merit` → See updated regional rankings

**Scenario 4: Admin Oversight**
1. Login as **SYSTEM_ADMIN** (`demo.sysadmin@meritquest.dev`) → Go to `/admin/users` → Change a user's role
2. Login as **GOV_AUTHORITY** → Go to `/audit-log` → See the role-change audit entry
3. Login as **SYSTEM_ADMIN** → Go to `/analytics` → View Institution Comparison chart

**Scenario 5: Alert Monitoring**
1. Login as **SCHOOL_ADMIN** → Go to `/alerts` → Generate alert for a student
2. Login as **STUDENT** → Go to `/alerts` → See the new alert
3. Login as **PARENT** → Go to `/alerts` → See the alert for their child

---

## Technical Notes

- **JWT Tokens**: After login, the app stores an access token and refresh token in `localStorage` under key `mq-auth`
- **Token Refresh**: When the access token expires, the app automatically refreshes using the refresh token
- **Session Persistence**: Closing and reopening the browser keeps you logged in (tokens persist in localStorage)
- **Logout**: Click the logout button in the sidebar to clear tokens and return to login
- **Role Enforcement**: Both frontend (route guards) and backend (Spring Security @PreAuthorize) enforce role-based access — unauthorized API calls return 403 Forbidden
