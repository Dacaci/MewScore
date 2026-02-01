import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { decrementScansRemaining } from '@/services/auth-service';

interface AnalysisResult {
  globalScore: number;
  percentile: number;
  details?: {
    skin: number;
    symmetry: number;
    features: number;
    harmony: number;
  };
}

export default function ResultScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userId, refreshUserData } = useAuth();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzePhoto = useCallback(async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis (replace with actual API call later)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Generate mock result
    const globalScore = Math.floor(Math.random() * 30) + 65; // 65-95
    const percentile = Math.floor(Math.random() * 40) + 55; // 55-95

    const mockResult: AnalysisResult = {
      globalScore,
      percentile,
      details: user?.isPremium
        ? {
            skin: Math.floor(Math.random() * 20) + 75,
            symmetry: Math.floor(Math.random() * 25) + 70,
            features: Math.floor(Math.random() * 20) + 75,
            harmony: Math.floor(Math.random() * 25) + 70,
          }
        : undefined,
    };

    setResult(mockResult);
    setIsAnalyzing(false);

    // Decrement scans remaining for non-premium users
    if (userId && !user?.isPremium) {
      await decrementScansRemaining(userId);
      await refreshUserData();
    }
  }, [user?.isPremium, userId, refreshUserData]);

  useEffect(() => {
    analyzePhoto();
  }, [analyzePhoto]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#22c55e'; // green
    if (score >= 70) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exceptionnel';
    if (score >= 80) return 'Tres bien';
    if (score >= 70) return 'Bien';
    if (score >= 60) return 'Correct';
    return 'A ameliorer';
  };

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
            <ThemedText style={styles.loadingSubtext}>
              Notre IA analyse votre photo
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Photo */}
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.resultImage} />
        )}

        {/* Global Score */}
        <Card style={styles.scoreCard}>
          <ThemedText style={styles.scoreLabel}>Votre GlowScore</ThemedText>
          <View style={styles.scoreContainer}>
            <ThemedText
              style={[styles.score, { color: getScoreColor(result?.globalScore ?? 0) }]}>
              {result?.globalScore}
            </ThemedText>
            <ThemedText style={styles.scoreMax}>/100</ThemedText>
          </View>
          <ThemedText style={[styles.scoreCategory, { color: getScoreColor(result?.globalScore ?? 0) }]}>
            {getScoreLabel(result?.globalScore ?? 0)}
          </ThemedText>
        </Card>

        {/* Percentile */}
        <Card style={styles.percentileCard}>
          <ThemedText style={styles.percentileLabel}>
            Vous etes dans le top
          </ThemedText>
          <ThemedText style={[styles.percentile, { color: colors.tint }]}>
            {result?.percentile}%
          </ThemedText>
        </Card>

        {/* Detailed Scores (Premium only) */}
        {result?.details ? (
          <Card style={styles.detailsCard}>
            <ThemedText type="subtitle" style={styles.detailsTitle}>
              Scores detailles
            </ThemedText>
            <View style={styles.detailsGrid}>
              {Object.entries(result.details).map(([key, value]) => (
                <View key={key} style={styles.detailItem}>
                  <ThemedText style={styles.detailLabel}>
                    {key === 'skin' && 'Peau'}
                    {key === 'symmetry' && 'Symetrie'}
                    {key === 'features' && 'Traits'}
                    {key === 'harmony' && 'Harmonie'}
                  </ThemedText>
                  <ThemedText style={[styles.detailValue, { color: getScoreColor(value) }]}>
                    {value}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <Card style={styles.premiumCard}>
            <ThemedText style={styles.premiumText}>
              Passez Premium pour voir les scores detailles
            </ThemedText>
            <Button
              title="Voir les details"
              variant="outline"
              onPress={() => router.push('/paywall')}
            />
          </Card>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Nouveau scan" onPress={() => router.replace('/scanner')} />
        <Button
          title="Retour a l'accueil"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  resultImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
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
  },
  scoreMax: {
    fontSize: 24,
    opacity: 0.5,
    marginLeft: 4,
  },
  scoreCategory: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  percentileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  percentileLabel: {
    fontSize: 16,
  },
  percentile: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsTitle: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '47%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  premiumCard: {
    alignItems: 'center',
    gap: 16,
  },
  premiumText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
});
