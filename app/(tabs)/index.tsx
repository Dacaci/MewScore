import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setPhotoBase64 } from '@/services/photo-store';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, isLoading } = useAuth();

  const scansRemaining = user?.scansRemaining ?? 0;
  const isPremium = user?.isPremium ?? false;
  const canScan = isAuthenticated && (scansRemaining > 0 || isPremium);

  // Animation for scanning effect
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleScanPress = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (scansRemaining === 0 && !isPremium) {
      router.push('/paywall');
      return;
    }
    router.push('/scanner');
  };

  const handleImportPress = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (scansRemaining === 0 && !isPremium) {
      router.push('/paywall');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoBase64(result.assets[0].base64 ?? null);
      router.push({
        pathname: '/result',
        params: { photoUri: result.assets[0].uri },
      });
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </ThemedView>
    );
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with logo */}
        <View style={styles.header}>
          <ThemedText style={[styles.logoText, { color: colors.tint }]}>
            MewScore
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>
            Analyse ton visage avec l'IA
          </ThemedText>
        </View>

        {/* Scan Animation Container */}
        <Animated.View
          style={[
            styles.scanContainer,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Face outline */}
          <View style={[styles.faceOutline, { borderColor: colors.tint + '40' }]}>
            <IconSymbol name="face.smiling" size={80} color={colors.tint + '60'} />

            {/* Scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: colors.tint,
                  transform: [{ translateY: scanLineTranslate }],
                },
              ]}
            />
          </View>

          {/* Status badge */}
          {isAuthenticated && (
            <View style={[styles.statusBadge, { backgroundColor: colors.tint + '15' }]}>
              <ThemedText style={[styles.statusText, { color: colors.tint }]}>
                {isPremium ? 'Premium - Illimité' : `${scansRemaining} scan${scansRemaining !== 1 ? 's' : ''} restant${scansRemaining !== 1 ? 's' : ''}`}
              </ThemedText>
            </View>
          )}
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            onPress={handleScanPress}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.tint,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>
              Scanner mon visage
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleImportPress}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonSecondary,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <IconSymbol name="photo.fill" size={24} color={colors.tint} />
            <ThemedText style={[styles.actionButtonText, { color: colors.text }]}>
              Importer une photo
            </ThemedText>
          </Pressable>
        </View>

        {/* No scans CTA */}
        {isAuthenticated && !canScan && (
          <Pressable onPress={() => router.push('/paywall')} style={styles.premiumCta}>
            <ThemedText style={[styles.premiumCtaText, { color: colors.tint }]}>
              Débloquer plus de scans
            </ThemedText>
          </Pressable>
        )}

        {/* Login CTA for non-authenticated users */}
        {!isAuthenticated && (
          <View style={styles.authContainer}>
            <ThemedText style={[styles.authText, { color: colors.textSecondary }]}>
              Connecte-toi pour commencer ton analyse
            </ThemedText>
            <View style={styles.authButtons}>
              <Button
                title="Se connecter"
                onPress={() => router.push('/(auth)/login')}
                style={styles.authButton}
              />
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <ThemedText style={[styles.registerLink, { color: colors.tint }]}>
                  Créer un compte
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Features list */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="sparkles" size={20} color={colors.tint} />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Analyse IA</ThemedText>
              <ThemedText style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Score basé sur les proportions faciales
              </ThemedText>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.success + '15' }]}>
              <IconSymbol name="lightbulb.fill" size={20} color={colors.success} />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Conseils personnalisés</ThemedText>
              <ThemedText style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Recommandations adaptées à ton profil
              </ThemedText>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.warning + '15' }]}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.warning} />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Suivi progression</ThemedText>
              <ThemedText style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Visualise ton évolution dans le temps
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Layout.screenPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
  },
  scanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  faceOutline: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    borderRadius: 2,
  },
  statusBadge: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
  },
  actionButtonSecondary: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumCta: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  premiumCtaText: {
    fontSize: 15,
    fontWeight: '600',
  },
  authContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  authText: {
    fontSize: 15,
    textAlign: 'center',
  },
  authButtons: {
    alignItems: 'center',
    gap: 12,
  },
  authButton: {
    minWidth: 200,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 16,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
  },
});
