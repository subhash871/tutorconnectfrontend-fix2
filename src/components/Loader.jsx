export default function Loader({ full, label = 'Loading…' }) {
  return (
    <div className={full ? 'center-page' : ''} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: full ? 0 : '24px 0' }}>
      <span className="spinner" />
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
