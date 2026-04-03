import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/pages/AuthPages.css';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <Link to="/" className="auth-page-brand">
          <img src={logo} alt="Synapse" className="auth-page-logo" />
        </Link>

        <div className="auth-page-heading">
          <h1 className="auth-page-title">Welcome back</h1>
          <p className="auth-page-subtitle">Sign in to your second brain</p>
        </div>

        <div className="auth-page-card">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
