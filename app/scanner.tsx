import { useState, useRef } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ScannerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
            Acces camera requis
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            GlowScore a besoin d&apos;acceder a votre camera pour analyser votre visage
          </ThemedText>
          <Button title="Autoriser la camera" onPress={requestPermission} />
        </View>
      </ThemedView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        if (photo?.uri) {
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </View>

        {/* Face guide overlay */}
        <View style={styles.overlay}>
          <View style={styles.faceGuide} />
          <ThemedText style={styles.guideText}>
            Placez votre visage dans le cadre
          </ThemedText>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={pickImage} style={styles.controlButton}>
            <IconSymbol name="photo.fill" size={28} color="#fff" />
          </Pressable>

          <Pressable onPress={takePicture} style={styles.captureButton}>
            <View style={styles.captureInner} />
          </Pressable>

          <Pressable onPress={toggleFacing} style={styles.controlButton}>
            <IconSymbol name="arrow.triangle.2.circlepath.camera" size={28} color="#fff" />
          </Pressable>
        </View>
      </CameraView>
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
});
