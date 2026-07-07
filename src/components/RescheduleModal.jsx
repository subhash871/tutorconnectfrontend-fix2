import { useState } from 'react';
import { bookingsApi } from '../api/bookings';
import { extractErrorMessage } from '../api/client';
import Modal from './Modal';

export default function RescheduleModal({ booking, onClose, onSuccess }) {
  const [form, setForm] = useState({ new_date: booking.preferred_date, new_start_time: '', new_end_time: '', reason: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await bookingsApi.requestReschedule(booking.id, form);
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Request a reschedule" onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>New date</label>
          <input type="date" name="new_date" value={form.new_date} onChange={onChange} required />
        </div>
        <div className="field-row">
          <div className="field">
            <label>New start time</label>
            <input type="time" name="new_start_time" value={form.new_start_time} onChange={onChange} required />
          </div>
          <div className="field">
            <label>New end time</label>
            <input type="time" name="new_end_time" value={form.new_end_time} onChange={onChange} required />
          </div>
        </div>
        <div className="field">
          <label>Reason</label>
          <textarea name="reason" value={form.reason} onChange={onChange} placeholder="Let them know why you need to reschedule" />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Sending…' : 'Send request'}</button>
      </form>
    </Modal>
  );
}
