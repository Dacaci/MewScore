import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

const QUOTE = "Tu n'as pas choisi ton visage, mais tu peux choisir ce que tu en fais.";

export default function OnboardingMotivation() {
  const router = useRouter();
  const colors = Colors.dark;
  const [displayedText, setDisplayedText] = useState('');
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedText(QUOTE.slice(0, index));
      if (index >= QUOTE.length) {
        clearInterval(interval);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }, 45);
    return () => clearInterval(interval);
  }, [buttonOpacity]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { backgroundColor: colors.tint, width: '100%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.quote, { color: colors.text }]}>
          {displayedText}
        </Text>
      </View>

      {/* Button */}
      <View style={styles.footer}>
        <Animated.View style={{ opacity: buttonOpacity }}>
          <Button
            title="Analyser mon visage"
            onPress={() => router.push('/onboarding/loading')}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quote: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 40,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
});
