import { View, Text, Pressable, Modal, Linking, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { getSupplierRecommendations } from '../utils/supplier';
import { formatCurrency } from '../utils/currency';

export default function LowStockAlert({ visible, product, allProducts = [], onDismiss }: LowStockAlertProps) {
  const hasSupplier = !!product.supplierName;

  const recommendations = useMemo(
    () => getSupplierRecommendations(product, allProducts),
    [product, allProducts],
  );

  const handleContact = (contact?: string) => {
    const raw = (contact ?? product.supplierContact ?? '').trim();
    if (!raw) return;
    if (raw.includes('@')) {
      Linking.openURL(`mailto:${raw}`);
    } else {
      Linking.openURL(`tel:${raw}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable className="alert-overlay" onPress={onDismiss}>
        <Pressable className="alert-container" onPress={() => {}}>
          {/* Drag handle */}
          <View className="alert-drag-handle" />
          {/* Status colour bar */}
          <View className={`alert-status-bar ${product.quantity === 0 ? 'bg-destructive' : 'bg-warning'}`} />
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Title */}
            <View className="alert-icon-row">
              <Text className="alert-title">
                {product.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
              </Text>
            </View>

            <Text className="alert-product-name">{product.name}</Text>
            <Text className="alert-qty">
              {product.quantity === 0
                ? 'No units remaining'
                : `Only ${product.quantity} unit${product.quantity === 1 ? '' : 's'} left (threshold: ${product.lowStockThreshold})`}
            </Text>

            {/* Current supplier */}
            {hasSupplier && (
              <View className="alert-supplier-card">
                <Text className="alert-supplier-label">Current Supplier</Text>
                <Text className="alert-supplier-name">{product.supplierName}</Text>
                {!!product.supplierContact && (
                  <Text className="alert-supplier-contact">{product.supplierContact}</Text>
                )}
                {!!product.costPrice && (
                  <Text className="alert-supplier-price">
                    Cost price: {formatCurrency(product.costPrice)} / unit
                  </Text>
                )}
              </View>
            )}

            {hasSupplier && !!product.supplierContact && (
              <Pressable className="alert-cta-button" onPress={() => handleContact()}>
                <Text className="alert-cta-text">Contact Supplier to Restock</Text>
              </Pressable>
            )}

            {/* Supplier recommendations */}
            {recommendations.length > 0 && (
              <View className="alert-recommendations">
                <Text className="alert-rec-heading">Better Price Available</Text>
                <Text className="alert-rec-subheading">
                  Other suppliers tracked for this product (SKU: {product.sku})
                </Text>

                {recommendations.map((rec) => (
                  <View key={rec.supplierName} className="alert-rec-card">
                    <View className="alert-rec-header">
                      <View style={{ flex: 1 }}>
                        <Text className="alert-rec-supplier-name">{rec.supplierName}</Text>
                        <Text className="alert-rec-ref">Same product · cheaper cost</Text>
                      </View>
                      <View className="alert-rec-badge">
                        <Text className="alert-rec-badge-text">
                          Save {formatCurrency(rec.savingsPerUnit)}/unit
                        </Text>
                      </View>
                    </View>

                    <Text className="alert-rec-price">
                      {formatCurrency(rec.costPrice)} / unit
                    </Text>

                    {!!rec.supplierContact && (
                      <Pressable
                        className="alert-rec-contact-btn"
                        onPress={() => handleContact(rec.supplierContact)}
                      >
                        <Text className="alert-rec-contact-text">
                          Contact — {rec.supplierContact}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            )}

            <Pressable className="alert-dismiss-button" onPress={onDismiss}>
              <Text className="alert-dismiss-text">Dismiss</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
