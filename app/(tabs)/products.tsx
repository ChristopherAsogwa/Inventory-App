import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useAuth } from '@clerk/expo';
import { useEffect, useState, useMemo } from 'react';
import { useProductStore } from '../../src/store/useProductStore';
import { colors, components } from '@/constants/theme';
import ProductCard from '../../src/components/ProductCard';
import EmptyState from '../../src/components/EmptyState';
import LowStockAlert from '../../src/components/LowStockAlert';
import CreateProductModal from '../../src/components/CreateProductModal';
import EditProductModal from '../../src/components/EditProductModal';

const SafeAreaView = styled(RNSafeAreaView);

const tabBar = components.tabBar;
const FAB_GAP = 16;

export default function Products() {
  const { userId } = useAuth();
  const { products, isLoading, load } = useProductStore();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [alertProduct, setAlertProduct] = useState<Product | null>(null);

  const fabBottom =
    Math.max(insets.bottom, tabBar.horizontalInset) + tabBar.height + FAB_GAP;

  useEffect(() => {
    if (userId) load(userId);
  }, [userId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, search]);

  const checkLowStock = (product: Product) => {
    if (product.quantity <= product.lowStockThreshold) {
      setAlertProduct(product);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-5 pb-2">
        <Text className="text-3xl font-sans-extrabold text-dark">Products</Text>
        <Text className="screen-subtitle mb-4">Add and manage your inventory items</Text>
        <TextInput
          className="search-bar"
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, SKU or category…"
          placeholderTextColor="rgba(15,23,42,0.35)"
          clearButtonMode="while-editing"
        />
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => setSelectedProduct(item)} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: fabBottom + tabBar.height,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            search.trim() ? (
              <EmptyState
                title="No results"
                subtitle={`No products match "${search.trim()}"`}
              />
            ) : (
              <EmptyState
                title="No products yet"
                subtitle="Tap + to add your first product"
              />
            )
          }
        />
      )}

      {/* FAB */}
      <Pressable
        className="fab"
        style={{ bottom: fabBottom }}
        onPress={() => setShowCreate(true)}
      >
        <Text className="fab-text">+</Text>
      </Pressable>

      {/* Create modal */}
      <CreateProductModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={(product) => checkLowStock(product)}
      />

      {/* Edit modal */}
      {selectedProduct && (
        <EditProductModal
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={(product) => {
            setSelectedProduct(null);
            checkLowStock(product);
          }}
        />
      )}

      {/* Low stock alert */}
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
