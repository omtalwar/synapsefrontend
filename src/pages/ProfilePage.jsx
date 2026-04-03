import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, Save, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import useAuthStore from '../store/authStore';
import useIdeaStore from '../store/ideaStore';
import axiosInstance from '../utils/axiosInstance';
import { formatDate, getErrorMessage } from '../utils/helpers';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, login, logout } = useAuthStore();
  const { ideas, fetchIdeas } = useIdeaStore();

  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchIdeas(); }, []);

  const connectedCount = ideas.filter((i) => i.connections?.length > 0).length;
  const highPriorityCount = ideas.filter((i) => i.priority === 'high').length;

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setNameLoading(true);
    setNameError('');
    setNameSuccess(false);
    try {
      const res = await axiosInstance.put('/api/auth/me', { name });
      login(res.data.data, res.data.token);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(getErrorMessage(err));
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      const res = await axiosInstance.put('/api/auth/me', { currentPassword, newPassword });
      login(res.data.data, res.data.token);
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(getErrorMessage(err));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete('/api/auth/me');
      logout();
      navigate('/');
    } catch {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  const avatarInitial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {avatarInitial}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Ideas', value: ideas.length },
            { label: 'Connected', value: connectedCount },
            { label: 'High Priority', value: highPriorityCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Edit Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-gray-400" />
            <h2 className="text-base font-semibold text-gray-800">Edit Name</h2>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateName}
                disabled={nameLoading || name === user?.name}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {nameLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Name
              </button>
              {nameSuccess && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={14} /> Saved!</span>}
              {nameError && <span className="text-red-500 text-sm">{nameError}</span>}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-gray-400" />
            <h2 className="text-base font-semibold text-gray-800">Change Password</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Current Password', value: currentPassword, set: setCurrentPassword },
              { label: 'New Password', value: newPassword, set: setNewPassword },
              { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword },
            ].map(({ label, value, set }) => (
              <input
                key={label}
                type="password"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={label}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
            <div className="flex items-center gap-3">
              <button
                onClick={handleChangePassword}
                disabled={pwLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                Update Password
              </button>
              {pwSuccess && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={14} /> Updated!</span>}
              {pwError && <span className="text-red-500 text-sm">{pwError}</span>}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all your ideas. This cannot be undone.</p>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={14} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Delete Account</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete your account and <strong>all {ideas.length} ideas</strong>. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
