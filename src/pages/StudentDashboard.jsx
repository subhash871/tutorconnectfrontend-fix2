import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentsApi } from '../api/students';
import { teachersApi } from '../api/teachers';
import { bookingsApi } from '../api/bookings';
import { extractErrorMessage } from '../api/client';
import { unwrapList } from '../utils/unwrap';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const emptyProfile = {
  grade_level: '', school: '', parent_name: '', parent_phone: '',
  parent_email: '', learning_goals: '', preferred_mode: 'both', max_budget: '',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(emptyProfile);
  const [preferences, setPreferences] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPrefSubject, setNewPrefSubject] = useState('');

  useEffect(() => {
    Promise.all([
      studentsApi.myProfile().then((res) => res.data?.data ?? res.data),
      studentsApi.listPreferences().then((res) => unwrapList(res).results),
      teachersApi.listSubjects({ page_size: 100 }).then((res) => unwrapList(res).results),
      bookingsApi.list().then((res) => unwrapList(res).results),
    ])
      .then(([p, prefs, subs, bks]) => {
        setProfile({ ...emptyProfile, ...p });
        setPreferences(prefs);
        setSubjects(subs);
        setBookings(bks);
      })
      .catch((err) => showToast(extractErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { id, total_bookings, total_hours_learned, created_at, updated_at, ...payload } = profile;
      await studentsApi.updateMyProfile(payload);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const addPreference = async () => {
    if (!newPrefSubject) return;
    try {
      const res = await studentsApi.createPreference({ subject: newPrefSubject, preferred_gender: 'any', preferred_experience: 'any' });
      setPreferences((prev) => [...prev, res.data?.data ?? res.data]);
      setNewPrefSubject('');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  const removePreference = async (id) => {
    try {
      await studentsApi.deletePreference(id);
      setPreferences((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loader full label="Loading your dashboard…" />;

  const upcoming = bookings.filter((b) => ['pending', 'accepted'].includes(b.status)).slice(0, 5);

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header">
          <span className="eyebrow">Student dashboard</span>
          <h1>Welcome back, {user?.first_name || user?.username}</h1>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card"><strong>{profile.total_bookings ?? bookings.length}</strong><span>Total bookings</span></div>
          <div className="stat-card"><strong>{profile.total_hours_learned ?? 0}</strong><span>Hours learned</span></div>
          <div className="stat-card"><strong>{upcoming.length}</strong><span>Upcoming sessions</span></div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Upcoming sessions</h3>
            {upcoming.length === 0 ? (
              <EmptyState title="Nothing scheduled" message="Book a tutor to get started." action={<Link to="/find-tutors" className="btn btn-primary btn-sm">Find tutors</Link>} />
            ) : (
              <div className="booking-list">
                {upcoming.map((b) => (
                  <div key={b.id} className="mini-booking-row">
                    <div>
                      <strong>{b.teacher_name}</strong>
                      <p className="text-sm text-muted">{b.subject_name} · {b.preferred_date} · {b.start_time?.slice(0, 5)}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
            <Link to="/bookings" className="text-sm link-accent" style={{ display: 'inline-block', marginTop: 12 }}>View all bookings →</Link>
          </div>

          <div className="card">
            <h3>Learning preferences</h3>
            <div className="pref-add-row">
              <select value={newPrefSubject} onChange={(e) => setNewPrefSubject(e.target.value)}>
                <option value="">Add a subject preference…</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="btn btn-outline btn-sm" onClick={addPreference}>Add</button>
            </div>
            {preferences.length === 0 ? (
              <p className="text-sm text-muted">No subject preferences saved yet.</p>
            ) : (
              <div className="teacher-card-tags">
                {preferences.map((p) => (
                  <span key={p.id} className="tag-pill removable">
                    {subjects.find((s) => s.id === p.subject)?.name || `Subject #${p.subject}`}
                    <button onClick={() => removePreference(p.id)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3>Student profile</h3>
          <form onSubmit={saveProfile}>
            <div className="field-row">
              <div className="field">
                <label>Grade level</label>
                <input value={profile.grade_level || ''} onChange={(e) => setProfile((p) => ({ ...p, grade_level: e.target.value }))} placeholder="e.g. 10" />
              </div>
              <div className="field">
                <label>School</label>
                <input value={profile.school || ''} onChange={(e) => setProfile((p) => ({ ...p, school: e.target.value }))} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Parent / guardian name</label>
                <input value={profile.parent_name || ''} onChange={(e) => setProfile((p) => ({ ...p, parent_name: e.target.value }))} />
              </div>
              <div className="field">
                <label>Parent / guardian phone</label>
                <input value={profile.parent_phone || ''} onChange={(e) => setProfile((p) => ({ ...p, parent_phone: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Parent / guardian email</label>
              <input type="email" value={profile.parent_email || ''} onChange={(e) => setProfile((p) => ({ ...p, parent_email: e.target.value }))} />
            </div>
            <div className="field">
              <label>Learning goals</label>
              <textarea value={profile.learning_goals || ''} onChange={(e) => setProfile((p) => ({ ...p, learning_goals: e.target.value }))} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Preferred mode</label>
                <select value={profile.preferred_mode || 'both'} onChange={(e) => setProfile((p) => ({ ...p, preferred_mode: e.target.value }))}>
                  <option value="online_tuition">Online</option>
                  <option value="home_tuition">Home visit</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="field">
                <label>Max budget (Rs./hr)</label>
                <input type="number" value={profile.max_budget || ''} onChange={(e) => setProfile((p) => ({ ...p, max_budget: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
