import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { PROGRAMMES, PROGRAMMES_FEMALE, PROGRAMME_LABELS } from '@/constants/programmes';
import { getProgrammeProgress } from '@/services/programme-service';

interface ProgressMap {
  [programmeId: string]: { total: number; checked: number } | null;
}

export default function ProgrammesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userId } = useAuth();
  const isPremium = user?.isPremium ?? false;
  const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
  const programmes = user?.gender === 'femme' ? PROGRAMMES_FEMALE : PROGRAMMES;

  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const results: ProgressMap = {};
    await Promise.all(
      PROGRAMMES.map(async (p) => {
        const progress = await getProgrammeProgress(userId, p.id);
        if (progress) {
          const total = p.weeks.reduce((acc, w) => acc + w.tasks.length, 0);
          results[p.id] = { total, checked: progress.checkedTasks.length };
        } else {
          results[p.id] = null;
        }
      })
    );
    setProgressMap(results);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProgress();
    }, [loadProgress])
  );

  const handlePress = (programmeId: string) => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }
    router.push({ pathname: '/programme/[id]' as any, params: { id: programmeId } });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedText style={styles.title}>{t('programmes.title')}</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('programmes.subtitle')}
        </ThemedText>

        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {programmes.map((programme) => {
              const label = PROGRAMME_LABELS[programme.id];
              const name = lang === 'fr' ? label.fr : label.en;
              const desc = lang === 'fr' ? label.descFr : label.descEn;
              const progress = progressMap[programme.id];
              const isStarted = progress !== null;
              const locked = !isPremium;

              const progressPct = isStarted && progress
                ? Math.round((progress.checked / progress.total) * 100)
                : 0;

              return (
                <Pressable
                  key={programme.id}
                  onPress={() => handlePress(programme.id)}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: isStarted ? programme.color : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  {/* Cover image */}
                  <View style={styles.cardImageContainer}>
                    <Image source={programme.image} style={styles.cardImage} resizeMode="cover" />
                    {locked && (
                      <View style={styles.lockOverlay}>
                        <IconSymbol name="lock.fill" size={16} color="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {desc}
                  </Text>

                  {/* Progress bar */}
                  {isStarted && !locked ? (
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.progressFill,
                            { backgroundColor: programme.color, width: `${progressPct}%` },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: programme.color }]}>
                        {progressPct}%
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.duration, { color: colors.textSecondary }]}>
                      {t('programmes.duration')}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {!isPremium && (
          <Pressable
            onPress={() => router.push('/paywall')}
            style={[styles.premiumBanner, { backgroundColor: colors.tint }]}
          >
            <IconSymbol name="star.fill" size={18} color="#fff" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{t('programmes.unlockAll')}</Text>
              <Text style={styles.bannerDesc}>{t('programmes.unlockAllDesc')}</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color="rgba(255,255,255,0.7)" />
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Layout.screenPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '47.5%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 6,
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  progressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
  },
  duration: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  cardImageContainer: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  bannerDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});
