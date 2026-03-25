import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const API = '/api';

export default function Login() {
  const { login, register, verifyEmail, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 'signin' | 'signup' | 'verify' | 'forgot'
  const [view, setView] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showSplash, setShowSplash] = useState(true);

  // email verification (after signup)
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  // forgot-password specific state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.state?.signup) setView('signup');
    if (location.state?.forgot) setView('forgot');
  }, [location.state]);

  // redirect if already logged in — admin goes to /admin, others go home
  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    return null;
  }

  function switchView(newView) {
    setError('');
    setSuccess('');
    setForgotMsg('');
    setForgotError('');
    setVerifyError('');
    setResendMsg('');
    setConfirmPassword('');
    setView(newView);
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await login(email, password);
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
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await register(name, email, password, phone);
      if (data?.requiresVerification && data?.email) {
        setPendingVerifyEmail(data.email);
        setVerifyCode('');
        setVerifyError('');
        setResendMsg('');
        setView('verify');
      } else {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/', { replace: true }), 1000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setResendMsg('');
    if (!verifyCode.trim()) {
      setVerifyError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(pendingVerifyEmail, verifyCode);
      setSuccess('Email verified! Redirecting...');
      setTimeout(() => navigate('/', { replace: true }), 800);
    } catch (err) {
      setVerifyError(err.message || 'Invalid or expired code.');
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setVerifyError('');
    setResendMsg('');
    try {
      const res = await fetch(`${API}/auth/resend-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingVerifyEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResendMsg('Code sent. Check your email.');
      } else {
        setVerifyError(data.message || 'Could not resend code.');
      }
    } catch {
      setVerifyError('Network error.');
    }
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
        navigate(`/reset-password?token=${data.resetToken}`);
      } else {
        setForgotError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setForgotError('Network error. Please check your connection and try again.');
    }
    setForgotLoading(false);
  };

  return (
    <div className="login-page-container">
      {/* Splash Screen */}
      <div className={`splash-screen ${!showSplash ? 'splash-hidden' : ''}`} id="splash-screen">
        <div className="splash-logo-container">
          <img alt="Gift Mart Logo" className="splash-logo" src="/logo.png" />
          <div className="splash-pulse-ring"></div>
        </div>
        <h1 className="splash-title">Gift Mart</h1>
        <p className="splash-subtitle">Elevated Gifting</p>
      </div>

      {/* Main Container */}
      <main className={`main-content ${!showSplash ? 'visible' : ''}`} id="main-content">
        <section className="auth-card">
          {/* Sliding Header Toggle */}
          <div className="auth-toggle">
            <div className={`toggle-indicator ${view === 'signup' || view === 'verify' ? 'signup-mode' : ''} ${view === 'forgot' ? 'signup-mode' : ''}`}></div>
            <button className="toggle-btn" style={{ color: view === 'signin' ? '#E5E4E2' : 'rgba(209, 213, 219, 0.6)' }} onClick={() => switchView('signin')}>Sign In</button>
            <button className="toggle-btn" style={{ color: view === 'signup' || view === 'verify' || view === 'forgot' ? '#E5E4E2' : 'rgba(209, 213, 219, 0.6)' }} onClick={() => { if (view === 'verify') switchView('signup'); else switchView('signup'); }}>{view === 'forgot' ? 'Forgot' : 'Sign Up'}</button>
          </div>

          <div className="auth-body">
            <div className="auth-logo-header">
              <img alt="Small Logo" src="/logo.png" />
            </div>

            <div className="forms-container">
              {/* Sign In Form */}
              <div className={`form-panel ${view === 'signin' ? 'active' : ''}`} id="login-form">
                <header className="form-header">
                  <h2>Welcome Back</h2>
                  <p>Enter your credentials to access your account.</p>
                  {error && view === 'signin' && <div className="form-error">{error}</div>}
                  {success && view === 'signin' && <div className="form-success">{success}</div>}
                </header>
                <form className="input-group" onSubmit={handleSignIn}>
                  <input className="luxury-input" placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <input className="luxury-input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                  <div className="forgot-link-container">
                    <button type="button" className="forgot-link" onClick={() => switchView('forgot')}>Forgot Password?</button>
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>

              {/* Sign Up Form */}
              <div className={`form-panel ${view === 'signup' ? 'active' : ''}`} id="signup-form">
                <header className="form-header">
                  <h2>Create Account</h2>
                  <p>Join the circle of premium gifting.</p>
                  {error && view === 'signup' && <div className="form-error">{error}</div>}
                  {success && view === 'signup' && <div className="form-success">{success}</div>}
                </header>
                <form className="input-group" onSubmit={handleSignUp}>
                  <input className="luxury-input" placeholder="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                  <input className="luxury-input" placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <input className="luxury-input" placeholder="Phone Number (Optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <input className="luxury-input" placeholder="Create Password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <input className="luxury-input" placeholder="Confirm Password" type="password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                  <div className="checkbox-group">
                    <input id="terms" type="checkbox" required />
                    <label htmlFor="terms">I agree to the <span className="underline">Terms & Conditions</span></label>
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </form>
              </div>

              {/* Verify Email Form (after signup) */}
              <div className={`form-panel ${view === 'verify' ? 'active' : ''}`} id="verify-form">
                <header className="form-header">
                  <h2>Verify your email</h2>
                  <p>We sent a 6-digit code to <strong>{pendingVerifyEmail}</strong>. Enter it below.</p>
                  {verifyError && <div className="form-error">{verifyError}</div>}
                  {resendMsg && <div className="form-success">{resendMsg}</div>}
                </header>
                <form className="input-group" onSubmit={handleVerifyEmail}>
                  <input
                    className="luxury-input"
                    placeholder="Enter 6-digit code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                  <button type="button" className="back-link" onClick={handleResendCode}>Resend code</button>
                  <button type="button" className="back-link" onClick={() => switchView('signup')}>← Back to Sign Up</button>
                </form>
              </div>

              {/* Forgot Password Form */}
              <div className={`form-panel ${view === 'forgot' ? 'active' : ''}`} id="forgot-form">
                <header className="form-header">
                  <h2>Recover Access</h2>
                  <p>Enter your email to receive a reset link.</p>
                  {forgotError && <div className="form-error">{forgotError}</div>}
                  {forgotMsg && <div className="form-success">{forgotMsg}</div>}
                </header>
                <form className="input-group" onSubmit={handleForgotPassword}>
                  <input className="luxury-input" placeholder="Email Address" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />

                  <button type="submit" className="submit-btn" disabled={forgotLoading}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button type="button" className="back-link" onClick={() => switchView('signin')}>← Back to Sign In</button>
                </form>
              </div>
            </div>

          </div>
        </section>

        <footer className="login-footer">
          <p>© 2024 Gift Mart Luxury Collection</p>
        </footer>
      </main>
    </div>
  );
}
