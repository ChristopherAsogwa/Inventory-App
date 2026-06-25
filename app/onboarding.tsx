import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useState } from 'react';
import { usePostHog } from 'posthog-react-native';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/constants/data';
import { colors } from '@/constants/theme';
import { useStoreStore } from '../src/store/useStoreStore';
import { createStore } from '../src/services/store';
import { isAppwriteConfigured } from '../src/config/appwrite';

const SafeAreaView = styled(RNSafeAreaView);

export default function Onboarding() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const { setStore } = useStoreStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [storeName, setStoreName] = useState('');
  const [threshold, setThreshold] = useState(String(DEFAULT_LOW_STOCK_THRESHOLD));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storeNameValid = storeName.trim().length >= 2;
  const thresholdValid = Number(threshold) > 0 && !isNaN(Number(threshold));

  const handleContinue = () => {
    if (!storeNameValid) return;
    setStep(2);
  };

  const handleGetStarted = async () => {
    if (!thresholdValid || isSubmitting || !userId) return;
    setIsSubmitting(true);

    try {
      const name = storeName.trim();
      const lowStockThreshold = Number(threshold);

      // Write to Appwrite — required when configured
      let storeId: string | undefined;
      if (isAppwriteConfigured) {
        const created = await createStore({ userId, name, lowStockThreshold });
        storeId = created.id;
      }

      // Persist locally via Zustand (writes to SecureStore + updates in-memory state)
      await setStore({ storeName: name, lowStockThreshold, storeId });

      posthog.capture('onboarding_completed', {
        store_name: name,
        low_stock_threshold: lowStockThreshold,
        synced_to_appwrite: !!storeId,
      });

      router.replace('/(tabs)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Onboarding error:', err);
      Alert.alert('Could not save store', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="onboard-safe">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="onboard-content">
            {/* Progress dots */}
            <View className="onboard-step-row">
              <View className={`onboard-step-dot ${step === 1 ? 'onboard-step-dot-active' : ''}`} />
              <View className={`onboard-step-dot ${step === 2 ? 'onboard-step-dot-active' : ''}`} />
            </View>

            {step === 1 ? (
              <>
                <Text className="onboard-title">Name your store</Text>
                <Text className="onboard-subtitle">
                  This is how your inventory dashboard will be labelled
                </Text>

                <Text className="onboard-label">Store Name</Text>
                <TextInput
                  className="onboard-input"
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="e.g. Corner Shop, Warehouse A"
                  placeholderTextColor="rgba(15, 23, 42, 0.35)"
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleContinue}
                />
                {storeName.length > 0 && !storeNameValid && (
                  <Text className="auth-error" style={{ marginTop: 6 }}>
                    Store name must be at least 2 characters
                  </Text>
                )}

                <Text className="onboard-helper">You can change this later in Settings</Text>
              </>
            ) : (
              <>
                <Text className="onboard-title">Set your low{'\n'}stock alert</Text>
                <Text className="onboard-subtitle">
                  We'll warn you when any product drops to or below this quantity
                </Text>

                <Text className="onboard-label">Alert Threshold (units)</Text>
                <TextInput
                  className="onboard-input"
                  value={threshold}
                  onChangeText={setThreshold}
                  placeholder="e.g. 10"
                  placeholderTextColor="rgba(15, 23, 42, 0.35)"
                  keyboardType="number-pad"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleGetStarted}
                />
                {threshold.length > 0 && !thresholdValid && (
                  <Text className="auth-error" style={{ marginTop: 6 }}>
                    Please enter a number greater than 0
                  </Text>
                )}

                <Text className="onboard-helper">
                  Each product can also have its own individual threshold
                </Text>
              </>
            )}

            {/* CTA button pinned to bottom */}
            <Pressable
              className={`onboard-button ${
                step === 1
                  ? !storeNameValid
                    ? 'onboard-button-disabled'
                    : ''
                  : !thresholdValid || isSubmitting
                    ? 'onboard-button-disabled'
                    : ''
              }`}
              onPress={step === 1 ? handleContinue : handleGetStarted}
              disabled={
                step === 1 ? !storeNameValid : !thresholdValid || isSubmitting
              }
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text className="onboard-button-text">
                  {step === 1 ? 'Continue' : 'Get Started'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
