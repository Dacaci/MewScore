import { useState, useRef } from 'react';
import { StyleSheet, View, Pressable, Text, Linking, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { setPhotoBase64 } from '@/services/photo-store';

export default function ScannerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const canScan = user?.isPremium || (user?.scansRemaining ?? 0) > 0;

  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <IconSymbol name="camera.fill" size={64} color={colors.tint} />
          <ThemedText type="subtitle" style={styles.permissionTitle}>
            Accès caméra requis
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            MewScore a besoin d'accéder à ta caméra pour analyser ton visage.
          </ThemedText>
          <Button title="Autoriser la caméra" onPress={requestPermission} />
          <Pressable
            onPress={() => Linking.openSettings()}
            style={styles.settingsLink}
          >
            <ThemedText style={[styles.permissionHint, { color: colors.tint }]}>
              Refusé ? Ouvre Réglages → MewScore → Caméra
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const takePicture = async () => {
    if (!canScan) {
      router.replace('/paywall');
      return;
    }
    if (cameraRef.current) {
      try {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        if (photo?.uri) {
          setPhotoBase64(photo.base64 ?? null);
          router.push({
            pathname: '/result',
            params: { photoUri: photo.uri },
          });
        }
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const pickImage = async () => {
    if (!canScan) {
      router.replace('/paywall');
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

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mirror={facing === 'front'}
      />
      {/* Overlay elements positioned absolutely on top of camera */}
      <View style={styles.overlayContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Retour"
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </View>

        {/* Face guide overlay */}
        <View style={styles.overlay}>
          <View style={styles.faceGuide} />
          <ThemedText style={styles.guideText}>
            Place ton visage dans le cadre
          </ThemedText>
          <ThemedText style={styles.guideSubtext}>
            Bonne luminosité, visage face à la caméra
          </ThemedText>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={pickImage}
            style={styles.controlButton}
            accessibilityLabel="Choisir une photo depuis la galerie"
          >
            <IconSymbol name="photo.fill" size={28} color="#fff" />
          </Pressable>

          <Pressable
            onPress={takePicture}
            style={styles.captureButton}
            accessibilityLabel="Prendre la photo"
          >
            <View style={styles.captureInner} />
          </Pressable>

          <Pressable
            onPress={toggleFacing}
            style={styles.controlButton}
            accessibilityLabel="Inverser la caméra"
          >
            <IconSymbol name="arrow.triangle.2.circlepath.camera" size={28} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuide: {
    width: 280,
    height: 350,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderStyle: 'dashed',
  },
  guideText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  guideSubtext: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  permissionTitle: {
    textAlign: 'center',
    marginTop: 16,
  },
  permissionText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  permissionHint: {
    marginTop: 16,
    fontSize: 13,
    textAlign: 'center',
  },
  settingsLink: {
    marginTop: 8,
  },
});
