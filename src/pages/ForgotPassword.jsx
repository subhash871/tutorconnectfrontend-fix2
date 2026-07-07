import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { extractErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      showToast('If that email exists, a reset code has been sent.', 'success');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <span className="eyebrow">Trouble logging in?</span>
        <h2>Reset your password</h2>
        <p className="text-sm">We'll email you a code to reset your password. <Link to="/login" className="link-accent">Back to login</Link></p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Sending…' : 'Send reset code'}</button>
        </form>
      </div>
    </div>
  );
}
