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
  image: number;
  weeks: ProgrammeWeek[];
}

export const PROGRAMMES: Programme[] = [
  {
    id: 'machoire',
    icon: '🦷',
    color: '#3B82F6',
    image: require('@/assets/images/programmes/machoire.jpg'),
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
    image: require('@/assets/images/programmes/hyoide.jpg'),
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
    image: require('@/assets/images/programmes/posture.jpg'),
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
    image: require('@/assets/images/programmes/yeux.jpg'),
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
    image: require('@/assets/images/programmes/cheveux.jpg'),
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
    image: require('@/assets/images/programmes/calvitie.jpg'),
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
    image: require('@/assets/images/programmes/peau.jpg'),
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
    image: require('@/assets/images/programmes/sommeil.jpg'),
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
    image: require('@/assets/images/programmes/cou.jpg'),
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
    image: require('@/assets/images/programmes/symetrie.jpg'),
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

export const PROGRAMMES_FEMALE: Programme[] = [
  {
    id: 'machoire',
    icon: '🦷',
    color: '#3B82F6',
    image: require('@/assets/images/programmes/machoire.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Les bases',
        tasks: [
          { id: 'f_machoire_w1_t1', label: 'Pratiquer le mewing 20 min/jour (langue contre le palais)' },
          { id: 'f_machoire_w1_t2', label: 'Contour en poudre le long de la mâchoire pour la définir visuellement' },
          { id: 'f_machoire_w1_t3', label: 'Mastic gum 10 min/jour' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Renforcement + Contouring',
        tasks: [
          { id: 'f_machoire_w2_t1', label: 'Mewing 30 min/jour' },
          { id: 'f_machoire_w2_t2', label: 'Jawline workout : serrer les dents 10x3 séries' },
          { id: 'f_machoire_w2_t3', label: 'Contouring : poudre foncée sous la mâchoire, estomper vers le cou' },
          { id: 'f_machoire_w2_t4', label: 'Highlighter sur le menton pour l\'allonger visuellement' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Précision maquillage',
        tasks: [
          { id: 'f_machoire_w3_t1', label: 'Mewing continu (habitude permanente)' },
          { id: 'f_machoire_w3_t2', label: 'Contouring au pinceau biseauté pour plus de précision' },
          { id: 'f_machoire_w3_t3', label: 'Mâcher des aliments durs (carottes, pommes)' },
          { id: 'f_machoire_w3_t4', label: 'Massage de la mâchoire 5 min/jour' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'f_machoire_w4_t1', label: 'Maintenir toutes les habitudes des semaines précédentes' },
          { id: 'f_machoire_w4_t2', label: 'Tester contour crème vs poudre : noter ce qui convient le mieux' },
          { id: 'f_machoire_w4_t3', label: 'Se photographier de face et de profil pour mesurer les progrès' },
        ],
      },
    ],
  },
  {
    id: 'hyoide',
    icon: '🔵',
    color: '#8B5CF6',
    image: require('@/assets/images/programmes/hyoide.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Prise de conscience',
        tasks: [
          { id: 'f_hyoide_w1_t1', label: 'Exercice de déglutition consciente x20/jour' },
          { id: 'f_hyoide_w1_t2', label: 'Highlighter au centre du cou pour l\'allonger visuellement' },
          { id: 'f_hyoide_w1_t3', label: 'Garder le menton légèrement rentré en permanence' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Activation + Maquillage',
        tasks: [
          { id: 'f_hyoide_w2_t1', label: 'Humming (fredonner) 5 min/jour' },
          { id: 'f_hyoide_w2_t2', label: 'Éviter de regarder le téléphone en baissant la tête' },
          { id: 'f_hyoide_w2_t3', label: 'Bronzer légèrement sous le menton pour réduire visuellement le double menton' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Renforcement',
        tasks: [
          { id: 'f_hyoide_w3_t1', label: 'Exercice : langue contre palais en avalant' },
          { id: 'f_hyoide_w3_t2', label: 'Neck curls 3x10/jour' },
          { id: 'f_hyoide_w3_t3', label: 'Contouring sous le menton avec une teinte foncée bien estompée' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'f_hyoide_w4_t1', label: 'Maintenir posture de tête correcte en permanence' },
          { id: 'f_hyoide_w4_t2', label: 'Exercices de résistance du cou 3x15' },
          { id: 'f_hyoide_w4_t3', label: 'Étirements matin et soir' },
        ],
      },
    ],
  },
  {
    id: 'posture',
    icon: '🧍',
    color: '#10B981',
    image: require('@/assets/images/programmes/posture.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Correction de base',
        tasks: [
          { id: 'f_posture_w1_t1', label: 'Régler la hauteur de l\'écran à hauteur des yeux' },
          { id: 'f_posture_w1_t2', label: 'Wall angel 3x10/jour' },
          { id: 'f_posture_w1_t3', label: 'Marcher 20 min/jour en conscientisant la posture' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Renforcement',
        tasks: [
          { id: 'f_posture_w2_t1', label: 'Stretching épaules matin 5 min' },
          { id: 'f_posture_w2_t2', label: 'Plank 3x30 sec/jour' },
          { id: 'f_posture_w2_t3', label: 'Alerte posture toutes les heures sur le téléphone' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Stabilisation',
        tasks: [
          { id: 'f_posture_w3_t1', label: 'Cat-cow stretch 3x10/jour' },
          { id: 'f_posture_w3_t2', label: 'Pilates 15 min/jour (gainage doux)' },
          { id: 'f_posture_w3_t3', label: 'Oreiller adapté (ni trop haut, ni trop bas)' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Ancrage',
        tasks: [
          { id: 'f_posture_w4_t1', label: 'Yoga ou pilates 20 min/jour' },
          { id: 'f_posture_w4_t2', label: 'Vérifier posture devant le miroir chaque matin' },
          { id: 'f_posture_w4_t3', label: 'Marche consciente 30 min/jour' },
        ],
      },
    ],
  },
  {
    id: 'yeux',
    icon: '👁️',
    color: '#F59E0B',
    image: require('@/assets/images/programmes/yeux.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Routine + maquillage de base',
        tasks: [
          { id: 'f_yeux_w1_t1', label: 'Crème contour des yeux chaque soir' },
          { id: 'f_yeux_w1_t2', label: 'Dormir 7-8h minimum' },
          { id: 'f_yeux_w1_t3', label: 'Mascara : courber les cils avant d\'appliquer pour ouvrir le regard' },
          { id: 'f_yeux_w1_t4', label: 'Compresses froides le matin 5 min (dépoches)' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Traitement + techniques',
        tasks: [
          { id: 'f_yeux_w2_t1', label: 'Vitamine C sérum le matin (pour les cernes)' },
          { id: 'f_yeux_w2_t2', label: 'Réduire le sel (rétention d\'eau = poches)' },
          { id: 'f_yeux_w2_t3', label: 'Eyeliner : trait fin au ras des cils pour épaissir sans alourdir' },
          { id: 'f_yeux_w2_t4', label: 'Crayon blanc/nude sur la ligne d\'eau pour agrandir le regard' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Drainage + mise en valeur',
        tasks: [
          { id: 'f_yeux_w3_t1', label: 'Massage drainage lymphatique contour yeux (gua sha)' },
          { id: 'f_yeux_w3_t2', label: 'Pas d\'écrans 1h avant de dormir' },
          { id: 'f_yeux_w3_t3', label: 'Apprendre le cut crease basique pour rehausser la paupière' },
          { id: 'f_yeux_w3_t4', label: 'Mascara fibres + recourbe-cils pour ouvrir le regard au maximum' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'f_yeux_w4_t1', label: 'Rétinol contour yeux (nuit, 2x/semaine)' },
          { id: 'f_yeux_w4_t2', label: 'Fard adapté à sa morphologie (yeux ronds, en amande, tombants)' },
          { id: 'f_yeux_w4_t3', label: 'Lunettes de soleil quotidiennes (protection UV)' },
        ],
      },
    ],
  },
  {
    id: 'cheveux',
    icon: '💇',
    color: '#EC4899',
    image: require('@/assets/images/programmes/cheveux.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Diagnostic',
        tasks: [
          { id: 'f_cheveux_w1_t1', label: 'Identifier son type de cheveux (sec, gras, mixte, frisé)' },
          { id: 'f_cheveux_w1_t2', label: 'Shampoing max 3x/semaine + après-shampoing systématique' },
          { id: 'f_cheveux_w1_t3', label: 'Identifier la coupe qui valorise la morphologie du visage' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Stimulation + Styling',
        tasks: [
          { id: 'f_cheveux_w2_t1', label: 'Massage crânien 5 min/jour (stimulation du cuir chevelu)' },
          { id: 'f_cheveux_w2_t2', label: 'Huile d\'argan ou de ricin 1x/semaine avant shampoing' },
          { id: 'f_cheveux_w2_t3', label: 'Apprendre un brushing simple pour encadrer le visage' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Nutrition capillaire',
        tasks: [
          { id: 'f_cheveux_w3_t1', label: 'Masque capillaire 1x/semaine' },
          { id: 'f_cheveux_w3_t2', label: 'Protection thermique avant lisseur ou boucleur' },
          { id: 'f_cheveux_w3_t3', label: 'Alimentation riche en protéines, biotine et zinc' },
          { id: 'f_cheveux_w3_t4', label: 'Tester une coiffure qui encadre le visage (waves, balayage)' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Entretien',
        tasks: [
          { id: 'f_cheveux_w4_t1', label: 'Routine complète établie et maintenue' },
          { id: 'f_cheveux_w4_t2', label: 'Couper les pointes pour maintenir la santé' },
          { id: 'f_cheveux_w4_t3', label: 'Taie d\'oreiller en soie (moins de friction nocturne)' },
        ],
      },
    ],
  },
  {
    id: 'peau',
    icon: '✨',
    color: '#F97316',
    image: require('@/assets/images/programmes/peau.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Skincare + base maquillage',
        tasks: [
          { id: 'f_peau_w1_t1', label: 'Nettoyant doux matin et soir + démaquillage complet le soir' },
          { id: 'f_peau_w1_t2', label: 'SPF 30+ chaque matin (sans exception)' },
          { id: 'f_peau_w1_t3', label: 'Choisir une base de teint adaptée à son type de peau (BB cream, fond de teint)' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Traitement + Application',
        tasks: [
          { id: 'f_peau_w2_t1', label: 'Vitamine C sérum le matin' },
          { id: 'f_peau_w2_t2', label: 'Rétinol 0.025% 2x/semaine le soir' },
          { id: 'f_peau_w2_t3', label: 'Technique fond de teint : éponge humide pour un fini naturel' },
          { id: 'f_peau_w2_t4', label: 'Blush : placement selon la morphologie du visage' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Intensification + Contouring',
        tasks: [
          { id: 'f_peau_w3_t1', label: 'Rétinol 3x/semaine' },
          { id: 'f_peau_w3_t2', label: 'Masque argile 1x/semaine' },
          { id: 'f_peau_w3_t3', label: 'Contouring léger : poudre bronze sur les tempes, sous les pommettes' },
          { id: 'f_peau_w3_t4', label: 'Highlighter sur les pommettes et l\'arête du nez' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Consolidation',
        tasks: [
          { id: 'f_peau_w4_t1', label: 'Routine matin/soir complète sans interruption' },
          { id: 'f_peau_w4_t2', label: 'Setting spray pour tenir le maquillage toute la journée' },
          { id: 'f_peau_w4_t3', label: 'Bilan peau : noter les améliorations observées' },
        ],
      },
    ],
  },
  {
    id: 'sommeil',
    icon: '🌙',
    color: '#6366F1',
    image: require('@/assets/images/programmes/sommeil.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Hygiène du sommeil',
        tasks: [
          { id: 'f_sommeil_w1_t1', label: 'Se coucher avant 23h30' },
          { id: 'f_sommeil_w1_t2', label: 'Chambre à 18-19°C' },
          { id: 'f_sommeil_w1_t3', label: 'Taie d\'oreiller en soie (moins de froissements cutanés et capillaires)' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Routine beauté nocturne',
        tasks: [
          { id: 'f_sommeil_w2_t1', label: 'Appliquer crème de nuit + sérum + contour yeux avant de dormir' },
          { id: 'f_sommeil_w2_t2', label: 'Pas de caféine après 15h' },
          { id: 'f_sommeil_w2_t3', label: 'Attacher les cheveux en tresse lâche pour éviter les cassures' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Régulation',
        tasks: [
          { id: 'f_sommeil_w3_t1', label: 'Se lever à heure fixe chaque jour (même le week-end)' },
          { id: 'f_sommeil_w3_t2', label: 'Exposition à la lumière naturelle le matin 10 min' },
          { id: 'f_sommeil_w3_t3', label: 'Magnésium glycinate avant de dormir' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Optimisation',
        tasks: [
          { id: 'f_sommeil_w4_t1', label: '7-8h de sommeil maintenu chaque nuit' },
          { id: 'f_sommeil_w4_t2', label: 'Masque de nuit hydratant 2x/semaine' },
          { id: 'f_sommeil_w4_t3', label: 'Évaluer la qualité du sommeil et ajuster si besoin' },
        ],
      },
    ],
  },
  {
    id: 'symetrie',
    icon: '⚖️',
    color: '#D946EF',
    image: require('@/assets/images/programmes/symetrie.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Prise de conscience',
        tasks: [
          { id: 'f_symetrie_w1_t1', label: 'Mewing symétrique (langue bien centrée sur le palais)' },
          { id: 'f_symetrie_w1_t2', label: 'Dormir sur le dos (éviter l\'asymétrie de pression)' },
          { id: 'f_symetrie_w1_t3', label: 'Identifier ses asymétries au maquillage et apprendre à les corriger' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Correction posturale + Maquillage',
        tasks: [
          { id: 'f_symetrie_w2_t1', label: 'Exercice : sourire symétrique devant miroir x10' },
          { id: 'f_symetrie_w2_t2', label: 'Éviter de se reposer la joue sur la main' },
          { id: 'f_symetrie_w2_t3', label: 'Contouring correctif : estomper le côté plus large, éclairer le côté plus étroit' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Exercices ciblés',
        tasks: [
          { id: 'f_symetrie_w3_t1', label: 'Gonfler les joues alternativement 3x15' },
          { id: 'f_symetrie_w3_t2', label: 'Vérifier que la tête ne penche pas d\'un côté en permanence' },
          { id: 'f_symetrie_w3_t3', label: 'Blush appliqué symétriquement pour équilibrer les deux côtés' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Ancrage',
        tasks: [
          { id: 'f_symetrie_w4_t1', label: 'Maintenir toutes les habitudes posturales' },
          { id: 'f_symetrie_w4_t2', label: 'Exercices faciaux 10 min/jour' },
          { id: 'f_symetrie_w4_t3', label: 'Se photographier de face pour suivre l\'évolution' },
        ],
      },
    ],
  },
  {
    id: 'sourcils',
    icon: '〰️',
    color: '#92400E',
    image: require('@/assets/images/programmes/peau.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Diagnostic',
        tasks: [
          { id: 'sourcils_w1_t1', label: 'Observer la forme naturelle de ses sourcils sans les toucher' },
          { id: 'sourcils_w1_t2', label: 'Identifier sa morphologie de visage pour trouver la forme idéale' },
          { id: 'sourcils_w1_t3', label: 'Ne pas épiler pendant 2 semaines pour laisser repousser' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Entretien',
        tasks: [
          { id: 'sourcils_w2_t1', label: 'Épiler uniquement sous l\'arcade (jamais au-dessus)' },
          { id: 'sourcils_w2_t2', label: 'Brosser les sourcils avec un spoolie chaque matin' },
          { id: 'sourcils_w2_t3', label: 'Remplir avec une poudre à sourcils de la couleur naturelle' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Définition',
        tasks: [
          { id: 'sourcils_w3_t1', label: 'Crayon à sourcils : trait par trait pour un effet naturel et précis' },
          { id: 'sourcils_w3_t2', label: 'Fixer avec un gel à sourcils transparent après application' },
          { id: 'sourcils_w3_t3', label: 'Lamination DIY ou en institut pour un effet "brow lift"' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Maîtrise',
        tasks: [
          { id: 'sourcils_w4_t1', label: 'Maîtriser l\'arc parfait selon la morphologie du visage' },
          { id: 'sourcils_w4_t2', label: 'Tester le rehaussement (henna brows ou teinture)' },
          { id: 'sourcils_w4_t3', label: 'Maintenir la routine d\'entretien hebdomadaire' },
        ],
      },
    ],
  },
  {
    id: 'levres',
    icon: '💋',
    color: '#E11D48',
    image: require('@/assets/images/programmes/symetrie.jpg'),
    weeks: [
      {
        weekNumber: 1,
        title: 'Soin',
        tasks: [
          { id: 'levres_w1_t1', label: 'Exfolier les lèvres 2x/semaine (sucre + huile)' },
          { id: 'levres_w1_t2', label: 'Baume à lèvres chaque soir avant de dormir' },
          { id: 'levres_w1_t3', label: 'Boire 2L d\'eau/jour (hydratation = lèvres pulpeuses)' },
        ],
      },
      {
        weekNumber: 2,
        title: 'Technique de base',
        tasks: [
          { id: 'levres_w2_t1', label: 'Tracer le contour avec un crayon lèvres légèrement en dehors pour volumiser' },
          { id: 'levres_w2_t2', label: 'Gloss au centre des lèvres pour l\'effet 3D' },
          { id: 'levres_w2_t3', label: 'Choisir des teintes adaptées à son teint de peau' },
        ],
      },
      {
        weekNumber: 3,
        title: 'Volume',
        tasks: [
          { id: 'levres_w3_t1', label: 'Overline subtile avec le crayon pour des lèvres visuellement plus pleines' },
          { id: 'levres_w3_t2', label: 'Plumping gloss (avec menthol ou acide hyaluronique)' },
          { id: 'levres_w3_t3', label: 'Highlighter sur l\'arc de Cupidon pour le définir' },
        ],
      },
      {
        weekNumber: 4,
        title: 'Maîtrise',
        tasks: [
          { id: 'levres_w4_t1', label: 'Lip liner + rouge à lèvres mat (tenue longue durée)' },
          { id: 'levres_w4_t2', label: 'Tester l\'ombré lips (plus foncé au contour, plus clair au centre)' },
          { id: 'levres_w4_t3', label: 'Maintenir exfoliation + soin chaque semaine' },
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
  sourcils: {
    fr: 'Sourcils',
    en: 'Eyebrows',
    descFr: 'Forme, remplissage et entretien pour des sourcils parfaits',
    descEn: 'Shape, fill and maintain perfect eyebrows',
  },
  levres: {
    fr: 'Lèvres',
    en: 'Lips',
    descFr: 'Soin et maquillage pour des lèvres pulpeuses et définies',
    descEn: 'Care and makeup for full and defined lips',
  },
};
