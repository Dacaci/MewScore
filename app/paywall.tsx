import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Alert, ScrollView, Platform, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ score?: string; weaknesses?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userId, refreshUserData } = useAuth();

  const [offering, setOffering] = useState<PaywallOffering | null>(null);
  const [offeringLoading, setOfferingLoading] = useState(true);
  const [selected, setSelected] = useState<PurchaseType>('subscription');
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentScore = params.score ? parseFloat(params.score) : null;
  const potentialScore = currentScore ? Math.min(10, currentScore + 1.5) : null;
  const weaknessCount = params.weaknesses ? parseInt(params.weaknesses, 10) : 0;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();

    // Pulse loop on CTA
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim]);

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
        Alert.alert(t("paywall.purchaseError"), result.error ?? t("paywall.purchaseErrorDesc"));
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(t("paywall.generalError"), t("paywall.purchaseErrorDesc"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const subscriptionPrice = offering?.subscriptionPackage?.priceString ?? '4,99 €';
  const packPrice = offering?.packPackage?.priceString ?? '14,99 €';

  return (
    <ThemedView style={styles.container}>
      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={handleClose}>
        <View style={[styles.closeCircle, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
        </View>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
          {/* Hero: Score potentiel */}
          {currentScore && potentialScore ? (
            <View style={styles.heroSection}>
              <ThemedText style={styles.heroTitle}>
                {t("paywall.scoreCanGoUp")}
              </ThemedText>
              <View style={styles.heroScoreRow}>
                <View style={styles.heroScoreBlock}>
                  <Text style={[styles.heroScoreValue, { color: colors.textSecondary }]}>{currentScore.toFixed(1)}</Text>
                  <Text style={[styles.heroScoreLabel, { color: colors.textSecondary }]}>{t("paywall.current")}</Text>
                </View>
                <View style={[styles.heroArrow, { backgroundColor: colors.tint + '20' }]}>
                  <IconSymbol name="arrow.right" size={20} color={colors.tint} />
                </View>
                <View style={styles.heroScoreBlock}>
                  <Text style={[styles.heroScoreValue, { color: '#22c55e' }]}>{potentialScore.toFixed(1)}</Text>
                  <Text style={[styles.heroScoreLabel, { color: '#22c55e' }]}>{t("paywall.potential")}</Text>
                </View>
              </View>
              {weaknessCount > 0 && (
                <View style={[styles.heroInsight, { backgroundColor: '#ef4444' + '12' }]}>
                  <Text style={[styles.heroInsightText, { color: '#ef4444' }]}>
                    {t("paywall.weakPointsDetected", { count: weaknessCount })}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.heroSection}>
              <View style={[styles.iconBadge, { backgroundColor: colors.tint + '15' }]}>
                <IconSymbol name="star.fill" size={32} color={colors.tint} />
              </View>
              <ThemedText style={styles.heroTitle}>
                {t("paywall.unlockPotential")}
              </ThemedText>
              <ThemedText style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                {t("paywall.personalizedPlan")}
              </ThemedText>
            </View>
          )}

          {/* Guarantee badges */}
          <View style={styles.socialRow}>
            <View style={[styles.socialBadge, { backgroundColor: colors.success + '12' }]}>
              <IconSymbol name="checkmark.shield.fill" size={14} color={colors.success} />
              <Text style={[styles.socialText, { color: colors.success }]}>{t("paywall.securePayment")}</Text>
            </View>
            <View style={[styles.socialBadge, { backgroundColor: colors.tint + '12' }]}>
              <IconSymbol name="arrow.uturn.backward" size={14} color={colors.tint} />
              <Text style={[styles.socialText, { color: colors.tint }]}>{t("paywall.cancelAnytime")}</Text>
            </View>
          </View>

          {/* Preview premium - aperçu visuel */}
          <View style={[styles.previewCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <ThemedText style={styles.previewTitle}>{t("paywall.whatYouUnlock")}</ThemedText>
            <View style={styles.previewGrid}>
              <View style={styles.previewItem}>
                <View style={[styles.previewIcon, { backgroundColor: '#ef4444' + '15' }]}>
                  <Text style={styles.previewEmoji}>🎯</Text>
                </View>
                <Text style={[styles.previewLabel, { color: colors.text }]}>{t("paywall.limitingFactors")}</Text>
                <Text style={[styles.previewDesc, { color: colors.textSecondary }]}>{t("paywall.limitingFactorsDesc")}</Text>
              </View>
              <View style={styles.previewItem}>
                <View style={[styles.previewIcon, { backgroundColor: '#22c55e' + '15' }]}>
                  <Text style={styles.previewEmoji}>📈</Text>
                </View>
                <Text style={[styles.previewLabel, { color: colors.text }]}>{t("paywall.projections")}</Text>
                <Text style={[styles.previewDesc, { color: colors.textSecondary }]}>{t("paywall.projectionsDesc")}</Text>
              </View>
              <View style={styles.previewItem}>
                <View style={[styles.previewIcon, { backgroundColor: colors.tint + '15' }]}>
                  <Text style={styles.previewEmoji}>💡</Text>
                </View>
                <Text style={[styles.previewLabel, { color: colors.text }]}>{t("paywall.actionPlan")}</Text>
                <Text style={[styles.previewDesc, { color: colors.textSecondary }]}>{t("paywall.actionPlanDesc")}</Text>
              </View>
              <View style={styles.previewItem}>
                <View style={[styles.previewIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                  <Text style={styles.previewEmoji}>📊</Text>
                </View>
                <Text style={[styles.previewLabel, { color: colors.text }]}>{t("paywall.metrics8")}</Text>
                <Text style={[styles.previewDesc, { color: colors.textSecondary }]}>{t("paywall.metrics8Desc")}</Text>
              </View>
            </View>
          </View>

          {/* Pricing cards */}
          {offeringLoading ? (
            <View style={styles.loadingOffers}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : (
            <View style={styles.cardsRow}>
              {/* Subscription Card */}
              <Pressable
                style={[
                  styles.optionCard,
                  {
                    borderColor: selected === 'subscription' ? colors.tint : colors.border,
                    backgroundColor: selected === 'subscription'
                      ? colors.tint + '08'
                      : colors.backgroundSecondary,
                  },
                  selected === 'subscription' && styles.optionCardSelected,
                ]}
                onPress={() => setSelected('subscription')}
              >
                <View style={[styles.popularBadge, { backgroundColor: colors.tint }]}>
                  <Text style={styles.badgeText}>{t("paywall.recommended")}</Text>
                </View>
                <ThemedText style={styles.optionTitle}>{t("paywall.unlimited")}</ThemedText>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceOld, { color: colors.textSecondary }]}>9,99 €</Text>
                  <Text style={[styles.priceNew, { color: colors.text }]}>{subscriptionPrice}</Text>
                </View>
                <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>{t("paywall.perMonth")}</Text>
                <View style={styles.optionFeatures}>
                  <Text style={[styles.featureCheck, { color: colors.success }]}>{t("paywall.unlimitedScans")}</Text>
                  <Text style={[styles.featureCheck, { color: colors.success }]}>{t("paywall.detailedReports")}</Text>
                  <Text style={[styles.featureCheck, { color: colors.success }]}>{t("paywall.actionPlanFeature")}</Text>
                  <Text style={[styles.featureCheck, { color: colors.success }]}>{t("paywall.projectionFeature")}</Text>
                </View>
                <View style={[styles.radio, { borderColor: selected === 'subscription' ? colors.tint : colors.border }]}>
                  {selected === 'subscription' && (
                    <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />
                  )}
                </View>
              </Pressable>

              {/* Pack Card */}
              <Pressable
                style={[
                  styles.optionCard,
                  {
                    borderColor: selected === 'pack' ? colors.tint : colors.border,
                    backgroundColor: selected === 'pack'
                      ? colors.tint + '08'
                      : colors.backgroundSecondary,
                  },
                  selected === 'pack' && styles.optionCardSelected,
                ]}
                onPress={() => setSelected('pack')}
              >
                <View style={[styles.popularBadge, { backgroundColor: colors.textSecondary }]}>
                  <Text style={styles.badgeText}>{t("paywall.oneTime")}</Text>
                </View>
                <ThemedText style={styles.optionTitle}>{t("paywall.pack15")}</ThemedText>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceNew, { color: colors.text }]}>{packPrice}</Text>
                </View>
                <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>{t("paywall.onceOnly")}</Text>
                <View style={styles.optionFeatures}>
                  <Text style={[styles.featureCheck, { color: colors.success }]}>{t("paywall.scans15")}</Text>
                  <Text style={[styles.featureCheck, { color: colors.success }]}>{t("paywall.packReport")}</Text>
                </View>
                <View style={[styles.radio, { borderColor: selected === 'pack' ? colors.tint : colors.border }]}>
                  {selected === 'pack' && (
                    <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />
                  )}
                </View>
              </Pressable>
            </View>
          )}

          {/* Spacer */}
          <View style={{ height: 8 }} />
        </Animated.View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <Pressable
            style={[
              styles.ctaButton,
              { backgroundColor: loading || offeringLoading ? colors.textSecondary : colors.tint },
            ]}
            onPress={handlePurchase}
            disabled={loading || !selected || offeringLoading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <IconSymbol name="lock.open.fill" size={20} color="#FFFFFF" />
                <Text style={styles.ctaText}>
                  {selected === 'subscription' ? t("paywall.unlockUnlimited") : t("paywall.buy15Scans")}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
        <Pressable onPress={handleClose} style={styles.laterButton}>
          <Text style={[styles.laterText, { color: colors.textSecondary }]}>
            {t("paywall.later")}
          </Text>
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
    top: Layout.screenPaddingTop - 20,
    right: Layout.screenPaddingHorizontal,
    zIndex: 10,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: Layout.screenPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 180,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  heroScoreBlock: {
    alignItems: 'center',
  },
  heroScoreValue: {
    fontSize: 44,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  heroScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  heroArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInsight: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  heroInsightText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Social proof
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  socialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  // socialStars removed
  socialText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Preview
  previewCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewItem: {
    width: '47%',
    alignItems: 'center',
    gap: 6,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 22,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  // Pricing
  loadingOffers: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  optionCardSelected: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  popularBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  trialBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  trialText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceOld: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  priceNew: {
    fontSize: 26,
    fontWeight: '800',
  },
  pricePeriod: {
    fontSize: 12,
    marginBottom: 10,
    marginTop: 2,
  },
  optionFeatures: {
    alignSelf: 'stretch',
    gap: 5,
  },
  featureCheck: {
    fontSize: 12,
    fontWeight: '500',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // (guarantee moved to socialRow)
  // Sticky CTA
  stickyActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: 16,
    paddingBottom: 36,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    width: '100%',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  laterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
