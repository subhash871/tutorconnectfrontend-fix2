import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const initialForm = {
  email: '', username: '', password: '', password2: '',
  first_name: '', last_name: '', phone_number: '', role: 'student',
};

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const body = await register(form);
      showToast('Account created! Please verify your email.', 'success');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card" style={{ maxWidth: 560 }}>
        <span className="eyebrow">Join TutorConnect Nepal</span>
        <h2>Create your account</h2>
        <p className="text-sm">Already have an account? <Link to="/login" className="link-accent">Log in</Link></p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>I am joining as a…</label>
            <div className="role-toggle">
              <button type="button" className={form.role === 'student' ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, role: 'student' }))}>Student / Guardian</button>
              <button type="button" className={form.role === 'teacher' ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, role: 'teacher' }))}>Tutor</button>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="first_name">First name</label>
              <input id="first_name" name="first_name" required value={form.first_name} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="last_name">Last name</label>
              <input id="last_name" name="last_name" required value={form.last_name} onChange={onChange} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" required value={form.username} onChange={onChange} />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={onChange} />
          </div>

          <div className="field">
            <label htmlFor="phone_number">Phone number</label>
            <input id="phone_number" name="phone_number" required value={form.phone_number} onChange={onChange} placeholder="98XXXXXXXX" />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required value={form.password} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="password2">Confirm password</label>
              <input id="password2" name="password2" type="password" required value={form.password2} onChange={onChange} />
            </div>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}