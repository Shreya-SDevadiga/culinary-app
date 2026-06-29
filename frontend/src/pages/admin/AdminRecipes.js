import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCheck, FiX, FiTrash2, FiStar, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI, recipeAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=80&fit=crop';

export default function AdminRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await adminAPI.getRecipes(params);
      setRecipes(res.data.recipes);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveRecipe(id);
      setRecipes(r => r.map(x => x._id === id ? { ...x, approvalStatus: 'approved' } : x));
      toast.success('Approved!');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional):') || 'Does not meet guidelines';
    try {
      await adminAPI.rejectRecipe(id, { reason });
      setRecipes(r => r.map(x => x._id === id ? { ...x, approvalStatus: 'rejected' } : x));
      toast.success('Rejected');
    } catch { toast.error('Failed'); }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await adminAPI.toggleFeatured(id);
      setRecipes(r => r.map(x => x._id === id ? { ...x, isFeatured: res.data.isFeatured } : x));
      toast.success(res.data.isFeatured ? 'Featured!' : 'Unfeatured');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe permanently?')) return;
    try {
      await recipeAPI.delete(id);
      setRecipes(r => r.filter(x => x._id !== id));
      toast.success('Recipe deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const statusBadge = (s) => ({
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }[s] || '');

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Manage Recipes</h1>
        <p className="text-gray-500 mb-6">Total: {pagination.total} recipes</p>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-48">
            <FiSearch className="text-gray-400" />
            <input placeholder="Search recipes..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 outline-none text-sm text-gray-700" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-700">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Recipe', 'Author', 'Category', 'Status', 'Rating', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-bold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recipes.map(r => (
                    <tr key={r._id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={r.image ? `${UPLOADS_URL}${r.image}` : PLACEHOLDER} alt="" className="w-12 h-10 rounded-lg object-cover"
                            onError={e => { e.target.src = PLACEHOLDER; }} />
                          <div>
                            <p className="font-semibold text-gray-800 max-w-xs truncate">{r.title}</p>
                            {r.isFeatured && <span className="text-xs text-orange-500 font-bold">⭐ Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{r.createdBy?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{r.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusBadge(r.approvalStatus)}`}>
                          {r.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">⭐ {r.averageRating > 0 ? r.averageRating.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {r.approvalStatus !== 'approved' && (
                            <button onClick={() => handleApprove(r._id)} title="Approve"
                              className="w-7 h-7 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors">
                              <FiCheck size={13} />
                            </button>
                          )}
                          {r.approvalStatus !== 'rejected' && (
                            <button onClick={() => handleReject(r._id)} title="Reject"
                              className="w-7 h-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors">
                              <FiX size={13} />
                            </button>
                          )}
                          <button onClick={() => handleToggleFeatured(r._id)} title={r.isFeatured ? 'Unfeature' : 'Feature'}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              r.isFeatured ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-500'
                            }`}>
                            <FiStar size={13} />
                          </button>
                          <button onClick={() => navigate(`/edit-recipe/${r._id}`)} title="Edit Recipe"
                            className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors">
                            <FiEdit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(r._id)} title="Delete Recipe"
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
            {recipes.length === 0 && (
              <div className="text-center py-12 text-gray-400">No recipes found</div>
            )}
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
