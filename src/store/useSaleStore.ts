import { create } from 'zustand';
import { getSales, deleteSale as apiDelete } from '../services/sale';

interface SaleState {
  sales: Sale[];
  isLoading: boolean;
  load: (userId: string) => Promise<void>;
  add: (sale: Sale) => void;
  remove: (saleId: string) => void;
  clear: () => void;
}

export const useSaleStore = create<SaleState>((set) => ({
  sales: [],
  isLoading: false,

  load: async (userId) => {
    set({ isLoading: true });
    try {
      const sales = await getSales(userId);
      set({ sales });
    } finally {
      set({ isLoading: false });
    }
  },

  add: (sale) =>
    set((state) => ({ sales: [sale, ...state.sales] })),

  remove: (saleId) =>
    set((state) => ({ sales: state.sales.filter((s) => s.id !== saleId) })),

  clear: () => set({ sales: [] }),
}));

export { apiDelete as apiDeleteSale };
