import { icons } from './icons';

export const tabs: AppTab[] = [
  { name: 'index', title: 'Home', icon: icons.home },
  { name: 'products', title: 'Products', icon: icons.box },
  { name: 'sales', title: 'Sales', icon: icons.receipt },
  { name: 'suppliers', title: 'Suppliers', iconChar: '👤' },
  { name: 'settings', title: 'Settings', icon: icons.settings },
];

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Food & Beverage',
  'Clothing',
  'Tools & Hardware',
  'Health & Beauty',
  'Office Supplies',
  'Other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
