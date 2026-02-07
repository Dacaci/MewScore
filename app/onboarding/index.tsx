import { useState, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    type: 'mockup',
    title: 'Découvre ton potentiel',
    subtitle: 'Analyse ton visage et reçois des conseils personnalisés pour maximiser ton attractivité.',
  },
  {
    type: 'feature',
    emoji: '✨',
    title: 'Golden Ratio',
    subtitle: 'Ton visage est analysé selon le nombre d\'or (1.618), un ratio souvent utilisé en esthétique.',
  },
  {
    type: 'feature',
    emoji: '📊',
    title: 'Score détaillé',
    subtitle: 'Symétrie faciale, proportions, structure osseuse… chaque zone est analysée en détail.',
  },
  {
    type: 'feature',
    emoji: '💡',
    title: 'Conseils personnalisés',
    subtitle: 'Des recommandations concrètes pour améliorer ton apparence : skincare, style, habitudes…',
  },
];

export default function OnboardingWelcome() {
  const router = useRouter();
  const colors = Colors.dark;
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(slideIndex);
  };

  const renderSlide = (slide: typeof slides[0], index: number) => {
    if (slide.type === 'mockup') {
      return (
        <View key={index} style={styles.slide}>
          <View style={styles.slideContent}>
            {/* Mockup iPhone */}
            <View style={[styles.mockup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.mockupContent}>
                <Text style={[styles.mockupScore, { color: colors.tint }]}>7.8</Text>
                <Text style={[styles.mockupLabel, { color: colors.textSecondary }]}>/10</Text>
              </View>
              <View style={[styles.mockupBadge, { backgroundColor: colors.success }]}>
                <Text style={styles.mockupBadgeText}>Attractif</Text>
              </View>
              <Text style={[styles.mockupSubtext, { color: colors.textSecondary }]}>
                Top 15% des utilisateurs
              </Text>
            </View>

            {/* Texte */}
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>
          </View>
        </View>
      );
    }

    // Feature slide
    return (
      <View key={index} style={styles.slide}>
        <View style={styles.slideContent}>
          <View style={[styles.featureIcon, { backgroundColor: colors.tint + '20' }]}>
            <Text style={styles.featureEmoji}>{slide.emoji}</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Horizontal ScrollView */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Pagination dots + indicateur 1/4 */}
      <View style={styles.pagination}>
        <Text style={[styles.slideIndicator, { color: colors.textSecondary }]}>
          {activeSlide + 1} / {slides.length}
        </Text>
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeSlide && styles.dotActive,
                { backgroundColor: index === activeSlide ? colors.tint : colors.border },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Boutons : Suivant sur les 3 premiers, Commencer sur le dernier */}
      <View style={styles.buttons}>
        <Button
          title={activeSlide < slides.length - 1 ? 'Suivant' : 'Commencer'}
          onPress={() => (activeSlide < slides.length - 1 ? scrollRef.current?.scrollTo({ x: (activeSlide + 1) * width, animated: true }) : router.push('/onboarding/gender'))}
        />
        <Text
          style={[styles.loginLink, { color: colors.textSecondary }]}
          onPress={() => router.push('/(auth)/login')}
        >
          Se connecter à un compte existant
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockup: {
    width: width * 0.55,
    aspectRatio: 0.75,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 32,
  },
  mockupContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mockupScore: {
    fontSize: 56,
    fontWeight: '700',
  },
  mockupLabel: {
    fontSize: 20,
    marginLeft: 4,
  },
  mockupBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  mockupBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  mockupSubtext: {
    marginTop: 10,
    fontSize: 13,
  },
  featureIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  featureEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  pagination: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  slideIndicator: {
    fontSize: 14,
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  buttons: {
    gap: 16,
    paddingHorizontal: 24,
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 15,
  },
});
