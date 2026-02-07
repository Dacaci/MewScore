import { useEffect } from 'react';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { OnboardingProvider } from '@/contexts/onboarding-context';
import { initRevenueCat } from '@/services/revenuecat-init';

// Theme sombre personnalise base sur DarkTheme pour avoir les fonts
const MewScoreTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: '#D4AF37',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#2C2C2E',
    notification: '#D4AF37',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === '(auth)';

    if (!isAuthenticated) {
      // Utilisateur non connecte → onboarding (sauf s'il y est deja ou sur auth)
      if (!inOnboarding && !inAuth) {
        router.replace('/onboarding');
      }
    } else {
      // Utilisateur connecte → aller aux tabs si sur onboarding/auth
      if (inOnboarding || inAuth) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

function RootLayoutContent() {
  useEffect(() => {
    initRevenueCat();
  }, []);

  return (
    <ThemeProvider value={MewScoreTheme}>
      <NavigationGuard />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="scanner" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="result" options={{ headerShown: false }} />
        <Stack.Screen name="analysis" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </OnboardingProvider>
  );
}
