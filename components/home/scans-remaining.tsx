import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ScansRemainingProps {
  scansRemaining: number;
  isPremium: boolean;
  detailedReportsRemaining?: number;
  maxScans?: number;
}

export function ScansRemaining({
  scansRemaining,
  isPremium,
  detailedReportsRemaining = 0,
  maxScans = 3,
}: ScansRemainingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const scansDisplay = isPremium
    ? 'Illimité'
    : scansRemaining > maxScans
      ? `${scansRemaining}`
      : `${scansRemaining}/${maxScans}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.icon }]}>Scans restants</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {scansDisplay}
      </Text>
      {!isPremium && detailedReportsRemaining > 0 && (
        <Text style={styles.reportBadge}>+1 rapport détaillé</Text>
      )}
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
  reportBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
    marginTop: 4,
  },
});
