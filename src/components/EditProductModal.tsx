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
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/constants/data';
import { colors } from '@/constants/theme';
import { useProductStore, apiUpdate, apiDelete } from '../store/useProductStore';
import { useStoreStore } from '../store/useStoreStore';

export default function EditProductModal({
  visible,
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const { update, remove } = useProductStore();
  const { lowStockThreshold: storeThreshold } = useStoreStore();

  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [sellingPrice, setSellingPrice] = useState(String(product.sellingPrice));
  const [costPrice, setCostPrice] = useState(String(product.costPrice));
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [category, setCategory] = useState<ProductCategory>(
    product.category as ProductCategory,
  );
  const [threshold, setThreshold] = useState(String(product.lowStockThreshold));
  const [supplierName, setSupplierName] = useState(product.supplierName ?? '');
  const [supplierContact, setSupplierContact] = useState(product.supplierContact ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync fields when a different product is opened (keyed on id only — intentional)
  useEffect(() => {
    setName(product.name);
    setSku(product.sku);
    setSellingPrice(String(product.sellingPrice));
    setCostPrice(String(product.costPrice));
    setQuantity(String(product.quantity));
    setCategory(product.category as ProductCategory);
    setThreshold(String(product.lowStockThreshold));
    setSupplierName(product.supplierName ?? '');
    setSupplierContact(product.supplierContact ?? '');
  }, [product.id]);

  const nameValid = name.trim().length >= 2;
  const skuValid = sku.trim().length >= 1;
  const sellingPriceValid = parseFloat(sellingPrice) > 0 && !isNaN(parseFloat(sellingPrice));
  const costPriceValid = parseFloat(costPrice) > 0 && !isNaN(parseFloat(costPrice));
  const quantityValid = Number.isInteger(Number(quantity)) && Number(quantity) >= 0;
  const thresholdValid = threshold.trim() === '' || (Number(threshold) > 0 && !isNaN(Number(threshold)));
  const formValid =
    nameValid && skuValid && sellingPriceValid && costPriceValid && quantityValid && thresholdValid;

  const handleSave = async () => {
    if (!formValid || isSaving) return;
    setIsSaving(true);
    try {
      const updated = await apiUpdate(product.id, {
        name: name.trim(),
        sku: sku.trim(),
        sellingPrice: parseFloat(sellingPrice),
        costPrice: parseFloat(costPrice),
        quantity: Number(quantity),
        lowStockThreshold: threshold.trim() ? Number(threshold) : storeThreshold,
        category,
        supplierName: supplierName.trim(),
        supplierContact: supplierContact.trim(),
      });
      update(updated);
      onSuccess?.(updated);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Could not update product', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Remove "${product.name}" from your inventory? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await apiDelete(product.id);
              remove(product.id);
              onClose();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              Alert.alert('Could not delete product', msg);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
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
              <Text className="modal-title">Edit Product</Text>
              <Pressable className="modal-close" onPress={onClose}>
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
                  className="modal-input"
                  value={sku}
                  onChangeText={setSku}
                  autoCapitalize="characters"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                />
              </View>

              {/* Selling Price & Cost Price */}
              <View className="flex-row gap-3">
                <View className="modal-field flex-1">
                  <Text className="modal-label">Selling Price (#) *</Text>
                  <TextInput
                    className={clsx('modal-input', sellingPrice.length > 0 && !sellingPriceValid && 'modal-input-error')}
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                    keyboardType="decimal-pad"
                    placeholderTextColor="rgba(15,23,42,0.35)"
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
                    keyboardType="decimal-pad"
                    placeholderTextColor="rgba(15,23,42,0.35)"
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
                  keyboardType="number-pad"
                  placeholderTextColor="rgba(15,23,42,0.35)"
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
                  keyboardType="number-pad"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  placeholder={String(storeThreshold)}
                />
                {threshold.length > 0 && !thresholdValid && (
                  <Text className="modal-error">Enter a number greater than 0</Text>
                )}
                <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
                  Leave blank to use the store default ({storeThreshold} units)
                </Text>
              </View>

              {/* Supplier */}
              <View className="modal-field">
                <Text className="modal-label">Supplier Name</Text>
                <TextInput
                  className="modal-input"
                  value={supplierName}
                  onChangeText={setSupplierName}
                  placeholder="Optional"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                />
              </View>

              <View className="modal-field">
                <Text className="modal-label">Supplier Contact</Text>
                <TextInput
                  className="modal-input"
                  value={supplierContact}
                  onChangeText={setSupplierContact}
                  placeholder="Email or phone (optional)"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                className={clsx('modal-button-destructive mt-3 mb-6', isDeleting && 'opacity-50')}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.destructive} />
                ) : (
                  <Text className="modal-button-destructive-text">Delete Product</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
