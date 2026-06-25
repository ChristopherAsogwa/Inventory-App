import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';
import '@/global.css';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  // Signed-in users go to the tab shell; the tab layout's Zustand guard
  // handles the onboarding redirect if the store isn't set up yet.
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
