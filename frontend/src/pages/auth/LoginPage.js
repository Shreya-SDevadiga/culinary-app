import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiCook } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (fields = { email, password }) => {
    const e = {};
    if (!fields.email.trim()) e.email = 'Email is required';
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
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = (field) =>
    `flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/80 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-400 focus-within:border-red-500 bg-red-50/50'
        : 'border-orange-200 focus-within:border-orange-400'
    }`;

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl hero-gradient flex items-center justify-center shadow-lg">
              <GiCook className="text-white text-2xl" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">CulinaryBook</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
            <div className={inputBase('email')}>
              <FiMail className="text-orange-400 flex-shrink-0" />
              <input type="email" value={email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                className="flex-1 outline-none bg-transparent text-gray-700"
              />
            </div>
            {errors.email && touched.email && (
              <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Password</label>
            <div className={inputBase('password')}>
              <FiLock className="text-orange-400 flex-shrink-0" />
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className="flex-1 outline-none bg-transparent text-gray-700"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                <span>⚠</span> {errors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-500 font-bold hover:text-orange-600">Sign Up</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-3">
          <Link to="/admin/login" className="hover:text-orange-500 transition-colors">Admin Login →</Link>
        </p>
      </motion.div>
    </div>
  );
}
