import { Timestamp } from 'firebase/firestore';
import { User } from '@/types/firebase';
import { ScanWithId } from './scan-service';

/**
 * Analytics Service
 * Handles streak calculations, score trends, and user statistics
 */

// Check if two dates are consecutive days
function areConsecutiveDays(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Calculate streak based on last scan date
export function calculateNewStreak(
  lastScanDate: Timestamp | undefined,
  currentStreak: number
): { newStreak: number; isNewDay: boolean } {
  const now = new Date();

  if (!lastScanDate) {
    // First scan ever
    return { newStreak: 1, isNewDay: true };
  }

  const lastDate = lastScanDate.toDate();

  if (isSameDay(lastDate, now)) {
    // Same day, streak doesn't change
    return { newStreak: currentStreak, isNewDay: false };
  }

  if (areConsecutiveDays(lastDate, now)) {
    // Consecutive day, increment streak
    return { newStreak: currentStreak + 1, isNewDay: true };
  }

  // More than 1 day gap, reset streak
  return { newStreak: 1, isNewDay: true };
}

// Calculate average score from scans
export function calculateAverageScore(scans: ScanWithId[]): number {
  if (scans.length === 0) return 0;

  const total = scans.reduce((sum, scan) => {
    const score = scan.pslRating ?? scan.globalScore ?? 0;
    return sum + score;
  }, 0);

  return Math.round((total / scans.length) * 10) / 10;
}

// Find best score from scans
export function findBestScore(scans: ScanWithId[]): number {
  if (scans.length === 0) return 0;

  return scans.reduce((best, scan) => {
    const score = scan.pslRating ?? scan.globalScore ?? 0;
    return Math.max(best, score);
  }, 0);
}

// Calculate score trend (comparing recent vs older scans)
export function calculateTrend(scans: ScanWithId[]): 'up' | 'down' | 'stable' {
  if (scans.length < 2) return 'stable';

  // Sort by date (newest first)
  const sorted = [...scans].sort(
    (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
  );

  // Take last 3 scans for recent average
  const recentScans = sorted.slice(0, Math.min(3, sorted.length));
  const recentAvg = calculateAverageScore(recentScans);

  // Take older scans for comparison
  const olderScans = sorted.slice(Math.min(3, sorted.length));
  if (olderScans.length === 0) return 'stable';

  const olderAvg = calculateAverageScore(olderScans);

  const diff = recentAvg - olderAvg;
  if (diff > 0.3) return 'up';
  if (diff < -0.3) return 'down';
  return 'stable';
}

// Get analytics data for display
export interface AnalyticsData {
  currentStreak: number;
  longestStreak: number;
  totalScans: number;
  bestScore: number;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
  lastScanDate?: Date;
  /** Dernier score (ex. dernier scan) si disponible */
  lastScore?: number;
  /** Meilleur atout (ex. meilleure feature) si disponible */
  bestFeature?: string;
}

export function getAnalyticsFromUser(user: User, scans?: ScanWithId[]): AnalyticsData {
  const trend = scans ? calculateTrend(scans) : 'stable';

  return {
    currentStreak: user.currentStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    totalScans: user.totalScans ?? 0,
    bestScore: user.bestScore ?? 0,
    averageScore: user.averageScore ?? 0,
    trend,
    lastScanDate: user.lastScanDate?.toDate(),
    bestFeature: user.bestFeature,
  };
}

// Calculate updated user analytics after a new scan
export interface UpdatedAnalytics {
  currentStreak: number;
  longestStreak: number;
  totalScans: number;
  bestScore: number;
  averageScore: number;
  lastScanDate: Timestamp;
  bestFeature?: string;
}

export function calculateUpdatedAnalytics(
  user: User,
  newPslRating: number,
  newBestFeature?: string
): UpdatedAnalytics {
  const { newStreak, isNewDay } = calculateNewStreak(
    user.lastScanDate,
    user.currentStreak ?? 0
  );

  const currentBestScore = user.bestScore ?? 0;
  const currentTotalScans = user.totalScans ?? 0;
  const currentAverageScore = user.averageScore ?? 0;
  const currentLongestStreak = user.longestStreak ?? 0;

  // Calculate new average (weighted average with new score)
  const newTotalScans = currentTotalScans + 1;
  const newAverageScore =
    Math.round(
      ((currentAverageScore * currentTotalScans + newPslRating) / newTotalScans) * 10
    ) / 10;

  // Update longest streak if current streak is higher
  const newLongestStreak = Math.max(currentLongestStreak, newStreak);

  // Update best score if new score is higher
  const newBestScore = Math.max(currentBestScore, newPslRating);

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    totalScans: newTotalScans,
    bestScore: newBestScore,
    averageScore: newAverageScore,
    lastScanDate: Timestamp.now(),
    bestFeature: newBestFeature ?? user.bestFeature,
  };
}

// Format streak for display
export function formatStreakText(streak: number): string {
  if (streak === 0) return 'Pas de streak';
  if (streak === 1) return '1 jour';
  return `${streak} jours`;
}

// Get motivation message based on streak
export function getStreakMotivation(streak: number): string {
  if (streak === 0) return 'Fais un scan pour commencer ta streak!';
  if (streak < 3) return 'Bon debut! Continue demain.';
  if (streak < 7) return 'Belle streak! Tu es sur la bonne voie.';
  if (streak < 14) return 'Impressionnant! Ta discipline porte ses fruits.';
  if (streak < 30) return 'Incroyable! Tu es tres constant.';
  return 'Legendaire! Tu es un vrai champion.';
}
