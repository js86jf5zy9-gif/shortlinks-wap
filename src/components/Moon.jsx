const CRATERS = [
  [38, 34, 9], [62, 58, 12], [30, 66, 6], [70, 30, 5], [50, 80, 7], [80, 70, 4], [22, 46, 4],
];

export default function Moon() {
  return (
    <svg viewBox="0 0 100 100" role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id="moon-surface" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f7f4ea" />
          <stop offset="55%" stopColor="#d6d2c6" />
          <stop offset="100%" stopColor="#8f8b82" />
        </radialGradient>
        <radialGradient id="moon-crater" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9d988d" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c9c4b8" stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id="moon-shade" cx="80%" cy="78%" r="75%">
          <stop offset="35%" stopColor="#05070f" stopOpacity="0" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#moon-surface)" />
      {CRATERS.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="url(#moon-crater)" />
      ))}
      <circle cx="50" cy="50" r="48" fill="url(#moon-shade)" />
    </svg>
  );
}
