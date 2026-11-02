import type { Stance } from '@/lib/tax';

/** A hand-drawn strike through a line (less) or a loop around its amount (more). */
export function PenMark({ stance }: { stance: Stance }) {
  if (stance === 'less') {
    return (
      <svg aria-hidden="true" className="pen-mark pen-strike" viewBox="0 0 100 10" preserveAspectRatio="none">
        <path pathLength={1} d="M1 6 C 18 3, 30 8, 48 5 S 80 3, 99 5" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="pen-mark pen-loop" viewBox="0 0 100 40" preserveAspectRatio="none">
      <path pathLength={1} d="M12 9 C 34 1, 80 1, 94 12 C 103 24, 76 38, 44 38 C 16 38, -3 28, 4 15 C 9 6, 30 3, 52 4" />
    </svg>
  );
}
