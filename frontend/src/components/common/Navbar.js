import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiBookmark, FiPlusCircle, FiList } from 'react-icons/fi';
import { GiCook } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/recipes', label: 'Recipes' },
    { to: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <GiCook className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">CulinaryBook</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-semibold text-sm transition-colors relative pb-1 ${
                  isActive(link.to)
                    ? 'text-orange-500'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-full px-4 py-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{user.name?.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden z-50"
                    >
                      <div className="p-3 bg-orange-50 border-b border-orange-100">
                        <p className="font-bold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <DropItem to="/dashboard" icon={<FiUser />} label="Dashboard" onClick={() => setDropdownOpen(false)} />
                        <DropItem to="/submit-recipe" icon={<FiPlusCircle />} label="Submit Recipe" onClick={() => setDropdownOpen(false)} />
                        <DropItem to="/my-recipes" icon={<FiList />} label="My Recipes" onClick={() => setDropdownOpen(false)} />
                        <DropItem to="/bookmarks" icon={<FiBookmark />} label="Bookmarks" onClick={() => setDropdownOpen(false)} />
                        <DropItem to="/profile" icon={<FiUser />} label="Profile" onClick={() => setDropdownOpen(false)} />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                        >
                          <FiLogOut /><span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">Login</Link>
                <Link to="/register" className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full transition-colors shadow-md">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-orange-50">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-orange-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50">Dashboard</Link>
                  <Link to="/submit-recipe" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50">Submit Recipe</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 border border-orange-300 rounded-full text-orange-500 font-semibold">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-orange-500 rounded-full text-white font-semibold">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function DropItem({ to, icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
    >
      {icon}<span>{label}</span>
    </Link>
  );
}
