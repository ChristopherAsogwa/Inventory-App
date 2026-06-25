import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { useMemo, useState } from 'react';
// import { useRouter } from 'expo-router';
// import clsx from 'clsx';
import { useSupplierStore } from '../store/useSupplierStore';
import clsx from 'clsx';

interface SupplierPickerSheetProps {
  visible: boolean;
  selectedId?: string;
  onSelect: (supplier: Supplier) => void;
  onClose: () => void;
  /** Called instead of the default navigate-to-add-supplier behaviour.
   *  Use this when the picker is nested inside another modal that must
   *  also be closed before navigating. */
  onCreateNew?: () => void;
}

export default function SupplierPickerSheet({
  visible,
  selectedId,
  onSelect,
  onClose,
  onCreateNew,
}: SupplierPickerSheetProps) {
  // const router = useRouter();
  const { suppliers } = useSupplierStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => s.fullName.toLowerCase().includes(q));
  }, [suppliers, search]);

  // const handleCreateNew = () => {
  //   if (onCreateNew) {
  //     onCreateNew();
  //   } else {
  //     onClose();
  //     router.push('/suppliers/add');
  //   }
  // };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="modal-overlay" onPress={onClose}>
        <Pressable className="modal-container" onPress={() => {}}>
          {/* Header */}
          <View className="modal-header">
            <Text className="modal-title">Select Supplier</Text>
            <Pressable className="modal-close" onPress={onClose}>
              <Text className="modal-close-text">✕</Text>
            </Pressable>
          </View>

          <ScrollView
            className="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Search */}
            <View className="modal-field">
              <TextInput
                className="modal-input"
                value={search}
                onChangeText={setSearch}
                placeholder="Search suppliers…"
                placeholderTextColor="rgba(15,23,42,0.35)"
                clearButtonMode="while-editing"
              />
            </View>

            {/* Create new */}
            {/* <Pressable
              className="flex-row items-center rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 gap-3 mb-2"
              onPress={handleCreateNew}
            >
              <View className="size-9 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-xl font-sans-light">+</Text>
              </View>
              <View>
                <Text className="text-sm font-sans-bold text-primary">Create New Supplier</Text>
                <Text className="text-xs font-sans-medium text-muted-foreground">Add a supplier and come back</Text>
              </View>
            </Pressable> */}

            {/* Supplier list */}
            {filtered.length === 0 ? (
              <Text className="text-sm font-sans-medium text-muted-foreground py-4 text-center">
                {suppliers.length === 0 ? 'No suppliers yet.' : 'No suppliers match your search.'}
              </Text>
            ) : (
              <View className="gap-2 mb-6">
                {filtered.map((supplier) => (
                  <Pressable
                    key={supplier.id}
                    className={clsx(
                      'rounded-2xl border px-4 py-3 flex-row items-center gap-3',
                      selectedId === supplier.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card',
                    )}
                    onPress={() => {
                      onSelect(supplier);
                      onClose();
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: selectedId === supplier.id ? '#2563eb' : '#eff6ff',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'sans-bold',
                          color: selectedId === supplier.id ? '#fff' : '#2563eb',
                        }}
                      >
                        {supplier.fullName.trim().charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={clsx(
                          'text-sm font-sans-bold',
                          selectedId === supplier.id ? 'text-primary' : 'text-dark',
                        )}
                        numberOfLines={1}
                      >
                        {supplier.fullName}
                      </Text>
                      {(supplier.email || supplier.phone) && (
                        <Text className="text-xs font-sans-medium text-muted-foreground" numberOfLines={1}>
                          {supplier.email || supplier.phone}
                        </Text>
                      )}
                    </View>
                    {selectedId === supplier.id && (
                      <Text className="text-primary text-base">✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
