/**
 * A hand-drawn loop around a program's amount, for programs marked "more".
 * The "less" strike is a CSS background (`.pen-strike`) so it follows text across wrapped lines.
 */
export function PenMark() {
  return (
    <svg aria-hidden="true" className="pen-mark pen-loop" viewBox="0 0 100 40" preserveAspectRatio="none">
      <path pathLength={1} d="M12 9 C 34 1, 80 1, 94 12 C 103 24, 76 38, 44 38 C 16 38, -3 28, 4 15 C 9 6, 30 3, 52 4" />
    </svg>
  );
}
