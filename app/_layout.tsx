import { ThemeProvider } from '@/context/ThemeContext';
import { tokenCache } from '@/utils/tokenCache';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, LogBox, View } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import 'react-native-reanimated';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
}

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  'new NativeEventEmitter()',
]);

// Filter out noisy NativeEventEmitter warnings from the terminal console
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('new NativeEventEmitter()')) {
    return;
  }
  originalWarn(...args);
};

// Initialize AdMob once at the top level
mobileAds()
  .setRequestConfiguration({
    testDeviceIdentifiers: ['EMULATOR'],
  })
  .then(() => {
    console.log('AdMob: Test device configured');
    return mobileAds().initialize();
  })
  .catch((error) => {
    console.error('AdMob initialization error:', error);
  });

function InitialLayout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { isLoaded } = useAuth();
  const isReady = loaded && isLoaded;

  useEffect(() => {
    if (isReady) {
      // Delay ensures navigation + layout fully ready
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0714' }}>
      {isReady ? (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="generate" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="category" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      ) : (
        // fallback UI behind splash (prevents black flash)
        <View
          style={{
            flex: 1,
            backgroundColor: '#0B0714',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color="#7C3AED" />
        </View>
      )}
    </View>
  );
}

import { AlertProvider } from '@/context/AlertContext';
import { RewardedAdProvider } from '@/context/RewardedAdContext';

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AlertProvider>
            <RewardedAdProvider>
              <InitialLayout />
            </RewardedAdProvider>
          </AlertProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
