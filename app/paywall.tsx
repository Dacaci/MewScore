import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PREMIUM_FEATURES = [
  'Scans illimites',
  'Historique complet de vos analyses',
  'Scores detailles par categorie',
  'Comparaison avec votre percentile',
  'Conseils personnalises',
];

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSubscribe = () => {
    // TODO: Implement in-app purchase
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Passez Premium
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Debloquez toutes les fonctionnalites
        </ThemedText>
      </View>

      <Card style={styles.featuresCard}>
        {PREMIUM_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={[styles.checkmark, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.checkmarkText}>✓</ThemedText>
            </View>
            <ThemedText style={styles.featureText}>{feature}</ThemedText>
          </View>
        ))}
      </Card>

      <View style={styles.pricing}>
        <ThemedText type="title" style={styles.price}>
          4,99 €
        </ThemedText>
        <ThemedText style={styles.period}>/ mois</ThemedText>
      </View>

      <View style={styles.actions}>
        <Button title="S'abonner" onPress={handleSubscribe} style={styles.subscribeButton} />
        <Button title="Plus tard" variant="outline" onPress={handleClose} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  featuresCard: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 32,
  },
  price: {
    fontSize: 48,
  },
  period: {
    fontSize: 18,
    opacity: 0.7,
    marginLeft: 4,
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 32,
    gap: 12,
  },
  subscribeButton: {
    marginBottom: 8,
  },
});
