import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

const painPoints = [
  {
    icon: 'heart.slash',
    text: '40% de matchs en moins sur les apps de rencontre',
    alert: true,
  },
  {
    icon: 'person.2.slash',
    text: 'Moins pris au serieux dans les interactions sociales',
    alert: true,
  },
  {
    icon: 'briefcase',
    text: 'Moins de chances d\'être embauché à compétences égales',
    alert: true,
  },
  {
    icon: 'face.smiling',
    text: 'Premiere impression moins favorable en 7 secondes',
    alert: true,
  },
  {
    icon: 'chart.line.downtrend.xyaxis',
    text: 'Confiance en soi impactee au quotidien',
    alert: true,
  },
];

export default function OnboardingPainPoints() {
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
          <View style={[styles.progress, { backgroundColor: colors.tint, width: '60%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          Ce que ton apparence peut vraiment te couter.
        </Text>

        {/* Pain Points List */}
        <View style={styles.list}>
          {painPoints.map((point, index) => (
            <View
              key={index}
              style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                <IconSymbol name={point.icon as any} size={18} color={colors.tint} />
              </View>
              <Text style={[styles.itemText, { color: colors.text }]}>
                {point.text}
              </Text>
              <View style={styles.alertIcon}>
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#ef4444" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Button */}
      <View style={styles.footer}>
        <Button
          title="Suivant"
          onPress={() => router.push('/onboarding/potential')}
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
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  alertIcon: {
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
});
