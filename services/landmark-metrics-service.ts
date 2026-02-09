import type { FacePPLandmark, LandmarkPoint, LandmarkMetrics } from '@/types/firebase';

function dist(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function mid(p: LandmarkPoint, q: LandmarkPoint): LandmarkPoint {
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
}

/** Score 0-100 from value vs ideal range (idealMin, idealMax). */
function scoreFromIdeal(value: number, idealMin: number, idealMax: number): number {
  const center = (idealMin + idealMax) / 2;
  const halfRange = (idealMax - idealMin) / 2;
  const deviation = Math.abs(value - center);
  if (deviation <= halfRange) return 100 - (deviation / halfRange) * 30;
  return Math.max(0, 70 - (deviation - halfRange) * 20);
}

/** Angle in degrees between two points (from horizontal). Y increases downward. */
function angleDeg(p: LandmarkPoint, q: LandmarkPoint): number {
  return (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
}

/**
 * Compute facial metrics from Face++ landmarks.
 * Called when Face++ returns landmark (return_landmark=1).
 */
export function computeLandmarkMetrics(landmark: FacePPLandmark): LandmarkMetrics {
  const {
    contour_chin,
    contour_left7,
    contour_right7,
    contour_left8,
    contour_right8,
    left_eyebrow_upper_middle,
    right_eyebrow_upper_middle,
    left_eye_left_corner,
    left_eye_right_corner,
    right_eye_left_corner,
    right_eye_right_corner,
    left_eye_center,
    right_eye_center,
    left_eye_pupil,
    right_eye_pupil,
    nose_contour_lower_middle,
    nose_left,
    nose_right,
    nose_tip,
    mouth_left_corner,
    mouth_right_corner,
    mouth_upper_lip_top,
    mouth_upper_lip_bottom,
    mouth_lower_lip_bottom,
    contour_left5,
    contour_left6,
    contour_right5,
    contour_right6,
  } = landmark;

  const faceWidth = dist(contour_left7, contour_right7);
  const browMid = mid(left_eyebrow_upper_middle, right_eyebrow_upper_middle);
  const faceHeight = dist(browMid, contour_chin);
  const fwhr = faceHeight > 0 ? faceWidth / faceHeight : 0;
  const fwhrScore = scoreFromIdeal(fwhr, 1.7, 2.0);

  const subnasale = nose_contour_lower_middle;
  const upperLip = mouth_upper_lip_top;
  const lowerLipBottom = mouth_lower_lip_bottom;

  const upperThird = dist(browMid, subnasale);
  const middleThird = dist(subnasale, upperLip);
  const lowerThird = dist(upperLip, contour_chin);
  const totalThird = upperThird + middleThird + lowerThird;
  const faceThirds = {
    upper: totalThird > 0 ? (upperThird / totalThird) * 100 : 33,
    middle: totalThird > 0 ? (middleThird / totalThird) * 100 : 33,
    lower: totalThird > 0 ? (lowerThird / totalThird) * 100 : 34,
    score: 0,
  };
  const thirdDeviation = Math.abs(faceThirds.upper - 33) + Math.abs(faceThirds.middle - 33) + Math.abs(faceThirds.lower - 34);
  faceThirds.score = Math.max(0, 100 - thirdDeviation * 2);

  const tiltLeft = angleDeg(left_eye_left_corner, left_eye_right_corner);
  const tiltRight = angleDeg(right_eye_left_corner, right_eye_right_corner);
  const canthalTiltValue = (tiltLeft + tiltRight) / 2;
  const canthalTiltScore = scoreFromIdeal(canthalTiltValue, 2, 8);

  const ipd = dist(left_eye_pupil, right_eye_pupil);
  const ipdRatioValue = faceWidth > 0 ? (ipd / faceWidth) * 100 : 0;
  const ipdRatioScore = scoreFromIdeal(ipdRatioValue, 44, 48);

  const noseWidth = dist(nose_left, nose_right);
  const noseRatioValue = faceWidth > 0 ? (noseWidth / faceWidth) * 100 : 0;
  const noseRatioScore = scoreFromIdeal(noseRatioValue, 22, 27);

  const mouthWidth = dist(mouth_left_corner, mouth_right_corner);
  const mouthRatioValue = faceWidth > 0 ? (mouthWidth / faceWidth) * 100 : 0;
  const mouthRatioScore = scoreFromIdeal(mouthRatioValue, 38, 44);

  const upperLipHeight = dist(upperLip, landmark.mouth_upper_lip_bottom);
  const lowerLipHeight = dist(landmark.mouth_lower_lip_top, lowerLipBottom);
  const lipRatioValue = upperLipHeight > 0 ? lowerLipHeight / upperLipHeight : 0;
  const lipRatioScore = scoreFromIdeal(lipRatioValue, 1.4, 1.8);

  const centerX = (contour_left7.x + contour_right7.x) / 2;
  const symmetricPairs: [LandmarkPoint, LandmarkPoint][] = [
    [left_eye_left_corner, right_eye_right_corner],
    [left_eye_right_corner, right_eye_left_corner],
    [contour_left7, contour_right7],
    [contour_left6, contour_right6],
  ];
  let symmetryDeviation = 0;
  for (const [left, right] of symmetricPairs) {
    const expectedRightX = centerX + (centerX - left.x);
    symmetryDeviation += Math.abs(right.x - expectedRightX);
  }
  symmetryDeviation = (symmetryDeviation / symmetricPairs.length / faceWidth) * 100;
  const symmetryScore = Math.max(0, 100 - symmetryDeviation * 2);

  const angleAt = (a: LandmarkPoint, b: LandmarkPoint, c: LandmarkPoint): number => {
    const ba = Math.atan2(a.y - b.y, a.x - b.x);
    const bc = Math.atan2(c.y - b.y, c.x - b.x);
    let deg = ((bc - ba) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg > 180 ? 360 - deg : deg;
  };
  const jawLeft = angleAt(contour_left5, contour_left6, contour_left7);
  const jawRight = angleAt(contour_right7, contour_right6, contour_right5);
  const jawAngleValue = (jawLeft + jawRight) / 2;
  const jawAngleScore = scoreFromIdeal(jawAngleValue, 115, 130);

  const philtrumLength = dist(subnasale, upperLip);
  const chinLength = dist(lowerLipBottom, contour_chin);
  const philtrumToChinValue = chinLength > 0 ? philtrumLength / chinLength : 0;
  const philtrumToChinScore = scoreFromIdeal(philtrumToChinValue, 0.5, 0.65);

  const midfaceHeight = dist(mid(left_eye_center, right_eye_center), mid(upperLip, landmark.mouth_lower_lip_top));
  const fullHeight = faceHeight;
  const midfaceRatioValue = fullHeight > 0 ? midfaceHeight / fullHeight : 0;
  const midfaceRatioScore = scoreFromIdeal(midfaceRatioValue, 0.42, 0.52);

  return {
    fwhr: { value: Math.round(fwhr * 100) / 100, score: Math.round(fwhrScore) },
    symmetry: { value: Math.round(symmetryDeviation * 10) / 10, score: Math.round(symmetryScore) },
    faceThirds,
    jawAngle: { value: Math.round(jawAngleValue), score: Math.round(jawAngleScore) },
    canthalTilt: { value: Math.round(canthalTiltValue * 10) / 10, score: Math.round(canthalTiltScore) },
    ipdRatio: { value: Math.round(ipdRatioValue * 10) / 10, score: Math.round(ipdRatioScore) },
    noseRatio: { value: Math.round(noseRatioValue * 10) / 10, score: Math.round(noseRatioScore) },
    mouthRatio: { value: Math.round(mouthRatioValue * 10) / 10, score: Math.round(mouthRatioScore) },
    lipRatio: { value: Math.round(lipRatioValue * 100) / 100, score: Math.round(lipRatioScore) },
    midfaceRatio: { value: Math.round(midfaceRatioValue * 100) / 100, score: Math.round(midfaceRatioScore) },
    philtrumToChinRatio: { value: Math.round(philtrumToChinValue * 100) / 100, score: Math.round(philtrumToChinScore) },
  };
}

export type FacialMetricKey = keyof LandmarkMetrics;

export const FACIAL_METRIC_INFO: Record<
  FacialMetricKey,
  { label: string; unit: string; ideal: string; description: string }
> = {
  fwhr: {
    label: 'Ratio largeur / hauteur visage',
    unit: '',
    ideal: '1,70 – 2,05',
    description: 'Largeur du visage (pommettes) divisée par la hauteur. Fourchette de référence : 1,70 à 2,05. En dehors : visage plus long ou plus large que la moyenne.',
  },
  symmetry: {
    label: 'Symétrie faciale',
    unit: '% écart',
    ideal: '< 5 %',
    description: 'Écart moyen entre les points gauche et droite du visage. Moins de 5 % = symétrie élevée. Au-delà = asymétrie plus visible.',
  },
  faceThirds: {
    label: 'Tiers du visage',
    unit: '%',
    ideal: '33 / 33 / 33',
    description: 'Répartition en trois tiers : front–nez, milieu, lèvre–menton. Idéal théorique : un tiers chacun (33 %). Écarts = un tiers plus long ou plus court.',
  },
  jawAngle: {
    label: 'Angle de la mâchoire',
    unit: '°',
    ideal: '115 – 130°',
    description: 'Angle au niveau du gonion (angle de la mâchoire). 115–130° = zone de référence. En dessous : mâchoire plus ronde ; au-dessus : plus anguleuse.',
  },
  canthalTilt: {
    label: 'Canthal tilt',
    unit: '°',
    ideal: '+2 à +8°',
    description: "Angle de la fente palpébrale (coin interne → externe de l'œil). Positif = coin externe plus haut. Fourchette courante : +2° à +8°.",
  },
  ipdRatio: {
    label: 'Espacement des yeux',
    unit: '% de la largeur du visage',
    ideal: '44 – 48 %',
    description: 'Distance entre les pupilles en % de la largeur du visage. 44–48 % = norme. En dessous : yeux plus rapprochés ; au-dessus : plus écartés.',
  },
  noseRatio: {
    label: 'Largeur du nez',
    unit: '% de la largeur du visage',
    ideal: '22 – 27 %',
    description: 'Largeur du nez divisée par la largeur du visage. 22–27 % = fourchette courante. Permet de situer la proportion du nez par rapport au visage.',
  },
  mouthRatio: {
    label: 'Largeur de la bouche',
    unit: '% de la largeur du visage',
    ideal: '38 – 44 %',
    description: 'Largeur de la bouche par rapport à la largeur du visage. Une bouche proportionnée renforce l’harmonie du bas du visage.',
  },
  lipRatio: {
    label: 'Ratio lèvre inf. / sup.',
    unit: '',
    ideal: '1,4 – 1,8',
    description: 'Rapport entre l’épaisseur de la lèvre inférieure et celle de la lèvre supérieure. Ce ratio influence la perception de l’équilibre de la zone buccale.',
  },
  midfaceRatio: {
    label: 'Ratio milieu du visage',
    unit: '',
    ideal: '0,42 – 0,52',
    description: 'Hauteur du milieu du visage (yeux à bouche) / hauteur totale. 0,42–0,52 = norme. Décrit les proportions du tiers central.',
  },
  philtrumToChinRatio: {
    label: 'Ratio philtrum / menton',
    unit: '',
    ideal: '0,50 – 0,65',
    description: 'Rapport entre la longueur du philtrum (sillon nez–lèvre) et la hauteur du menton. Des proportions équilibrées contribuent à l’harmonie du bas du visage.',
  },
};
