import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Deconnexion', 'Voulez-vous vraiment vous deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Deconnecter',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Erreur', 'Impossible de se deconnecter');
          }
        },
      },
    ]);
  };

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
            <IconSymbol name="person.fill" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Non connecte
          </ThemedText>
          <ThemedText style={styles.description}>
            Connectez-vous pour acceder a votre profil et vos parametres
          </ThemedText>
          <Button
            title="Se connecter"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.pageTitle}>
        Profil
      </ThemedText>

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.tint + '20' }]}>
          <IconSymbol name="person.fill" size={32} color={colors.tint} />
        </View>
        <ThemedText type="subtitle" style={styles.email}>
          {user?.email}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: user?.isPremium ? colors.tint : colors.icon + '30' }]}>
          <ThemedText style={[styles.badgeText, { color: user?.isPremium ? '#fff' : colors.text }]}>
            {user?.isPremium ? 'Premium' : 'Gratuit'}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Scans restants</ThemedText>
          <ThemedText type="defaultSemiBold">
            {user?.isPremium ? 'Illimite' : `${user?.scansRemaining ?? 0}/3`}
          </ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Statut</ThemedText>
          <ThemedText type="defaultSemiBold">
            {user?.isPremium ? 'Premium' : 'Gratuit'}
          </ThemedText>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button title="Se deconnecter" variant="outline" onPress={handleLogout} />
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
    lineHeight: 22,
    marginBottom: 24,
  },
  loginButton: {
    minWidth: 200,
  },
  pageTitle: {
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  email: {
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    opacity: 0.7,
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 32,
  },
});
