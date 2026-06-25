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
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/expo';
import clsx from 'clsx';
import { colors } from '@/constants/theme';
import { useProductStore } from '../store/useProductStore';
import { useSaleStore } from '../store/useSaleStore';
import { recordSale } from '../services/sale';
import { formatCurrency, formatProfit } from '../utils/currency';

export default function RecordSaleModal({
  visible,
  onClose,
  preselectedProductId,
}: RecordSaleModalProps) {
  const { userId } = useAuth();
  const { products, update: updateProduct } = useProductStore();
  const { add: addSale } = useSaleStore();

  const [selectedId, setSelectedId] = useState<string>(preselectedProductId ?? '');
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSaving, setIsSaving] = useState(false);

  // Sync preselectedProductId when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedId(preselectedProductId ?? '');
      setSearch('');
      setQuantity('1');
    }
  }, [visible, preselectedProductId]);

  const availableProducts = useMemo(
    () => products.filter((p) => p.quantity > 0),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableProducts;
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }, [availableProducts, search]);

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  const qty = Number(quantity);
  const quantityValid =
    Number.isInteger(qty) &&
    qty >= 1 &&
    !!selectedProduct &&
    qty <= selectedProduct.quantity;

  const formValid = !!selectedProduct && quantityValid;

  const previewTotal = selectedProduct ? selectedProduct.sellingPrice * qty : 0;
  const previewProfit = selectedProduct
    ? (selectedProduct.sellingPrice - selectedProduct.costPrice) * qty
    : 0;

  const handleRecord = async () => {
    if (!formValid || isSaving || !userId || !selectedProduct) return;
    setIsSaving(true);
    try {
      const { sale, newQuantity } = await recordSale({
        userId,
        product: selectedProduct,
        quantity: qty,
      });

      // Update product quantity in Zustand
      updateProduct({ ...selectedProduct, quantity: newQuantity });
      // Add sale to Zustand
      addSale(sale);

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Could not record sale', msg);
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
              <Text className="modal-title">Record Sale</Text>
              <Pressable className="modal-close" onPress={onClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              className="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Product search */}
              <View className="modal-field">
                <Text className="modal-label">Product *</Text>
                <TextInput
                  className="modal-input"
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by name or SKU…"
                  placeholderTextColor="rgba(15,23,42,0.35)"
                  clearButtonMode="while-editing"
                />
              </View>

              {/* Product list */}
              {filteredProducts.length === 0 ? (
                <Text className="sale-meta-text" style={{ paddingVertical: 8 }}>
                  {availableProducts.length === 0
                    ? 'No products with stock available.'
                    : 'No products match your search.'}
                </Text>
              ) : (
                <View className="gap-2 mb-2">
                  {filteredProducts.map((p) => (
                    <Pressable
                      key={p.id}
                      className={clsx(
                        'rounded-2xl border px-4 py-3',
                        selectedId === p.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card',
                      )}
                      onPress={() => setSelectedId(p.id)}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={clsx(
                            'text-sm font-sans-bold flex-1 mr-2',
                            selectedId === p.id ? 'text-primary' : 'text-dark',
                          )}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        <Text className="sale-meta-text">{p.quantity} left</Text>
                      </View>
                      <Text className="sale-meta-text">
                        {p.sku} · {formatCurrency(p.sellingPrice)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Quantity */}
              {!!selectedProduct && (
                <View className="modal-field mt-2">
                  <Text className="modal-label">
                    Quantity * (max {selectedProduct.quantity})
                  </Text>
                  <TextInput
                    className={clsx(
                      'modal-input',
                      quantity.length > 0 && !quantityValid && 'modal-input-error',
                    )}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                    placeholderTextColor="rgba(15,23,42,0.35)"
                  />
                  {quantity.length > 0 && !quantityValid && (
                    <Text className="modal-error">
                      Enter a whole number between 1 and {selectedProduct.quantity}
                    </Text>
                  )}
                </View>
              )}

              {/* Preview */}
              {formValid && (
                <View className="sale-preview-card">
                  <View className="sale-preview-row">
                    <Text className="sale-preview-label">Total Revenue</Text>
                    <Text className="sale-preview-value">{formatCurrency(previewTotal)}</Text>
                  </View>
                  <View className="sale-preview-row">
                    <Text className="sale-preview-label">Profit</Text>
                    <Text className={previewProfit >= 0 ? 'sale-profit-pos' : 'sale-profit-neg'}>
                      {formatProfit(previewProfit)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Confirm */}
              <Pressable
                className={clsx(
                  'modal-button mt-3 mb-6',
                  (!formValid || isSaving) && 'modal-button-disabled',
                )}
                onPress={handleRecord}
                disabled={!formValid || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text className="modal-button-text">Confirm Sale</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
