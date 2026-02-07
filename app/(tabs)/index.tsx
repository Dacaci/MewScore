import { Pressable, StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScannerButton } from '@/components/home/scanner-button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, isLoading } = useAuth();

  const scansRemaining = user?.scansRemaining ?? 0;
  const isPremium = user?.isPremium ?? false;
  const canScan = isAuthenticated && (scansRemaining > 0 || isPremium);

  const handleScanPress = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    if (scansRemaining === 0 && !isPremium) {
      router.push('/paywall');
      return;
    }

    router.push('/scanner');
  };

  const getGreeting = () => {
    if (!isAuthenticated) return 'Bienvenue';
    const name = (user?.email ?? '').split('@')[0];
    return name ? `Bonjour, ${name}` : 'Bonjour';
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.greeting}>
            {getGreeting()}
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>
            Analyse ton visage, reçois des conseils personnalisés
          </ThemedText>
          {isAuthenticated && (
            <View style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.badgeText, { color: colors.textSecondary }]}>
                {isPremium ? 'Scans illimités' : `${scansRemaining} scan${scansRemaining > 1 ? 's' : ''} restant${scansRemaining > 1 ? 's' : ''}`}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.scannerSection}>
          <View style={[styles.scannerRing, { borderColor: colors.tint + '40' }]}>
            <ScannerButton
              onPress={handleScanPress}
              disabled={isAuthenticated && !canScan}
            />
          </View>
          {!isAuthenticated ? (
            <ThemedText style={[styles.ctaLabel, { color: colors.text }]}>
              Connecte-toi pour lancer un scan
            </ThemedText>
          ) : canScan ? (
            <ThemedText style={[styles.ctaLabel, { color: colors.text }]}>
              Appuie pour analyser
            </ThemedText>
          ) : (
            <Pressable onPress={() => router.push('/paywall')}>
              <ThemedText style={[styles.ctaLabel, { color: colors.tint }]}>
                Plus de scans ? Passer Premium
              </ThemedText>
            </Pressable>
          )}
        </View>

        {!isAuthenticated && (
          <View style={styles.footer}>
            <Button
              title="Se connecter"
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginButton}
            />
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <ThemedText style={[styles.footerLinkText, { color: colors.tint }]}>
                Créer un compte
              </ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Layout.screenPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scannerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  scannerRing: {
    padding: 12,
    borderRadius: 94,
    borderWidth: 2,
    marginBottom: 20,
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 260,
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  footerLinkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    minWidth: 220,
  },
});
