import { View, Text, Pressable, Alert, Platform } from 'react-native';
import dayjs from 'dayjs';
import { useSaleStore, apiDeleteSale } from '../store/useSaleStore';
import { formatCurrency, formatProfit } from '../utils/currency';
import { shadow } from '../../constants/theme';

function profitForSale(sale: Sale): number {
  return sale.totalPrice - sale.costPrice * sale.quantity;
}

export default function SaleCard({ sale }: SaleCardProps) {
  const { remove } = useSaleStore();
  const profit = profitForSale(sale);

  const handleDelete = () => {
    Alert.alert(
      'Delete Sale',
      `Remove this sale of "${sale.productName}"? Stock will not be restored automatically.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteSale(sale.id);
              remove(sale.id);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              Alert.alert('Could not delete sale', msg);
            }
          },
        },
      ],
    );
  };

  return (
    <Pressable
      className="sale-card mb-3"
      onLongPress={handleDelete}
      android_ripple={{ color: 'rgba(79,70,229,0.06)', borderless: false }}
      style={({ pressed }) => [
        shadow.sm,
        Platform.OS === 'ios' && pressed ? { opacity: 0.75 } : undefined,
      ]}
    >
      <View className="sale-head">
        <Text className="sale-product-name" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
          {sale.productName}
        </Text>
        <Text className="sale-total">{formatCurrency(sale.totalPrice)}</Text>
      </View>

      <View className="sale-meta">
        <Text className="sale-meta-text">{sale.quantity} unit{sale.quantity !== 1 ? 's' : ''}</Text>
        <Text className="sale-meta-text">·</Text>
        <Text className="sale-meta-text">{dayjs(sale.createdAt).format('D MMM, h:mm A')}</Text>
      </View>

      <View className="sale-profit-row">
        <Text className={profit >= 0 ? 'sale-profit-pos' : 'sale-profit-neg'}>
          Profit: {formatProfit(profit)}
        </Text>
        <Text className="sale-meta-text">Cost {formatCurrency(sale.costPrice * sale.quantity)}</Text>
      </View>
    </Pressable>
  );
}
