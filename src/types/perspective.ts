
import type { CombinedCurrencyPerspective } from '@/lib/currency-perspective';
import type { CombinedPerspective } from '@/lib/time-perspective';

export interface PerspectiveData {
  currency: CombinedCurrencyPerspective[] | null;
  time: CombinedPerspective[] | null;
}

export interface DashboardPerspectives {
  chart: Record<string, PerspectiveData>;
  accordion: Record<string, PerspectiveData>;
  total: PerspectiveData | null;
}
