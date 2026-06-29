import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiSave, FiUpload, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('bio', form.bio);
      if (imageFile) fd.append('profileImage', imageFile);
      const res = await authAPI.updateProfile(fd);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setPwLoading(false); }
  };

  const avatarSrc = imagePreview || (user?.profileImage ? `${UPLOADS_URL}${user.profileImage}` : '');

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-gray-800 mb-8">My Profile</h1>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-gray-800 mb-5">Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-orange-400">{user?.name?.charAt(0)}</span>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
                  <FiUpload size={12} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="font-bold text-gray-700">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <p className="text-xs text-orange-500 mt-1 capitalize">{user?.role}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">Full Name</label>
              <div className="flex items-center gap-3 border border-orange-200 rounded-xl px-4 py-3 focus-within:border-orange-400 transition-colors">
                <FiUser className="text-orange-400 flex-shrink-0" />
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="flex-1 outline-none text-gray-700 bg-transparent" placeholder="Your name" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                className="w-full border border-orange-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 resize-none text-gray-700"
                rows={3} placeholder="Tell us about yourself..." />
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70">
              <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6">
          <h2 className="font-display text-xl font-bold text-gray-800 mb-5">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{label}</label>
                <div className="flex items-center gap-3 border border-orange-200 rounded-xl px-4 py-3 focus-within:border-orange-400 transition-colors">
                  <FiLock className="text-orange-400 flex-shrink-0" />
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm({...pwForm, [key]: e.target.value})}
                    className="flex-1 outline-none text-gray-700 bg-transparent" placeholder="••••••••" required />
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwLoading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70">
              <FiLock /> {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
