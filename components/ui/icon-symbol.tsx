// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type IconMapping = Record<string, MaterialIconName>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'clock.fill': 'history',
  'person.fill': 'person',
  'camera.fill': 'camera-alt',
  'lock.fill': 'lock',
  'photo.fill': 'photo-library',
  'arrow.triangle.2.circlepath.camera': 'flip-camera-ios',
  'exclamationmark.triangle.fill': 'warning',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',
  'heart.slash': 'heart-broken',
  'person.2.slash': 'people',
  'briefcase': 'work',
  'face.smiling': 'sentiment-satisfied',
  'face.smiling.inverse': 'sentiment-dissatisfied',
  'chart.line.downtrend.xyaxis': 'trending-down',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'list.bullet.clipboard.fill': 'assignment',
  'star.fill': 'star',
  'pencil': 'edit',
  // Détail par catégorie (looksmax)
  'square.on.square': 'crop-square',
  'person.crop.square': 'person',
  'arrow.left.arrow.right': 'swap-horiz',
  'arrow.left.and.right': 'swap-horiz',
  'eye': 'visibility',
  'eyes': 'visibility',
  'sparkles': 'auto-awesome',
  'circle.fill': 'circle',
  'circle.lefthalf.filled': 'trip-origin',
  'nose': 'face',
  'mouth': 'face',
  'mouth.fill': 'face',
  // Paywall & UI
  'infinity': 'all-inclusive',
  'doc.text.fill': 'description',
  'lightbulb.fill': 'lightbulb',
  'xmark': 'close',
  'checkmark.circle.fill': 'check-circle',
  'gearshape.fill': 'settings',
  'rectangle.portrait.and.arrow.right': 'logout',
  'trash.fill': 'delete',
  'moon.fill': 'dark-mode',
};

const FALLBACK_ICON: MaterialIconName = 'category';

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName | string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}) {
  const resolvedName = (MAPPING as Record<string, MaterialIconName>)[name] ?? FALLBACK_ICON;
  return <MaterialIcons color={color} size={size} name={resolvedName} style={style} />;
}
