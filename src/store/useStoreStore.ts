import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/constants/data';
import { getStore } from '../services/store';

interface StoreState {
  storeName: string;
  lowStockThreshold: number;
  isOnboarded: boolean;
  isLoaded: boolean;
  storeId: string | null;
  /** Load persisted state from SecureStore. If userId is provided and SecureStore has no
   *  onboarding data (e.g. after sign-out wipe), falls back to Appwrite to restore state. */
  load: (userId?: string) => Promise<void>;
  /** Persist store data to SecureStore and update in-memory state. */
  setStore: (params: { storeName: string; lowStockThreshold: number; storeId?: string }) => Promise<void>;
  /** Wipe all persisted store data (on sign-out). */
  clear: () => Promise<void>;
}

export const useStoreStore = create<StoreState>((set) => ({
  storeName: 'My Store',
  lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
  isOnboarded: false,
  isLoaded: false,
  storeId: null,

  load: async (userId?: string) => {
    const [storeName, threshold, isOnboarded, storeId] = await Promise.all([
      SecureStore.getItemAsync('storeName'),
      SecureStore.getItemAsync('lowStockThreshold'),
      SecureStore.getItemAsync('isOnboarded'),
      SecureStore.getItemAsync('storeId'),
    ]);

    // Fast path — SecureStore has onboarding data (normal session)
    if (isOnboarded === 'true') {
      set({
        storeName: storeName ?? 'My Store',
        lowStockThreshold: threshold ? Number(threshold) : DEFAULT_LOW_STOCK_THRESHOLD,
        isOnboarded: true,
        storeId: storeId ?? null,
        isLoaded: true,
      });
      return;
    }

    // Fallback — SecureStore was wiped (e.g. after sign-out). Re-fetch from Appwrite.
    if (userId) {
      const remote = await getStore(userId);
      if (remote) {
        await Promise.all([
          SecureStore.setItemAsync('storeName', remote.name),
          SecureStore.setItemAsync('lowStockThreshold', String(remote.lowStockThreshold)),
          SecureStore.setItemAsync('isOnboarded', 'true'),
          SecureStore.setItemAsync('storeId', remote.id),
        ]);
        set({
          storeName: remote.name,
          lowStockThreshold: remote.lowStockThreshold,
          isOnboarded: true,
          storeId: remote.id,
          isLoaded: true,
        });
        return;
      }
    }

    // No store found — new user, show onboarding
    set({
      storeName: storeName ?? 'My Store',
      lowStockThreshold: threshold ? Number(threshold) : DEFAULT_LOW_STOCK_THRESHOLD,
      isOnboarded: false,
      storeId: null,
      isLoaded: true,
    });
  },

  setStore: async ({ storeName, lowStockThreshold, storeId }) => {
    await Promise.all([
      SecureStore.setItemAsync('storeName', storeName),
      SecureStore.setItemAsync('lowStockThreshold', String(lowStockThreshold)),
      SecureStore.setItemAsync('isOnboarded', 'true'),
      storeId ? SecureStore.setItemAsync('storeId', storeId) : Promise.resolve(),
    ]);
    set({ storeName, lowStockThreshold, isOnboarded: true, storeId: storeId ?? null });
  },

  clear: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('storeName'),
      SecureStore.deleteItemAsync('lowStockThreshold'),
      SecureStore.deleteItemAsync('isOnboarded'),
      SecureStore.deleteItemAsync('storeId'),
    ]);
    set({
      storeName: 'My Store',
      lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
      isOnboarded: false,
      storeId: null,
    });
  },
}));
