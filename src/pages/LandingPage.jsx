import { Link } from 'react-router-dom';
import { Brain, GitFork, Sparkles, Target, Zap, Shield, ArrowRight, CheckCircle, GitCompare } from 'lucide-react';
import logo from '../assets/logo.png';
import '../styles/pages/LandingPage.css';

const features = [
  { icon: Brain, title: 'Capture Instantly', desc: 'Dump raw thoughts without friction. Synapse organizes them while you keep thinking.' },
  { icon: Sparkles, title: 'AI Analysis', desc: 'Groq AI generates insights, action steps, and blind spots for every idea you capture.' },
  { icon: GitCompare, title: 'Compare Ideas', desc: 'Side-by-side AI comparison of any two ideas — see overlap, gaps, and combined potential.' },
  { icon: GitFork, title: 'Visual Graph', desc: 'Your entire knowledge base as an interactive network. Spot patterns at a glance.' },
  { icon: Target, title: 'Find Missing Pieces', desc: 'AI surfaces what your thinking is missing before you commit to a direction.' },
  { icon: Shield, title: 'Nothing Lost', desc: 'Every idea saved, tagged, and searchable. Your second brain never forgets.' },
];

const steps = [
  { n: '01', title: 'Capture', desc: 'Write any idea — raw, half-baked, or fully formed.' },
  { n: '02', title: 'Analyze', desc: 'AI generates insights and action steps instantly.' },
  { n: '03', title: 'Connect', desc: 'AI links related ideas across your knowledge base.' },
  { n: '04', title: 'Compare', desc: 'Evaluate ideas side-by-side with AI arbitration.' },
  { n: '05', title: 'Decide', desc: 'Act with confidence backed by full context.' },
];

export default function LandingPage() {
  return (
    <div className="landing-root">

      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <img src={logo} alt="Synapse" className="landing-nav-logo" />
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="landing-nav-signin">Sign in</Link>
            <Link to="/register" className="landing-nav-cta">Get started free</Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-badge">
          <Sparkles size={11} /> POWERED BY GROQ AI
        </div>

        <h1 className="landing-h1">
          The second brain that<br />
          <span className="landing-h1-gradient">turns chaos into clarity</span>
        </h1>

        <p className="landing-subtitle">
          Capture raw thoughts, get instant AI analysis, compare ideas head-to-head, and finally make decisions you trust.
        </p>

        <div className="landing-hero-btns">
          <Link to="/register" className="landing-btn-primary">
            Start free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="landing-btn-secondary">
            Sign in
          </Link>
        </div>

        <div className="landing-trust-row">
          {['No credit card', 'Free forever', 'Cancel anytime'].map(t => (
            <span key={t} className="landing-trust-item">
              <CheckCircle size={13} style={{ color: '#10b981' }} /> {t}
            </span>
          ))}
        </div>
      </section>

      <section className="landing-how">
        <div className="landing-how-inner">
          <div className="landing-section-header">
            <h2 className="landing-section-title">How it works</h2>
            <p className="landing-section-sub">Five steps from raw thought to clear decision</p>
          </div>
          <div className="landing-steps-grid">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="landing-step-card">
                <div className="landing-step-num">{n}</div>
                <div className="landing-step-title">{title}</div>
                <div className="landing-step-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Everything you need</h2>
          <p className="landing-section-sub">Built to make your thinking visible and actionable</p>
        </div>
        <div className="landing-features-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="landing-feature-card">
              <div className="landing-feature-icon">
                <Icon size={18} style={{ color: '#4A7FDB' }} />
              </div>
              <div className="landing-feature-title">{title}</div>
              <div className="landing-feature-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-cta-box">
          <h2 className="landing-cta-title">Ready to think better?</h2>
          <p className="landing-cta-sub">Join and start turning messy thoughts into clear decisions.</p>
          <Link to="/register" className="landing-cta-btn">
            Get started — it's free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <img src={logo} alt="Synapse" className="landing-footer-logo" />
          </div>
          <p className="landing-footer-tagline">By Team BENAAM</p>
        </div>
      </footer>
    </div>
  );
}
