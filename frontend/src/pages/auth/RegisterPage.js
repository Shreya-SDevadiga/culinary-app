import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiCook } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (f = form) => {
    const e = {};
    if (!f.name.trim()) e.name = 'Full name is required';
    else if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    else if (f.name.trim().length > 50) e.name = 'Name must be under 50 characters';

    if (!f.email.trim()) e.email = 'Email is required';
    else if (!emailRegex.test(f.email)) e.email = 'Enter a valid email address';

    if (!f.password) e.password = 'Password is required';
    else if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/[A-Za-z]/.test(f.password)) e.password = 'Password must contain at least one letter';

    if (!f.confirm) e.confirm = 'Please confirm your password';
    else if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) setErrors(validate(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputWrap = (field) =>
    `flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/80 transition-colors ${
      errors[field] && touched[field]
        ? 'border-red-400 focus-within:border-red-500 bg-red-50/50'
        : 'border-orange-200 focus-within:border-orange-400'
    }`;

  const strengthLevel = () => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' };
    if (score <= 2) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/4' };
    if (score <= 3) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = strengthLevel();

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
          <h1 className="font-display text-3xl font-bold text-gray-800">Join Us</h1>
          <p className="text-gray-500 mt-2">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Full Name</label>
            <div className={inputWrap('name')}>
              <FiUser className="text-orange-400 flex-shrink-0" />
              <input type="text" value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Your Name"
                className="flex-1 outline-none bg-transparent text-gray-700"
              />
            </div>
            {errors.name && touched.name && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
            <div className={inputWrap('email')}>
              <FiMail className="text-orange-400 flex-shrink-0" />
              <input type="email" value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                className="flex-1 outline-none bg-transparent text-gray-700"
              />
            </div>
            {errors.email && touched.email && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Password</label>
            <div className={inputWrap('password')}>
              <FiLock className="text-orange-400 flex-shrink-0" />
              <input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className="flex-1 outline-none bg-transparent text-gray-700"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && touched.password && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {errors.password}</p>}
            {/* Strength meter */}
            {strength && !errors.password && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Strength: <span className="font-semibold text-gray-600">{strength.label}</span></p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Confirm Password</label>
            <div className={inputWrap('confirm')}>
              <FiLock className="text-orange-400 flex-shrink-0" />
              <input type={showPw ? 'text' : 'password'} value={form.confirm}
                onChange={e => handleChange('confirm', e.target.value)}
                onBlur={() => handleBlur('confirm')}
                placeholder="••••••••"
                className="flex-1 outline-none bg-transparent text-gray-700"
              />
            </div>
            {errors.confirm && touched.confirm && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {errors.confirm}</p>}
            {!errors.confirm && touched.confirm && form.confirm && form.confirm === form.password && (
              <p className="text-xs text-green-500 mt-1 font-medium">✓ Passwords match</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-bold hover:text-orange-600">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
