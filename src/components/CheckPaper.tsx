/** Guilloche rosettes in the manner of Treasury check security paper. */
function Rosette({ cx, cy, r, count }: { cx: number; cy: number; r: number; count: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.36}
          transform={`rotate(${((i * 180) / count).toFixed(2)} ${cx} ${cy})`}
        />
      ))}
    </g>
  );
}

export function CheckPaper() {
  return (
    <svg
      aria-hidden="true"
      className="check-paper"
      viewBox="0 0 1440 1000"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
    >
      <Rosette cx={210} cy={700} r={380} count={72} />
      <Rosette cx={210} cy={700} r={240} count={48} />
      <Rosette cx={1330} cy={120} r={260} count={60} />
    </svg>
  );
}
