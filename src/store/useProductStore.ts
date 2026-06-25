import { create } from 'zustand';
import {
  getProducts,
  createProduct as apiCreate,
  updateProduct as apiUpdate,
  deleteProduct as apiDelete,
} from '../services/product';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  load: (userId: string) => Promise<void>;
  add: (product: Product) => void;
  update: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,

  load: async (userId) => {
    set({ isLoading: true });
    try {
      const products = await getProducts(userId);
      set({ products });
    } finally {
      set({ isLoading: false });
    }
  },

  add: (product) =>
    set((state) => ({ products: [product, ...state.products] })),

  update: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),

  remove: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  clear: () => set({ products: [] }),
}));

export { apiCreate, apiUpdate, apiDelete };
