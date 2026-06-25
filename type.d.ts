// ── Navigation ────────────────────────────────────────────────────────────────

interface AppTab {
  name: string;
  title: string;
  icon?: any;
  iconChar?: string;
}

interface TabIconProps {
  focused: boolean;
  title: string;
  icon?: any;
  iconChar?: string;
}

// ── Domain models ─────────────────────────────────────────────────────────────

interface Supplier {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  userId: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  category: string;
  supplierId?: string;
  supplierName?: string;     // legacy — kept for backward compat
  supplierContact?: string;  // legacy — kept for backward compat
  sellingPrice: number;
  costPrice: number;
  imageUrl?: string;
  userId: string;
}

interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  /** Snapshot of cost price at sale time — used for accurate historical profit. */
  costPrice: number;
  createdAt: string;
  userId: string;
}

interface Store {
  id: string;
  name: string;
  userId: string;
  lowStockThreshold: number;
}

// ── Component props ───────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

interface SaleCardProps {
  sale: Sale;
}

interface CreateProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (product: Product) => void;
}

interface EditProductModalProps {
  visible: boolean;
  product: Product;
  onClose: () => void;
  onSuccess?: (product: Product) => void;
}

interface RecordSaleModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

interface LowStockAlertProps {
  visible: boolean;
  product: Product;
  /** All products — used to compute supplier price recommendations */
  allProducts?: Product[];
  onDismiss: () => void;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  warning?: boolean;
  onPress?: () => void;
}

interface EmptyStateProps {
  title: string;
  subtitle: string;
}
