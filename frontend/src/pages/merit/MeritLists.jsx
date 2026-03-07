import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Play, RefreshCw, Download, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Minus, Settings, Loader,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const SCOPE_OPTIONS = ['SCHOOL', 'DISTRICT', 'STATE'];

export default function MeritLists() {
  const { user } = useAuthStore();
  const isAdmin = ['SYSTEM_ADMIN', 'GOV_AUTHORITY'].includes(user?.role);
  const canTrigger = ['SCHOOL_ADMIN', 'SYSTEM_ADMIN', 'GOV_AUTHORITY'].includes(user?.role);

  // Calculation form
  const [calcForm, setCalcForm] = useState({ scope: 'SCHOOL', academicYear: '2025-2026', scopeId: '' });
  const [triggering, setTriggering] = useState(false);

  // Batches
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Merit list
  const [scores, setScores] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Config
  const [showConfig, setShowConfig] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [configLoading, setConfigLoading] = useState(false);

  // Polling for active batches
  const [pollingBatchId, setPollingBatchId] = useState(null);

  // Fetch batches
  const fetchBatches = useCallback(async () => {
    try {
      const { data } = await api.get('/merit/batches', { params: { size: 10 } });
      setBatches(data.data?.content || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  // Poll batch status
  useEffect(() => {
    if (!pollingBatchId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/merit/batches/${pollingBatchId}`);
        const batch = data.data;
        if (batch.status === 'COMPLETED' || batch.status === 'FAILED') {
          setPollingBatchId(null);
          fetchBatches();
          if (batch.status === 'COMPLETED') {
            setSelectedBatch(batch);
            setPage(0);
          }
        }
        // Update batch in list
        setBatches(prev => prev.map(b => b.id === batch.id ? batch : b));
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [pollingBatchId, fetchBatches]);

  // Fetch merit list for selected batch
  const fetchMeritList = useCallback(async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/merit/lists/${selectedBatch.id}`, { params: { page, size: 20 } });
      const pg = data.data;
      setScores(pg.content || []);
      setTotalPages(pg.totalPages || 0);
    } catch {
      setScores([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, page]);

  useEffect(() => { fetchMeritList(); }, [fetchMeritList]);

  // Trigger calculation
  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const { data } = await api.post('/merit/calculate', calcForm);
      const batch = data.data;
      setPollingBatchId(batch.id);
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger calculation');
    } finally {
      setTriggering(false);
    }
  };

  // Fetch config
  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const { data } = await api.get('/merit/config');
      setConfigs(data.data || []);
    } catch { /* ignore */ }
    finally { setConfigLoading(false); }
  };

  const updateConfig = async (key, value) => {
    try {
      await api.put('/merit/config', { configKey: key, configValue: parseFloat(value) });
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update config');
    }
  };

  // CSV export — fetch ALL pages before exporting
  const exportCSV = async () => {
    if (!selectedBatch) return;
    try {
      let allScores = [];
      let pg = 0;
      let totalPg = 1;
      while (pg < totalPg) {
        const { data } = await api.get(`/merit/lists/${selectedBatch.id}`, { params: { page: pg, size: 200 } });
        const result = data.data;
        allScores = allScores.concat(result.content || []);
        totalPg = result.totalPages || 1;
        pg++;
      }
      if (!allScores.length) return;
      const headers = ['Rank (School)', 'Rank (District)', 'Rank (State)', 'Enrollment', 'Name', 'Grade', 'Section', 'Institution', 'Academic Z', 'Attendance Z', 'Activity Z', 'Certificate Z', 'Composite Score'];
      const rows = allScores.map(s => [
        s.rankSchool, s.rankDistrict, s.rankState, s.enrollmentNumber, `"${s.studentName}"`,
        s.grade, s.section, `"${s.institutionName || ''}"`,
        s.academicZScore, s.attendanceZScore, s.activityZScore, s.certificateZScore, s.compositeScore,
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merit-list-batch-${selectedBatch.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Merit Lists</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => { setShowConfig(!showConfig); if (!showConfig) fetchConfig(); }}
                    className="btn-secondary flex items-center gap-2">
              <Settings className="w-4 h-4" /> Weights
            </button>
          )}
        </div>
      </div>

      {/* Config panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="card overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Merit Weights Configuration</h2>
            {configLoading ? (
              <div className="flex justify-center py-4"><Loader className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {configs.map(c => (
                  <div key={c.id} className="p-4 bg-white/5 rounded-lg">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      {c.configKey.replace('weight.', '')}
                    </label>
                    <input type="number" step="0.01" min="0" max="1"
                           defaultValue={c.configValue} className="input mt-1"
                           onBlur={(e) => updateConfig(c.configKey, e.target.value)} />
                    <p className="text-xs text-white/40 mt-1">{c.description}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger calculation */}
      {canTrigger && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Run Merit Calculation</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label">Scope</label>
              <select value={calcForm.scope} onChange={e => setCalcForm(p => ({ ...p, scope: e.target.value }))}
                      className="input w-40">
                {SCOPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Academic Year</label>
              <input type="text" value={calcForm.academicYear}
                     onChange={e => setCalcForm(p => ({ ...p, academicYear: e.target.value }))}
                     className="input w-40" placeholder="2025-2026" />
            </div>
            {calcForm.scope !== 'SCHOOL' && (
              <div>
                <label className="label">{calcForm.scope === 'DISTRICT' ? 'District' : 'State'} Name</label>
                <input type="text" value={calcForm.scopeId}
                       onChange={e => setCalcForm(p => ({ ...p, scopeId: e.target.value }))}
                       className="input w-48" placeholder={`Enter ${calcForm.scope.toLowerCase()} name`} />
              </div>
            )}
            <button onClick={handleTrigger} disabled={triggering}
                    className="btn-primary flex items-center gap-2">
              {triggering ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Calculate
            </button>
          </div>
        </div>
      )}

      {/* Batch list */}
      {batches.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Calculation Batches</h2>
          <div className="space-y-2">
            {batches.map(b => (
              <motion.div key={b.id} layout
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedBatch?.id === b.id ? 'bg-indigo-500/10 border border-primary-200' : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => { setSelectedBatch(b); setPage(0); }}
              >
                <div className="flex items-center gap-3">
                  <BatchStatusBadge status={b.status} />
                  <div>
                    <span className="font-medium text-sm">{b.scope} — {b.scopeId}</span>
                    <span className="text-xs text-white/50 ml-2">{b.academicYear}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-white/50">
                  <div>{b.processed}/{b.totalStudents} students</div>
                  {b.completedAt && <div>{new Date(b.completedAt).toLocaleString()}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Merit list table */}
      {selectedBatch && selectedBatch.status === 'COMPLETED' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Merit List — {selectedBatch.scope} ({selectedBatch.academicYear})
            </h2>
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-white/30" />
              <p className="mt-4 text-white/50">No merit scores found for this batch</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="table-header">School Rank</th>
                      <th className="table-header">Name</th>
                      <th className="table-header">Enrollment</th>
                      <th className="table-header">Grade</th>
                      <th className="table-header">Institution</th>
                      <th className="table-header">Academic</th>
                      <th className="table-header">Attendance</th>
                      <th className="table-header">Activities</th>
                      <th className="table-header">Certificates</th>
                      <th className="table-header">Composite</th>
                      <th className="table-header">District</th>
                      <th className="table-header">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {scores.map((s, idx) => (
                      <motion.tr key={s.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-white/5"
                      >
                        <td className="table-cell">
                          <RankBadge rank={s.rankSchool} />
                        </td>
                        <td className="table-cell font-medium text-white">{s.studentName}</td>
                        <td className="table-cell text-white/50">{s.enrollmentNumber}</td>
                        <td className="table-cell">{s.grade}{s.section ? `-${s.section}` : ''}</td>
                        <td className="table-cell text-white/50 text-xs">{s.institutionName}</td>
                        <td className="table-cell"><ZScoreBadge value={s.academicZScore} /></td>
                        <td className="table-cell"><ZScoreBadge value={s.attendanceZScore} /></td>
                        <td className="table-cell"><ZScoreBadge value={s.activityZScore} /></td>
                        <td className="table-cell"><ZScoreBadge value={s.certificateZScore} /></td>
                        <td className="table-cell">
                          <span className="font-bold text-indigo-400">
                            {Number(s.compositeScore).toFixed(3)}
                          </span>
                        </td>
                        <td className="table-cell text-center">{s.rankDistrict || '—'}</td>
                        <td className="table-cell text-center">{s.rankState || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-white/50">Page {page + 1} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                            className="btn-secondary p-2"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="btn-secondary p-2"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Progress indicator for running batches */}
      {selectedBatch && (selectedBatch.status === 'RUNNING' || selectedBatch.status === 'PENDING') && (
        <div className="card">
          <div className="flex items-center gap-3">
            <Loader className="w-6 h-6 animate-spin text-indigo-400" />
            <div>
              <p className="font-medium">Calculation in progress...</p>
              <p className="text-sm text-white/50">
                {selectedBatch.processed}/{selectedBatch.totalStudents} students processed
              </p>
            </div>
          </div>
          <div className="mt-3 w-full bg-white/10 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                 style={{ width: `${selectedBatch.totalStudents ? (selectedBatch.processed / selectedBatch.totalStudents) * 100 : 0}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function BatchStatusBadge({ status }) {
  const map = {
    PENDING: 'bg-white/10 text-white/90',
    RUNNING: 'bg-blue-500/15 text-blue-400',
    COMPLETED: 'bg-emerald-500/15 text-emerald-400',
    FAILED: 'bg-red-500/15 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-white/10 text-white/90'}`}>
      {status}
    </span>
  );
}

function RankBadge({ rank }) {
  if (!rank) return <span className="text-white/40">—</span>;
  const colors = {
    1: 'bg-amber-500/15 text-amber-400 border-yellow-300',
    2: 'bg-white/10 text-white/70 border-white/10',
    3: 'bg-orange-500/15 text-orange-400 border-orange-300',
  };
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${colors[rank] || 'bg-white/5 text-white/60 border-white/10'}`}>
      {rank}
    </span>
  );
}

function ZScoreBadge({ value }) {
  const v = Number(value);
  if (v > 0.5) return <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium"><TrendingUp className="w-3 h-3" />{v.toFixed(2)}</span>;
  if (v < -0.5) return <span className="inline-flex items-center gap-1 text-red-400 text-sm font-medium"><TrendingDown className="w-3 h-3" />{v.toFixed(2)}</span>;
  return <span className="inline-flex items-center gap-1 text-white/50 text-sm"><Minus className="w-3 h-3" />{v.toFixed(2)}</span>;
}
