/**
 * MewScore Theme - Minimaliste Apple Style
 * Bleu électrique comme accent, mode clair par défaut
 */

import { Platform } from 'react-native';

// Couleur principale - Bleu électrique
const primaryBlue = '#3B82F6';
const primaryBlueLight = '#60A5FA';

export const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    tint: primaryBlue,
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryBlue,
    border: '#E5E7EB',
    shadow: '#000000',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    card: '#1E293B',
    cardElevated: '#334155',
    tint: primaryBlueLight,
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: primaryBlueLight,
    border: '#334155',
    shadow: '#000000',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
