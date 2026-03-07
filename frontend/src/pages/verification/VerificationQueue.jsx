import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../services/api';

const STATUS_OPTIONS = ['', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'];
const STATUS_LABELS = { PENDING_VERIFICATION: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' };
const STATUS_COLORS = {
  PENDING_VERIFICATION: 'bg-amber-500/15 text-amber-400',
  APPROVED: 'bg-emerald-500/15 text-emerald-400',
  REJECTED: 'bg-red-500/15 text-red-400',
};

export default function VerificationQueue() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deciding, setDeciding] = useState(false);
  const [comment, setComment] = useState('');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/verification', { params });
      const pg = data.data;
      setItems(pg.content || []);
      setTotalPages(pg.totalPages || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleDecision = async (approved) => {
    if (!selected) return;
    setDeciding(true);
    try {
      await api.put(`/verification/${selected.id}/decide`, { approved, comment: comment || null });
      setSelected(null);
      setComment('');
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Decision failed');
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Verification Queue</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="input w-48"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-white/30" />
          <p className="mt-4 text-white/50">No items in the queue</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Record</th>
                <th className="px-4 py-3 font-medium">Institution</th>
                <th className="px-4 py-3 font-medium">Submitted By</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{item.recordType}</td>
                  <td className="px-4 py-3 text-white/70">{item.recordSummary}</td>
                  <td className="px-4 py-3 text-white/60">{item.institutionName}</td>
                  <td className="px-4 py-3 text-white/60">{item.submittedByName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setSelected(item); setComment(''); }}
                      className="p-1.5 text-white/40 hover:text-indigo-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="p-2 rounded-lg border disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-white/60">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail / Decision Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/5 rounded-xl shadow-2xl shadow-black/50 w-full max-w-lg p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white">Review Item #{selected.id}</h2>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-white/50">Type:</span> <span className="font-medium">{selected.recordType}</span></div>
                <div><span className="text-white/50">Record:</span> <span className="font-medium">{selected.recordSummary}</span></div>
                <div><span className="text-white/50">Institution:</span> <span className="font-medium">{selected.institutionName}</span></div>
                <div><span className="text-white/50">Submitted By:</span> <span className="font-medium">{selected.submittedByName}</span></div>
                <div><span className="text-white/50">Status:</span>
                  <span className={`ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>
                <div><span className="text-white/50">Created:</span> <span className="font-medium">{new Date(selected.createdAt).toLocaleString()}</span></div>
                {selected.reviewerName && (
                  <div className="col-span-2"><span className="text-white/50">Reviewer:</span> <span className="font-medium">{selected.reviewerName}</span></div>
                )}
                {selected.comment && (
                  <div className="col-span-2"><span className="text-white/50">Comment:</span> <span className="font-medium">{selected.comment}</span></div>
                )}
              </div>

              {selected.status === 'PENDING_VERIFICATION' && (
                <>
                  <textarea
                    placeholder="Add a comment (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input w-full h-20 resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => handleDecision(false)}
                      disabled={deciding}
                      className="btn flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleDecision(true)}
                      disabled={deciding}
                      className="btn flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </>
              )}

              {selected.status !== 'PENDING_VERIFICATION' && (
                <div className="flex justify-end">
                  <button onClick={() => setSelected(null)} className="btn bg-white/10 hover:bg-white/10 text-white/70 px-4 py-2 rounded-lg">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
