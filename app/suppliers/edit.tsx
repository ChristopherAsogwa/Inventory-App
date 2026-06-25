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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { colors } from '@/constants/theme';
import { useSupplierStore, updateSupplier, deleteSupplier } from '../../src/store/useSupplierStore';

const SafeAreaView = styled(RNSafeAreaView);

export default function EditSupplier() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const { suppliers, load, update, remove } = useSupplierStore();

  const supplier = suppliers.find((s) => s.id === id);

  const [fullName, setFullName] = useState(supplier?.fullName ?? '');
  const [email, setEmail] = useState(supplier?.email ?? '');
  const [phone, setPhone] = useState(supplier?.phone ?? '');
  const [address, setAddress] = useState(supplier?.address ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // If we arrived before the store was hydrated, load and re-seed fields
  useEffect(() => {
    if (!supplier && userId) {
      load(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (supplier) {
      setFullName(supplier.fullName);
      setEmail(supplier.email);
      setPhone(supplier.phone);
      setAddress(supplier.address);
    }
  }, [supplier?.id]);

  const nameValid = fullName.trim().length >= 2;
  const formValid = nameValid;

  const handleSave = async () => {
    if (!formValid || isSaving || !id) return;
    setIsSaving(true);
    try {
      const updated = await updateSupplier(id, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      update(updated);
      router.back();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Could not update supplier', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Supplier',
      `Remove "${supplier?.fullName ?? 'this supplier'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setIsDeleting(true);
            try {
              await deleteSupplier(id);
              remove(id);
              // Go back past the detail screen to the list
              router.dismissAll();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              Alert.alert('Could not delete supplier', msg);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (!supplier) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

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
          <View className="flex-1">
            <Text className="text-2xl font-sans-extrabold text-dark">Edit Supplier</Text>
            <Text className="screen-subtitle">Update supplier details</Text>
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

          {/* Save */}
          <Pressable
            className={clsx('modal-button mt-2', (!formValid || isSaving) && 'modal-button-disabled')}
            onPress={handleSave}
            disabled={!formValid || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="modal-button-text">Save Changes</Text>
            )}
          </Pressable>

          {/* Delete */}
          <Pressable
            className={clsx(
              'items-center rounded-2xl border border-destructive/30 bg-destructive/5 py-4 mb-6',
              isDeleting && 'opacity-50',
            )}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.destructive} />
            ) : (
              <Text className="text-base font-sans-bold text-destructive">Delete Supplier</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
