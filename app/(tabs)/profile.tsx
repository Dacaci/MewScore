import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateUserProfile } from '@/services/auth-service';
import { resetProgression } from '@/services/scan-service';
import { UserGender } from '@/types/firebase';

const AGES = Array.from({ length: 50 }, (_, i) => i + 14);

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, userId, isAuthenticated, isLoading, logout, refreshUserData } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editGender, setEditGender] = useState<UserGender | null>(user?.gender ?? null);
  const [editAge, setEditAge] = useState<number>(user?.age ?? 20);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleResetProgression = () => {
    Alert.alert(
      'Réinitialiser la progression',
      'Tous tes scans seront supprimés et tes stats remises à zéro. Tes scans restants et ton compte ne sont pas modifiés.\n\nContinuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;
            setIsResetting(true);
            try {
              const result = await resetProgression(userId);
              if (result.success) {
                await refreshUserData();
                Alert.alert('C\'est fait', 'Ta progression a été réinitialisée.');
              } else {
                Alert.alert('Erreur', result.error ?? 'Impossible de réinitialiser.');
              }
            } catch {
              Alert.alert('Erreur', 'Impossible de réinitialiser la progression.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            <IconSymbol name="person.fill" size={48} color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Non connecté
          </ThemedText>
          <ThemedText style={styles.description}>
            Connecte-toi pour accéder à ton profil et tes paramètres
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
        <ThemedText type="title" style={styles.pageTitle}>
          Profil
        </ThemedText>

        <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.tint + '20' }]}>
          <IconSymbol name="person.fill" size={32} color={colors.tint} />
        </View>
        <ThemedText type="subtitle" style={styles.email}>
          {user?.email}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: user?.isPremium ? colors.tint : colors.icon + '30' }]}>
          <ThemedText style={[styles.badgeText, { color: user?.isPremium ? '#fff' : colors.text }]}>
            {user?.isPremium ? 'Premium' : 'Gratuit'}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Scans restants</ThemedText>
          <ThemedText type="defaultSemiBold">
            {user?.isPremium ? 'Illimité' : `${user?.scansRemaining ?? 0}/3`}
          </ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Statut</ThemedText>
          <ThemedText type="defaultSemiBold">
            {user?.isPremium ? 'Premium' : 'Gratuit'}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <ThemedText type="subtitle">Infos personnelles</ThemedText>
          <Pressable onPress={openEditModal} style={styles.editButton}>
            <IconSymbol name="pencil" size={18} color={colors.tint} />
            <ThemedText style={[styles.editButtonText, { color: colors.tint }]}>Modifier</ThemedText>
          </Pressable>
        </View>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Genre</ThemedText>
          <ThemedText type="defaultSemiBold">
            {user?.gender === 'homme' ? 'Homme' : user?.gender === 'femme' ? 'Femme' : 'Non renseigné'}
          </ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Âge</ThemedText>
          <ThemedText type="defaultSemiBold">
            {user?.age != null ? `${user.age} ans` : 'Non renseigné'}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.resetCard}>
        <ThemedText type="subtitle" style={styles.resetCardTitle}>Progression</ThemedText>
        <ThemedText style={[styles.resetCardDescription, { color: colors.textSecondary }]}>
          Supprime tous tes scans et remet tes stats à zéro. Tes scans restants ne changent pas.
        </ThemedText>
        <Button
          title={isResetting ? 'Réinitialisation...' : 'Réinitialiser la progression'}
          onPress={handleResetProgression}
          disabled={isResetting}
          style={[styles.resetButton, isResetting && styles.resetButtonDisabled]}
        />
      </Card>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ThemedText type="title" style={styles.modalTitle}>Modifier mes infos</ThemedText>
            <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Ces infos permettent d&apos;adapter ton score et les conseils.
            </ThemedText>

            <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Genre</ThemedText>
            <View style={styles.genderRow}>
              <Pressable
                style={[
                  styles.genderOption,
                  { borderColor: editGender === 'homme' ? colors.tint : colors.border },
                ]}
                onPress={() => setEditGender('homme')}
              >
                <ThemedText>Homme</ThemedText>
                <View style={[styles.radio, { borderColor: editGender === 'homme' ? colors.tint : colors.border }]}>
                  {editGender === 'homme' && <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />}
                </View>
              </Pressable>
              <Pressable
                style={[
                  styles.genderOption,
                  { borderColor: editGender === 'femme' ? colors.tint : colors.border },
                ]}
                onPress={() => setEditGender('femme')}
              >
                <ThemedText>Femme</ThemedText>
                <View style={[styles.radio, { borderColor: editGender === 'femme' ? colors.tint : colors.border }]}>
                  {editGender === 'femme' && <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />}
                </View>
              </Pressable>
            </View>

            <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Âge</ThemedText>
            <ScrollView
              style={styles.ageScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ageScrollContent}
            >
              {AGES.map((age) => (
                <Pressable
                  key={age}
                  style={[
                    styles.ageItem,
                    editAge === age && { backgroundColor: colors.tint + '25' },
                  ]}
                  onPress={() => setEditAge(age)}
                >
                  <ThemedText style={editAge === age ? styles.ageItemTextSelected : undefined}>
                    {age} ans
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Annuler"
                variant="outline"
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
          </View>
        </View>
      </Modal>

        <View style={styles.actions}>
          <Button title="Se déconnecter" variant="outline" onPress={handleLogout} />
        </View>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 24,
  },
  loginButton: {
    minWidth: 200,
  },
  pageTitle: {
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  email: {
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    opacity: 0.7,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  resetCard: {
    marginBottom: 24,
    padding: Layout.cardPadding,
  },
  resetCardTitle: {
    marginBottom: 8,
  },
  resetCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  resetButton: {
    alignSelf: 'stretch',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalTitle: {
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ageScroll: {
    maxHeight: 160,
    marginBottom: 24,
  },
  ageScrollContent: {
    gap: 4,
  },
  ageItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  ageItemTextSelected: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});
