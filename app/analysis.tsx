import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { FacePPAttributes, LandmarkMetrics, TIER_INFO, PSLTier } from '@/types/firebase';
import {
  analyzeLooksmax,
  LooksmaxAnalysis,
  CategoryAnalysis,
  MetricAnalysis,
  SoftmaxxTip,
  getLevelColor,
  getLevelLabel,
  getPriorityColor,
} from '@/services/looksmax-analysis';

export default function AnalysisScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const [analysis, setAnalysis] = useState<LooksmaxAnalysis | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (params.rawAttributes) {
      try {
        const attributes: FacePPAttributes = JSON.parse(params.rawAttributes as string);
        // Passer le PSL original pour eviter un double calcul incoherent
        const originalPSL = params.pslRating ? parseFloat(params.pslRating as string) : undefined;
        const originalTier = params.tier as PSLTier | undefined;
        // Parse landmark metrics if available
        let parsedLandmarkMetrics: LandmarkMetrics | null = null;
        if (params.landmarkMetrics) {
          try {
            parsedLandmarkMetrics = JSON.parse(params.landmarkMetrics as string);
          } catch {
            // Fallback: no landmark metrics
          }
        }
        const looksmaxAnalysis = analyzeLooksmax(attributes, originalPSL, originalTier, user?.gender, parsedLandmarkMetrics, user?.age);
        setAnalysis(looksmaxAnalysis);
      } catch (error) {
        console.error('Error parsing attributes:', error);
      }
    }
  }, [params.rawAttributes, params.pslRating, params.tier, params.landmarkMetrics]);

  if (!user?.isPremium) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <IconSymbol name="lock.fill" size={48} color={colors.tint} />
          <ThemedText type="subtitle" style={styles.title}>
            Analyse Premium
          </ThemedText>
          <ThemedText style={styles.description}>
            L'analyse détaillée et les conseils softmaxx sont réservés aux membres Premium
          </ThemedText>
          <Button title="Passer Premium" onPress={() => router.push('/paywall')} />
        </View>
      </ThemedView>
    );
  }

  if (!analysis) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ThemedText>Chargement de l&apos;analyse...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const tierInfo = TIER_INFO[analysis.tier];

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  const renderSoftmaxxTip = (tip: SoftmaxxTip, index: number) => (
    <View key={index} style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(tip.priority) }]} />
        <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
      </View>
      <ThemedText style={styles.tipDescription}>{tip.description}</ThemedText>
    </View>
  );

  const renderMetric = (metric: MetricAnalysis) => (
    <View key={metric.name} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricTitleRow}>
          <View style={[styles.metricIconBg, { backgroundColor: getLevelColor(metric.level) + '20' }]}>
            <IconSymbol name={metric.icon as any} size={16} color={getLevelColor(metric.level)} />
          </View>
          <ThemedText style={styles.metricName}>{metric.name}</ThemedText>
        </View>
        <ThemedText style={[styles.metricScore, { color: getLevelColor(metric.level) }]}>
          {metric.score}
        </ThemedText>
      </View>
      <ThemedText style={styles.metricDescription}>{metric.description}</ThemedText>

      {metric.softmaxxTips.length > 0 && (
        <View style={styles.tipsContainer}>
          <ThemedText style={styles.tipsTitle}>CONSEILS D&apos;AMÉLIORATION</ThemedText>
          {metric.softmaxxTips.map((tip, index) => renderSoftmaxxTip(tip, index))}
        </View>
      )}
    </View>
  );

  const renderCategory = (category: CategoryAnalysis) => {
    const isExpanded = expandedCategory === category.name;

    return (
      <View key={category.name} style={styles.categoryContainer}>
        <Pressable onPress={() => toggleCategory(category.name)}>
          <Card style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: getLevelColor(category.level) + '20' }]}>
                  <IconSymbol name={category.icon as any} size={20} color={getLevelColor(category.level)} />
                </View>
                <View>
                  <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                  <ThemedText style={styles.categoryNameFr}>{category.nameEn}</ThemedText>
                </View>
              </View>
              <View style={styles.categoryRight}>
                <View style={styles.categoryScoreContainer}>
                  <ThemedText style={[styles.categoryScore, { color: getLevelColor(category.level) }]}>
                    {category.score}
                  </ThemedText>
                  <ThemedText style={[styles.categoryLevel, { color: getLevelColor(category.level) }]}>
                    {getLevelLabel(category.level)}
                  </ThemedText>
                </View>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={16}
                  color={colors.icon}
                />
              </View>
            </View>
          </Card>
        </Pressable>

        {isExpanded && (
          <View style={styles.metricsContainer}>
            {category.metrics.map(renderMetric)}
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
          <ThemedText type="title">Analyse détaillée</ThemedText>
        </View>

        {/* Intro */}
        <ThemedText style={[styles.introText, { color: colors.textSecondary }]}>
          Ici ton score est découpé par catégorie (structure, peau, yeux…) avec des conseils concrets pour chaque point.
        </ThemedText>

        {/* Score & Potentiel */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <ThemedText style={styles.scoreLabel}>Score actuel</ThemedText>
              <ThemedText style={[styles.scoreValue, { color: tierInfo.color }]}>
                {analysis.pslRating.toFixed(1)}
              </ThemedText>
              <View style={[styles.tierBadgeSmall, { backgroundColor: tierInfo.color }]}>
                <ThemedText style={styles.tierBadgeText}>{tierInfo.label}</ThemedText>
              </View>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <ThemedText style={styles.scoreLabel}>Potentiel max</ThemedText>
              <ThemedText style={[styles.scoreValue, { color: '#22c55e' }]}>
                {analysis.potentialPSL.toFixed(1)}
              </ThemedText>
              <ThemedText style={styles.potentialGain}>
                +{(analysis.potentialPSL - analysis.pslRating).toFixed(1)} avec les conseils
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Détail par catégorie (avant conseils prioritaires) */}
        <ThemedText style={styles.sectionTitle}>Détail par catégorie</ThemedText>
        {[...analysis.categories]
          .sort((a, b) => a.score - b.score)
          .map(renderCategory)}

        {/* Conseils prioritaires */}
        <Card style={styles.priorityCard}>
          <ThemedText style={styles.priorityTitle}>CONSEILS PRIORITAIRES</ThemedText>
          <ThemedText style={styles.prioritySubtitle}>
            Actions à faire en premier pour progresser rapidement
          </ThemedText>
          {analysis.prioritySoftmaxx.map((tip, index) => (
            <View key={index} style={styles.priorityItem}>
              <View style={[styles.priorityNumber, { backgroundColor: getPriorityColor(tip.priority) }]}>
                <ThemedText style={styles.priorityNumberText}>{index + 1}</ThemedText>
              </View>
              <View style={styles.priorityContent}>
                <ThemedText style={styles.priorityItemTitle}>{tip.title}</ThemedText>
                <ThemedText style={styles.priorityItemDesc}>{tip.description}</ThemedText>
              </View>
            </View>
          ))}
        </Card>

        {/* Points forts & Points faibles (analyse par catégorie) */}
        <View style={styles.haloFailoRow}>
          <Card style={styles.haloCard}>
            <ThemedText style={styles.hfTitle}>POINTS FORTS</ThemedText>
            <ThemedText style={styles.hfSubtitle}>Ce qui te met en valeur (par catégorie)</ThemedText>
            {analysis.halos.length > 0 ? (
              analysis.halos.map((halo, index) => (
                <ThemedText key={index} style={styles.haloText}>+ {halo}</ThemedText>
              ))
            ) : (
              <ThemedText style={styles.noItems}>Aucun point fort majeur</ThemedText>
            )}
          </Card>
          <Card style={styles.failoCard}>
            <ThemedText style={styles.hfTitle}>À AMÉLIORER</ThemedText>
            <ThemedText style={styles.hfSubtitle}>Ce qui te pénalise (par catégorie)</ThemedText>
            {analysis.failos.length > 0 ? (
              analysis.failos.map((failo, index) => (
                <ThemedText key={index} style={styles.failoText}>- {failo}</ThemedText>
              ))
            ) : (
              <ThemedText style={styles.noItems}>Rien de majeur</ThemedText>
            )}
          </Card>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  scoreCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700',
  },
  tierBadgeSmall: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  tierBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  potentialGain: {
    color: '#22c55e',
    fontSize: 12,
    marginTop: 8,
  },
  scoreDivider: {
    width: 1,
    height: 80,
    backgroundColor: 'rgba(150,150,150,0.3)',
  },
  priorityCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  prioritySubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  priorityItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 12,
  },
  priorityNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  priorityContent: {
    flex: 1,
  },
  priorityItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  priorityItemDesc: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  haloFailoRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  haloCard: {
    flex: 1,
    padding: 12,
  },
  failoCard: {
    flex: 1,
    padding: 12,
  },
  hfTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
    opacity: 0.8,
  },
  hfSubtitle: {
    fontSize: 10,
    opacity: 0.5,
    marginBottom: 8,
  },
  haloText: {
    fontSize: 12,
    color: '#22c55e',
    paddingVertical: 2,
  },
  failoText: {
    fontSize: 12,
    color: '#ef4444',
    paddingVertical: 2,
  },
  noItems: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  categoryContainer: {
    marginHorizontal: 24,
    marginBottom: 8,
  },
  categoryCard: {
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryNameFr: {
    fontSize: 12,
    opacity: 0.6,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryScoreContainer: {
    alignItems: 'flex-end',
  },
  categoryScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  categoryLevel: {
    fontSize: 11,
  },
  metricsContainer: {
    paddingTop: 8,
    gap: 8,
  },
  metricCard: {
    backgroundColor: 'rgba(150,150,150,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricName: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricScore: {
    fontSize: 22,
    fontWeight: '700',
  },
  metricDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 12,
  },
  tipsContainer: {
    backgroundColor: 'rgba(150,150,150,0.08)',
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    opacity: 0.6,
  },
  tipCard: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  tipDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 17,
    paddingLeft: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
