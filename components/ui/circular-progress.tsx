import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  locked?: boolean;
  animated?: boolean;
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
  animated = true,
}: CircularProgressProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const progressColor = locked ? 'rgba(150, 150, 150, 0.3)' : (color ?? getProgressColor(clampedProgress));
  const trackColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // SVG circle calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animation
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated && !locked) {
      animatedProgress.value = withTiming(clampedProgress, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = locked ? 0 : clampedProgress;
    }
  }, [clampedProgress, locked, animated]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * animatedProgress.value) / 100;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.container}>
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

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
  svg: {
    position: 'absolute',
  },
  centerContent: {
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
