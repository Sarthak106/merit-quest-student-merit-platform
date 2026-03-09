import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const TYPES = ['SCHOOL', 'COLLEGE', 'UNIVERSITY'];

const emptyForm = {
  name: '', code: '', type: 'SCHOOL', board: '', district: '', state: '',
  address: '', contactEmail: '', contactPhone: '',
};

export default function InstitutionManagement() {
  const [institutions, setInstitutions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/institutions', { params: { page, size: 20 } });
      const pg = data.data;
      setInstitutions(pg.content || []);
      setTotalPages(pg.totalPages || 0);
    } catch {
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchInstitutions(); }, [fetchInstitutions]);

  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setErrors({}); setShowForm(true);
  };

  const openEdit = (inst) => {
    setEditing(inst.id);
    setForm({
      name: inst.name, code: inst.code, type: inst.type, board: inst.board || '',
      district: inst.district, state: inst.state, address: inst.address || '',
      contactEmail: inst.contactEmail || '', contactPhone: inst.contactPhone || '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.code.trim()) e.code = 'Required';
    if (!form.district.trim()) e.district = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/admin/institutions/${editing}`, form);
      } else {
        await api.post('/admin/institutions', form);
      }
      setShowForm(false);
      fetchInstitutions();
    } catch (err) {
      setErrors({ _form: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this institution?')) return;
    try {
      await api.delete(`/admin/institutions/${id}`);
      fetchInstitutions();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institutions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage registered educational institutions</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Institution
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Code', 'Type', 'Board', 'District', 'State', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : institutions.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No institutions found
                </td></tr>
              ) : institutions.map((inst) => (
                <motion.tr key={inst.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{inst.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{inst.code}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{inst.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{inst.board || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{inst.district}</td>
                  <td className="px-4 py-3 text-slate-500">{inst.state}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inst.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {inst.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(inst)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeactivate(inst.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Institution' : 'Add Institution'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errors._form && <div className="p-3 bg-red-50 text-red-400 text-sm rounded-lg">{errors._form}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input w-full" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Code *</label>
                    <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="input w-full" placeholder="e.g. SCH-MP-001" />
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Type *</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input w-full">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Board</label>
                    <input value={form.board} onChange={e => setForm({...form, board: e.target.value})} className="input w-full" placeholder="e.g. CBSE" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">District *</label>
                    <input value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="input w-full" />
                    {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">State *</label>
                    <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="input w-full" />
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Contact Email</label>
                    <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Contact Phone</label>
                    <input value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="input w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                  <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="input w-full" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50">
                    {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
