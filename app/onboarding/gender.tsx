import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useOnboarding, Gender } from '@/contexts/onboarding-context';

export default function OnboardingGender() {
  const router = useRouter();
  const colors = Colors.dark;
  const { data, setGender } = useOnboarding();
  const selected = data.gender;

  const handleSelect = (gender: Gender) => {
    setGender(gender);
  };

  const handleContinue = () => {
    if (selected) {
      router.push('/onboarding/painpoints');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { backgroundColor: colors.tint, width: '20%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Sélectionne ton genre
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ça permet d'adapter l'analyse et les conseils à ton profil.
        </Text>

        {/* Options */}
        <View style={styles.options}>
          <Pressable
            style={[
              styles.option,
              { backgroundColor: colors.card, borderColor: selected === 'homme' ? colors.tint : colors.border },
              selected === 'homme' && styles.optionSelected,
            ]}
            onPress={() => handleSelect('homme')}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>Homme</Text>
            <View style={[styles.radio, { borderColor: selected === 'homme' ? colors.tint : colors.border }]}>
              {selected === 'homme' && <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />}
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.option,
              { backgroundColor: colors.card, borderColor: selected === 'femme' ? colors.tint : colors.border },
              selected === 'femme' && styles.optionSelected,
            ]}
            onPress={() => handleSelect('femme')}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>Femme</Text>
            <View style={[styles.radio, { borderColor: selected === 'femme' ? colors.tint : colors.border }]}>
              {selected === 'femme' && <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />}
            </View>
          </Pressable>
        </View>
      </View>

      {/* Button */}
      {selected && (
        <View style={styles.footer}>
          <Button
            title="Continuer"
            onPress={handleContinue}
          />
        </View>
      )}
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  optionSelected: {
    borderWidth: 2,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
});
