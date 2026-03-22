import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { PROGRAMMES, PROGRAMME_LABELS } from '@/constants/programmes';
import {
  getProgrammeProgress,
  startProgramme,
  toggleTask,
  resetProgramme,
} from '@/services/programme-service';

export default function ProgrammeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userId } = useAuth();
  const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const programme = PROGRAMMES.find((p) => p.id === id);
  const label = id ? PROGRAMME_LABELS[id] : null;

  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const totalTasks = programme?.weeks.reduce((acc, w) => acc + w.tasks.length, 0) ?? 0;
  const completedTasks = checkedTasks.length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const loadProgress = useCallback(async () => {
    if (!userId || !id) return;
    const progress = await getProgrammeProgress(userId, id);
    if (progress) {
      setCheckedTasks(progress.checkedTasks);
      setIsStarted(true);
    }
    setLoading(false);
  }, [userId, id]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleStart = async () => {
    if (!userId || !id) return;
    await startProgramme(userId, id);
    setIsStarted(true);
    setCheckedTasks([]);
  };

  const handleToggle = async (taskId: string) => {
    if (!userId || !id || toggling) return;
    setToggling(taskId);
    const updated = await toggleTask(userId, id, taskId, checkedTasks);
    setCheckedTasks(updated);
    setToggling(null);
  };

  const handleReset = () => {
    Alert.alert(
      t('programmes.resetTitle'),
      t('programmes.resetDesc'),
      [
        { text: t('programmes.cancel'), style: 'cancel' },
        {
          text: t('programmes.reset'),
          style: 'destructive',
          onPress: async () => {
            if (!userId || !id) return;
            await resetProgramme(userId, id);
            setCheckedTasks([]);
          },
        },
      ]
    );
  };

  if (!programme || !label) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Programme introuvable.</ThemedText>
      </ThemedView>
    );
  }

  const name = lang === 'fr' ? label.fr : label.en;
  const desc = lang === 'fr' ? label.descFr : label.descEn;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={22} color={colors.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>{name}</ThemedText>
        {isStarted && (
          <Pressable onPress={handleReset} style={styles.resetButton}>
            <IconSymbol name="arrow.counterclockwise" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero */}
          <View style={[styles.heroCard, { backgroundColor: programme.color + '12', borderColor: programme.color + '30' }]}>
            <Text style={styles.heroIcon}>{programme.icon}</Text>
            <ThemedText style={styles.heroTitle}>{name}</ThemedText>
            <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>{desc}</Text>

            {/* Progress */}
            {isStarted && (
              <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    {completedTasks}/{totalTasks} {t('programmes.tasksCompleted')}
                  </Text>
                  <Text style={[styles.progressPct, { color: programme.color }]}>
                    {progressPct}%
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: programme.color, width: `${progressPct}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Not started CTA */}
          {!isStarted && (
            <Pressable
              onPress={handleStart}
              style={[styles.startButton, { backgroundColor: programme.color }]}
            >
              <IconSymbol name="play.fill" size={18} color="#fff" />
              <Text style={styles.startText}>{t('programmes.startProgram')}</Text>
            </Pressable>
          )}

          {/* Weeks */}
          {programme.weeks.map((week) => {
            const weekCompleted = week.tasks.every((t) => checkedTasks.includes(t.id));
            return (
              <View key={week.weekNumber} style={styles.weekSection}>
                <View style={styles.weekHeader}>
                  <View style={[styles.weekBadge, { backgroundColor: weekCompleted ? programme.color : colors.backgroundSecondary }]}>
                    <Text style={[styles.weekBadgeText, { color: weekCompleted ? '#fff' : colors.textSecondary }]}>
                      S{week.weekNumber}
                    </Text>
                  </View>
                  <ThemedText style={styles.weekTitle}>{week.title}</ThemedText>
                  {weekCompleted && (
                    <IconSymbol name="checkmark.circle.fill" size={18} color={programme.color} />
                  )}
                </View>

                <View style={[styles.tasksList, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                  {week.tasks.map((task, index) => {
                    const isChecked = checkedTasks.includes(task.id);
                    const isLast = index === week.tasks.length - 1;
                    return (
                      <Pressable
                        key={task.id}
                        onPress={() => isStarted && handleToggle(task.id)}
                        style={[
                          styles.taskRow,
                          !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                          !isStarted && { opacity: 0.4 },
                        ]}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            {
                              borderColor: isChecked ? programme.color : colors.border,
                              backgroundColor: isChecked ? programme.color : 'transparent',
                            },
                          ]}
                        >
                          {toggling === task.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : isChecked ? (
                            <IconSymbol name="checkmark" size={12} color="#fff" />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.taskLabel,
                            { color: isChecked ? colors.textSecondary : colors.text },
                            isChecked && styles.taskLabelChecked,
                          ]}
                        >
                          {task.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Completed message */}
          {progressPct === 100 && (
            <View style={[styles.completedBanner, { backgroundColor: programme.color + '15', borderColor: programme.color + '40' }]}>
              <Text style={styles.completedEmoji}>🎉</Text>
              <Text style={[styles.completedText, { color: programme.color }]}>
                {t('programmes.programCompleted')}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Layout.screenPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  resetButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  heroIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressSection: {
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressPct: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  weekSection: {
    gap: 10,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  weekTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  tasksList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  taskLabelChecked: {
    textDecorationLine: 'line-through',
  },
  completedBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  completedEmoji: {
    fontSize: 32,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
