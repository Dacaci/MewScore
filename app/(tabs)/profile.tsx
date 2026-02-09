import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateUserProfile } from '@/services/auth-service';
import { UserGender } from '@/types/firebase';

const AGES = Array.from({ length: 50 }, (_, i) => i + 14);

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userId, isAuthenticated, isLoading, logout, refreshUserData } = useAuth();
  const { themeMode, setThemeMode, isDark } = useTheme();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editGender, setEditGender] = useState<UserGender | null>(user?.gender ?? null);
  const [editAge, setEditAge] = useState<number>(user?.age ?? 20);
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = () => {
    setEditGender(user?.gender ?? null);
    setEditAge(user?.age ?? 20);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    if (!editGender) {
      Alert.alert('Champ requis', 'Sélectionne un genre.');
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile(userId, { gender: editGender, age: editAge });
      await refreshUserData();
      setShowEditModal(false);
      Alert.alert('Enregistré', 'Tes infos ont été mises à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour tes infos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Veux-tu vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Erreur', 'Impossible de te déconnecter.');
          }
        },
      },
    ]);
  };

  const toggleDarkMode = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '15' }]}>
            <IconSymbol name="person.fill" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Non connecté
          </ThemedText>
          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            Connecte-toi pour accéder à ton profil
          </ThemedText>
          <Button
            title="Se connecter"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.tint + '15' }]}>
            <IconSymbol name="person.fill" size={40} color={colors.tint} />
          </View>
          <ThemedText type="title" style={styles.userName}>
            {(user?.email ?? '').split('@')[0]}
          </ThemedText>
          <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: user?.isPremium ? colors.tint : colors.backgroundSecondary }]}>
            <ThemedText style={[styles.statusText, { color: user?.isPremium ? '#fff' : colors.textSecondary }]}>
              {user?.isPremium ? 'Premium' : 'Gratuit'}
            </ThemedText>
          </View>
        </View>

        {/* Scans Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="camera.fill" size={20} color={colors.tint} />
            </View>
            <ThemedText type="defaultSemiBold">Scans</ThemedText>
          </View>
          <View style={styles.cardRow}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Restants</ThemedText>
            <ThemedText type="defaultSemiBold">
              {user?.isPremium ? 'Illimité' : `${user?.scansRemaining ?? 0}`}
            </ThemedText>
          </View>
        </Card>

        {/* Personal Info Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderWithAction}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.success + '15' }]}>
                <IconSymbol name="person.text.rectangle" size={20} color={colors.success} />
              </View>
              <ThemedText type="defaultSemiBold">Infos personnelles</ThemedText>
            </View>
            <Pressable onPress={openEditModal} hitSlop={8}>
              <ThemedText style={[styles.editLink, { color: colors.tint }]}>Modifier</ThemedText>
            </Pressable>
          </View>
          <View style={styles.cardRow}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Genre</ThemedText>
            <ThemedText type="defaultSemiBold">
              {user?.gender === 'homme' ? 'Homme' : user?.gender === 'femme' ? 'Femme' : '—'}
            </ThemedText>
          </View>
          <View style={styles.cardRow}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Âge</ThemedText>
            <ThemedText type="defaultSemiBold">
              {user?.age != null ? `${user.age} ans` : '—'}
            </ThemedText>
          </View>
        </Card>

        {/* Settings Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.warning + '15' }]}>
              <IconSymbol name="gearshape.fill" size={20} color={colors.warning} />
            </View>
            <ThemedText type="defaultSemiBold">Paramètres</ThemedText>
          </View>
          <View style={styles.cardRow}>
            <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Mode sombre</ThemedText>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="Se déconnecter"
            variant="outline"
            onPress={handleLogout}
          />
        </View>

        {/* Edit Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEditModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
            <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <ThemedText type="subtitle" style={styles.modalTitle}>Modifier mes infos</ThemedText>

              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Genre</ThemedText>
              <View style={styles.genderRow}>
                <Pressable
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: editGender === 'homme' ? colors.tint + '15' : colors.backgroundSecondary,
                      borderColor: editGender === 'homme' ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setEditGender('homme')}
                >
                  <ThemedText style={editGender === 'homme' ? { fontWeight: '600' } : undefined}>Homme</ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: editGender === 'femme' ? colors.tint + '15' : colors.backgroundSecondary,
                      borderColor: editGender === 'femme' ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setEditGender('femme')}
                >
                  <ThemedText style={editGender === 'femme' ? { fontWeight: '600' } : undefined}>Femme</ThemedText>
                </Pressable>
              </View>

              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Âge</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ageScrollContent}
              >
                {AGES.map((age) => (
                  <Pressable
                    key={age}
                    style={[
                      styles.ageChip,
                      {
                        backgroundColor: editAge === age ? colors.tint : colors.backgroundSecondary,
                        borderColor: editAge === age ? colors.tint : colors.border,
                      },
                    ]}
                    onPress={() => setEditAge(age)}
                  >
                    <ThemedText style={[styles.ageChipText, editAge === age && styles.ageChipTextSelected]}>
                      {age}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Annuler"
                  variant="secondary"
                  onPress={() => setShowEditModal(false)}
                  style={styles.modalButton}
                />
                <Button
                  title={isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  style={styles.modalButton}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
    paddingTop: Layout.screenPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    minWidth: 200,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardLabel: {
    fontSize: 15,
  },
  editLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  ageScrollContent: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 24,
  },
  ageChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  ageChipText: {
    fontSize: 15,
  },
  ageChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
