import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, RefreshControl, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InsightsCard } from '@/components/analytics/insights-card';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAnalyticsFromUser, AnalyticsData } from '@/services/analytics-service';
import { getNextTierGoal } from '@/services/face-analysis-service';
import { getLastScan, formatScanDate, type LastScanData, resetProgression } from '@/services/scan-service';
import { TIER_INFO } from '@/types/firebase';

export default function ProgressionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userId, isAuthenticated, isLoading } = useAuth();

  const [lastScan, setLastScan] = useState<LastScanData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const isPremium = user?.isPremium ?? false;
  const totalScans = user?.totalScans ?? 0;

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const scan = await getLastScan(userId);
      setLastScan(scan ?? null);
    } catch {
      setLastScan(null);
    }
  }, [userId]);

  const baseAnalytics: AnalyticsData | null = user ? getAnalyticsFromUser(user) : null;
  const analytics: AnalyticsData | null = baseAnalytics
    ? { ...baseAnalytics, lastScore: lastScan?.pslRating ?? baseAnalytics.lastScore }
    : null;

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

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
            <IconSymbol name="chart.line.uptrend.xyaxis" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Ta progression
          </ThemedText>
          <ThemedText style={styles.description}>
            Connecte-toi pour suivre tes scans et ta progression
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

  if (totalScans === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.pageTitle}>
          Progression
        </ThemedText>
        <View style={[styles.centered, styles.emptyProgression]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            <IconSymbol name="camera.fill" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Pas encore de scan
          </ThemedText>
          <ThemedText style={styles.description}>
            Fais ton premier scan pour débloquer ta progression et tes statistiques
          </ThemedText>
          <Button
            title="Faire un scan"
            onPress={() => router.push('/scanner')}
            style={styles.button}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.pageTitle}>
        Progression
      </ThemedText>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
      >
        {lastScan && (lastScan.pslRating != null || lastScan.tier) && (
          <Pressable onPress={() => router.push('/(tabs)/history')} style={styles.lastScanCardWrap}>
            <Card style={styles.lastScanCard}>
              <View style={styles.lastScanRow}>
                <View>
                  <ThemedText style={[styles.lastScanLabel, { color: colors.textSecondary }]}>
                    Dernier scan
                  </ThemedText>
                  <Text style={[styles.lastScanScore, { color: lastScan.tier && TIER_INFO[lastScan.tier] ? TIER_INFO[lastScan.tier].color : colors.tint }]}>
                    {lastScan.pslRating != null ? lastScan.pslRating.toFixed(1) : '–'}/10
                  </Text>
                </View>
                <View style={styles.lastScanMeta}>
                  <ThemedText style={[styles.lastScanDate, { color: colors.textSecondary }]}>
                    {lastScan.createdAt ? formatScanDate(lastScan.createdAt) : '–'}
                  </ThemedText>
                  <ThemedText style={[styles.seeDetail, { color: colors.tint }]}>
                    Voir le détail →
                  </ThemedText>
                </View>
              </View>
            </Card>
          </Pressable>
        )}

        {/* Objectif : prochain palier (Premium uniquement) */}
        {isPremium && lastScan?.pslRating != null && (() => {
          const goal = getNextTierGoal(lastScan.pslRating);
          if (!goal) {
            return (
              <Card style={styles.goalCard}>
                <ThemedText style={[styles.goalTitle, { color: colors.text }]}>
                  Tu es au top !
                </ThemedText>
                <ThemedText style={[styles.goalText, { color: colors.textSecondary }]}>
                  Palier max atteint ({lastScan.pslRating.toFixed(1)}/10). Continue comme ça.
                </ThemedText>
              </Card>
            );
          }
          const tierColor = TIER_INFO[goal.nextTier]?.color ?? colors.tint;
          return (
            <Card style={styles.goalCard}>
              <ThemedText style={[styles.goalTitle, { color: colors.text }]}>
                Prochain palier
              </ThemedText>
              <ThemedText style={[styles.goalText, { color: colors.textSecondary }]}>
                Dernier score : <ThemedText style={[styles.goalBold, { color: colors.text }]}>{lastScan.pslRating.toFixed(1)}/10</ThemedText>.
                Prochain palier ({goal.label}) : <Text style={[styles.goalHighlight, { color: tierColor }]}>{goal.nextMin}</Text>/10
                {' '}→ il te manque <Text style={[styles.goalHighlight, { color: tierColor }]}>{goal.gap.toFixed(1)}</Text> point{goal.gap > 1 ? 's' : ''}.
              </ThemedText>
            </Card>
          );
        })()}

        {isPremium && analytics && (
          <View style={styles.insightsContainer}>
            <InsightsCard analytics={analytics} isPremium={isPremium} />
          </View>
        )}

        {!isPremium && (
          <Pressable onPress={() => router.push('/paywall')} style={styles.premiumWrap}>
            <ThemedText style={[styles.premiumLink, { color: colors.tint }]}>
              Passer Premium pour débloquer les statistiques
            </ThemedText>
          </Pressable>
        )}

        {/* Reset progression - Premium only */}
        {isPremium && (
          <Pressable
            onPress={() => {
              Alert.alert(
                'Réinitialiser ma progression',
                'Cette action supprimera tous tes scans et statistiques. Cette action est irréversible.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: async () => {
                      if (userId) {
                        const result = await resetProgression(userId);
                        if (result.success) {
                          setLastScan(null);
                          Alert.alert('Progression réinitialisée', 'Tes données ont été supprimées.');
                        } else {
                          Alert.alert('Erreur', result.error ?? 'Impossible de réinitialiser. Réessaie plus tard.');
                        }
                      }
                    },
                  },
                ]
              );
            }}
            style={styles.resetButton}
          >
            <IconSymbol name="trash.fill" size={16} color={colors.error} />
            <ThemedText style={[styles.resetText, { color: colors.error }]}>
              Réinitialiser ma progression
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    paddingTop: Layout.screenPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  emptyProgression: {
    flex: 1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    minWidth: 200,
  },
  lastScanCardWrap: {
    width: '100%',
    marginBottom: 16,
  },
  goalCard: {
    padding: 16,
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    lineHeight: 22,
  },
  goalBold: {
    fontWeight: '600',
  },
  goalHighlight: {
    fontWeight: '700',
  },
  lastScanCard: {
    padding: 16,
  },
  lastScanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastScanLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  lastScanScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  lastScanMeta: {
    alignItems: 'flex-end',
  },
  lastScanDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  seeDetail: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  premiumWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  premiumLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
