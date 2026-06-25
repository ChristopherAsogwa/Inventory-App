import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useEffect, useMemo } from 'react';
import { useSupplierStore } from '../../src/store/useSupplierStore';
import { useProductStore } from '../../src/store/useProductStore';
import { getSupplierRecommendations } from '../../src/utils/supplier';
import { formatCurrency } from '../../src/utils/currency';
import { colors } from '@/constants/theme';

const SafeAreaView = styled(RNSafeAreaView);

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View className="flex-row items-start justify-between py-3 border-b border-border">
      <Text className="text-sm font-sans-semibold text-muted-foreground w-24">{label}</Text>
      <Text className="flex-1 text-sm font-sans-medium text-dark text-right" numberOfLines={2}>{value}</Text>
    </View>
  );
}

function RatingRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-border">
      <Text className="text-sm font-sans-semibold text-dark">{label}</Text>
      <View className="rounded-full bg-success/10 px-3 py-1">
        <Text className="text-sm font-sans-bold text-success">{value}</Text>
      </View>
    </View>
  );
}

export default function SupplierDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const { suppliers, load: loadSuppliers, isLoading } = useSupplierStore();
  const { products, load: loadProducts } = useProductStore();

  useEffect(() => {
    if (userId) {
      loadSuppliers(userId);
      loadProducts(userId);
    }
  }, [userId]);

  const supplier = suppliers.find((s) => s.id === id);

  const suppliedProducts = useMemo(
    () => products.filter((p) => p.supplierId === id),
    [products, id],
  );

  const recommendations = useMemo(() => {
    const recs: ReturnType<typeof getSupplierRecommendations> = [];
    for (const product of suppliedProducts) {
      const r = getSupplierRecommendations(product, products, suppliers);
      recs.push(...r);
    }
    // Deduplicate by supplierId + referencedProductName
    const seen = new Set<string>();
    return recs.filter((r) => {
      const key = `${r.supplierId}:${r.referencedProductName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  }, [suppliedProducts, products, suppliers]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!supplier) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <Text className="text-base font-sans-medium text-muted-foreground">Supplier not found.</Text>
        <Pressable className="mt-4" onPress={() => router.back()}>
          <Text className="text-sm font-sans-bold text-primary">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const avatarLetter = supplier.fullName.trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5 pb-4 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 size-9 items-center justify-center rounded-full bg-muted"
        >
          <Text className="text-base font-sans-bold text-dark">‹</Text>
        </Pressable>
        <Text className="flex-1 text-xl font-sans-bold text-dark" numberOfLines={1}>
          {supplier.fullName}
        </Text>
        <Pressable
          onPress={() => router.push({ pathname: '/suppliers/edit', params: { id: supplier.id } })}
          className="ml-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2"
        >
          <Text className="text-sm font-sans-bold text-primary">Edit</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Avatar + name hero */}
        <View className="items-center gap-3 py-4">
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'sans-bold' }}>
              {avatarLetter}
            </Text>
          </View>
          <Text className="text-2xl font-sans-extrabold text-dark">{supplier.fullName}</Text>
        </View>

        {/* Contact info */}
        <View className="rounded-2xl border border-border bg-card px-4">
          <InfoRow label="Email" value={supplier.email} />
          <InfoRow label="Phone" value={supplier.phone} />
          <InfoRow label="Address" value={supplier.address} />
          {!supplier.email && !supplier.phone && !supplier.address && (
            <Text className="py-4 text-sm font-sans-medium text-muted-foreground text-center">
              No contact details on record.
            </Text>
          )}
        </View>

        {/* Contact buttons */}
        {(supplier.email || supplier.phone) && (
          <View className="flex-row gap-3">
            {supplier.email && (
              <Pressable
                className="flex-1 items-center rounded-2xl bg-primary py-3"
                onPress={() => Linking.openURL(`mailto:${supplier.email}`)}
              >
                <Text className="text-sm font-sans-bold text-white">Email</Text>
              </Pressable>
            )}
            {supplier.phone && (
              <Pressable
                className="flex-1 items-center rounded-2xl border border-primary bg-primary/10 py-3"
                onPress={() => Linking.openURL(`tel:${supplier.phone}`)}
              >
                <Text className="text-sm font-sans-bold text-primary">Call</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Ratings */}
        <View>
          <Text className="text-base font-sans-bold text-dark mb-3">Supplier Ratings</Text>
          <View className="rounded-2xl border border-border bg-card px-4">
            <RatingRow label="Available" value="100%" />
            <RatingRow label="Reliable" value="100%" />
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-sm font-sans-semibold text-dark">Delivery</Text>
              <Text className="text-base">⭐⭐⭐⭐⭐</Text>
            </View>
          </View>
        </View>

        {/* Products supplied */}
        <View>
          <Text className="text-base font-sans-bold text-dark mb-3">
            Products Supplied ({suppliedProducts.length})
          </Text>
          {suppliedProducts.length === 0 ? (
            <View className="rounded-2xl border border-border bg-card px-4 py-5 items-center">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                No products linked to this supplier yet.
              </Text>
            </View>
          ) : (
            <View className="rounded-2xl border border-border bg-card px-4">
              {suppliedProducts.map((product, idx) => (
                <View
                  key={product.id}
                  className={`flex-row items-center justify-between py-3 ${idx < suppliedProducts.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-sans-bold text-dark" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-xs font-sans-medium text-muted-foreground">
                      {product.sku} · {product.quantity} in stock
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-sans-bold text-dark">
                      {formatCurrency(product.sellingPrice)}
                    </Text>
                    <Text className="text-xs font-sans-medium text-muted-foreground">
                      cost {formatCurrency(product.costPrice)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Cheaper alternatives */}
        {recommendations.length > 0 && (
          <View>
            <Text className="text-base font-sans-bold text-success mb-1">
              💡 Cheaper Alternatives Found
            </Text>
            <Text className="text-xs font-sans-medium text-muted-foreground mb-3">
              Other suppliers offer the same products at a lower cost
            </Text>
            {recommendations.map((rec, idx) => (
              <View key={idx} className="rounded-2xl border border-success/30 bg-success/5 p-4 mb-3">
                <View className="flex-row items-start justify-between mb-1">
                  <Text className="text-sm font-sans-bold text-dark flex-1">{rec.supplierName}</Text>
                  <View className="rounded-full bg-success/15 px-2.5 py-1">
                    <Text className="text-xs font-sans-bold text-success">
                      Save {formatCurrency(rec.savingsPerUnit)}/unit
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-sans-medium text-muted-foreground mb-2">
                  For: {rec.referencedProductName} · {formatCurrency(rec.costPrice)} cost
                </Text>
                {rec.supplierContact ? (
                  <Pressable
                    className="items-center rounded-xl border border-success/40 bg-success/10 py-2"
                    onPress={() => {
                      const url = rec.supplierContact.includes('@')
                        ? `mailto:${rec.supplierContact}`
                        : `tel:${rec.supplierContact}`;
                      Linking.openURL(url);
                    }}
                  >
                    <Text className="text-sm font-sans-semibold text-success">Contact</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
