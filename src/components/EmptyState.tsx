import { View, Text } from 'react-native';

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View className="empty-container">
      <Text className="empty-title">{title}</Text>
      <Text className="empty-subtitle">{subtitle}</Text>
    </View>
  );
}
