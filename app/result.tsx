import { useEffect, useMemo, useState, useRef } from 'react';
import { StyleSheet, View, Image, ActivityIndicator, Text, Platform, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScoreGrid } from '@/components/result/score-grid';
import { FacialMetricsCard } from '@/components/result/facial-metrics-card';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { decrementScansRemaining, decrementDetailedReports } from '@/services/auth-service';
import { analyzeFace, AnalysisResult, AnalysisError } from '@/services/face-analysis-service';
import { getPhotoBase64, clearPhotoBase64 } from '@/services/photo-store';
import { saveScan } from '@/services/scan-service';
import { analyzeLooksmax } from '@/services/looksmax-analysis';
import { Layout } from '@/constants/layout';
import { TIER_INFO } from '@/types/firebase';

const LOADING_MESSAGES = [
  'Analyse de la symétrie faciale...',
  'Calcul des proportions idéales...',
  'Détection des points forts...',
  'Évaluation du teint et de la peau...',
  'Mesure du ratio golden...',
  'Analyse de la structure osseuse...',
  'Évaluation de la zone des yeux...',
  'Calcul du score de mâchoire...',
  'Analyse des sourcils et du regard...',
  'Comparaison avec les canons de beauté...',
  'Préparation des conseils personnalisés...',
  'Vérification des métriques faciales...',
  "Analyse de l'harmonie du visage...",
  "Calcul du potentiel d'amélioration...",
];

export default function ResultScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userId, refreshUserData } = useAuth();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [expandedLooksmaxingIndex, setExpandedLooksmaxingIndex] = useState<number | null>(null);
  const hasAnalyzed = useRef(false);
  const wasDetailedScan = useRef(false);

  useEffect(() => {
    if (hasAnalyzed.current) {
      return;
    }
    hasAnalyzed.current = true;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setError(null);

      const photoBase64 = getPhotoBase64();

      if (!photoBase64) {
        setError({
          code: 'API_ERROR',
          message: "La photo n'a pas pu être utilisée. Reprends une photo.",
        });
        setIsAnalyzing(false);
        return;
      }

      clearPhotoBase64();

      const isPremium = user?.isPremium ?? false;
      const detailedReports = user?.detailedReportsRemaining ?? 0;
      const shouldShowDetails = isPremium || detailedReports > 0;
      wasDetailedScan.current = shouldShowDetails;

      const analysisResult = await analyzeFace(photoBase64, shouldShowDetails, user?.gender, user?.age);

      if (analysisResult.success) {
        setResult(analysisResult.result);

        if (userId && photoUri) {
          try {
            await saveScan({
              userId,
              photoUri,
              pslRating: analysisResult.result.pslRating,
              tier: analysisResult.result.tier,
              percentile: analysisResult.result.percentile,
              strengths: analysisResult.result.strengths,
              weaknesses: analysisResult.result.weaknesses,
              improvements: analysisResult.result.improvements,
              summary: analysisResult.result.summary,
              looksmaxingTips: analysisResult.result.looksmaxingTips,
              rawAttributes: analysisResult.result.rawData,
              detailedScores: analysisResult.result.detailedScores,
              user: user ?? undefined,
              bestFeature: analysisResult.result.bestFeature,
              landmarkMetrics: analysisResult.result.landmarkMetrics,
              metricDescriptions: analysisResult.result.metricDescriptions,
            });
          } catch (err) {
            console.error('Error saving scan:', err);
          }
        }

        if (userId && !isPremium) {
          try {
            await decrementScansRemaining(userId);
            if (shouldShowDetails) {
              await decrementDetailedReports(userId);
            }
            await refreshUserData();
          } catch (err) {
            console.error('Error decrementing scans:', err);
          }
        }
      } else {
        setError(analysisResult.error);
      }

      setIsAnalyzing(false);
    };

    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Messages aléatoires pendant le chargement pour faire patienter
  useEffect(() => {
    if (!isAnalyzing) return;
    const pickRandom = () => {
      const msg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      setLoadingMessage(msg);
    };
    pickRandom();
    const interval = setInterval(pickRandom, 2800);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // useMemo doit être appelé à chaque rendu (règles des Hooks) — avant tout return conditionnel
  const looksmaxForFallback = useMemo(() => {
    if (!result?.rawData || (result.weaknesses && result.weaknesses.length > 0)) return null;
    return analyzeLooksmax(
      result.rawData,
      result.pslRating,
      result.tier,
      user?.gender ?? undefined,
      result.landmarkMetrics ?? null,
      user?.age ?? undefined,
    );
  }, [result?.rawData, result?.weaknesses, result?.pslRating, result?.tier, result?.landmarkMetrics, user?.gender, user?.age]);

  const displayWeaknesses = (result?.weaknesses && result.weaknesses.length > 0)
    ? result.weaknesses
    : (looksmaxForFallback?.failos ?? []);

  if (isAnalyzing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          )}
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText type="subtitle" style={styles.loadingText}>
              Analyse en cours...
            </ThemedText>
            <ThemedText style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
              {loadingMessage || 'Photo reçue → Analyse → Conseils'}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          )}
          <Card style={styles.errorCard}>
            <ThemedText type="subtitle" style={styles.errorTitle}>
              Analyse impossible
            </ThemedText>
            <ThemedText style={styles.errorMessage}>
              {error.message}
            </ThemedText>
            <ThemedText style={styles.errorTip}>
              Astuce : bonne luminosité, visage face à la caméra, une seule personne.
            </ThemedText>
          </Card>
          <View style={styles.errorActions}>
            <Button title="Réessayer" onPress={() => router.replace('/scanner')} />
            <Button
              title="Retour à l'accueil"
              variant="outline"
              onPress={() => router.replace('/(tabs)')}
            />
          </View>
        </View>
      </ThemedView>
    );
  }

  const tierInfo = result ? TIER_INFO[result.tier] : null;
  const isDetailed = wasDetailedScan.current;
  const weaknessCount = result?.weaknesses?.length ?? 0;

  // Fonction pour generer le texte de percentile personnalise
  const getPercentileValue = () => {
    return 100 - (result?.percentile ?? 50);
  };

  const getPercentileText = (showValue: boolean) => {
    const percentileValue = showValue ? `${getPercentileValue()}%` : '🔒';
    const userGender = user?.gender;
    const userAge = user?.age;

    if (userGender && userAge) {
      const genderLabel = userGender === 'homme' ? 'hommes' : 'femmes';
      return `Tu fais mieux que ${percentileValue} des ${genderLabel} de ton age`;
    } else if (userGender) {
      const genderLabel = userGender === 'homme' ? 'hommes' : 'femmes';
      return `Tu fais mieux que ${percentileValue} des ${genderLabel}`;
    } else if (userAge) {
      return `Tu fais mieux que ${percentileValue} des personnes de ton age`;
    }
    return `Tu fais mieux que ${percentileValue} des gens`;
  };

  // Composant pour afficher une card verrouillee
  const LockedCard = ({ title, subtitle, showBadge }: { title: string; subtitle?: string; showBadge?: boolean }) => (
    <Card style={styles.lockedCard}>
      <View style={styles.lockedCardHeader}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      </View>
      {showBadge && (
        <View style={styles.problemsBadge}>
          <Text style={styles.problemsBadgeText}>{weaknessCount} problèmes trouvés</Text>
        </View>
      )}
      {subtitle && (
        <ThemedText style={styles.lockedSubtitle}>{subtitle}</ThemedText>
      )}
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo */}
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.resultImage} />
        )}

        {/* Score Card - Toujours visible */}
        <Card style={styles.scoreCard}>
          <ThemedText style={styles.scoreLabel}>Ton score</ThemedText>
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: tierInfo?.color ?? colors.tint }]}>
              {result?.pslRating.toFixed(1)}
            </Text>
            <Text style={[styles.scoreMax, { color: colors.text }]}>/10</Text>
          </View>

          {/* Tier Badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierInfo?.color ?? colors.tint }]}>
            <Text style={styles.tierLabel}>{tierInfo?.label}</Text>
          </View>
          <ThemedText style={styles.tierDescription}>
            {tierInfo?.description}
          </ThemedText>

          {/* Percentile - Verrouille pour gratuit */}
          <View style={styles.percentileContainer}>
            {isDetailed ? (
              <ThemedText style={styles.percentileText}>
                {getPercentileText(true)}
              </ThemedText>
            ) : (
              <Pressable onPress={() => router.push('/paywall')}>
                <ThemedText style={styles.percentileText}>
                  {getPercentileText(false)}
                </ThemedText>
              </Pressable>
            )}
          </View>
        </Card>

        {isDetailed ? (
          <>
            {result?.detailedScores && (
              <ScoreGrid scores={result.detailedScores} />
            )}

            {/* Bloc unique : Résumé + Points forts + À améliorer */}
            {(result?.summary || (result?.strengths && result.strengths.length > 0) || displayWeaknesses.length > 0) && (
              <Card style={styles.summaryBlockCard}>
                {result?.summary && (
                  <View style={styles.summaryBlockSection}>
                    <View style={styles.summaryHeader}>
                      <Text style={styles.aiIcon}>✨</Text>
                      <ThemedText style={styles.sectionTitle}>Résumé</ThemedText>
                    </View>
                    <ThemedText style={styles.summaryText}>{result.summary}</ThemedText>
                  </View>
                )}
                {result?.strengths && result.strengths.length > 0 && (
                  <View style={[styles.summaryBlockSection, styles.summaryBlockSectionDivider]}>
                    <ThemedText style={styles.sectionTitle}>Points forts</ThemedText>
                    {result.strengths.map((item, index) => (
                      <View key={index} style={styles.listItem}>
                        <Text style={styles.greenIcon}>✓</Text>
                        <ThemedText style={styles.listText}>{item}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
                {displayWeaknesses.length > 0 && (
                  <View style={[styles.summaryBlockSection, styles.summaryBlockSectionDivider]}>
                    <ThemedText style={styles.sectionTitle}>À améliorer</ThemedText>
                    {displayWeaknesses.map((item, index) => (
                      <View key={index} style={styles.listItem}>
                        <Text style={styles.redIcon}>✗</Text>
                        <ThemedText style={styles.listText}>{item}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            )}

            {/* Conseils looksmaxing (déroulants) */}
            {isDetailed && result?.looksmaxingTips && result.looksmaxingTips.length > 0 && (
              <Card style={styles.looksmaxingCard}>
                <ThemedText style={styles.sectionTitle}>Conseils looksmaxing</ThemedText>
                {result.looksmaxingTips.map((tip, index) => {
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

            {result?.landmarkMetrics && (
              <FacialMetricsCard
                metrics={result.landmarkMetrics}
                metricDescriptions={result?.metricDescriptions}
                colors={colors}
              />
            )}

            {result?.rawData && (
              <Pressable
                style={styles.planActionButton}
                onPress={() => router.push({
                  pathname: '/analysis',
                  params: {
                    rawAttributes: JSON.stringify(result.rawData),
                    pslRating: result.pslRating.toString(),
                    tier: result.tier,
                  },
                })}
              >
                <ThemedText style={styles.planActionButtonText}>Analyse par catégorie</ThemedText>
                <IconSymbol name="chevron.right" size={18} color={colors.tint} />
              </Pressable>
            )}

            <View style={styles.actions}>
              <Button title="Nouveau scan" onPress={() => router.replace('/scanner')} />
              <Button
                title="Retour à l'accueil"
                variant="outline"
                onPress={() => router.replace('/(tabs)')}
              />
            </View>
          </>
        ) : (
          <>
            {/* GRATUIT: Score Grid verrouille */}
            {result?.detailedScores && (
              <ScoreGrid
                scores={result.detailedScores}
                locked
                onUnlockPress={() => router.push('/paywall')}
              />
            )}

            {/* GRATUIT: Cards verrouilees */}
            <LockedCard title="Tes points forts" />

            <LockedCard
              title="À améliorer"
              showBadge={weaknessCount > 0}
            />

            <LockedCard title="Conseils personnalisés" />

            {/* GRATUIT: Bouton Continuer */}
            <Button
              title="Continuer"
              onPress={() => router.push('/paywall')}
              style={styles.continueButton}
            />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
  },
  loadingOverlay: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    marginTop: 16,
  },
  loadingSubtext: {
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorCard: {
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  errorTitle: {
    color: '#ef4444',
  },
  errorMessage: {
    textAlign: 'center',
    opacity: 0.8,
  },
  errorTip: {
    textAlign: 'center',
    fontSize: 13,
    opacity: 0.7,
    marginTop: 12,
  },
  errorActions: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  resultImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(150,150,150,0.3)',
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  summaryBlockCard: {
    padding: 20,
    marginBottom: 20,
  },
  summaryBlockSection: {
    paddingVertical: 4,
  },
  summaryBlockSectionDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
    marginTop: 16,
    paddingTop: 16,
  },
  scoreLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 72,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  scoreMax: {
    fontSize: 24,
    opacity: 0.5,
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  tierBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  tierLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tierDescription: {
    marginTop: 8,
    opacity: 0.7,
    fontSize: 14,
  },
  percentileContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
    width: '100%',
    alignItems: 'center',
  },
  percentileText: {
    fontSize: 14,
    opacity: 0.8,
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
    gap: 10,
  },
  improvementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    paddingLeft: 34,
  },
  looksmaxingCard: {
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  looksmaxingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  planActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  planActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  premiumButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  // Styles pour les cards verrouilees (gratuit)
  lockedCard: {
    marginBottom: 12,
    padding: 16,
  },
  lockedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  lockedSubtitle: {
    opacity: 0.6,
    marginTop: 8,
    fontSize: 13,
  },
  lockedRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  lockedSmallCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  lockedSmallTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  continueButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
