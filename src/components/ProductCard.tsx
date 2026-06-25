import { View, Text, Pressable, Platform } from 'react-native';
import clsx from 'clsx';
import { formatCurrency } from '../utils/currency';
import { shadow } from '../../constants/theme';

function stockQtyClass(product: Product): string {
  if (product.quantity === 0) return 'prod-qty prod-qty-empty';
  if (product.quantity <= product.lowStockThreshold) return 'prod-qty prod-qty-low';
  return 'prod-qty';
}

function marginPercent(product: Product): number {
  if (product.sellingPrice <= 0) return 0;
  return ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const isLow = product.quantity > 0 && product.quantity <= product.lowStockThreshold;
  const isEmpty = product.quantity === 0;
  const margin = marginPercent(product);
  const marginPositive = margin >= 0;

  return (
    <Pressable
      className={clsx('prod-card mb-3', (isLow || isEmpty) && 'prod-card-low')}
      onPress={onPress}
      android_ripple={{ color: 'rgba(79,70,229,0.08)', borderless: false }}
      style={({ pressed }) => [
        shadow.sm,
        Platform.OS === 'ios' && pressed ? { opacity: 0.75 } : undefined,
      ]}
    >
      <View className="prod-head">
        <View className="prod-main">
          <Text className="prod-name" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="prod-meta" numberOfLines={1}>
            {product.sku} · {product.category}
          </Text>
          {!!product.supplierName && (
            <Text className="prod-supplier" numberOfLines={1}>
              {product.supplierName}
            </Text>
          )}
        </View>
        <View className="prod-right">
          <Text className="prod-price">
            {formatCurrency(product.sellingPrice)}
          </Text>
          <Text className={stockQtyClass(product)}>
            {product.quantity} units
          </Text>
          {(isLow || isEmpty) && (
            <View className="prod-badge prod-badge-low" style={{ alignSelf: 'flex-end' }}>
              <Text className="prod-badge-text">
                {isEmpty ? 'Out of stock' : 'Low stock'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Pricing details row */}
      <View className="prod-price-row">
        <Text className="prod-cost-label">
          Cost {formatCurrency(product.costPrice)}
        </Text>
        <View className={clsx('prod-margin-badge', marginPositive ? 'prod-margin-badge-pos' : 'prod-margin-badge-neg')}>
          <Text className={clsx('prod-margin-text', marginPositive ? 'prod-margin-text-pos' : 'prod-margin-text-neg')}>
            {marginPositive ? '+' : ''}{margin.toFixed(1)}% margin
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
