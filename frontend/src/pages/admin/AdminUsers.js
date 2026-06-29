import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiLock, FiUnlock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleBlock = async (id) => {
    try {
      const res = await adminAPI.toggleBlockUser(id);
      setUsers(u => u.map(x => x._id === id ? { ...x, status: res.data.status } : x));
      toast.success(`User ${res.data.status}`);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all their content?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Manage Users</h1>
        <p className="text-gray-500 mb-6">Total: {pagination.total} users</p>

        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1">
            <FiSearch className="text-gray-400" />
            <input placeholder="Search by name or email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 outline-none text-sm text-gray-700" />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['User', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-bold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                            {u.name?.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{u.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleToggleBlock(u._id)} title={u.status === 'active' ? 'Block' : 'Unblock'}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              u.status === 'active'
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}>
                            {u.status === 'active' ? <FiLock size={13} /> : <FiUnlock size={13} />}
                          </button>
                          <button onClick={() => handleDelete(u._id)} title="Delete"
                            className="w-7 h-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && <div className="text-center py-12 text-gray-400">No users found</div>}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl bg-white border text-gray-600 font-semibold disabled:opacity-40 text-sm">← Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {pagination.pages}</span>
            <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl bg-white border text-gray-600 font-semibold disabled:opacity-40 text-sm">Next →</button>
          </div>
        )}
      </main>
    </div>
  );
}
