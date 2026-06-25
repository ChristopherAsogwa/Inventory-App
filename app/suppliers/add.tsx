import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useState } from 'react';
import clsx from 'clsx';
import { colors } from '@/constants/theme';
import { useSupplierStore, createSupplier } from '../../src/store/useSupplierStore';

const SafeAreaView = styled(RNSafeAreaView);

export default function AddSupplier() {
  const router = useRouter();
  const { userId } = useAuth();
  const { add } = useSupplierStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const nameValid = fullName.trim().length >= 2;
  const formValid = nameValid;

  const handleSave = async () => {
    if (!formValid || isSaving || !userId) return;
    setIsSaving(true);
    try {
      const supplier = await createSupplier({
        userId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      add(supplier);
      router.replace('/suppliers');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Could not save supplier', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-5 pb-4 border-b border-border">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 size-9 items-center justify-center rounded-full bg-muted"
          >
            <Text className="text-base font-sans-bold text-dark">‹</Text>
          </Pressable>
          <View>
            <Text className="text-2xl font-sans-extrabold text-dark">Add Supplier</Text>
            <Text className="screen-subtitle">Register a new product supplier</Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          {/* Full Name */}
          <View className="modal-field">
            <Text className="modal-label">Full Name *</Text>
            <TextInput
              className={clsx('modal-input', fullName.length > 0 && !nameValid && 'modal-input-error')}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. John Adeyemi"
              placeholderTextColor="rgba(15,23,42,0.35)"
            />
            {fullName.length > 0 && !nameValid && (
              <Text className="modal-error">At least 2 characters required</Text>
            )}
          </View>

          {/* Email */}
          <View className="modal-field">
            <Text className="modal-label">Email</Text>
            <TextInput
              className="modal-input"
              value={email}
              onChangeText={setEmail}
              placeholder="supplier@example.com"
              placeholderTextColor="rgba(15,23,42,0.35)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View className="modal-field">
            <Text className="modal-label">Phone</Text>
            <TextInput
              className="modal-input"
              value={phone}
              onChangeText={setPhone}
              placeholder="+234 800 000 0000"
              placeholderTextColor="rgba(15,23,42,0.35)"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View className="modal-field">
            <Text className="modal-label">Address</Text>
            <TextInput
              className="modal-input"
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 12 Lagos Street, Abuja"
              placeholderTextColor="rgba(15,23,42,0.35)"
              multiline
              numberOfLines={2}
            />
          </View>

          <Pressable
            className={clsx('modal-button mt-2 mb-6', (!formValid || isSaving) && 'modal-button-disabled')}
            onPress={handleSave}
            disabled={!formValid || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="modal-button-text">Save Supplier</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
