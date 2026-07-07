import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { teachersApi } from '../api/teachers';
import { unwrapList } from '../utils/unwrap';
import TeacherCard from '../components/TeacherCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const ORDERING_OPTIONS = [
  { value: '-average_rating', label: 'Highest rated' },
  { value: 'hourly_rate', label: 'Price: low to high' },
  { value: '-hourly_rate', label: 'Price: high to low' },
  { value: '-years_of_experience', label: 'Most experienced' },
];

export default function FindTutors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-average_rating');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [teachingMode, setTeachingMode] = useState(searchParams.get('teaching_mode') || '');

  useEffect(() => {
    teachersApi.listSubjects({ page_size: 100 }).then((res) => setSubjects(unwrapList(res).results)).catch(() => {});
  }, []);

  const fetchTeachers = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { ordering, page };
    if (search) params.search = search;
    if (subject) params.subject = subject;
    if (teachingMode) params.teaching_mode = teachingMode;

    teachersApi.listProfiles(params)
      .then((res) => {
        const { results, pagination: p } = unwrapList(res);
        setTeachers(results);
        setPagination(p);
      })
      .catch(() => setError('Could not load tutors right now. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, subject, ordering, page, teachingMode]);

  useEffect(() => {
    fetchTeachers();
    const params = {};
    if (search) params.search = search;
    if (subject) params.subject = subject;
    if (ordering !== '-average_rating') params.ordering = ordering;
    if (teachingMode) params.teaching_mode = teachingMode;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTeachers]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header">
          <span className="eyebrow">Find Tutors</span>
          <h1>Browse verified tutors across Nepal</h1>
        </div>

        <form className="filters-bar" onSubmit={onSearchSubmit}>
          <input
            type="search"
            placeholder="Search by name, subject, headline…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={teachingMode} onChange={(e) => { setTeachingMode(e.target.value); setPage(1); }}>
            <option value="">Any teaching mode</option>
            <option value="online_tuition">Online</option>
            <option value="home_tuition">Home visit</option>
            <option value="both">Both</option>
          </select>
          <select value={ordering} onChange={(e) => { setOrdering(e.target.value); setPage(1); }}>
            {ORDERING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Loader label="Finding tutors…" />
        ) : teachers.length === 0 ? (
          <EmptyState title="No tutors match your filters" message="Try widening your search or clearing a filter." />
        ) : (
          <>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              {pagination?.total_items ?? teachers.length} tutor{(pagination?.total_items ?? teachers.length) === 1 ? '' : 's'} found
            </p>
            <div className="teacher-grid">
              {teachers.map((t) => <TeacherCard key={t.id} profile={t} />)}
            </div>
            {pagination && pagination.total_pages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={!pagination.has_previous} onClick={() => setPage((p) => p - 1)}>← Previous</button>
                <span className="text-sm text-muted">Page {pagination.current_page} of {pagination.total_pages}</span>
                <button className="btn btn-ghost btn-sm" disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
