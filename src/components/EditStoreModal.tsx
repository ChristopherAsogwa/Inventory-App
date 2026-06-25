import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { colors } from '@/constants/theme';
import { useStoreStore } from '../store/useStoreStore';
import { updateStore } from '../services/store';

interface EditStoreModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditStoreModal({ visible, onClose }: EditStoreModalProps) {
  const { storeName, lowStockThreshold, storeId, setStore } = useStoreStore();

  const [name, setName] = useState(storeName);
  const [threshold, setThreshold] = useState(String(lowStockThreshold));
  const [isSaving, setIsSaving] = useState(false);

  // Sync fields when the modal opens with latest values
  useEffect(() => {
    if (visible) {
      setName(storeName);
      setThreshold(String(lowStockThreshold));
    }
  }, [visible, storeName, lowStockThreshold]);

  const nameValid = name.trim().length >= 2;
  const thresholdValid = Number(threshold) > 0 && !isNaN(Number(threshold));
  const formValid = nameValid && thresholdValid;

  const hasChanges =
    name.trim() !== storeName || Number(threshold) !== lowStockThreshold;

  const handleSave = async () => {
    if (!formValid || isSaving || !hasChanges) return;
    setIsSaving(true);
    try {
      const trimmedName = name.trim();
      const newThreshold = Number(threshold);

      // Persist to Appwrite if we have a storeId
      if (storeId) {
        await updateStore(storeId, {
          name: trimmedName,
          lowStockThreshold: newThreshold,
        });
      }

      // Sync Zustand + SecureStore
      await setStore({ storeName: trimmedName, lowStockThreshold: newThreshold, storeId: storeId ?? undefined });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Could not save changes', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="modal-overlay" onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Pressable className="modal-container" onPress={() => {}}>
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">Edit Store</Text>
              <Pressable className="modal-close" onPress={onClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              className="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Store Name */}
              <View className="modal-field">
                <Text className="modal-label">Store Name *</Text>
                <TextInput
                  className={clsx(
                    'modal-input',
                    name.length > 0 && !nameValid && 'modal-input-error',
                  )}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Corner Shop, Warehouse A"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  returnKeyType="next"
                />
                {name.length > 0 && !nameValid && (
                  <Text className="modal-error">At least 2 characters required</Text>
                )}
              </View>

              {/* Low Stock Threshold */}
              <View className="modal-field">
                <Text className="modal-label">Default Low Stock Threshold *</Text>
                <TextInput
                  className={clsx(
                    'modal-input',
                    threshold.length > 0 && !thresholdValid && 'modal-input-error',
                  )}
                  value={threshold}
                  onChangeText={setThreshold}
                  placeholder="e.g. 10"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
                {threshold.length > 0 && !thresholdValid && (
                  <Text className="modal-error">Enter a number greater than 0</Text>
                )}
                <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
                  This is the default for new products. Existing products keep their own threshold.
                </Text>
              </View>

              {/* Save */}
              <Pressable
                className={clsx(
                  'modal-button mt-2 mb-6',
                  (!formValid || !hasChanges || isSaving) && 'modal-button-disabled',
                )}
                onPress={handleSave}
                disabled={!formValid || !hasChanges || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text className="modal-button-text">Save Changes</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
