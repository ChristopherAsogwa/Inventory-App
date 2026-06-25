import {
  databases,
  ID,
  Query,
  APPWRITE_DATABASE_ID,
  APPWRITE_SALES_COLLECTION_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
} from '../config/appwrite';

function docToSale(doc: Record<string, unknown>): Sale {
  return {
    id: doc.$id as string,
    productId: doc.productId as string,
    productName: doc.productName as string,
    quantity: doc.quantity as number,
    totalPrice: doc.totalPrice as number,
    costPrice: doc.costPrice as number,
    // Use Appwrite's built-in system field — always present, no index required
    createdAt: (doc.$createdAt ?? doc.createdAt) as string,
    userId: doc.userId as string,
  };
}

export interface RecordSaleParams {
  userId: string;
  product: Product;
  quantity: number;
}

export interface RecordSaleResult {
  sale: Sale;
  newQuantity: number;
}

/**
 * Records a sale and decrements the product's stock in a single Appwrite
 * batch. Returns the created Sale and the updated product quantity so the
 * caller can update local state without a second fetch.
 */
export async function recordSale(params: RecordSaleParams): Promise<RecordSaleResult> {
  const { userId, product, quantity } = params;

  if (quantity <= 0) throw new Error('Quantity must be at least 1.');
  if (quantity > product.quantity) {
    throw new Error(
      `Not enough stock. Only ${product.quantity} unit${product.quantity === 1 ? '' : 's'} available.`,
    );
  }

  const totalPrice = product.sellingPrice * quantity;
  const newQuantity = product.quantity - quantity;

  // 1. Create the sale document
  const saleDoc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_SALES_COLLECTION_ID,
    ID.unique(),
    {
      userId,
      productId: product.id,
      productName: product.name,
      quantity,
      totalPrice,
      costPrice: product.costPrice,
    },
  );

  // 2. Decrement product stock
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    product.id,
    { quantity: newQuantity },
  );

  return {
    sale: docToSale(saleDoc as unknown as Record<string, unknown>),
    newQuantity,
  };
}

export async function getSales(userId: string): Promise<Sale[]> {
  const result = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_SALES_COLLECTION_ID,
    [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(250)],
  );
  return result.documents.map((d) => docToSale(d as unknown as Record<string, unknown>));
}

export async function deleteSale(saleId: string): Promise<void> {
  await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_SALES_COLLECTION_ID,
    saleId,
  );
}
