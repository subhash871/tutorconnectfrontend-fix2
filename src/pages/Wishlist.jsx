import { useEffect, useState } from 'react';
import { wishlistApi } from '../api/wishlist';
import { unwrapList } from '../utils/unwrap';
import { extractErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import TeacherCard from '../components/TeacherCard';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    wishlistApi.list()
      .then((res) => setItems(unwrapList(res).results))
      .catch((err) => showToast(extractErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    try {
      await wishlistApi.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast('Removed from wishlist', 'info');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  const clearAll = async () => {
    try {
      await wishlistApi.clear();
      setItems([]);
      showToast('Wishlist cleared', 'info');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">Saved tutors</span>
            <h1>Your wishlist</h1>
          </div>
          {items.length > 0 && <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear all</button>}
        </div>

        {loading ? (
          <Loader label="Loading wishlist…" />
        ) : items.length === 0 ? (
          <EmptyState title="Your wishlist is empty" message="Save tutors you like to compare them later." action={<Link to="/find-tutors" className="btn btn-primary">Find tutors</Link>} />
        ) : (
          <div className="teacher-grid">
            {items.map((item) => (
              <div key={item.id} className="wishlist-item">
                <TeacherCard profile={item.teacher_detail} />
                <button className="btn btn-danger btn-sm btn-block" onClick={() => remove(item.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
