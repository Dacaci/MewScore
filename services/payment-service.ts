/**
 * Service de paiement : RevenueCat (offres + achat) + mise a jour Firestore apres succes.
 * En Expo Go on ne charge pas le module natif (getOfferings retourne null, achat = mock Firestore).
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import { applySubscription, applyOneTimePurchase } from './auth-service';

const isExpoGo = Constants.appOwnership === 'expo';

export type PurchaseProduct = 'subscription' | 'pack';

export interface PurchaseResult {
  success: boolean;
  error?: string;
  userCancelled?: boolean;
}

/** Identifiants des packages dans RevenueCat (a configurer dans le dashboard) */
const SUBSCRIPTION_PACKAGE_IDS = ['monthly', '$rc_monthly', 'default'];
const PACK_PACKAGE_IDS = ['pack_15', 'pack', 'onetime', 'lifetime', '$rc_lifetime'];

export interface PaywallOffering {
  subscriptionPackage: { package: PurchasesPackage; priceString: string } | null;
  packPackage: { package: PurchasesPackage; priceString: string } | null;
}

/**
 * Recupere les offres RevenueCat pour le paywall (prix, packages).
 * Retourne null si RevenueCat n'est pas configure ou non disponible (ex. web, Expo Go).
 */
export async function getOfferings(): Promise<PaywallOffering | null> {
  try {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
    if (isExpoGo) return null;
    const { default: Purchases } = await import('react-native-purchases');
    if (!Purchases?.getOfferings) return null;
    const offerings: PurchasesOfferings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current?.availablePackages?.length) return null;

    let subscriptionPackage: { package: PurchasesPackage; priceString: string } | null = null;
    let packPackage: { package: PurchasesPackage; priceString: string } | null = null;

    for (const pkg of current.availablePackages) {
      const id = pkg.identifier;
      const priceString = pkg.product?.priceString ?? '';
      if (SUBSCRIPTION_PACKAGE_IDS.some((s) => id.toLowerCase().includes(s.toLowerCase()))) {
        subscriptionPackage = { package: pkg, priceString };
      } else if (PACK_PACKAGE_IDS.some((s) => id.toLowerCase().includes(s.toLowerCase()))) {
        packPackage = { package: pkg, priceString };
      }
    }

    return { subscriptionPackage, packPackage };
  } catch (e) {
    if (__DEV__) console.warn('[Payment] getOfferings failed:', e);
    return null;
  }
}

/**
 * Lie l'utilisateur RevenueCat a son userId (a appeler quand l'utilisateur est connecte).
 */
export async function loginRevenueCat(userId: string): Promise<void> {
  try {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
    if (isExpoGo) return;
    const { default: Purchases } = await import('react-native-purchases');
    if (!Purchases?.logIn) return;
    await Purchases.logIn(userId);
  } catch (e) {
    if (__DEV__) console.warn('[Payment] logIn failed:', e);
  }
}

/**
 * Achat abonnement : si pkg fourni, lance l'IAP RevenueCat puis met a jour Firestore.
 * Sinon (offres non chargees / dev), applique uniquement Firestore (mock).
 */
export async function purchaseSubscription(
  userId: string,
  pkg: PurchasesPackage | null
): Promise<PurchaseResult> {
  if (pkg && !isExpoGo) {
    try {
      const { default: Purchases } = await import('react-native-purchases');
      await loginRevenueCat(userId);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo) {
        await applySubscription(userId);
        return { success: true };
      }
      return { success: false, error: 'Achat annulé ou échoué.' };
    } catch (err: unknown) {
      const rcError = err as { code?: string; userCancelled?: boolean };
      if (rcError?.code === '1' || rcError?.userCancelled) {
        return { success: false, userCancelled: true };
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'achat.';
      return { success: false, error: message };
    }
  }
  try {
    await applySubscription(userId);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Achat pack one-time : meme logique que purchaseSubscription.
 */
export async function purchasePack(
  userId: string,
  pkg: PurchasesPackage | null
): Promise<PurchaseResult> {
  if (pkg && !isExpoGo) {
    try {
      const { default: Purchases } = await import('react-native-purchases');
      await loginRevenueCat(userId);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo) {
        await applyOneTimePurchase(userId);
        return { success: true };
      }
      return { success: false, error: 'Achat annulé ou échoué.' };
    } catch (err: unknown) {
      const rcError = err as { code?: string; userCancelled?: boolean };
      if (rcError?.code === '1' || rcError?.userCancelled) {
        return { success: false, userCancelled: true };
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'achat.';
      return { success: false, error: message };
    }
  }
  try {
    await applyOneTimePurchase(userId);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
