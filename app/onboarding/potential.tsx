import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function OnboardingPotential() {
  const router = useRouter();
  const colors = Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { backgroundColor: colors.tint, width: '80%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Ton potentiel est enorme.
        </Text>

        {/* Chart */}
        <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartLabels}>
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Génétique</Text>
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Améliorable</Text>
          </View>
          <View style={styles.chart}>
            <View style={[styles.barGenetic, { backgroundColor: colors.border }]}>
              <Text style={[styles.barText, { color: colors.textSecondary }]}>70%</Text>
            </View>
            <View style={[styles.barImprovable, { backgroundColor: colors.tint }]}>
              <Text style={[styles.barText, { color: '#fff' }]}>30%</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.text }]}>
          L&apos;app va te donner un plan personnalisé basé sur ton profil pour maximiser ton attractivité.
        </Text>

        <View style={[styles.highlight, { borderColor: colors.tint }]}>
          <Text style={[styles.highlightText, { color: colors.textSecondary }]}>
            Jusqu&apos;à <Text style={{ color: colors.tint, fontWeight: '700' }}>30%</Text> de ton apparence peut être optimisée avec les bonnes habitudes.
          </Text>
        </View>
      </View>

      {/* Button */}
      <View style={styles.footer}>
        <Button
          title="Suivant"
          onPress={() => router.push('/onboarding/motivation')}
        />
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    lineHeight: 36,
  },
  chartContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartLabel: {
    fontSize: 14,
  },
  chart: {
    flexDirection: 'row',
    height: 120,
    gap: 12,
  },
  barGenetic: {
    flex: 0.7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  barImprovable: {
    flex: 0.3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  barText: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  highlight: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingVertical: 8,
  },
  highlightText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
});
