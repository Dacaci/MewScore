import type { FacePPAttributes, UserGender, LandmarkMetrics } from '@/types/firebase';
import { FACIAL_METRIC_INFO, type FacialMetricKey } from '@/services/landmark-metrics-service';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const REQUEST_TIMEOUT_MS = 35_000;
const MAX_RETRIES = 1;

export interface GeminiAnalysisInput {
  gender: UserGender | null | undefined;
  age: number | null | undefined;
  pslRating: number;
  tier: string;
  percentile: number;
  faceAttributes: FacePPAttributes;
  /** Métriques faciales calculées (landmarks). Si présent, Gemini renvoie aussi metricDescriptions. */
  landmarkMetrics?: LandmarkMetrics | null;
}

export interface LooksmaxingTip {
  title: string;
  description: string;
}

export interface GeminiAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  /** Une phrase de description personnalisée par métrique (clé = nom technique, ex. fwhr, canthalTilt). */
  metricDescriptions?: Partial<Record<FacialMetricKey, string>>;
  /** Conseils looksmaxing adaptés aux données du client (structure, peau, style). */
  looksmaxingTips?: LooksmaxingTip[];
}

function formatMetricValue(key: FacialMetricKey, metrics: LandmarkMetrics): string {
  const m = metrics[key];
  if (!m) return '–';
  if (key === 'faceThirds' && 'upper' in m) {
    const t = m as LandmarkMetrics['faceThirds'];
    return `${Math.round(t.upper)}% / ${Math.round(t.middle)}% / ${Math.round(t.lower)}%`;
  }
  if (typeof m === 'object' && 'value' in m) return String((m as { value: number }).value);
  return '–';
}

function buildMetricsSection(metrics: LandmarkMetrics): string {
  const lines: string[] = [];
  const keys = Object.keys(metrics) as FacialMetricKey[];
  for (const key of keys) {
    const info = FACIAL_METRIC_INFO[key];
    if (!info) continue;
    const valueStr = formatMetricValue(key, metrics);
    const m = metrics[key];
    let scoreStr = '–';
    if (m && typeof m === 'object' && 'score' in m) scoreStr = String((m as { score: number }).score);
    if (key === 'faceThirds' && m && 'score' in m) scoreStr = String((m as LandmarkMetrics['faceThirds']).score);
    lines.push(`- ${info.label} (${key}): valeur=${valueStr}, score/100=${scoreStr}, ideal=${info.ideal}`);
  }
  return lines.join('\n');
}

function buildPrompt(input: GeminiAnalysisInput): string {
  const genderLabel = input.gender === 'homme' ? 'homme' : input.gender === 'femme' ? 'femme' : 'personne';
  const ageText = input.age ? `${input.age} ans` : 'age non renseigne';
  const attrs = input.faceAttributes;
  const hasMetrics = input.landmarkMetrics && Object.keys(input.landmarkMetrics).length > 0;

  // Determine detected gender from Face++
  const detectedGender = attrs.gender?.value === 'Male' ? 'homme' : 'femme';
  const beautyScore = input.gender === 'homme' ? attrs.beauty.male_score :
                      input.gender === 'femme' ? attrs.beauty.female_score :
                      (attrs.beauty.male_score + attrs.beauty.female_score) / 2;

  return `Tu es un expert reconnu en morphopsychologie, analyse faciale et looksmaxxing avec 15 ans d'experience. Analyse ces donnees Face++ et donne une consultation personnalisee.

PROFIL CLIENT:
- Genre declare: ${genderLabel}
- Genre detecte par IA: ${detectedGender}
- Age declare: ${ageText}
- Age estime par IA: ${attrs.age?.value ?? 'non detecte'} ans

SCORES FACE++ (algorithme de beaute):
- Score beaute masculin: ${attrs.beauty.male_score.toFixed(1)}/100
- Score beaute feminin: ${attrs.beauty.female_score.toFixed(1)}/100
- Score utilise: ${beautyScore.toFixed(1)}/100 → PSL ${input.pslRating.toFixed(1)}/10
- Categorie: ${input.tier}
- Classement: top ${input.percentile}%

ANALYSE DE LA PEAU (Face++):
- Cernes: ${attrs.skinstatus.dark_circle.toFixed(0)}/100 (${attrs.skinstatus.dark_circle < 30 ? 'legers' : attrs.skinstatus.dark_circle < 60 ? 'moderes' : 'prononces'})
- Acne: ${attrs.skinstatus.acne.toFixed(0)}/100 (${attrs.skinstatus.acne < 20 ? 'peau nette' : attrs.skinstatus.acne < 50 ? 'quelques imperfections' : 'acne visible'})
- Taches/pigmentation: ${attrs.skinstatus.stain.toFixed(0)}/100
- Sante globale peau: ${attrs.skinstatus.health.toFixed(0)}/100

QUALITE PHOTO:
- Score qualite: ${attrs.facequality.value.toFixed(0)} (seuil: ${attrs.facequality.threshold.toFixed(0)})

EMOTION DOMINANTE: ${Object.entries(attrs.emotion).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'neutre'}
${hasMetrics ? `

METRIQUES FACIALES CALCULEES (landmarks, independantes du score PSL):
${buildMetricsSection(input.landmarkMetrics!)}
` : ''}

---

INSTRUCTIONS:

1. POINTS FORTS (3-5): Analyse les scores Face++ et identifie les vrais atouts:
   - Score beaute eleve = bonnes proportions faciales
   - Peau saine (health > 70, acne < 30) = atout
   - Peu de cernes = regard frais
   - Sois specifique et valorisant

2. POINTS FAIBLES (2-4): Identifie honnetement les axes d'amelioration:
   - Cernes > 50 = fatigue visible
   - Acne > 40 = peau a traiter
   - Taches > 40 = hyperpigmentation
   - Score beaute < 60 = proportions a optimiser

3. CONSEILS PERSONNALISES (5-8): Ultra-specifiques et actionnables:

   PEAU:
   - Si cernes: "Applique une creme contour yeux avec cafeine et vitamine K matin et soir"
   - Si acne: "Utilise un nettoyant avec acide salicylique 2% + niacinamide 10% le soir"
   - Si taches: "Serum vitamine C 15% le matin + SPF50, retinol 0.3% le soir"
   - Si peau terne: "Double nettoyage + exfoliation AHA 1x/semaine"

   STRUCTURE (selon score beaute):
   - Si < 65: "Mewing: garde ta langue collee au palais 24h/24 pour redefinir ta machoire"
   - Si < 70: "Mastication de chewing-gum dur (Falim) 30min/jour pour muscler les masseters"
   - "Reduis ton taux de masse grasse a 12-15% pour reveler ta structure osseuse"

   STYLE adapte au genre:
   ${input.gender === 'homme' ? `- "Barbe de 3-5mm pour accentuer la machoire" ou "Barbe taillee pour masquer un menton faible"
   - "Coupe de cheveux avec volume sur les cotes si visage allonge, degrade si visage rond"` :
   `- "Contouring: ombre sous les pommettes et sur les cotes du nez pour affiner"
   - "Highlighter sur l'arcade sourciliere et le haut des pommettes"`}

   LIFESTYLE:
   - "8h de sommeil minimum - le manque de sommeil augmente les cernes de 30%"
   - "2L d'eau par jour pour l'hydratation de la peau"
   ${input.age && input.age >= 25 ? '- "A 25+, commence le retinol 0.3% pour prevenir le vieillissement"' : '- "Routine simple: nettoyant + hydratant + SPF, pas besoin d\'anti-age avant 25 ans"'}

4. RESUME (2-3 phrases): Synthese experte qui:
   - Decrit le profil global (ex: "Bon potentiel avec une structure faciale au-dessus de la moyenne")
   - Identifie LA priorite numero 1
   - Donne une perspective positive et realiste

5. LOOKSMAXING TIPS (4-6 conseils): En tant qu'expert looksmaxing, adapte les conseils aux donnees du client. Ton naturel, pas de surcharge de jargon:
   - Chaque element: "title" (court, ex. "Mewing", "Masse grasse", "Peau") et "description" (2-3 phrases actionnables, SANS accents).
   - Utilise UN PEU le vocabulaire looksmaxing quand ca apporte vraiment (ex. "glow" pour le teint, "mewing" si tu parles de la langue). Pas besoin de dire "softmaxx" a la place d'"amelioration", ni "failo" a la place de "point faible" - privilegie le langage courant. Si tu utilises un terme technique (mewing, FWHR, etc.), explique-le en une courte parenthese (ex. "le mewing (posture langue au palais) peut...").
   - Base-toi sur: score beaute, peau (cernes, acne, taches), genre, age, et metriques faciales si presentes (FWHR, symetrie, etc.).
   - Themes possibles: mewing, mastication, peau/teint, masse grasse, skincare, barbe/coiffure, contouring (femme), sommeil, eau, symetrie.
   - Sois concret et adapte au profil. Quelques touches looksmaxing suffisent; le reste en francais clair.
${hasMetrics ? `
6. METRIC_DESCRIPTIONS (obligatoire si METRIQUES FACIALES presentes): Pour chaque metrique listee ci-dessus, ecris une seule phrase (1-2 lignes) qui:
   - Decrit le resultat de cette personne (sa valeur) par rapport a l'ideal
   - Adapte le discours au genre du client (PROFIL CLIENT: ${genderLabel}): formulations et exemples adaptes (homme: barbe, machoire, etc.; femme: maquillage, contouring, etc.)
   - Est personnalisee et bienveillante, sans jugement
   Utilise EXACTEMENT les cles suivantes dans le JSON: ${(Object.keys(input.landmarkMetrics!) as FacialMetricKey[]).join(', ')}.` : ''}

REGLES:
- Francais SANS accents (e, a, u au lieu de e, a, u)
- Direct et professionnel, pas de flatterie excessive
- Chaque conseil doit etre ACTIONNABLE immediatement
- Adapte au genre et a l'age
- Base-toi sur les DONNEES, pas sur des generalites

Reponds UNIQUEMENT avec ce JSON valide (sans accents dans les chaines):
{
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "weaknesses": ["point faible 1", "point faible 2"],
  "improvements": ["conseil 1", "conseil 2", "conseil 3", "conseil 4", "conseil 5"],
  "summary": "Resume expert en 2-3 phrases.",
  "looksmaxingTips": [
    {"title": "Titre court", "description": "Description actionnable en 2-3 phrases."}
  ]
${hasMetrics ? `,
  "metricDescriptions": {
    ${(Object.keys(input.landmarkMetrics!) as FacialMetricKey[]).map((k) => `"${k}": "une phrase personnalisee pour cette metrique"`).join(',\n    ')}
  }
` : ''}
}`;
}

/**
 * Pourquoi Gemini peut ne pas repondre (resultat null) :
 * - Cle API absente ou invalide
 * - Timeout reseau (requete trop lente)
 * - Quota / rate limit Google (429)
 * - Erreur serveur Google (5xx)
 * - Reponse vide (safety block ou pas de "candidates")
 * - JSON invalide ou structure inattendue dans la reponse
 */
export async function analyzeWithGemini(input: GeminiAnalysisInput): Promise<GeminiAnalysisResult | null> {
  if (!API_KEY) {
    console.warn('[Gemini] Cle API non configuree, fallback analyse par regles');
    return null;
  }

  const doRequest = async (): Promise<GeminiAnalysisResult | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const prompt = buildPrompt(input);
      const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 429) {
        console.warn('[Gemini] Rate limit (429), quota depasse - reessayer plus tard');
        return null;
      }
      if (!response.ok) {
        const body = await response.text();
        console.error('[Gemini] API error', response.status, body.slice(0, 200));
        return null;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        const blockReason = data.candidates?.[0]?.finishReason ?? data.promptFeedback?.blockReason ?? 'inconnu';
        console.warn('[Gemini] Pas de texte dans la reponse (finishReason/block:', blockReason, ')');
        return null;
      }

      // Parse JSON from the response (handle markdown code blocks)
      let jsonText = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonText = jsonMatch[1];

      const result = JSON.parse(jsonText.trim()) as GeminiAnalysisResult;

      if (!Array.isArray(result.strengths) || !Array.isArray(result.weaknesses) ||
          !Array.isArray(result.improvements) || typeof result.summary !== 'string') {
        console.warn('[Gemini] Structure JSON invalide (strengths/weaknesses/summary manquants)');
        return null;
      }

      if (result.metricDescriptions != null && typeof result.metricDescriptions !== 'object') {
        delete result.metricDescriptions;
      }
      if (result.metricDescriptions) {
        const cleaned: Partial<Record<FacialMetricKey, string>> = {};
        for (const [k, v] of Object.entries(result.metricDescriptions)) {
          if (typeof v === 'string' && v.trim()) cleaned[k as FacialMetricKey] = v.trim();
        }
        result.metricDescriptions = cleaned;
      }

      if (result.looksmaxingTips != null && Array.isArray(result.looksmaxingTips)) {
        result.looksmaxingTips = result.looksmaxingTips
          .filter((t): t is { title: string; description: string } =>
            t && typeof t.title === 'string' && typeof t.description === 'string' && t.title.trim() !== '' && t.description.trim() !== '')
          .map((t) => ({ title: t.title.trim(), description: t.description.trim() }));
      } else {
        delete result.looksmaxingTips;
      }

      return result;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.warn('[Gemini] Timeout (' + (REQUEST_TIMEOUT_MS / 1000) + 's), pas de reponse');
        } else if (err instanceof SyntaxError) {
          console.warn('[Gemini] Reponse JSON invalide:', err.message);
        } else {
          console.warn('[Gemini] Erreur reseau ou inattendue:', err.message);
        }
      } else {
        console.warn('[Gemini] Erreur inconnue:', err);
      }
      return null;
    }
  };

  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const result = await doRequest();
      if (result !== null) return result;
      if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 1500));
    }
  } catch (err) {
    console.error('[Gemini] Erreur inattendue:', err);
  }
  return null;
}

export function isGeminiConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your_gemini_api_key_here';
}
