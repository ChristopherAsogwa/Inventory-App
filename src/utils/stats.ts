import dayjs from 'dayjs';

// ── Helpers ──────────────────────────────────────────────────────────────────

function salesInRange(sales: Sale[], from: dayjs.Dayjs, to: dayjs.Dayjs): Sale[] {
  return sales.filter((s) => {
    const d = dayjs(s.createdAt);
    return (d.isAfter(from) || d.isSame(from)) && (d.isBefore(to) || d.isSame(to));
  });
}

function revenue(sales: Sale[]): number {
  return sales.reduce((sum, s) => sum + s.totalPrice, 0);
}

function profit(sales: Sale[]): number {
  return sales.reduce((sum, s) => sum + (s.totalPrice - s.costPrice * s.quantity), 0);
}

// ── Period filter ────────────────────────────────────────────────────────────

export type Period = 'today' | 'week' | 'month' | 'all';

export interface PeriodSummary {
  revenue: number;
  profit: number;
  salesCount: number;
}

export function salesForPeriod(sales: Sale[], period: Period): Sale[] {
  if (period === 'all') return sales;
  const now = dayjs();
  const from =
    period === 'today' ? now.startOf('day') :
    period === 'week'  ? now.startOf('week') :
                         now.startOf('month');
  const to =
    period === 'today' ? now.endOf('day') :
    period === 'week'  ? now.endOf('week') :
                         now.endOf('month');
  return salesInRange(sales, from, to);
}

export function computePeriodSummary(sales: Sale[], period: Period): PeriodSummary {
  const filtered = salesForPeriod(sales, period);
  return {
    revenue: revenue(filtered),
    profit: profit(filtered),
    salesCount: filtered.length,
  };
}

// ── Exported stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;

  todayRevenue: number;
  todayProfit: number;
  todaySalesCount: number;

  monthRevenue: number;
  monthProfit: number;
  monthSalesCount: number;

  recentSales: Sale[];
  lowStockProducts: Product[];
}

export function computeDashboardStats(
  products: Product[],
  sales: Sale[],
): DashboardStats {
  const now = dayjs();
  const startOfToday = now.startOf('day');
  const endOfToday = now.endOf('day');
  const startOfMonth = now.startOf('month');
  const endOfMonth = now.endOf('month');

  const todaySales = salesInRange(sales, startOfToday, endOfToday);
  const monthSales = salesInRange(sales, startOfMonth, endOfMonth);

  const lowStockProducts = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold,
  );
  const outOfStockProducts = products.filter((p) => p.quantity === 0);

  return {
    totalProducts: products.length,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,

    todayRevenue: revenue(todaySales),
    todayProfit: profit(todaySales),
    todaySalesCount: todaySales.length,

    monthRevenue: revenue(monthSales),
    monthProfit: profit(monthSales),
    monthSalesCount: monthSales.length,

    recentSales: sales.slice(0, 5),
    lowStockProducts: [...outOfStockProducts, ...lowStockProducts].slice(0, 5),
  };
}
