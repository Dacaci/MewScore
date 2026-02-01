import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ScansRemainingProps {
  scansRemaining: number;
  isPremium: boolean;
  maxScans?: number;
}

export function ScansRemaining({
  scansRemaining,
  isPremium,
  maxScans = 3,
}: ScansRemainingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.icon }]}>Scans restants</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {isPremium ? 'Illimite' : `${scansRemaining}/${maxScans}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
});
