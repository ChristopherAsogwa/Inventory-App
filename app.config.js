const appJson = require('./app.json')

export default {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      appwriteEndpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
      appwriteDatabaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      appwriteProductsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID,
      appwriteSalesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SALES_COLLECTION_ID,
      appwriteStoresCollectionId: process.env.EXPO_PUBLIC_APPWRITE_STORES_COLLECTION_ID,
      appwriteSuppliersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SUPPLIERS_COLLECTION_ID,
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
  },
}
