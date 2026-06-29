import React, { useState, useEffect } from 'react';
import { FiTrash2, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getComments()
      .then(res => setComments(res.data.comments))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await adminAPI.deleteComment(id);
      setComments(c => c.filter(x => x._id !== id));
      toast.success('Comment deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Manage Comments</h1>
        <p className="text-gray-500 mb-6">{comments.length} comments</p>

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {c.userId?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm">{c.userId?.name}</span>
                    <span className="text-gray-400 text-xs">on</span>
                    <span className="text-orange-500 text-sm font-semibold truncate">{c.recipeId?.title}</span>
                    {c.rating && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 font-bold">
                        <FiStar size={11} /> {c.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{c.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDelete(c._id)}
                  className="w-8 h-8 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="font-display text-2xl font-bold text-gray-600">No comments yet</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
