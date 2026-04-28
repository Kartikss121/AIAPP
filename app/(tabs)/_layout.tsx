import { useAuth } from '@clerk/expo';
import { Redirect, Tabs, useRouter } from 'expo-router';
import React from 'react';

import { CustomTabBar } from '@/components/ui/CustomTabBar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#0B0714' }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen
          name="create"
          options={{ title: 'Generate' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.navigate('/generate');
            },
          }}
        />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      </Tabs>
    </SafeAreaView>
  );
}
