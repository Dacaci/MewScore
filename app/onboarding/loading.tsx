import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

const loadingSteps = [
  'Preparation de ton profil...',
  'Configuration de l\'analyse...',
  'Chargement des algorithmes...',
  'Finalisation...',
];

export default function OnboardingLoading() {
  const router = useRouter();
  const colors = Colors.dark;
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    // Redirect after loading
    const timeout = setTimeout(() => {
      router.replace('/(auth)/register');
    }, 3500);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
      clearTimeout(timeout);
    };
  }, [router, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      <View style={styles.content}>
        {/* Animated Circle */}
        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              styles.circleOuter,
              { borderColor: colors.tint, transform: [{ rotate: spin }] },
            ]}
          />
          <View style={[styles.circleInner, { backgroundColor: colors.card }]}>
            <IconSymbol name="person.fill" size={48} color={colors.tint} />
          </View>
        </View>

        {/* Text */}
        <Text style={[styles.title, { color: colors.text }]}>
          Preparation en cours
        </Text>
        <Text style={[styles.step, { color: colors.textSecondary }]}>
          {loadingSteps[currentStep]}
        </Text>

        {/* Progress */}
        <View style={[styles.progressContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {progress}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circleContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  circleOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  circleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  step: {
    fontSize: 16,
    marginBottom: 32,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
