import { useState } from 'react';
import { reviewsApi } from '../api/reviews';
import { extractErrorMessage } from '../api/client';
import Modal from './Modal';
import StarRating from './StarRating';

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await reviewsApi.create({
        teacher: booking.teacher_profile,
        booking: booking.id,
        rating,
        comment,
      });
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Review your session with ${booking.teacher_name}`} onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Your rating</label>
          <StarRating value={rating} onChange={setRating} size={26} />
        </div>
        <div className="field">
          <label>Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was your session?" />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Submitting…' : 'Submit review'}</button>
      </form>
    </Modal>
  );
}
