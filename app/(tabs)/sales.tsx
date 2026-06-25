import {
  View,
  Text,
  SectionList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useSaleStore } from '../../src/store/useSaleStore';
import { useProductStore } from '../../src/store/useProductStore';
import { colors, components } from '@/constants/theme';
import SaleCard from '../../src/components/SaleCard';
import EmptyState from '../../src/components/EmptyState';
import RecordSaleModal from '../../src/components/RecordSaleModal';
import { formatCurrency, formatProfit } from '../../src/utils/currency';
import { type Period, salesForPeriod, computePeriodSummary } from '../../src/utils/stats';
import { exportSalesCsv } from '../../src/utils/export';
import clsx from 'clsx';

const SafeAreaView = styled(RNSafeAreaView);

const tabBar = components.tabBar;
const FAB_GAP = 16;

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

interface SaleSection {
  title: string;
  data: Sale[];
  revenue: number;
  profit: number;
}

function groupByDate(sales: Sale[]): SaleSection[] {
  const map = new Map<string, Sale[]>();
  for (const sale of sales) {
    const key = dayjs(sale.createdAt).format('YYYY-MM-DD');
    const existing = map.get(key) ?? [];
    existing.push(sale);
    map.set(key, existing);
  }

  return Array.from(map.entries()).map(([key, items]) => {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const title =
      key === today
        ? 'Today'
        : key === yesterday
          ? 'Yesterday'
          : dayjs(key).format('D MMMM YYYY');

    const revenue = items.reduce((sum, s) => sum + s.totalPrice, 0);
    const profit = items.reduce(
      (sum, s) => sum + (s.totalPrice - s.costPrice * s.quantity),
      0,
    );

    return { title, data: items, revenue, profit };
  });
}

export default function Sales() {
  const { userId } = useAuth();
  const { sales, isLoading, load } = useSaleStore();
  const { load: loadProducts, products } = useProductStore();
  const insets = useSafeAreaInsets();

  const [showRecord, setShowRecord] = useState(false);
  const [period, setPeriod] = useState<Period>('month');
  const [isExporting, setIsExporting] = useState(false);

  const fabBottom =
    Math.max(insets.bottom, tabBar.horizontalInset) + tabBar.height + FAB_GAP;

  useEffect(() => {
    if (userId) {
      load(userId);
      if (products.length === 0) loadProducts(userId);
    }
  }, [userId]);

  const filteredSales = useMemo(() => salesForPeriod(sales, period), [sales, period]);
  const summary = useMemo(() => computePeriodSummary(sales, period), [sales, period]);
  const sections = useMemo(() => groupByDate(filteredSales), [filteredSales]);

  const handleExport = useCallback(async () => {
    if (filteredSales.length === 0) {
      Alert.alert('Nothing to export', 'There are no sales in the selected period.');
      return;
    }
    setIsExporting(true);
    try {
      await exportSalesCsv(filteredSales);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Export failed', msg);
    } finally {
      setIsExporting(false);
    }
  }, [filteredSales]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-5 pb-3 flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-sans-extrabold text-dark">Sales</Text>
          <Text className="screen-subtitle">View and export your transaction history</Text>
        </View>
        <Pressable
          onPress={handleExport}
          disabled={isExporting}
          className="rounded-2xl border border-border bg-card px-4 py-2"
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text className="text-sm font-sans-semibold text-primary">Export CSV</Text>
          )}
        </Pressable>
      </View>

      {/* Period pills */}
      <View className="flex-row gap-2 px-5 pb-3">
        {PERIOD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            className={clsx(period === opt.value ? 'period-pill-active' : 'period-pill')}
            onPress={() => setPeriod(opt.value)}
          >
            <Text className={clsx(period === opt.value ? 'period-pill-text-active' : 'period-pill-text')}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary bar */}
      <View className="sales-summary-bar">
        <View className="sales-summary-item">
          <Text className="sales-summary-label">Revenue</Text>
          <Text className="sales-summary-value">{formatCurrency(summary.revenue)}</Text>
        </View>
        <View className="sales-summary-item">
          <Text className="sales-summary-label">Profit</Text>
          <Text className={clsx('sales-summary-value', summary.profit < 0 && 'text-destructive')}>
            {formatProfit(summary.profit)}
          </Text>
        </View>
        <View className="sales-summary-item">
          <Text className="sales-summary-label">Sales</Text>
          <Text className="sales-summary-value">{summary.salesCount}</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SaleCard sale={item} />}
          renderSectionHeader={({ section }) => (
            <View className="sale-section-header">
              <Text className="sale-section-title">{section.title}</Text>
              <View className="sale-section-summary">
                <Text className="sale-section-revenue">
                  {formatCurrency(section.revenue)}
                </Text>
                <Text
                  className={
                    section.profit >= 0 ? 'sale-profit-pos' : 'sale-profit-neg'
                  }
                >
                  {formatProfit(section.profit)} profit
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: fabBottom + tabBar.height,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState
              title="No sales yet"
              subtitle="Tap + to record your first sale"
            />
          }
        />
      )}

      {/* FAB */}
      <Pressable
        className="fab"
        style={{ bottom: fabBottom }}
        onPress={() => setShowRecord(true)}
      >
        <Text className="fab-text">+</Text>
      </Pressable>

      <RecordSaleModal
        visible={showRecord}
        onClose={() => setShowRecord(false)}
      />
    </SafeAreaView>
  );
}
