import {
  databases,
  ID,
  Query,
  APPWRITE_DATABASE_ID,
  APPWRITE_SUPPLIERS_COLLECTION_ID,
} from '../config/appwrite';

function docToSupplier(doc: Record<string, unknown>): Supplier {
  return {
    id: doc.$id as string,
    fullName: (doc.fullName as string) ?? '',
    email: (doc.email as string) ?? '',
    phone: (doc.phone as string) ?? '',
    address: (doc.address as string) ?? '',
    userId: doc.userId as string,
  };
}

export async function createSupplier(
  params: Omit<Supplier, 'id'>,
): Promise<Supplier> {
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_SUPPLIERS_COLLECTION_ID,
    ID.unique(),
    {
      userId: params.userId,
      fullName: params.fullName,
      email: params.email ?? '',
      phone: params.phone ?? '',
      address: params.address ?? '',
    },
  );
  return docToSupplier(doc as unknown as Record<string, unknown>);
}

export async function getSuppliers(userId: string): Promise<Supplier[]> {
  const result = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_SUPPLIERS_COLLECTION_ID,
    [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(100)],
  );
  return result.documents.map((d) =>
    docToSupplier(d as unknown as Record<string, unknown>),
  );
}

export async function updateSupplier(
  supplierId: string,
  params: Partial<Omit<Supplier, 'id' | 'userId'>>,
): Promise<Supplier> {
  const doc = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_SUPPLIERS_COLLECTION_ID,
    supplierId,
    params,
  );
  return docToSupplier(doc as unknown as Record<string, unknown>);
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_SUPPLIERS_COLLECTION_ID,
    supplierId,
  );
}
