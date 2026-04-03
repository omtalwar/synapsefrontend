import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerAPI } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import { getErrorMessage } from '../../utils/helpers';
import '../../styles/components/AuthForms.css';

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await registerAPI({ name: form.name, email: form.email, password: form.password });
      login(res.data.data, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="auth-form-error">{error}</div>}
      <div>
        <label className="auth-label">Full name</label>
        <input
          name="name" type="text" value={form.name}
          onChange={handleChange} className="auth-input"
          placeholder="Jane Smith" required
        />
      </div>
      <div>
        <label className="auth-label">Email</label>
        <input
          name="email" type="email" value={form.email}
          onChange={handleChange} className="auth-input"
          placeholder="you@example.com" required
        />
      </div>
      <div>
        <label className="auth-label">Password</label>
        <div className="auth-input-wrap">
          <input
            name="password" type={showPass ? 'text' : 'password'} value={form.password}
            onChange={handleChange} className="auth-input auth-input--with-eye"
            placeholder="Min 6 characters" required
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="auth-eye-btn">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="auth-label">Confirm password</label>
        <input
          name="confirmPassword" type="password" value={form.confirmPassword}
          onChange={handleChange} className="auth-input"
          placeholder="••••••" required
        />
      </div>
      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Creating account…' : 'Create account'}
      </button>
      <p className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-footer-link">Sign in</Link>
      </p>
    </form>
  );
}
