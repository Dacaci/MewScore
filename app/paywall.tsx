import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import {
  getOfferings,
  purchaseSubscription,
  purchasePack,
  type PaywallOffering,
} from '@/services/payment-service';

type PurchaseType = 'subscription' | 'pack' | null;

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userId, refreshUserData } = useAuth();

  const [offering, setOffering] = useState<PaywallOffering | null>(null);
  const [offeringLoading, setOfferingLoading] = useState(true);
  const [selected, setSelected] = useState<PurchaseType>('subscription');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOfferings().then((result) => {
      if (!cancelled) {
        setOffering(result ?? null);
        setOfferingLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setOfferingLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handlePurchase = async () => {
    if (!userId || !selected || loading) return;

    const pkg = selected === 'subscription'
      ? offering?.subscriptionPackage?.package ?? null
      : offering?.packPackage?.package ?? null;

    setLoading(true);
    try {
      const result = selected === 'subscription'
        ? await purchaseSubscription(userId, pkg)
        : await purchasePack(userId, pkg);
      if (result.success) {
        await refreshUserData();
        router.back();
      } else if (!result.userCancelled) {
        Alert.alert('Achat impossible', result.error ?? 'Une erreur est survenue. Réessaie plus tard.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessaie plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const subscriptionPrice = offering?.subscriptionPackage?.priceString ?? '4,99 €';
  const packPrice = offering?.packPackage?.priceString ?? '9,99 €';

  const features = [
    { icon: 'infinity', label: 'Scans illimités', desc: 'Analyse ton visage autant que tu veux' },
    { icon: 'doc.text.fill', label: 'Rapports détaillés', desc: 'Accède à toutes les métriques' },
    { icon: 'lightbulb.fill', label: 'Conseils personnalisés', desc: 'Reçois des recommandations adaptées' },
    { icon: 'chart.line.uptrend.xyaxis', label: 'Suivi progression', desc: 'Visualise ton évolution' },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={handleClose}>
        <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: colors.tint + '15' }]}>
            <IconSymbol name="star.fill" size={32} color={colors.tint} />
          </View>
          <ThemedText style={styles.title}>
            Passe à Premium
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Débloquer tout le potentiel de MewScore
          </ThemedText>
        </View>

        {/* Features list */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.tint + '15' }]}>
                <IconSymbol name={feature.icon as any} size={20} color={colors.tint} />
              </View>
              <View style={styles.featureText}>
                <ThemedText style={styles.featureLabel}>{feature.label}</ThemedText>
                <ThemedText style={[styles.featureDesc, { color: colors.textSecondary }]}>
                  {feature.desc}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {offeringLoading ? (
          <View style={styles.loadingOffers}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={[styles.loadingOffersText, { color: colors.textSecondary }]}>
              Chargement des offres...
            </ThemedText>
          </View>
        ) : (
          <View style={styles.cardsRow}>
            {/* Subscription Card */}
            <Pressable
              style={[
                styles.optionCardSide,
                {
                  borderColor: selected === 'subscription' ? colors.tint : colors.border,
                  backgroundColor: selected === 'subscription'
                    ? colors.tint + '08'
                    : colors.backgroundSecondary,
                },
              ]}
              onPress={() => setSelected('subscription')}
            >
              <View style={[styles.popularBadge, { backgroundColor: colors.tint }]}>
                <Text style={styles.popularText}>Populaire</Text>
              </View>
              <ThemedText style={styles.optionTitleCenter}>Abonnement</ThemedText>
              <View style={styles.priceRow}>
                <Text style={[styles.optionPriceBig, { color: colors.text }]}>{subscriptionPrice}</Text>
                <Text style={[styles.optionPeriod, { color: colors.textSecondary }]}>/mois</Text>
              </View>
              <View style={styles.featuresList}>
                <Text style={[styles.featureItem, { color: colors.success }]}>✓ Scans illimités</Text>
                <Text style={[styles.featureItem, { color: colors.success }]}>✓ Rapports détaillés</Text>
                <Text style={[styles.featureItem, { color: colors.success }]}>✓ Conseils personnalisés</Text>
                <Text style={[styles.featureItem, { color: colors.success }]}>✓ Suivi progression</Text>
              </View>
              <View style={[styles.radioIndicator, { borderColor: selected === 'subscription' ? colors.tint : colors.border }]}>
                {selected === 'subscription' && (
                  <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />
                )}
              </View>
            </Pressable>

            {/* One-Time Pack Card */}
            <Pressable
              style={[
                styles.optionCardSide,
                {
                  borderColor: selected === 'pack' ? colors.tint : colors.border,
                  backgroundColor: selected === 'pack'
                    ? colors.tint + '08'
                    : colors.backgroundSecondary,
                },
              ]}
              onPress={() => setSelected('pack')}
            >
              <View style={[styles.packBadge, { backgroundColor: colors.textSecondary }]}>
                <Text style={styles.popularText}>Unique</Text>
              </View>
              <ThemedText style={styles.optionTitleCenter}>Pack 15 scans</ThemedText>
              <View style={styles.priceRow}>
                <Text style={[styles.optionPriceBig, { color: colors.text }]}>{packPrice}</Text>
              </View>
              <View style={styles.featuresList}>
                <Text style={[styles.featureItem, { color: colors.success }]}>✓ 15 scans</Text>
                <Text style={[styles.featureItem, { color: colors.success }]}>✓ Rapports détaillés</Text>
                <Text style={[styles.featureItem, { color: colors.success }]}>✓ Conseils inclus</Text>
                <Text style={[styles.featureItem, { color: colors.textSecondary }]}>Sans engagement</Text>
              </View>
              <View style={[styles.radioIndicator, { borderColor: selected === 'pack' ? colors.tint : colors.border }]}>
                {selected === 'pack' && (
                  <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />
                )}
              </View>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actions, { backgroundColor: colors.background }]}>
        <Button
          title={loading ? 'Traitement...' : (selected === 'subscription' ? "S'abonner" : 'Acheter le pack')}
          onPress={handlePurchase}
          disabled={loading || !selected || offeringLoading}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={styles.loadingIndicator}
          />
        )}
        <Pressable onPress={handleClose} style={styles.laterButton}>
          <ThemedText style={[styles.laterText, { color: colors.textSecondary }]}>
            Plus tard
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Layout.screenPaddingTop,
    right: Layout.screenPaddingHorizontal,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: Layout.screenPaddingTop + 20,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 160,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 32,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
  },
  loadingOffers: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    minHeight: 150,
  },
  loadingOffersText: {
    fontSize: 14,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCardSide: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  optionTitleCenter: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  popularBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  packBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  optionPriceBig: {
    fontSize: 24,
    fontWeight: '700',
  },
  optionPeriod: {
    fontSize: 12,
    marginLeft: 2,
  },
  featuresList: {
    alignSelf: 'stretch',
    gap: 6,
  },
  featureItem: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  laterText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
