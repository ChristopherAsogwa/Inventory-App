import {
  databases,
  ID,
  Query,
  APPWRITE_DATABASE_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
} from '../config/appwrite';

function docToProduct(doc: Record<string, unknown>): Product {
  return {
    id: doc.$id as string,
    name: doc.name as string,
    sku: doc.sku as string,
    quantity: doc.quantity as number,
    lowStockThreshold: doc.lowStockThreshold as number,
    category: doc.category as string,
    supplierId: (doc.supplierId as string | undefined) ?? undefined,
    supplierName: (doc.supplierName as string) ?? '',
    supplierContact: (doc.supplierContact as string) ?? '',
    sellingPrice: doc.sellingPrice as number,
    costPrice: doc.costPrice as number,
    imageUrl: (doc.imageUrl as string | undefined) ?? undefined,
    userId: doc.userId as string,
  };
}

export async function createProduct(
  params: Omit<Product, 'id'>,
): Promise<Product> {
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    ID.unique(),
    {
      userId: params.userId,
      name: params.name,
      sku: params.sku,
      quantity: params.quantity,
      lowStockThreshold: params.lowStockThreshold,
      category: params.category,
      supplierId: params.supplierId ?? null,
      supplierName: params.supplierName ?? '',
      supplierContact: params.supplierContact ?? '',
      sellingPrice: params.sellingPrice,
      costPrice: params.costPrice,
    },
  );
  return docToProduct(doc as unknown as Record<string, unknown>);
}

export async function getProducts(userId: string): Promise<Product[]> {
  const result = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(100)],
  );
  return result.documents.map((d) =>
    docToProduct(d as unknown as Record<string, unknown>),
  );
}

export async function updateProduct(
  productId: string,
  params: Partial<Omit<Product, 'id' | 'userId'>>,
): Promise<Product> {
  const doc = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    productId,
    params,
  );
  return docToProduct(doc as unknown as Record<string, unknown>);
}

export async function deleteProduct(productId: string): Promise<void> {
  await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    productId,
  );
}
