import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import { useStoreStore } from '../../src/store/useStoreStore';
import { useProductStore } from '../../src/store/useProductStore';
import { useSaleStore } from '../../src/store/useSaleStore';
import EditStoreModal from '../../src/components/EditStoreModal';
import { components } from '@/constants/theme';

const SafeAreaView = styled(RNSafeAreaView);
const APP_VERSION = '2.0.0';

export default function Settings() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const tabBar = components.tabBar;

  const { storeName, lowStockThreshold, clear: clearStore } = useStoreStore();
  const { clear: clearProducts } = useProductStore();
  const { clear: clearSales } = useSaleStore();

  const [showEditStore, setShowEditStore] = useState(false);

  const bottomPad = Math.max(insets.bottom, tabBar.horizontalInset) + tabBar.height + 16;

  const handleSignOut = async () => {
    await clearStore();
    clearProducts();
    clearSales();
    posthog.capture('user_signed_out');
    posthog.reset();
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: bottomPad }}
      >
        <Text className="text-3xl font-sans-extrabold text-dark">Settings</Text>
        <Text className="screen-subtitle mb-6">Configure your store and account</Text>

        {/* ── Store ──────────────────────────────────── */}
        <Text className="settings-section-title">Store</Text>
        <View className="settings-card mb-6">
          <Pressable className="settings-edit-row" onPress={() => setShowEditStore(true)}>
            <View style={{ flex: 1 }}>
              <Text className="settings-row-label">Store Name</Text>
              <Text className="settings-row-value" numberOfLines={1}>{storeName}</Text>
            </View>
            <Text className="settings-edit-icon">Edit</Text>
          </Pressable>

          <Pressable className="settings-edit-row-last" onPress={() => setShowEditStore(true)}>
            <View style={{ flex: 1 }}>
              <Text className="settings-row-label">Default Low Stock Threshold</Text>
              <Text className="settings-row-value">{lowStockThreshold} units</Text>
            </View>
            <Text className="settings-edit-icon">Edit</Text>
          </Pressable>
        </View>

        {/* ── Account ────────────────────────────────── */}
        <Text className="settings-section-title">Account</Text>
        <View className="settings-card mb-6">
          <View className="settings-row-last">
            <Text className="settings-row-label">Email</Text>
            <Text className="settings-row-value" numberOfLines={1} style={{ maxWidth: '60%' }}>
              {user?.emailAddresses[0]?.emailAddress ?? '—'}
            </Text>
          </View>
        </View>

        {/* ── About ──────────────────────────────────── */}
        <Text className="settings-section-title">About</Text>
        <View className="settings-card mb-6">
          <View className="settings-row-last">
            <Text className="settings-row-label">Version</Text>
            <Text className="settings-row-value">{APP_VERSION}</Text>
          </View>
        </View>

        {/* ── Sign Out ───────────────────────────────── */}
        <Pressable className="settings-sign-out" onPress={handleSignOut}>
          <Text className="settings-sign-out-text">Sign Out</Text>
        </Pressable>
      </ScrollView>

      <EditStoreModal
        visible={showEditStore}
        onClose={() => setShowEditStore(false)}
      />
    </SafeAreaView>
  );
}
