import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  Timestamp,
  limit,
  doc,
  updateDoc,
  writeBatch,
  deleteField,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { FacePPAttributes, PSLTier, DetailedScores, User, LandmarkMetrics } from '@/types/firebase';
import { calculateUpdatedAnalytics } from './analytics-service';

export interface LooksmaxingTipStored {
  title: string;
  description: string;
}

export interface SaveScanParams {
  userId: string;
  photoUri: string;
  pslRating: number;
  tier: PSLTier;
  percentile: number;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  summary?: string;
  looksmaxingTips?: LooksmaxingTipStored[];
  rawAttributes?: FacePPAttributes;
  detailedScores?: DetailedScores;
  user?: User; // Current user data for analytics update
  bestFeature?: string;
  landmarkMetrics?: LandmarkMetrics;
  metricDescriptions?: Record<string, string>;
}

export async function saveScan(params: SaveScanParams): Promise<string | null> {
  try {
    const {
      userId,
      photoUri,
      pslRating,
      tier,
      percentile,
      strengths,
      weaknesses,
      improvements,
      summary,
      looksmaxingTips,
      rawAttributes,
      detailedScores,
      user,
      bestFeature,
      landmarkMetrics,
      metricDescriptions,
    } = params;

    // Build scan data, excluding undefined fields (Firestore doesn't accept undefined)
    const scanData: Record<string, unknown> = {
      photoUrl: photoUri,
      pslRating,
      tier,
      percentile,
      createdAt: Timestamp.now(),
    };

    // Only add optional fields if they have values
    if (strengths && strengths.length > 0) {
      scanData.strengths = strengths;
    }
    if (weaknesses && weaknesses.length > 0) {
      scanData.weaknesses = weaknesses;
    }
    if (improvements && improvements.length > 0) {
      scanData.improvements = improvements;
    }
    if (summary && summary.trim()) {
      scanData.summary = summary.trim();
    }
    if (looksmaxingTips && looksmaxingTips.length > 0) {
      scanData.looksmaxingTips = looksmaxingTips.filter(
        (t) => t && typeof t.title === 'string' && typeof t.description === 'string'
      );
    }
    if (rawAttributes) {
      scanData.rawAttributes = rawAttributes;
    }
    if (detailedScores) {
      scanData.detailedScores = detailedScores;
    }
    if (landmarkMetrics && Object.keys(landmarkMetrics).length > 0) {
      scanData.landmarkMetrics = landmarkMetrics;
    }
    if (metricDescriptions && Object.keys(metricDescriptions).length > 0) {
      scanData.metricDescriptions = metricDescriptions;
    }

    const scansRef = collection(db, 'users', userId, 'scans');
    const docRef = await addDoc(scansRef, scanData);

    // Update user analytics if user data is provided
    if (user) {
      try {
        const updatedAnalytics = calculateUpdatedAnalytics(user, pslRating, bestFeature);
        const userRef = doc(db, 'users', userId);
        // Convert to plain object for Firestore
        await updateDoc(userRef, { ...updatedAnalytics });
        console.log('User analytics updated');
      } catch (analyticsError) {
        console.error('Error updating analytics:', analyticsError);
        // Don't fail the whole operation if analytics update fails
      }
    }

    console.log('Scan saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan:', error);
    return null;
  }
}

export interface ScanWithId {
  id: string;
  photoUrl: string;
  pslRating?: number;
  tier?: PSLTier;
  percentile: number;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  createdAt: Timestamp;
  rawAttributes?: FacePPAttributes;
  detailedScores?: DetailedScores;
  landmarkMetrics?: LandmarkMetrics;
  metricDescriptions?: Record<string, string>;
  // Backward compatibility with old scans
  globalScore?: number;
  halos?: string[];
  failos?: string[];
}

export async function getUserScans(
  userId: string,
  maxResults: number = 50
): Promise<ScanWithId[]> {
  try {
    const scansRef = collection(db, 'users', userId, 'scans');
    const q = query(scansRef, orderBy('createdAt', 'desc'), limit(maxResults));
    const querySnapshot = await getDocs(q);

    const scans: ScanWithId[] = [];
    querySnapshot.forEach((doc) => {
      scans.push({
        id: doc.id,
        ...doc.data(),
      } as ScanWithId);
    });

    return scans;
  } catch (error) {
    console.error('Error getting user scans:', error);
    return [];
  }
}

// Interface pour le dernier scan (conseils / Dernier scan)
export interface LastScanData {
  pslRating?: number;
  tier?: PSLTier;
  createdAt?: Timestamp;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  summary?: string;
  looksmaxingTips?: LooksmaxingTipStored[];
  rawAttributes?: FacePPAttributes;
  detailedScores?: DetailedScores;
  landmarkMetrics?: LandmarkMetrics;
  metricDescriptions?: Record<string, string>;
}

// Recupere uniquement le dernier scan pour la page Conseils
export async function getLastScan(userId: string): Promise<LastScanData | null> {
  try {
    const scansRef = collection(db, 'users', userId, 'scans');
    const q = query(scansRef, orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      pslRating: data.pslRating,
      tier: data.tier,
      createdAt: data.createdAt,
      strengths: data.strengths ?? data.halos ?? [],
      weaknesses: data.weaknesses ?? data.failos ?? [],
      improvements: data.improvements ?? [],
      summary: data.summary,
      looksmaxingTips: Array.isArray(data.looksmaxingTips) ? data.looksmaxingTips : undefined,
      rawAttributes: data.rawAttributes,
      detailedScores: data.detailedScores,
      landmarkMetrics: data.landmarkMetrics,
      metricDescriptions: data.metricDescriptions,
    };
  } catch (error) {
    console.error('Error getting last scan:', error);
    return null;
  }
}

export function formatScanDate(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Aujourd'hui";
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

const BATCH_SIZE = 500;

/**
 * Reinitialise toute la progression : supprime tous les scans et remet les stats a zero.
 * Utile si tu utilises l'app pour scanner d'autres personnes.
 * Ne modifie pas : scansRemaining, isPremium, email, genre, age, etc.
 */
export async function resetProgression(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const scansRef = collection(db, 'users', userId, 'scans');
    const snapshot = await getDocs(scansRef);
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + BATCH_SIZE);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      currentStreak: 0,
      longestStreak: 0,
      lastScanDate: deleteField(),
      totalScans: 0,
      bestScore: 0,
      averageScore: 0,
      bestFeature: deleteField(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error resetting progression:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
