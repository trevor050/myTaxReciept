import orgsData from '@/data/orgs.json';
import type { Marks, Stance } from './tax';

export type Direction = Stance | 'reform';

export interface Org {
  name: string;
  url: string;
  actionUrl?: string | null;
  description: string;
  kind?: string;
  prominence?: string;
  stances: { id: string; direction: Direction; evidenceUrl?: string }[];
}

const orgs = orgsData as unknown as Org[];

const opposite: Record<Stance, Stance> = { less: 'more', more: 'less' };

export interface OrgMatch {
  org: Org;
  /** Marked lines this group works on, and what it wants on each. */
  matched: { id: string; direction: Direction; evidenceUrl?: string }[];
}

interface Candidate extends OrgMatch {
  /** Lines where the group agrees outright, as opposed to wanting reform. */
  agrees: Set<string>;
  base: number;
}

function candidates(marks: Marks, wantOpposing: boolean): Candidate[] {
  const results: Candidate[] = [];
  for (const org of orgs) {
    const matched: OrgMatch['matched'] = [];
    const agrees = new Set<string>();
    let base = 0;
    for (const stance of org.stances) {
      const mark = marks[stance.id];
      if (!mark) continue;
      const wanted = wantOpposing ? opposite[mark] : mark;
      if (stance.direction === wanted) {
        matched.push(stance);
        agrees.add(stance.id);
        base += 3;
      } else if (stance.direction === 'reform' && !wantOpposing) {
        matched.push(stance);
        base += 1;
      }
    }
    if (!matched.length) continue;
    if (org.prominence === 'high') base += 0.75;
    if (org.prominence === 'medium') base += 0.25;
    if (org.actionUrl) base += 0.5;
    results.push({ org, matched, agrees, base });
  }
  return results;
}

/**
 * Picks groups so every marked line is represented before any line gets a second group,
 * rather than letting one crowded topic fill the list. Each round takes whichever group
 * adds the most lines not yet covered; prominence only separates near-equals.
 */
export function matchOrgs(marks: Marks, { limit = 8, opposing = false }: { limit?: number; opposing?: boolean } = {}): OrgMatch[] {
  const pool = candidates(marks, opposing);
  const covered = new Set<string>();
  const picked: OrgMatch[] = [];

  while (picked.length < limit && pool.length) {
    let best = 0;
    let bestScore = -Infinity;
    pool.forEach((candidate, index) => {
      const fresh = [...candidate.agrees].filter((id) => !covered.has(id)).length;
      const score = fresh * 10 + candidate.base;
      if (score > bestScore || (score === bestScore && candidate.org.name < pool[best].org.name)) {
        best = index;
        bestScore = score;
      }
    });
    const [choice] = pool.splice(best, 1);
    choice.agrees.forEach((id) => covered.add(id));
    picked.push({ org: choice.org, matched: choice.matched });
  }
  return picked;
}
