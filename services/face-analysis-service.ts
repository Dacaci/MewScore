import { FacePPResponse, FacePPAttributes, PSLTier, TIER_INFO, UserGender, DetailedScores, LandmarkMetrics } from '@/types/firebase';
import type { FacialMetricKey } from '@/services/landmark-metrics-service';
import { analyzeWithGemini, isGeminiConfigured, type LooksmaxingTip } from './gemini-service';
import { calculateDetailedScores, getBestFeature, SCORE_LABELS } from './score-mapping-service';
import { computeLandmarkMetrics } from './landmark-metrics-service';

const FACEPP_API_URL = 'https://api-us.faceplusplus.com/facepp/v3/detect';
const API_KEY = process.env.EXPO_PUBLIC_FACEPP_API_KEY;
const API_SECRET = process.env.EXPO_PUBLIC_FACEPP_API_SECRET;

export interface AnalysisResult {
  pslRating: number; // 1-10 PSL scale
  tier: PSLTier;
  percentile: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary?: string;
  rawData?: FacePPAttributes;
  usedGemini?: boolean;
  // New features
  detailedScores?: DetailedScores;
  bestFeature?: string;
  /** Métriques faciales dérivées des landmarks (indépendantes du score PSL). */
  landmarkMetrics?: LandmarkMetrics;
  /** Descriptions personnalisées par métrique (générées par Gemini). */
  metricDescriptions?: Partial<Record<FacialMetricKey, string>>;
  /** Conseils looksmaxing (Gemini ou fallback général). */
  looksmaxingTips?: LooksmaxingTip[];
}

export interface AnalysisError {
  code: 'NO_FACE' | 'BLURRY' | 'API_ERROR' | 'TIMEOUT' | 'CONFIG_ERROR';
  message: string;
}

// Get beauty score based on user gender
function getBeautyScore(beauty: FacePPAttributes['beauty'], gender?: UserGender | null): number {
  if (gender === 'homme') return beauty.male_score;
  if (gender === 'femme') return beauty.female_score;
  return (beauty.female_score + beauty.male_score) / 2;
}

// Convert beauty score (0-100) to PSL rating (1-10)
function calculatePSL(beautyScore: number): number {
  return Math.max(1, Math.min(10, beautyScore / 10));
}

// Get tier from PSL rating
export function getTier(psl: number): PSLTier {
  if (psl >= 8) return 'gigachad';
  if (psl >= 7) return 'chad';
  if (psl >= 6) return 'chadlite';
  if (psl >= 5) return 'htn';
  if (psl >= 4) return 'mtn';
  if (psl >= 3) return 'ltn';
  return 'subhuman';
}

/** Seuils PSL minimum par palier (pour afficher "prochain palier : X") */
const TIER_MIN_PSL: Record<PSLTier, number> = {
  subhuman: 0,
  ltn: 3,
  mtn: 4,
  htn: 5,
  chadlite: 6,
  chad: 7,
  gigachad: 8,
};

const TIER_ORDER: PSLTier[] = ['subhuman', 'ltn', 'mtn', 'htn', 'chadlite', 'chad', 'gigachad'];

/**
 * Retourne le prochain palier a atteindre et le nombre de points manquants.
 * Null si deja au palier max (gigachad).
 */
export function getNextTierGoal(psl: number): {
  nextTier: PSLTier;
  nextMin: number;
  gap: number;
  label: string;
} | null {
  const currentTier = getTier(psl);
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex < 0 || currentIndex >= TIER_ORDER.length - 1) return null;
  const nextTier = TIER_ORDER[currentIndex + 1];
  const nextMin = TIER_MIN_PSL[nextTier];
  const gap = Math.round((nextMin - psl) * 10) / 10;
  if (gap <= 0) return null;
  return {
    nextTier,
    nextMin,
    gap,
    label: TIER_INFO[nextTier].label,
  };
}

// Calculate percentile from PSL
function calculatePercentile(psl: number): number {
  if (psl >= 8) return 1;
  if (psl >= 7) return 5;
  if (psl >= 6) return 15;
  if (psl >= 5) return 35;
  if (psl >= 4) return 55;
  if (psl >= 3) return 75;
  return 90;
}

// Fallback: Basic rule-based strengths identification
function identifyStrengthsBasic(attributes: FacePPAttributes): string[] {
  const strengths: string[] = [];
  const { beauty, skinstatus } = attributes;
  const beautyAvg = (beauty.female_score + beauty.male_score) / 2;

  if (beautyAvg >= 70) strengths.push('Bonnes proportions faciales');
  if (skinstatus.health >= 70) strengths.push('Peau en bonne sante');
  if (skinstatus.acne <= 20) strengths.push('Peau claire sans imperfections');
  if (skinstatus.dark_circle <= 30) strengths.push('Regard frais, peu de cernes');
  if (skinstatus.stain <= 20) strengths.push('Teint uniforme');

  return strengths.slice(0, 4);
}

// Fallback: Basic rule-based weaknesses identification
function identifyWeaknessesBasic(attributes: FacePPAttributes): string[] {
  const weaknesses: string[] = [];
  const { beauty, skinstatus } = attributes;
  const beautyAvg = (beauty.female_score + beauty.male_score) / 2;

  if (skinstatus.dark_circle >= 50) weaknesses.push('Cernes visibles');
  if (skinstatus.acne >= 40) weaknesses.push('Acne a traiter');
  if (skinstatus.stain >= 40) weaknesses.push('Taches et hyperpigmentation');
  if (skinstatus.health <= 50) weaknesses.push('Qualité de peau à améliorer');
  if (beautyAvg < 60) weaknesses.push('Proportions faciales a optimiser');

  return weaknesses.slice(0, 4);
}

/** Conseils looksmaxing généraux si Gemini ne renvoie rien. */
const LOOKSMAXING_TIPS_FALLBACK: LooksmaxingTip[] = [
  { title: 'Mewing', description: 'Garde la langue collée au palais en permanence, bouche fermée et dents en contact léger. À faire même en dormant. Aide à restructurer la mâchoire et le menton sur le long terme.' },
  { title: 'Mastication', description: 'Mâche un chewing-gum dur (Falim, Mastic) 30 à 60 min par jour en alternant les côtés. Renforce les masseters et améliore la définition de la mâchoire.' },
  { title: 'Masse grasse', description: 'Viser 12–15 % de masse grasse (homme) ou 18–22 % (femme) pour révéler la structure osseuse. Le gras facial masque les pommettes et la mâchoire.' },
  { title: 'Sommeil et eau', description: 'Minimum 7–8 h de sommeil et 2 L d\'eau par jour. Le manque de sommeil accentue les cernes et la rétention d\'eau ; l\'hydratation améliore le teint.' },
  { title: 'Skincare', description: 'Nettoyant doux + hydratant + SPF 50 au quotidien. Ajoute un sérum vitamine C le matin et du rétinol le soir (0,3 %) si tu as 25 ans ou plus.' },
  { title: 'Style', description: 'Homme : barbe de 3–5 mm pour structurer la mâchoire. Femme : contouring léger sous les pommettes et highlighter sur l\'arcade pour mettre en valeur les traits.' },
];

// Fallback: Basic rule-based improvements
function identifyImprovementsBasic(attributes: FacePPAttributes, gender?: UserGender | null): string[] {
  const improvements: string[] = [];
  const { skinstatus } = attributes;

  if (skinstatus.dark_circle >= 40) {
    improvements.push('Dors 8h par nuit et utilise une creme contour des yeux');
  }
  if (skinstatus.acne >= 30) {
    improvements.push('Adopte une routine skincare avec nettoyant et acide salicylique');
  }
  if (skinstatus.stain >= 30) {
    improvements.push('Utilise un serum vitamine C et de la creme solaire SPF50');
  }
  if (skinstatus.health <= 60) {
    improvements.push('Hydrate-toi bien et utilise un hydratant adapte');
  }

  improvements.push('Pratique le mewing pour améliorer ta posture faciale');

  if (gender === 'homme') {
    improvements.push('Une barbe bien taillee peut structurer ton visage');
  } else if (gender === 'femme') {
    improvements.push('Le contouring peut mettre en valeur tes traits');
  }

  return improvements.slice(0, 5);
}

export async function analyzeFace(
  imageBase64: string,
  includeDetails: boolean,
  gender?: UserGender | null,
  age?: number | null
): Promise<{ success: true; result: AnalysisResult } | { success: false; error: AnalysisError }> {
  // Check API configuration
  if (!API_KEY || !API_SECRET || API_KEY === 'your_api_key_here') {
    return {
      success: false,
      error: {
        code: 'CONFIG_ERROR',
        message: 'API Face++ non configurée. Veuillez ajouter vos clés API dans le fichier .env',
      },
    };
  }

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('api_key', API_KEY);
    formData.append('api_secret', API_SECRET);
    formData.append('image_base64', imageBase64);
    formData.append('return_attributes', 'beauty,skinstatus,age,gender,emotion,facequality');
    formData.append('return_landmark', '1');

    // Call Face++ API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(FACEPP_API_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: "Erreur d'analyse. Veuillez réessayer.",
        },
      };
    }

    const data: FacePPResponse = await response.json();

    // Check for API error
    if (data.error_message) {
      console.error('Face++ API error:', data.error_message);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: "Erreur d'analyse. Veuillez réessayer.",
        },
      };
    }

    // Check if face was detected
    if (!data.faces || data.faces.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_FACE',
          message: 'Aucun visage détecté. Veuillez réessayer avec une photo claire de votre visage.',
        },
      };
    }

    const face = data.faces[0];
    const { attributes } = face;

    // Check if beauty attribute is available
    if (!attributes?.beauty) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: "L'attribut beaute n'est pas disponible. Verifiez votre plan Face++.",
        },
      };
    }

    // Check face quality
    if (attributes.facequality && attributes.facequality.value < attributes.facequality.threshold * 0.5) {
      return {
        success: false,
        error: {
          code: 'BLURRY',
          message: 'Photo trop floue. Prenez une photo plus nette.',
        },
      };
    }

    // Calculate PSL rating
    const beautyAvg = getBeautyScore(attributes.beauty, gender);
    const pslRating = Math.round(calculatePSL(beautyAvg) * 10) / 10;
    const tier = getTier(pslRating);
    const percentile = calculatePercentile(pslRating);

    let landmarkMetrics: LandmarkMetrics | undefined;
    if (face.landmark) {
      try {
        landmarkMetrics = computeLandmarkMetrics(face.landmark);
      } catch (e) {
        console.warn('Landmark metrics computation failed:', e);
      }
    }

    // Try Gemini for intelligent analysis
    let strengths: string[];
    let weaknesses: string[];
    let improvements: string[];
    let summary: string | undefined;
    let usedGemini = false;
    let metricDescriptions: AnalysisResult['metricDescriptions'];
    let looksmaxingTips: LooksmaxingTip[] = LOOKSMAXING_TIPS_FALLBACK;

    if (isGeminiConfigured() && includeDetails) {
      const geminiResult = await analyzeWithGemini({
        gender,
        age,
        pslRating,
        tier,
        percentile,
        faceAttributes: attributes,
        landmarkMetrics: landmarkMetrics ?? undefined,
      });

      if (geminiResult) {
        strengths = geminiResult.strengths;
        weaknesses = geminiResult.weaknesses;
        improvements = geminiResult.improvements;
        summary = geminiResult.summary;
        metricDescriptions = geminiResult.metricDescriptions;
        if (geminiResult.looksmaxingTips && geminiResult.looksmaxingTips.length > 0) {
          looksmaxingTips = geminiResult.looksmaxingTips;
        }
        usedGemini = true;
      } else {
        // Fallback to basic rules
        strengths = identifyStrengthsBasic(attributes);
        weaknesses = identifyWeaknessesBasic(attributes);
        improvements = identifyImprovementsBasic(attributes, gender);
      }
    } else {
      // Basic rule-based analysis
      strengths = identifyStrengthsBasic(attributes);
      weaknesses = identifyWeaknessesBasic(attributes);
      improvements = identifyImprovementsBasic(attributes, gender);
    }

    // Calculate detailed scores
    const detailedScores = calculateDetailedScores(attributes, gender);
    const bestFeatureKey = getBestFeature(detailedScores);
    const bestFeature = SCORE_LABELS[bestFeatureKey].label;

    // Build result
    const result: AnalysisResult = {
      pslRating,
      tier,
      percentile,
      strengths,
      weaknesses,
      improvements,
      detailedScores,
      bestFeature,
    };

    if (summary) {
      result.summary = summary;
    }
    if (usedGemini) {
      result.usedGemini = usedGemini;
    }
    if (includeDetails) {
      result.rawData = attributes;
    }

    if (landmarkMetrics) result.landmarkMetrics = landmarkMetrics;
    if (metricDescriptions && Object.keys(metricDescriptions).length > 0) result.metricDescriptions = metricDescriptions;
    if (includeDetails) result.looksmaxingTips = looksmaxingTips;

    return { success: true, result };
  } catch (error) {
    console.error('Face analysis error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Delai depasse. Verifiez votre connexion.',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: "Erreur d'analyse. Veuillez réessayer.",
      },
    };
  }
}

// Export tier info helper
export function getTierInfo(tier: PSLTier) {
  return TIER_INFO[tier];
}
