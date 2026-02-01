import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { useAuth } from '@/contexts/auth-context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { response, promptAsync, isReady } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = useCallback(async (idToken: string) => {
    try {
      await loginWithGoogle(idToken);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur Google', errorMessage);
    }
  }, [loginWithGoogle, router]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response, handleGoogleSignIn]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur de connexion', errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Connexion
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Connectez-vous pour acceder a GlowScore
          </ThemedText>
        </View>

        <View style={styles.form}>
          <GoogleSignInButton
            onPress={() => promptAsync()}
            disabled={!isReady || isLoading}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.icon }]} />
            <ThemedText style={styles.dividerText}>ou</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.icon }]} />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: colors.text,
                },
              ]}
              placeholder="votre@email.com"
              placeholderTextColor={colors.icon}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Mot de passe</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: colors.text,
                },
              ]}
              placeholder="Votre mot de passe"
              placeholderTextColor={colors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title={isLoading ? 'Connexion...' : 'Se connecter'}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Pas encore de compte ?</ThemedText>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <ThemedText style={[styles.link, { color: colors.tint }]}>
                Creer un compte
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  form: {
    gap: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    opacity: 0.5,
    fontSize: 14,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  footerText: {
    opacity: 0.7,
  },
  link: {
    fontWeight: '600',
  },
});
