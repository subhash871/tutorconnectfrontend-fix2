import { useState } from 'react';
import { bookingsApi } from '../api/bookings';
import { extractErrorMessage } from '../api/client';
import Modal from './Modal';

export default function BookingModal({ teacherProfile, onClose, onSuccess }) {
  const [form, setForm] = useState({
    subject: teacherProfile.subjects?.[0]?.id || '',
    teaching_mode: teacherProfile.teaching_mode === 'home_tuition' ? 'home_tuition' : 'online_tuition',
    preferred_date: '',
    start_time: '',
    end_time: '',
    duration_hours: '1.00',
    location: teacherProfile.location || '',
    student_notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await bookingsApi.create({
        teacher: teacherProfile.user.id,
        subject: form.subject || null,
        teaching_mode: form.teaching_mode,
        preferred_date: form.preferred_date,
        start_time: form.start_time,
        end_time: form.end_time,
        duration_hours: form.duration_hours,
        location: form.location,
        student_notes: form.student_notes,
      });
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Book a session with ${teacherProfile.user?.full_name || teacherProfile.title}`} onClose={onClose} width={520}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        {teacherProfile.subjects?.length > 0 && (
          <div className="field">
            <label>Subject</label>
            <select name="subject" value={form.subject} onChange={onChange} required>
              <option value="">Select a subject</option>
              {teacherProfile.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="field">
          <label>Teaching mode</label>
          <select name="teaching_mode" value={form.teaching_mode} onChange={onChange}>
            <option value="online_tuition">Online</option>
            <option value="home_tuition">Home visit</option>
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Preferred date</label>
            <input type="date" name="preferred_date" value={form.preferred_date} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Duration (hours)</label>
            <input type="number" step="0.5" min="0.5" name="duration_hours" value={form.duration_hours} onChange={onChange} required />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Start time</label>
            <input type="time" name="start_time" value={form.start_time} onChange={onChange} required />
          </div>
          <div className="field">
            <label>End time</label>
            <input type="time" name="end_time" value={form.end_time} onChange={onChange} required />
          </div>
        </div>
        {form.teaching_mode === 'home_tuition' && (
          <div className="field">
            <label>Location</label>
            <input name="location" value={form.location} onChange={onChange} placeholder="Your address" />
          </div>
        )}
        <div className="field">
          <label>Notes for the tutor</label>
          <textarea name="student_notes" value={form.student_notes} onChange={onChange} placeholder="What would you like help with?" />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Sending request…' : 'Send booking request'}</button>
      </form>
    </Modal>
  );
}
