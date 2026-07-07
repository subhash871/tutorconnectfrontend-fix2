import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teachersApi } from '../api/teachers';
import { bookingsApi } from '../api/bookings';
import { paymentsApi } from '../api/payments';
import { extractErrorMessage } from '../api/client';
import { unwrapList, unwrapItem } from '../utils/unwrap';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { resolveMedia } from '../utils/media';

const emptyProfileForm = {
  title: '', headline: '', about: '', teaching_mode: 'both', experience_level: 'beginner',
  years_of_experience: 0, hourly_rate: '', location: '', latitude: '', longitude: '',
  service_area: 5, meeting_link: '', website: '', linkedin: '', youtube: '',
  is_available: true, max_students: 5,
};

const TABS = ['Overview', 'Profile', 'Subjects', 'Credentials', 'Availability', 'Gallery'];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [hasProfile, setHasProfile] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      teachersApi.myProfile().then((res) => res.data).catch((err) => (err.response?.status === 404 ? null : Promise.reject(err))),
      teachersApi.listSubjects({ page_size: 100 }).then((res) => unwrapList(res).results),
      bookingsApi.list().then((res) => unwrapList(res).results),
      paymentsApi.myTransactions().then((res) => unwrapList(res).results).catch(() => []),
    ])
      .then(([p, subs, bks, txns]) => {
        if (p) {
          setProfile(p);
          setHasProfile(true);
          setProfileForm({ ...emptyProfileForm, ...p });
        }
        setAllSubjects(subs);
        setBookings(bks);
        setTransactions(txns);
      })
      .catch((err) => showToast(extractErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (hasProfile) {
        const res = await teachersApi.updateMyProfile(profileForm);
        setProfile(res.data);
        showToast('Profile updated', 'success');
      } else {
        const res = await teachersApi.createProfile(profileForm);
        setProfile(unwrapItem(res));
        setHasProfile(true);
        showToast('Teacher profile created! You can now appear in search results.', 'success');
      }
      loadAll();
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await teachersApi.toggleAvailability(profile.id);
      const body = res.data;
      setProfile((p) => ({ ...p, is_available: body.is_available }));
      showToast(body.message, 'info');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  const toggleSubject = async (subjectId, isAdded) => {
    try {
      if (isAdded) await teachersApi.removeSubject(profile.id, subjectId);
      else await teachersApi.addSubject(profile.id, subjectId);
      const res = await teachersApi.myProfile();
      setProfile(res.data);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loader full label="Loading your dashboard…" />;

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const totalEarnings = transactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header">
          <span className="eyebrow">Tutor dashboard</span>
          <h1>Welcome back, {user?.first_name || user?.username}</h1>
        </div>

        {!hasProfile && (
          <div className="alert alert-info">
            You haven't created your public teacher profile yet. Fill out the <button className="link-accent" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }} onClick={() => setTab('Profile')}>Profile tab</button> to start appearing in search results.
          </div>
        )}

        <div className="tab-bar">
          {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === 'Overview' && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card"><strong>{pendingCount}</strong><span>Pending requests</span></div>
              <div className="stat-card"><strong>{profile?.total_students ?? 0}</strong><span>Students taught</span></div>
              <div className="stat-card"><strong>{profile?.average_rating ?? '—'}</strong><span>Average rating</span></div>
              <div className="stat-card"><strong>Rs. {totalEarnings.toLocaleString()}</strong><span>Total earnings</span></div>
            </div>
            {hasProfile && (
              <div className="card" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <strong>Availability status:</strong> {profile.is_available ? 'Accepting new students' : 'Not accepting new students'}
                </div>
                <button className="btn btn-outline btn-sm" onClick={toggleAvailability}>Toggle availability</button>
              </div>
            )}
            <div className="card">
              <h3>Recent booking requests</h3>
              {bookings.length === 0 ? (
                <EmptyState title="No bookings yet" message="Complete your profile so students can find and book you." />
              ) : (
                <div className="booking-list">
                  {bookings.slice(0, 6).map((b) => (
                    <div key={b.id} className="mini-booking-row">
                      <div>
                        <strong>{b.student_name}</strong>
                        <p className="text-sm text-muted">{b.subject_name} · {b.preferred_date} · {b.start_time?.slice(0, 5)}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
              <Link to="/bookings" className="text-sm link-accent" style={{ display: 'inline-block', marginTop: 12 }}>Manage all bookings →</Link>
            </div>
          </>
        )}

        {tab === 'Profile' && (
          <div className="card">
            <h3>{hasProfile ? 'Edit your teacher profile' : 'Create your teacher profile'}</h3>
            <form onSubmit={saveProfile}>
              <div className="field-row">
                <div className="field">
                  <label>Title</label>
                  <input required value={profileForm.title} onChange={(e) => setProfileForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Math Tutor" />
                </div>
                <div className="field">
                  <label>Headline</label>
                  <input value={profileForm.headline} onChange={(e) => setProfileForm((p) => ({ ...p, headline: e.target.value }))} placeholder="e.g. Experienced SEE math tutor" />
                </div>
              </div>
              <div className="field">
                <label>About</label>
                <textarea value={profileForm.about} onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Teaching mode</label>
                  <select value={profileForm.teaching_mode} onChange={(e) => setProfileForm((p) => ({ ...p, teaching_mode: e.target.value }))}>
                    <option value="online_tuition">Online</option>
                    <option value="home_tuition">Home visit</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="field">
                  <label>Experience level</label>
                  <select value={profileForm.experience_level} onChange={(e) => setProfileForm((p) => ({ ...p, experience_level: e.target.value }))}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Years of experience</label>
                  <input type="number" min="0" value={profileForm.years_of_experience} onChange={(e) => setProfileForm((p) => ({ ...p, years_of_experience: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Hourly rate (Rs.)</label>
                  <input type="number" min="0" required value={profileForm.hourly_rate} onChange={(e) => setProfileForm((p) => ({ ...p, hourly_rate: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label>Location</label>
                <input value={profileForm.location} onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Kathmandu" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Max students</label>
                  <input type="number" min="1" value={profileForm.max_students} onChange={(e) => setProfileForm((p) => ({ ...p, max_students: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Meeting link (for online classes)</label>
                  <input value={profileForm.meeting_link} onChange={(e) => setProfileForm((p) => ({ ...p, meeting_link: e.target.value }))} placeholder="https://meet.google.com/…" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Website</label>
                  <input value={profileForm.website} onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))} />
                </div>
                <div className="field">
                  <label>LinkedIn</label>
                  <input value={profileForm.linkedin} onChange={(e) => setProfileForm((p) => ({ ...p, linkedin: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : hasProfile ? 'Save changes' : 'Create profile'}</button>
            </form>
          </div>
        )}

        {tab === 'Subjects' && (
          <div className="card">
            <h3>Subjects you teach</h3>
            {!hasProfile ? (
              <EmptyState title="Create your profile first" message="Add a profile before selecting subjects." />
            ) : (
              <div className="teacher-card-tags">
                {allSubjects.map((s) => {
                  const isAdded = profile.subjects?.some((ps) => ps.id === s.id);
                  return (
                    <button key={s.id} className={`subject-toggle-chip ${isAdded ? 'added' : ''}`} onClick={() => toggleSubject(s.id, isAdded)}>
                      {isAdded ? '✓ ' : '+ '}{s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'Credentials' && (
          <CredentialsPanel hasProfile={hasProfile} showToast={showToast} />
        )}

        {tab === 'Availability' && (
          <AvailabilityPanel hasProfile={hasProfile} showToast={showToast} />
        )}

        {tab === 'Gallery' && (
          <GalleryPanel hasProfile={hasProfile} showToast={showToast} />
        )}
      </div>
    </div>
  );
}

function CredentialsPanel({ hasProfile, showToast }) {
  const [qualifications, setQualifications] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qForm, setQForm] = useState({ degree: '', institution: '', field_of_study: '', start_year: '', end_year: '', is_current: false, description: '' });
  const [eForm, setEForm] = useState({ title: '', organization: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
  const [cForm, setCForm] = useState({ title: '', issuing_organization: '', credential_id: '', credential_url: '', issue_date: '', does_not_expire: true, file: null });

  useEffect(() => {
    if (!hasProfile) { setLoading(false); return; }
    Promise.all([
      teachersApi.listQualifications().then((res) => unwrapList(res).results),
      teachersApi.listExperiences().then((res) => unwrapList(res).results),
      teachersApi.listCertificates().then((res) => unwrapList(res).results),
    ]).then(([q, e, c]) => { setQualifications(q); setExperiences(e); setCertificates(c); }).finally(() => setLoading(false));
  }, [hasProfile]);

  if (!hasProfile) return <div className="card"><EmptyState title="Create your profile first" message="Add a profile before adding credentials." /></div>;
  if (loading) return <Loader label="Loading credentials…" />;

  const addQualification = async (e) => {
    e.preventDefault();
    try {
      const res = await teachersApi.createQualification(qForm);
      setQualifications((prev) => [...prev, unwrapItem(res)]);
      setQForm({ degree: '', institution: '', field_of_study: '', start_year: '', end_year: '', is_current: false, description: '' });
      showToast('Qualification added', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const addExperience = async (e) => {
    e.preventDefault();
    try {
      const res = await teachersApi.createExperience(eForm);
      setExperiences((prev) => [...prev, unwrapItem(res)]);
      setEForm({ title: '', organization: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
      showToast('Experience added', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const addCertificate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(cForm).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
      const res = await teachersApi.createCertificate(fd);
      setCertificates((prev) => [...prev, unwrapItem(res)]);
      setCForm({ title: '', issuing_organization: '', credential_id: '', credential_url: '', issue_date: '', does_not_expire: true, file: null });
      showToast('Certificate added', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  return (
    <div className="credentials-grid">
      <div className="card">
        <h3>Qualifications</h3>
        {qualifications.map((q) => (
          <div key={q.id} className="timeline-item">
            <strong>{q.degree}</strong>
            <p className="text-sm text-muted">{q.institution} · {q.start_year}–{q.is_current ? 'Present' : q.end_year}</p>
            <button className="btn btn-ghost btn-sm" onClick={async () => { await teachersApi.deleteQualification(q.id); setQualifications((prev) => prev.filter((x) => x.id !== q.id)); }}>Remove</button>
          </div>
        ))}
        <form onSubmit={addQualification} className="inline-add-form">
          <input placeholder="Degree" required value={qForm.degree} onChange={(e) => setQForm((f) => ({ ...f, degree: e.target.value }))} />
          <input placeholder="Institution" required value={qForm.institution} onChange={(e) => setQForm((f) => ({ ...f, institution: e.target.value }))} />
          <div className="field-row">
            <input type="number" placeholder="Start year" required value={qForm.start_year} onChange={(e) => setQForm((f) => ({ ...f, start_year: e.target.value }))} />
            <input type="number" placeholder="End year" value={qForm.end_year} onChange={(e) => setQForm((f) => ({ ...f, end_year: e.target.value }))} />
          </div>
          <button className="btn btn-outline btn-sm btn-block">Add qualification</button>
        </form>
      </div>

      <div className="card">
        <h3>Experience</h3>
        {experiences.map((exp) => (
          <div key={exp.id} className="timeline-item">
            <strong>{exp.title}</strong> — {exp.organization}
            <p className="text-sm text-muted">{exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}</p>
            <button className="btn btn-ghost btn-sm" onClick={async () => { await teachersApi.deleteExperience(exp.id); setExperiences((prev) => prev.filter((x) => x.id !== exp.id)); }}>Remove</button>
          </div>
        ))}
        <form onSubmit={addExperience} className="inline-add-form">
          <input placeholder="Title" required value={eForm.title} onChange={(e) => setEForm((f) => ({ ...f, title: e.target.value }))} />
          <input placeholder="Organization" required value={eForm.organization} onChange={(e) => setEForm((f) => ({ ...f, organization: e.target.value }))} />
          <div className="field-row">
            <input type="date" required value={eForm.start_date} onChange={(e) => setEForm((f) => ({ ...f, start_date: e.target.value }))} />
            <input type="date" value={eForm.end_date} onChange={(e) => setEForm((f) => ({ ...f, end_date: e.target.value }))} disabled={eForm.is_current} />
          </div>
          <label className="checkbox-row"><input type="checkbox" checked={eForm.is_current} onChange={(e) => setEForm((f) => ({ ...f, is_current: e.target.checked }))} /> Currently working here</label>
          <button className="btn btn-outline btn-sm btn-block">Add experience</button>
        </form>
      </div>

      <div className="card">
        <h3>Certificates</h3>
        {certificates.map((c) => (
          <div key={c.id} className="timeline-item">
            <strong>{c.title}</strong> — {c.issuing_organization}
            <button className="btn btn-ghost btn-sm" onClick={async () => { await teachersApi.deleteCertificate(c.id); setCertificates((prev) => prev.filter((x) => x.id !== c.id)); }}>Remove</button>
          </div>
        ))}
        <form onSubmit={addCertificate} className="inline-add-form">
          <input placeholder="Title" required value={cForm.title} onChange={(e) => setCForm((f) => ({ ...f, title: e.target.value }))} />
          <input placeholder="Issuing organization" required value={cForm.issuing_organization} onChange={(e) => setCForm((f) => ({ ...f, issuing_organization: e.target.value }))} />
          <input type="date" placeholder="Issue date" value={cForm.issue_date} onChange={(e) => setCForm((f) => ({ ...f, issue_date: e.target.value }))} />
          <input type="file" onChange={(e) => setCForm((f) => ({ ...f, file: e.target.files[0] }))} />
          <button className="btn btn-outline btn-sm btn-block">Add certificate</button>
        </form>
      </div>
    </div>
  );
}

function AvailabilityPanel({ hasProfile, showToast }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '11:00', is_available: true });
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (!hasProfile) { setLoading(false); return; }
    teachersApi.listAvailability().then((res) => setSlots(unwrapList(res).results)).finally(() => setLoading(false));
  }, [hasProfile]);

  if (!hasProfile) return <div className="card"><EmptyState title="Create your profile first" /></div>;
  if (loading) return <Loader label="Loading availability…" />;

  const addSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await teachersApi.createAvailability(form);
      setSlots((prev) => [...prev, unwrapItem(res)]);
      showToast('Availability slot added', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const removeSlot = async (id) => {
    await teachersApi.deleteAvailability(id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="card">
      <h3>Weekly availability</h3>
      <div className="availability-list" style={{ marginBottom: 20 }}>
        {slots.map((s) => (
          <span key={s.id} className="tag-pill removable">
            {days[s.day_of_week]} {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
            <button onClick={() => removeSlot(s.id)}>×</button>
          </span>
        ))}
      </div>
      <form onSubmit={addSlot} className="field-row" style={{ alignItems: 'flex-end' }}>
        <div className="field">
          <label>Day</label>
          <select value={form.day_of_week} onChange={(e) => setForm((f) => ({ ...f, day_of_week: Number(e.target.value) }))}>
            {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Start</label>
          <input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
        </div>
        <div className="field">
          <label>End</label>
          <input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
        </div>
        <div className="field">
          <button className="btn btn-outline">Add slot</button>
        </div>
      </form>
    </div>
  );
}

function GalleryPanel({ hasProfile, showToast }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (!hasProfile) { setLoading(false); return; }
    teachersApi.listGallery().then((res) => setImages(unwrapList(res).results)).finally(() => setLoading(false));
  }, [hasProfile]);

  if (!hasProfile) return <div className="card"><EmptyState title="Create your profile first" /></div>;
  if (loading) return <Loader label="Loading gallery…" />;

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      const res = await teachersApi.uploadGalleryImage(fd);
      setImages((prev) => [...prev, unwrapItem(res)]);
      setFile(null);
      setCaption('');
      showToast('Image uploaded', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  return (
    <div className="card">
      <h3>Gallery</h3>
      <div className="gallery-grid" style={{ marginBottom: 20 }}>
        {images.map((g) => (
          <div key={g.id} style={{ position: 'relative' }}>
            <img src={resolveMedia(g.image)} alt={g.caption} />
            <button className="btn btn-danger btn-sm" style={{ position: 'absolute', top: 4, right: 4 }} onClick={async () => { await teachersApi.deleteGalleryImage(g.id); setImages((prev) => prev.filter((x) => x.id !== g.id)); }}>×</button>
          </div>
        ))}
      </div>
      <form onSubmit={upload} className="inline-add-form">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
        <input placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <button className="btn btn-outline btn-sm">Upload</button>
      </form>
    </div>
  );
}
