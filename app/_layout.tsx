import { useEffect } from 'react';
import { ThemeProvider as NavigationThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { OnboardingProvider } from '@/contexts/onboarding-context';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { initRevenueCat } from '@/services/revenuecat-init';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Navigation themes
const LightNavigationTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.tint,
  },
};

const DarkNavigationTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.tint,
  },
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
      if (!inOnboarding && !inAuth) {
        router.replace('/onboarding');
      }
    } else {
      if (inOnboarding || inAuth) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

function RootLayoutContent() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    initRevenueCat();
  }, []);

  return (
    <NavigationThemeProvider value={isDark ? DarkNavigationTheme : LightNavigationTheme}>
      <NavigationGuard />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
