import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, isLoading } = useAuth();

  const isPremium = user?.isPremium ?? false;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            <IconSymbol name="clock.fill" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Connectez-vous
          </ThemedText>
          <ThemedText style={styles.description}>
            Connectez-vous pour acceder a votre historique
          </ThemedText>
          <Button
            title="Se connecter"
            onPress={() => router.push('/(auth)/login')}
            style={styles.button}
          />
        </View>
      </ThemedView>
    );
  }

  if (!isPremium) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            <IconSymbol name="lock.fill" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Fonctionnalite Premium
          </ThemedText>
          <ThemedText style={styles.description}>
            L&apos;historique de vos scans est reserve aux membres Premium. Passez a Premium pour
            debloquer cette fonctionnalite.
          </ThemedText>
          <Button
            title="Passer Premium"
            onPress={() => router.push('/paywall')}
            style={styles.button}
          />
        </View>
      </ThemedView>
    );
  }

  // Premium user - show history (placeholder for now)
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.pageTitle}>
        Historique
      </ThemedText>
      <View style={styles.emptyState}>
        <IconSymbol name="clock.fill" size={48} color={colors.icon} />
        <ThemedText style={styles.emptyText}>Aucun scan pour le moment</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Vos analyses apparaitront ici apres votre premier scan
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
  },
  pageTitle: {
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: 'center',
  },
});
