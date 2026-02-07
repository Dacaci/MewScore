# Cahier des Charges - GlowScore

## 1. Vision du Projet

**GlowScore** est une application mobile d'analyse de beauté faciale utilisant l'intelligence artificielle. L'app permet aux utilisateurs de scanner leur visage, recevoir un score de beauté, et accéder à des conseils personnalisés via un abonnement premium.

---

## 2. Décisions Techniques Validées

| Aspect | Décision |
|--------|----------|
| **IA / Analyse** | API externe (Face++ ou AWS Rekognition) |
| **Backend** | Firebase (Auth + Firestore + Storage) |
| **Paiements** | RevenueCat + In-App Purchase |
| **Framework** | Expo / React Native (TypeScript) |

---

## 3. Modèle Freemium

### Version Gratuite
- **3 scans gratuits** au total
- Score global uniquement (pas de détail par feature)
- Pas d'historique
- Pas de conseils

### Version Premium - 7.99€/mois
- Scans illimités
- Analyse détaillée par zone (yeux, nez, mâchoire, symétrie, peau)
- Conseils personnalisés (skincare, style, exercices, maquillage)
- Statistiques : "Plus beau que X% des utilisateurs"
- Historique complet + suivi de progression

---

## 4. Fonctionnalités Détaillées

### 4.1 Scan Facial
- Capture via caméra (expo-camera)
- Import depuis galerie (expo-image-picker)
- Guidage pour cadrage optimal (ovale de positionnement)
- Validation qualité photo avant analyse

### 4.2 Score de Beauté
- **Score global** : 0-100 (ou 0-10)
- **Scores détaillés** (Premium) :
  - Symétrie faciale
  - Proportions (ratio d'or)
  - Yeux (forme, espacement, canthal tilt)
  - Nez (projection, largeur)
  - Mâchoire (définition, angularité)
  - Lèvres (ratio, volume)
  - Peau (clarté, uniformité)

### 4.3 Statistiques Comparatives (Premium)
- "Vous êtes plus attractif que X% des utilisateurs"
- Basé sur tous les scans de la base utilisateurs
- Mise à jour en temps réel

### 4.4 Conseils Personnalisés (Premium)
| Catégorie | Exemples |
|-----------|----------|
| **Skincare** | Routine matin/soir, produits recommandés, hydratation |
| **Style** | Coiffure adaptée à la forme du visage, barbe/pas de barbe |
| **Exercices** | Mewing, exercices jawline, massage facial |
| **Maquillage** | Contouring, mise en valeur des points forts |

### 4.5 Historique & Progression (Premium)
- Graphique d'évolution du score
- Comparaison avant/après
- Rappels pour nouveaux scans

---

## 5. Architecture Technique

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Expo)                       │
├─────────────────────────────────────────────────────────┤
│  expo-camera → Capture photo                            │
│  expo-image-picker → Import galerie                     │
│  RevenueCat SDK → Gestion abonnements                   │
│  Firebase SDK → Auth, Firestore, Storage                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    FIREBASE                              │
├─────────────────────────────────────────────────────────┤
│  Auth         → Email/password, Google, Apple Sign-In   │
│  Firestore    → Users, scans, scores, conseils          │
│  Storage      → Photos (temporaire pour analyse)        │
│  Functions    → Appel API Face++, calcul stats          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 API ANALYSE (Face++)                     │
├─────────────────────────────────────────────────────────┤
│  Face Detection → Points de repère du visage            │
│  Face Analyze   → Attributs (âge, genre, beauté)        │
│  Face Compare   → Symétrie (comparer avec miroir)       │
└─────────────────────────────────────────────────────────┘
```

### Structure Firestore

```
users/
  {userId}/
    email: string
    createdAt: timestamp
    scansRemaining: number (3 pour free)
    isPremium: boolean

    scans/
      {scanId}/
        photoUrl: string
        globalScore: number
        detailedScores: map (premium only)
        percentile: number
        createdAt: timestamp

globalStats/
  totalScans: number
  scoreDistribution: array [count par tranche de score]
```

---

## 6. Écrans de l'App

### Navigation
```
(tabs)/
  ├── index.tsx        → Home / Scanner
  ├── history.tsx      → Historique des scans (Premium)
  └── profile.tsx      → Profil / Abonnement

modal/
  ├── results.tsx      → Résultats du scan
  ├── paywall.tsx      → Écran d'abonnement
  └── tips-detail.tsx  → Détail d'un conseil
```

### Flow Utilisateur
```
1. Onboarding (première ouverture)
   └── Explication de l'app → Création compte

2. Home Screen
   └── Bouton "Scanner"
       ├── Si scans restants > 0 → Caméra → Analyse → Résultats
       └── Si scans restants = 0 → Paywall

3. Résultats
   ├── Gratuit: Score global + CTA Premium
   └── Premium: Score détaillé + Stats + Conseils

4. Historique (Premium)
   └── Liste des scans → Graphique progression

5. Profil
   └── Infos compte + Gérer abonnement
```

---

## 7. Roadmap MVP

**Objectif : Sortir vite, tester le marché**

### Sprint 1 - Setup & Auth (3-5 jours)
- [ ] Configurer Firebase (projet + SDK)
- [ ] Authentification (email + Google + Apple)
- [ ] Structure Firestore de base
- [ ] Écran de connexion/inscription

### Sprint 2 - Scan & Analyse (5-7 jours)
- [ ] Intégration expo-camera
- [ ] UI de capture avec guide de cadrage
- [ ] Intégration API Face++ (ou AWS)
- [ ] Calcul du score de beauté
- [ ] Écran de résultats (version gratuite)

### Sprint 3 - Freemium & Paywall (3-5 jours)
- [ ] Compteur de scans gratuits
- [ ] Intégration RevenueCat
- [ ] Écran paywall
- [ ] Déblocage fonctionnalités premium

### Sprint 4 - Premium Features (5-7 jours)
- [ ] Scores détaillés par feature
- [ ] Calcul du percentile
- [ ] Base de données de conseils
- [ ] Affichage conseils personnalisés

### Sprint 5 - Polish & Launch (3-5 jours)
- [ ] Historique des scans
- [ ] Graphique de progression
- [ ] Tests & bug fixes
- [ ] Préparation App Store / Play Store

**Durée totale estimée MVP : 3-4 semaines**

---

## 8. APIs & Services

### Face++ (Recommandé pour commencer)
- **Pricing** : ~0.001$ par appel (1000 appels = 1$)
- **Endpoints utiles** :
  - `/facepp/v3/detect` - Détection + landmarks
  - `/facepp/v3/face/analyze` - Attributs (beauty score inclus)
- **Avantages** : API simple, beauty score natif, pas cher

### Firebase
- **Spark (Gratuit)** : Suffisant pour MVP
  - 50K lectures/jour, 20K écritures/jour
  - 1GB Storage, 10GB transfert
- **Blaze (Pay as you go)** : Quand on scale

### RevenueCat
- **Gratuit** jusqu'à 2500$/mois de revenus
- Gère iOS + Android + Web
- Webhooks pour Firebase

---

## 9. Considérations Légales

### RGPD / Confidentialité
- Photos analysées puis supprimées (pas de stockage long terme)
- Consentement explicite avant premier scan
- Option de suppression de compte et données

### App Store Guidelines
- Pas de claims médicaux
- Mention "divertissement" dans la description
- Age rating : 12+ (self-image sensitivity)

### Éthique
- Message positif (amélioration, pas jugement)
- Avertissement : "Les standards de beauté varient selon les cultures"
- Pas de push vers chirurgie esthétique

---

## 10. KPIs à Suivre

| Métrique | Cible MVP |
|----------|-----------|
| Downloads | 1000 première semaine |
| Taux de scan (après download) | > 60% |
| Conversion free → premium | > 5% |
| Rétention J7 | > 20% |
| Note App Store | > 4.0 |

---

## 11. Prochaines Étapes

1. **Créer compte Face++** et tester l'API
2. **Créer projet Firebase** et configurer
3. **Setup RevenueCat** et créer produit d'abonnement
4. **Commencer Sprint 1** (Auth)

---

*Document validé le 30/01/2026*
