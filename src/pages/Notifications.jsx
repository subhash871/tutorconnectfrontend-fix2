import { useEffect, useState } from 'react';
import { notificationsApi } from '../api/notifications';
import { unwrapList } from '../utils/unwrap';
import { extractErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    notificationsApi.list()
      .then((res) => setItems(unwrapList(res).results))
      .catch((err) => showToast(extractErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (n) => {
    if (n.is_read) return;
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
    try {
      await notificationsApi.markRead(n.id);
    } catch {
      // revert silently is fine; a refresh will reconcile
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  };

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">Stay in the loop</span>
            <h1>Notifications {unreadCount > 0 && <span className="badge badge-pending">{unreadCount} new</span>}</h1>
          </div>
          {unreadCount > 0 && <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all as read</button>}
        </div>

        {loading ? (
          <Loader label="Loading notifications…" />
        ) : items.length === 0 ? (
          <EmptyState title="You're all caught up" message="New booking, payment, and message alerts will appear here." />
        ) : (
          <div className="notification-list">
            {items.map((n) => (
              <button key={n.id} className={`notification-item ${n.is_read ? '' : 'unread'}`} onClick={() => markRead(n)}>
                <span className="notification-dot" />
                <div>
                  <strong>{n.title}</strong>
                  <p className="text-sm">{n.message}</p>
                  <span className="text-sm text-muted">{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
