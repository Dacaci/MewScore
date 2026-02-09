import { FacePPAttributes, DetailedScores, UserGender } from '@/types/firebase';

/**
 * Maps Face++ attributes to 9 detailed visual scores
 *
 * Mapping:
 * - Symmetry: facequality.value (0-100)
 * - Skin: skinstatus.health (0-100)
 * - Jawline: beauty score * 0.8
 * - Eye Area: 100 - dark_circle
 * - Cheekbones: beauty score * 0.75
 * - Eyebrows: beauty score * 0.7
 * - Glow: health * 0.6 + (100 - acne) * 0.4
 * - Hair: 75 (default, no Face++ data)
 * - Harmony: beauty score (gender-specific)
 */

function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

function getBeautyScore(beauty: FacePPAttributes['beauty'], gender?: UserGender | null): number {
  if (gender === 'homme') return beauty.male_score;
  if (gender === 'femme') return beauty.female_score;
  return (beauty.female_score + beauty.male_score) / 2;
}

export function calculateDetailedScores(
  attributes: FacePPAttributes,
  gender?: UserGender | null
): DetailedScores {
  const beauty = getBeautyScore(attributes.beauty, gender);
  const { skinstatus, facequality } = attributes;

  // Symmetry: Based on face quality (higher quality = better symmetry)
  const symmetry = clamp(facequality?.value ?? 70);

  // Skin: Based on skin health
  const skin = clamp(skinstatus?.health ?? 70);

  // Jawline: Derived from beauty score (strong correlation)
  const jawline = clamp(beauty * 0.8);

  // Eye Area: Inverse of dark circles (less dark circles = better score)
  const eyeArea = clamp(100 - (skinstatus?.dark_circle ?? 30));

  // Cheekbones: Derived from beauty score
  const cheekbones = clamp(beauty * 0.75);

  // Eyebrows: Derived from beauty score
  const eyebrows = clamp(beauty * 0.7);

  // Glow: Combination of health and lack of acne
  const health = skinstatus?.health ?? 70;
  const acneScore = 100 - (skinstatus?.acne ?? 30);
  const glow = clamp(health * 0.6 + acneScore * 0.4);

  // Hair: Default value (Face++ doesn't provide hair data)
  const hair = 75;

  // Harmony: Overall facial harmony from beauty score
  const harmony = clamp(beauty);

  return {
    symmetry: Math.round(symmetry),
    skin: Math.round(skin),
    jawline: Math.round(jawline),
    eyeArea: Math.round(eyeArea),
    cheekbones: Math.round(cheekbones),
    eyebrows: Math.round(eyebrows),
    glow: Math.round(glow),
    hair,
    harmony: Math.round(harmony),
  };
}

// Score labels for display
export const SCORE_LABELS: Record<keyof DetailedScores, { label: string; icon: string }> = {
  symmetry: { label: 'Symetrie', icon: '⚖️' },
  skin: { label: 'Peau', icon: '✨' },
  jawline: { label: 'Machoire', icon: '💪' },
  eyeArea: { label: 'Yeux', icon: '👁️' },
  cheekbones: { label: 'Pommettes', icon: '💎' },
  eyebrows: { label: 'Sourcils', icon: '🎯' },
  glow: { label: 'Eclat', icon: '🌟' },
  hair: { label: 'Cheveux', icon: '💇' },
  harmony: { label: 'Harmonie', icon: '🎨' },
};

// Get the best feature from detailed scores
export function getBestFeature(scores: DetailedScores): keyof DetailedScores {
  let best: keyof DetailedScores = 'harmony';
  let maxScore = 0;

  (Object.keys(scores) as Array<keyof DetailedScores>).forEach((key) => {
    if (scores[key] > maxScore) {
      maxScore = scores[key];
      best = key;
    }
  });

  return best;
}

// Get score color based on value
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#84cc16'; // lime
  if (score >= 50) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

// Calculate average of all detailed scores
export function getAverageDetailedScore(scores: DetailedScores): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
}
