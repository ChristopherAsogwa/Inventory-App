import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import '@/global.css';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '../src/config/posthog';
import { useStoreStore } from '../src/store/useStoreStore';
import AnimatedSplash from '../src/components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Add your Clerk Publishable Key to the .env file (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)',
  );
}

function RootLayoutContent() {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const { isLoaded: storeLoaded, load } = useStoreStore();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);
  const [splashDone, setSplashDone] = useState(false);

  // Load persisted store state once the user is known to be signed in
  useEffect(() => {
    if (authLoaded && isSignedIn && !storeLoaded) {
      load(userId ?? undefined);
    } else if (authLoaded && !isSignedIn && !storeLoaded) {
      // Mark as loaded even if not signed in so the splash screen hides
      load();
    }
  }, [authLoaded, isSignedIn, storeLoaded, load, userId]);

  // PostHog screen tracking — sanitise params so we never leak sensitive data
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      const sanitizedParams = Object.keys(params).reduce(
        (acc, key) => {
          if (['id', 'tab', 'view'].includes(key)) {
            acc[key] = params[key];
          }
          return acc;
        },
        {} as Record<string, string | string[]>,
      );

      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...sanitizedParams,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded && authLoaded && storeLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoaded, storeLoaded]);

  if (!fontsLoaded || !authLoaded || !storeLoaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
      }}
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <RootLayoutContent />
      </ClerkProvider>
    </PostHogProvider>
  );
}
