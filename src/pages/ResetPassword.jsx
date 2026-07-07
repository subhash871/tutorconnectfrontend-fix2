import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { extractErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    new_password: '',
    new_password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(form);
      showToast('Password reset. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <span className="eyebrow">Almost there</span>
        <h2>Set a new password</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={onChange} />
          </div>
          <div className="field">
            <label htmlFor="otp">Reset code</label>
            <input id="otp" name="otp" required value={form.otp} onChange={onChange} />
          </div>
          <div className="field">
            <label htmlFor="new_password">New password</label>
            <input id="new_password" name="new_password" type="password" required value={form.new_password} onChange={onChange} />
          </div>
          <div className="field">
            <label htmlFor="new_password2">Confirm new password</label>
            <input id="new_password2" name="new_password2" type="password" required value={form.new_password2} onChange={onChange} />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Resetting…' : 'Reset password'}</button>
        </form>
      </div>
    </div>
  );
}
