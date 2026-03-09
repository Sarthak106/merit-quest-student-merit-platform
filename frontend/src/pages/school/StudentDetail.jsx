import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from 'recharts';
import {
  ArrowLeft, User, GraduationCap, Award, TrendingUp, Calendar,
  MapPin, Phone, Mail, BookOpen, Activity, Download, Sparkles,
  CheckCircle, Clock, AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import PageTransition from '../../components/ui/PageTransition';
import CountUp from '../../components/ui/CountUp';

const CHART_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const TOOLTIP_STYLE = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, color: '#334155' };

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

function generateStudentInsights(student, perf, meritHistory) {
  const insights = [];
  if (perf) {
    if (perf.attendancePercentage != null) {
      if (perf.attendancePercentage >= 90) insights.push({ type: 'success', text: `Excellent attendance at ${perf.attendancePercentage.toFixed(1)}% — well above the 75% threshold.` });
      else if (perf.attendancePercentage < 75) insights.push({ type: 'danger', text: `Attendance is ${perf.attendancePercentage.toFixed(1)}%, below the required 75%. Immediate intervention recommended.` });
      else insights.push({ type: 'warning', text: `Attendance at ${perf.attendancePercentage.toFixed(1)}% — monitor closely to prevent drop below threshold.` });
    }
    if (perf.averagePercentage != null) {
      if (perf.averagePercentage >= 85) insights.push({ type: 'success', text: `Academic average of ${perf.averagePercentage.toFixed(1)}% places this student in the top tier.` });
      else if (perf.averagePercentage < 50) insights.push({ type: 'danger', text: `Academic average of ${perf.averagePercentage.toFixed(1)}% is critically low. Consider remedial support.` });
    }
  }
  if (meritHistory?.length > 1) {
    const latest = meritHistory[0].compositeScore;
    const prev   = meritHistory[1].compositeScore;
    if (latest > prev) insights.push({ type: 'success', text: `Merit score improved by ${((latest - prev) * 100).toFixed(1)}% from previous calculation.` });
    else if (latest < prev) insights.push({ type: 'warning', text: `Merit score declined by ${((prev - latest) * 100).toFixed(1)}%. Investigate contributing factors.` });
  }
  if (student?.verificationStatus === 'PENDING') insights.push({ type: 'warning', text: 'Student record is awaiting verification. Merit calculations may not include this student.' });
  if (student?.verificationStatus === 'APPROVED') insights.push({ type: 'success', text: 'Record is fully verified and included in all merit calculations.' });
  return insights;
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [meritHistory, setMeritHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes] = await Promise.all([
        api.get(`/students/${id}`),
      ]);
      setStudent(sRes.data.data);

      // Fire-and-forget optional data
      await Promise.allSettled([
        api.get(`/analytics/student/${id}`).then(r => setPerformance(r.data.data)),
        api.get(`/merit/students/${id}/history`).then(r => setMeritHistory(r.data.data || [])),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveNotes = () => {
    const blob = new Blob([
      `Student Report — ${student?.firstName} ${student?.lastName}\n`,
      `Enrollment: ${student?.enrollmentNumber}\n`,
      `Grade: ${student?.grade}${student?.section ? `-${student.section}` : ''}\n`,
      `Guardian: ${student?.guardianName || '—'}\n`,
      `Verification: ${student?.verificationStatus || '—'}\n`,
      `\n--- Notes ---\n`,
      notes || '(no notes)',
      `\n\n--- Performance ---\n`,
      performance ? JSON.stringify(performance, null, 2) : '(unavailable)',
      `\n\n--- Merit History ---\n`,
      meritHistory.length ? JSON.stringify(meritHistory, null, 2) : '(no history)',
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_${student?.enrollmentNumber || id}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  if (loading) {
    return (
      <PageTransition className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </PageTransition>
    );
  }

  if (error || !student) {
    return (
      <PageTransition className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Student not found'}</p>
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">Go Back</button>
      </PageTransition>
    );
  }

  const insights = generateStudentInsights(student, performance, meritHistory);

  const subjectData = performance?.subjects || [];
  const meritChartData = [...meritHistory].reverse().map((m, i) => ({
    batch: `#${i + 1}`,
    score: +(m.compositeScore?.toFixed(4) ?? 0),
  }));

  return (
    <PageTransition className="space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </button>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-[0.04]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{student.firstName} {student.lastName}</h1>
            <p className="text-slate-500 mt-1">
              {student.enrollmentNumber} · Grade {student.grade}{student.section ? `-${student.section}` : ''}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                student.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                student.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                'bg-amber-50 text-amber-700'
              }`}>
                {student.verificationStatus === 'APPROVED' ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
                 student.verificationStatus === 'REJECTED' ? <AlertTriangle className="w-3 h-3 inline mr-1" /> :
                 <Clock className="w-3 h-3 inline mr-1" />}
                {student.verificationStatus || 'PENDING'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {student.gender}
              </span>
            </div>
          </div>
          {/* Save/Download */}
          <button onClick={handleSaveNotes}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            {saving ? 'Saved!' : 'Save Report'}
          </button>
        </div>
      </motion.div>

      {/* Info + Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-2xl p-5"
        >
          <h3 className="font-semibold text-slate-800 mb-3">Personal Information</h3>
          <div className="space-y-1">
            <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth} />
            <InfoRow icon={MapPin} label="Address" value={student.address} />
            <InfoRow icon={User} label="Guardian" value={student.guardianName} />
            <InfoRow icon={Phone} label="Guardian Phone" value={student.guardianPhone} />
            <InfoRow icon={Mail} label="Guardian Email" value={student.guardianEmail} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white border border-slate-200 rounded-2xl p-5"
        >
          <h3 className="font-semibold text-slate-800 mb-3">Performance Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Avg Score', value: performance?.averagePercentage?.toFixed(1) ?? '—', color: 'bg-indigo-50 text-indigo-700', icon: TrendingUp },
              { label: 'Attendance', value: performance?.attendancePercentage ? `${performance.attendancePercentage.toFixed(1)}%` : '—', color: 'bg-emerald-50 text-emerald-700', icon: Activity },
              { label: 'Subjects', value: subjectData.length || '—', color: 'bg-sky-50 text-sky-700', icon: BookOpen },
              { label: 'Merit Calcs', value: meritHistory.length || '—', color: 'bg-purple-50 text-purple-700', icon: Award },
            ].map((s) => {
              const I = s.icon;
              return (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color} mb-2`}>
                    <I className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Merit History Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl p-5"
        >
          <h3 className="font-semibold text-slate-800 mb-3">Merit Score Trend</h3>
          {meritChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={meritChartData}>
                <defs>
                  <linearGradient id="meritGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="batch" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" fill="url(#meritGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">No merit history available</p>
          )}
        </motion.div>
      </div>

      {/* Subject Performance Radar */}
      {subjectData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <h3 className="font-semibold text-slate-800 mb-3">Subject Performance — Radar</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={subjectData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: '#94a3b8' }} angle={30} domain={[0, 100]} />
                <Radar name="Score %" dataKey="percentage" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <h3 className="font-semibold text-slate-800 mb-3">Subject Scores — Bar</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectData}>
                <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {subjectData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 border border-indigo-100 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-indigo-900">AI Analysis</h3>
          </div>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  ins.type === 'success' ? 'bg-emerald-500' :
                  ins.type === 'warning' ? 'bg-amber-500' :
                  ins.type === 'danger'  ? 'bg-red-500'    : 'bg-indigo-500'
                }`} />
                <p className="text-sm text-slate-700 leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notes & Save */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white border border-slate-200 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-slate-800 mb-3">Admin Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add notes about this student for future reference..."
          className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
        />
        <div className="flex justify-end mt-3">
          <button onClick={handleSaveNotes}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            {saving ? 'Report Saved!' : 'Download Full Report'}
          </button>
        </div>
      </motion.div>

      {/* Latest Merit Score Detail */}
      {meritHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white border border-slate-200 rounded-2xl p-6"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Latest Merit Score Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Batch</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Composite</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Academic Z</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Attendance Z</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">School Rank</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">District Rank</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">State Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {meritHistory.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-600">{m.batchId ? `Batch #${m.batchId}` : `#${i + 1}`}</td>
                    <td className="px-4 py-2.5 font-semibold text-indigo-700">{m.compositeScore?.toFixed(4) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{m.academicZScore?.toFixed(3) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{m.attendanceZScore?.toFixed(3) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{m.rankSchool ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{m.rankDistrict ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{m.rankState ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </PageTransition>
  );
}
