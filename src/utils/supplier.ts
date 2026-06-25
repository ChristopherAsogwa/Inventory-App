export interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  supplierContact: string;
  /** The product from which we found this supplier */
  referencedProductName: string;
  /** Their best (lowest) cost price for the same SKU */
  costPrice: number;
  /** How much cheaper per unit vs. the current product's cost */
  savingsPerUnit: number;
}

/**
 * Find alternative suppliers that offer a lower cost price for the same SKU.
 *
 * Works with both legacy (supplierName on product) and new (supplierId) models.
 * Resolves supplier display names from the provided suppliers array when supplierId is set.
 *
 * Logic:
 *  1. Look at every other product with the same SKU.
 *  2. Skip products with no supplier or the same supplier as the current product.
 *  3. Group by supplierId (or supplierName for legacy); keep the lowest cost per supplier.
 *  4. Only keep suppliers whose best price is strictly lower than `product.costPrice`.
 *  5. Sort by savings descending and return the top 2.
 */
export function getSupplierRecommendations(
  product: Product,
  allProducts: Product[],
  allSuppliers: Supplier[] = [],
): SupplierRecommendation[] {
  if (!product.sku) return [];

  const supplierMap = new Map<string, Supplier>(allSuppliers.map((s) => [s.id, s]));
  const currentKey = product.supplierId ?? product.supplierName?.trim().toLowerCase() ?? '';

  const best = new Map<string, SupplierRecommendation>();

  for (const p of allProducts) {
    if (p.id === product.id) continue;
    if (!p.sku || p.sku !== product.sku) continue;

    const key = p.supplierId ?? p.supplierName?.trim().toLowerCase() ?? '';
    if (!key || key === currentKey) continue;
    if (p.costPrice >= product.costPrice) continue;

    // Resolve display name
    let nameRaw = p.supplierName?.trim() ?? '';
    let contact = p.supplierContact?.trim() ?? '';
    if (p.supplierId) {
      const s = supplierMap.get(p.supplierId);
      if (s) {
        nameRaw = s.fullName;
        contact = s.email || s.phone;
      }
    }
    if (!nameRaw) continue;

    const existing = best.get(key);
    if (!existing || p.costPrice < existing.costPrice) {
      best.set(key, {
        supplierId: p.supplierId ?? '',
        supplierName: nameRaw,
        supplierContact: contact,
        referencedProductName: p.name,
        costPrice: p.costPrice,
        savingsPerUnit: product.costPrice - p.costPrice,
      });
    }
  }

  return Array.from(best.values())
    .sort((a, b) => b.savingsPerUnit - a.savingsPerUnit)
    .slice(0, 2);
}
