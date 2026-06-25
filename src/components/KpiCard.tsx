import { View, Text, Pressable, Platform } from 'react-native';
import clsx from 'clsx';
import { shadow } from '../../constants/theme';

export default function KpiCard({ label, value, warning, onPress }: KpiCardProps) {
  if (onPress) {
    return (
      <Pressable
        className={clsx('kpi-card', warning && 'kpi-card-warning')}
        onPress={onPress}
        android_ripple={{ color: 'rgba(79,70,229,0.08)', borderless: false }}
        style={({ pressed }) => [
          shadow.sm,
          Platform.OS === 'ios' && pressed ? { opacity: 0.75 } : undefined,
        ]}
      >
        <Text className="kpi-label">{label}</Text>
        <Text className={clsx('kpi-value', warning && 'kpi-value-warning')}>{value}</Text>
      </Pressable>
    );
  }

  return (
    <View
      className={clsx('kpi-card', warning && 'kpi-card-warning')}
      style={shadow.sm}
    >
      <Text className="kpi-label">{label}</Text>
      <Text className={clsx('kpi-value', warning && 'kpi-value-warning')}>
        {value}
      </Text>
    </View>
  );
}
