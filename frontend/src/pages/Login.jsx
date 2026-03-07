import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const API = '/api';

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 'signin' | 'signup' | 'forgot'
  const [view, setView] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // forgot-password specific state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const signinActive = view === 'signin';

  useEffect(() => {
    if (location.state?.signup) setView('signup');
    if (location.state?.forgot) setView('forgot');
  }, [location.state]);

  // redirect if already logged in — admin goes to /admin, others go home
  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    return null;
  }

  function toggleView() {
    setError('');
    setSuccess('');
    setView((v) => (v === 'signin' ? 'signup' : 'signin'));
  }

  function goToForgot() {
    setError('');
    setSuccess('');
    setForgotMsg('');
    setForgotError('');
    setForgotEmail('');
    setView('forgot');
  }

  function goToSignIn() {
    setError('');
    setSuccess('');
    setForgotMsg('');
    setForgotError('');
    setView('signin');
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await login(email, password);
      // Admin → admin panel, everyone else → home
      navigate(data?.user?.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(name, email, password, phone);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.resetToken) {
        // Navigate to the reset page with the token
        navigate(`/reset-password?token=${data.resetToken}`);
      } else {
        setForgotError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setForgotError('Network error. Please check your connection and try again.');
    }
    setForgotLoading(false);
  };

  // ── Forgot Password view (full-width overlay on the card) ──
  if (view === 'forgot') {
    return (
      <div className="login-page">
        <div className="login-card forgot-card">
          <div className="login-card-bg login-card-bg-1 signin" />
          <div className="login-card-bg login-card-bg-2 signin" />

          <img className="login-logo login-logo-1" src="/logo.png" alt="Gift Mart" />

          <div className="login-form-panel signin active forgot-panel">
            <form onSubmit={handleForgotPassword}>
              <h2>Forgot Password</h2>
              <p className="forgot-hint">
                Enter your registered email address and we'll generate a password-reset link for you.
              </p>
              {forgotError && <div className="form-error">{forgotError}</div>}
              {forgotMsg && <div className="form-success">{forgotMsg}</div>}
              <div className="form-group">
                <label>Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button id="forgot-submit" type="submit" className="btn-submit" disabled={forgotLoading}>
                {forgotLoading ? 'Generating link...' : '🔗 Generate Reset Link'}
              </button>
              <button type="button" className="btn-toggle" onClick={goToSignIn}>
                ← Back to Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className={`login-card-bg login-card-bg-1 ${signinActive ? 'signin' : 'signup'}`} />
        <div className={`login-card-bg login-card-bg-2 ${signinActive ? 'signin' : 'signup'}`} />

        <div className={`login-form-panel signin ${signinActive ? 'active' : ''}`}>
          <form onSubmit={handleSignIn}>
            <h2>Sign In</h2>
            {error && view === 'signin' && <div className="form-error">{error}</div>}
            {success && view === 'signin' && <div className="form-success">{success}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                id="signin-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                id="signin-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Forgot password link */}
            <button type="button" className="btn-forgot-link" onClick={goToForgot}>
              Forgot password?
            </button>
            <button id="signin-submit" type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button type="button" className="btn-toggle" onClick={toggleView}>
              Go to Sign Up
            </button>
          </form>
        </div>

        <div className={`login-form-panel signup ${!signinActive ? 'active' : ''}`}>
          <form onSubmit={handleSignUp}>
            <h2>Sign Up</h2>
            {error && view === 'signup' && <div className="form-error">{error}</div>}
            {success && view === 'signup' && <div className="form-success">{success}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input
                id="signup-name"
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                id="signup-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                className="form-control"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                id="signup-password"
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button id="signup-submit" type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <button type="button" className="btn-toggle" onClick={toggleView}>
              Go to Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
