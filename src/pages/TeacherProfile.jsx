import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { teachersApi } from '../api/teachers';
import { reviewsApi } from '../api/reviews';
import { wishlistApi } from '../api/wishlist';
import { unwrapList, unwrapItem } from '../utils/unwrap';
import { resolveMedia } from '../utils/media';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../api/client';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import BookingModal from '../components/BookingModal';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent, user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    teachersApi.getProfile(id)
      .then((res) => setProfile(unwrapItem(res)))
      .catch(() => setError('Could not load this tutor profile.'))
      .finally(() => setLoading(false));

    reviewsApi.list({ teacher: id }).then((res) => setReviews(unwrapList(res).results)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && isStudent && id) {
      wishlistApi.check(id).then((res) => {
        const body = res.data?.data ?? res.data;
        setInWishlist(!!body?.is_wishlisted);
      }).catch(() => {});
      wishlistApi.list().then((res) => {
        const items = unwrapList(res).results;
        const match = items.find((w) => String(w.teacher?.id ?? w.teacher) === String(id));
        if (match) setWishlistId(match.id);
      }).catch(() => {});
    }
  }, [isAuthenticated, isStudent, id]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        if (wishlistId) await wishlistApi.remove(wishlistId);
        setInWishlist(false);
        showToast('Removed from wishlist', 'info');
      } else {
        const res = await wishlistApi.add(id);
        const body = unwrapItem(res);
        setWishlistId(body?.id ?? null);
        setInWishlist(true);
        showToast('Added to wishlist', 'success');
      }
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBookClick = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isStudent) { showToast('Only students can book sessions.', 'info'); return; }
    setBookingOpen(true);
  };

  if (loading) return <Loader full label="Loading tutor profile…" />;
  if (error || !profile) return <div className="container page-shell"><div className="alert alert-error">{error || 'Tutor not found.'}</div></div>;

  const teacherUser = profile.user || {};
  const name = teacherUser.full_name || `${teacherUser.first_name || ''} ${teacherUser.last_name || ''}`.trim();
  const isSelf = user?.id === teacherUser.id;

  return (
    <div className="page-shell">
      <div className="container">
        <div className="teacher-detail-grid">
          <div>
            <div className="card teacher-detail-header">
              <div className="teacher-detail-photo">
                {(profile.profile_image || teacherUser.profile_image) ? (
                  <img src={resolveMedia(profile.profile_image || teacherUser.profile_image)} alt={name} />
                ) : (
                  <span>{(name || 'T').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1>{name}</h1>
                <p className="teacher-detail-title">{profile.title}</p>
                <div className="teacher-card-meta">
                  <StarRating value={Number(profile.average_rating) || 0} count={profile.total_reviews} />
                  {profile.is_verified && <span className="badge badge-confirmed">Verified</span>}
                  {profile.is_available && <span className="badge badge-active">Available</span>}
                </div>
                <p className="text-sm text-muted">{profile.location}</p>
              </div>
              {!isSelf && (
                <div className="teacher-detail-actions">
                  <button className="btn btn-primary" onClick={handleBookClick}>Book a session</button>
                  {isStudent && (
                    <button className="btn btn-outline" onClick={toggleWishlist} disabled={wishlistLoading}>
                      {inWishlist ? '♥ Saved' : '♡ Save'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {profile.headline && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3>About</h3>
                <p><strong>{profile.headline}</strong></p>
                <p>{profile.about}</p>
              </div>
            )}

            {profile.subjects?.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Subjects</h3>
                <div className="teacher-card-tags">
                  {profile.subjects.map((s) => <span key={s.id} className="tag-pill">{s.name}</span>)}
                </div>
              </div>
            )}

            {profile.qualifications?.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Qualifications</h3>
                {profile.qualifications.map((q) => (
                  <div key={q.id} className="timeline-item">
                    <strong>{q.degree}</strong>
                    <p className="text-sm text-muted">{q.institution} · {q.start_year}–{q.is_current ? 'Present' : q.end_year}</p>
                    {q.description && <p className="text-sm">{q.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {profile.experiences?.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Experience</h3>
                {profile.experiences.map((exp) => (
                  <div key={exp.id} className="timeline-item">
                    <strong>{exp.title}</strong> — {exp.organization}
                    <p className="text-sm text-muted">{exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}</p>
                    {exp.description && <p className="text-sm">{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {profile.certificates?.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Certificates</h3>
                {profile.certificates.map((c) => (
                  <div key={c.id} className="timeline-item">
                    <strong>{c.title}</strong> — {c.issuing_organization}
                  </div>
                ))}
              </div>
            )}

            {profile.gallery_images?.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Gallery</h3>
                <div className="gallery-grid">
                  {profile.gallery_images.map((g) => (
                    <img key={g.id} src={resolveMedia(g.image)} alt={g.caption || 'Gallery'} />
                  ))}
                </div>
              </div>
            )}

            {profile.availability?.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Weekly availability</h3>
                <div className="availability-list">
                  {profile.availability.filter((a) => a.is_available).map((a) => (
                    <span key={a.id} className="tag-pill">
                      {a.day_name || DAY_NAMES[a.day_of_week]}: {a.start_time?.slice(0, 5)}–{a.end_time?.slice(0, 5)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="card" style={{ marginTop: 20 }}>
              <h3>Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <EmptyState title="No reviews yet" message="Be the first student to review this tutor after a session." />
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="review-item">
                    <StarRating value={r.rating} size={13} />
                    <p>{r.comment}</p>
                    <span className="text-sm text-muted">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside>
            <div className="card teacher-sidebar-card">
              <div className="rate-display">
                <strong>Rs. {profile.hourly_rate}</strong>
                <span>/hour</span>
              </div>
              <dl className="stat-list">
                <div><dt>Experience</dt><dd>{profile.years_of_experience} yrs · {profile.experience_level}</dd></div>
                <div><dt>Teaching mode</dt><dd>{profile.teaching_mode?.replace(/_/g, ' ')}</dd></div>
                <div><dt>Students taught</dt><dd>{profile.total_students ?? 0}</dd></div>
                <div><dt>Completion rate</dt><dd>{profile.completion_rate ?? '—'}%</dd></div>
                <div><dt>Response time</dt><dd>{profile.response_time || '—'}</dd></div>
              </dl>
              {(profile.website || profile.linkedin || profile.youtube) && (
                <div className="social-links">
                  {profile.website && <a href={profile.website} target="_blank" rel="noreferrer">Website</a>}
                  {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                  {profile.youtube && <a href={profile.youtube} target="_blank" rel="noreferrer">YouTube</a>}
                </div>
              )}
              {!isSelf && (
                <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={handleBookClick}>
                  Book a session
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          teacherProfile={profile}
          onClose={() => setBookingOpen(false)}
          onSuccess={() => {
            setBookingOpen(false);
            showToast('Booking request sent!', 'success');
            navigate('/bookings');
          }}
        />
      )}
    </div>
  );
}
