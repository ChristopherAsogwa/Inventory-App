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
import { useState } from 'react';
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import clsx from 'clsx';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/constants/data';
import { colors } from '@/constants/theme';
import { useStoreStore } from '../store/useStoreStore';
import { useProductStore, apiCreate } from '../store/useProductStore';
import SupplierPickerSheet from './SupplierPickerSheet';

export default function CreateProductModal({
  visible,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const { lowStockThreshold: storeThreshold } = useStoreStore();
  const { add } = useProductStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0]);
  const [threshold, setThreshold] = useState(String(storeThreshold));
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nameValid = name.trim().length >= 2;
  const skuValid = sku.trim().length >= 1;
  const sellingPriceValid = parseFloat(sellingPrice) > 0 && !isNaN(parseFloat(sellingPrice));
  const costPriceValid = parseFloat(costPrice) > 0 && !isNaN(parseFloat(costPrice));
  const quantityValid = Number.isInteger(Number(quantity)) && Number(quantity) >= 0;
  const thresholdValid = threshold.trim() === '' || (Number(threshold) > 0 && !isNaN(Number(threshold)));
  const formValid =
    nameValid && skuValid && sellingPriceValid && costPriceValid && quantityValid && thresholdValid;

  const resetForm = () => {
    setName('');
    setSku('');
    setSellingPrice('');
    setCostPrice('');
    setQuantity('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setThreshold(String(storeThreshold));
    setSelectedSupplier(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!formValid || isSaving || !userId) return;
    setIsSaving(true);
    try {
      const product = await apiCreate({
        userId,
        name: name.trim(),
        sku: sku.trim(),
        sellingPrice: parseFloat(sellingPrice),
        costPrice: parseFloat(costPrice),
        quantity: Number(quantity),
        lowStockThreshold: threshold.trim() ? Number(threshold) : storeThreshold,
        category,
        supplierId: selectedSupplier?.id,
        supplierName: selectedSupplier?.fullName ?? '',
        supplierContact: selectedSupplier?.email || selectedSupplier?.phone || '',
      });
      add(product);
      resetForm();
      onSuccess?.(product);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Could not save product', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="modal-overlay" onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Pressable className="modal-container" onPress={() => {}}>
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">Add Product</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              className="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Name */}
              <View className="modal-field">
                <Text className="modal-label">Product Name *</Text>
                <TextInput
                  className={clsx('modal-input', name.length > 0 && !nameValid && 'modal-input-error')}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Wireless Keyboard"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                />
                {name.length > 0 && !nameValid && (
                  <Text className="modal-error">At least 2 characters required</Text>
                )}
              </View>

              {/* SKU */}
              <View className="modal-field">
                <Text className="modal-label">SKU *</Text>
                <TextInput
                  className={clsx('modal-input', sku.length > 0 && !skuValid && 'modal-input-error')}
                  value={sku}
                  onChangeText={setSku}
                  placeholder="e.g. WKB-001"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  autoCapitalize="characters"
                />
              </View>

              {/* Selling Price & Cost Price row */}
              <View className="flex-row gap-3">
                <View className="modal-field flex-1">
                  <Text className="modal-label">Selling Price (#) *</Text>
                  <TextInput
                    className={clsx('modal-input', sellingPrice.length > 0 && !sellingPriceValid && 'modal-input-error')}
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                    placeholder="0.00"
                    placeholderTextColor="rgba(15,23,42,0.35)"
                    keyboardType="decimal-pad"
                  />
                  {sellingPrice.length > 0 && !sellingPriceValid && (
                    <Text className="modal-error">Enter a valid price</Text>
                  )}
                </View>
                <View className="modal-field flex-1">
                  <Text className="modal-label">Cost Price (#) *</Text>
                  <TextInput
                    className={clsx('modal-input', costPrice.length > 0 && !costPriceValid && 'modal-input-error')}
                    value={costPrice}
                    onChangeText={setCostPrice}
                    placeholder="0.00"
                    placeholderTextColor="rgba(15,23,42,0.35)"
                    keyboardType="decimal-pad"
                  />
                  {costPrice.length > 0 && !costPriceValid && (
                    <Text className="modal-error">Enter a valid cost</Text>
                  )}
                </View>
              </View>

              {/* Quantity */}
              <View className="modal-field">
                <Text className="modal-label">Quantity *</Text>
                <TextInput
                  className={clsx('modal-input', quantity.length > 0 && !quantityValid && 'modal-input-error')}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  keyboardType="number-pad"
                />
              </View>

              {/* Category */}
              <View className="modal-field">
                <Text className="modal-label">Category *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx(
                        'rounded-2xl border px-3 py-2',
                        category === cat
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background',
                      )}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        className={clsx(
                          'text-sm font-sans-semibold',
                          category === cat ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Low stock threshold */}
              <View className="modal-field">
                <Text className="modal-label">Low Stock Threshold</Text>
                <TextInput
                  className={clsx('modal-input', threshold.length > 0 && !thresholdValid && 'modal-input-error')}
                  value={threshold}
                  onChangeText={setThreshold}
                  placeholder={String(storeThreshold)}
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  keyboardType="number-pad"
                />
                {threshold.length > 0 && !thresholdValid && (
                  <Text className="modal-error">Enter a number greater than 0</Text>
                )}
                <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
                  Leave blank to use the store default ({storeThreshold} units)
                </Text>
              </View>

              {/* Supplier (optional) */}
              <View className="modal-field">
                <Text className="modal-label">Supplier</Text>
                <Pressable
                  className="modal-input flex-row items-center justify-between"
                  onPress={() => setShowSupplierPicker(true)}
                >
                  <Text
                    className={selectedSupplier ? 'text-base font-sans-medium text-dark' : 'text-base font-sans-medium text-muted-foreground'}
                    numberOfLines={1}
                  >
                    {selectedSupplier ? selectedSupplier.fullName : 'Select a supplier (optional)'}
                  </Text>
                  <Text className="text-muted-foreground">›</Text>
                </Pressable>
              </View>

              {/* Save */}
              <Pressable
                className={clsx('modal-button mt-2 mb-6', (!formValid || isSaving) && 'modal-button-disabled')}
                onPress={handleSave}
                disabled={!formValid || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text className="modal-button-text">Add Product</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      <SupplierPickerSheet
        visible={showSupplierPicker}
        selectedId={selectedSupplier?.id}
        onSelect={(supplier) => setSelectedSupplier(supplier)}
        onClose={() => setShowSupplierPicker(false)}
        onCreateNew={() => {
          // Navigate FIRST so the new screen mounts in the background while
          // the modals are still visible. Then close both modals — they animate
          // away revealing the already-mounted, fully responsive screen.
          // Closing modals before navigating (or using InteractionManager) does
          // not work because each RN <Modal> creates its own native presentation
          // layer; dismissing two of them simultaneously while navigating leaves
          // the native UIViewController chain mid-flight and swallows all touches.
          router.push('/suppliers/add');
          setShowSupplierPicker(false);
          onClose();
        }}
      />
    </Modal>
  );
}
