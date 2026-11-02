import { describe, expect, it } from 'vitest';
import { BLURBS } from '@/data/blurbs';
import { REASONS } from '@/data/reasons';
import { buildLetter, buildPrompt, type LetterInput } from './letter';
import { GENERAL_CUT_GROUPS, generalCutGroups, matchOrgs } from './orgs';
import { budget, categories, decodeMarks, encodeMarks, estimatePayrollTax, estimateTax, formatHours, formatMoneyInput, parseMoney, parseSharedTax, shareOf, type Marks } from './tax';

const estimator: Pick<typeof budget.taxEstimator, 'brackets' | 'standardDeduction'> = {
  standardDeduction: { single: 10_000, married_joint: 20_000, head_of_household: 15_000 },
  brackets: {
    single: [[10_000, 0.1], [null, 0.2]],
    married_joint: [[20_000, 0.1], [null, 0.2]],
    head_of_household: [[15_000, 0.1], [null, 0.2]],
  } as Record<'single' | 'married_joint' | 'head_of_household', [number | null, number][]>,
};

const baseInput: LetterInput = {
  marks: {},
  tax: 10_000,
  fiscalYear: budget.fiscalYear,
  tone: 'direct',
  chamber: 'senator',
  recipient: 'Smith',
  name: 'Sam Taxpayer',
  place: 'Dayton, Ohio',
  story: '',
};

describe('budget data', () => {
  it('has category lines that add up to total outlays', () => {
    const total = categories.reduce((sum, category) => sum + category.amountB, 0);
    expect(total).toBeCloseTo(budget.totals.outlaysB, 0);
  });

  it('allocates the full payment across the lines', () => {
    const total = categories.reduce((sum, category) => sum + shareOf(10_000, category.amountB), 0);
    expect(total).toBeCloseTo(10_000, 0);
  });

  it('has a blurb for every line except residuals', () => {
    const missing = categories
      .flatMap((category) => category.programs)
      .filter((line) => !line.id.startsWith('other_') && !BLURBS[line.id]);
    expect(missing.map((line) => line.id)).toEqual([]);
  });

  it('has a reason in each direction for every named program', () => {
    const missing = categories
      .flatMap((category) => category.programs)
      .filter((line) => line.markable && !REASONS[line.id]);
    expect(missing.map((line) => line.id)).toEqual([]);
  });
});

describe('estimateTax', () => {
  it('owes nothing at or below the standard deduction', () => {
    expect(estimateTax(10_000, 'single', estimator)).toBe(0);
  });

  it('applies brackets progressively', () => {
    expect(estimateTax(30_000, 'single', estimator)).toBe(3_000);
  });

  it('uses the filing status', () => {
    expect(estimateTax(30_000, 'married_joint', estimator)).toBe(1_000);
  });
});

describe('estimatePayrollTax', () => {
  it('applies the employee share under the wage base', () => {
    expect(estimatePayrollTax(50_000, 'single')).toBe(3_825);
  });

  it('stops Social Security at the wage base but not Medicare', () => {
    expect(estimatePayrollTax(200_000, 'single')).toBe(Math.round(176_100 * 0.062 + 200_000 * 0.0145));
  });

  it('adds Additional Medicare Tax above the threshold for the filing status', () => {
    expect(estimatePayrollTax(300_000, 'single')).toBe(16_168);
    expect(estimatePayrollTax(300_000, 'married_joint')).toBe(15_718);
  });
});

describe('formatting and parsing', () => {
  it('parses money strings', () => {
    expect(parseMoney('$12,500.50')).toBe(12_500.5);
    expect(parseMoney('abc')).toBeNull();
  });

  it('keeps decimals while typing, one keystroke at a time', () => {
    let field = '';
    for (const key of '1234.50') field = formatMoneyInput(field + key);
    expect(field).toBe('1,234.50');
    expect(parseMoney(field)).toBe(1234.5);
    expect(formatMoneyInput('12.345')).toBe('12.34');
    expect(formatMoneyInput('')).toBe('');
  });

  it('only accepts plausible amounts from a share link', () => {
    expect(parseSharedTax('18500')).toBe(18_500);
    expect(parseSharedTax('18500.25')).toBe(18_500.25);
    expect(parseSharedTax('1e+21')).toBeNull();
    expect(parseSharedTax('-5')).toBeNull();
    expect(parseSharedTax(null)).toBeNull();
  });

  it('formats work time', () => {
    expect(formatHours(15, 30)).toBe('30m');
    expect(formatHours(100, 30)).toBe('3h 20m');
  });

  it('round-trips marks and ignores unknown ids', () => {
    const marks: Marks = { snap: 'less', nih: 'more' };
    expect(decodeMarks(encodeMarks(marks))).toEqual(marks);
    expect(decodeMarks('not_real-,nih+')).toEqual({ nih: 'more' });
    expect(decodeMarks(null)).toEqual({});
  });
});

describe('buildLetter', () => {
  const { body, subject } = buildLetter({ ...baseInput, marks: { snap: 'less', nih: 'more' }, story: 'My kid has asthma.' });

  it('addresses the chosen member and signs the letter', () => {
    expect(body.startsWith('Dear Senator Smith,')).toBe(true);
    expect(body).toContain('Sam Taxpayer\nDayton, Ohio');
  });

  it('argues each line in the direction marked, using its figures', () => {
    expect(body).toContain(REASONS.snap.less);
    expect(body).toContain(REASONS.nih.more);
    expect(body).not.toContain(REASONS.snap.more);
    expect(subject).toContain('less on SNAP');
    expect(subject).toContain('more on NIH');
  });

  it('includes the personal story', () => {
    expect(body).toContain('My kid has asthma.');
  });

  it('does not imply an opposite request when every mark points one way', () => {
    const allLess = buildLetter({ ...baseInput, marks: { snap: 'less', nih: 'less' } }).subject;
    expect(allLess).toBe('Constituent request: spend less on SNAP and others');
  });

  it('never argues more than five lines, and still mentions the rest', () => {
    const ids = categories.flatMap((category) => category.programs).filter((program) => program.markable).slice(0, 9).map((program) => program.id);
    const marks = Object.fromEntries(ids.map((id) => [id, 'more'])) as Marks;
    const letter = buildLetter({ ...baseInput, marks }).body;
    expect(letter.match(/about \$/g)?.length).toBe(5);
    expect(letter).toContain('The same goes for');
  });
});

describe('buildPrompt', () => {
  const ids = categories.flatMap((category) => category.programs).filter((program) => program.markable).map((program) => program.id);
  const every = Object.fromEntries(ids.map((id, i) => [id, i % 2 ? 'less' : 'more'])) as Marks;

  it('keeps every position and share when there is room', () => {
    const prompt = buildPrompt({ ...baseInput, marks: { snap: 'less', nih: 'more' }, story: 'My kid has asthma.' }, 4000);
    expect(prompt).toContain('LESS spent on: SNAP');
    expect(prompt).toContain('MORE spent on: NIH');
    expect(prompt).toContain('my share');
    expect(prompt).toContain('My kid has asthma.');
  });

  it.each([1900, 1400, 1000])('fits within %i encoded characters with every line marked', (cap) => {
    const prompt = buildPrompt({ ...baseInput, marks: every, story: 'x'.repeat(500) }, cap);
    expect(encodeURIComponent(prompt).length).toBeLessThanOrEqual(cap);
    expect(prompt).toContain('Rules:');
    expect(prompt).toContain('Output only');
  });
});

describe('buildPrompt under pressure', () => {
  const ids = categories.flatMap((category) => category.programs).filter((program) => program.markable).map((program) => program.id);

  it.each(['name', 'place', 'recipient'] as const)('stays within the cap with a very long %s', (field) => {
    const prompt = buildPrompt({ ...baseInput, marks: { snap: 'less' }, [field]: 'x'.repeat(2000) }, 1900);
    expect(encodeURIComponent(prompt).length).toBeLessThanOrEqual(1900);
    expect(prompt).toContain('LESS spent on: SNAP');
  });

  it('keeps both directions when one side is badly outnumbered', () => {
    const marks = Object.fromEntries(ids.map((id) => [id, 'less'])) as Marks;
    marks.nih = 'more';
    const prompt = buildPrompt({ ...baseInput, marks }, 1900);
    expect(encodeURIComponent(prompt).length).toBeLessThanOrEqual(1900);
    expect(prompt).toContain('MORE spent on: NIH');
    expect(prompt).toContain('LESS spent on:');
  });

  it('says how many it dropped, by direction', () => {
    const marks = Object.fromEntries(ids.map((id, i) => [id, i % 2 ? 'less' : 'more'])) as Marks;
    const prompt = buildPrompt({ ...baseInput, marks }, 900);
    expect(prompt).toMatch(/more I want cut/);
    expect(prompt).toMatch(/more I want increased/);
  });
});

describe('matchOrgs', () => {
  const marks: Marks = { snap: 'more', weapons_procurement: 'less' };

  it('only returns groups that work on a marked line', () => {
    const matches = matchOrgs(marks);
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(match.matched.every(({ id }) => id in marks)).toBe(true);
    }
  });

  it('covers each marked line before doubling up', () => {
    const covered = new Set(matchOrgs(marks, { limit: 2 }).flatMap((m) => m.matched.map(({ id }) => id)));
    expect(covered.has('snap')).toBe(true);
    expect(covered.has('weapons_procurement')).toBe(true);
  });

  it('never presents a group that wants the opposite as agreeing', () => {
    for (const match of matchOrgs(marks, { limit: 50 })) {
      for (const { id, direction } of match.matched) {
        expect(direction === marks[id] || direction === 'reform').toBe(true);
      }
    }
  });

  it('offers general spending-cut groups only for "less" lines with no direct match', () => {
    const uncovered = categories
      .flatMap((category) => category.programs)
      .filter((program) => program.markable && matchOrgs({ [program.id]: 'less' }, { limit: 50 }).every((m) => m.matched.every(({ direction }) => direction !== 'less')));
    if (uncovered.length) expect(generalCutGroups({ [uncovered[0].id]: 'less' }).lines).toEqual([uncovered[0].id]);
    expect(generalCutGroups({ nih: 'more' }).lines).toEqual([]);
    expect(generalCutGroups({ nih: 'more' }).orgs).toEqual([]);
  });

  it('names general spending-cut groups that exist in the list', () => {
    expect(generalCutGroups({ __none__: 'less' }).orgs.length).toBe(GENERAL_CUT_GROUPS.length);
  });

  it('shows only opposing groups when asked', () => {
    for (const match of matchOrgs(marks, { limit: 50, opposing: true })) {
      for (const { id, direction } of match.matched) {
        expect(direction).not.toBe(marks[id]);
        expect(direction).not.toBe('reform');
      }
    }
  });
});
