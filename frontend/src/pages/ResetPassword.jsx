import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/login.css';

const API = '/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) {
            setError('No reset token found. Please request a new password-reset link.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Password reset successfully! Redirecting to sign in...');
                setTimeout(() => navigate('/login', { replace: true }), 2000);
            } else {
                setError(data.message || 'Failed to reset password. The link may have expired.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card forgot-card">
                <div className="login-card-bg login-card-bg-1 signin" />
                <div className="login-card-bg login-card-bg-2 signin" />

                <img className="login-logo login-logo-1" src="/logo.png" alt="Gift Mart" />

                <div className="login-form-panel signin active forgot-panel">
                    <form onSubmit={handleSubmit}>
                        <h2>Reset Password</h2>
                        <p className="forgot-hint">
                            Choose a strong new password for your account.
                        </p>

                        {error && <div className="form-error">{error}</div>}
                        {success && <div className="form-success">{success}</div>}

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                id="reset-new-password"
                                type="password"
                                className="form-control"
                                placeholder="At least 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={6}
                                required
                                disabled={!token || !!success}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                id="reset-confirm-password"
                                type="password"
                                className="form-control"
                                placeholder="Repeat your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={6}
                                required
                                disabled={!token || !!success}
                            />
                        </div>

                        <button
                            id="reset-submit"
                            type="submit"
                            className="btn-submit"
                            disabled={loading || !token || !!success}
                        >
                            {loading ? 'Resetting...' : '🔐 Set New Password'}
                        </button>

                        <button
                            type="button"
                            className="btn-toggle"
                            onClick={() => navigate('/login')}
                        >
                            ← Back to Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
