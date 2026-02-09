import { Timestamp } from 'firebase/firestore';

export type UserGender = 'homme' | 'femme';

export interface User {
  email: string;
  createdAt: Timestamp;
  scansRemaining: number;
  isPremium: boolean;
  detailedReportsRemaining: number;
  gender?: UserGender;
  age?: number;
  // Streak & Analytics
  currentStreak?: number;
  longestStreak?: number;
  lastScanDate?: Timestamp;
  totalScans?: number;
  bestScore?: number;
  averageScore?: number;
  bestFeature?: string;
}

// PSL Tier System
export type PSLTier = 'subhuman' | 'ltn' | 'mtn' | 'htn' | 'chadlite' | 'chad' | 'gigachad';

export interface TierInfo {
  tier: PSLTier;
  label: string;
  description: string;
  color: string;
}

export const TIER_INFO: Record<PSLTier, TierInfo> = {
  subhuman: {
    tier: 'subhuman',
    label: 'Debutant',
    description: 'En dessous de la moyenne - gros potentiel d\'amelioration',
    color: '#ef4444',
  },
  ltn: {
    tier: 'ltn',
    label: 'Normie -',
    description: 'Legerement sous la moyenne',
    color: '#f97316',
  },
  mtn: {
    tier: 'mtn',
    label: 'Normie',
    description: 'Dans la moyenne',
    color: '#eab308',
  },
  htn: {
    tier: 'htn',
    label: 'Normie +',
    description: 'Au dessus de la moyenne',
    color: '#84cc16',
  },
  chadlite: {
    tier: 'chadlite',
    label: 'Attractif',
    description: 'Tres attractif - Top 15%',
    color: '#22c55e',
  },
  chad: {
    tier: 'chad',
    label: 'Tres attractif',
    description: 'Excellente apparence - Top 5%',
    color: '#14b8a6',
  },
  gigachad: {
    tier: 'gigachad',
    label: 'Top model',
    description: 'Niveau mannequin - Top 1%',
    color: '#8b5cf6',
  },
};

// Look Archetype System
export type LookArchetype =
  | 'youthful_charmer'
  | 'modern_masculine'
  | 'classic_beauty'
  | 'natural_radiance'
  | 'refined_elegant'
  | 'bold_presence';

export interface ArchetypeInfo {
  id: LookArchetype;
  label: string;
  labelEn: string;
  description: string;
  icon: string;
}

export const ARCHETYPE_INFO: Record<LookArchetype, ArchetypeInfo> = {
  youthful_charmer: {
    id: 'youthful_charmer',
    label: 'Charme Juvenil',
    labelEn: 'Youthful Charmer',
    description: 'Apparence jeune et charmeuse, traits doux et attrayants',
    icon: '✨',
  },
  modern_masculine: {
    id: 'modern_masculine',
    label: 'Masculin Moderne',
    labelEn: 'Modern Masculine',
    description: 'Traits masculins forts, machoire definie et presence affirmee',
    icon: '💪',
  },
  classic_beauty: {
    id: 'classic_beauty',
    label: 'Beaute Classique',
    labelEn: 'Classic Beauty',
    description: 'Harmonie des traits, proportions equilibrees et elegance intemporelle',
    icon: '👑',
  },
  natural_radiance: {
    id: 'natural_radiance',
    label: 'Eclat Naturel',
    labelEn: 'Natural Radiance',
    description: 'Peau rayonnante, fraicheur naturelle et vitalite visible',
    icon: '🌟',
  },
  refined_elegant: {
    id: 'refined_elegant',
    label: 'Elegance Raffinee',
    labelEn: 'Refined Elegant',
    description: 'Sophistication et grace, traits fins et distinctifs',
    icon: '💎',
  },
  bold_presence: {
    id: 'bold_presence',
    label: 'Presence Affirmee',
    labelEn: 'Bold Presence',
    description: 'Impact visuel fort, traits memorables et charisme naturel',
    icon: '🔥',
  },
};

// Detailed Scores for the 9-score grid
export interface DetailedScores {
  symmetry: number;    // 0-100: Face symmetry
  skin: number;        // 0-100: Skin quality
  jawline: number;     // 0-100: Jawline definition
  eyeArea: number;     // 0-100: Eye area (cernes, etc.)
  cheekbones: number;  // 0-100: Cheekbones
  eyebrows: number;    // 0-100: Eyebrow shape
  glow: number;        // 0-100: Overall glow/radiance
  hair: number;        // 0-100: Hair (default 75)
  harmony: number;     // 0-100: Overall facial harmony
}

export interface Scan {
  photoUrl: string;
  pslRating: number; // 1-10 PSL scale
  tier: PSLTier;
  percentile: number;
  createdAt: Timestamp;
  strengths?: string[]; // Points forts
  weaknesses?: string[]; // Points faibles
  improvements?: string[]; // Conseils d'amelioration
  rawAttributes?: FacePPAttributes;
  landmarkMetrics?: LandmarkMetrics;
  // New features
  archetype?: LookArchetype;
  detailedScores?: DetailedScores;
  // Backward compatibility
  halos?: string[];
  failos?: string[];
}

export interface AuthState {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Face++ Landmark Types
export interface LandmarkPoint {
  x: number;
  y: number;
}

export interface FacePPLandmark {
  // Contour (21 points)
  contour_chin: LandmarkPoint;
  contour_left1: LandmarkPoint;
  contour_left2: LandmarkPoint;
  contour_left3: LandmarkPoint;
  contour_left4: LandmarkPoint;
  contour_left5: LandmarkPoint;
  contour_left6: LandmarkPoint;
  contour_left7: LandmarkPoint;
  contour_left8: LandmarkPoint;
  contour_left9: LandmarkPoint;
  contour_right1: LandmarkPoint;
  contour_right2: LandmarkPoint;
  contour_right3: LandmarkPoint;
  contour_right4: LandmarkPoint;
  contour_right5: LandmarkPoint;
  contour_right6: LandmarkPoint;
  contour_right7: LandmarkPoint;
  contour_right8: LandmarkPoint;
  contour_right9: LandmarkPoint;
  // Left eye (8 points)
  left_eye_bottom: LandmarkPoint;
  left_eye_center: LandmarkPoint;
  left_eye_left_corner: LandmarkPoint;
  left_eye_lower_left_quarter: LandmarkPoint;
  left_eye_lower_right_quarter: LandmarkPoint;
  left_eye_pupil: LandmarkPoint;
  left_eye_right_corner: LandmarkPoint;
  left_eye_top: LandmarkPoint;
  left_eye_upper_left_quarter: LandmarkPoint;
  left_eye_upper_right_quarter: LandmarkPoint;
  // Right eye (8 points)
  right_eye_bottom: LandmarkPoint;
  right_eye_center: LandmarkPoint;
  right_eye_left_corner: LandmarkPoint;
  right_eye_lower_left_quarter: LandmarkPoint;
  right_eye_lower_right_quarter: LandmarkPoint;
  right_eye_pupil: LandmarkPoint;
  right_eye_right_corner: LandmarkPoint;
  right_eye_top: LandmarkPoint;
  right_eye_upper_left_quarter: LandmarkPoint;
  right_eye_upper_right_quarter: LandmarkPoint;
  // Left eyebrow (8 points)
  left_eyebrow_left_corner: LandmarkPoint;
  left_eyebrow_lower_left_quarter: LandmarkPoint;
  left_eyebrow_lower_middle: LandmarkPoint;
  left_eyebrow_lower_right_quarter: LandmarkPoint;
  left_eyebrow_right_corner: LandmarkPoint;
  left_eyebrow_upper_left_quarter: LandmarkPoint;
  left_eyebrow_upper_middle: LandmarkPoint;
  left_eyebrow_upper_right_quarter: LandmarkPoint;
  // Right eyebrow (8 points)
  right_eyebrow_left_corner: LandmarkPoint;
  right_eyebrow_lower_left_quarter: LandmarkPoint;
  right_eyebrow_lower_middle: LandmarkPoint;
  right_eyebrow_lower_right_quarter: LandmarkPoint;
  right_eyebrow_right_corner: LandmarkPoint;
  right_eyebrow_upper_left_quarter: LandmarkPoint;
  right_eyebrow_upper_middle: LandmarkPoint;
  right_eyebrow_upper_right_quarter: LandmarkPoint;
  // Nose (13 points)
  nose_contour_left1: LandmarkPoint;
  nose_contour_left2: LandmarkPoint;
  nose_contour_left3: LandmarkPoint;
  nose_contour_lower_middle: LandmarkPoint;
  nose_contour_right1: LandmarkPoint;
  nose_contour_right2: LandmarkPoint;
  nose_contour_right3: LandmarkPoint;
  nose_left: LandmarkPoint;
  nose_right: LandmarkPoint;
  nose_tip: LandmarkPoint;
  // Mouth (22 points)
  mouth_left_corner: LandmarkPoint;
  mouth_lower_lip_bottom: LandmarkPoint;
  mouth_lower_lip_left_contour1: LandmarkPoint;
  mouth_lower_lip_left_contour2: LandmarkPoint;
  mouth_lower_lip_left_contour3: LandmarkPoint;
  mouth_lower_lip_right_contour1: LandmarkPoint;
  mouth_lower_lip_right_contour2: LandmarkPoint;
  mouth_lower_lip_right_contour3: LandmarkPoint;
  mouth_lower_lip_top: LandmarkPoint;
  mouth_right_corner: LandmarkPoint;
  mouth_upper_lip_bottom: LandmarkPoint;
  mouth_upper_lip_left_contour1: LandmarkPoint;
  mouth_upper_lip_left_contour2: LandmarkPoint;
  mouth_upper_lip_left_contour3: LandmarkPoint;
  mouth_upper_lip_right_contour1: LandmarkPoint;
  mouth_upper_lip_right_contour2: LandmarkPoint;
  mouth_upper_lip_right_contour3: LandmarkPoint;
  mouth_upper_lip_top: LandmarkPoint;
}

export interface LandmarkMetrics {
  fwhr: { value: number; score: number };         // Face Width-to-Height Ratio
  symmetry: { value: number; score: number };      // Deviation % (0 = perfect)
  faceThirds: { upper: number; middle: number; lower: number; score: number }; // % of each third
  jawAngle: { value: number; score: number };      // Degrees at gonion
  canthalTilt: { value: number; score: number };   // Degrees of eye tilt
  ipdRatio: { value: number; score: number };      // IPD / face width % (eye spacing ratio)
  noseRatio: { value: number; score: number };     // Nose width / face width %
  mouthRatio: { value: number; score: number };    // Mouth width / face width %
  lipRatio: { value: number; score: number };      // Upper lip to lower lip ratio (lower/upper)
  midfaceRatio?: { value: number; score: number }; // Midface height / face height
  philtrumToChinRatio?: { value: number; score: number }; // Philtrum length / chin length
}

// Face++ API Response Types
export interface FacePPAttributes {
  beauty: {
    female_score: number;
    male_score: number;
  };
  skinstatus: {
    dark_circle: number;
    stain: number;
    acne: number;
    health: number;
  };
  age: {
    value: number;
  };
  gender: {
    value: string;
  };
  emotion: Record<string, number>;
  facequality: {
    value: number;
    threshold: number;
  };
}

export interface FacePPFace {
  face_token: string;
  face_rectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  attributes: FacePPAttributes;
  landmark?: FacePPLandmark;
}

export interface FacePPResponse {
  request_id: string;
  faces: FacePPFace[];
  image_id: string;
  time_used: number;
  error_message?: string;
}
