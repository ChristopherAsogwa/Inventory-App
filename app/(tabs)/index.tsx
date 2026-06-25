import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useStoreStore } from '../../src/store/useStoreStore';
import { useProductStore } from '../../src/store/useProductStore';
import { useSaleStore } from '../../src/store/useSaleStore';
import { computeDashboardStats } from '../../src/utils/stats';
import { formatCurrency, formatProfit } from '../../src/utils/currency';
import { components, colors } from '@/constants/theme';
import KpiCard from '../../src/components/KpiCard';
import SaleCard from '../../src/components/SaleCard';
import ProductCard from '../../src/components/ProductCard';
import RecordSaleModal from '../../src/components/RecordSaleModal';
import LowStockAlert from '../../src/components/LowStockAlert';
import QuickActionSheet from '../../src/components/QuickActionSheet';
import CreateProductModal from '../../src/components/CreateProductModal';

const SafeAreaView = styled(RNSafeAreaView);
const tabBar = components.tabBar;

export default function Dashboard() {
  const { userId } = useAuth();
  const { storeName } = useStoreStore();
  const { products, load: loadProducts, isLoading: productsLoading } = useProductStore();
  const { sales, load: loadSales, isLoading: salesLoading } = useSaleStore();
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showRecordSale, setShowRecordSale] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [alertProduct, setAlertProduct] = useState<Product | null>(null);

  const isLoading = productsLoading || salesLoading;

  const loadAll = useCallback(async () => {
    if (!userId) return;
    await Promise.all([loadProducts(userId), loadSales(userId)]);
  }, [userId, loadProducts, loadSales]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const stats = useMemo(() => computeDashboardStats(products, sales), [products, sales]);

  const bottomPad = Math.max(insets.bottom, tabBar.horizontalInset) + tabBar.height + 16;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Header ─────────────────────────────────── */}
        <View className="dash-header px-5 pt-5">
          <View>
            <Text className="dash-store-name">{storeName}</Text>
            <Text className="dash-date">
              {dayjs().format('dddd, D MMMM YYYY')}
            </Text>
            <Text className="screen-subtitle">Track your stock, sales and profits</Text>
          </View>
          <Pressable
            className="flex-row items-center gap-2 rounded-xl bg-primary px-4 py-3"
            onPress={() => setShowQuickActions(true)}
          >
            <Text className="text-xl font-sans-light text-white leading-none">+</Text>
            <Text className="text-sm font-sans-bold text-white">New</Text>
          </Pressable>
        </View>

        {isLoading && !refreshing ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* ── Hero summary card (Recurrly-style) ─── */}
            <View className="dash-hero-card mt-4">
              <Text className="dash-hero-label">Today&apos;s Revenue</Text>
              <View className="dash-hero-row">
                <Text className="dash-hero-amount">
                  {formatCurrency(stats.todayRevenue)}
                </Text>
                <View className="dash-hero-stat-block">
                  <Text className="dash-hero-stat-value">
                    {formatProfit(stats.todayProfit)}
                  </Text>
                  <Text className="dash-hero-stat-label">profit today</Text>
                </View>
              </View>
              <View className="flex-row gap-6 mt-1">
                <View>
                  <Text className="dash-hero-stat-value">{stats.todaySalesCount}</Text>
                  <Text className="dash-hero-stat-label">sales today</Text>
                </View>
                <View>
                  <Text className="dash-hero-stat-value">{stats.totalProducts}</Text>
                  <Text className="dash-hero-stat-label">products</Text>
                </View>
                <View>
                  <Text
                    className="dash-hero-stat-value"
                    style={stats.lowStockCount + stats.outOfStockCount > 0 ? { color: '#fbbf24' } : undefined}
                  >
                    {stats.lowStockCount + stats.outOfStockCount}
                  </Text>
                  <Text className="dash-hero-stat-label">low stock</Text>
                </View>
              </View>
            </View>

            {/* ── This Month ─────────────────────────── */}
            <View className="px-5 mt-2">
              <View className="list-head">
                <Text className="list-title">This Month</Text>
              </View>
              <View className="kpi-grid">
                <KpiCard
                  label="Revenue"
                  value={formatCurrency(stats.monthRevenue)}
                />
                <KpiCard
                  label="Profit"
                  value={formatProfit(stats.monthProfit)}
                  warning={stats.monthProfit < 0}
                />
              </View>
              <View className="kpi-grid">
                <KpiCard
                  label="Sales"
                  value={stats.monthSalesCount}
                />
                <KpiCard
                  label="Avg / Sale"
                  value={stats.monthSalesCount > 0
                    ? formatCurrency(stats.monthRevenue / stats.monthSalesCount)
                    : '—'}
                />
              </View>
            </View>

            {/* ── Stock Alerts ───────────────────────── */}
            {stats.lowStockProducts.length > 0 && (
              <View className="px-5 mt-2">
                <View className="list-head">
                  <Text className="list-title">Stock Alerts</Text>
                  <View className="list-action">
                    <Text className="list-action-text">{stats.lowStockProducts.length} items</Text>
                  </View>
                </View>
                {stats.lowStockProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onPress={() => setAlertProduct(p)}
                  />
                ))}
              </View>
            )}

            {/* ── Recent Sales ───────────────────────── */}
            <View className="px-5 mt-2">
              <View className="list-head">
                <Text className="list-title">Recent Sales</Text>
              </View>
              {stats.recentSales.length === 0 ? (
                <Text className="dash-empty">No sales recorded yet.</Text>
              ) : (
                stats.recentSales.map((s) => <SaleCard key={s.id} sale={s} />)
              )}
            </View>
          </>
        )}
      </ScrollView>

      <QuickActionSheet
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onMakeSale={() => {
          setShowQuickActions(false);
          setShowRecordSale(true);
        }}
        onAddProduct={() => {
          setShowQuickActions(false);
          setShowCreateProduct(true);
        }}
        onAddSupplier={() => {
          setShowQuickActions(false);
          router.push('/suppliers/add');
        }}
      />

      <RecordSaleModal
        visible={showRecordSale}
        onClose={() => setShowRecordSale(false)}
      />

      <CreateProductModal
        visible={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
      />

      {alertProduct && (
        <LowStockAlert
          visible={!!alertProduct}
          product={alertProduct}
          allProducts={products}
          onDismiss={() => setAlertProduct(null)}
        />
      )}
    </SafeAreaView>
  );
}
