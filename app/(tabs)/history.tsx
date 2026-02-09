import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScoreGrid } from '@/components/result/score-grid';
import { FacialMetricsCard } from '@/components/result/facial-metrics-card';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getLastScan, LastScanData } from '@/services/scan-service';
import { TIER_INFO } from '@/types/firebase';

export default function ConseilsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userId, isAuthenticated, isLoading } = useAuth();

  const [lastScan, setLastScan] = useState<LastScanData | null>(null);
  const [isLoadingScan, setIsLoadingScan] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLooksmaxingIndex, setExpandedLooksmaxingIndex] = useState<number | null>(null);

  const isPremium = user?.isPremium ?? false;

  const loadLastScan = useCallback(async () => {
    if (!userId) return;

    try {
      const scan = await getLastScan(userId);
      setLastScan(scan);
    } catch (error) {
      console.error('Error loading last scan:', error);
    } finally {
      setIsLoadingScan(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLastScan();
    } else {
      setIsLoadingScan(false);
    }
  }, [isAuthenticated, loadLastScan]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLastScan();
    setRefreshing(false);
  }, [loadLastScan]);

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
            <IconSymbol name="list.bullet.clipboard.fill" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Connecte-toi
          </ThemedText>
          <ThemedText style={styles.description}>
            Connecte-toi pour accéder à tes conseils personnalisés
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

  if (isLoadingScan) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.pageTitle}>
          Dernier scan
        </ThemedText>
        <View style={styles.centered}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!lastScan) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.pageTitle}>
          Dernier scan
        </ThemedText>
        <View style={styles.emptyState}>
          <IconSymbol name="camera.fill" size={48} color={colors.icon} />
          <ThemedText style={styles.emptyText}>Pas encore de scan</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Fais ton premier scan pour recevoir des conseils personnalisés
          </ThemedText>
          <Button
            title="Faire un scan"
            onPress={() => router.push('/scanner')}
            style={styles.scanButton}
          />
        </View>
      </ThemedView>
    );
  }

  const weaknessCount = lastScan.weaknesses?.length ?? 0;

  // Composant pour card verrouillee
  const LockedCard = ({ icon, iconColor, title, showBadge }: { icon: string; iconColor: string; title: string; showBadge?: boolean }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeaderLocked}>
        <View style={styles.cardHeaderLeft}>
          <IconSymbol name={icon as any} size={20} color={iconColor} />
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        </View>
        <View style={styles.lockBadge}>
          <ThemedText style={styles.lockIcon}>🔒</ThemedText>
        </View>
      </View>
      {showBadge && weaknessCount > 0 && (
        <View style={styles.problemsBadge}>
          <ThemedText style={styles.problemsBadgeText}>{weaknessCount} problèmes trouvés</ThemedText>
        </View>
      )}
    </Card>
  );

  // UTILISATEUR GRATUIT: Afficher contenu verrouille mais attractif
  if (!isPremium) {
    const tierInfo = lastScan?.tier ? TIER_INFO[lastScan.tier] : null;

    return (
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.pageTitle}>
            Dernier scan
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Mes conseils basés sur mon dernier scan
          </ThemedText>

          {/* Score Card - Visible pour tous */}
          {lastScan && (lastScan.pslRating != null || lastScan.tier) && (
            <Card style={styles.scoreCard}>
              <ThemedText style={styles.scoreLabel}>Ton score</ThemedText>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreValue, { color: tierInfo?.color ?? colors.tint }]}>
                  {lastScan.pslRating != null ? lastScan.pslRating.toFixed(1) : '–'}
                </Text>
                <Text style={[styles.scoreMax, { color: colors.text }]}>/10</Text>
              </View>
              {lastScan.tier && tierInfo && (
                <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
                  <Text style={styles.tierBadgeText}>{tierInfo.label}</Text>
                </View>
              )}
            </Card>
          )}

          {/* Scores détaillés - Verrouillés */}
          {lastScan?.detailedScores && (
            <ScoreGrid
              scores={lastScan.detailedScores}
              locked
              onUnlockPress={() => router.push('/paywall')}
            />
          )}

          {/* Cards verrouilees avec infos attractives */}
          <LockedCard icon="checkmark.circle.fill" iconColor="#22c55e" title="Tes points forts" />
          <LockedCard icon="exclamationmark.triangle.fill" iconColor="#f97316" title="À améliorer" showBadge />
          <LockedCard icon="lightbulb.fill" iconColor="#3B82F6" title="Conseils personnalisés" />
          <LockedCard icon="sparkles" iconColor="#8b5cf6" title="Conseils looksmaxing" />
          <LockedCard icon="chart.line.uptrend.xyaxis" iconColor="#06b6d4" title="Métriques faciales" />

          {/* Bouton Premium */}
          <Pressable
            onPress={() => router.push('/paywall')}
            style={[styles.premiumButton, { backgroundColor: colors.tint }]}
          >
            <ThemedText style={styles.premiumButtonText}>
              Débloquer tous mes conseils
            </ThemedText>
          </Pressable>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ThemedView>
    );
  }

  // UTILISATEUR PREMIUM: Afficher tout le contenu
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
      >
        <ThemedText type="title" style={styles.pageTitle}>
          Dernier scan
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Mes conseils basés sur mon dernier scan
        </ThemedText>

        {/* Carte score + tier (comme sur l'écran Résultat) */}
        {(lastScan.pslRating != null || lastScan.tier) && (
          <Card style={styles.scoreCard}>
            <ThemedText style={styles.scoreLabel}>Ton score</ThemedText>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: (lastScan.tier && TIER_INFO[lastScan.tier]) ? TIER_INFO[lastScan.tier].color : colors.tint }]}>
                {lastScan.pslRating != null ? lastScan.pslRating.toFixed(1) : '–'}
              </Text>
              <Text style={[styles.scoreMax, { color: colors.text }]}>/10</Text>
            </View>
            {lastScan.tier && TIER_INFO[lastScan.tier] && (
              <View style={[styles.tierBadge, { backgroundColor: TIER_INFO[lastScan.tier].color }]}>
                <Text style={styles.tierBadgeText}>{TIER_INFO[lastScan.tier].label}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Grille de scores (ronds avec jauges) - même que sur l'écran Résultat */}
        {lastScan.detailedScores && (
          <ScoreGrid scores={lastScan.detailedScores} />
        )}

        {/* Résumé Gemini (sauvegardé avec le scan) */}
        {lastScan.summary && lastScan.summary.trim() && (
          <Card style={styles.card}>
            <View style={styles.summaryHeader}>
              <Text style={styles.aiIcon}>✨</Text>
              <ThemedText style={styles.sectionTitle}>Résumé</ThemedText>
            </View>
            <ThemedText style={styles.summaryText}>{lastScan.summary}</ThemedText>
          </Card>
        )}

        {/* Points forts - meme style que result */}
        {lastScan.strengths && lastScan.strengths.length > 0 && (
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Tes points forts</ThemedText>
            {lastScan.strengths.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.greenIcon}>✓</Text>
                <ThemedText style={styles.listText}>{item}</ThemedText>
              </View>
            ))}
          </Card>
        )}

        {/* A ameliorer - meme style que result */}
        {lastScan.weaknesses && lastScan.weaknesses.length > 0 && (
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>À améliorer</ThemedText>
            {lastScan.weaknesses.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.redIcon}>✗</Text>
                <ThemedText style={styles.listText}>{item}</ThemedText>
              </View>
            ))}
          </Card>
        )}

        {/* Conseils pour progresser - meme style que result (liste numerotee, pas de coches) */}
        {lastScan.improvements && lastScan.improvements.length > 0 && (
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Conseils pour progresser</ThemedText>
            {lastScan.improvements.map((item, index) => (
              <View key={index} style={styles.improvementItem}>
                <View style={styles.improvementNumber}>
                  <Text style={styles.improvementNumberText}>{index + 1}</Text>
                </View>
                <ThemedText style={styles.improvementText}>{item}</ThemedText>
              </View>
            ))}
          </Card>
        )}

        {/* Conseils looksmaxing (Gemini) - déroulants */}
        {lastScan.looksmaxingTips && lastScan.looksmaxingTips.length > 0 && (
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Conseils looksmaxing</ThemedText>
            {lastScan.looksmaxingTips.map((tip, index) => {
              const isExpanded = expandedLooksmaxingIndex === index;
              return (
                <Pressable
                  key={index}
                  style={[styles.conseilRow, isExpanded && styles.conseilRowExpanded]}
                  onPress={() => setExpandedLooksmaxingIndex(isExpanded ? null : index)}
                >
                  <View style={styles.conseilRowHeader}>
                    <ThemedText style={styles.looksmaxingTitle}>{tip.title}</ThemedText>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </View>
                  {isExpanded && (
                    <ThemedText style={[styles.improvementText, { color: colors.textSecondary }]}>
                      {tip.description}
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}
          </Card>
        )}

        {/* Métriques faciales (dernier scan) */}
        {lastScan.landmarkMetrics && (
          <FacialMetricsCard
            metrics={lastScan.landmarkMetrics}
            metricDescriptions={lastScan.metricDescriptions}
            colors={colors}
          />
        )}

        {/* Analyse detaillee */}
        {lastScan.rawAttributes && (
          <Pressable
            style={styles.detailButton}
            onPress={() => router.push({
              pathname: '/analysis',
              params: {
                rawAttributes: JSON.stringify(lastScan.rawAttributes),
                pslRating: lastScan.pslRating?.toString() ?? '5',
                tier: lastScan.tier ?? 'mtn',
              },
            })}
          >
            <ThemedText style={styles.detailButtonText}>
              Voir l'analyse détaillée
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#3B82F6" />
          </Pressable>
        )}

        {/* Refaire un scan */}
        <View style={styles.actions}>
          <Button
            title="Refaire un scan"
            onPress={() => router.push('/scanner')}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.6,
    marginBottom: 20,
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
    marginBottom: 16,
  },
  scanButton: {
    marginTop: 8,
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: Layout.sectionGap,
    padding: Layout.cardPadding,
  },
  scoreLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 20,
    opacity: 0.5,
    marginLeft: 4,
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  tierBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    marginBottom: Layout.sectionGap,
    padding: Layout.cardPadding,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardHeaderLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 10,
  },
  greenIcon: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '700',
    width: 20,
  },
  redIcon: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
    width: 20,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  improvementNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  improvementNumberText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  improvementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiIcon: {
    fontSize: 18,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
  },
  conseilRow: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.12)',
  },
  conseilRowExpanded: {
    paddingBottom: 12,
  },
  conseilRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  looksmaxingTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  lockBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockIcon: {
    fontSize: 16,
  },
  problemsBadge: {
    backgroundColor: '#ef4444',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  problemsBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  unlockButton: {
    marginTop: 16,
  },
  premiumButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  detailButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
