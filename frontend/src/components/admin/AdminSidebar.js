import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiClock, FiUsers, FiMessageSquare, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { GiCook } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { to: '/admin/recipes', icon: <FiList />, label: 'All Recipes' },
  { to: '/admin/pending', icon: <FiClock />, label: 'Pending Approvals' },
  { to: '/admin/users', icon: <FiUsers />, label: 'Manage Users' },
  { to: '/admin/comments', icon: <FiMessageSquare />, label: 'Comments' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      className="admin-sidebar h-screen sticky top-0 flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-stone-700">
        <div className="w-9 h-9 hero-gradient rounded-xl flex items-center justify-center flex-shrink-0">
          <GiCook className="text-white text-lg" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-white text-sm leading-tight">
            Culinary<br />Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-stone-400 hover:text-white transition-colors"
        >
          {collapsed ? <FiMenu /> : <FiX />}
        </button>
      </div>

      {/* Admin info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-stone-400 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                active
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-stone-400 hover:bg-stone-700 hover:text-white'
              }`}
              title={collapsed ? item.label : ''}
            >
              <span className="flex-shrink-0 text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-stone-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-400 hover:bg-red-500/20 hover:text-red-400 transition-all w-full text-sm font-semibold"
          title={collapsed ? 'Logout' : ''}
        >
          <FiLogOut className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
