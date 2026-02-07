import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  locked?: boolean;
}

// Get progress color based on value
function getProgressColor(progress: number): string {
  if (progress >= 80) return '#22c55e';
  if (progress >= 60) return '#84cc16';
  if (progress >= 50) return '#eab308';
  if (progress >= 40) return '#f97316';
  return '#ef4444';
}

export function CircularProgress({
  progress,
  size = 70,
  strokeWidth = 6,
  color,
  label,
  showValue = true,
  locked = false,
}: CircularProgressProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const progressColor = locked ? 'rgba(150, 150, 150, 0.3)' : (color ?? getProgressColor(clampedProgress));
  const trackColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Simple circular progress using border technique
  const innerSize = size - strokeWidth * 2;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.progressContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: trackColor,
          },
        ]}
      >
        {/* Progress indicator - simplified as a filled circle based on progress */}
        <View
          style={[
            styles.progressFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              opacity: clampedProgress / 100,
            },
          ]}
        />

        {/* Inner circle (background) */}
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            },
          ]}
        />

        {/* Center content */}
        <View style={styles.centerContent}>
          {locked ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : showValue ? (
            <Text style={[styles.valueText, { color: progressColor }]}>
              {Math.round(clampedProgress)}
            </Text>
          ) : null}
        </View>
      </View>

      {label && (
        <Text
          style={[styles.label, { color: colors.text }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
  },
  innerCircle: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  lockIcon: {
    fontSize: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: 70,
  },
});
