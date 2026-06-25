import { View, Text, Pressable, Modal } from 'react-native';

interface QuickActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onMakeSale: () => void;
  onAddProduct: () => void;
  onAddSupplier: () => void;
}

interface ActionRowProps {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}

function ActionRow({ icon, label, subtitle, onPress, last }: ActionRowProps) {
  return (
    <Pressable
      className={`flex-row items-center px-5 py-4 gap-4 ${!last ? 'border-b border-border' : ''}`}
      onPress={onPress}
    >
      <View className="size-11 rounded-2xl bg-primary/10 items-center justify-center">
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-sans-bold text-dark">{label}</Text>
        <Text className="text-xs font-sans-medium text-muted-foreground">{subtitle}</Text>
      </View>
      <Text className="text-muted-foreground text-lg">›</Text>
    </Pressable>
  );
}

export default function QuickActionSheet({
  visible,
  onClose,
  onMakeSale,
  onAddProduct,
  onAddSupplier,
}: QuickActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="modal-overlay" onPress={onClose}>
        <Pressable className="modal-container" onPress={() => {}}>
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Title */}
          <View className="px-5 pt-3 pb-2">
            <Text className="text-xl font-sans-bold text-dark">Quick Actions</Text>
          </View>

          {/* Actions */}
          <View className="rounded-2xl border border-border bg-card mx-5 mb-8 overflow-hidden">
            <ActionRow
              icon="🛒"
              label="Make a Sale"
              subtitle="Record a product sale"
              onPress={onMakeSale}
            />
            <ActionRow
              icon="📦"
              label="Add a Product"
              subtitle="Add new inventory item"
              onPress={onAddProduct}
            />
            <ActionRow
              icon="🤝"
              label="Add a Supplier"
              subtitle="Register a new supplier"
              onPress={onAddSupplier}
              last
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
