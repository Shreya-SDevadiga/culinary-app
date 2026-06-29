import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiEdit2, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { recipeAPI } from '../../services/api';

const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop';

const statusConfig = {
  pending:  { label: 'Pending', icon: <FiClock />, cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', icon: <FiCheck />, cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', icon: <FiX />, cls: 'bg-red-100 text-red-700' },
};

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    recipeAPI.getMyRecipes(filter ? { status: filter } : {})
      .then(res => setRecipes(res.data.recipes))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await recipeAPI.delete(id);
      setRecipes(r => r.filter(x => x._id !== id));
      toast.success('Recipe deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-gray-800">My Recipes</h1>
          <p className="text-gray-500 mt-1">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <Link to="/submit-recipe" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <FiPlusCircle /> New Recipe
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors capitalize ${
              filter === s ? 'bg-orange-500 text-white' : 'bg-white border border-orange-200 text-gray-600 hover:bg-orange-50'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-24" />)}</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="font-display text-2xl font-bold text-gray-600 mb-2">No recipes yet</h3>
          <p className="text-gray-400 mb-6">Share your first recipe with the community!</p>
          <Link to="/submit-recipe" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
            Submit a Recipe
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map((r, i) => {
            const status = statusConfig[r.approvalStatus];
            return (
              <motion.div key={r._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-orange-100 p-4 flex gap-4 items-center hover:shadow-md transition-shadow">
                <img src={r.image ? `${UPLOADS_URL}${r.image}` : PLACEHOLDER} alt={r.title}
                  className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
                  onError={e => { e.target.src = PLACEHOLDER; }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{r.title}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">{r.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{r.cookingTime} min</span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                      {status.icon}{status.label}
                    </span>
                  </div>
                  {r.approvalStatus === 'rejected' && r.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">Reason: {r.rejectionReason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {r.approvalStatus === 'approved' && (
                    <Link to={`/recipes/${r._id}`} className="text-xs text-orange-500 font-semibold hover:underline">View</Link>
                  )}
                  <button
                    onClick={() => navigate(`/edit-recipe/${r._id}`)}
                    title="Edit Recipe"
                    className="text-gray-400 hover:text-orange-500 transition-colors p-1">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(r._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
