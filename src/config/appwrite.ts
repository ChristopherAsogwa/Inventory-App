import { Client, Databases, ID, Query } from 'appwrite';
import Constants from 'expo-constants';

const endpoint = (Constants.expoConfig?.extra?.appwriteEndpoint as string) ?? '';
const projectId = (Constants.expoConfig?.extra?.appwriteProjectId as string) ?? '';

export const APPWRITE_DATABASE_ID =
  (Constants.expoConfig?.extra?.appwriteDatabaseId as string) ?? '';
export const APPWRITE_STORES_COLLECTION_ID =
  (Constants.expoConfig?.extra?.appwriteStoresCollectionId as string) ?? '';
export const APPWRITE_PRODUCTS_COLLECTION_ID =
  (Constants.expoConfig?.extra?.appwriteProductsCollectionId as string) ?? '';
export const APPWRITE_SALES_COLLECTION_ID =
  (Constants.expoConfig?.extra?.appwriteSalesCollectionId as string) ?? '';
export const APPWRITE_SUPPLIERS_COLLECTION_ID =
  (Constants.expoConfig?.extra?.appwriteSuppliersCollectionId as string) ?? '';

export const isAppwriteConfigured = !!(endpoint && projectId);

const client = new Client();

if (isAppwriteConfigured) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const databases = new Databases(client);
export { ID, Query };
export default client;
