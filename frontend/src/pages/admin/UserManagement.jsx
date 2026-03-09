import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import api from '../../services/api';
import PageTransition from '../../components/ui/PageTransition';

const ROLES = ['STUDENT', 'PARENT', 'SCHOOL_ADMIN', 'DATA_VERIFIER', 'NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'];

const ROLE_COLORS = {
  STUDENT: 'bg-blue-50 text-blue-700',
  PARENT: 'bg-purple-50 text-purple-700',
  SCHOOL_ADMIN: 'bg-emerald-50 text-emerald-700',
  DATA_VERIFIER: 'bg-amber-50 text-amber-700',
  NGO_REP: 'bg-pink-50 text-pink-700',
  GOV_AUTHORITY: 'bg-indigo-50 text-indigo-700',
  SYSTEM_ADMIN: 'bg-red-50 text-red-700',
};

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
  PENDING: 'bg-amber-50 text-amber-700',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      const { data } = await api.get('/admin/users', { params });
      const pg = data.data;
      setUsers(pg.content || []);
      setTotalPages(pg.totalPages || 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage user roles and account status</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by name, email, or role..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Institution', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No users found
                </td></tr>
              ) : filtered.map((u) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-none cursor-pointer ${ROLE_COLORS[u.role] || 'bg-slate-100'}`}>
                      {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={u.status} onChange={(e) => handleStatusChange(u.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-none cursor-pointer ${STATUS_COLORS[u.status] || 'bg-slate-100'}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.institutionName || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
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
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
