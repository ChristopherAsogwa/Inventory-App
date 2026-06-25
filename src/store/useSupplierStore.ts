import { create } from 'zustand';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/supplier';

export { createSupplier, updateSupplier, deleteSupplier };

interface SupplierStore {
  suppliers: Supplier[];
  isLoading: boolean;
  load: (userId: string) => Promise<void>;
  add: (supplier: Supplier) => void;
  update: (supplier: Supplier) => void;
  remove: (supplierId: string) => void;
  clear: () => void;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: [],
  isLoading: false,

  load: async (userId) => {
    set({ isLoading: true });
    try {
      const suppliers = await getSuppliers(userId);
      set({ suppliers });
    } finally {
      set({ isLoading: false });
    }
  },

  add: (supplier) =>
    set((state) => ({ suppliers: [supplier, ...state.suppliers] })),

  update: (supplier) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === supplier.id ? supplier : s)),
    })),

  remove: (supplierId) =>
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== supplierId),
    })),

  clear: () => set({ suppliers: [] }),
}));
