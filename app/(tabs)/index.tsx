import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScannerButton } from '@/components/home/scanner-button';
import { ScansRemaining } from '@/components/home/scans-remaining';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, isLoading } = useAuth();

  const scansRemaining = user?.scansRemaining ?? 0;
  const isPremium = user?.isPremium ?? false;

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
    if (!isAuthenticated) {
      return 'Bienvenue';
    }
    const email = user?.email ?? '';
    const name = email.split('@')[0];
    return `Bonjour, ${name}`;
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.greeting}>
          {getGreeting()}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isAuthenticated ? 'Pret pour votre analyse ?' : 'Connectez-vous pour commencer'}
        </ThemedText>
      </View>

      <View style={styles.scannerContainer}>
        <ScannerButton
          onPress={handleScanPress}
          disabled={!isAuthenticated || (scansRemaining === 0 && !isPremium)}
        />
      </View>

      {isAuthenticated ? (
        <View style={styles.footer}>
          <ScansRemaining scansRemaining={scansRemaining} isPremium={isPremium} />

          {!isPremium && (
            <Pressable onPress={() => router.push('/paywall')}>
              <ThemedText style={[styles.premiumLink, { color: colors.tint }]}>
                Passer Premium
              </ThemedText>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.footer}>
          <Button
            title="Se connecter"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <ThemedText style={[styles.premiumLink, { color: colors.tint }]}>
              Creer un compte
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  greeting: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
    gap: 16,
  },
  premiumLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    minWidth: 200,
  },
});
