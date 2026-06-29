import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiBook, FiCheck, FiClock, FiX, FiStar } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const statCards = data ? [
    { label: 'Total Users', value: data.stats.totalUsers, icon: <FiUsers />, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
    { label: 'Total Recipes', value: data.stats.totalRecipes, icon: <FiBook />, color: 'bg-orange-50 text-orange-600', link: '/admin/recipes' },
    { label: 'Approved', value: data.stats.approvedRecipes, icon: <FiCheck />, color: 'bg-green-50 text-green-600', link: '/admin/recipes?status=approved' },
    { label: 'Pending', value: data.stats.pendingRecipes, icon: <FiClock />, color: 'bg-yellow-50 text-yellow-600', link: '/admin/pending' },
    { label: 'Rejected', value: data.stats.rejectedRecipes, icon: <FiX />, color: 'bg-red-50 text-red-600', link: '/admin/recipes?status=rejected' },
  ] : [];

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Overview of your culinary platform</p>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {statCards.map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={card.link} className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>{card.icon}</div>
                    <div className="font-display font-bold text-3xl text-gray-800">{card.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Recipes */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-gray-800">Recent Recipes</h2>
                  <Link to="/admin/recipes" className="text-xs text-orange-500 font-semibold hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                  {data?.recentRecipes?.map(r => (
                    <div key={r._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{r.title}</p>
                        <p className="text-xs text-gray-400">by {r.createdBy?.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                        r.approvalStatus === 'approved' ? 'bg-green-100 text-green-600' :
                        r.approvalStatus === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>{r.approvalStatus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Stats */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-800 mb-4">Recipes by Category</h2>
                <div className="space-y-3">
                  {data?.categoryStats?.slice(0, 6).map(cat => (
                    <div key={cat._id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-24 flex-shrink-0">{cat._id}</span>
                      <div className="flex-1 bg-orange-100 rounded-full h-2">
                        <div className="bg-orange-500 rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(100, (cat.count / (data?.stats?.approvedRecipes || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-6 text-right">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
