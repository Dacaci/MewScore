import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  title?: string;
}

export function GoogleSignInButton({
  onPress,
  disabled = false,
  title = 'Continuer avec Google',
}: GoogleSignInButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDark ? '#fff' : '#fff',
          borderColor: isDark ? '#444' : '#ddd',
        },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.googleIcon}>G</Text>
        </View>
        <Text style={[styles.text, { color: '#333' }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
