import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { teachersApi } from '../api/teachers';
import { unwrapList } from '../utils/unwrap';
import TeacherCard from '../components/TeacherCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    teachersApi.listProfiles({ ordering: '-average_rating', page_size: 3 })
      .then((res) => setFeatured(unwrapList(res).results))
      .catch(() => setFeatured([]));
    teachersApi.listSubjects({ page_size: 8 })
      .then((res) => setSubjects(unwrapList(res).results))
      .catch(() => setSubjects([]));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Home &amp; online tuition, across Nepal</span>
            <h1>Find a tutor who teaches the way your child learns.</h1>
            <p className="hero-sub">
              TutorConnect Nepal matches students and guardians with verified, rated tutors —
              from SEE math in Baneshwor to spoken English over video call in Pokhara.
            </p>
            <div className="hero-actions">
              <Link to="/find-tutors" className="btn btn-primary">Find a tutor</Link>
              <Link to="/register" className="btn btn-outline">Become a tutor</Link>
            </div>
            <div className="hero-stats">
              <div><strong>1000+</strong><span>Verified tutors</span></div>
              <div><strong>77</strong><span>Districts reachable online</span></div>
              <div><strong>4.8★</strong><span>Average tutor rating</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-card hero-card-1">
              <span className="tag-pill">Mathematics</span>
              <strong>Rs. 700/hr</strong>
              <span className="text-sm text-muted">Kathmandu · Online + Home</span>
            </div>
            <div className="hero-card hero-card-2">
              <span className="tag-pill">Spoken English</span>
              <strong>★ 4.9</strong>
              <span className="text-sm text-muted">127 reviews</span>
            </div>
          </div>
        </div>
      </section>

      {subjects.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <span className="eyebrow">Popular subjects</span>
            <h2>Learn what matters to you</h2>
          </div>
          <div className="subject-grid">
            {subjects.map((s) => (
              <Link key={s.id} to={`/find-tutors?subject=${s.id}`} className="subject-chip">
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <span className="eyebrow">Top rated</span>
            <h2>Meet a few of our tutors</h2>
          </div>
          <div className="teacher-grid">
            {featured.map((t) => <TeacherCard key={t.id} profile={t} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/find-tutors" className="btn btn-secondary">Browse all tutors</Link>
          </div>
        </section>
      )}

      <section className="container section how-it-works">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps to your first class</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-num">01</span>
            <h3>Search &amp; compare</h3>
            <p>Filter by subject, budget, teaching mode, and rating to shortlist tutors near you.</p>
          </div>
          <div className="step-card">
            <span className="step-num">02</span>
            <h3>Book a session</h3>
            <p>Pick a date and time, share what you need help with, and send a booking request.</p>
          </div>
          <div className="step-card">
            <span className="step-num">03</span>
            <h3>Pay &amp; learn</h3>
            <p>Confirm with eSewa, Khalti, or card, then message your tutor and get started.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
