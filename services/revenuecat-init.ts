/**
 * Initialisation RevenueCat au demarrage de l'app.
 * Desactive en Expo Go (module natif absent) ; actif en dev build (expo run:ios / run:android).
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

export function initRevenueCat(): void {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
  if (Constants.appOwnership === 'expo') return; // Expo Go = pas de module natif, on skip tout
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
  if (!apiKey) return;

  try {
    const Purchases = require('react-native-purchases').default;
    if (!Purchases?.configure) return;
    Purchases.configure({ apiKey });
  } catch {
    // Module natif absent ou non lie
  }
}
