import { useTheme } from '@/contexts/theme-context';

export function useColorScheme(): 'light' | 'dark' {
  const { isDark } = useTheme();
  return isDark ? 'dark' : 'light';
}
