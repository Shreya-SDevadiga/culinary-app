import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiList, FiBookmark, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { recipeAPI } from '../../services/api';

export default function UserDashboard() {
  const { user } = useAuth();
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recipeAPI.getMyRecipes()
      .then(res => setMyRecipes(res.data.recipes))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: myRecipes.length,
    approved: myRecipes.filter(r => r.approvalStatus === 'approved').length,
    pending: myRecipes.filter(r => r.approvalStatus === 'pending').length,
    rejected: myRecipes.filter(r => r.approvalStatus === 'rejected').length,
  };

  const cards = [
    { label: 'Total Submitted', value: counts.total, icon: <FiList />, color: 'bg-blue-50 text-blue-600', link: '/my-recipes' },
    { label: 'Approved', value: counts.approved, icon: <FiCheck />, color: 'bg-green-50 text-green-600', link: '/my-recipes?status=approved' },
    { label: 'Pending Review', value: counts.pending, icon: <FiClock />, color: 'bg-yellow-50 text-yellow-600', link: '/my-recipes?status=pending' },
    { label: 'Rejected', value: counts.rejected, icon: <FiX />, color: 'bg-red-50 text-red-600', link: '/my-recipes?status=rejected' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-gray-800">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-1">Here's an overview of your culinary journey</p>
          </div>
          <Link to="/submit-recipe" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-md">
            <FiPlusCircle /> Submit Recipe
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={card.link} className="block bg-white rounded-2xl border border-orange-100 p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-lg mb-3`}>{card.icon}</div>
                <div className="font-display font-bold text-3xl text-gray-800">{loading ? '—' : card.value}</div>
                <div className="text-sm text-gray-500 mt-1">{card.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: '/submit-recipe', icon: '🍳', title: 'Submit a Recipe', desc: 'Share your culinary creation' },
            { to: '/my-recipes', icon: '📋', title: 'My Recipes', desc: 'Manage your submissions' },
            { to: '/bookmarks', icon: '🔖', title: 'Bookmarks', desc: 'View saved recipes' },
          ].map((action, i) => (
            <Link key={i} to={action.to}
              className="bg-white rounded-2xl border border-orange-100 p-5 hover:shadow-md hover:border-orange-300 transition-all group">
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors">{action.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
