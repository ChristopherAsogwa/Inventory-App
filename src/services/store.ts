import {
  databases,
  ID,
  Query,
  APPWRITE_DATABASE_ID,
  APPWRITE_STORES_COLLECTION_ID,
  isAppwriteConfigured,
} from '../config/appwrite';

function docToStore(doc: Record<string, unknown>): Store {
  return {
    id: doc.$id as string,
    name: doc.name as string,
    userId: doc.userId as string,
    lowStockThreshold: doc.lowStockThreshold as number,
  };
}

export async function createStore(params: {
  userId: string;
  name: string;
  lowStockThreshold: number;
}): Promise<Store> {
  if (!isAppwriteConfigured) {
    throw new Error('Appwrite is not configured. Set env vars before calling createStore.');
  }

  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_STORES_COLLECTION_ID,
    ID.unique(),
    {
      userId: params.userId,
      name: params.name,
      lowStockThreshold: params.lowStockThreshold,
    },
  );

  return docToStore(doc as unknown as Record<string, unknown>);
}

export async function getStore(userId: string): Promise<Store | null> {
  if (!isAppwriteConfigured) return null;

  const result = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_STORES_COLLECTION_ID,
    [Query.equal('userId', userId), Query.limit(1)],
  );

  if (result.documents.length === 0) return null;
  return docToStore(result.documents[0] as unknown as Record<string, unknown>);
}

export async function updateStore(
  storeId: string,
  params: Partial<{ name: string; lowStockThreshold: number }>,
): Promise<Store> {
  if (!isAppwriteConfigured) {
    throw new Error('Appwrite is not configured.');
  }

  const doc = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_STORES_COLLECTION_ID,
    storeId,
    params,
  );

  return docToStore(doc as unknown as Record<string, unknown>);
}
