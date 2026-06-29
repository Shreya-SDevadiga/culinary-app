import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop';

export default function AdminPendingApprovals() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectInput, setShowRejectInput] = useState({});

  useEffect(() => {
    adminAPI.getRecipes({ status: 'pending', limit: 50 })
      .then(res => setRecipes(res.data.recipes))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveRecipe(id);
      setRecipes(r => r.filter(x => x._id !== id));
      toast.success('Recipe approved!');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectRecipe(id, { reason: rejectReason[id] || 'Does not meet guidelines' });
      setRecipes(r => r.filter(x => x._id !== id));
      toast.success('Recipe rejected');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Pending Approvals</h1>
        <p className="text-gray-500 mb-8">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} waiting for review</p>

        {loading ? <LoadingSpinner /> : recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="font-display text-2xl font-bold text-gray-600">All caught up!</h3>
            <p className="text-gray-400">No pending recipes to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex gap-4">
                  <img src={r.image ? `${UPLOADS_URL}${r.image}` : PLACEHOLDER} alt={r.title}
                    className="w-24 h-20 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = PLACEHOLDER; }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg text-gray-800">{r.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{r.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span>👤 {r.createdBy?.name}</span>
                      <span>📧 {r.createdBy?.email}</span>
                      <span>🏷️ {r.category}</span>
                      <span>⏱️ {r.cookingTime}min</span>
                      <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Reject reason input */}
                {showRejectInput[r._id] && (
                  <div className="mt-3">
                    <input type="text" placeholder="Rejection reason (optional)"
                      value={rejectReason[r._id] || ''}
                      onChange={e => setRejectReason(prev => ({ ...prev, [r._id]: e.target.value }))}
                      className="w-full border border-red-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400" />
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApprove(r._id)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
                    <FiCheck /> Approve
                  </button>
                  {showRejectInput[r._id] ? (
                    <button onClick={() => handleReject(r._id)}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
                      <FiX /> Confirm Reject
                    </button>
                  ) : (
                    <button onClick={() => setShowRejectInput(prev => ({ ...prev, [r._id]: true }))}
                      className="flex items-center gap-2 border border-red-300 text-red-500 hover:bg-red-50 px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
                      <FiX /> Reject
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
