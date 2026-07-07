import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, extractErrorMessage } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast(`Welcome back, ${user?.first_name || user?.username || 'there'}!`, 'success');
      const dest = location.state?.from?.pathname || (user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <span className="eyebrow">Welcome back</span>
        <h2>Log in to TutorConnect</h2>
        <p className="text-sm">New here? <Link to="/register" className="link-accent">Create an account</Link></p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={onChange} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={onChange} placeholder="••••••••" />
          </div>
          <div className="field" style={{ textAlign: 'right', marginTop: -8 }}>
            <Link to="/forgot-password" className="text-sm link-accent">Forgot password?</Link>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
