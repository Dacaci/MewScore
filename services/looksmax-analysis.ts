import { FacePPAttributes, PSLTier, UserGender, LandmarkMetrics } from '@/types/firebase';
import { getTier } from './face-analysis-service';

export type ScoreLevel = 'critical' | 'warning' | 'good' | 'excellent';

export interface SoftmaxxTip {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MetricAnalysis {
  name: string;
  score: number;
  level: ScoreLevel;
  icon: string;
  description: string;
  softmaxxTips: SoftmaxxTip[];
}

export interface CategoryAnalysis {
  name: string;
  nameEn: string; // Looksmax term
  icon: string;
  score: number;
  level: ScoreLevel;
  metrics: MetricAnalysis[];
}

export interface LooksmaxAnalysis {
  pslRating: number;
  tier: PSLTier;
  potentialPSL: number;
  categories: CategoryAnalysis[];
  prioritySoftmaxx: SoftmaxxTip[];
  halos: string[];
  failos: string[];
}

function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 45) return 'warning';
  return 'critical';
}

function invertScore(value: number, max: number = 100): number {
  return Math.max(0, Math.min(100, max - value));
}

// Convert 0-100 score to PSL equivalent for display
function scoreToPSLEquivalent(score: number): number {
  return Math.round((score / 100) * 10 * 10) / 10;
}

export function analyzeLooksmax(attributes: FacePPAttributes, originalPSL?: number, originalTier?: PSLTier, gender?: UserGender | null, landmarkMetrics?: LandmarkMetrics | null, userAge?: number | null): LooksmaxAnalysis {
  // Use user age, fallback to Face++ detected age
  const age = userAge ?? attributes.age?.value ?? null;
  const { beauty, skinstatus, facequality } = attributes;

  // Calculate base scores using gender-appropriate score
  const beautyAvg = gender === 'homme' ? beauty.male_score
    : gender === 'femme' ? beauty.female_score
    : (beauty.female_score + beauty.male_score) / 2;
  const darkCircleScore = invertScore(skinstatus.dark_circle);
  const acneScore = invertScore(skinstatus.acne);
  const stainScore = invertScore(skinstatus.stain);
  const skinHealthScore = skinstatus.health;
  const symmetryScore = Math.min(100, (facequality.value / facequality.threshold) * 85);

  // ===== CATEGORY 1: BONE STRUCTURE =====
  const boneStructureMetrics: MetricAnalysis[] = landmarkMetrics ? [
    {
      name: 'FWHR',
      score: landmarkMetrics.fwhr.score,
      level: getScoreLevel(landmarkMetrics.fwhr.score),
      icon: 'square.on.square',
      description: `FWHR: ${landmarkMetrics.fwhr.value.toFixed(2)}, ideal: ${gender === 'femme' ? '1.70-1.85' : '1.85-2.05'}`,
      softmaxxTips: landmarkMetrics.fwhr.score >= 70 ? [] : [
        {
          title: 'Mewing (posture de langue)',
          description: 'Langue collée au palais, dents en contact léger, lèvres fermées. À faire en permanence, même en dormant. Aide à élargir le palais et restructurer la mâchoire.',
          priority: 'high',
        },
        {
          title: 'Respiration nasale',
          description: 'Respire exclusivement par le nez. La respiration buccale deforme la structure faciale avec le temps.',
          priority: 'high',
        },
      ],
    },
    {
      name: 'Angle mâchoire',
      score: landmarkMetrics.jawAngle.score,
      level: getScoreLevel(landmarkMetrics.jawAngle.score),
      icon: 'person.crop.square',
      description: `Angle: ${landmarkMetrics.jawAngle.value.toFixed(0)}deg, idéal: ${gender === 'femme' ? '125-135' : '115-125'}deg`,
      softmaxxTips: landmarkMetrics.jawAngle.score >= 70 ? [] : [
        {
          title: 'Mastication intensive',
          description: 'Mâche du chewing-gum dur (Falim, Mastic) 30-60 min/jour en alternant les côtés. Développe les muscles masseters.',
          priority: 'high',
        },
        {
          title: 'Perte de gras facial',
          description: `Descends à ${gender === 'femme' ? '18-22' : '12-15'}% de masse grasse. Le gras facial cache la définition de la mâchoire.`,
          priority: 'high',
        },
      ],
    },
    {
      name: 'Symétrie',
      score: landmarkMetrics.symmetry.score,
      level: getScoreLevel(landmarkMetrics.symmetry.score),
      icon: 'arrow.left.arrow.right',
      description: `Deviation: ${landmarkMetrics.symmetry.value.toFixed(1)}%, ideal: < 5%`,
      softmaxxTips: landmarkMetrics.symmetry.score >= 70 ? [] : [
        ...(gender === 'homme' ? [{
          title: 'Barbe pour equilibrer',
          description: 'Une barbe bien taillée peut masquer les asymétries de la mâchoire et du menton.',
          priority: 'medium' as const,
        }] : [{
          title: 'Coiffure asymetrique',
          description: 'Une raie sur le côté ou des mèches stratégiques peuvent équilibrer visuellement le visage.',
          priority: 'medium' as const,
        }]),
      ],
    },
    {
      name: 'Tiers du visage',
      score: landmarkMetrics.faceThirds.score,
      level: getScoreLevel(landmarkMetrics.faceThirds.score),
      icon: 'face.smiling',
      description: `Repartition: ${landmarkMetrics.faceThirds.upper}/${landmarkMetrics.faceThirds.middle}/${landmarkMetrics.faceThirds.lower}%, ideal: 33/33/33`,
      softmaxxTips: landmarkMetrics.faceThirds.score >= 70 ? [] : [
        ...(landmarkMetrics.faceThirds.upper > 38 ? [{
          title: 'Coiffure pour réduire le front',
          description: 'Une frange ou des mèches sur le front peut équilibrer les proportions si le tiers supérieur est dominant.',
          priority: 'medium' as const,
        }] : landmarkMetrics.faceThirds.middle > 38 ? [{
          title: 'Grooming des sourcils',
          description: 'Des sourcils bien definis peuvent equilibrer visuellement un tiers moyen dominant.',
          priority: 'medium' as const,
        }] : landmarkMetrics.faceThirds.lower > 38 ? [{
          title: 'Coiffure avec volume en haut',
          description: 'Du volume sur le dessus de la tête équilibre visuellement un tiers inférieur plus long.',
          priority: 'medium' as const,
        }] : []),
      ],
    },
  ] : [
    {
      name: 'Proportions du visage',
      score: Math.round(symmetryScore * 0.8 + beautyAvg * 0.2),
      level: getScoreLevel(symmetryScore * 0.8 + beautyAvg * 0.2),
      icon: 'square.on.square',
      description: symmetryScore >= 70
        ? 'Bonnes proportions largeur/hauteur du visage'
        : 'Proportions du visage à optimiser',
      softmaxxTips: symmetryScore >= 70 ? [] : [
        {
          title: 'Mewing (posture de langue)',
          description: 'Langue collée au palais, dents en contact léger, lèvres fermées. À faire en permanence pour restructurer la mâchoire.',
          priority: 'high',
        },
      ],
    },
    {
      name: 'Definition machoire',
      score: Math.round(beautyAvg * 0.7 + symmetryScore * 0.3),
      level: getScoreLevel(beautyAvg * 0.7 + symmetryScore * 0.3),
      icon: 'person.crop.square',
      description: beautyAvg >= 70
        ? 'Mâchoire bien définie et visible'
        : 'Définition de la mâchoire à travailler',
      softmaxxTips: beautyAvg >= 70 ? [] : [
        {
          title: 'Mastication intensive',
          description: 'Mâche du chewing-gum dur 30-60 min/jour en alternant les côtés. Développe les muscles masseters.',
          priority: 'high',
        },
        {
          title: 'Perte de gras facial',
          description: `Descends à ${gender === 'femme' ? '18-22' : '12-15'}% de masse grasse. Le gras facial cache la définition de la mâchoire.`,
          priority: 'high',
        },
      ],
    },
    {
      name: 'Machoire superieure',
      score: Math.round(beautyAvg * 0.8 + facequality.value * 0.2),
      level: getScoreLevel(beautyAvg * 0.8 + facequality.value * 0.2),
      icon: 'face.smiling',
      description: beautyAvg >= 65
        ? 'Bonne projection de la mâchoire supérieure'
        : 'Mâchoire supérieure légèrement en retrait',
      softmaxxTips: beautyAvg >= 65 ? [] : [
        {
          title: 'Posture du cou',
          description: 'Rentre le menton et aligne ta colonne vertébrale. Une mauvaise posture fait reculer la mâchoire avec le temps.',
          priority: 'high',
        },
        {
          title: 'Aliments durs',
          description: 'Mange des aliments qui demandent de la mastication (viande, noix, carottes crues) pour stimuler le développement osseux.',
          priority: 'medium',
        },
      ],
    },
  ];

  const boneScore = Math.round(
    (boneStructureMetrics.reduce((sum, m) => sum + m.score, 0) / boneStructureMetrics.length)
  );

  // ===== CATEGORY 2: EYE AREA =====
  const eyeAreaBaseMetrics: MetricAnalysis[] = [
    {
      name: 'Cernes',
      score: Math.round(darkCircleScore),
      level: getScoreLevel(darkCircleScore),
      icon: 'eye',
      description: darkCircleScore >= 70
        ? 'Cernes peu visibles, regard frais'
        : 'Cernes marquées - regard fatigué',
      softmaxxTips: darkCircleScore >= 70 ? [] : [
        {
          title: 'Dors 8h minimum',
          description: 'Non négociable. Couche-toi et lève-toi à la même heure chaque jour.',
          priority: 'high',
        },
        {
          title: 'Creme contour des yeux',
          description: 'Applique une crème à la caféine matin et soir. The Ordinary en fait une très bien.',
          priority: 'high',
        },
        {
          title: 'Compresse froide le matin',
          description: 'Cuillère froide ou rouleau glacé pendant 5 min au réveil. Réduit les poches.',
          priority: 'medium',
        },
        {
          title: 'Vérifie tes carences',
          description: 'Fais une prise de sang: fer, B12, vitamine D. Les carences causent des cernes.',
          priority: 'medium',
        },
      ],
    },
  ];

  const eyeLandmarkMetrics: MetricAnalysis[] = landmarkMetrics ? [
    {
      name: 'Canthal tilt',
      score: landmarkMetrics.canthalTilt.score,
      level: getScoreLevel(landmarkMetrics.canthalTilt.score),
      icon: 'eyes',
      description: `Inclinaison: ${landmarkMetrics.canthalTilt.value >= 0 ? '+' : ''}${landmarkMetrics.canthalTilt.value.toFixed(1)}deg, idéal: ${gender === 'femme' ? '+4 à +8' : '+2 à +6'}deg`,
      softmaxxTips: landmarkMetrics.canthalTilt.score >= 70 ? [] : [
        ...(gender === 'homme' ? [{
          title: 'Lunettes de soleil adaptees',
          description: 'Des lunettes avec une forme angulaire et légèrement inclinée vers le haut donnent une impression de canthal tilt positif.',
          priority: 'medium' as const,
        }] : [{
          title: 'Maquillage des yeux',
          description: 'Un trait d\'eyeliner tiré vers le haut au coin extérieur de l\'œil crée l\'illusion d\'un canthal tilt positif.',
          priority: 'medium' as const,
        }]),
      ],
    },
    {
      name: 'Ratio IPD',
      score: landmarkMetrics.ipdRatio.score,
      level: getScoreLevel(landmarkMetrics.ipdRatio.score),
      icon: 'arrow.left.and.right',
      description: `IPD/largeur: ${landmarkMetrics.ipdRatio.value.toFixed(1)}%, ideal: 44-48%`,
      softmaxxTips: landmarkMetrics.ipdRatio.score >= 70 ? [] : [
        ...(landmarkMetrics.ipdRatio.value < 44 ? [{
          title: 'Sourcils ecartes',
          description: 'Épile légèrement l\'intérieur des sourcils pour donner l\'impression d\'yeux plus écartés.',
          priority: 'medium' as const,
        }] : [{
          title: 'Sourcils plus proches',
          description: 'Laisse pousser tes sourcils vers l\'intérieur pour réduire visuellement l\'écartement des yeux.',
          priority: 'medium' as const,
        }]),
      ],
    },
  ] : [
    {
      name: 'Zone des yeux',
      score: Math.round(darkCircleScore * 0.6 + beautyAvg * 0.4),
      level: getScoreLevel(darkCircleScore * 0.6 + beautyAvg * 0.4),
      icon: 'eyes',
      description: darkCircleScore >= 60 && beautyAvg >= 60
        ? 'Zone des yeux équilibrée et harmonieuse'
        : 'Zone des yeux à optimiser',
      softmaxxTips: darkCircleScore >= 60 && beautyAvg >= 60 ? [] : [
        {
          title: 'Soigne ton contour des yeux',
          description: 'Crème à la caféine matin et soir + compresses froides au réveil pour un regard plus frais.',
          priority: 'medium',
        },
      ],
    },
  ];

  const eyeAreaMetrics: MetricAnalysis[] = [...eyeAreaBaseMetrics, ...eyeLandmarkMetrics];

  const eyeScore = Math.round(
    (eyeAreaMetrics.reduce((sum, m) => sum + m.score, 0) / eyeAreaMetrics.length)
  );

  // ===== CATEGORY 3: SKIN =====
  const skinMetrics: MetricAnalysis[] = [
    {
      name: 'Santé de la peau',
      score: Math.round(skinHealthScore),
      level: getScoreLevel(skinHealthScore),
      icon: 'sparkles',
      description: skinHealthScore >= 70
        ? 'Peau en bonne santé avec un éclat naturel'
        : 'Qualité de peau à améliorer',
      softmaxxTips: skinHealthScore >= 70 ? [] : [
        ...(age && age >= 25 ? [{
          title: 'Retinol (anti-age)',
          description: 'Commence par du retinol 0.3%. C\'est un dérivé de vitamine A qui renouvelle la peau et réduit les rides.',
          priority: 'high' as const,
        }] : [{
          title: 'Hydratation quotidienne',
          description: 'Utilise un hydratant adapté à ton type de peau matin et soir. La base d\'une bonne peau.',
          priority: 'high' as const,
        }]),
        {
          title: 'Vitamine C le matin',
          description: 'Sérum vitamine C 15-20% chaque matin. Ça donne de l\'éclat et protège des dommages du soleil.',
          priority: 'high',
        },
        {
          title: 'Creme solaire SPF 50',
          description: 'Tous les jours, même en intérieur. Le soleil vieillit la peau et détruit le collagène.',
          priority: 'high',
        },
      ],
    },
    {
      name: 'Acne',
      score: Math.round(acneScore),
      level: getScoreLevel(acneScore),
      icon: 'circle.fill',
      description: acneScore >= 75
        ? 'Peau claire, peu d\'imperfections'
        : 'Acné présente - traitement nécessaire',
      softmaxxTips: acneScore >= 75 ? [] : [
        {
          title: 'Acide salicylique',
          description: 'Utilise un produit avec 2% d\'acide salicylique sur les zones à boutons. Ça débouche les pores.',
          priority: 'high',
        },
        {
          title: 'Peroxyde de benzoyle',
          description: 'En traitement local sur les boutons. Ne mets pas sur tout le visage, ça dessèche.',
          priority: 'high',
        },
        {
          title: 'Réduis laitages et sucre',
          description: 'Élimine les produits laitiers et réduis le sucre pendant 1 mois. Vois la différence.',
          priority: 'medium',
        },
        {
          title: 'Ne perce JAMAIS',
          description: 'Percer un bouton = cicatrices. Laisse-les tranquilles ou consulte un dermato.',
          priority: 'high',
        },
      ],
    },
    {
      name: 'Taches et teint',
      score: Math.round(stainScore),
      level: getScoreLevel(stainScore),
      icon: 'circle.lefthalf.filled',
      description: stainScore >= 70
        ? 'Teint uniforme sans taches'
        : 'Taches presentes sur le visage',
      softmaxxTips: stainScore >= 70 ? [] : [
        {
          title: 'Niacinamide',
          description: 'Applique du niacinamide 10% matin et soir. Ca unifie le teint en 4-8 semaines.',
          priority: 'high',
        },
        {
          title: 'Creme solaire obligatoire',
          description: 'Sans protection solaire, tes taches vont empirer. C\'est non négociable.',
          priority: 'high',
        },
        {
          title: 'Alpha Arbutine',
          description: 'En combo avec la vitamine C, ca cible les taches brunes et unifie le teint.',
          priority: 'medium',
        },
      ],
    },
  ];

  const skinScore = Math.round(
    (skinMetrics.reduce((sum, m) => sum + m.score, 0) / skinMetrics.length)
  );

  // ===== CATEGORY 4: NEZ & BOUCHE =====
  const noseMouthMetrics: MetricAnalysis[] = landmarkMetrics ? [
    {
      name: 'Largeur du nez',
      score: landmarkMetrics.noseRatio.score,
      level: getScoreLevel(landmarkMetrics.noseRatio.score),
      icon: 'nose',
      description: `Ratio: ${landmarkMetrics.noseRatio.value.toFixed(1)}%, ideal: ${gender === 'femme' ? '20-24' : '23-27'}%`,
      softmaxxTips: landmarkMetrics.noseRatio.score >= 70 ? [] : (gender === 'femme' ? [
        {
          title: 'Contouring du nez',
          description: 'Applique une teinte foncée sur les côtés du nez et une teinte claire sur l\'arête pour affiner visuellement.',
          priority: 'medium',
        },
      ] : []),
    },
    {
      name: 'Largeur de la bouche',
      score: landmarkMetrics.mouthRatio.score,
      level: getScoreLevel(landmarkMetrics.mouthRatio.score),
      icon: 'mouth',
      description: `Ratio: ${landmarkMetrics.mouthRatio.value.toFixed(1)}%, ideal: 38-44%`,
      softmaxxTips: landmarkMetrics.mouthRatio.score >= 70 ? [] : [],
    },
    {
      name: 'Ratio des levres',
      score: landmarkMetrics.lipRatio.score,
      level: getScoreLevel(landmarkMetrics.lipRatio.score),
      icon: 'mouth.fill',
      description: `Ratio inf/sup: ${landmarkMetrics.lipRatio.value.toFixed(2)}, ideal: 1.4-1.8`,
      softmaxxTips: landmarkMetrics.lipRatio.score >= 70 ? [] : [
        {
          title: 'Hydratation des levres',
          description: 'Utilise un baume à lèvres quotidiennement. Des lèvres bien hydratées paraissent plus pulpeuses.',
          priority: 'medium',
        },
        ...(gender === 'femme' ? [{
          title: 'Maquillage des levres',
          description: 'Un crayon à lèvres légèrement au-dessus de la ligne naturelle peut équilibrer les proportions.',
          priority: 'medium' as const,
        }] : []),
      ],
    },
  ] : [
    {
      name: 'Harmonie nez/bouche',
      score: Math.round(beautyAvg),
      level: getScoreLevel(beautyAvg),
      icon: 'face.smiling.inverse',
      description: beautyAvg >= 70
        ? 'Nez et bouche bien proportionnés'
        : 'Proportions a optimiser',
      softmaxxTips: beautyAvg >= 70 ? [] : (gender === 'femme' ? [
        {
          title: 'Contouring',
          description: 'Le maquillage peut modifier visuellement les proportions du nez et mettre en valeur les levres.',
          priority: 'medium',
        },
      ] : []),
    },
  ];

  const noseMouthScore = Math.round(
    (noseMouthMetrics.reduce((sum, m) => sum + m.score, 0) / noseMouthMetrics.length)
  );

  // Build categories
  const categories: CategoryAnalysis[] = [
    {
      name: 'Structure osseuse',
      nameEn: 'Machoire, proportions',
      icon: 'person.crop.square',
      score: boneScore,
      level: getScoreLevel(boneScore),
      metrics: boneStructureMetrics,
    },
    {
      name: 'Zone des yeux',
      nameEn: 'Cernes, regard',
      icon: 'eye',
      score: eyeScore,
      level: getScoreLevel(eyeScore),
      metrics: eyeAreaMetrics,
    },
    {
      name: 'Peau',
      nameEn: 'Acné, taches, éclat',
      icon: 'sparkles',
      score: skinScore,
      level: getScoreLevel(skinScore),
      metrics: skinMetrics,
    },
    {
      name: 'Nez & Bouche',
      nameEn: 'Proportions',
      icon: 'face.smiling',
      score: noseMouthScore,
      level: getScoreLevel(noseMouthScore),
      metrics: noseMouthMetrics,
    },
  ];

  // Use original PSL if provided, otherwise calculate from categories
  const pslRating = originalPSL ?? Math.round(scoreToPSLEquivalent((boneScore + eyeScore + skinScore + noseMouthScore) / 4) * 10) / 10;
  const tier = originalTier ?? getTier(pslRating);

  // Calculate potential PSL (fixable issues - skin and eyes are most improvable)
  const skinPotentialGain = Math.min(1, (100 - skinScore) * 0.015);
  const eyePotentialGain = Math.min(0.8, (100 - eyeScore) * 0.012);
  const potentialPSL = Math.min(10, Math.round((pslRating + skinPotentialGain + eyePotentialGain) * 10) / 10);

  // Identify halos (points forts) and failos (a ameliorer)
  const halos: string[] = [];
  const failos: string[] = [];

  categories.forEach((cat) => {
    cat.metrics.forEach((metric) => {
      if (metric.level === 'excellent') {
        halos.push(`${metric.name} (${metric.score}/100)`);
      } else if (metric.level === 'critical') {
        failos.push(`${metric.name} - prioritaire`);
      } else if (metric.level === 'warning' && metric.softmaxxTips.some((t) => t.priority === 'high')) {
        failos.push(`${metric.name} - a travailler`);
      }
    });
  });

  // Get priority softmaxx tips
  const allTips: SoftmaxxTip[] = [];
  categories.forEach((cat) => {
    cat.metrics.forEach((metric) => {
      if (metric.level === 'critical' || metric.level === 'warning') {
        metric.softmaxxTips.forEach((tip) => {
          if (tip.priority === 'high') {
            allTips.push(tip);
          }
        });
      }
    });
  });

  // Unique tips by title
  const seenTitles = new Set<string>();
  const prioritySoftmaxx = allTips.filter((tip) => {
    if (seenTitles.has(tip.title)) return false;
    seenTitles.add(tip.title);
    return true;
  }).slice(0, 5);

  // Default tips if nothing critical
  if (prioritySoftmaxx.length === 0) {
    prioritySoftmaxx.push(
      {
        title: 'Maintiens ta routine',
        description: 'Tes scores sont bons. Continue ce que tu fais et reste constant.',
        priority: 'medium',
      },
      {
        title: 'Mewing quotidien',
        description: 'Continue le mewing pour maintenir et améliorer ta structure.',
        priority: 'medium',
      }
    );
  }

  return {
    pslRating,
    tier,
    potentialPSL,
    categories,
    prioritySoftmaxx,
    halos: halos.slice(0, 4),
    failos: failos.slice(0, 4),
  };
}

export function getLevelColor(level: ScoreLevel): string {
  switch (level) {
    case 'excellent': return '#22c55e';
    case 'good': return '#84cc16';
    case 'warning': return '#eab308';
    case 'critical': return '#ef4444';
  }
}

export function getLevelLabel(level: ScoreLevel): string {
  switch (level) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Bon';
    case 'warning': return 'A travailler';
    case 'critical': return 'Prioritaire';
  }
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
  }
}
