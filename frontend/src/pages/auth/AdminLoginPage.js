import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { GiCook } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const validate = (fields = { email, password }) => {
    const e = {};
    if (!fields.email.trim()) e.email = 'Admin email is required';
    else if (!emailRegex.test(fields.email)) e.email = 'Enter a valid email address';
    if (!fields.password) e.password = 'Password is required';
    else if (fields.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const handleChange = (field, value) => {
    const updated = { email, password, [field]: value };
    if (field === 'email') setEmail(value);
    else setPassword(value);
    if (touched[field]) setErrors(validate(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    } finally { setLoading(false); }
  };

  const inputBase = (field) =>
    `flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-500 bg-red-900/20 focus-within:border-red-400'
        : 'border-stone-600 bg-stone-700 focus-within:border-orange-400'
    }`;

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-stone-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-stone-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiShield className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-stone-400 mt-2">Restricted access — authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="text-sm font-bold text-stone-300 mb-1 block">Admin Email</label>
            <div className={inputBase('email')}>
              <FiMail className="text-orange-400 flex-shrink-0" />
              <input type="email" value={email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="admin@culinary.com"
                className="flex-1 outline-none bg-transparent text-white placeholder-stone-400"
              />
            </div>
            {errors.email && touched.email && (
              <p className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-bold text-stone-300 mb-1 block">Password</label>
            <div className={inputBase('password')}>
              <FiLock className="text-orange-400 flex-shrink-0" />
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className="flex-1 outline-none bg-transparent text-white placeholder-stone-400"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-stone-400 hover:text-white">
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                <span>⚠</span> {errors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-70 mt-2">
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          <Link to="/login" className="hover:text-orange-400 transition-colors">← Back to User Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
