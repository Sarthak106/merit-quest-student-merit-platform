import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  BarChart3, Users, ClipboardCheck, Award, GraduationCap, Shield, BookOpen,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Brain, RefreshCw,
  ArrowRight, Building2, Activity, Target, Sparkles, Settings, Upload,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import CountUp from '../components/ui/CountUp';
import PageTransition from '../components/ui/PageTransition';

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const CHART_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const ROLE_META = {
  STUDENT:       { title: 'Student Dashboard',       subtitle: 'Track your academic performance and discover scholarships',  icon: GraduationCap, gradient: 'from-indigo-600  to-blue-600',    accent: 'indigo' },
  PARENT:        { title: 'Parent Dashboard',         subtitle: "Monitor your child's academic journey",                     icon: Users,         gradient: 'from-purple-600  to-indigo-600',  accent: 'purple' },
  SCHOOL_ADMIN:  { title: 'School Administrator',     subtitle: 'Manage student records and institutional data',             icon: Shield,        gradient: 'from-emerald-600 to-teal-600',    accent: 'emerald' },
  DATA_VERIFIER: { title: 'Data Verifier',            subtitle: 'Review and approve submitted student records',              icon: ClipboardCheck,gradient: 'from-amber-600   to-orange-600',  accent: 'amber' },
  NGO_REP:       { title: 'NGO Dashboard',            subtitle: 'Post scholarships and track student outreach impact',       icon: BookOpen,      gradient: 'from-green-600   to-emerald-600', accent: 'green' },
  GOV_AUTHORITY: { title: 'Government Dashboard',     subtitle: 'Regional analytics, merit insights, and policy tools',      icon: Shield,        gradient: 'from-indigo-600  to-violet-600',  accent: 'indigo' },
  SYSTEM_ADMIN:  { title: 'System Administration',    subtitle: 'Full platform management and monitoring',                   icon: Shield,        gradient: 'from-red-600     to-rose-600',    accent: 'red' },
};

const NAV_CARDS = {
  STUDENT:       [
    { title: 'My Performance',  desc: 'Grades, ranking & trends',       icon: BarChart3,      path: '/performance' },
    { title: 'Merit Score',     desc: 'Composite merit ranking',         icon: Award,          path: '/merit' },
    { title: 'Scholarships',    desc: 'Discover & apply',                icon: BookOpen,       path: '/scholarships' },
  ],
  PARENT:        [
    { title: 'Child Performance', desc: 'Track academic progress',       icon: BarChart3,      path: '/performance' },
    { title: 'Merit Ranking',     desc: 'Rankings across schools',       icon: Award,          path: '/merit' },
    { title: 'Scholarships',      desc: 'Scholarship opportunities',     icon: BookOpen,       path: '/scholarships' },
  ],
  SCHOOL_ADMIN:  [
    { title: 'Student Records',  desc: 'Manage & upload data',           icon: Users,          path: '/students' },
    { title: 'Bulk Uploads',     desc: 'CSV / Excel batch import',       icon: Upload,         path: '/upload' },
    { title: 'School Analytics', desc: 'Performance overview',           icon: BarChart3,      path: '/analytics' },
    { title: 'Merit Lists',     desc: 'School-level rankings',           icon: Award,          path: '/merit' },
  ],
  DATA_VERIFIER: [
    { title: 'Verification Queue', desc: 'Pending records to review',   icon: ClipboardCheck, path: '/verification' },
    { title: 'Merit Lists',        desc: 'View merit rankings',         icon: Award,          path: '/merit' },
    { title: 'Audit Log',          desc: 'Activity history',            icon: Shield,         path: '/audit-log' },
  ],
  NGO_REP:       [
    { title: 'Post Scholarship',  desc: 'Create new offers',             icon: BookOpen,       path: '/scholarships/create' },
    { title: 'Applicants',        desc: 'Review applications',           icon: Users,          path: '/applicants' },
    { title: 'Impact Analytics',  desc: 'Track reach & outcomes',        icon: BarChart3,      path: '/analytics' },
  ],
  GOV_AUTHORITY: [
    { title: 'Regional Analytics', desc: 'District & state stats',      icon: BarChart3,      path: '/analytics' },
    { title: 'Merit Rankings',     desc: 'Cross-school comparisons',    icon: Award,          path: '/merit' },
    { title: 'Scholarships',       desc: 'Government scholarships',     icon: BookOpen,       path: '/scholarships' },
    { title: 'Audit Logs',         desc: 'System audit trail',          icon: ClipboardCheck, path: '/audit-log' },
  ],
  SYSTEM_ADMIN:  [
    { title: 'User Management',   desc: 'Manage users & roles',         icon: Users,          path: '/admin/users' },
    { title: 'Institutions',      desc: 'Schools & colleges',           icon: Building2,      path: '/admin/institutions' },
    { title: 'System Analytics',  desc: 'Platform-wide stats',          icon: BarChart3,      path: '/analytics' },
    { title: 'ML Models',         desc: 'Prediction models',            icon: Settings,       path: '/admin/ml-models' },
    { title: 'Audit Logs',        desc: 'Full audit trail',             icon: ClipboardCheck, path: '/audit-log' },
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   AI INSIGHTS GENERATOR  (client-side heuristic analysis)
   ═══════════════════════════════════════════════════════════════════ */

function generateInsights(role, d) {
  const out = [];
  const ov = d.overview;

  if (role === 'STUDENT') {
    const total = d.scholarships?.totalElements ?? 0;
    const apps  = d.myApplications?.totalElements ?? 0;
    if (total > 0 && apps === 0) out.push({ type: 'info', text: `There are ${total} scholarships available. Consider applying to boost your academic profile.` });
    if (apps > 0) out.push({ type: 'success', text: `You have ${apps} active application(s). Track their status under My Applications.` });
    out.push({ type: 'info', text: 'Keep your attendance above 90% — it directly impacts your merit score weighting.' });
    return out;
  }
  if (role === 'PARENT') {
    out.push({ type: 'info', text: 'Encourage consistent attendance — the merit formula weights regularity heavily.' });
    out.push({ type: 'info', text: 'Review your child\'s performance trends monthly for early intervention.' });
    return out;
  }

  // Analytics-capable roles
  if (ov) {
    const approvalRate = ov.totalStudents > 0 ? ((ov.approvedStudents / ov.totalStudents) * 100) : 0;
    if (approvalRate < 70) out.push({ type: 'warning', text: `Only ${approvalRate.toFixed(0)}% of students are verified. Consider expediting the verification queue.` });
    else out.push({ type: 'success', text: `${approvalRate.toFixed(0)}% student verification rate — healthy pipeline.` });

    if (ov.averageCompositeScore != null) {
      const avg = ov.averageCompositeScore;
      if (avg > 0.7) out.push({ type: 'success', text: `Average composite score of ${avg.toFixed(2)} indicates strong overall performance.` });
      else if (avg < 0.4) out.push({ type: 'danger', text: `Average composite score ${avg.toFixed(2)} is below threshold — investigate attendance & academics.` });
      else out.push({ type: 'info', text: `Average composite score is ${avg.toFixed(2)}. Targeted interventions could push this higher.` });
    }

    if (ov.pendingVerification > 10) out.push({ type: 'warning', text: `${ov.pendingVerification} records await verification — delays may impact merit calculations.` });
  }

  if (role === 'DATA_VERIFIER') {
    const pending = d.verifications?.totalElements ?? 0;
    if (pending > 20) out.push({ type: 'warning', text: `${pending} records in the queue — prioritize flagged entries for faster turnaround.` });
    else if (pending > 0) out.push({ type: 'info', text: `${pending} record(s) awaiting review. Queue is manageable.` });
    else out.push({ type: 'success', text: 'Verification queue is clear. All records processed.' });
  }

  if (role === 'NGO_REP') {
    const mine = d.myScholarships?.totalElements ?? 0;
    out.push({ type: 'info', text: `You manage ${mine} scholarship(s). Track applicant quality via Impact Analytics.` });
  }

  if (role === 'GOV_AUTHORITY' && d.institutionComparison?.length > 1) {
    const scores = d.institutionComparison.map(i => i.avgCompositeScore).filter(Boolean);
    if (scores.length > 1) {
      const gap = Math.max(...scores) - Math.min(...scores);
      out.push({ type: gap > 0.3 ? 'warning' : 'info', text: `Score gap between institutions is ${gap.toFixed(2)}. ${gap > 0.3 ? 'Consider equity interventions.' : 'Fairly uniform performance.'}` });
    }
  }

  if (role === 'SYSTEM_ADMIN') {
    if (d.mlHealth?.healthy) out.push({ type: 'success', text: 'ML prediction service is healthy and responsive.' });
    else out.push({ type: 'danger', text: 'ML prediction service is DOWN. Model training and predictions will fail.' });
    if (ov?.totalInstitutions) out.push({ type: 'info', text: `${ov.totalInstitutions} institutions onboarded across the platform.` });
  }

  if (d.topPerformers?.length > 0) {
    const top = d.topPerformers[0];
    out.push({ type: 'success', text: `Top performer: ${top.studentName} with composite score ${top.compositeScore?.toFixed(4) ?? '—'}.` });
  }

  return out;
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon: Icon, colorClass, delay = 0 }) {
  const isNum = typeof value === 'number';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {isNum ? <CountUp to={value} duration={1.2} /> : value}
      </p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </motion.div>
  );
}

function MiniChartCard({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      {children}
    </motion.div>
  );
}

function InsightPanel({ insights, delay = 0 }) {
  if (!insights?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 border border-indigo-100 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="font-semibold text-indigo-900">AI Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delay + i * 0.08 }}
            className="flex items-start gap-3"
          >
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
              ins.type === 'success' ? 'bg-emerald-500' :
              ins.type === 'warning' ? 'bg-amber-500' :
              ins.type === 'danger'  ? 'bg-red-500'    : 'bg-indigo-500'
            }`} />
            <p className="text-sm text-slate-700 leading-relaxed">{ins.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const TOOLTIP_STYLE = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, color: '#334155' };

/* ═══════════════════════════════════════════════════════════════════
   ROLE-SPECIFIC CHART SECTIONS
   ═══════════════════════════════════════════════════════════════════ */

function AnalyticsCharts({ data }) {
  const gd = data.gradeDistribution || [];
  const sh = data.scoreHistogram    || [];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {gd.length > 0 && (
        <MiniChartCard title="Score by Grade" delay={0.3}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={gd}>
              <XAxis dataKey="grade" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="avgCompositeScore" fill="#4f46e5" radius={[4,4,0,0]} />
              <Bar dataKey="avgAcademicZScore" fill="#0ea5e9" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </MiniChartCard>
      )}
      {sh.length > 0 && (
        <MiniChartCard title="Composite Score Distribution" delay={0.35}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sh}>
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {sh.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </MiniChartCard>
      )}
    </div>
  );
}

function TopPerformersMini({ list = [] }) {
  if (!list.length) return null;
  return (
    <MiniChartCard title="Top Performers" delay={0.4}>
      <div className="space-y-2">
        {list.slice(0, 5).map((tp, i) => (
          <div key={tp.studentId} className="flex items-center gap-3">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white ${
              i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-300'
            }`}>{i + 1}</span>
            <span className="text-sm text-slate-700 truncate flex-1">{tp.studentName}</span>
            <span className="text-xs font-semibold text-indigo-600">{tp.compositeScore?.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </MiniChartCard>
  );
}

function ScholarshipPie({ data }) {
  const apps = data.myApplications?.content || [];
  if (!apps.length) return null;
  const statusCounts = {};
  apps.forEach(a => { statusCounts[a.status || 'PENDING'] = (statusCounts[a.status || 'PENDING'] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const colorMap = { PENDING: '#f59e0b', APPROVED: '#10b981', REJECTED: '#ef4444', WITHDRAWN: '#94a3b8' };
  return (
    <MiniChartCard title="Application Status" delay={0.3}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
            {pieData.map((entry, i) => <Cell key={i} fill={colorMap[entry.name] || CHART_COLORS[i]} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {pieData.map((entry, i) => (
          <span key={i} className="flex items-center gap-1 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[entry.name] || CHART_COLORS[i] }} />
            {entry.name} ({entry.value})
          </span>
        ))}
      </div>
    </MiniChartCard>
  );
}

function InstitutionComparisonMini({ list = [] }) {
  if (!list.length) return null;
  const data = list.slice(0, 8).map(i => ({ name: i.institutionName?.substring(0, 15), score: +(i.avgCompositeScore?.toFixed(3) ?? 0) }));
  return (
    <MiniChartCard title="Institution Comparison" delay={0.35}>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="instGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="score" stroke="#4f46e5" fill="url(#instGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </MiniChartCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { user }   = useAuthStore();
  const navigate    = useNavigate();
  const role        = user?.role || 'STUDENT';
  const meta        = ROLE_META[role] || ROLE_META.STUDENT;
  const navCards    = NAV_CARDS[role] || NAV_CARDS.STUDENT;
  const Icon        = meta.icon;

  const [loading, setLoading]   = useState(true);
  const [dashData, setDashData] = useState({});

  const canAnalytics = ['SCHOOL_ADMIN','SYSTEM_ADMIN','GOV_AUTHORITY','NGO_REP','DATA_VERIFIER'].includes(role);

  /* ── data fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    const d = {};
    const ps = [];

    if (canAnalytics) {
      ps.push(api.get('/analytics/overview').then(r => { d.overview = r.data.data; }).catch(() => {}));
      ps.push(api.get('/analytics/top-performers?limit=5').then(r => { d.topPerformers = r.data.data; }).catch(() => {}));
      ps.push(api.get('/analytics/grade-distribution').then(r => { d.gradeDistribution = r.data.data; }).catch(() => {}));
      ps.push(api.get('/analytics/score-histogram').then(r => { d.scoreHistogram = r.data.data; }).catch(() => {}));
    }

    if (role === 'STUDENT') {
      ps.push(api.get('/scholarships?size=100').then(r => { d.scholarships = r.data.data; }).catch(() => {}));
      ps.push(api.get('/scholarships/my-applications?size=100').then(r => { d.myApplications = r.data.data; }).catch(() => {}));
    }
    if (role === 'PARENT') {
      ps.push(api.get('/scholarships?size=100').then(r => { d.scholarships = r.data.data; }).catch(() => {}));
    }
    if (['SCHOOL_ADMIN','SYSTEM_ADMIN'].includes(role)) {
      ps.push(api.get('/verification?status=PENDING&size=5').then(r => { d.pendingVerifications = r.data.data; }).catch(() => {}));
    }
    if (role === 'DATA_VERIFIER') {
      ps.push(api.get('/verification?size=100').then(r => { d.verifications = r.data.data; }).catch(() => {}));
    }
    if (role === 'NGO_REP') {
      ps.push(api.get('/scholarships/mine?size=100').then(r => { d.myScholarships = r.data.data; }).catch(() => {}));
    }
    if (['GOV_AUTHORITY','SYSTEM_ADMIN'].includes(role)) {
      ps.push(api.get('/analytics/institution-comparison').then(r => { d.institutionComparison = r.data.data; }).catch(() => {}));
    }
    if (role === 'SYSTEM_ADMIN') {
      ps.push(api.get('/admin/ml-models/health').then(r => { d.mlHealth = r.data.data; }).catch(() => {}));
    }

    await Promise.all(ps);
    setDashData(d);
    setLoading(false);
  }, [role, canAnalytics]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const insights = generateInsights(role, dashData);
  const ov = dashData.overview;

  /* ── stat cards per role ── */
  function getStatCards() {
    switch (role) {
      case 'STUDENT': return [
        { label: 'Available Scholarships', value: dashData.scholarships?.totalElements ?? 0, icon: BookOpen,       colorClass: 'bg-indigo-50 text-indigo-700' },
        { label: 'My Applications',        value: dashData.myApplications?.totalElements ?? 0, icon: ClipboardCheck,colorClass: 'bg-emerald-50 text-emerald-700' },
        { label: 'Merit Lists Available',  value: '—',                                     icon: Award,          colorClass: 'bg-purple-50 text-purple-700' },
        { label: 'Profile Status',         value: 'Active',                                 icon: CheckCircle,    colorClass: 'bg-sky-50 text-sky-700' },
      ];
      case 'PARENT': return [
        { label: 'Scholarships Open',  value: dashData.scholarships?.totalElements ?? 0, icon: BookOpen,       colorClass: 'bg-purple-50 text-purple-700' },
        { label: 'Merit Rankings',     value: 'Available',                               icon: Award,          colorClass: 'bg-indigo-50 text-indigo-700' },
        { label: 'Alerts',             value: '—',                                       icon: AlertTriangle,  colorClass: 'bg-amber-50 text-amber-700' },
        { label: 'Account Status',     value: 'Active',                                  icon: CheckCircle,    colorClass: 'bg-emerald-50 text-emerald-700' },
      ];
      case 'SCHOOL_ADMIN': return [
        { label: 'Total Students',      value: ov?.totalStudents ?? 0,                    icon: Users,          colorClass: 'bg-blue-50 text-blue-700' },
        { label: 'Verified Students',   value: ov?.approvedStudents ?? 0,                 icon: CheckCircle,    colorClass: 'bg-emerald-50 text-emerald-700' },
        { label: 'Avg Merit Score',     value: ov?.averageCompositeScore?.toFixed(3) ?? '—', icon: TrendingUp,  colorClass: 'bg-purple-50 text-purple-700' },
        { label: 'Pending Verification',value: ov?.pendingVerification ?? 0,              icon: Clock,          colorClass: 'bg-amber-50 text-amber-700' },
      ];
      case 'DATA_VERIFIER': return [
        { label: 'Pending Review',   value: dashData.verifications?.totalElements ?? 0, icon: Clock,          colorClass: 'bg-amber-50 text-amber-700' },
        { label: 'Total Students',   value: ov?.totalStudents ?? 0,                     icon: Users,          colorClass: 'bg-blue-50 text-blue-700' },
        { label: 'Approved',         value: ov?.approvedStudents ?? 0,                  icon: CheckCircle,    colorClass: 'bg-emerald-50 text-emerald-700' },
        { label: 'Avg Score',        value: ov?.averageCompositeScore?.toFixed(3) ?? '—', icon: Target,       colorClass: 'bg-purple-50 text-purple-700' },
      ];
      case 'NGO_REP': return [
        { label: 'My Scholarships',    value: dashData.myScholarships?.totalElements ?? 0, icon: BookOpen,     colorClass: 'bg-green-50 text-green-700' },
        { label: 'Total Students',     value: ov?.totalStudents ?? 0,                      icon: Users,        colorClass: 'bg-blue-50 text-blue-700' },
        { label: 'Avg Merit Score',    value: ov?.averageCompositeScore?.toFixed(3) ?? '—', icon: TrendingUp,  colorClass: 'bg-purple-50 text-purple-700' },
        { label: 'Top Performers',     value: dashData.topPerformers?.length ?? 0,         icon: Award,        colorClass: 'bg-amber-50 text-amber-700' },
      ];
      case 'GOV_AUTHORITY': return [
        { label: 'Institutions',    value: ov?.totalInstitutions ?? 0,                     icon: Building2,    colorClass: 'bg-indigo-50 text-indigo-700' },
        { label: 'Total Students',  value: ov?.totalStudents ?? 0,                         icon: Users,        colorClass: 'bg-blue-50 text-blue-700' },
        { label: 'Avg Score',       value: ov?.averageCompositeScore?.toFixed(3) ?? '—',   icon: TrendingUp,   colorClass: 'bg-purple-50 text-purple-700' },
        { label: 'Pending Verification', value: ov?.pendingVerification ?? 0,              icon: Clock,        colorClass: 'bg-amber-50 text-amber-700' },
      ];
      case 'SYSTEM_ADMIN': return [
        { label: 'Institutions',    value: ov?.totalInstitutions ?? 0,                     icon: Building2,    colorClass: 'bg-indigo-50 text-indigo-700' },
        { label: 'Total Students',  value: ov?.totalStudents ?? 0,                         icon: Users,        colorClass: 'bg-blue-50 text-blue-700' },
        { label: 'Avg Score',       value: ov?.averageCompositeScore?.toFixed(3) ?? '—',   icon: TrendingUp,   colorClass: 'bg-purple-50 text-purple-700' },
        { label: 'ML Service',      value: dashData.mlHealth?.healthy ? 'Healthy' : 'Down', icon: Activity,    colorClass: dashData.mlHealth?.healthy ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700' },
      ];
      default: return [];
    }
  }

  /* ── render ── */
  return (
    <PageTransition className="space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{meta.title}</h1>
            <p className="text-slate-500">{meta.subtitle}</p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </motion.div>

      {/* ── Loading skeleton ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-slate-100" />
              <div className="h-6 w-16 bg-slate-100 rounded mt-3" />
              <div className="h-4 w-24 bg-slate-50 rounded mt-1" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getStatCards().map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.08} />
            ))}
          </div>

          {/* ── Charts Section ── */}
          {canAnalytics && <AnalyticsCharts data={dashData} />}

          {role === 'STUDENT' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ScholarshipPie data={dashData} />
              <MiniChartCard title="Quick Tip" delay={0.35}>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Brain className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p>Your merit score is calculated from academics (40%), attendance (25%), activities (20%), and teacher ratings (15%). Improve any area to climb the rankings.</p>
                </div>
              </MiniChartCard>
            </div>
          )}

          {/* Top Performers (analytics roles) */}
          {canAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TopPerformersMini list={dashData.topPerformers} />
              {['GOV_AUTHORITY','SYSTEM_ADMIN'].includes(role) && <InstitutionComparisonMini list={dashData.institutionComparison} />}
            </div>
          )}

          {/* ── AI Insights ── */}
          <InsightPanel insights={insights} delay={0.45} />

          {/* ── Quick Actions ── */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {navCards.map((card, i) => {
                const CardIcon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    onClick={() => navigate(card.path)}
                    className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shadow-sm`}>
                        <CardIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{card.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{card.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors mt-1" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Welcome Banner ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} opacity-[0.04]`} />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-slate-900">
                Welcome, <span className="text-indigo-700">{user?.firstName} {user?.lastName}</span>!
              </h2>
              <p className="mt-2 text-slate-500">
                Signed in as <strong className="text-slate-700">{user?.role?.replace(/_/g, ' ')}</strong>.
                Use the sidebar or quick actions above to navigate.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </PageTransition>
  );
}
