import budgetData from '@/data/budget.json';

export type FilingStatus = 'single' | 'married_joint' | 'head_of_household';
export type Stance = 'less' | 'more';
export type Marks = Record<string, Stance>;

export interface Program {
  id: string;
  label: string;
  amountB: number;
  markable: boolean;
}

export interface Category {
  id: string;
  label: string;
  amountB: number;
  programs: Program[];
}

export interface Estimator {
  brackets: Record<FilingStatus, [number | null, number][]>;
  standardDeduction: Record<FilingStatus, number>;
}

export const budget = budgetData as unknown as {
  fiscalYear: number;
  dataStatus: string;
  asOf: string;
  totals: { outlaysB: number; receiptsB: number; deficitB: number };
  sources: { id: string; title: string; url: string }[];
  categories: Category[];
  taxEstimator: Estimator & { taxYear: number; averageIncomeTaxPerReturn: number; averagesYear: number };
};

export const categories: Category[] = [...budget.categories].sort((a, b) => b.amountB - a.amountB);

/** The amount shown before someone enters their own number. */
export const SAMPLE_TAX = Math.round(budget.taxEstimator.averageIncomeTaxPerReturn);

/** A payment's share of a line, in dollars. */
export function shareOf(tax: number, amountB: number, outlaysB = budget.totals.outlaysB): number {
  return (tax * amountB) / outlaysB;
}

/** Dollars of borrowing that accompany a payment, at the year's deficit-to-receipts ratio. */
export function borrowedAlongside(tax: number): number {
  return (tax * budget.totals.deficitB) / budget.totals.receiptsB;
}

/** Federal income tax on `income` after the standard deduction, before any credits. */
export function estimateTax(
  income: number,
  status: FilingStatus,
  estimator: Estimator = budget.taxEstimator,
): number {
  const taxable = Math.max(0, income - estimator.standardDeduction[status]);
  let tax = 0;
  let floor = 0;
  for (const [ceiling, rate] of estimator.brackets[status]) {
    const top = ceiling ?? Infinity;
    if (taxable <= floor) break;
    tax += (Math.min(taxable, top) - floor) * rate;
    floor = top;
  }
  return Math.round(tax);
}

/** The 2025 Social Security wage cap, from the SSA contribution and benefit base. */
const SOCIAL_SECURITY_WAGE_BASE = 176_100;

/** The employee share of Social Security and Medicare tax, treating all income as wages. */
export function estimatePayrollTax(income: number): number {
  return Math.round(Math.min(income, SOCIAL_SECURITY_WAGE_BASE) * 0.062 + income * 0.0145);
}

/** Parses free-form currency input such as "$12,500.50". Returns null when there is no number. */
export function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function formatMoney(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatWhole(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function formatBillions(amountB: number): string {
  if (amountB >= 1000) return `$${(amountB / 1000).toFixed(2)} trillion`;
  if (amountB >= 10) return `$${Math.round(amountB)} billion`;
  if (amountB >= 1) return `$${amountB.toFixed(1)} billion`;
  return `$${Math.round(amountB * 1000)} million`;
}

/** Work time at an hourly wage, as "3h 20m" or "45m". */
export function formatHours(dollars: number, wage: number): string {
  const minutes = Math.round((dollars / wage) * 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours.toLocaleString('en-US')}h ${rest}m` : `${hours.toLocaleString('en-US')}h`;
}

export function findLine(id: string): { label: string; amountB: number; category: string } | null {
  for (const category of categories) {
    const program = category.programs.find((p) => p.id === id && p.markable);
    if (program) return { label: program.label, amountB: program.amountB, category: category.label };
  }
  return null;
}

/** Encodes marks for a share link: "snap-,nih+". */
export function encodeMarks(marks: Marks): string {
  return Object.entries(marks)
    .map(([id, stance]) => `${id}${stance === 'less' ? '-' : '+'}`)
    .join(',');
}

export function decodeMarks(raw: string | null): Marks {
  const marks: Marks = {};
  for (const token of (raw ?? '').split(',')) {
    const id = token.slice(0, -1);
    const sign = token.slice(-1);
    if (findLine(id) && (sign === '-' || sign === '+')) marks[id] = sign === '-' ? 'less' : 'more';
  }
  return marks;
}
