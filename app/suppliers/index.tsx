import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';
import { useSupplierStore } from '../../src/store/useSupplierStore';
import { colors } from '@/constants/theme';
import EmptyState from '../../src/components/EmptyState';

const SafeAreaView = styled(RNSafeAreaView);

function SupplierAvatar({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'sans-bold' }}>
        {letter}
      </Text>
    </View>
  );
}

export default function SuppliersList() {
  const router = useRouter();
  const { userId } = useAuth();
  const { suppliers, load, isLoading } = useSupplierStore();

  useEffect(() => {
    if (userId) load(userId);
  }, [userId]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-5 pb-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3 size-9 items-center justify-center rounded-full bg-muted">
          <Text className="text-base font-sans-bold text-dark">‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-sans-extrabold text-dark">Suppliers</Text>
          <Text className="screen-subtitle">Manage your product suppliers</Text>
        </View>
        <Pressable
          className="rounded-2xl bg-primary px-4 py-2.5"
          onPress={() => router.push('/suppliers/add')}
        >
          <Text className="text-sm font-sans-bold text-white">+ Add</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : suppliers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <EmptyState
            title="No suppliers yet"
            subtitle="Add your first supplier to start tracking who supplies your products."
          />
          <Pressable
            className="mt-6 rounded-2xl bg-primary px-8 py-4"
            onPress={() => router.push('/suppliers/add')}
          >
            <Text className="text-base font-sans-bold text-white">Add Supplier</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 12 }}>
          {suppliers.map((supplier) => (
            <Pressable
              key={supplier.id}
              className="flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 gap-3"
              onPress={() => router.push(`/suppliers/${supplier.id}`)}
            >
              <SupplierAvatar name={supplier.fullName} />
              <Text
                className="flex-1 text-base font-sans-bold text-dark"
                numberOfLines={1}
              >
                {supplier.fullName}
              </Text>
              <Pressable
                className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5"
                onPress={() => router.push(`/suppliers/${supplier.id}`)}
              >
                <Text className="text-sm font-sans-semibold text-primary">View</Text>
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
