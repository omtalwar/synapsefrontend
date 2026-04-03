import RegisterForm from '../components/auth/RegisterForm';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/pages/AuthPages.css';

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner auth-page-inner--wide">
        <Link to="/" className="auth-page-brand auth-page-brand--register">
          <img src={logo} alt="Synapse" className="auth-page-logo" />
        </Link>

        <div className="auth-page-heading auth-page-heading--register">
          <h1 className="auth-page-title">Create your account</h1>
          <p className="auth-page-subtitle">Start building your second brain today</p>
        </div>

        <div className="auth-page-card">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
