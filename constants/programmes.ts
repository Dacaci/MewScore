export interface ProgrammeTask {
  id: string;
  label: string;
}

export interface ProgrammeWeek {
  weekNumber: number;
  title: string;
  tasks: ProgrammeTask[];
}

export interface Programme {
  id: string;
  icon: string;
  color: string;
  weeks: ProgrammeWeek[];
}

export const PROGRAMMES: Programme[] = [
  {
    id: 'machoire',
    icon: '🦷',
    color: '#3B82F6',
    weeks: [
      {
        weekNumber: 1,
        title: 'Les bases',
        tasks: [
          { id: 'machoire_w1_t1', label: 'Pratiquer le mewing 20 min/jour (langue contre le palais)' },
          { id: 'machoire_w1_t2', label: 'Mâcher du mastic gum 10 min/jour' },
          { id: 'machoire_w1_t3', label: 'Mâcher des deux côtés également' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Renforcement',
        tasks: [
          { id: 'machoire_w2_t1', label: 'Mewing 30 min/jour' },
          { id: 'machoire_w2_t2', label: 'Jawline workout : serrer les dents 10x3 séries' },
          { id: 'machoire_w2_t3', label: 'Mastic gum 20 min/jour' },
          { id: 'machoire_w2_t4', label: 'Boire 2L d\'eau/jour' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Intensification',
        tasks: [
          { id: 'machoire_w3_t1', label: 'Mewing continu (habitude permanente)' },
          { id: 'machoire_w3_t2', label: 'Exercice : sourire forcé tenu 10 sec x10' },
          { id: 'machoire_w3_t3', label: 'Mâcher des aliments durs (carottes, pommes)' },
          { id: 'machoire_w3_t4', label: 'Massage de la mâchoire 5 min/jour' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'machoire_w4_t1', label: 'Maintenir toutes les habitudes des semaines précédentes' },
          { id: 'machoire_w4_t2', label: 'Vérifier posture de la langue en permanence' },
          { id: 'machoire_w4_t3', label: 'Chin tucks 3x15/jour' },
        ],
      },
    ],
  },
  {
    id: 'hyoide',
    icon: '🔵',
    color: '#8B5CF6',
    weeks: [
      {
        weekNumber: 1,
        title: 'Prise de conscience',
        tasks: [
          { id: 'hyoide_w1_t1', label: 'Exercice de déglutition consciente x20/jour' },
          { id: 'hyoide_w1_t2', label: 'Étirement du cou : incliner la tête en arrière 30 sec' },
          { id: 'hyoide_w1_t3', label: 'Garder le menton légèrement rentré en permanence' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Activation musculaire',
        tasks: [
          { id: 'hyoide_w2_t1', label: 'Humming (fredonner) 5 min/jour' },
          { id: 'hyoide_w2_t2', label: 'Étirements cervicaux avant/arrière 3x10' },
          { id: 'hyoide_w2_t3', label: 'Éviter de regarder le téléphone en baissant la tête' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Renforcement',
        tasks: [
          { id: 'hyoide_w3_t1', label: 'Exercice : pousser la langue contre le palais en avalant' },
          { id: 'hyoide_w3_t2', label: 'Neck curls 3x10/jour' },
          { id: 'hyoide_w3_t3', label: 'Massage sous-mandibulaire 5 min/jour' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'hyoide_w4_t1', label: 'Maintenir posture de tête correcte en permanence' },
          { id: 'hyoide_w4_t2', label: 'Exercices de résistance du cou 3x15' },
          { id: 'hyoide_w4_t3', label: 'Étirements matin et soir' },
        ],
      },
    ],
  },
  {
    id: 'posture',
    icon: '🧍',
    color: '#10B981',
    weeks: [
      {
        weekNumber: 1,
        title: 'Correction de base',
        tasks: [
          { id: 'posture_w1_t1', label: 'Régler la hauteur de l\'écran à hauteur des yeux' },
          { id: 'posture_w1_t2', label: 'Wall angel 3x10/jour' },
          { id: 'posture_w1_t3', label: 'Marcher 20 min/jour en conscientisant la posture' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Renforcement',
        tasks: [
          { id: 'posture_w2_t1', label: 'Stretching épaules matin 5 min' },
          { id: 'posture_w2_t2', label: 'Plank 3x30 sec/jour' },
          { id: 'posture_w2_t3', label: 'Alerte posture toutes les heures sur le téléphone' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Stabilisation',
        tasks: [
          { id: 'posture_w3_t1', label: 'Cat-cow stretch 3x10/jour' },
          { id: 'posture_w3_t2', label: 'Superman hold 3x10/jour' },
          { id: 'posture_w3_t3', label: 'Oreiller adapté (ni trop haut, ni trop bas)' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Ancrage',
        tasks: [
          { id: 'posture_w4_t1', label: 'Yoga ou stretching 15 min/jour' },
          { id: 'posture_w4_t2', label: 'Vérifier posture devant le miroir chaque matin' },
          { id: 'posture_w4_t3', label: 'Marche consciente 30 min/jour' },
        ],
      },
    ],
  },
  {
    id: 'yeux',
    icon: '👁️',
    color: '#F59E0B',
    weeks: [
      {
        weekNumber: 1,
        title: 'Routine de base',
        tasks: [
          { id: 'yeux_w1_t1', label: 'Appliquer une crème contour des yeux chaque soir' },
          { id: 'yeux_w1_t2', label: 'Dormir 7-8h minimum' },
          { id: 'yeux_w1_t3', label: 'Compresses froides le matin 5 min' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Traitement ciblé',
        tasks: [
          { id: 'yeux_w2_t1', label: 'Vitamine C sérum le matin (pour les cernes)' },
          { id: 'yeux_w2_t2', label: 'Réduire le sel (rétention d\'eau = poches)' },
          { id: 'yeux_w2_t3', label: 'Patch contour yeux 2x/semaine' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Drainage',
        tasks: [
          { id: 'yeux_w3_t1', label: 'Massage drainage lymphatique contour yeux (gua sha ou doigts)' },
          { id: 'yeux_w3_t2', label: 'Pas d\'écrans 1h avant de dormir' },
          { id: 'yeux_w3_t3', label: 'Boire 2L d\'eau/jour minimum' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'yeux_w4_t1', label: 'Ajouter rétinol contour yeux (nuit, 2x/semaine)' },
          { id: 'yeux_w4_t2', label: 'Maintenir routine complète matin et soir' },
          { id: 'yeux_w4_t3', label: 'Lunettes de soleil quotidiennes (protection UV)' },
        ],
      },
    ],
  },
  {
    id: 'cheveux',
    icon: '💇',
    color: '#EC4899',
    weeks: [
      {
        weekNumber: 1,
        title: 'Diagnostic',
        tasks: [
          { id: 'cheveux_w1_t1', label: 'Identifier son type de cheveux (sec, gras, mixte)' },
          { id: 'cheveux_w1_t2', label: 'Shampoing max 3x/semaine' },
          { id: 'cheveux_w1_t3', label: 'Après-shampoing à chaque lavage' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Stimulation',
        tasks: [
          { id: 'cheveux_w2_t1', label: 'Massage crânien 5 min/jour (stimulation du cuir chevelu)' },
          { id: 'cheveux_w2_t2', label: 'Huile de ricin 1x/semaine (avant shampoing)' },
          { id: 'cheveux_w2_t3', label: 'Éviter l\'eau trop chaude lors du lavage' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Nutrition capillaire',
        tasks: [
          { id: 'cheveux_w3_t1', label: 'Masque capillaire 1x/semaine' },
          { id: 'cheveux_w3_t2', label: 'Réduire le sèche-cheveux (air froid si possible)' },
          { id: 'cheveux_w3_t3', label: 'Alimentation riche en protéines, biotine et zinc' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Entretien',
        tasks: [
          { id: 'cheveux_w4_t1', label: 'Routine complète établie et maintenue' },
          { id: 'cheveux_w4_t2', label: 'Couper les pointes pour maintenir la santé' },
          { id: 'cheveux_w4_t3', label: 'Taie d\'oreiller en soie (moins de friction nocturne)' },
        ],
      },
    ],
  },
  {
    id: 'calvitie',
    icon: '💡',
    color: '#EF4444',
    weeks: [
      {
        weekNumber: 1,
        title: 'Mise en place',
        tasks: [
          { id: 'calvitie_w1_t1', label: 'Massage crânien 10 min/jour (circulation sanguine)' },
          { id: 'calvitie_w1_t2', label: 'Commencer minoxidil 5% (application le soir)' },
          { id: 'calvitie_w1_t3', label: 'Shampoing à la kératine ou à la biotine' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Compléments',
        tasks: [
          { id: 'calvitie_w2_t1', label: 'Massage crânien quotidien maintenu' },
          { id: 'calvitie_w2_t2', label: 'Biotine 5000mcg/jour' },
          { id: 'calvitie_w2_t3', label: 'Réduire le stress (cortisol = chute de cheveux accélérée)' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Régularité',
        tasks: [
          { id: 'calvitie_w3_t1', label: 'Minoxidil : application strictement quotidienne' },
          { id: 'calvitie_w3_t2', label: 'Zinc 15mg/jour' },
          { id: 'calvitie_w3_t3', label: 'Éviter les coiffures trop serrées' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Bilan',
        tasks: [
          { id: 'calvitie_w4_t1', label: 'Consulter un dermatologue si aucune amélioration visible' },
          { id: 'calvitie_w4_t2', label: 'Adapter sa coupe pour minimiser l\'effet calvitie' },
          { id: 'calvitie_w4_t3', label: 'Maintenir tous les compléments alimentaires' },
        ],
      },
    ],
  },
  {
    id: 'peau',
    icon: '✨',
    color: '#F97316',
    weeks: [
      {
        weekNumber: 1,
        title: 'Les bases',
        tasks: [
          { id: 'peau_w1_t1', label: 'Nettoyant doux matin et soir' },
          { id: 'peau_w1_t2', label: 'SPF 30+ chaque matin (sans exception)' },
          { id: 'peau_w1_t3', label: 'Eau micellaire pour démaquillage le soir' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Traitement',
        tasks: [
          { id: 'peau_w2_t1', label: 'Vitamine C sérum le matin (éclat et uniformité)' },
          { id: 'peau_w2_t2', label: 'Rétinol 0.025% le soir 2x/semaine' },
          { id: 'peau_w2_t3', label: 'Exfoliation douce 1x/semaine' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Intensification',
        tasks: [
          { id: 'peau_w3_t1', label: 'Rétinol 3x/semaine' },
          { id: 'peau_w3_t2', label: 'Masque argile 1x/semaine (pores et éclat)' },
          { id: 'peau_w3_t3', label: 'Hydratant riche le soir après le rétinol' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'peau_w4_t1', label: 'Routine matin/soir complète sans interruption' },
          { id: 'peau_w4_t2', label: 'SPF chaque jour, même par temps couvert' },
          { id: 'peau_w4_t3', label: 'Bilan peau : noter les améliorations observées' },
        ],
      },
    ],
  },
  {
    id: 'sommeil',
    icon: '🌙',
    color: '#6366F1',
    weeks: [
      {
        weekNumber: 1,
        title: 'Hygiène du sommeil',
        tasks: [
          { id: 'sommeil_w1_t1', label: 'Se coucher avant 23h30' },
          { id: 'sommeil_w1_t2', label: 'Chambre à 18-19°C (température idéale)' },
          { id: 'sommeil_w1_t3', label: 'Pas d\'écrans 30 min avant de dormir' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Routine pré-sommeil',
        tasks: [
          { id: 'sommeil_w2_t1', label: 'Lecture 15 min avant de dormir' },
          { id: 'sommeil_w2_t2', label: 'Pas de caféine après 15h' },
          { id: 'sommeil_w2_t3', label: 'Masque de sommeil + bouchons d\'oreilles si nécessaire' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Régulation',
        tasks: [
          { id: 'sommeil_w3_t1', label: 'Se lever à heure fixe chaque jour (même le week-end)' },
          { id: 'sommeil_w3_t2', label: 'Exposition à la lumière naturelle le matin 10 min' },
          { id: 'sommeil_w3_t3', label: 'Magnésium glycinate avant de dormir' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Optimisation',
        tasks: [
          { id: 'sommeil_w4_t1', label: '7-8h de sommeil maintenu chaque nuit' },
          { id: 'sommeil_w4_t2', label: 'Taie d\'oreiller en soie (moins de froissements cutanés)' },
          { id: 'sommeil_w4_t3', label: 'Évaluer la qualité du sommeil et ajuster si besoin' },
        ],
      },
    ],
  },
  {
    id: 'cou',
    icon: '📐',
    color: '#14B8A6',
    weeks: [
      {
        weekNumber: 1,
        title: 'Activation',
        tasks: [
          { id: 'cou_w1_t1', label: 'Neck tilt 3x15/jour (incliner la tête de chaque côté)' },
          { id: 'cou_w1_t2', label: 'Crème hydratante sur le cou chaque soir' },
          { id: 'cou_w1_t3', label: 'Éviter de baisser la tête sur le téléphone (text neck)' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Définition',
        tasks: [
          { id: 'cou_w2_t1', label: 'Chin tucks 3x15/jour' },
          { id: 'cou_w2_t2', label: 'Exfoliation du cou 1x/semaine' },
          { id: 'cou_w2_t3', label: 'SPF sur le cou chaque matin' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Renforcement',
        tasks: [
          { id: 'cou_w3_t1', label: 'Résistance : pousser la tête contre la main 3x15' },
          { id: 'cou_w3_t2', label: 'Massage drainage du cou 5 min/jour' },
          { id: 'cou_w3_t3', label: 'Rétinol sur le cou (soin anti-relâchement)' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Entretien',
        tasks: [
          { id: 'cou_w4_t1', label: 'Maintenir les exercices quotidiens' },
          { id: 'cou_w4_t2', label: 'Vérifier posture du cou devant le miroir' },
          { id: 'cou_w4_t3', label: 'Routine complète intégrée matin et soir' },
        ],
      },
    ],
  },
  {
    id: 'symetrie',
    icon: '⚖️',
    color: '#D946EF',
    weeks: [
      {
        weekNumber: 1,
        title: 'Prise de conscience',
        tasks: [
          { id: 'symetrie_w1_t1', label: 'Mewing symétrique (langue bien centrée sur le palais)' },
          { id: 'symetrie_w1_t2', label: 'Dormir sur le dos (éviter l\'asymétrie de pression)' },
          { id: 'symetrie_w1_t3', label: 'Mâcher des deux côtés également' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Correction posturale',
        tasks: [
          { id: 'symetrie_w2_t1', label: 'Exercice : sourire symétrique devant miroir x10' },
          { id: 'symetrie_w2_t2', label: 'Éviter de se reposer la joue sur la main' },
          { id: 'symetrie_w2_t3', label: 'Massage facial des deux côtés de façon égale' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Exercices ciblés',
        tasks: [
          { id: 'symetrie_w3_t1', label: 'Gonfler les joues alternativement 3x15' },
          { id: 'symetrie_w3_t2', label: 'Vérifier que la tête ne penche pas d\'un côté en permanence' },
          { id: 'symetrie_w3_t3', label: 'Masser le côté le plus faible 2x plus longtemps' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Ancrage',
        tasks: [
          { id: 'symetrie_w4_t1', label: 'Maintenir toutes les habitudes posturales' },
          { id: 'symetrie_w4_t2', label: 'Exercices faciaux 10 min/jour' },
          { id: 'symetrie_w4_t3', label: 'Se photographier de face pour suivre l\'évolution' },
        ],
      },
    ],
  },
];

export const PROGRAMME_LABELS: Record<string, { fr: string; en: string; descFr: string; descEn: string }> = {
  machoire: {
    fr: 'Mâchoire',
    en: 'Jawline',
    descFr: 'Mewing, exercices et habitudes pour définir ta mâchoire',
    descEn: 'Mewing, exercises and habits to define your jaw',
  },
  hyoide: {
    fr: 'Hyoïde',
    en: 'Hyoid',
    descFr: 'Exercices cervicaux pour améliorer la structure du cou et du menton',
    descEn: 'Cervical exercises to improve neck and chin structure',
  },
  posture: {
    fr: 'Posture',
    en: 'Posture',
    descFr: 'Correction de la posture pour un port de tête optimal',
    descEn: 'Posture correction for optimal head carriage',
  },
  yeux: {
    fr: 'Yeux',
    en: 'Eyes',
    descFr: 'Réduire les cernes et poches, sublimer le regard',
    descEn: 'Reduce dark circles and bags, enhance the eyes',
  },
  cheveux: {
    fr: 'Cheveux',
    en: 'Hair',
    descFr: 'Routine complète pour des cheveux sains et denses',
    descEn: 'Complete routine for healthy and thick hair',
  },
  calvitie: {
    fr: 'Calvitie',
    en: 'Hair Loss',
    descFr: 'Ralentir la chute et optimiser la densité capillaire',
    descEn: 'Slow hair loss and optimize hair density',
  },
  peau: {
    fr: 'Peau',
    en: 'Skin',
    descFr: 'Routine skincare progressive pour un teint éclatant',
    descEn: 'Progressive skincare routine for glowing skin',
  },
  sommeil: {
    fr: 'Sommeil',
    en: 'Sleep',
    descFr: 'Optimiser le sommeil pour la récupération faciale',
    descEn: 'Optimize sleep for facial recovery',
  },
  cou: {
    fr: 'Cou',
    en: 'Neck',
    descFr: 'Définir et affiner le cou pour un profil plus esthétique',
    descEn: 'Define and refine the neck for a more aesthetic profile',
  },
  symetrie: {
    fr: 'Symétrie Faciale',
    en: 'Facial Symmetry',
    descFr: 'Habitudes et exercices pour améliorer la symétrie du visage',
    descEn: 'Habits and exercises to improve facial symmetry',
  },
};
