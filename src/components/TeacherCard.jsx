import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { resolveMedia } from '../utils/media';

export default function TeacherCard({ profile }) {
  const user = profile.user || {};
  const name = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || profile.title;
  const subjects = profile.subjects || [];

  return (
    <Link to={`/teachers/${profile.id}`} className="teacher-card">
      <div className="teacher-card-photo">
        {(profile.profile_image || user.profile_image) ? (
          <img src={resolveMedia(profile.profile_image || user.profile_image)} alt={name} />
        ) : (
          <span>{(name || 'T').charAt(0).toUpperCase()}</span>
        )}
        {profile.is_available && <span className="availability-dot" title="Available" />}
      </div>
      <div className="teacher-card-body">
        <h3>{name}</h3>
        <p className="teacher-card-headline">{profile.headline || profile.title}</p>
        <div className="teacher-card-meta">
          <StarRating value={Number(profile.average_rating) || 0} count={profile.total_reviews ?? profile.reviews_count} size={13} />
          <span className="text-muted text-sm">{profile.location}</span>
        </div>
        <div className="teacher-card-tags">
          {subjects.slice(0, 3).map((s) => (
            <span key={s.id || s} className="tag-pill">{s.name || s}</span>
          ))}
        </div>
      </div>
      <div className="teacher-card-rate">
        <strong>Rs. {profile.hourly_rate}</strong>
        <span className="text-muted text-sm">/hour</span>
      </div>
    </Link>
  );
}
