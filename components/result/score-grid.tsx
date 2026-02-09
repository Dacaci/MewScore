import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

import { CircularProgress } from '@/components/ui/circular-progress';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { DetailedScores } from '@/types/firebase';
import { SCORE_LABELS } from '@/services/score-mapping-service';

interface ScoreGridProps {
  scores: DetailedScores;
  locked?: boolean;
  onUnlockPress?: () => void;
}

const GRID_ORDER: (keyof DetailedScores)[] = [
  'symmetry',
  'skin',
  'jawline',
  'eyeArea',
  'cheekbones',
  'eyebrows',
  'glow',
  'hair',
  'harmony',
];

export function ScoreGrid({ scores, locked = false, onUnlockPress }: ScoreGridProps) {
  const content = (
    <View style={styles.grid}>
      {GRID_ORDER.map((key) => (
        <View key={key} style={styles.gridItem}>
          <CircularProgress
            progress={scores[key]}
            size={60}
            strokeWidth={5}
            label={SCORE_LABELS[key].label}
            locked={locked}
          />
        </View>
      ))}
    </View>
  );

  const titleBlock = <ThemedText style={styles.title}>Scores détaillés</ThemedText>;

  if (locked) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          {titleBlock}
          <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        </View>
        <Pressable onPress={onUnlockPress}>
          {content}
          <View style={styles.unlockOverlay}>
            <ThemedText style={styles.unlockText}>
              Débloquer avec Premium
            </ThemedText>
          </View>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      {titleBlock}
      {content}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  lockBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockIcon: {
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
  },
  unlockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  unlockText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
});
