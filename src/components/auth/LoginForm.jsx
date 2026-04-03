import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginAPI } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import { getErrorMessage } from '../../utils/helpers';
import '../../styles/components/AuthForms.css';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAPI(form);
      login(res.data.data, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form auth-form--login">
      {error && <div className="auth-form-error">{error}</div>}
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
            placeholder="••••••" required
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="auth-eye-btn">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="auth-footer-text">
        No account?{' '}
        <Link to="/register" className="auth-footer-link">Create one</Link>
      </p>
    </form>
  );
}
