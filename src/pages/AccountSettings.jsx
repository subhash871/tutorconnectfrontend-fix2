import { useState } from 'react';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resolveMedia } from '../utils/media';

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('profile');

  const [form, setForm] = useState({
    first_name: user?.first_name || '', last_name: user?.last_name || '',
    phone_number: user?.phone_number || '', bio: user?.bio || '',
    address: user?.address || '', city: user?.city || '', state: user?.state || '',
    country: user?.country || '', date_of_birth: user?.date_of_birth || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', new_password2: '' });
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      let res;
      if (imageFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
        fd.append('profile_image', imageFile);
        res = await usersApi.updateMe(fd);
      } else {
        res = await usersApi.updateMe(form);
      }
      updateUser(res.data?.data ?? res.data);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.new_password2) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword(pwForm);
      setPwForm({ old_password: '', new_password: '', new_password2: '' });
      showToast('Password changed successfully', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <span className="eyebrow">Account</span>
          <h1>Account settings</h1>
        </div>

        <div className="tab-bar">
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Profile</button>
          <button className={tab === 'security' ? 'active' : ''} onClick={() => setTab('security')}>Security</button>
        </div>

        {tab === 'profile' && (
          <div className="card">
            <div className="profile-photo-row">
              <div className="teacher-detail-photo">
                {(imageFile || user?.profile_image) ? (
                  <img src={imageFile ? URL.createObjectURL(imageFile) : resolveMedia(user.profile_image)} alt="Profile" />
                ) : (
                  <span>{(user?.first_name || user?.username || '?').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <label className="btn btn-outline btn-sm">
                  Change photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFile(e.target.files[0])} />
                </label>
                <p className="text-sm text-muted" style={{ marginTop: 6 }}>{user?.email}</p>
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <div className="field-row">
                <div className="field"><label>First name</label><input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} /></div>
                <div className="field"><label>Last name</label><input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Phone number</label><input value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} /></div>
                <div className="field"><label>Date of birth</label><input type="date" value={form.date_of_birth || ''} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} /></div>
              </div>
              <div className="field"><label>Bio</label><textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} /></div>
              <div className="field"><label>Address</label><input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
              <div className="field-row">
                <div className="field"><label>City</label><input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></div>
                <div className="field"><label>State / Province</label><input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} /></div>
              </div>
              <div className="field"><label>Country</label><input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} /></div>
              <button className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save changes'}</button>
            </form>
          </div>
        )}

        {tab === 'security' && (
          <div className="card">
            <h3>Change password</h3>
            <form onSubmit={changePassword}>
              <div className="field">
                <label>Current password</label>
                <input type="password" required value={pwForm.old_password} onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>New password</label>
                  <input type="password" required minLength={8} value={pwForm.new_password} onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Confirm new password</label>
                  <input type="password" required value={pwForm.new_password2} onChange={(e) => setPwForm((f) => ({ ...f, new_password2: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary" disabled={savingPw}>{savingPw ? 'Updating…' : 'Update password'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
