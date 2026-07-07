import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import { paymentsApi } from '../api/payments';
import { unwrapList } from '../utils/unwrap';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import RescheduleModal from '../components/RescheduleModal';
import PaymentModal from '../components/PaymentModal';
import ReviewModal from '../components/ReviewModal';
import { unwrapItem } from '../utils/unwrap';

const FILTERS = ['all', 'pending', 'accepted', 'completed', 'cancelled', 'rejected'];

export default function Bookings() {
  const { isTeacher, isStudent } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actingId, setActingId] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const openReview = async (b) => {
    try {
      const res = await bookingsApi.retrieve(b.id);
      setReviewTarget(unwrapItem(res));
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  const load = () => {
    setLoading(true);
    bookingsApi.list()
      .then((res) => setBookings(unwrapList(res).results))
      .catch((err) => showToast(extractErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const runAction = async (fn, id, successMsg) => {
    setActingId(id);
    try {
      await fn();
      showToast(successMsg, 'success');
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header">
          <span className="eyebrow">Sessions</span>
          <h1>{isTeacher ? 'Booking requests' : 'My bookings'}</h1>
        </div>

        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader label="Loading bookings…" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No bookings here" message={isStudent ? 'Browse tutors and send your first booking request.' : 'New booking requests will show up here.'} action={isStudent && <Link to="/find-tutors" className="btn btn-primary">Find tutors</Link>} />
        ) : (
          <div className="booking-list">
            {filtered.map((b) => (
              <div key={b.id} className="booking-row card">
                <div className="booking-row-main">
                  <div>
                    <span className="mono text-sm text-muted">{b.booking_id}</span>
                    <h3>{isTeacher ? b.student_name : b.teacher_name}</h3>
                    <p className="text-sm text-muted">{b.subject_name || 'General session'} · {b.teaching_mode?.replace(/_/g, ' ')}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="booking-row-details">
                  <span>📅 {b.preferred_date}</span>
                  <span>🕒 {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}</span>
                  <span>💰 Rs. {b.total_amount} {b.is_paid && <em className="paid-tag">Paid</em>}</span>
                </div>
                <div className="booking-row-actions">
                  {isTeacher && b.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm" disabled={actingId === b.id} onClick={() => runAction(() => bookingsApi.accept(b.id), b.id, 'Booking accepted')}>Accept</button>
                      <button className="btn btn-danger btn-sm" disabled={actingId === b.id} onClick={() => runAction(() => bookingsApi.reject(b.id), b.id, 'Booking rejected')}>Reject</button>
                    </>
                  )}
                  {isTeacher && b.status === 'accepted' && (
                    <button className="btn btn-secondary btn-sm" disabled={actingId === b.id} onClick={() => runAction(() => bookingsApi.complete(b.id), b.id, 'Booking marked completed')}>Mark completed</button>
                  )}
                  {isStudent && ['pending', 'accepted'].includes(b.status) && (
                    <button className="btn btn-ghost btn-sm" disabled={actingId === b.id} onClick={() => runAction(() => bookingsApi.cancel(b.id, 'Changed my mind'), b.id, 'Booking cancelled')}>Cancel</button>
                  )}
                  {isStudent && ['pending', 'accepted'].includes(b.status) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setRescheduleTarget(b)}>Reschedule</button>
                  )}
                  {isStudent && b.status === 'accepted' && !b.is_paid && (
                    <button className="btn btn-primary btn-sm" onClick={() => setPaymentTarget(b)}>Pay now</button>
                  )}
                  {isStudent && b.status === 'completed' && (
                    <button className="btn btn-outline btn-sm" onClick={() => openReview(b)}>Leave a review</button>
                  )}
                  <Link to={`/chat?booking=${b.id}`} className="btn btn-ghost btn-sm">Message</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={() => { setRescheduleTarget(null); showToast('Reschedule request sent', 'success'); load(); }}
        />
      )}

      {paymentTarget && (
        <PaymentModal
          booking={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onSuccess={() => { setPaymentTarget(null); showToast('Payment successful', 'success'); load(); }}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => { setReviewTarget(null); showToast('Thanks for your review!', 'success'); }}
        />
      )}
    </div>
  );
}
