import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { LandmarkMetrics } from '@/types/firebase';
import { FACIAL_METRIC_INFO, type FacialMetricKey } from '@/services/landmark-metrics-service';

export type MetricDescriptions = Partial<Record<FacialMetricKey, string>>;

interface FacialMetricsCardProps {
  metrics: LandmarkMetrics;
  /** Descriptions personnalisées (Gemini). Sinon on affiche le texte statique. */
  metricDescriptions?: MetricDescriptions | null;
  colors: { text: string; textSecondary: string; tint: string; border: string };
}

function formatValue(key: FacialMetricKey, metrics: LandmarkMetrics): string {
  const m = metrics[key];
  if (!m) return '–';
  if (key === 'faceThirds' && 'upper' in m) {
    const t = m as LandmarkMetrics['faceThirds'];
    return `${Math.round(t.upper)} % / ${Math.round(t.middle)} % / ${Math.round(t.lower)} %`;
  }
  if (typeof m === 'object' && 'value' in m) return String((m as { value: number }).value);
  return '–';
}

function getScore(key: FacialMetricKey, metrics: LandmarkMetrics): number | null {
  const m = metrics[key];
  if (!m) return null;
  if (key === 'faceThirds' && 'score' in m) return (m as LandmarkMetrics['faceThirds']).score;
  if (typeof m === 'object' && 'score' in m) return (m as { score: number }).score;
  return null;
}

export function FacialMetricsCard({ metrics, metricDescriptions, colors }: FacialMetricsCardProps) {
  const [expandedKey, setExpandedKey] = useState<FacialMetricKey | null>(null);
  const keys = Object.keys(metrics) as FacialMetricKey[];

  return (
    <Card style={styles.card}>
      <ThemedText style={styles.sectionTitle}>Métriques faciales</ThemedText>
      <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
        Indépendantes du score. Appuie pour dérouler la description.
      </ThemedText>
      {keys.map((key) => {
        const info = FACIAL_METRIC_INFO[key];
        if (!info) return null;
        const valueStr = formatValue(key, metrics);
        const score = getScore(key, metrics);
        const isExpanded = expandedKey === key;
        const description = (metricDescriptions && metricDescriptions[key]) || info.description;

        return (
          <View key={key} style={styles.metricBlock}>
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? colors.border + '40' : 'transparent' },
              ]}
              onPress={() => setExpandedKey(isExpanded ? null : key)}
            >
              <View style={styles.rowLeft}>
                <ThemedText style={styles.label}>{info.label}</ThemedText>
                <ThemedText style={[styles.value, { color: colors.tint }]}>
                  {valueStr}
                  {info.unit ? ` ${info.unit}` : ''}
                </ThemedText>
              </View>
              <View style={styles.rowRight}>
                {score != null && (
                  <View style={[styles.scoreBadge, { backgroundColor: colors.tint + '25' }]}>
                    <ThemedText style={[styles.scoreText, { color: colors.tint }]}>{score}</ThemedText>
                  </View>
                )}
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </Pressable>
            {isExpanded && (
              <View style={[styles.expandedContent, { borderLeftColor: colors.tint + '60' }]}>
                <View style={styles.idealRow}>
                  <ThemedText style={[styles.idealLabel, { color: colors.textSecondary }]}>
                    Fourchette idéale
                  </ThemedText>
                  <ThemedText style={styles.idealValue}>{info.ideal}</ThemedText>
                </View>
                <ThemedText style={[styles.descriptionText, { color: colors.text }]}>
                  {description}
                </ThemedText>
              </View>
            )}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  metricBlock: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    marginLeft: 8,
    paddingLeft: 12,
    paddingVertical: 10,
    paddingRight: 4,
    borderLeftWidth: 3,
    borderRadius: 4,
  },
  idealRow: {
    marginBottom: 8,
  },
  idealLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  idealValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
