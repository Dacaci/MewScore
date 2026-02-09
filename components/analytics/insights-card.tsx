import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { AnalyticsData } from '@/services/analytics-service';

interface InsightsCardProps {
  analytics: AnalyticsData;
  isPremium?: boolean;
}

export function InsightsCard({ analytics, isPremium = false }: InsightsCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    totalScans,
    bestScore,
    averageScore,
    lastScore,
    bestFeature,
  } = analytics;

  return (
    <Card style={styles.container}>
      <ThemedText style={styles.title}>Statistiques</ThemedText>
      <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
        Tes stats en un coup d&apos;œil
      </ThemedText>

      {/* Ligne : Dernier score + Nombre d'analyses */}
      <View style={styles.topRow}>
        <View style={[styles.topBox, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="star.fill" size={22} color={colors.tint} />
          <ThemedText style={[styles.topValue, { color: colors.tint }]}>
            {lastScore != null ? lastScore.toFixed(1) : '–'}
          </ThemedText>
          <ThemedText style={[styles.topLabel, { color: colors.textSecondary }]}>
            Dernier score
          </ThemedText>
        </View>
        <View style={[styles.topBox, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={22} color={colors.tint} />
          <ThemedText style={styles.topValue}>{totalScans}</ThemedText>
          <ThemedText style={[styles.topLabel, { color: colors.textSecondary }]}>
            Analyses
          </ThemedText>
        </View>
      </View>

      {/* Section Stats */}
      <ThemedText style={styles.sectionTitle}>Résumé</ThemedText>
      <View style={styles.trendsList}>
        <View style={styles.trendRow}>
          <Text style={styles.trendEmoji}>🏆</Text>
          <View style={styles.trendContent}>
            <ThemedText style={[styles.trendLabel, { color: colors.textSecondary }]}>
              Meilleur score tout temps
            </ThemedText>
            <ThemedText style={[styles.trendValue, { color: colors.tint }]}>
              {bestScore > 0 ? bestScore.toFixed(1) : '–'}
            </ThemedText>
          </View>
        </View>
        <View style={styles.trendRow}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.icon} />
          <View style={styles.trendContent}>
            <ThemedText style={[styles.trendLabel, { color: colors.textSecondary }]}>
              Moyenne globale
            </ThemedText>
            <ThemedText style={[styles.trendValue, { color: colors.text }]}>
              {averageScore > 0 ? averageScore.toFixed(1) : '–'}
            </ThemedText>
          </View>
        </View>
        {bestFeature && (
          <View style={styles.trendRow}>
            <Text style={styles.trendEmoji}>⭐</Text>
            <View style={styles.trendContent}>
              <ThemedText style={[styles.trendLabel, { color: colors.textSecondary }]}>
                Meilleur atout
              </ThemedText>
              <ThemedText style={[styles.trendValue, { color: colors.text }]}>
                {bestFeature}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  topBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  topIcon: {
    fontSize: 22,
  },
  topValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  topLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  trendsList: {
    gap: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  trendContent: {
    flex: 1,
  },
  trendLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  trendValue: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  trendEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
});
