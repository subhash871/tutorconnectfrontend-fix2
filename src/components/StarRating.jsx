export default function StarRating({ value = 0, count, size = 15, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <span className="star-rating" style={{ fontSize: size }}>
      {stars.map((s) => (
        <span
          key={s}
          className={`star ${s <= Math.round(value) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onChange(s) : undefined}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `Rate ${s} star${s > 1 ? 's' : ''}` : undefined}
        >
          ★
        </span>
      ))}
      {typeof count === 'number' && <span className="star-count">({count})</span>}
      {typeof value === 'number' && !count && value > 0 && <span className="star-count">{value.toFixed(1)}</span>}
    </span>
  );
}
