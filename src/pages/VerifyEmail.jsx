import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { extractErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp });
      showToast('Email verified! You can now log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) { setError('Enter your email first.'); return; }
    setResending(true);
    setError('');
    try {
      await authApi.resendOtp({ email, purpose: 'email_verification' });
      showToast('A new code was sent to your email.', 'success');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <span className="eyebrow">One more step</span>
        <h2>Verify your email</h2>
        <p className="text-sm">Enter the OTP we sent to your inbox to activate your account.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="otp">Verification code</label>
            <input id="otp" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Verifying…' : 'Verify email'}</button>
        </form>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={resend} disabled={resending}>
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </div>
  );
}
